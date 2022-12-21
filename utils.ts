import { TwitterAPI, Bearer, RequestQuery } from "./deps.ts"
import { log } from "./log.ts"
import { Tweet } from "./types/tweet.ts"
import { colors, tty } from "./deps.ts"

const client = new TwitterAPI(Bearer.Web)

export const getRestID = async (userId: string) => {
    const query = new RequestQuery({
        variables: {
            screen_name: userId,
            withSafetyModeUserFields: false,
            withSuperFollowsUserFields: true,
        },
        features: {
            responsive_web_twitter_blue_verified_badge_is_enabled: true,
            verified_phone_label_enabled: false,
            responsive_web_twitter_blue_new_verification_copy_is_enabled: true,
            responsive_web_graphql_timeline_navigation_enabled: true,
        },
    })

    const res = await client.request({
        method: "GET",
        urlType: "gql",
        path: "UserByScreenName",
        query: query,
    })

    const json = await res.json()

    // console.log(json.data.user.result)

    return json.data.user.result.rest_id
}

export const getMediaUrls = async (userId: string, max?: number) => {
    const results: string[] = []
    let cursor = ""

    while (true) {
        try {
            const query = new RequestQuery({
                q: `(from:${userId}) -filter:replies`,
                count: 500,
            })

            const res = await client.request({
                method: "GET",
                urlType: "i/api/2",
                path: `/search/adaptive.json?tweet_search_mode=live&query_source=typed_query&ext
                mediaStats,highlightedLabel,hasNftAvatar,voiceInfo,enrichments,superFollowMetadata,unmentionInfo,editControl,collab_control,vibe${cursor}`,
                query: query,
            })

            const json = await res.json()

            const tweets: Record<string, Tweet> = json.globalObjects.tweets

            if (tweets == undefined) {
                continue
            } else if (Object.keys(tweets).length === 0) {
                break
            }

            const mediaUrls = Object.keys(tweets).flatMap((key) => {
                if (tweets[key].entities.media) {
                    return tweets[key].entities.media.map((media) => {
                        return media.media_url_https
                    })
                } else {
                    return []
                }
            })

            results.push(...mediaUrls)

            if (max && results.length >= max) {
                log.info("Max count reached")
                results.splice(max)
                break
            }

            const cursorEntries = json.timeline.instructions.flatMap((instruction: any) => {
                if (instruction.addEntries) {
                    return instruction.addEntries.entries
                } else {
                    return [instruction.replaceEntry.entry]
                }
            })

            const cursorEntry = cursorEntries.find((entry: any) => {
                return entry.entryId === "sq-cursor-bottom" || entry.entryIdToReplace === "sq-cursor-bottom"
            })

            const cursorValue = cursorEntry?.content.operation.cursor.value
            cursor = `&cursor=${cursorValue}`

            if (cursor === undefined) {
                break
            }

            tty.cursorMove(-1000, 0).text(`${colors.blue.bold("[INFO]")} Getting media urls...: ${results.length}`)
        } catch (error) {
            log.error(error)
            break
        }
    }

    console.log()

    return results
}

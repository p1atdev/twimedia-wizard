import { getRestID, getUserTweets, searchTweets, sha256 } from "./utils.ts"
import { log } from "./log.ts"
import { colors, tty, resolve } from "./deps.ts"
import { TweetEntry, TimelineTimelineItem, SearchTweetResult, TimelineTimelineCursor, Tweet } from "./types/mod.ts"

export const getUserMediaTweetData = async (restId: string, max = 5000): Promise<Tweet[]> => {
    const tweets: Set<Tweet> = new Set()
    const mediaUrls: Set<string> = new Set()
    let cursor: string | undefined = undefined

    while (true) {
        try {
            const json = await getUserTweets(restId, cursor)

            const addEntries = json.data.user.result.timeline_v2.timeline.instructions.find((i: any) => {
                return i.type === "TimelineAddEntries"
            })

            if (addEntries == undefined) {
                break
            }

            const tweetEntries: TweetEntry[] = addEntries.entries

            if (tweetEntries == undefined) {
                continue
            } else if (tweetEntries.length <= 2) {
                break
            }

            const tweetObjects = tweetEntries.map((tweet) => {
                switch (tweet.content.entryType) {
                    case "TimelineTimelineItem": {
                        const content = tweet.content as TimelineTimelineItem
                        const legacy = content.itemContent.tweet_results.result.legacy
                        const media = legacy?.entities.media

                        if (!legacy) {
                            return []
                        }

                        const result: Tweet = {
                            mediaUrls: [],
                            text: legacy.full_text,
                            isQuote: legacy.is_quote_status,
                            language: legacy.lang,
                            replies: legacy.reply_count,
                            retweets: legacy.retweet_count,
                            favorites: legacy.favorite_count,
                        }

                        if (media) {
                            result.mediaUrls = media.map((entity) => {
                                return entity.media_url_https
                            })
                            result.mediaUrls.forEach((url) => {
                                mediaUrls.add(url)
                            })
                        }

                        return result
                    }
                    case "TimelineTimelineCursor": {
                        const content = tweet.content as TimelineTimelineCursor
                        if (content.cursorType === "Bottom") {
                            cursor = content.value
                        }
                        return undefined
                    }
                    default: {
                        return undefined
                    }
                }
            })

            tweetObjects
                .filter((t): t is Tweet => t !== undefined)
                .forEach((tweet) => {
                    tweets.add(tweet)
                })

            if (max && mediaUrls.size >= max) {
                tty.cursorMove(-1000, 1).text("")
                log.info("Max count reached")
                break
            }

            tty.cursorMove(-1000, 0).text(`${colors.blue.bold("[INFO]")} Getting tweets...: ${tweets.size}`)
        } catch (error) {
            log.error(error)
            break
        }
    }

    return Array.from(tweets)
        .filter((t) => t.mediaUrls.length > 0)
        .slice(0, Math.min(tweets.size, max))
}

export const getUserMediaUrls = async (restId: string, max = 5000) => {
    const results: string[] = []
    let cursor: string | undefined = undefined

    while (true) {
        try {
            const json = await getUserTweets(restId, cursor)

            const addEntries = json.data.user.result.timeline_v2.timeline.instructions.find((i: any) => {
                return i.type === "TimelineAddEntries"
            })

            if (addEntries == undefined) {
                break
            }

            const tweets: TweetEntry[] = addEntries.entries

            if (tweets == undefined) {
                continue
            } else if (tweets.length <= 2) {
                break
            }

            const mediaUrls = tweets.flatMap((tweet) => {
                switch (tweet.content.entryType) {
                    case "TimelineTimelineItem": {
                        const content = tweet.content as TimelineTimelineItem
                        const legacy = content.itemContent.tweet_results.result.legacy
                        const media = legacy?.entities.media
                        if (media) {
                            const urls = media.map((entity) => {
                                return entity.media_url_https
                            })

                            return urls
                        }
                        return []
                    }
                    case "TimelineTimelineCursor": {
                        const content = tweet.content as TimelineTimelineCursor
                        if (content.cursorType === "Bottom") {
                            cursor = content.value
                        }
                        return []
                    }
                    default: {
                        return []
                    }
                }
            })

            results.push(...mediaUrls)

            if (max && results.length >= max) {
                tty.cursorMove(-1000, 1).text("")
                log.info("Max count reached")
                results.splice(max)
                break
            }

            tty.cursorMove(-1000, 0).text(`${colors.blue.bold("[INFO]")} Getting media urls...: ${results.length}`)
        } catch (error) {
            log.error(error)
            break
        }
    }

    return results
}

export const searchMediaUrls = async (searchQuery: string, max = 5000, live = false) => {
    const results: Set<string> = new Set()
    let cursor = ""

    while (true) {
        try {
            const queries: Record<string, string> = {
                cursor: cursor,
            }

            if (live) {
                queries.tweet_search_mode = "live"
            }

            const json = await searchTweets(searchQuery, queries)

            const tweets: Record<string, SearchTweetResult> = json.globalObjects.tweets

            if (tweets == undefined) {
                continue
            } else if (Object.keys(tweets).length <= 2) {
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

            mediaUrls.forEach((url) => {
                results.add(url)
            })

            if (max && results.size >= max) {
                tty.cursorMove(-1000, 1).text("")
                log.info("Max count reached")
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
            cursor = cursorValue

            if (cursor === undefined) {
                break
            }

            tty.cursorMove(-1000, 0).text(`${colors.blue.bold("[INFO]")} Getting media urls...: ${results.size}`)
        } catch (error) {
            log.error(error)
            break
        }
    }

    return Array.from(results).slice(0, Math.min(max, results.size))
}

const donwloadFiles = async (urls: string[], path: string) => {
    for (const [index, url] of urls.entries()) {
        const filename = url.split("/").pop()

        // log.info("Downloading:", filename)

        try {
            await Deno.open(`${path}/${filename}`)
            tty.cursorMove(-1000, 1).text("")
            log.warn("Skipping", filename, "because file already exists")
            continue
        } catch {
            tty.eraseLine
                .cursorMove(-1000, 0)
                .text(`${colors.blue.bold("[INFO]")} Downloading: ${filename} (${index + 1}/${urls.length})`)
        }

        const res = await fetch(url)
        const body = res.body

        if (body == null) {
            tty.cursorMove(-1000, 1).text("")
            log.warn("Skipping", filename, "because body is null")
            continue
        }

        for await (const buffer of body) {
            await Deno.writeFile(`${path}/${filename}`, buffer, {
                append: true,
            })
        }
    }

    tty.eraseLine.cursorMove(-1000, 0).text("")
}

export const downloadUserMedia = async (userId: string, output = "./", max?: number) => {
    try {
        const restId = await getRestID(userId)
        if (restId == null) {
            throw new Error("User not found")
        }

        const urls = await getUserMediaUrls(restId, max)

        tty.eraseLine.cursorMove(-1000, 0).text("")
        log.info("Total count:", urls.length)

        // save to output folder
        const path = resolve(output, userId)

        try {
            await Deno.open(path)
        } catch {
            await Deno.mkdir(path, {
                recursive: true,
            })
        }

        await donwloadFiles(urls, path)

        tty.eraseLine.cursorMove(-1000, 0).text("")

        log.info("Downloaded", urls.length, "files")
        log.info("Saved to", path)
        log.success("Done!")
    } catch (error) {
        log.error(error)
    }
}

export const downloadSearchedMedia = async (searchQuery: string, output = "./", max?: number, live = false) => {
    try {
        log.info("Search query:", searchQuery)

        const urls = await searchMediaUrls(searchQuery, max, live)

        tty.eraseLine.cursorMove(-1000, 0).text("")
        log.info("Total count:", urls.length)

        // save to output folder
        const hash = await sha256(searchQuery).then((hash) => hash.slice(0, 8))
        log.info("Search hash created:", hash)
        const path = resolve(output, hash)

        try {
            await Deno.open(path)
        } catch {
            await Deno.mkdir(path, {
                recursive: true,
            })
        }

        await donwloadFiles(urls, path)

        tty.eraseLine.cursorMove(-1000, 0).text("")

        log.info("Downloaded", urls.length, "files")
        log.info("Saved to", path)
        log.success("Done!")
    } catch (error) {
        log.error(error)
    }
}

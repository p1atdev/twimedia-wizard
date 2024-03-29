import { SearchQuery, getRestID, getUserTweets, searchTweets, getListTweets, sha256 } from "./utils.ts"
import { log } from "./log.ts"
import { colors, tty, resolve } from "./deps.ts"
import { TweetEntry, TimelineTimelineItem, SearchTweetResult, TimelineTimelineCursor, Tweet } from "./types/mod.ts"

const setLargeSizeParam = (url: string) => {
    const params = new URL(url).searchParams
    params.set("name", "large")
    return `${url}?${params.toString()}`
}

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
                        if (!legacy) {
                            return undefined
                        }
                        const media = legacy?.entities.media

                        const result: Tweet = {
                            mediaUrls: [],
                            text: legacy.full_text,
                            hashTags: legacy.entities.hashtags.map((entity) => {
                                return entity.text
                            }),
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

    return Array.from(tweets).filter((t) => t.mediaUrls.length > 0)
}

export const getUserMediaUrls = async (restId: string, max = 5000) => {
    const tweets = await getUserMediaTweetData(restId, max)
    const mediaUrls = [
        ...new Set(
            tweets.flatMap((tweet) => {
                return tweet.mediaUrls
            })
        ),
    ].map((url) => {
        return setLargeSizeParam(url)
    })

    return mediaUrls.slice(0, max)
}

export const searchMediaTweetData = async (searchQuery: string, max = 5000, live = false) => {
    const tweetsData: Set<Tweet> = new Set()
    const mediaUrls: Set<string> = new Set()
    let cursor = ""

    while (true) {
        try {
            const queries: Record<string, any> = {
                cursor: cursor,
            }

            if (live) {
                for (const [key, value] of Object.entries(SearchQuery.latest)) {
                    queries[key] = value
                }
            } else {
                for (const [key, value] of Object.entries(SearchQuery.top)) {
                    queries[key] = value
                }
            }

            const json = await searchTweets(searchQuery, queries)

            const tweets: Record<string, SearchTweetResult> = json.globalObjects.tweets

            if (tweets == undefined) {
                continue
            } else if (Object.keys(tweets).length <= 2) {
                break
            }

            const tweetObjects = Object.keys(tweets).map((key) => {
                const legacy = tweets[key]

                if (!legacy) {
                    return undefined
                }

                const result: Tweet = {
                    mediaUrls: [],
                    text: legacy.text,
                    hashTags: legacy.entities.hashtags.map((h) => h.text),
                    isQuote: legacy.is_quote_status,
                    language: legacy.lang,
                    replies: legacy.reply_count,
                    retweets: legacy.retweet_count,
                    favorites: legacy.favorite_count,
                }

                if (legacy.entities.media) {
                    result.mediaUrls = legacy.entities.media.map((entity) => {
                        return entity.media_url_https
                    })
                    result.mediaUrls.forEach((url) => {
                        mediaUrls.add(url)
                    })
                }

                return result
            })

            tweetObjects
                .filter((t): t is Tweet => t != undefined)
                .forEach((tweet) => {
                    tweetsData.add(tweet)
                })

            // const mediaUrls = Object.keys(tweets).flatMap((key) => {
            //     if (tweets[key].entities.media) {
            //         return tweets[key].entities.media.map((media) => {
            //             return media.media_url_https
            //         })
            //     } else {
            //         return []
            //     }
            // })

            // mediaUrls.forEach((url) => {
            //     mediaUrls.add(url)
            // })

            if (max && mediaUrls.size >= max) {
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

            tty.cursorMove(-1000, 0).text(`${colors.blue.bold("[INFO]")} Getting media urls...: ${mediaUrls.size}`)
        } catch (error) {
            log.error(error)
            break
        }
    }

    return Array.from(tweetsData)
}

export const searchMediaUrls = async (searchQuery: string, max = 5000, live = false) => {
    const tweets = await searchMediaTweetData(searchQuery, max, live)
    const mediaUrls = [
        ...new Set(
            tweets.flatMap((tweet) => {
                return tweet.mediaUrls
            })
        ),
    ].map((url) => {
        return setLargeSizeParam(url)
    })

    return mediaUrls.slice(0, max)
}

export const getListMediaTweetData = async (listId: string, max = 5000): Promise<Tweet[]> => {
    const tweets: Set<Tweet> = new Set()
    const mediaUrls: Set<string> = new Set()
    let cursor: string | undefined = undefined

    while (true) {
        try {
            const json = await getListTweets(listId, cursor)

            const addEntries = json.data.list.tweets_timeline.timeline.instructions.find((i: any) => {
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
                        if (!legacy) {
                            return undefined
                        }
                        const media = legacy?.entities.media

                        const result: Tweet = {
                            mediaUrls: [],
                            text: legacy.full_text,
                            hashTags: legacy.entities.hashtags.map((entity) => {
                                return entity.text
                            }),
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

    return Array.from(tweets).filter((t) => t.mediaUrls.length > 0)
}

export const getListMediaUrls = async (listId: string, max = 5000) => {
    const tweets = await getListMediaTweetData(listId, max)
    const mediaUrls = [
        ...new Set(
            tweets.flatMap((tweet) => {
                return tweet.mediaUrls
            })
        ),
    ]

    return mediaUrls.slice(0, max)
}

const donwloadFiles = async (urls: string[], path: string) => {
    for (const [index, url] of urls.entries()) {
        const filename = url.split("/").pop()?.split("?")[0]

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

export const downloadListMedia = async (listId: string, output = "./", max?: number) => {
    try {
        const urls = await getListMediaUrls(listId, max)

        tty.eraseLine.cursorMove(-1000, 0).text("")
        log.info("Total count:", urls.length)

        // save to output folder
        const path = resolve(output, listId)

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

export const dumpTweets = async (tweets: Tweet[], output: string) => {
    const parentPath = resolve(output, "..")
    try {
        await Deno.stat(parentPath)
    } catch {
        await Deno.mkdir(parentPath, {
            recursive: true,
        })
    }

    // save with json
    const json = JSON.stringify(tweets, null, 4)
    await Deno.writeFile(output, new TextEncoder().encode(json))
}

export const downloadTweets = async (
    tweets: Tweet[],
    output: string,
    minFavorites: number,
    minRetweets: number,
    caption: boolean
) => {
    try {
        await Deno.stat(output)
    } catch {
        await Deno.mkdir(output, {
            recursive: true,
        })
    }

    for (const tweet of tweets.filter((tweet) => tweet.favorites >= minFavorites && tweet.retweets >= minRetweets)) {
        const { mediaUrls, hashTags } = tweet

        const tags = hashTags
        const captionText = tags.join(", ")

        for (const url of mediaUrls) {
            const res = await fetch(url)
            const body = res.body

            if (!body) {
                continue
            }

            const filename = url.split("/").pop()

            if (!filename) {
                continue
            }

            const path = resolve(output, filename)

            try {
                await Deno.stat(path)
                continue
            } catch {
                for await (const buffer of body) {
                    await Deno.writeFile(path, buffer, {
                        append: true,
                    })
                }
            }

            if (caption) {
                const imageName = filename.split(".")[0]
                const captionPath = resolve(output, `${imageName}.txt`)
                await Deno.writeTextFile(captionPath, captionText)
            }
        }
    }
}

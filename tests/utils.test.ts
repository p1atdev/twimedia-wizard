import { assertEquals, assertExists, assert } from "../deps.ts"
import { TweetEntry, TimelineTimelineItem } from "../types/mod.ts"
import { getRestID, searchTweets, getUserTweets, getListTweets } from "../utils.ts"

Deno.test("get user rest id", async () => {
    const userId = "x_angelkawaii_x"
    const restId = await getRestID(userId)

    // console.log(restId)
    assertEquals(restId, "1313122922886643714")
})

Deno.test("search user tweets ", async () => {
    const userId = "from:@x_angelkawaii_x"
    const json = await searchTweets(`(from:${userId}) -filter:replies`)
    const tweets = json.globalObjects.tweets

    // console.log(tweets)
    Object.keys(tweets).forEach((key) => {
        assertEquals(tweets[key].user_id_str, "1313122922886643714")
    })
})

Deno.test("get user tweets", async () => {
    const userId = "1313122922886643714"
    const json = await getUserTweets(userId)

    assertExists(json.data.user.result.timeline_v2.timeline.instructions)

    const addEntries = json.data.user.result.timeline_v2.timeline.instructions.find((i: any) => {
        return i.type === "TimelineAddEntries"
    })

    assertExists(addEntries)

    const tweets: TweetEntry[] = addEntries.entries
    // console.log(tweets)

    assert(tweets.length > 0)

    // console.log(tweets)
    tweets.forEach((tweet) => {
        // console.log(tweet.content)
        if (tweet.content.entryType === "TimelineTimelineItem") {
            const content = tweet.content as TimelineTimelineItem

            if (content.itemContent.tweet_results.result.tombstone) {
                return
            }

            assertExists(content.itemContent.tweet_results.result.legacy)

            assertEquals(content.itemContent.tweet_results.result.legacy.user_id_str, "1313122922886643714")
        }
    })
})

Deno.test("search tweets ", async () => {
    const query = "sketch final min_faves:500"
    const json = await searchTweets(query)
    const tweets = json.globalObjects.tweets

    console.log(tweets)
    // Object.keys(tweets).forEach((key) => {
    //     assertEquals(tweets[key].user_id_str, "1313122922886643714")
    // })
})

Deno.test("get list tweets", async () => {
    const listId = "1657009790193917952"

    const json = await getListTweets(listId)

    console.log(json)

    const tweets = json.data.list.tweets_timeline.timeline.instructions[0].entries

    assert(tweets.length > 0)
})

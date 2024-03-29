import {
    getUserMediaTweetData,
    getUserMediaUrls,
    searchMediaTweetData,
    searchMediaUrls,
    getListMediaTweetData,
    getListMediaUrls,
} from "../main.ts"
import { assertEquals, assertExists, assertNotEquals, assert } from "../deps.ts"
import { getRestID } from "../utils.ts"

const userId = "uma_musu"

Deno.test("get a few media tweets", async () => {
    const restId = await getRestID(userId)

    assertExists(restId)

    const count = 5
    const tweets = await getUserMediaTweetData(restId, count)

    assert(tweets.length >= count)
})

Deno.test("get a few media urls", async () => {
    const restId = await getRestID(userId)

    assertExists(restId)

    const count = 5
    const urls = await getUserMediaUrls(restId, count)

    assertEquals(urls.length, count)
    urls.forEach((url) => {
        assert(url.includes("name=large"), url)
    })
})

Deno.test("get media tweets", async () => {
    const restId = await getRestID(userId)

    assertExists(restId)

    const count = 500
    const tweets = await getUserMediaTweetData(restId, count)

    assert(tweets.length >= count)
})

Deno.test("get a lot of media urls", async () => {
    const restId = await getRestID(userId)

    assertExists(restId)

    const count = 500
    const urls = await getUserMediaUrls(restId, count)

    assertEquals(urls.length, count)
})

Deno.test("get exceeded amount of media urls", async () => {
    const restId = await getRestID(userId)

    assertExists(restId)

    const count = 1000
    const urls = await getUserMediaUrls(restId, count)

    assertNotEquals(urls.length, count)
})

Deno.test("get a lot of media urls, and check conflicting", async () => {
    const restId = await getRestID(userId)

    assertExists(restId)

    const count = 300
    const urls = await getUserMediaUrls(restId, count)

    // is thare same url?
    const uniqueUrls = [...new Set(urls)]

    assertEquals(urls.length, uniqueUrls.length)
    assertEquals(urls.length, count)
})

const searchQuery = "#gawrt"

Deno.test("search a few media tweets", async () => {
    const count = 5
    const tweets = await searchMediaTweetData(searchQuery, count)

    assert(tweets.length >= count)
})

Deno.test("search a few media urls", async () => {
    const count = 5
    const urls = await searchMediaUrls(searchQuery, count)

    assertEquals(urls.length, count)
})

Deno.test("search a lot of media urls", async () => {
    const count = 100
    const urls = await searchMediaUrls(searchQuery, count)

    assertEquals(urls.length, count)
})

Deno.test("search a lot of media urls, and check conflicting", async () => {
    const count = 150
    const urls = await searchMediaUrls(searchQuery, count)

    // is thare same url?
    const uniqueUrls = [...new Set(urls)]

    assertEquals(urls.length, uniqueUrls.length)
})

Deno.test("search media urls in live", async () => {
    const count = 10
    const urls = await searchMediaUrls(searchQuery, count)
    const liveUrls = await searchMediaUrls(searchQuery, count, true)

    assertNotEquals(urls, liveUrls)
})

Deno.test("get a few media tweets from list", async () => {
    const listId = "1657009790193917952"

    const count = 5
    const tweets = await getListMediaTweetData(listId, count)

    assert(tweets.length >= count)
})

Deno.test("get a few media urls from list", async () => {
    const listId = "1657009790193917952"

    const count = 5
    const urls = await getListMediaUrls(listId, count)

    assertEquals(urls.length, count)
})

Deno.test("get media tweets from list", async () => {
    const listId = "1657009790193917952"

    const count = 50
    const tweets = await getListMediaTweetData(listId, count)

    assert(tweets.length >= count)
})

Deno.test("get a lot of media urls from list", async () => {
    const listId = "1657009790193917952"

    const count = 500
    const urls = await getListMediaUrls(listId, count)

    assertEquals(urls.length, count)
})

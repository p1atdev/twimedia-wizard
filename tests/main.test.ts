import { getUserMediaUrls, searchMediaUrls } from "../main.ts"
import { assertEquals, assertExists, assertNotEquals } from "../deps.ts"
import { getRestID } from "../utils.ts"

const userId = "granbluefantasy"

Deno.test("get a few media urls", async () => {
    const restId = await getRestID(userId)

    assertExists(restId)

    const count = 5
    const urls = await getUserMediaUrls(restId, count)

    assertEquals(urls.length, count)
})

Deno.test("get a lot of media urls", async () => {
    const restId = await getRestID(userId)

    assertExists(restId)

    const count = 1000
    const urls = await getUserMediaUrls(restId, count)

    assertEquals(urls.length, count)
})

const searchQuery = "#gawrt"

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

Deno.test("search media urls in live", async () => {
    const count = 10
    const urls = await searchMediaUrls(searchQuery, count)
    const liveUrls = await searchMediaUrls(searchQuery, count, true)

    assertNotEquals(urls, liveUrls)
})

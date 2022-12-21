import { assertEquals } from "../deps.ts"
import { getRestID } from "../utils.ts"

Deno.test("get user rest id", async () => {
    const userId = "x_angelkawaii_x"
    const restId = await getRestID(userId)

    console.log(restId)
    assertEquals(restId, "1313122922886643714")
})

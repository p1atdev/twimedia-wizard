import { getMediaUrls, getRestID } from "./utils.ts"
import { log } from "./log.ts"
import { colors, tty, resolve } from "./deps.ts"

export const download = async (userId: string, output = "./", max?: number) => {
    try {
        const restId = await getRestID(userId)
        if (restId == null) {
            throw new Error("User not found")
        }
    } catch {
        log.error("User not found")
        Deno.exit(1)
    }

    const urls = await getMediaUrls(userId, max)

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

    for (const url of urls) {
        const filename = url.split("/").pop()

        // log.info("Downloading:", filename)

        tty.eraseLine.cursorMove(-1000, 0).text(`${colors.blue.bold("[INFO]")} Downloading: ${filename}`)

        const res = await fetch(url)
        const body = res.body

        if (body == null) {
            log.warn("Skipping", filename, "because body is null")
            continue
        }

        for await (const buffer of body) {
            await Deno.writeFile(`${path}/${filename}`, buffer, {
                append: true,
            })
        }
    }

    console.log()

    log.info("Downloaded", urls.length, "files")
    log.info("Saved to", path)
    log.success("Done!")
}

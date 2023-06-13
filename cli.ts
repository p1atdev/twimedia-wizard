import { Command, colors, tty } from "./deps.ts"
import { log } from "./log.ts"
import {
    downloadSearchedMedia,
    downloadTweets,
    downloadUserMedia,
    downloadListMedia,
    dumpTweets,
    getUserMediaTweetData,
    searchMediaTweetData,
    getListMediaTweetData,
} from "./main.ts"
import { getRestID } from "./utils.ts"

await new Command()
    .name("twimedia-wizard")
    .version("0.3.4")
    .description("Twitter Media Downloader")

    .command("user", "Download media from a user.")
    .arguments("<userId:string>")
    .option("-o, --output <path:string>", "Output path.", {
        required: true,
    })
    .option("-m, --max <number:number>", "Maximum number of media to download. Default is 5000")
    .option("-d, --dump [boolean:boolean]", "Dump information to a json file.")
    .action(async ({ output, max, dump }, userId) => {
        log.info("Downloading media from", colors.bold.underline(userId))

        if (dump) {
            const restId = await getRestID(userId)
            const tweets = await getUserMediaTweetData(restId, max)

            tty.eraseLine.cursorMove(-1000, 0).text("")
            log.info(tweets.length, "tweets found. Dumping to JSON file...")

            await dumpTweets(tweets, output)

            log.success("Done! JSON file is saved to", colors.bold.underline(output))
        } else {
            await downloadUserMedia(userId, output, max)
        }
    })

    .command("list", "Download media from a list.")
    .arguments("<listId:string>")
    .option("-o, --output <path:string>", "Output path.", {
        required: true,
    })
    .option("-m, --max <number:number>", "Maximum number of media to download. Default is 5000")
    .option("-d, --dump [boolean:boolean]", "Dump information to a json file.")
    .action(async ({ output, max, dump }, listId) => {
        log.info("Downloading media from list ID", colors.bold.underline(listId))

        if (dump) {
            const tweets = await getListMediaTweetData(listId, max)

            tty.eraseLine.cursorMove(-1000, 0).text("")
            log.info(tweets.length, "tweets found. Dumping to JSON file...")

            await dumpTweets(tweets, output)

            log.success("Done! JSON file is saved to", colors.bold.underline(output))
        } else {
            await downloadListMedia(listId, output, max)
        }
    })

    .command("search", "Download media from a search query.")
    .arguments("<query:string>")
    .option("-o, --output <path:string>", "Output path.", {
        required: true,
    })
    .option("-m, --max <number:number>", "Maximum number of media to download. Default is 5000")
    .option(
        "-l, --latest",
        "Download media from Latest tweets. If not specified, it will download media from Top tweets."
    )
    .option("-d, --dump [boolean:boolean]", "Dump information to a json file.")
    .action(async ({ output, max, latest, dump }, query) => {
        log.info("Search and download media from", colors.bold.underline(query))
        if (latest) {
            log.info("Mode:", colors.bold.underline("latest"))
        }

        if (dump) {
            const tweets = await searchMediaTweetData(query, max, latest)

            tty.eraseLine.cursorMove(-1000, 0).text("")
            log.info(tweets.length, "tweets found. Dumping to JSON file...")

            await dumpTweets(tweets, output)

            log.success("Done! JSON file is saved to", colors.bold.underline(output))
        } else {
            await downloadSearchedMedia(query, output, max, latest)
        }
    })

    .command("download", "Download media files and captions from a JSON file.")
    .arguments("<path:string>")
    .option("-o, --output <path:string>", "Output path.", {
        required: true,
    })
    .option("--min-favorites <number:number>", "Minimum number of favorites to download.", {
        default: 10,
    })
    .option("--min-retweets <number:number>", "Minimum number of retweets to download.", {
        default: 0,
    })
    .option("--caption [boolean:boolean]", "Download captions.", {
        default: false,
    })
    .action(async ({ output, minFavorites, minRetweets, caption }, path) => {
        log.info("Download media files and captions from", colors.bold.underline(path))
        if (caption) {
            log.info("Download captions together")
        }
        log.info("Minimum number of favorites:", colors.bold.underline(minFavorites.toString()))
        log.info("Minimum number of retweets:", colors.bold.underline(minRetweets.toString()))

        const jsonText = await Deno.readTextFile(path)
        const tweets = JSON.parse(jsonText)

        log.info(tweets.length, "tweets found. Downloading media files...")

        await downloadTweets(tweets, output, minFavorites, minRetweets, caption)

        log.success("Done! Media files are saved to", colors.bold.underline(output))
    })

    .parse(Deno.args)

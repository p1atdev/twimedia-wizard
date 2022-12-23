import { Command, colors } from "./deps.ts"
import { log } from "./log.ts"
import { downloadSearchedMedia, downloadUserMedia } from "./main.ts"

await new Command()
    .name("twimedia-wizard")
    .version("0.2.0")
    .description("Twitter Media Downloader")
    .command("user", "Download media from a user.")
    .arguments("<userId:string>")
    .option("-o, --output <path:string>", "Output path.")
    .option("-m, --max <number:number>", "Maximum number of media to download. Default is 5000")
    .action(async ({ output, max }, userId) => {
        log.info("Downloading media from", colors.bold.underline(userId))
        await downloadUserMedia(userId, output, max)
    })
    .command("search", "Download media from a search query.")
    .arguments("<query:string>")
    .option("-o, --output <path:string>", "Output path.")
    .option("-m, --max <number:number>", "Maximum number of media to download. Default is 5000")
    .option(
        "-l, --latest",
        "Download media from Latest tweets. If not specified, it will download media from Top tweets."
    )
    .action(async ({ output, max, latest }, query) => {
        log.info("Search and downloading media from", colors.bold.underline(query))
        if (latest) {
            log.info("Mode:", colors.bold.underline("latest"))
        }
        await downloadSearchedMedia(query, output, max, latest)
    })
    .parse(Deno.args)

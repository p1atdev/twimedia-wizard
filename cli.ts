import { Command, colors } from "./deps.ts"
import { log } from "./log.ts"
import { download } from "./main.ts"

await new Command()
    .name("twimedia-wizard")
    .version("0.1.0")
    .description("Twitter Media Downloader")
    .arguments("<userId:string>")
    .option("-o, --output <path:string>", "Output path.")
    .option("-m, --max <number:number>", "Maximum number of media to download.")
    .action(({ output, max }, userId: string) => {
        log.info("Downloading media from", colors.bold.underline(userId))
        download(userId, output, max)
    })
    .parse(Deno.args)

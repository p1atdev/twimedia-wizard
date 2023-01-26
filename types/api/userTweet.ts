import { HashTag, OriginalInfo, Palette, Sizes, VideoInfo } from "./common.ts"

// export type TweetEntry = TimelineTimelineItemEntry | TimelineTimelineCursorEntry

export interface TweetEntry {
    entryId: string
    sortIndex: string
    content: TimelineTimelineItem | TimelineTimelineCursor
}

export interface TweetEntryContent {
    entryType: string
}

export interface TimelineTimelineItem extends TweetEntryContent {
    entryType: "TimelineTimelineItem"
    itemContent: {
        itemType: string
        tweet_results: {
            result: {
                rest_id?: string
                core?: {}
                edit_control?: {}
                legacy?: TimelineTimelineItemLegacy
                tombstone?: {}
            }
        }
        tweetDisplayType: "Tweet"
    }
}

export interface TimelineTimelineItemLegacy {
    created_at: string
    conversation_id_str: string
    display_text_range: number[]
    entities: TimelineTimelineItemEntities
    extended_entities: ExtendedEntities
    favorite_count: number
    favorited: boolean
    full_text: string
    is_quote_status: boolean
    lang: string
    quote_count: number
    reply_count: number
    retweet_count: number
    retweeted: boolean
    source: string
    user_id_str: string
    id_str: string
}

export interface TimelineTimelineItemEntities {
    media: TimelineTimelineItemMedia[]
    user_mentions: any[]
    urls: any[]
    hashtags: HashTag[]
    symbols: any[]
}

export interface TimelineTimelineItemMedia {
    display_url: string
    expanded_url: string
    id_str: string
    indices: string[]
    media_url_https: string
    type: string
    url: string
    features: string[]
    sizes: string[]
    original_info: string[]
    media_key?: string
    ext_media_color?: string[]
    ext_media_availability?: string[]
}

export interface ExtendedEntities {
    media: TimelineTimelineItemMedia[]
}

export interface TimelineTimelineCursor extends TweetEntryContent {
    entryId: "TimelineTimelineCursor"
    cursorType: string
    value: string
    stopOnEmptyResponse?: boolean
}

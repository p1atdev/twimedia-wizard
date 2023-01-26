import { HashTag, OriginalInfo, Sizes } from "./common.ts"

export interface SearchTweetResult {
    created_at: string
    id: number
    id_str: string
    text: string
    truncated: boolean
    entities: SearchTweetResultEntities
    extended_entities: SearchTweetResultExtendedEntities
    source: string
    in_reply_to_status_id: null
    in_reply_to_status_id_str: null
    in_reply_to_user_id: null
    in_reply_to_user_id_str: null
    in_reply_to_screen_name: null
    user_id: number
    user_id_str: string
    geo: null
    coordinates: null
    place: null
    contributors: null
    is_quote_status: boolean
    retweet_count: number
    reply_count: number
    favorite_count: number
    conversation_id: number
    conversation_id_str: string
    favorited: boolean
    retweeted: boolean
    possibly_sensitive: boolean
    possibly_sensitive_editable: boolean
    lang: string
    supplemental_language: null
}

export interface SearchTweetResultEntities {
    hashtags: HashTag[]
    symbols: any[]
    user_mentions: any[]
    urls: any[]
    media: SearchTweetResultMediaEntity[]
}

export interface SearchTweetResultExtendedEntities {
    media: SearchTweetResultMediaEntity[]
}

export interface SearchTweetResultMediaEntity {
    id: number
    id_str: string
    indices: number[]
    media_url: string
    media_url_https: string
    url: string
    display_url: string
    expanded_url: string
    type: string
    original_info: OriginalInfo
    sizes: Sizes
    media_key: string
}

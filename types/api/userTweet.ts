import {
    EntryTypeEnum,
    HashTag,
    MediaEntity,
    Professional,
    ProfileImageShape,
    TranslatorType,
    UserMention,
    VerifiedType,
} from "./common.ts"

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
    __typename: EntryTypeEnum
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
    // items?: TimelineTimelineItemElement[]
    displayType?: string
    // header?:              Header;
    // footer?:              Footer;
    // clientEventInfo?:     ContentClientEventInfo;
    value?: string
    cursorType?: string
    stopOnEmptyResponse?: boolean
}

export interface TimelineTimelineTweetResult {
    id: string
    rest_id: string
    has_graduated_access: boolean
    is_blue_verified: boolean
    profile_image_shape: ProfileImageShape
    legacy: TimelineTimelineItemLegacy
    professional?: Professional
}

export interface TimelineTimelineItemLegacy {
    can_dm: boolean
    can_media_tag: boolean
    created_at: string
    default_profile: boolean
    default_profile_image: boolean
    description: string
    entities: TimelineTimelineItemEntities
    fast_followers_count: number
    favourites_count: number
    followers_count: number
    friends_count: number
    has_custom_timelines: boolean
    is_translator: boolean
    listed_count: number
    location: string
    media_count: number
    name: string
    normal_followers_count: number
    pinned_tweet_ids_str: string[]
    possibly_sensitive: boolean
    profile_banner_url: string
    profile_image_url_https: string
    profile_interstitial_type: string
    screen_name: string
    statuses_count: number
    translator_type: TranslatorType
    url: string
    verified: boolean
    verified_type?: VerifiedType
    want_retweets: boolean
    withheld_in_countries: any[]
    following?: boolean
    bookmark_count: number
    bookmarked: boolean
    conversation_id_str: string
    display_text_range: number[]
    favorite_count: number
    favorited: boolean
    full_text: string
    is_quote_status: boolean
    quote_count: number
    reply_count: number
    retweet_count: number
    retweeted: boolean
    user_id_str: string
    id_str: string
    lang: string
    // retweeted_status_result?: RetweetedStatusResult
    extended_entities?: {
        media: MediaEntity[]
    }
    possibly_sensitive_editable?: boolean
}

export interface TimelineTimelineItemEntities {
    user_mentions: UserMention[]
    urls: URL[]
    hashtags: HashTag[]
    symbols: any[]
    media?: MediaEntity[]
}

export interface TimelineTimelineCursor extends TweetEntryContent {
    entryId: "TimelineTimelineCursor"
    cursorType: string
    value: string
    stopOnEmptyResponse?: boolean
}

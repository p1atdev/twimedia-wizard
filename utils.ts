import { TwitterAPI, Bearer, RequestQuery } from "./deps.ts"
import { log } from "./log.ts"
import { colors, tty, crypto } from "./deps.ts"

const client = new TwitterAPI(Bearer.Web)

export const SearchQuery = {
    top: {
        // include_profile_interstitial_type: 1,
        // include_blocking: 1,
        // include_blocked_by: 1,
        // include_followed_by: 1,
        // include_want_retweets: 1,
        // include_mute_edge: 1,
        // include_can_dm: 1,
        // include_can_media_tag: 1,
        // include_ext_has_nft_avatar: 1,
        // include_ext_is_blue_verified: 1,
        // include_ext_verified_type: 1,
        // include_ext_profile_image_shape: 1,
        // skip_status: 1,
        // cards_platform: "Web-12",
        // include_cards: 1,
        // include_ext_alt_text: true,
        // include_ext_limited_action_results: false,
        // include_quote_count: true,
        // include_reply_count: 1,
        // tweet_mode: "extended",
        // include_ext_views: true,
        // include_entities: true,
        // include_user_entities: true,
        // include_ext_media_color: true,
        // include_ext_media_availability: true,
        // include_ext_sensitive_media_warning: true,
        // include_ext_trusted_friends_metadata: true,
        // send_error_codes: true,
        // simple_quoted_tweet: true,
        // query_source: "typed_query",
        // count: 20,
        // requestContext: "launch",
        // pc: 1,
        // spelling_corrections: 1,
        // include_ext_edit_control: true,
        // ext: "mediaStats,highlightedLabel,hasNftAvatar,voiceInfo,enrichments,superFollowMetadata,unmentionInfo,editControl,vibe",
    },
    latest: {
        // include_profile_interstitial_type: 1,
        // include_blocking: 1,
        // include_blocked_by: 1,
        // include_followed_by: 1,
        // include_want_retweets: 1,
        // include_mute_edge: 1,
        // include_can_dm: 1,
        // include_can_media_tag: 1,
        // include_ext_has_nft_avatar: 1,
        // include_ext_is_blue_verified: 1,
        // include_ext_verified_type: 1,
        // include_ext_profile_image_shape: 1,
        // skip_status: 1,
        // cards_platform: "Web-12",
        // include_cards: 1,
        // include_ext_alt_text: true,
        // include_ext_limited_action_results: false,
        // include_quote_count: true,
        // include_reply_count: 1,
        // tweet_mode: "extended",
        // include_ext_views: true,
        // include_entities: true,
        // include_user_entities: true,
        // include_ext_media_color: true,
        // include_ext_media_availability: true,
        // include_ext_sensitive_media_warning: true,
        // include_ext_trusted_friends_metadata: true,
        // send_error_codes: true,
        // simple_quoted_tweet: true,
        tweet_search_mode: "live",
        // query_source: "typed_query",
        // count: 20,
        // requestContext: "launch",
        // pc: 1,
        // spelling_corrections: 1,
        // include_ext_edit_control: true,
        // ext: "mediaStats,highlightedLabel,hasNftAvatar,voiceInfo,enrichments,superFollowMetadata,unmentionInfo,editControl,vibe",
    },
}

export const getRestID = async (userId: string) => {
    const query = new RequestQuery({
        variables: {
            screen_name: userId,
            withSafetyModeUserFields: false,
        },
        features: {
            hidden_profile_likes_enabled: false,
            responsive_web_graphql_exclude_directive_enabled: true,
            verified_phone_label_enabled: false,
            subscriptions_verification_info_verified_since_enabled: true,
            highlights_tweets_tab_ui_enabled: true,
            creator_subscriptions_tweet_preview_api_enabled: true,
            responsive_web_graphql_skip_user_profile_image_extensions_enabled: false,
            responsive_web_graphql_timeline_navigation_enabled: true,
        },
    })

    const res = await client.request({
        method: "GET",
        urlType: "gql",
        path: "UserByScreenName",
        query: query,
    })

    if (res.status !== 200) {
        throw new Error(`Request failed with status ${res.status}: ${res.statusText}`)
    }

    const json = await res.json()

    return json.data.user.result.rest_id
}

export const searchTweets = async (searchQuery: string, pathQuery: Record<string, string> = {}) => {
    const query = new RequestQuery({
        q: searchQuery,
        count: 500,
        ...pathQuery,
    })

    const res = await client.request({
        method: "GET",
        urlType: "i/api/2",
        path: `/search/adaptive.json`,
        query: query,
    })

    if (res.status !== 200) {
        throw new Error(`Request failed with status ${res.status}: ${res.statusText}`)
    }

    const json = await res.json()

    return json
}

export const getUserTweets = async (userId: string, cursor?: string) => {
    const query = new RequestQuery({
        variables: {
            userId: userId,
            count: 500,
            includePromotedContent: true,
            withQuickPromoteEligibilityTweetFields: true,
            withVoice: true,
            withV2Timeline: true,
            cursor: cursor,
        },
        features: {
            rweb_lists_timeline_redesign_enabled: true,
            responsive_web_graphql_exclude_directive_enabled: true,
            verified_phone_label_enabled: false,
            creator_subscriptions_tweet_preview_api_enabled: true,
            responsive_web_graphql_timeline_navigation_enabled: true,
            responsive_web_graphql_skip_user_profile_image_extensions_enabled: false,
            tweetypie_unmention_optimization_enabled: true,
            responsive_web_edit_tweet_api_enabled: true,
            graphql_is_translatable_rweb_tweet_is_translatable_enabled: true,
            view_counts_everywhere_api_enabled: true,
            longform_notetweets_consumption_enabled: true,
            tweet_awards_web_tipping_enabled: false,
            freedom_of_speech_not_reach_fetch_enabled: true,
            standardized_nudges_misinfo: true,
            tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled: false,
            longform_notetweets_rich_text_read_enabled: true,
            longform_notetweets_inline_media_enabled: false,
            responsive_web_enhance_cards_enabled: false,
        },
    })

    const res = await client.request({
        method: "GET",
        urlType: "gql",
        path: "UserTweets",
        query: query,
    })

    if (res.status !== 200) {
        throw new Error(`Request failed with status ${res.status}: ${res.statusText}`)
    }

    const json = await res.json()

    return json
}

export const getListID = async (listId: string) => {
    const query = new RequestQuery({
        variables: { listId: listId },
        features: {
            rweb_lists_timeline_redesign_enabled: true,
            blue_business_profile_image_shape_enabled: true,
            responsive_web_graphql_exclude_directive_enabled: true,
            verified_phone_label_enabled: false,
            responsive_web_graphql_skip_user_profile_image_extensions_enabled: false,
            responsive_web_graphql_timeline_navigation_enabled: true,
        },
    })

    const res = await client.request({
        method: "GET",
        urlType: "gql",
        path: "ListByRestId",
        query: query,
    })

    if (res.status !== 200) {
        throw new Error(`Request failed with status ${res.status}: ${res.statusText}`)
    }

    const json = await res.json()

    return json.data.list
}

export const getListTweets = async (listId: string, cursor?: string) => {
    const query = new RequestQuery({
        variables: {
            listId: listId,
            count: 500,
            cursor: cursor,
        },
        features: {
            rweb_lists_timeline_redesign_enabled: true,
            blue_business_profile_image_shape_enabled: true,
            responsive_web_graphql_exclude_directive_enabled: true,
            verified_phone_label_enabled: false,
            creator_subscriptions_tweet_preview_api_enabled: true,
            responsive_web_graphql_timeline_navigation_enabled: true,
            responsive_web_graphql_skip_user_profile_image_extensions_enabled: false,
            tweetypie_unmention_optimization_enabled: true,
            vibe_api_enabled: true,
            responsive_web_edit_tweet_api_enabled: true,
            graphql_is_translatable_rweb_tweet_is_translatable_enabled: true,
            view_counts_everywhere_api_enabled: true,
            longform_notetweets_consumption_enabled: true,
            tweet_awards_web_tipping_enabled: false,
            freedom_of_speech_not_reach_fetch_enabled: true,
            standardized_nudges_misinfo: true,
            tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled: false,
            interactive_text_enabled: true,
            responsive_web_text_conversations_enabled: false,
            longform_notetweets_rich_text_read_enabled: true,
            longform_notetweets_inline_media_enabled: false,
            responsive_web_enhance_cards_enabled: false,
        },
    })

    const res = await client.request({
        method: "GET",
        urlType: "gql",
        path: "ListLatestTweetsTimeline",
        query: query,
    })

    if (res.status !== 200) {
        throw new Error(`Request failed with status ${res.status}: ${res.statusText}`)
    }

    const json = await res.json()

    return json
}

export const sha256 = async (text: string) => {
    const hashBuffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text))
    const hashArray = Array.from(new Uint8Array(hashBuffer))

    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
}

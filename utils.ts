import { TwitterAPI, Bearer, RequestQuery } from "./deps.ts"
import { log } from "./log.ts"
import { colors, tty, crypto } from "./deps.ts"

const client = new TwitterAPI(Bearer.Web)

export const SearchQuery = {
    latest: "tweet_search_mode=live&query_source=typed_query&ext=mediaStats,highlightedLabel,hasNftAvatar,voiceInfo,enrichments,superFollowMetadata,unmentionInfo,editControl,collab_control,vibe",
}

export const getRestID = async (userId: string) => {
    const query = new RequestQuery({
        variables: {
            screen_name: userId,
            withSafetyModeUserFields: false,
            withSuperFollowsUserFields: true,
        },
        features: {
            responsive_web_twitter_blue_verified_badge_is_enabled: true,
            responsive_web_graphql_exclude_directive_enabled: false,
            verified_phone_label_enabled: false,
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

    const json = await res.json()

    // console.log(json.data.user.result)

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
            withSuperFollowsUserFields: true,
            withDownvotePerspective: false,
            withReactionsMetadata: false,
            withReactionsPerspective: false,
            withSuperFollowsTweetFields: true,
            withVoice: true,
            withV2Timeline: true,
            cursor: cursor,
        },
        features: {
            responsive_web_twitter_blue_verified_badge_is_enabled: true,
            responsive_web_graphql_exclude_directive_enabled: false,
            verified_phone_label_enabled: false,
            responsive_web_graphql_timeline_navigation_enabled: true,
            responsive_web_graphql_skip_user_profile_image_extensions_enabled: false,
            tweetypie_unmention_optimization_enabled: true,
            vibe_api_enabled: true,
            responsive_web_edit_tweet_api_enabled: true,
            graphql_is_translatable_rweb_tweet_is_translatable_enabled: true,
            view_counts_everywhere_api_enabled: true,
            longform_notetweets_consumption_enabled: true,
            tweet_awards_web_tipping_enabled: false,
            freedom_of_speech_not_reach_fetch_enabled: false,
            standardized_nudges_misinfo: true,
            tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled: false,
            interactive_text_enabled: true,
            responsive_web_text_conversations_enabled: false,
            longform_notetweets_richtext_consumption_enabled: false,
            responsive_web_enhance_cards_enabled: false,
        },
    })

    const res = await client.request({
        method: "GET",
        urlType: "gql",
        path: "UserTweets",
        query: query,
    })

    const json = await res.json()

    return json
}

export const sha256 = async (text: string) => {
    const hashBuffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text))
    const hashArray = Array.from(new Uint8Array(hashBuffer))

    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
}

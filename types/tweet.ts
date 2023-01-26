export interface Tweet {
    mediaUrls: string[]
    text: string
    hashTags: string[]
    isQuote: boolean
    language: string
    replies: number
    retweets: number
    favorites: number
}

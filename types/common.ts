export interface Palette {
    percentage: number
    rgb: RGB
}

export interface RGB {
    blue: number
    green: number
    red: number
}

export interface MediaEntity {
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

export interface OriginalInfo {
    width: number
    height: number
    focus_rects: string[]
}

export interface Sizes {
    thumb: string[]
    medium: string[]
    large: string[]
    small: string[]
}

export interface VideoInfo {
    aspect_ratio: number[]
    duration_millis: number
    variants: Variant[]
}

export interface Variant {
    bitrate?: number
    content_type: string
    url: string
}

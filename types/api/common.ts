export interface Palette {
    percentage: number
    rgb: RGB
}

export interface RGB {
    blue: number
    green: number
    red: number
}

export interface UserMention {
    id_str: string
    name: string
    screen_name: string
    indices: number[]
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
    type: MediaType
    original_info: OriginalInfo
    sizes: Sizes
    media_key: string
    // additional_media_info?: AdditionalMediaInfo;
    // mediaStats?:            MediaStats;
    // ext_media_availability: EXTMediaAvailability;
    video_info?: VideoInfo
    source_status_id_str?: string
    source_user_id_str?: string
}

export enum MediaType {
    Photo = "photo",
    Video = "video",
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

export interface HashTag {
    text: string
    indices: number[]
}

export enum EntryTypeEnum {
    TimelineTimelineCursor = "TimelineTimelineCursor",
    TimelineTimelineItem = "TimelineTimelineItem",
    TimelineTimelineModule = "TimelineTimelineModule",
}

export enum ProfileImageShape {
    Circle = "Circle",
    Square = "Square",
}

export interface Professional {
    rest_id: string
    professional_type: string
    category: ProfessionalCategory[]
}

export interface ProfessionalCategory {
    id: number
    name: string
    icon_name: string
}

export enum TranslatorType {
    None = "none",
    Regular = "regular",
}

export enum VerifiedType {
    Business = "Business",
}

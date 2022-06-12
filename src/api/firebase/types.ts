import type {
    IF1ConstructorStanding,
    IF1DriverStanding,
    IF1QualifyingEvent,
    IF1QualifyingResult,
    IF1RaceEvent,
    IF1RaceResult
} from '../ergast/index.js';

/**
 * Defines a resolvable shortened link type returned from a request to shorten
 * a Formula 1 Wikipedia URL.
 */
export type F1ShortLinkType =
    IF1ConstructorStanding |
    IF1DriverStanding |
    IF1QualifyingEvent |
    IF1QualifyingResult |
    IF1RaceEvent |
    IF1RaceResult;

/**
 * Defines a type of allowed Wiki links held in the database.
 */
export type F1WikiLinkType =
    'circuit' |
    'constructor' |
    'driver' |
    'event';

/**
 * Interface contract of a response object containing a Discord guild
 * configuration for Crofty.
 */
export interface IDiscordGuildConfig {
    guildId: string;
    autoEventThreadChannelId: string | null;
    autoNewsChannelId: string | null;
    isAutoEventThreadEnabled: boolean;
    isAutoNewsEnabled: boolean;    
}

/**
 * Interface contract of a response object containing a Discord guild
 * member's configuration for Crofty.
 */
export interface IDiscordGuildMemberConfig {
    guildId: string;
    guildMemberId: string;
    isAutoEventThreadNotify: boolean;
}

/**
 * Interface contract of a response object containing a URL for a Formula 1
 * Wikipedia reference.
 */
export interface IF1WikiLink {
    type: F1WikiLinkType;
    originalUrl: string;
    shortUrl: string;
}

/**
 * Interface contract of a request object containing granular configuration
 * properties for a shortened link request.
 */
export interface IShortLinkDynamicInfo {
    domainUriPrefix: string;
    link: string;
}

/**
 * Interface contract of a request containing the parameters required to create
 * a shortened link.
 */
export interface IShortLinkRequestParams {
    dynamicLinkInfo?: IShortLinkDynamicInfo;
    longDynamicLink?: string;
    suffix?: IShortLinkSuffix;
}

/**
 * Interface contract of a response object containing the result of a
 * shortened link request.
 */
export interface IShortLinkResponse {
    shortLink: string;
    previewLink: string;
}

/**
 * Interface contract of a request object containing the creation suffix
 * configuration of a shortened link.
 */
export interface IShortLinkSuffix {
    option: ShortLinkSuffix;
}

/**
 * Defines values allowed as the creation suffix of a shortened link.
 */
export type ShortLinkSuffix =
    'SHORT' |
    'UNGUESSABLE';
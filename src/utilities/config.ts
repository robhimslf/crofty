import { existsSync as fileExistsSync, readFileSync } from 'fs';
import { ActivitiesOptions } from 'discord.js';
import { DateType } from './date-time.js';

/**
 * Enumeration of embeds that Crofty can include in responses.
 */
export enum ChatEmbeds {

    /**
     * Crofty will embed a table of the current time across all U.S. timezones
     * in the response.
     */
    CurrentTime = 'current_time',

    /**
     * Crofty will embed information about the next race and its start time
     * across all U.S. timezones in the response.
     */
    RaceTime = 'race_time'
}

/**
 * Enumeration of Crofty's word matching pattern criteria.
 */
export enum ChatPatternMatch {

    /**
     * Crofty will use this pattern if any one of its multi-word keywords are
     * matched, or if any single keyword is matched.
     */
    Any = 'any',

    /**
     * Crofty will use this pattern if any one of its multi-word keywords are
     * matched, or if more than one of its keywords are matched.
     */
    Multiple = 'multiple'
}

/**
 * Interface contract of an object containing configurations for Crofty's race
 * thread auto-creation functionality.
 */
export interface IConfigAutoThreads {
    advanceDays: number;
}

/**
 * Interface contract of an object containing a single, contextual configuration
 * for Crofty's basic fuzzy-matched chat functionality.
 */
export interface IConfigChatPattern {
    embeds: ChatEmbeds[];
    keywordMatch: ChatPatternMatch;
    keywords: string[];
    fallbacks: string[];
    responses: string[];
}

/**
 * Interface contract of an object containing configuration for Crofty's basic
 * fuzzy-matched chat functionality.
 */
export interface IConfigChat {
    fallback: string;
    patterns: IConfigChatPattern[];
}

/**
 * Interface contract of an object containing configuration for commonly used
 * static links.
 */
export interface IConfigLinks {
    dotd: string;
    espn: string;
    f1tv: string;
}

/**
 * Interface contract of an object containing configuration one of Crofty's
 * news sources.
 */
export interface IConfigNewsSource {
    name: string;
    dateType: DateType;
    homepage: string;
    rssFeed: string;
}

/**
 * Interface contract of an object containing configuration of Crofty's automatic
 * news reporting.
 */
export interface IConfigNews {
    refreshHours: number;
    sources: IConfigNewsSource[];
}

/**
 * Interface contract of an object containing the parsed, non-sensitive
 * configuration of Crofty as read from the `crofty.json` file.
 */
export interface IConfig {
    autoThreads: IConfigAutoThreads;
    chat: IConfigChat;
    links: IConfigLinks;
    news: IConfigNews;
    statuses: ActivitiesOptions[];
}

/**
 * Object containing the parsed, non-sensitive configuration of Crofty as read
 * from the `crofty.json` file.
 */
export class Config implements IConfig {

    /**
     * Relative path to Crofty's non-sensitive configuration file.
     */
    private static filePath: string = '../../crofty.json';

    /**
     * Configuration of Crofty's race thread auto-creation functionality.
     */
    public readonly autoThreads: IConfigAutoThreads = {
        advanceDays: 4
    }

    /**
     * Configuration of Crofty's chat functionality.
     */
    public readonly chat: IConfigChat = {
        fallback: 'Something has gone horribly, horribly wrong.',
        patterns: []
    }

    /**
     * Configuration of Crofty's commonly-used static links.
     */
    public readonly links: IConfigLinks = {
        dotd: '#',
        espn: '#',
        f1tv: '#'
    }

    /**
     * Configuration of Crofty's automatic news reporting.
     */
    public readonly news: IConfigNews = {
        refreshHours: 24,
        sources: []
    }

    /**
     * Collection of Crofty's auto-rotating Discord statuses.
     */
    public readonly statuses: ActivitiesOptions[] = [];

    /**
     * Constructs and parses Crofty's non-sensitive configuration from the local
     * file system.
     */
    constructor() {
        const filePath = new URL( Config.filePath, import.meta.url );
        if ( !fileExistsSync( filePath ))
            throw new Error( `Expected file at "${filePath}"; not found.` );

        const data = readFileSync( filePath, 'utf8' );
        const json: IConfig = JSON.parse( data );

        this.autoThreads = json.autoThreads;
        this.chat = json.chat;
        this.links = json.links;
        this.news = json.news;
        this.statuses = json.statuses;
    }
}

/**
 * Singleton instance of Crofty's non-sensitive configuration.
 */
export const config = new Config();
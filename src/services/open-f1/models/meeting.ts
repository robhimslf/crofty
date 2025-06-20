import { DateTime } from 'luxon';
import {
    type F1Session,
    type OpenF1Session,
    parseF1Sessions
} from './session.js';

/**
 * Object model of properties of a Grand Prix or testing weekend, and typically
 * includes multiple sessions (e.g., practice, qualifying, race, etc.).
 * 
 * See {@link https://openf1.org/?javascript#meetings}
 */
export type OpenF1Meeting = {

    /**
     * Unique identifier of the circuit at which the event takes place.
     * 
     * *OpenF1 API-generated identifier; not particularly useful.*
     */
    readonly circuit_key: number;

    /**
     * Short name of the circuit at which the event takes place.
     */
    readonly circuit_short_name: string;

    /**
     * The three-letter ISO 3166-1 Alpha-3 country code of the country in which
     * the event takes place.
     */
    readonly country_code: string;

    /**
     * Unique identifier of the country in which the event takes place.
     * 
     * *OpenF1 API-generated identifier; not particularly useful.*
     */
    readonly country_key: number;

    /**
     * Full name of the country in which the event takes place.
     */
    readonly country_name: string;

    /**
     * Starting UTC date and time of the event in ISO 8601 format.
     */
    readonly date_start: string;

    /**
     * Difference in hours and minutes between the local time of the event and
     * Greenwich Mean Time (GMT).
     */
    readonly gmt_offset: string;

    /**
     * City or geographical location at which the event takes place.
     */
    readonly location: string;

    /**
     * Unique identifier of the meeting.
     * 
     * * *OpenF1 API-generated identifier; not particularly useful.*
     */
    readonly meeting_key: number;

    /**
     * Name of the meeting in colloquial form (e.g., "Australian Grand Prix").
     */
    readonly meeting_name: string;

    /**
     * Official name of the meeting (e.g., "FORMULA 1 SINGAPORE AIRLINES SINGAPORE
     * GRAND PRIX 2025").
     */
    readonly meeting_official_name: string;

    /**
     * 4-digit year in which the event takes place.
     */
    readonly year: number;
};

/**
 * Object model of request parameters for querying meetings.
 */
export type OpenF1MeetingQuery = {

    /**
     * Query by the circuit key.
     */
    circuit_key?: number;

    /**
     * Query by the circuit name.
     */
    circuit_short_name?: string;

    /**
     * Query by the country code.
     */
    country_code?: string;

    /**
     * Query by the country key.
     */
    country_key?: number;

    /**
     * Query by the country name.
     */
    country_name?: string;

    /**
     * Query by location.
     */
    location?: string;

    /**
     * Query by the meeting key.
     */
    meeting_key?: number;

    /**
     * Query by the meeting name.
     */
    meeting_name?: string;

    /**
     * Query by the meeting official name.
     */
    meeting_official_name?: string;

    /**
     * Query by the year in which the event takes place.
     */
    year?: number;
};

/**
 * Object model of properties of a Grand Prix or testing weekend, and typically
 * includes multiple sessions (e.g., practice, qualifying, race, etc.) as parsed
 * from an {@link OpenF1Meeting} object.
 */
export type F1Meeting = {

    /**
     * Name of the circuit at which the session takes place.
     */
    circuitName: string;

    /**
     * Name of the country in which the session takes place.
     */
    countryName: string;

    /**
     * Starting UTC date and time of the event in ISO 8601 format.
     */
    dateStart: DateTime;

    /**
     * City or geographical location at which the event takes place.
     */
    location: string;

    /**
     * Name of the meeting in colloquial form (e.g., "Australian Grand Prix").
     */
    name: string;

    /**
     * Official name of the meeting (e.g., "FORMULA 1 SINGAPORE AIRLINES SINGAPORE
     * GRAND PRIX 2025").
     */
    officialName: string;

    /**
     * 4-digit year in which the event takes place.
     */
    year: number;

    /**
     * Collection of sessions that are part of the event.
     */
    sessions: F1Session[];
};

/**
 * Converts an {@link OpenF1Meeting} object into an instance of {@link F1Meeting},
 * and optionally includes parsing a collection of associated {@link OpenF1Session}s.
 * 
 * *Note: `sessions` should already be filtered to only include those that are
 * relevant to the meeting.*
 * 
 * @param data 
 * @param sessions 
 * @returns 
 */
export function parseF1Meeting(
    data: OpenF1Meeting,
    sessions: OpenF1Session[] = [] ): F1Meeting {

    return {
        circuitName: data.circuit_short_name,
        countryName: data.country_name,
        dateStart: DateTime.fromISO( data.date_start ),
        location: data.location,
        name: data.meeting_name,
        officialName: data.meeting_official_name,
        year: data.year,
        sessions: parseF1Sessions( sessions )
    };
}

/**
 * Parses a collection of {@link OpenF1Meeting} objects into an array of
 * {@link F1Meeting} objects, including associated sessions.
 * 
 * @param data 
 * @param sessions 
 * @returns 
 */
export function parseF1Meetings(
    data: OpenF1Meeting[],
    sessions: OpenF1Session[] = [] ): F1Meeting[] {
    
    // Create a mapping of meeting keys to sessions.
    const sessionMap = new Map<number, OpenF1Session[]>();
    for ( const session of sessions ) {
        const key = session.meeting_key;
        if ( !sessionMap.has( key ))
            sessionMap.set( key, [] );
        sessionMap.get( key )!.push( session );
    }

    return data.map( meeting => {
        const msessions = sessionMap.get( meeting.meeting_key ) || [];
        return parseF1Meeting( meeting, msessions );
    });
}

import { DateTime } from 'luxon';

/**
 * Object model of properties of a track session within a Grand Prix or testing
 * weekend.
 * 
 * See {@link https://openf1.org/?javascript#sessions}
 */
export type OpenF1Session = {

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
     * Ending UTC date and time of the event in ISO 8601 format.
     */
    readonly date_end: string;

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
     * *OpenF1 API-generated identifier; not particularly useful.*
     */
    readonly meeting_key: number;

    /**
     * Unique identifier of the session.
     * 
     * *OpenF1 API-generated identifier; not particularly useful.*
     */
    readonly session_key: number;

    /**
     * Name of the session (e.g., "Practice 1", "Qualifying", etc.).
     */
    readonly session_name: string;

    /**
     * Type of the session (e.g., "Practice", "Qualifying", "Race", etc.).
     */
    readonly session_type: string;

    /**
     * 4-digit year in which the event takes place.
     */
    readonly year: number;
};

/**
 * Object model of request parameters for querying track sessions.
 */
export type OpenF1SessionQuery = {

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
     * Query by the session key.
     */
    session_key?: number;

    /**
     * Query by the session name.
     */
    session_name?: string;

    /**
     * Query by the session type.
     */
    session_type?: string;

    /**
     * Query by the year.
     */
    year?: number;
};

/**
 * Object model of properties of a track session within a Grand Prix or testing
 * weekend as parsed from an {@link OpenF1Session} object.
 */
export type F1Session = {

    /**
     * Name of the circuit at which the session takes place.
     */
    circuitName: string;

    /**
     * Name of the country in which the session takes place.
     */
    countryName: string;

    /**
     * Ending UTC date and time of the event in ISO 8601 format.
     */
    dateEnd: DateTime;

    /**
     * Starting UTC date and time of the event in ISO 8601 format.
     */
    dateStart: DateTime;

    /**
     * City or geographical location at which the event takes place.
     */
    location: string;

    /**
     * Name of the session (e.g., "Practice 1", "Qualifying", etc.).
     */
    name: string;

    /**
     * Type of the session (e.g., "Practice", "Qualifying", "Race", etc.).
     */
    type: string;

    /**
     * 4-digit year in which the event takes place.
     */
    year: number;
};

/**
 * Converts an {@link OpenF1Session} object to an instance of {@link F1Session}.
 * 
 * @param data 
 * @returns 
 */
export function parseF1Session( data: OpenF1Session ): F1Session {
    return {
        circuitName: data.circuit_short_name,
        countryName: data.country_name,
        dateEnd: DateTime.fromISO( data.date_end, { zone: 'utc' }),
        dateStart: DateTime.fromISO( data.date_start, { zone: 'utc' }),
        location: data.location,
        name: data.session_name,
        type: data.session_type,
        year: data.year
    };
}

/**
 * Parses a collection of {@link OpenF1Session} objects into an array of
 * {@link F1Session} objects.
 * 
 * @param data 
 * @returns 
 */
export function parseF1Sessions( data: OpenF1Session[] ): F1Session[] {
    return data.map( parseF1Session );
}

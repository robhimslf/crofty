import { DateTime } from 'luxon';

/**
 * Defines a type for string-based date values that Crofty is prepared to parse.
 */
export type DateType = 'rfc2822' | 'http' | 'iso';

/**
 * Enumeration of UTC offsets to their IASA time zone lookups.
 */
export enum TimeZoneOffset {

    /**
     * Offset is UTC-10; Honolulu, HI.
     */
    HAST = 'Pacific/Honolulu',

    /**
     * Offset is UTC-8; Anchorage, AK.
     */
    AST = 'America/Anchorage',

    /**
     * Offset is UTC-7; Los Angeles, CA.
     */
    PST = 'America/Los_Angeles',

    /**
     * Offset is UTC-6; Denver, CO.
     */
    MST = 'America/Denver',

    /**
     * Offset is UTC-5; Chicago, IL.
     */
    CST = 'America/Chicago',

    /**
     * Offset is UTC-4; New York, NY.
     */
    EST = 'America/New_York'
}

/**
 * Collection of city-to-time zone mappings to which Crofty will report the current
 * and race times, localized.
 */
export const UnitedStatesTimeZones = [
    { city: 'Honolulu', zone: TimeZoneOffset.HAST },
    { city: 'Anchorage', zone: TimeZoneOffset.AST },
    { city: 'Los Angeles', zone: TimeZoneOffset.PST },
    { city: 'Denver', zone: TimeZoneOffset.MST },
    { city: 'Chicago', zone: TimeZoneOffset.CST },
    { city: 'New York', zone: TimeZoneOffset.EST },
];

/**
 * Fetches the city associated with a given time zone offset; requires that the
 * offset is supported by Crofty.
 * 
 * @param {TimeZoneOffset} tz 
 * @returns {string | undefined}
 */
export const cityFromTimeZone = ( tz: TimeZoneOffset ): string | undefined =>
    UnitedStatesTimeZones.find( ustz => ustz.zone === tz )?.city;

/**
 * Simple helper method to convert one time to another by time zone.
 * 
 * @param {DateTime} dt 
 * @param {TimeZoneOffset} to 
 * @returns {DateTime}
 */
export const convertTimeToZone = ( dt: DateTime, to: TimeZoneOffset ): DateTime =>
    dt.setZone( to );

/**
 * Simple helper method convert a string-based timestamp to an instance of
 * DateTime.
 * 
 * Used primarily by the `NewsCronTask`.
 * 
 * @param {string} value 
 * @param {DateType} format 
 * @returns {DateTime}
 */
export const convertToDateTime = ( value: string, format: DateType ): DateTime => {
    let result: DateTime;

    switch ( format ) {
        case 'http':
            result = DateTime.fromHTTP( value );
            break;

        case 'rfc2822':
            result = DateTime.fromRFC2822( value );
            break;

        case 'iso':
        default:
            result = DateTime.fromISO( value );
            break;
    }

    return result;
}
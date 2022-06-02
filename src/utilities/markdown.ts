import { DateTime, DateTimeFormatOptions } from 'luxon';
import * as constants from './constants.js';
import {
    IF1Circuit,
    IF1Constructor,
    IF1Driver,
    IF1Event,
    IF1RaceResult
} from '../api/index.js';

/**
 * Prepares a Formula 1 championship's name for use in a Markdown-based response
 * by Crofty. Allows for the optional inclusion of the championship's Wikipedia
 * link.
 * 
 * Examples:
 * - **Plain:** `2022 Formula 1 World Championship`
 * - **Constructors:** `2010 Formula 1 World Constructors' Championship`
 * - **Drivers:** `2021 Formula 1 World Drivers' Championship`
 * - **Link:** `[1951 Formula 1 World Championship](https://...)`
 * 
 * @param {string} season 
 * @param {boolean} drivers 
 * @param {boolean} constructors 
 * @param {boolean} withLink 
 * @returns {string}
 */
export function formatF1ChampionshipName(
    season: string,
    drivers: boolean = false,
    constructors: boolean = false,
    withLink: boolean = false ): string {
    
    let name = `${season} `;
    if ( constructors )
        name += constants.Strings.F1WorldConstructorsChampionship;
    else if ( drivers )
        name += constants.Strings.F1WorldDriversChampionship;
    else
        name += constants.Strings.F1WorldChampionship;

    const link = 'https://wikipedia.com';

    return ( withLink )
        ? `[${name}](${link})`
        : name;
}

/**
 * Prepares a Formula 1 circuit's name for use in a Markdown-based response by
 * Crofty. Allows for the optional inclusion of the circuit's locale (city and
 * country), along with the circuit's Wikipedia link and whether to force the
 * shortened version of that link.
 * 
 * Examples:
 * - **Plain:** `Circuit de Monaco`
 * - **Locale:** `Circuit de Monaco in Monte-Carlo, Monaco`
 * - **Link:** `[Circuit de Monaco](https://...)`
 * - **Kitchen Sink:** `[Circuit de Monaco](https://...) in Monte-Carlo, Monaco`
 * 
 * @param {IF1Circuit} value 
 * @param {boolean} withLocale 
 * @param {boolean} withLink 
 * @param {boolean} forceShortLink 
 * @returns {string}
 */
export function formatF1CircuitName(
    value: IF1Circuit,
    withLocale: boolean = false,
    withLink: boolean = false,
    forceShortLink: boolean = false ): string {
    
    const name = value.circuitName;
    const link = ( forceShortLink )
        ? value.shortUrl || ''
        : value.shortUrl || value.url;
    const locale = ( withLocale )
        ? `in ${value.Location.locality}, ${value.Location.country}`
        : '';

    return ( withLink )
        ? `[${name}](${link}) ${locale}`.trim()
        : `${name} ${locale}`.trim();
}

/**
 * Prepares a Formula 1 constructor's name for use in a Markdown-based response by
 * Crofty. Allows for the optional inclusion of the constructor's Wikipedia link
 * and whether to force the shortened version of that link.
 * 
 * Examples:
 * - **Plain:** `Red Bull Racing`
 * - **Link:** `[Red Bull Racing](https://...)`
 * 
 * @param {IF1Constructor} value 
 * @param {boolean} withLink 
 * @param {boolean} forceShortLink 
 * @returns {string}
 */
export function formatF1ConstructorName(
    value: IF1Constructor,
    withLink: boolean = false,
    forceShortLink: boolean = false ): string {
    
    const name = value.name;
    const link = ( forceShortLink )
        ? value.shortUrl || ''
        : value.shortUrl || value.url;

    return ( withLink )
        ? `[${name}](${link})`
        : name;
}

/**
 * Prepares a Formula 1 driver's name for use in a Markdown-based response by
 * Crofty. Allows for the optional inclusion of the driver's Wikipedia link and
 * whether to force the shortened version of that link.
 * 
 * Examples:
 * - **Plain:** `Max Verstappen`
 * - **Link:** `[Max Verstappen](https://...)`
 * 
 * @param {IF1Driver} value 
 * @param {boolean} withLink 
 * @param {boolean} forceShortLink 
 * @returns {string}
 */
export function formatF1DriverName(
    value: IF1Driver,
    withLink: boolean = false,
    forceShortLink: boolean = false ): string {
    
    const first = value.givenName;
    const last = value.familyName;
    const name = `${first} ${last}`;
    const link = ( forceShortLink )
        ? value.shortUrl || ''
        : value.shortUrl || value.url;

    return ( withLink )
        ? `[${name}](${link})`
        : name;
}

/**
 * Prepares a Formula 1 event date for use in a Markdown-based response by
 * Crofty.
 * 
 * @param {IF1Event} value 
 * @param {DateTimeFormatOptions} format 
 * @returns {string}
 */
export function formatF1EventDate(
    value: IF1Event,
    format: DateTimeFormatOptions = DateTime.DATE_HUGE ): string {
    
    const str = ( value.time )
        ? `${value.date}T${value.time}`
        : value.date;
    const date = DateTime.fromISO( str, { zone: 'UTC' });

    return date.toLocaleString( format );
}

/**
 * Prepares a Formula 1 event name for use in a Markdown-based response by
 * Crofty. Allows for the optional inclusion of the event's round ordinal within
 * the associated season, along with the event's Wikipedia link and whether to
 * force the shortened version of that link.
 * 
 * Examples:
 * - **Plain:** `Monaco Grand Prix`
 * - **Round:** `7. Monaco Grand Prix`
 * - **Link:** `[Monaco Grand Prix](https://...)`
 * - **Kitchen Sink:** `7. [Monaco Grand Prix](https://...)`
 * 
 * @param {IF1Event} value 
 * @param {boolean} withRound 
 * @param {boolean} withLink 
 * @param {boolean} forceShortLink 
 * @returns {string}
 */
export function formatF1EventName(
    value: IF1Event,
    withRound: boolean = false,
    withLink: boolean = false,
    forceShortLink: boolean = false ): string {
    
    const name = value.raceName;
    const link = ( forceShortLink )
        ? value.shortUrl || ''
        : value.shortUrl || value.url;
    const round = ( withRound )
        ? `${value.round}.`
        : '';

    return ( withLink )
        ? `${round} [${name}](${link})`.trim()
        : `${round} ${name}`.trim();
}

/**
 * Prepares a Formula 1 race result for use in a Markdown-based response by
 * Crofty. Allows for the optional inclusion of fastest lap denotation.
 * 
 * Examples:
 * - **Plain:** `7`
 * - **Plain (DNF):** `*DNF*`
 * - **Denotations:** `3🔸`
 * 
 * @param {IF1RaceResult} value 
 * @param {boolean} withDenotations 
 * @returns {string}
 */
export function formatF1RaceFinish(
    value: IF1RaceResult,
    withDenotations: boolean = true ): string {

    let result = `*${constants.Strings.DidNotFinish}*`,
        denotation = '';

    // Position text must be a number, and the status must be `Finished` or
    // its first character must be `+`.
    if ( +value.positionText !== NaN &&
        ( value.status === 'Finished' || value.status[ 0 ] === '+' ))
        result = value.positionText;

    // Denotation: fastest lap.
    if ( withDenotations &&
        value.FastestLap &&
        +value.FastestLap.rank !== NaN &&
        Number( value.FastestLap.rank ) === 1 )
        denotation = constants.Strings.SymbolFastestLap;

    return `${result}${denotation}`.trim();
}

/**
 * Prepares a Formula 1 race result time for use in a Markdown-based response by
 * Crofty. Allows for the optional inclusion of fastest lap denotation.
 * 
 * Examples:
 * - **Plain:** `1:58:17` (1 hour, 58 minutes, 17 seconds)
 * - **Plain (DNF):** `*DNF*`
 * - **Plain (Lapped):** `+2 Laps`
 * - **Denotations:** `1:58:10🔸`
 * 
 * @param {IF1RaceResult} value 
 * @param {boolean} withDenotations 
 * @returns {string}
 */
export function formatF1RaceTime(
    value: IF1RaceResult,
    withDenotations: boolean = true ): string {

    let result = `*${constants.Strings.DidNotFinish}*`,
        denotation = '';

    // Position text must be a number before we consider parsing the race time.
    if ( +value.positionText !== NaN ) {
        
        // If the driver was lapped...
        if ( value.status[ 0 ] === '+' )
            result = value.status;

        // Otherwise, use the time.
        else if ( value.Time )
            result = value.Time.time;
    }

    // Denotation: fastest lap.
    if ( withDenotations &&
        value.FastestLap &&
        +value.FastestLap.rank !== NaN &&
        Number( value.FastestLap.rank ) === 1 )
        denotation = constants.Strings.SymbolFastestLap;

    return `${result}${denotation}`.trim();
}

/**
 * Fetches a nation's unicode flag character for use in a Markdown-based response
 * by Crofty, if recognized.
 * 
 * @param {string} nation 
 * @returns {string | undefined}
 */
export function getNationFlag( nation: string ): string | undefined {
    return ( Object.keys( constants.NationFlagUnicode ).includes( nation ))
        ? ( constants.NationFlagUnicode as any )[ nation ]
        : undefined;
}

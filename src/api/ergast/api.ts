import fetch from 'node-fetch';
import { DateTime } from 'luxon';
import { F1Round, F1Season } from '../../utilities/index.js';
import {
    IF1ConstructorStandings,
    IF1ConstructorStandingsResponse,
    IF1DriverStandings,
    IF1DriverStandingsResponse,
    IF1QualifyingEvent,
    IF1QualifyingEventResponse,
    IF1RaceEvent,
    IF1RaceEventResponse,
    IF1ScheduledEvent,
    IF1ScheduledEventResponse
} from './types.js';

/**
 * Service providing access to current and historical Formula 1 data using the
 * Ergast API.
 */
export class ErgastAPI {

    /**
     * API URL prefix.
     */
    private static ApiBase = 'http://ergast.com/api/f1';

    /**
     * Fetches results of a Formula 1 World Constructors' Championship by season.
     * 
     * @param {F1Season} season 
     * @returns {Promise<IF1ConstructorStandings | undefined>}
     */
    public async getConstructorSeasonStandings( season: F1Season )
        : Promise<IF1ConstructorStandings | undefined> {
        
        const response = await this.call<IF1ConstructorStandingsResponse>(
            `${season}/constructorStandings` );
        
        return ( response && response.MRData.StandingsTable.StandingsLists.length > 0 )
            ? response.MRData.StandingsTable.StandingsLists[ 0 ]
            : undefined;
    }

    /**
     * Fetches qualifying results of a Formula 1 driver by season and name.
     * 
     * @param {F1Season} season 
     * @param {string} driver 
     * @returns {Promise<IF1QualifyingEvent[]>}
     */
    public async getDriverSeasonQuali( season: F1Season, driver: string )
        : Promise<IF1QualifyingEvent[]> {
        
        const response = await this.call<IF1QualifyingEventResponse>(
            `${season}/drivers/${driver}/qualifying` );

        return ( response && response.MRData.RaceTable.Races )
            ? response.MRData.RaceTable.Races
            : [];
    }

    /**
     * Fetches race results of a Formula 1 driver by season and name.
     * 
     * @param {F1Season} season 
     * @param {string} driver 
     * @returns {Promise<IF1RaceEvent[]>}
     */
    public async getDriverSeasonResults( season: F1Season, driver: string )
        : Promise<IF1RaceEvent[]> {
        
        const response = await this.call<IF1RaceEventResponse>(
            `${season}/drivers/${driver}/results` );

        return ( response && response.MRData.RaceTable.Races )
            ? response.MRData.RaceTable.Races
            : [];
    }

    /**
     * Fetches results of a Formula 1 World Drivers' Championship by season.
     * 
     * @param {F1Season} season 
     * @returns {Promise<IF1DriverStandings | undefined>}
     */
    public async getDriverSeasonStandings( season: F1Season )
        : Promise<IF1DriverStandings | undefined> {
        
        const response = await this.call<IF1DriverStandingsResponse>(
            `${season}/driverStandings` );
        
        return ( response && response.MRData.StandingsTable.StandingsLists.length > 0 )
            ? response.MRData.StandingsTable.StandingsLists[ 0 ]
            : undefined;
    }

    /**
     * Fetches pole position results of a Formula 1 season.
     * 
     * @param {F1Season} season 
     * @returns {Promise<IF1QualifyingEvent[]>}
     */
    public async getPoleSeasonResults( season: F1Season )
        : Promise<IF1QualifyingEvent[]> {
        
        const response = await this.call<IF1QualifyingEventResponse>(
            `${season}/qualifying/1` );

        return ( response && response.MRData.RaceTable.Races )
            ? response.MRData.RaceTable.Races
            : [];
    }

    /**
     * Fetches results of a Formula 1 qualifying by season and round.
     * 
     * @param {F1Season} season 
     * @param {F1Round} round 
     * @returns {Promise<IF1QualifyingEvent | undefined>}
     */
    public async getQualifyingResult( season: F1Season, round: F1Round )
        : Promise<IF1QualifyingEvent | undefined> {
        
        const response = await this.call<IF1QualifyingEventResponse>(
            `${season}/${round}/qualifying` );
        
        return ( response && response.MRData.RaceTable.Races )
            ? response.MRData.RaceTable.Races[ 0 ]
            : undefined;
    }

    /**
     * Fetches results of a Formula 1 race event by season and round.
     * 
     * @param {F1Season} season 
     * @param {F1Round} round 
     * @returns {Promise<IF1RaceEvent | undefined>}
     */
    public async getRaceResult( season: F1Season, round: F1Round )
        : Promise<IF1RaceEvent | undefined> {
        
        const response = await this.call<IF1RaceEventResponse>(
            `${season}/${round}/results` );
        
        return ( response && response.MRData.RaceTable.Races )
            ? response.MRData.RaceTable.Races[ 0 ]
            : undefined;
    }

    /**
     * Fetches a collection of Formula 1 race events by season.
     * 
     * @param {F1Season} season 
     * @returns {Promise<IF1ScheduledEvent[]>}
     */
    public async getScheduledEvents( season: F1Season ): Promise<IF1ScheduledEvent[]> {
        const response = await this.call<IF1ScheduledEventResponse>( `${season}` );

        return ( response && response.MRData.RaceTable.Races )
            ? response.MRData.RaceTable.Races
            : [];
    }

    /**
     * Fetches a collection of Formula 1 race events for the current calendar
     * year with full date-time parsing, and sorted in descending order.
     * 
     * @returns {Promise<IF1ScheduledEvent[]>}
     */
    public async getUpcomingEvents(): Promise<IF1ScheduledEvent[]> {
        const now = DateTime.utc();
        const upcoming = await this.getScheduledEvents( now.year );

        return upcoming
            .map( u => {
                const d = ( u.time )
                    ? `${u.date}T${u.time}`
                    : u.date;
                u.dateTime = DateTime.fromISO( d, { zone: 'UTC' });
                return u;
            })
            .sort(( a, b ) =>
                a.dateTime!.toMillis() - b.dateTime!.toMillis() );
    }

    /**
     * Fetches pole position results of a Formula 1 season.
     * 
     * @param {F1Season} season 
     * @returns {Promise<IF1RaceEvent[]>}
     */
    public async getWinSeasonResults( season: F1Season )
        : Promise<IF1RaceEvent[]> {
        
        const response = await this.call<IF1RaceEventResponse>(
            `${season}/results/1` );

        return ( response && response.MRData.RaceTable.Races )
            ? response.MRData.RaceTable.Races
            : [];
    }

    /**
     * Calls the Ergast Formula 1 API, returning the strongly-typed response
     * body if valid.
     * 
     * @param {string} url 
     * @returns {Promise<T | undefined>}
     */
    private async call<T>( url: string ): Promise<T | undefined> {
        let result: T | undefined;

        try {
            url = `${ErgastAPI.ApiBase}/${url}.json`;

            const response = await fetch( url );
            const json: any = await response.json();
            result = json as T;
        } catch ( err ) {
            console.warn( `🛑 Failed calling "${url}".`, err );
        }

        return result;
    }
}

/**
 * Singleton instance of the Formula 1 API using Ergast.
 */
export const ergastAPI = new ErgastAPI();
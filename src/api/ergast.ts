import { DateTime } from 'luxon';
import fetch from 'node-fetch';

/**
 * Seasonal parameter type when requesting qualifying or race results.
 */
export type F1Season = 'current' | number;

 /**
  * Round parameter type when requesting qualifying or race results.
  */
export type F1Round = 'last' | number;

/**
 * Interface contract of a response object containing geographic location details
 * of a Formula 1 circuit.
 */
export interface IF1CircuitLocation {
    lat: string;
    long: string;
    locality: string;
    country: string;
}

/**
 * Interface contract of a response object containing details of a Formula 1
 * circuit.
 */
export interface IF1Circuit {
    circuitId: string;
    url: string;
    shortUrl?: string;
    circuitName: string;
    Location: IF1CircuitLocation;
}

/**
 * Interface contract of a response object containing base details of a Formula
 * 1 constructor (team).
 */
export interface IF1Constructor {
    constructorId: string;
    url: string;
    shortUrl?: string;
    name: string;
    nationality: string;
}

/**
 * Interface contract of a response object containing a seasonal standing result
 * of a Formula 1 constructor (team).
 */
export interface IF1ConstructorStanding extends IF1SeasonStanding {
    Constructor: IF1Constructor;
}

/**
 * Interface contract of a response object containing seasonal standing results
 * of Formula 1 constructors (teams).
 */
export interface IF1ConstructorStandings {
    season: string;
    ConstructorStandings: IF1ConstructorStanding[];
}

/**
 * Interface contract of a response containing seasonal standing results of
 * Formula 1 constructors (teams).
 */
export interface IF1ConstructorStandingsResponse {
    MRData: {
        StandingsTable: {
            season: string;
            StandingsLists: IF1ConstructorStandings[];
        };
    };
}

/**
 * Interface contract of a response object containing base details of a Formula
 * 1 driver.
 */
export interface IF1Driver {
    driverId: string;
    permanentNumber: string;
    code: string;
    url: string;
    shortUrl?: string;
    givenName: string;
    familyName: string;
    dateOfBirth: string;
    nationality: string;
}

/**
 * Interface contract of a response object containing a seasonal standing result
 * of a Formula 1 driver.
 */
export interface IF1DriverStanding extends IF1SeasonStanding {
    Driver: IF1Driver;
    Constructors: IF1Constructor[];
}

/**
 * Interface contract of a response object containing seasonal standing results
 * Formula 1 drivers.
 */
export interface IF1DriverStandings {
    season: string;
    DriverStandings: IF1DriverStanding[];
}

/**
 * Interface contract of a response containing seasonal standing results of
 * Formula 1 drivers.
 */
export interface IF1DriverStandingsResponse {
    MRData: {
        StandingsTable: {
            season: string;
            StandingsLists: IF1DriverStandings[];
        };
    };
}

/**
 * Interface contract of a response object containing base details of a Formula
 * 1 event.
 */
export interface IF1Event {
    season: string;
    round: number;
    url: string;
    shortUrl?: string;
    raceName: string;
    Circuit: IF1Circuit;
    date: string;
    time?: string;
    dateTime?: DateTime;
}

/**
 * Interface contract of a response object containing base details of a Formula
 * 1 event.
 */
export interface IF1EventResult {
    number: string;
    position: number;
    Driver: IF1Driver;
    Constructor: IF1Constructor;
}

/**
 * Interface contract of a response object containing details of a Formula 1
 * event's fastest lap.
 */
export interface IF1FastestLap {
    rank: string;
    lap: string;
    Time: IF1TimeValue;
    AverageSpeed: IF1SpeedValue;
}

/**
 * Interface contract of a response object containing details of a Formula 1
 * qualifying event.
 */
export interface IF1QualifyingEvent extends IF1Event {
    QualifyingResults: IF1QualifyingResult[];
}

/**
 * Interface contract of a response containing details of a Formula 1 qualifying
 * event.
 */
export interface IF1QualifyingEventResponse {
    MRData: {
        RaceTable: {
            season: string;
            round: string;
            Races: IF1QualifyingEvent[];
        };
    };
}

/**
 * Interface contract of a response object containing details of a Formula 1
 * qualifying result.
 */
export interface IF1QualifyingResult extends IF1EventResult {
    Q1: string;
    Q2?: string;
    Q3?: string;
}

/**
 * Interface contract of a response object containing details of a Formula 1
 * race event.
 */
export interface IF1RaceEvent extends IF1Event {
    Results: IF1RaceResult[];
}

/**
 * Interface contract of a response containing details of a Formula 1 race event.
 */
export interface IF1RaceEventResponse {
    MRData: {
        RaceTable: {
            season: string;
            round: string;
            Races: IF1RaceEvent[];
        };
    };
}

/**
 * Interface contract of a response object containing details of a Formula 1
 * race result.
 */
export interface IF1RaceResult extends IF1EventResult {
    positionText: string;
    points?: string;
    grid: string;
    laps: string;
    status: string;
    Time?: IF1TimeValue;
    FastestLap?: IF1FastestLap;
}

/**
 * Interface contract of a response object containing details of a scheduled
 * Formula 1 race event.
 */
export interface IF1ScheduledEvent extends IF1Event { }

/**
 * Interface contract of a response containing details of a Formula 1 race event.
 */
export interface IF1ScheduledEventResponse {
    MRData: {
        RaceTable: {
            season: string;
            round: string;
            Races: IF1ScheduledEvent[];
        };
    };
}

/**
 * Interface contract of a response object containing a seasonal standing result
 * of a Formula 1 driver or constructor (team).
 */
export interface IF1SeasonStanding {
    position: number;
    positionText: string;
    points: string;
    wins: string;
}

/**
 * Interface contract of a response object containing a parsed speed value for
 * a Formula 1 race event entrant.
 */
export interface IF1SpeedValue {
    units: string;
    speed: string;
}

/**
 * Interface contract of a response object containing a parsed time value for
 * a Formula 1 race event entrant.
 */
export interface IF1TimeValue {
    millis?: string;
    time: string;
}

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
     * Fetches results of a Formula 1 driver by season and name.
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
import { DateTime } from 'luxon';

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
 * Defines interface instance-check functions for Formula 1 response objects
 * returned by the Ergast API.
 */
export const isF1ObjectInstanceOf = {

    /**
     * Whether this object is an instance of `IF1ConstructorStanding`.
     * 
     * @param {any} obj 
     * @returns {boolean}
     */
    constructorStanding: function( obj: any )
        : obj is IF1ConstructorStanding {
        return 'Constructor' in obj;
    },

    /**
     * Whether this object is an instance of `IF1DriverStanding`.
     * 
     * @param {any} obj 
     * @returns {boolean}
     */
    driverStanding: function( obj: any )
        : obj is IF1DriverStanding {
        return 'Constructors' in obj;
    },

    /**
     * Whether this object is an instance of `IF1EventResult`.
     * 
     * @param {any} obj 
     * @returns {boolean}
     */
    eventResult: function( obj: any )
        : obj is IF1EventResult {
        return (
            'Driver' in obj &&
            'Constructor' in obj
        );
    },

    /**
     * Whether this object is an instance of `IF1QualifyingEvent`.
     * 
     * @param {any} obj 
     * @returns {boolean}
     */
    qualifyingEvent: function( obj: any )
        : obj is IF1QualifyingEvent {
        return 'QualifyingResults' in obj;
    },

    /**
     * Whether this object is an instance of `IF1RaceEvent`.
     * 
     * @param {any} obj 
     * @returns {boolean}
     */
    raceEvent: function( obj: any )
        : obj is IF1RaceEvent {
        return 'Circuit' in obj;
    }
};
import type {
    F1ShortLinkType,
    F1WikiLinkType,
    IF1Constructor,
    IF1ConstructorStanding,
    IF1DriverStanding,
    IF1EventResult,
    IF1QualifyingEvent,
    IF1QualifyingResult,
    IF1RaceEvent,
    IF1RaceResult,
    IF1WikiLink
} from '../api/index.js';
import {
    DynamicLinksAPI,
    FirestoreAPI,
    isF1ObjectInstanceOf
} from '../api/index.js';
import { batchize, delay } from './helpers.js';

/**
 * Interface contract of a pre-resolved parsing result.
 * 
 * `items` will contain the new collection of unresolved items that need further
 * type-parsing or shortening.
 * 
 * `results` will contain a collection of resolved items for this parse.
 */
interface IPreResolvedResult {
    items: F1ShortLinkType[];
    results: F1ShortLinkType[];
}

/**
 * Shortens and resolves Wikipedia links within a collection of Formula 1
 * response objects.
 * 
 * @param {F1ShortLinkType[]} items 
 * @returns {Promise<F1ShortLinkType[]>}
 */
export async function shortenLinks( items: F1ShortLinkType[] )
    : Promise<F1ShortLinkType[]> {
    
    let results: F1ShortLinkType[] = [];

    if ( items.length < 1 )
        return results;

    try {

        // Start by fetching everything we already have that's shortened,
        // so we don't unnecessarily shorten it again. When we find any,
        // resolve them into the results.
        const cached = await getCached( items );
        const cachedItems = getResolvedFromCache( items, cached );
        items = cachedItems.items;
        results = results.concat( cachedItems.results );

        // Resolve the previously unresolved.
        const resolved = await createFromUnresolved( items );
        results = results.concat( resolved );
    } catch ( err ) {
        console.warn( `🛑 Failed shortening and resolving Formula 1 links.`, err );
    }

    return results;
}

/**
 * Fetches a collection of links already stored in the database.
 * 
 * @param {F1ShortLinkType[]} items 
 * @returns {Promise<IF1WikiLink[]>}
 */
async function getCached( items: F1ShortLinkType[] ): Promise<IF1WikiLink[]> {
    let results: IF1WikiLink[] = [];

    if ( items.length < 1 )
        return results;

    try {
        let circuits: string[] = [],
            drivers: string[] = [],
            events: string[] = [],
            constructors: string[] = [];

        // Determine the type of items passed; it will only be one of these.
        const item = items[ 0 ];

        // ...IF1QualifyingEvent
        if ( isF1ObjectInstanceOf.qualifyingEvent( item )) {
            circuits = ( items as IF1QualifyingEvent[] )
                .map( i => i.Circuit.url );
            events = ( items as IF1QualifyingEvent[] )
                .map( i => i.url );
        }

        // ...IF1RaceEvent
        else if ( isF1ObjectInstanceOf.raceEvent( item )) {
            circuits = ( items as IF1RaceEvent[] )
                .map( i => i.Circuit.url );
            events = ( items as IF1RaceEvent[] )
                .map( i => i.url );
        }

        // ...IF1EventResult
        else if ( isF1ObjectInstanceOf.eventResult( item )) {
            drivers = ( items as IF1EventResult[] )
                .map( i => i.Driver.url );
            constructors = ( items as IF1EventResult[] )
                .map( i => i.Constructor.url );
        }

        // ...IF1DriverStanding
        else if ( isF1ObjectInstanceOf.driverStanding( item )) {
            drivers = ( items as IF1DriverStanding[] )
                .map( i => i.Driver.url );
            constructors = ( items as IF1DriverStanding[] )
                .reduce<string[]>(( links, current ) => {
                    const ctors = current.Constructors
                        .map( c => c.url );
                    const missing = links
                        .filter( l => ctors.indexOf( l ) < 0 );
                    return links.concat( missing );
                }, [] );
        }

        // ...IF1ConstructorStanding
        else if ( isF1ObjectInstanceOf.constructorStanding( item )) {
            constructors = ( items as IF1ConstructorStanding[] )
                .map( i => i.Constructor.url );
        }

        // Aggregate of all checkable links.
        const links = circuits.concat(
            drivers,
            events,
            constructors );

        // If we're checking more than 10, do it in batches.
        if ( links.length > 10 ) {
            const batches = batchize( links, 10 );

            let cache: IF1WikiLink[] = [];
            for ( let i = 0; i < batches.length; i++ ) {
                const cached = await FirestoreAPI.Instance.getF1WikiLinks( batches[ i ]);
                cache = cache.concat( cached );
            }

            results = cache;
        }

        // 10 or less, we do it all at once.
        else {
            results = await FirestoreAPI.Instance.getF1WikiLinks( links );
        }
    } catch ( err ) {
        console.warn( `🛑 Failed fetching cached shortened links.`, err );
    }

    return results;
}

/**
 * Fetches an existing shortened link from the database if present. Otherwise
 * attempts to shorten the link, persist it to the database, and return the
 * result.
 * 
 * @param {string} url 
 * @param {F1WikiLinkType} type 
 * @returns {Promise<string | undefined>}
 */
async function getCreate( url: string, type: F1WikiLinkType )
    : Promise<string | undefined> {
    
    let result: string | undefined;
    try {
        let cached = await FirestoreAPI.Instance.getF1WikiLink( url );
        if ( !cached ) {
            const shortened = await DynamicLinksAPI.Instance.shorten( url );
            console.log( 'shortened', shortened );
            if ( shortened )
                cached = await FirestoreAPI.Instance.createF1WikiLink( type, url,
                    shortened.shortLink );
        }

        if ( cached )
            result = cached.shortUrl;
    } catch ( err ) {
        console.warn( `🛑 Failed fetching or creating shortened link for "${url}".`, err );
    }

    return result;
}

/**
 * Resolves all shortened links in a collection of objects by fetching a new
 * shortened link from Firebase, persisting it in the database, populating the
 * associated object properties, and returning the resolved collection.
 * 
 * @param {F1ShortLinkType[]} items 
 * @returns {Promise<F1ShortLinkType[]}
 */
async function createFromUnresolved( items: F1ShortLinkType[] ): Promise<F1ShortLinkType[]> {
    let results: F1ShortLinkType[] = [];

    try {
        while ( items.length > 0 ) {

            const batch: Promise<F1ShortLinkType>[] = [];
            for ( let i = 0; i < 5; i++ ) {

                const item = items.pop();
                if ( item ) {

                    // ...IF1QualifyingEvent
                    if ( isF1ObjectInstanceOf.qualifyingEvent( item ))
                        batch.push( createResolvers.qualifyingEventUrls( item as IF1QualifyingEvent ));

                    // ...IF1RaceEvent
                    else if ( isF1ObjectInstanceOf.raceEvent( item ))
                        batch.push( createResolvers.raceEventUrls( item as IF1RaceEvent ));

                    // ...IF1EventResult
                    else if ( isF1ObjectInstanceOf.eventResult( item ))
                        batch.push( createResolvers.resultUrls( item as any ));

                    // ...IF1DriverStanding
                    else if ( isF1ObjectInstanceOf.driverStanding( item ))
                        batch.push( createResolvers.driverStandingUrls( item as IF1DriverStanding ));

                    // ...IF1ConstructorStanding
                    else if ( isF1ObjectInstanceOf.constructorStanding( item ))
                        batch.push( createResolvers.constructorStandingUrls( item as IF1ConstructorStanding ));
                }
            }

            results = results.concat( await Promise.all( batch ));
            await delay( 1000 );
        }
    } catch ( err ) {
        console.warn( `🛑 Failed creating resolved shortened links.`, err );
    }

    return results;
}

/**
 * Parses a collection of items that may contain shortened link references, and
 * resolves those references against a collection of cached links. Returns a
 * clone of the original items absent those that were resolved, as well as the
 * collection of resolved items.
 * 
 * This is used early in the shorten process to reconcile what already exists
 * versus what doesn't, so that the shorten operation will only operate on what
 * it needs to.
 * 
 * @param {F1ShortLinkType[]} items 
 * @param {IF1WikiLink[]} cached 
 * @returns {IPreResolvedResult}
 */
function getResolvedFromCache(
    items: F1ShortLinkType[],
    cached: IF1WikiLink[] ): IPreResolvedResult {
    
    let resolved: IPreResolvedResult = {
        items: items.slice( 0 ),
        results: []
    };

    if ( resolved.items.length > 0 && cached.length > 0 ) {

        // Reverse iterate because we're going to be deleting as we resolve.
        let index = resolved.items.length;
        while ( index-- ) {

            let found = false;

            // ...IF1RaceEvent
            if ( isF1ObjectInstanceOf.raceEvent( resolved.items[ index ])) {
                const item = resolved.items[ index ] as IF1RaceEvent;
                const circuit = cached.find( c => c.originalUrl === item.Circuit.url );
                const event = cached.find( c => c.originalUrl === item.url );

                if ( circuit && event ) {

                    resolved.results.push({
                        ...item,
                        shortUrl: event.shortUrl,
                        Circuit: {
                            ...item.Circuit,
                            shortUrl: circuit.shortUrl
                        }
                    });
    
                    found = true;
                }
            }

            // ...IF1EventResult
            else if ( isF1ObjectInstanceOf.eventResult( resolved.items[ index ])) {
                const item = resolved.items[ index ] as IF1EventResult;
                const driver = cached.find( c => c.originalUrl === item.Driver.url );
                const ctor = cached.find( c => c.originalUrl === item.Constructor.url );

                if ( driver && ctor ) {
                    resolved.results.push({
                        ...item,
                        Driver: {
                            ...item.Driver,
                            shortUrl: driver.shortUrl
                        },
                        Constructor: {
                            ...item.Constructor,
                            shortUrl: ctor.shortUrl
                        }
                    } as any );

                    found = true;
                }
            }

            // ...IF1DriverStanding
            else if ( isF1ObjectInstanceOf.driverStanding( resolved.items[ index ])) {
                const item = resolved.items[ index ] as IF1DriverStanding;
                const driver = cached.find( c => c.originalUrl === item.Driver.url );
                const ctors = item.Constructors.reduce<IF1Constructor[]>(( arr, current ) => {
                    const ctorUrl = cached.find( c => c.originalUrl === current.url );
                    if ( ctorUrl )
                        arr.push({
                            ...current,
                            shortUrl: ctorUrl.shortUrl
                        });

                    return arr;
                }, [] );

                if ( driver && ctors.length === item.Constructors.length ) {
                    resolved.results.push({
                        ...item,
                        Driver: {
                            ...item.Driver,
                            shortUrl: driver.shortUrl
                        },
                        Constructors: ctors
                    });

                    found = true;
                }
            }

            // ...IF1ConstructorStanding
            else if ( isF1ObjectInstanceOf.constructorStanding( resolved.items[ index ])) {
                const item = resolved.items[ index ] as IF1ConstructorStanding;
                const ctor = cached.find( c => c.originalUrl === item.Constructor.url );

                if ( ctor ) {
                    resolved.results.push({
                        ...item,
                        Constructor: {
                            ...item.Constructor,
                            shortUrl: ctor.shortUrl
                        }
                    });

                    found = true;
                }
            }

            // If we've resolved, remove this item from the collection.
            if ( found )
                resolved.items.splice( index, 1 );
        }
    }

    return resolved;
}

/**
 * Defines resolvers used to populate Formula 1 response objects with their
 * shortened links after creation.
 */
const createResolvers = {

    /**
     * Fetches or creates shortened links within a Formula 1 constructor standing,
     * and returns the standing after populating the associated properties.
     * 
     * @param {IF1RaceEvent} item 
     * @returns {Promise<IF1RaceEvent>}
     */
    constructorStandingUrls: async function( item: IF1ConstructorStanding )
        : Promise<IF1ConstructorStanding> {

        const ctor = await getCreate( item.Constructor.url, 'constructor' );
        
        return {
            ...item,
            Constructor: {
                ...item.Constructor,
                shortUrl: ctor
            }
        };
    },

    /**
     * Fetches or creates shortened links within a Formula 1 driver standing, and
     * returns the standing after populating the associated properties.
     * 
     * @param {IF1RaceEvent} item 
     * @returns {Promise<IF1RaceEvent>}
     */
    driverStandingUrls: async function( item: IF1DriverStanding ): Promise<IF1DriverStanding> {
        const driver = await getCreate( item.Driver.url, 'driver' );
        const ctors = await Promise.all( item.Constructors.map( async ctor => {
            const ctorUrl = await getCreate( ctor.url, 'constructor' );
            return {
                ...ctor,
                shortUrl: ctorUrl
            };
        }));

        return {
            ...item,
            Driver: {
                ...item.Driver,
                shortUrl: driver
            },
            Constructors: ctors
        };
    },

    /**
     * Fetches or creates shortened links within a Formula 1 qualifying event,
     * and returns the event after populating the associated properties.
     * 
     * @param {IF1RaceEvent} item 
     * @returns {Promise<IF1QualifyingEvent>}
     */
    qualifyingEventUrls: async function( item: IF1QualifyingEvent )
        : Promise<IF1QualifyingEvent> {

        const event = await getCreate( item.url, 'event' );
        const circuit = await getCreate( item.Circuit.url, 'circuit' );

        return {
            ...item,
            shortUrl: event,
            Circuit: {
                ...item.Circuit,
                shortUrl: circuit
            }
        };
    },

    /**
     * Fetches or creates shortened links within a Formula 1 race event, and
     * returns the event after populating the associated properties.
     * 
     * @param {IF1RaceEvent} item 
     * @returns {Promise<IF1RaceEvent>}
     */
    raceEventUrls: async function( item: IF1RaceEvent ): Promise<IF1RaceEvent> {
        const event = await getCreate( item.url, 'event' );
        const circuit = await getCreate( item.Circuit.url, 'circuit' );

        return {
            ...item,
            shortUrl: event,
            Circuit: {
                ...item.Circuit,
                shortUrl: circuit
            }
        };
    },

    /**
     * Fetches or creates shortened links within a Formula 1 qualifying or race
     * result, and returns the result after populating the associated properties.
     * 
     * @param {IF1QualifyingResult | IF1RaceResult} item 
     * @returns {Promise<IF1QualifyingResult | IF1RaceResult>}
     */
    resultUrls: async function( item: IF1QualifyingResult | IF1RaceResult )
        : Promise<IF1QualifyingResult | IF1RaceResult> {
        
        const driver = await getCreate( item.Driver.url, 'driver' );
        const ctor = await getCreate( item.Constructor.url, 'constructor' );

        return {
            ...item,
            Driver: {
                ...item.Driver,
                shortUrl: driver
            },
            Constructor: {
                ...item.Constructor,
                shortUrl: ctor
            }
        };
    }
}

import { load as loadHtml } from 'cheerio';
import fetch from 'node-fetch';
import { CloudinaryAPI, wikipediaAPI } from '../api/index.js';

/**
 * String values considered falsey as boolean.
 */
const falseyValues = [ 'no', 'n', 'off', 'disabled', 'false', '0' ];

/**
 * String values considered truthy as booleans.
 */
const truthyValues = [ 'yes', 'y', 'on', 'enabled', 'true', '1' ];

/**
 * Seasonal parameter type when requesting qualifying or race results.
 */
export type F1Season = 'current' | number;

/**
 * Round parameter type when requesting qualifying or race results.
 */
export type F1Round = 'last' | number;

/**
 * Returns a large collection of an item broken into batches.
 * 
 * @param {T[]} collection 
 * @param {number} size 
 * @returns {T[][]}
 */
export function batchize<T>( collection: T[], size = 10 ): T[][] {
    let i,
        j,
        batches: T[][] = [];

    for ( i = 0, j = collection.length; i < j; i+= size )
        batches.push( collection.slice( i, i + size ));

    return batches;
}

/**
 * Simple delay that waits a given number of milliseconds, and then resolves.
 * 
 * @param {number} timeout 
 * @returns {Promise<void>}
 */
export function delay( timeout = 1500 ): Promise<void> {
    return new Promise( resolve =>
        setTimeout( resolve, timeout ));
}

/**
 * Fetches the URL to a Formula 1 circuit's track image. Attempts to fetch from
 * Cloudinary first. If not found attempts to fetch from Wikipedia, upload it to
 * Cloudinary, and return the result.
 * 
 * @param {string} name 
 * @returns {string | undefined}
 */
export async function getF1CircuitImageUrl( name: string ): Promise<string | undefined> {
    let result: string | undefined;

    try {

        // Exists in Cloudinary?
        result = await CloudinaryAPI.Instance.getF1ImageUrlByName( name );

        // No? Try Wikipedia.
        if ( !result ) {

            const info = await wikipediaAPI.getPageImageInfo( name );
            if ( !info )
                throw new Error( 'Wikipedia page image not found.' );

            result = await CloudinaryAPI.Instance.uploadF1Image(
                'circuit',
                name,
                info.imageinfo[ 0 ].url
            );

            if ( !result )
                throw new Error( 'Failed Cloudinary upload.' );
        }
    } catch ( err ) {
        console.warn( `🛑 Failed to fetch circuit image URL for "${name}".`, err );
    }

    return result;
}

/**
 * Fetches the URL to an image found in the metadata of a page.
 * 
 * @param {string} url 
 * @returns {Promise<string | undefined>}
 */
export async function getImageUrlFromPage(
    url: string,
    prop: string = 'og:image' ): Promise<string | undefined> {
    let result: string | undefined;

    try {
        const response = await fetch( url );
        const html = await response.text();
        const $doc = loadHtml( html );
        const $images = $doc( `meta[ property="${prop}"]` );

        if ( $images.length > 0 )
            result = $images.last().attr( 'content' );
    } catch ( err ) {
        console.warn( `🛑 Failed to fetch image URL from OpenGraph metadata for page "${url}".`, err );
    }

    return result;
}

/**
 * Returns a random item from a collection.
 * 
 * @param {T[]} collection 
 * @returns {T | undefined}
 */
export function random<T>( collection: T[] ): T | undefined {
    let result: T | undefined;

    if ( collection.length > 0 ) {
        const randomIdx = Math.floor( Math.random() * collection.length );
        result = collection[ randomIdx ];
    }

    return result;
}

/**
 * Converts a potential string value to its boolean equivalent.
 * 
 * *Used primarily to sanitize and normalize command inputs.*
 * 
 * @param {string} value 
 * @returns {boolean | undefined}
 */
export function stringToBoolean( value?: string ): boolean | undefined {
    let result: boolean | undefined;

    if ( value ) {
        value = value.toLowerCase().trim();

        if ( falseyValues.includes( value ))
            result = false;
        else if ( truthyValues.includes( value ))
            result = true;
    }

    return result;
}

/**
 * Converts a string value to its enumeration equivalent.
 * 
 * @param enm 
 * @param value 
 * @returns 
 */
export function stringToEnum<T>( enm: {[ s: string ]: T }, value: string )
    : T | undefined {

    return ( Object.values( enm ) as unknown as string[] )
        .includes(value)
            ? value as unknown as T
            : undefined;
}

/**
 * Returns a validated non-empty string value.
 * 
 * *Used primarily to sanitize and normalize command inputs.*
 * 
 * @param {string} value 
 * @returns {string | undefined}
 */
export function stringValue( value?: string ): string | undefined {
    let result: string | undefined;

    if ( value ) {
        value = value.trim();

        if ( value.length > 0 )
            result = value;
    }

    return result;
}

/**
 * Returns a valid Formula 1 round type value.
 * 
 * *Used primarily to sanitize and normalize command inputs.*
 * 
 * @param {string} value 
 * @returns {F1Round | undefined}
 */
export function toF1Round( value?: string ): F1Round | undefined {
    let result: F1Round | undefined;

    if ( value ) {
        value = value.toLowerCase().trim();

        if ( value.length > 0 && (
            +value !== NaN || value === 'last' ))
            result = value as F1Round;
    }

    return result;
}

/**
 * Returns a valid Formula 1 season type value.
 * 
 * *Used primarily to sanitize and normalize command inputs.*
 * 
 * @param {string} value 
 * @returns {F1Season | undefined}
 */
export function toF1Season( value?: string ): F1Season | undefined {
    let result: F1Season | undefined;

    if ( value ) {
        value = value.toLowerCase().trim();

        if ( value.length > 0 && (
            +value !== NaN || value === 'current' ))
            result = value as F1Season;
    }

    return result;
}

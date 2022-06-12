import fetch from 'node-fetch';
import { environment } from '../utilities/index.js';

/**
 * Interface contract of a response object describing a Tenor search result
 * media format.
 */
export interface ITenorResultFormat {
    url: string;
}

/**
 * Interface contract of a response object describing a Tenor search result.
 */
export interface ITenorResult {
    media_formats: {
        gif: ITenorResultFormat;
        mediumgif: ITenorResultFormat;
    }
}

/**
 * Interface contract of a response object describing a Tenor search result.
 */
export interface ITenorSearchResponse {
    results: ITenorResult[];
    next?: string;
}

export class TenorAPI {

    /**
     * Internal singleton reference to the initialized API.
     */
    private static instance: TenorAPI | undefined;

    /**
     * API URL prefix.
     */
    private static ApiBase = 'https://tenor.googleapis.com/v2/search?q=';

    /**
     * Crofty's key for the Tenor API.
     */
    private key: string | undefined;

    /**
     * Crofty's client key for the Tenor API.
     */
    private client_key: string | undefined;

    /**
     * Singleton instance of the initialized API.
     */
    public static get Instance(): TenorAPI {
        if ( !TenorAPI.instance )
            TenorAPI.instance = new TenorAPI();

        return TenorAPI.instance;
    }

    /**
     * Constructs and configures access to the Tenor API for Crofty's random
     * gif responses from the parameters, or environment variables if not
     * provided.
     * 
     * @param {string} key 
     * @param {string} client_key 
     */
    constructor( key?: string, client_key?: string ) {
        this.key = key ?? environment.TenorKey;
        this.client_key = client_key ?? environment.TenorClientId;

        if ( !this.key || !this.client_key )
            throw new Error( `Tenor API requires 'key' and 'client_key' parameters.` );
    }

    /**
     * Queries Tenor for a random image by keyword.
     * 
     * @param {string} keywords 
     * @returns {Promise<ITenorResult | undefined>}
     */
    public async random( keywords: string ): Promise<ITenorResult | undefined> {
        let result: ITenorResult | undefined;

        const response = await this.search( keywords );
        if ( response.length > 0 ) {

            const random = Math.floor( Math.random() * response.length );
            result = response[ random ];
        }

        return result;
    }

    /**
     * Query Tenor for images by keyword.
     * 
     * @param {string} keywords 
     * @param {number} limit 
     * @returns {Promise<ITenorResult[]>}
     */
    public async search( keywords: string, limit = 10 ): Promise<ITenorResult[]> {
        let results: ITenorResult[] = [];

        const response = await this.call<ITenorSearchResponse>([
            `q=${encodeURIComponent( keywords )}`,
            `limit=${limit}`
        ]);

        if ( response && response.results )
            results = response.results;

        return results;
    }

    /**
     * Calls the Tenor API, returning the strongly-typed response body if valid.
     * 
     * @param {string[]} params 
     * @returns {Promise<T | undefined>}
     */
    private async call<T>( params: string[] ): Promise<T | undefined> {
        let result: T | undefined;

        // Add Crofty's credentials.
        params.push( `key=${this.key}` );
        params.push( `client_key=${this.client_key}` );

        // Prepare the endpoint.
        const endpoint = `${TenorAPI.ApiBase}?${params.join( '&' )}`;
        try {
            const response = await fetch( endpoint, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const json: any = await response.json();
            result = json as T;
        } catch ( err ) {
            console.warn( `🛑 Failed call to "${endpoint}".`, err );
        }

        return result;
    }
}
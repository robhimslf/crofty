import fetch, { type Response } from 'node-fetch';
import { type URL } from 'node:url';

type UrlParam = string | URL;

/**
 * Base class for HTTP services that provides methods for making HTTP requests.
 * 
 * This class is designed to be extended by other services that require HTTP
 * communication, providing a common interface for GET requests and JSON parsing.
 */
export abstract class HttpServiceBase {

    /**
     * Performs a GET request to the specified URL.
     * 
     * @param url The URL to which the request is sent.
     * @param authorization Optional authorization header value.
     * @returns A promise that resolves to the response of the request.
     */
    protected async get( url: UrlParam, authorization?: string ): Promise<Response> {
        return await fetch( url.toString(), {
            method: 'get',
            headers: {
                Accept: 'application/json',
                ...( authorization ? { Authorization: authorization } : {} )
            }
        });
    }

    /**
     * Performs a GET request to the specified URL and attempts to parse the
     * response as JSON.
     * 
     * @param url The URL to which the request is sent.
     * @param authorization Optional authorization header value.
     * @returns A promise that resolves to the parsed JSON object, or undefined
     * if parsing fails.
     */
    protected async getJson<T>( url: UrlParam, authorization?: string ): Promise<T | undefined> {
        const response = await this.get( url, authorization );

        if ( response.ok ) {
            try {
                const result = await response.json();
                return result as T;
            } catch {
                // do nothing
            }
        }

        return undefined;
    }

    /**
     * Fetches a parsed query string from the provided parameters.
     * 
     * @param params 
     * @returns 
     */
    protected queryString( params?: Record<string, string | number | boolean | undefined> ): string {
        if ( !params || Object.keys( params ).length === 0 )
            return '';
        
        return Object.entries( params )
            .filter( ( [ , value ] ) => value !== undefined )
            .map( ( [ key, value ] ) => `${encodeURIComponent( key )}=${encodeURIComponent( String( value ) )}` )
            .join( '&' );
    }
}

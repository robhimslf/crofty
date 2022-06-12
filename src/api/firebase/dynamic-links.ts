import fetch from 'node-fetch';
import { environment } from '../../utilities/index.js';
import type {
    IShortLinkRequestParams,
    IShortLinkResponse,
    ShortLinkSuffix
} from './types.js';

export class DynamicLinksAPI {

    /**
     * Internal singleton reference to the initialized API.
     */
    private static instance: DynamicLinksAPI | undefined;

    /**
     * API URL prefix.
     */
    private static ApiBase = 'firebasedynamiclinks.googleapis.com';

    /**
     * Domain at which shortened links should be generated.
     */
    private domain: string | undefined;

    /**
     * Firebase web API key.
     */
    private key: string | undefined;

    /**
     * Base request endpoint.
     */
    private get requestUrl(): string {
        return `https://${DynamicLinksAPI.ApiBase}/v1/shortLinks?key=${this.key!}`;
    }

    /**
     * Singleton instance of the initialized API.
     */
    public static get Instance(): DynamicLinksAPI {
        if ( !DynamicLinksAPI.instance )
            DynamicLinksAPI.instance = new DynamicLinksAPI();

        return DynamicLinksAPI.instance;
    }

    /**
     * Initializes the API using the provided web API key, or by reading the
     * key from the environment variables.
     * 
     * @param {string} domain 
     * @param {string} key 
     */
    constructor( domain?: string, key?: string ) {
        this.domain = domain || environment.FirebaseDynamicLinksDomain;
        if ( !this.domain )
            throw new Error( 'Firebase shortened links domain is required.' );

        this.key = key || environment.FirebaseDynamicLinksKey;
        if ( !this.key )
            throw new Error( 'Firebase web API key is required.' );
    }

    /**
     * Creates a shortened link using the Dynamic Links API. See:
     * https://firebase.google.com/docs/reference/dynamic-links/link-shortener
     * 
     * @param url 
     * @param suffix 
     * @returns 
     */
    async shorten( url: string, suffix: ShortLinkSuffix = 'SHORT' )
        : Promise<IShortLinkResponse | undefined> {
        
        const params: IShortLinkRequestParams = {
            dynamicLinkInfo: {
                domainUriPrefix: this.domain!,
                link: url
            },
            suffix: suffix && {
                option: suffix
            }
        };

        return await this.call( params );
    }

    /**
     * Calls the Firebase Dynamic Links API, returning the strongly-typed response
     * body if valid.
     * 
     * @param {IShortLinkRequestParams} params 
     * @returns {Promise<IShortLinkResponse | undefined>}
     */
    private async call( params: IShortLinkRequestParams )
        : Promise<IShortLinkResponse | undefined> {
        
        let result: IShortLinkResponse | undefined;
        try {
            const response = await fetch( this.requestUrl, {
                method: 'POST',
                body: JSON.stringify( params ),
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const json: any = await response.json();
            result = json as IShortLinkResponse;
        } catch ( err ) {
            console.warn( '🛑 Failed call to create shortened link.', params, err );
        }

        return result;
    }
}

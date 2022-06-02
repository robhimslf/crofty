import { request, RequestOptions } from 'https';
import { environment } from '../../utilities/index.js';

/**
 * Interface contract of a request object containing granular configuration
 * properties for a shortened link request.
 */
export interface IShortLinkDynamicInfo {
    domainUriPrefix: string;
    link: string;
}

/**
 * Interface contract of a request containing the parameters required to create
 * a shortened link.
 */
export interface IShortLinkRequestParams {
    dynamicLinkInfo?: IShortLinkDynamicInfo;
    longDynamicLink?: string;
    suffix?: IShortLinkSuffix;
}

/**
 * Interface contract of a response object containing the result of a
 * shortened link request.
 */
export interface IShortLinkResponse {
    shortLink: string;
    previewLink: string;
}

/**
 * Interface contract of a request object containing the creation suffix
 * configuration of a shortened link.
 */
export interface IShortLinkSuffix {
    option: 'SHORT' | 'UNGUESSABLE';
}

export class DynamicLinksAPI {

    /**
     * API URL prefix.
     */
    private static ApiBase = 'firebasedynamiclinks.googleapis.com';

    /**
     * Firebase web API key.
     */
    private key: string | undefined;

    /**
     * Base request endpoint.
     */
    private get requestPath(): string {
        return `/v1/shortLinks?key=${this.key!}`;
    }

    /**
     * Initializes the API using the provided web API key, or by reading the
     * key from the environment variables.
     * 
     * @param {string} key 
     */
    constructor( key?: string ) {
        this.key = key || environment.FirebaseDynamicLinksKey;
        if ( !this.key )
            throw new Error( 'Firebase web API key is required.' );
    }

    /**
     * Creates a shortened link.
     * 
     * @param {IShortLinkRequestParams} params 
     * @returns {Promise<IShortLinkResponse>}
     */
    async createLink( params: IShortLinkRequestParams ): Promise<IShortLinkResponse> {
        const body = JSON.stringify( params );
        const options: RequestOptions = {
            hostname: DynamicLinksAPI.ApiBase,
            path: this.requestPath,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        };

        return new Promise(( resolve, reject ) => {

            const req = request( options, ( res ) => {
                const buffers: Buffer[] = [];

                res
                    .on( 'data', ( chunk ) => buffers.push( chunk ))
                    .on( 'end', () => {
                        const serialized = Buffer.concat( buffers ).toString();
                        const json = JSON.parse( serialized );

                        if ( res.statusCode === 200 )
                            return resolve( json );

                        return reject( json );
                    });                
            });

            req.on( 'error', reject );
            req.write( body );
            req.end();
        });
    }
}

/**
 * Singleton instance of the Firebase Dynamic Links API.
 */
export const dynamicLinksAPI = new DynamicLinksAPI();
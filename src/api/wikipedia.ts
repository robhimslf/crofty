import fetch from 'node-fetch';

/**
 * Interface contract of a response object containing information about an
 * image hosted on Wikipedia.
 */
export interface IWikiImageInfo {
    ns: number;
    title: string;
    imageinfo: {
        url: string;
        descriptionurl: string;
    }[];
}

/**
 * Interface contract of a response containing information about an image hosted
 * on Wikipedia.
 */
export interface IWikiImageInfoResponse {
    query: {
        pages: {
            [ key: string ]: IWikiImageInfo;
        };
    };
}

/**
 * Interface contract of a response object containing information about an image
 * embedded within a Wikipedia page.
 */
export interface IWikiPageImage {
    pageid: number;
    ns: number;
    title: string;
    pageimage: string;
}

/**
 * Interface contract of a response containing information about an image embedded
 * within a Wikipedia page.
 */
export interface IWikiPageImageResponse {
    query: {
        pages: {
            [ key: string ]: IWikiPageImage;
        };
    };
}

export class WikipediaAPI {

    /**
     * API URL prefix.
     */
    private static ApiBase = 'https://en.wikipedia.org/w/api.php';

    /**
     * Fetches a Wikipedia page's primary display image info if applicable.
     * 
     * @param {string} title 
     * @returns {Promise<IWikiImageInfo | undefined>}
     */
    public async getPageImageInfo( title: string ): Promise<IWikiImageInfo | undefined> {
        let result: IWikiImageInfo | undefined;

        try {
            const image = await this.getPageImage( title );
            if ( !image )
                throw new Error( 'Page image not found.' );

            const response = await this.call<IWikiImageInfoResponse>([
                'action=query',
                'format=json',
                'prop=imageinfo',
                'iiprop=url',
                `titles=File:${image.pageimage}`
            ]);

            if ( response &&
                response.query &&
                response.query.pages &&
                Object.values( response.query.pages ).length > 0 )
                result = Object.values( response.query.pages )[ 0 ];
        } catch ( err ) {
            console.warn( `🛑 Failed to fetch Wikipedia page image info for title of "${title}".`, err );
        }

        return result;
    }

    /**
     * Fetches the display image for a Wikipedia page if applicable.
     * 
     * @param {string} title 
     * @returns {Promise<IWikiPageImage | undefined>}
     */
    private async getPageImage( title: string ): Promise<IWikiPageImage | undefined> {
        let result: IWikiPageImage | undefined;

        const response = await this.call<IWikiPageImageResponse>([
            'action=query',
            'format=json',
            'prop=pageimages',
            `titles=${encodeURIComponent( title )}`
        ]);

        if ( response &&
            response.query &&
            response.query.pages &&
            Object.values( response.query.pages ).length > 0 )
            result = Object.values( response.query.pages )[ 0 ];

        return result;
    }

    /**
     * Calls the Wikipedia API, returning the strongly-typed response body if
     * valid.
     * 
     * @param {string[]} params 
     * @returns {Promise<T | undefined>}
     */
    private async call<T>( params: string[] ): Promise<T | undefined> {
        let result: T | undefined;

        const endpoint = `${WikipediaAPI.ApiBase}?${params.join( '&' )}`;
        try {
            const response = await fetch( endpoint, {
                method: 'POST',
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

/**
 * Singleton instance of the Wikipedia API.
 */
export const wikipediaAPI = new WikipediaAPI();
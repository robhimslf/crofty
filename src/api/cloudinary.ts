import {
    v2 as cloudinary,
    ImageTransformationOptions,
    UploadApiOptions
} from 'cloudinary';
import { environment } from '../utilities/index.js';

/**
 * Defines a type of allowed images held in Cloudinary-backed storage.
 */
export type F1ImageType =
    'circuit' |
    'constructor' |
    'driver' |
    'event';

export class CloudinaryAPI {

    /**
     * Folder in which all images are held.
     */
    private folder: string | undefined;

    /**
     * Constructs and configures access to Cloudinary for Crofty's image storage
     * from the parameters, or environment variables if not provided.
     * 
     * @param {string} cloud_name 
     * @param {string} api_key 
     * @param {string} api_secret 
     * @param {string} folder 
     */
    constructor(
        cloud_name?: string,
        api_key?: string,
        api_secret?: string,
        folder?: string ) {
        
        cloud_name = cloud_name || environment.CloudinaryName;
        api_key = api_key || environment.CloudinaryKey;
        api_secret = api_secret || environment.CloudinarySecret;
        folder = folder || environment.CloudinaryFolder;

        if ( !cloud_name ||
            !api_key ||
            !api_secret ||
            !folder )
            throw new Error( `Cloudinary API requires 'cloud_name', 'api_key', 'api_secret', and 'folder' parameters.` );

        cloudinary.config({
            cloud_name,
            api_key,
            api_secret,
            secure: true
        });

        this.folder = folder;
    }

    /**
     * Fetches an F1 image URL by name.
     * 
     * @param {string} name 
     * @returns {string | undefined}
     */
    public async getF1ImageUrlByName( name: string ): Promise<string | undefined> {
        let result: string | undefined;

        try {
            const response = await cloudinary.api.resources_by_tag( name );
            if ( response &&
                response.resources &&
                response.resources.length > 0 )
                result = response.resources[ 0 ].url;
        } catch ( err ) {
            console.warn( `🛑 Failed finding F1 image URL link matching name of "${name}".`, err );
        }

        return result;
    }

    /**
     * Uploads an F1 image, and returns the resulting stored URL.
     * 
     * Supports resizing of the original image by passing *both* the `width` and
     * `resize` flag. Optionally applies a background to transparent images.
     * 
     * @param {F1ImageType} type 
     * @param {string} name 
     * @param {string} sourceUrl 
     * @param {number} width 
     * @param {boolean} resize 
     * @param {string} background 
     * @returns {Promise<string | undefined>}
     */
    public async uploadF1Image(
        type: F1ImageType,
        name: string,
        sourceUrl: string,
        width: number = 800,
        resize: boolean = true,
        background: string = '#4f545c' ): Promise<string | undefined> {
        
        return new Promise( resolve => {
            let transformation: ImageTransformationOptions = {};
            if ( width && resize ) {
                transformation.width = width;
                transformation.crop = 'scale';
            }

            if ( background )
                transformation.background = background;

            const options: UploadApiOptions = {
                folder: this.folder,
                transformation,
                public_id: name,
                unique_filename: false,
                format: 'png',
                tags: [ type, name ]
            };

            cloudinary.uploader.upload( sourceUrl, options, ( err, img ) => {
                if ( err || !img ) {
                    console.warn( `🛑 Failed uploading F1 image URL link matching name of "${name}".`, err );
                    return resolve( undefined );
                }

                resolve( img.url );
            });
        });
    }
}

/**
 * Singleton instance of the Cloudinary image storage API.
 */
export const cloudinaryAPI = new CloudinaryAPI();
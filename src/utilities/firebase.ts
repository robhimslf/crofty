import { exists, write } from './file.js';
import { environment } from './environment.js';

export class FirebaseCredentials {

    /**
     * Filename that the Firebase library expects for its internal configuration.
     */
    public static filename: string = 'firebase.json';

    /**
     * "auth_uri" property of the key file.
     * 
     * *Static value.*
     */
    public auth_uri: string = 'https://accounts.google.com/o/oauth2/auth';

    /**
     * "token_uri" property of the key file.
     * 
     * *Static value.*
     */
    public token_uri: string = 'https://oauth2.googleapis.com/token';

    /**
     * "auth_provider_x509_cert_url" property of the key file.
     * 
     * *Static value.*
     */
    public auth_provider_x509_cert_url: string = 'https://www.googleapis.com/oauth2/v1/certs';

    /**
     * "type" property of the key file.
     * 
     * *Static value.*
     */
    public type: string = 'service_account';

    /**
     * "client_email" property of the key file.
     */
    public client_email: string | undefined;
 
    /**
     * "client_id" property of the key file.
     */
    public client_id: string | undefined;

    /**
     * "client_x509_cert_url" property of the key file.
     */
    public client_x509_cert_url: string | undefined;

    /**
     * "project_id" property of the key file.
     */
    public project_id: string | undefined;

    /**
     * "private_key" property of the key file.
     */
    public private_key: string | undefined;

    /**
     * "private_key_id" property of the key file.
     */
    public private_key_id: string | undefined;

    /**
     * Whether this object is minimally viable for use with Firebase.
     */
    public valid: boolean = false;

    /**
     * Constructs and parses Firebase credentials expected to be present in
     * environment variables.
     * 
     * @throws {Error} Client email, client ID, client X509 certificate URL,
     * project ID, project key, or project key ID are missing or invalid.
     */
    constructor() {
        this.client_email = environment.FirebaseClientEmail;
        this.client_id = environment.FirebaseClientId;
        this.client_x509_cert_url = environment.FirebaseClientX509CertUrl;
        this.project_id = environment.FirebaseProjectId;
        this.private_key = environment.FirebasePrivateKey;
        this.private_key_id = environment.FirebasePrivateKeyId;

        if ( !this.client_email ||
            !this.client_id ||
            !this.client_x509_cert_url ||
            !this.private_key ||
            !this.private_key_id ||
            !this.project_id )
            throw new Error( 'Missing or invalid Firebase credentials.' );

        this.private_key = this.private_key
            .replace( /\\n/g, '\n' );
        this.valid = true;
    }
}

/**
 * Utility method for creating - and returning the path of - a file containing
 * credentials and metadata required for using Firebase.
 * 
 * @returns {Promise<string | undefined>}
 */
export const getCreateCredentialsFile = async (): Promise<string | undefined> => {
    let firebaseFilePath: string | undefined;

    try {
        let validatePath = FirebaseCredentials.filename;
        while ( !firebaseFilePath ) {
            if (( await exists( validatePath )))
                firebaseFilePath = validatePath;
            else
                validatePath = `../${validatePath}`;
        }

        const credentials = new FirebaseCredentials();
        if ( !credentials.valid )
            throw new Error( 'Expected credentials object to be valid.' );

        const json: any = Object.assign( {}, credentials );
        delete json.valid;

        const serialized = JSON.stringify( json, null, 4 );
        if ( !( await write( firebaseFilePath, serialized )))
            throw new Error( `Unable to write file "${firebaseFilePath}".` )
    } catch ( err ) {
        console.warn( `🛑 Crofty requires a local Firebase configuration file, and failed to write one.`, err );
        firebaseFilePath = undefined;
    }

    return firebaseFilePath;
};
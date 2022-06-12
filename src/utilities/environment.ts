
export class Environment {

    /**
     * Discord username of the administrator of a server on which Crofty is
     * installed.
     * 
     * *Sensitive environment variable.*
     */
    get ServerAdmin(): string | undefined {
        return process.env[ 'SERVER_ADMIN' ];
    }

    /**
     * Crofty's Discord phone-home authentication credential.
     * 
     * *Sensitive environment variable.*
     */
    get BotToken(): string | undefined {
        return process.env[ 'BOT_TOKEN' ];
    }

    /**
     * Crofty's image storage folder name in Cloudinary.
     * 
     * *Sensitive environment variable.*
     */
    get CloudinaryFolder(): string | undefined {
        return process.env[ 'CLOUDINARY_FOLDER' ];
    }

    /**
     * Crofty's image storage API key for Cloudinary.
     * 
     * *Sensitive environment variable.*
     */
    get CloudinaryKey(): string | undefined {
        return process.env[ 'CLOUDINARY_KEY' ];
    }

    /**
     * Crofty's image storage account name in Cloudinary.
     * 
     * *Sensitive environment variable.*
     */
    get CloudinaryName(): string | undefined {
        return process.env[ 'CLOUDINARY_NAME' ];
    }

    /**
     * Crofty's image storage API secret for Cloudinary.
     * 
     * *Sensitive environment variable.*
     */
    get CloudinarySecret(): string | undefined {
        return process.env[ 'CLOUDINARY_SECRET' ];
    }

    /**
     * Crofty's shortened link domain in Firebase.
     * 
     * *Sensitive environment variable.*
     */
    get FirebaseDynamicLinksDomain(): string | undefined {
        return process.env[ 'FIREBASE_DYNAMIC_LINKS_DOMAIN' ];
    }

    /**
     * Crofty's shortened link API key in Firebase.
     * 
     * *Sensitive environment variable.*
     */
     get FirebaseDynamicLinksKey(): string | undefined {
        return process.env[ 'FIREBASE_DYNAMIC_LINKS_KEY' ];
    }

    /**
     * Crofty's project ID for Firebase.
     * 
     * *Sensitive environment variable.*
     */
    get FirebaseProjectId(): string | undefined {
        return process.env[ 'FIREBASE_PROJECT_ID' ];
    }

    /**
     * Crofty's database client email for Firebase.
     * 
     * *Sensitive environment variable.*
     */
    get FirebaseClientEmail(): string | undefined {
        return process.env[ 'FIREBASE_CLIENT_EMAIL' ];
    }

    /**
     * Crofty's database client ID for Firebase.
     * 
     * *Sensitive environment variable.*
     */
    get FirebaseClientId(): string | undefined {
        return process.env[ 'FIREBASE_CLIENT_ID' ];
    }

    /**
     * Crofty's database client X509 certificate address for Firebase.
     * 
     * *Sensitive environment variable.*
     */
    get FirebaseClientX509CertUrl(): string | undefined {
        return process.env[ 'FIREBASE_CLIENT_X509_CERT_URL' ];
    }

    /**
     * Crofty's database client private key for Firebase.
     * 
     * *Sensitive environment variable.*
     */
    get FirebasePrivateKey(): string | undefined {
        return process.env[ 'FIREBASE_PRIVATE_KEY' ];
    }

    /**
     * Crofty's database client private key ID for Firebase.
     * 
     * *Sensitive environment variable.*
     */
    get FirebasePrivateKeyId(): string | undefined {
        return process.env[ 'FIREBASE_PRIVATE_KEY_ID' ];
    }

    /**
     * Crofty's API key for Tenor.
     */
    get TenorKey(): string | undefined {
        return process.env[ 'TENOR_KEY' ];
    }

    /**
     * Crofty's client ID for Tenor.
     */
    get TenorClientId(): string | undefined {
        return process.env[ 'TENOR_CLIENT_ID' ];
    }

    /**
     * Helper method to validate the presence of Crofty's sensitive environment
     * variables. This should be called at `crofty.ts` in the `run` method just
     * before authenticating with Discord.
     */
    validate(): void {
        if ( !this.ServerAdmin )
            throw new Error( `🛑 Crofty requires a populated 'SERVER_ADMIN' environment variable.` );

        if ( !this.BotToken )
            throw new Error( `🛑 Crofty requires a populated 'BOT_TOKEN' environment variable.` );

        if ( !this.CloudinaryFolder )
            throw new Error( `🛑 Crofty requires a populated 'CLOUDINARY_FOLDER' environment variable.` );

        if ( !this.CloudinaryKey )
            throw new Error( `🛑 Crofty requires a populated 'CLOUDINARY_KEY' environment variable.` );

        if ( !this.CloudinaryName )
            throw new Error( `🛑 Crofty requires a populated 'CLOUDINARY_NAME' environment variable.` );

        if ( !this.CloudinarySecret )
            throw new Error( `🛑 Crofty requires a populated 'CLOUDINARY_SECRET' environment variable.` );

        if ( !this.FirebaseProjectId )
            throw new Error( `🛑 Crofty requires a populated 'FIREBASE_PROJECT_ID' environment variable.` );

        if ( !this.FirebaseClientEmail )
            throw new Error( `🛑 Crofty requires a populated 'FIREBASE_CLIENT_EMAIL' environment variable.` );

        if ( !this.FirebaseClientId )
            throw new Error( `🛑 Crofty requires a populated 'FIREBASE_CLIENT_ID' environment variable.` );

        if ( !this.FirebaseClientX509CertUrl )
            throw new Error( `🛑 Crofty requires a populated 'FIREBASE_CLIENT_X509_CERT_URL' environment variable.` );

        if ( !this.FirebasePrivateKey )
            throw new Error( `🛑 Crofty requires a populated 'FIREBASE_PRIVATE_KEY' environment variable.` );

        if ( !this.FirebasePrivateKeyId )
            throw new Error( `🛑 Crofty requires a populated 'FIREBASE_PRIVATE_KEY_ID' environment variable.` );

        if ( !this.TenorClientId )
            throw new Error( `🛑 Crofty requires a populated 'TENOR_CLIENT_ID' environment variable.` );

        if ( !this.TenorKey )
            throw new Error( `🛑 Crofty requires a populated 'TENOR_KEY' environment variable.` );
    }
}

export const environment = new Environment();

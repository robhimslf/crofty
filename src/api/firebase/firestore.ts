import { initializeApp, cert } from 'firebase-admin/app';
import {
    CollectionReference,
    DocumentData,
    Firestore,
    getFirestore,
    Query
} from 'firebase-admin/firestore';
import { firebase } from '../../utilities/index.js';

/**
 * Defines a type of allowed Wiki links held in the database.
 */
export type F1WikiLinkType =
    'circuit' |
    'constructor' |
    'driver' |
    'event';

/**
 * Interface contract of a response object containing a Discord guild
 * configuration for Crofty.
 */
export interface IDiscordGuildConfig {
    guildId: string;
    autoEventThreadChannelId: string | null;
    autoNewsChannelId: string | null;
    isAutoEventThreadEnabled: boolean;
    isAutoNewsEnabled: boolean;    
}

/**
 * Interface contract of a response object containing a Discord guild
 * member's configuration for Crofty.
 */
export interface IDiscordGuildMemberConfig {
    guildId: string;
    guildMemberId: string;
    isAutoEventThreadNotify: boolean;
}

/**
 * Interface contract of a response object containing a URL for a Formula 1
 * Wikipedia reference.
 */
export interface IF1WikiLink {
    type: F1WikiLinkType;
    originalUrl: string;
    shortUrl: string;
}

export class FirestoreAPI {

    /**
     * Instance of the Google Firestore client.
     */
    private firestore: Firestore | undefined;

    /**
     * Firestore collection containing Discord guild configurations.
     */
    private guildConfigs: CollectionReference<IDiscordGuildConfig> | undefined;

    /**
     * Firestore collection containing Discord guild member configurations.
     */
    private guildMemberConfigs: CollectionReference<IDiscordGuildMemberConfig> | undefined;

    /**
     * Firestore collection containing Formula 1 Wikipedia links.
     */
    private wikiLinks: CollectionReference<IF1WikiLink> | undefined;

    /**
     * Constructs and initializes a Firebase client.
     * 
     * @param {string} keyFilename 
     * @param {firebase.FirebaseCredentials} credentials 
     */
    constructor( keyFilename?: string, credentials?: firebase.FirebaseCredentials ) {

        // Initialize from a config file path.
        if ( keyFilename ) {
            this.firestore = new Firestore({
                keyFilename
            });
        }
        
        // Initialize manually.
        else if ( credentials ) {
            initializeApp({
                credential: cert({
                    projectId: credentials.project_id,
                    clientEmail: credentials.client_email,
                    privateKey: credentials.private_key
                })
            });

            this.firestore = getFirestore();
        }

        this.guildConfigs = this.getCollection<IDiscordGuildConfig>( 'guild_config' );
        this.guildMemberConfigs = this.getCollection<IDiscordGuildMemberConfig>( 'guild_member_config' );
        this.wikiLinks = this.getCollection<IF1WikiLink>( 'wiki_link' );
    }

    /**
     * Fetches a cached Formula 1 Wikipedia link by its original long-form URL if
     * already cached. Otherwise, creates a cached record and returns it if the
     * operation was successful.
     * 
     * @param {F1WikiLinkType} type 
     * @param {string} original 
     * @param {string} shortened 
     * @returns {Promise<IF1WikiLink | undefined>}
     */
    public async createF1WikiLink(
        type: F1WikiLinkType,
        original: string,
        shortened: string ): Promise<IF1WikiLink | undefined> {
        
        let result: IF1WikiLink | undefined;
        
        try {
            if ( !this.firestore || !this.wikiLinks )
                throw new Error( 'Firebase client is not initialized.' );

            result = await this.getF1WikiLink( original );
            if ( !result ) {
                await this.wikiLinks.add({
                    type,
                    originalUrl: original,
                    shortUrl: shortened
                });

                result = await this.getF1WikiLink( original );
            }
        } catch ( err ) {
            console.warn( `🛑 Failed creating F1 Wikipedia link for "${original}".`, err );
        }

        return result;
    }

    /**
     * Fetches a cached Formula 1 Wikipedia link by its original long-form URL.
     * 
     * @param {string} original 
     * @returns {Promise<IF1WikiLink | undefined>}
     */
    public async getF1WikiLink( original: string ): Promise<IF1WikiLink | undefined> {
        let result: IF1WikiLink | undefined;
        
        try {
            if ( !this.firestore || !this.wikiLinks )
                throw new Error( 'Firebase client is not initialized.' );

            const query = await this.wikiLinks
                .where( 'originalUrl', '==', original )
                .get();

            if ( !query.empty )
                result = query.docs[ 0 ].data();
        } catch ( err ) {
            console.warn( `🛑 Failed fetching F1 Wikipedia link for "${original}".`, err );
        }

        return result;
    }

    /**
     * Fetches a collection of cached Formula 1 Wikipedia links by their original
     * long-form URLs.
     * 
     * @param {string[]} originals 
     * @returns {Promise<IF1WikiLink[]>}
     */
    public async getF1WikiLinks( originals: string[] ): Promise<IF1WikiLink[]> {
        let results: IF1WikiLink[] = [];

        try {
            if ( !this.firestore || !this.wikiLinks )
                throw new Error( 'Firebase client is not initialized.' );

            const query = await this.wikiLinks
                .where( 'originalUrl', 'in', originals )
                .get();

            if ( !query.empty )
                results = query.docs.map( doc => doc.data() );
        } catch ( err ) {
            console.warn( `🛑 Failed fetching F1 Wikipedia links for "${originals.join( '", "' )}".`, err );
        }

        return results;
    }

    /**
     * Fetches a Discord server's Crofty configuration by ID after creating or
     * updating.
     * 
     * @param {string} guildId 
     * @param {boolean} isAutoEventThreadEnabled 
     * @param {string} autoEventThreadChannelId 
     * @param {boolean} isAutoNewsReportEnabled 
     * @param {string} autoNewsReportChannelId 
     * @returns {Promise<IDiscordGuildConfig | undefined>}
     */
    public async createUpdateGuildConfig(
        guildId: string,
        isAutoEventThreadEnabled?: boolean,
        autoEventThreadChannelId?: string,
        isAutoNewsReportEnabled?: boolean,
        autoNewsReportChannelId?: string ): Promise<IDiscordGuildConfig | undefined> {
        
        let result: IDiscordGuildConfig | undefined;
        try {
            if ( !this.firestore || !this.guildConfigs )
                throw new Error( 'Firebase client is not initialized.' );

            result = await this.getGuildConfigById( guildId );

            // Doesn't exist yet; create one.
            if ( !result ) {
                result = await this.createGuildConfig(
                    guildId,
                    isAutoEventThreadEnabled,
                    autoEventThreadChannelId,
                    isAutoNewsReportEnabled,
                    autoNewsReportChannelId );
            }

            // Already exists; update it.
            else {
                result = await this.updateGuildConfig(
                    guildId,
                    isAutoEventThreadEnabled,
                    autoEventThreadChannelId,
                    isAutoNewsReportEnabled,
                    autoNewsReportChannelId );
            }
        } catch ( err ) {
            console.warn( `🛑 Failed to create or update Discord guild config for "${guildId}".`, err );
        }

        return result;
    }

    /**
     * Fetches a Discord server member's Crofty configuration by ID after
     * creating or updating.
     * 
     * @param {string} guildId 
     * @param {string} guildMemberId 
     * @param {boolean} isAutoEventThreadNotify 
     * @returns {Promise<IDiscordGuildMemberConfig | undefined>}
     */
    public async createUpdateGuildMemberConfig(
        guildId: string,
        guildMemberId: string,
        isAutoEventThreadNotify?: boolean ): Promise<IDiscordGuildMemberConfig | undefined> {
        
        let result: IDiscordGuildMemberConfig | undefined;
        try {
            if ( !this.firestore || !this.guildMemberConfigs )
                throw new Error( 'Firebase client is not initialized.' );

            result = await this.getGuildMemberConfigById( guildId, guildMemberId );

            // Doesn't exist yet; create one.
            if ( !result ) {
                result = await this.createGuildMemberConfig(
                    guildId,
                    guildMemberId,
                    isAutoEventThreadNotify );
            }

            // Already exists; update it.
            else {
                result = await this.updateGuildMemberConfig(
                    guildId,
                    guildMemberId,
                    isAutoEventThreadNotify );
            }
        } catch ( err ) {
            console.warn( `🛑 Failed to create or update Discord guild member config for member "${guildMemberId}" in guild "${guildId}".`, err );
        }

        return result;
    }

    /**
     * Fetches a Discord server's Crofty configuration by ID.
     * 
     * @param {string} guildId 
     * @returns {Promise<IDiscordGuildConfig | undefined>}
     */
    public async getGuildConfigById( guildId: string )
        : Promise<IDiscordGuildConfig | undefined> {
        
        let result: IDiscordGuildConfig | undefined;
        try {
            if ( !this.firestore || !this.guildConfigs )
                throw new Error( 'Firebase client is not initialized.' );

            const query = await this.guildConfigs
                .where( 'guildId', '==', guildId )
                .get();

            if ( !query.empty )
                result = query.docs[ 0 ].data();
        } catch ( err ) {
            console.warn( `🛑 Failed fetching Discord guild config for "${guildId}".`, err );
        }

        return result;
    }

    /**
     * Fetches a Discord server member's Crofty configuration by ID.
     * 
     * @param {string} guildId 
     * @param {string} guildMemberId 
     * @returns {Promise<IDiscordGuildMemberConfig | undefined>}
     */
    public async getGuildMemberConfigById( guildId: string, guildMemberId: string )
        : Promise<IDiscordGuildMemberConfig | undefined> {
        
        let result: IDiscordGuildMemberConfig | undefined;
        try {
            if ( !this.firestore || !this.guildMemberConfigs )
                throw new Error( 'Firebase client is not initialized.' );

            const query = await this.guildMemberConfigs
                .where( 'guildId', '==', guildId )
                .where( 'guildMemberId', '==', guildMemberId )
                .get();

            if ( !query.empty )
                result = query.docs[ 0 ].data();
        } catch ( err ) {
            console.warn( `🛑 Failed fetching Discord guild config for "${guildId}".`, err );
        }

        return result;
    }

    /**
     * Fetches a collection of Crofty configuration for a Discord server's
     * members in which the member has enabled notification for auto-created
     * event threads.
     * 
     * @param {string} guildId 
     * @returns {Promise<IDiscordGuildMemberConfig[]>}
     */
    public async getGuildMembersWithAutoEventThreadNotify( guildId: string )
        : Promise<IDiscordGuildMemberConfig[]> {
        
        return await this.getGuildMemberConfigsByCondition( guildId, true );
    }

    /**
     * Fetches a collection of Crofty configurations for Discord servers in which
     * the server has enabled auto-event thread creation.
     * 
     * @returns {Promise<IDiscordGuildConfig[]>}
     */
    public async getGuildsWithAutoEventThreads(): Promise<IDiscordGuildConfig[]> {
        return await this.getGuildConfigsByCondition( true );
    }

    /**
     * Fetches a collection of Crofty configurations for Discord servers in which
     * the server has enabled auto-news reports.
     * 
     * @returns {Promise<IDiscordGuildConfig[]>}
     */
    public async getGuildsWithAutoNewsReports(): Promise<IDiscordGuildConfig[]> {
        return await this.getGuildConfigsByCondition( false, true );
    }

    /**
     * Creates a new Discord server configuration for Crofty, and returns the
     * new configuration if the operation is successful.
     * 
     * @param guildId 
     * @param isAutoEventThreadEnabled 
     * @param autoEventThreadChannelId 
     * @param isAutoNewsReportEnabled 
     * @param autoNewsReportChannelId 
     * @returns {Promise<IDiscordGuildConfig | undefined>}
     */
    private async createGuildConfig(
        guildId: string,
        isAutoEventThreadEnabled?: boolean,
        autoEventThreadChannelId?: string,
        isAutoNewsReportEnabled?: boolean,
        autoNewsReportChannelId?: string ): Promise<IDiscordGuildConfig | undefined> {
        
        let result: IDiscordGuildConfig | undefined;
        try {
            if ( !this.firestore || !this.guildConfigs )
                throw new Error( 'Firebase client is not initialized.' );

            await this.guildConfigs.add({
                guildId,
                isAutoEventThreadEnabled: isAutoEventThreadEnabled || false,
                isAutoNewsEnabled: isAutoNewsReportEnabled || false,
                autoEventThreadChannelId: autoEventThreadChannelId || null,
                autoNewsChannelId: autoNewsReportChannelId || null
            });

            result = await this.getGuildConfigById( guildId );
        } catch ( err ) {
            console.warn( `🛑 Failed to create Discord guild config for "${guildId}".`, err );
        }

        return result;
    }

    /**
     * Creates a new Discord server member configuration for Crofty, and returns
     * the new configuration if the operation is successful.
     * 
     * @param {string} guildId 
     * @param {string} guildMemberId 
     * @param {boolean} isAutoEventThreadNotify 
     * @returns {Promise<IDiscordGuildMemberConfig | undefined>}
     */
    private async createGuildMemberConfig(
        guildId: string,
        guildMemberId: string,
        isAutoEventThreadNotify?: boolean ): Promise<IDiscordGuildMemberConfig | undefined> {
        
        let result: IDiscordGuildMemberConfig | undefined;
        try {
            if ( !this.firestore || !this.guildMemberConfigs )
                throw new Error( 'Firebase client is not initialized.' );
            
            await this.guildMemberConfigs.add({
                guildId,
                guildMemberId,
                isAutoEventThreadNotify: isAutoEventThreadNotify || false
            });

            result = await this.getGuildMemberConfigById( guildId, guildMemberId );
        } catch ( err ) {
            console.warn( `🛑 Failed to create Discord guild config for member ID "${guildMemberId}" in guild "${guildId}".`, err );
        }

        return result;
    }

    /**
     * Fetches a collection of Crofty configurations for Discord servers based on
     * whether a specific feature is enabled. Only one of the following should be
     * passed, and if both are `true` only *forAutoEventThreads* will be honored.
     * 
     * - **forAutoEventThreads** `true` will fetch only those configurations in
     * which the server has enabled auto-event thread creation, *and has set a
     * target channel ID.*
     * 
     * - **forAutoNewsReports** `true` will fetch only those configurations in
     * which the server has enabled auto-news reports, *and has set a target
     * channel ID.*
     * 
     * @param {boolean} forAutoEventThreads 
     * @param {boolean} forAutoNewsReports 
     * @returns {Promise<IDiscordGuildConfig[]>}
     */
    private async getGuildConfigsByCondition(
        forAutoEventThreads: boolean = false,
        forAutoNewsReports: boolean = false ): Promise<IDiscordGuildConfig[]> {
        
        let results: IDiscordGuildConfig[] = [];
        try {
            if ( !this.firestore || !this.guildConfigs )
                throw new Error( 'Firebase client is not initialized.' );
            
            let q: Query | undefined;

            // Fetch guilds with auto-event thread creation enabled.
            if ( forAutoEventThreads )
                q = this.guildConfigs
                    .where( 'isAutoEventThreadEnabled', '==', true );

            // Fetch guilds with auto-news report creation enabled.
            else if ( forAutoNewsReports )
                q = this.guildConfigs
                    .where( 'isAutoNewsEnabled', '==', true );

            // Fetch everything.
            else
                q = this.guildConfigs;

            const query = await q.get();
            if ( !query.empty ) {
                results = query.docs
                    .map( doc => doc.data() as IDiscordGuildConfig )
                    .filter( doc => {
                        if ( forAutoEventThreads )
                            return doc.autoEventThreadChannelId !== null &&
                                doc.autoEventThreadChannelId !== '';

                        if ( forAutoNewsReports )
                            return doc.autoNewsChannelId !== null &&
                                doc.autoNewsChannelId !== '';

                        return true;
                    });
            }
        } catch ( err ) {
            console.warn( `🛑 Failed fetching Discord guild configs.`, err );
        }

        return results;
    }

    /**
     * Fetches a collection of Crofty configurations for a Discord server's
     * members based on whether a specific feature is enabled. Only one of the
     * following should be passed, and if more are `true` only *forAutoEventThreads*
     * will be honored.
     * 
     * - **forAutoEventThreads** `true` will fetch only those configurations in
     * which the server member has enabled notification when an event thread is
     * auto-created.
     * 
     * @param {string} guildId 
     * @param {boolean} forAutoEventThreads 
     * @returns {Promise<IDiscordGuildMemberConfig[]>}
     */
    private async getGuildMemberConfigsByCondition(
        guildId: string,
        forAutoEventThreads: boolean = false ): Promise<IDiscordGuildMemberConfig[]> {
        
        let results: IDiscordGuildMemberConfig[] = [];
        try {
            if ( !this.firestore || !this.guildMemberConfigs )
                throw new Error( 'Firebase client is not initialized.' );

            let q: Query = this.guildMemberConfigs
                .where( 'guildId', '==', guildId );

            // Fetch members with auto-event thread notification enabled.
            if ( forAutoEventThreads )
                q = q.where( 'isAutoEventThreadNotify', '==', true );

            const query = await q.get();
            if ( !query.empty ) {
                results = query.docs
                    .map( doc => doc.data() as IDiscordGuildMemberConfig );
            }
        } catch ( err ) {
            console.warn( `🛑 Failed fetching Discord guild member configs.`, err );
        }

        return results;
    }

    /**
     * Updates an existing Discord server configuration for Crofty, and returns
     * the updated configuration if the operation is successful.
     * 
     * @param {string} guildId 
     * @param {boolean} isAutoEventThreadEnabled 
     * @param {string} autoEventThreadChannelId 
     * @param {boolean} isAutoNewsReportEnabled 
     * @param {string} autoNewsReportChannelId 
     * @returns {Promise<IDiscordGuildConfig | undefined>}
     */
    private async updateGuildConfig(
        guildId: string,
        isAutoEventThreadEnabled?: boolean,
        autoEventThreadChannelId?: string,
        isAutoNewsReportEnabled?: boolean,
        autoNewsReportChannelId?: string ): Promise<IDiscordGuildConfig | undefined> {
        
        let result: IDiscordGuildConfig | undefined;
        try {
            if ( !this.firestore || !this.guildConfigs )
                throw new Error( 'Firebase client is not initialized.' );

            const query = await this.guildConfigs
                .where( 'guildId', '==', guildId )
                .get();

            if ( query.empty )
                throw new Error( 'No document found.' );

            const config = query.docs[ 0 ];
            const data = config.data();

            // Coalesce auto-event thread enablement.
            const isAutoEvent = ( isAutoEventThreadEnabled === undefined )
                ? data.isAutoEventThreadEnabled
                : isAutoEventThreadEnabled;

            // Coalesce auto-event thread channel ID.
            const autoEventChannel = ( autoEventThreadChannelId === undefined )
                ? data.autoEventThreadChannelId
                : autoEventThreadChannelId;

            // Coalesce auto-news report enablement.
            const isAutoNews = ( isAutoNewsReportEnabled === undefined )
                ? data.isAutoNewsEnabled
                : isAutoNewsReportEnabled;

            // Coalesce auto-news report channel ID.
            const autoNewsChannel = ( autoNewsReportChannelId === undefined )
                ? data.autoNewsChannelId
                : autoNewsReportChannelId;

            // Updoot.
            await this.guildConfigs.doc( config.id ).update({
                isAutoEventThreadEnabled: isAutoEvent,
                autoEventThreadChannelId: autoEventChannel,
                isAutoNewsEnabled: isAutoNews,
                autoNewsChannelId: autoNewsChannel
            });

            result = await this.getGuildConfigById( data.guildId );
        } catch ( err ) {
            console.warn( `🛑 Failed to update Discord guild config for "${guildId}".`, err );
        }

        return result;
    }

    /**
     * Updates an existing Discord server member configuration for Crofty, and
     * returns the updated configuration if the operation is successful.
     * 
     * @param {string} guildId 
     * @param {string} guildMemberId 
     * @param {boolean} isAutoEventThreadNotify 
     * @returns {Promise<IDiscordGuildMemberConfig | undefined>}
     */
    private async updateGuildMemberConfig(
        guildId: string,
        guildMemberId: string,
        isAutoEventThreadNotify?: boolean ): Promise<IDiscordGuildMemberConfig | undefined> {
        
        let result: IDiscordGuildMemberConfig | undefined;
        try {
            if ( !this.firestore || !this.guildMemberConfigs )
                throw new Error( 'Firebase client is not initialized.' );

            const query = await this.guildMemberConfigs
                .where( 'guildId', '==', guildId )
                .where( 'guildMemberId', '==', guildMemberId )
                .get();

            if ( query.empty )
                throw new Error( 'No document found.' );

            const config = query.docs[ 0 ];
            const data = config.data();

            // Coalesce auto-event thread notification.
            const isAutoEvent = ( isAutoEventThreadNotify === undefined )
                ? data.isAutoEventThreadNotify
                : isAutoEventThreadNotify;

            // Updoot.
            await this.guildMemberConfigs.doc( config.id ).update({
                isAutoEventThreadNotify: isAutoEvent
            });

            result = await this.getGuildMemberConfigById( data.guildId, data.guildMemberId );
        } catch ( err ) {
            console.warn( `🛑 Failed to update Discord guild config for member ID "${guildMemberId}" in guild "${guildId}".`, err );
        }

        return result;
    }

    /**
     * Fetches a reference to a Firestore collection.
     * 
     * @param {string} name 
     * @returns {CollectionReference<T>}
     */
    private getCollection<T = DocumentData>( name: string )
        : CollectionReference<T> {
        
        if ( !this.firestore )
            throw new Error( 'Firebase client is not initialized.' );

        return this.firestore.collection( name ) as CollectionReference<T>;
    }
}

/**
 * Singleton instance of the Firestore API.
 */
export const firestoreAPI = new FirestoreAPI(
    undefined,
    new firebase.FirebaseCredentials() );
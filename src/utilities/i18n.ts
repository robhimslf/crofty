import path from 'path';
import i18next from 'i18next';
import type { TFunction } from 'i18next';
import Backend from 'i18next-fs-backend';
import { Message } from 'discord.js';
import { environment } from './environment.js';
import { getGuildMember } from './disco.js';

type GenericObject = {
    [ key: string ]: any
};

type DiscordValues = {
    admin: string;
    sender: string;
}

export class I18n {

    /**
     * Relative path pattern to an i18n strings file for missing keys.
     */
    private static addPathPattern: string = '../../../i18n/{{lng}}/{{ns}}.missing.json';

    /**
     * Relative path pattern to an i18n strings file.
     */
    private static loadPathPattern: string = '../../../i18n/{{lng}}/{{ns}}.json';

    /**
     * Translation function populated after initialization.
     */
    translate: TFunction | undefined;

    /**
     * Constructs and initializes the i18n helper.
     */
    constructor() {
        this.init();
    }

    /**
     * Fetches an i18n string translation by key.
     * 
     * @param {string} key 
     */
    t( key: string ): string;

    /**
     * Fetches an i18n string translation by key, and accounts for interpolation
     * parameters.
     * 
     * @param {string} key 
     * @param {Message | GenericObject} values 
     */
    t( key: string, values: Message | GenericObject ): string;

    /**
     * Fetches an i18n string translation by namespace and key.
     * 
     * @param {string} ns 
     * @param {string} key 
     */
    t( ns: string, key: string ): string;

    /**
     * Fetches an i18n string translation by namespace and key, and accounts for
     * interpolation parameters.
     * 
     * @param {string} ns 
     * @param {string} key 
     * @param {Message | GenericObject} values 
     */
    t( ns: string, key: string, values: Message | GenericObject ): string;

    /**
     * Fetches an i18n string translation by key, optionally accounting for
     * namespace and interpolation parameters.
     * 
     * @param {string} nsKey 
     * @param {string | Message | GenericObject} keyValuesMessage 
     * @param {Message | GenericObject} valuesMessage 
     * @returns {string}
     */
    t(
        nsKey: string,
        keyValuesMessage?: string | Message | GenericObject,
        valuesMessage?: Message | GenericObject ): string {
        
        let result = '';
        try {

            let ns = 'general',
                key = '',
                values = {};

            // Overload(s) without namespace.
            if ( keyValuesMessage === undefined ||
                typeof keyValuesMessage !== 'string' ) {
                
                key = nsKey;

                // Handle interpolation params.
                if ( keyValuesMessage ) {

                    // Discord.
                    if ( keyValuesMessage instanceof Message )
                        values = this.getDiscordInterpolationValues(
                            keyValuesMessage );

                    // Generic object.
                    else
                        values = keyValuesMessage as GenericObject;
                }

                // Super unlikely, but handle it anyway.
                if ( valuesMessage ) {

                    // Discord.
                    if ( keyValuesMessage instanceof Message )
                        values = {
                            ...values,
                            ...this.getDiscordInterpolationValues(
                                keyValuesMessage )
                        };

                    // Generic object.
                    else
                        values = {
                            ...values,
                            ...keyValuesMessage as GenericObject
                        };
                }
            }

            // Overload(s) with namespace.
            else if ( typeof keyValuesMessage === 'string' ) {
                ns = nsKey;
                key = keyValuesMessage;

                // Handle interpolation params.
                if ( valuesMessage ) {

                    // Discord.
                    if ( valuesMessage instanceof Message )
                        values = this.getDiscordInterpolationValues(
                            valuesMessage );

                    // Generic object.
                    else
                        values = valuesMessage as GenericObject;
                }
            }

            result = this.translate!( key, {
                ...values,
                ns
            });
        } catch ( err ) {
            console.warn( `🛑 Failed fetching i18n translation.`, err );
        }

        return result;
    }

    /**
     * Initializes i18n configuration using static file system resources.
     */
    private init() {
        const addPath = path
            .join( import.meta.url, I18n.addPathPattern )
            .replace( 'file:\\', '' );
        const loadPath = path
            .join( import.meta.url, I18n.loadPathPattern )
            .replace( 'file:\\', '' );

        i18next
            .use( Backend )
            .init({
                backend: {
                    addPath,
                    loadPath
                },
                debug: true,
                ns: [ 'chat', 'general' ],
                defaultNS: 'general',
                supportedLngs: [ 'en' ],
                fallbackLng: 'en',
                lng: 'en',
                initImmediate: false,
                interpolation: {
                    escapeValue: false
                }
            });

        this.translate = i18next.t;
    }

    /**
     * Fetches an interpolation object of values supported by Crofty from a
     * Discord message.
     * 
     * @param {Message} message 
     * @returns {DiscordValues}
     */
    private getDiscordInterpolationValues( message: Message ): DiscordValues {
        const admin = getGuildMember( environment.ServerAdmin!, message );

        return {
            admin: ( admin )
                ? `<@${admin.id}>`
                : this.translate!( 'common.admin' ),
            sender: `<@${message.author.id}>`
        };
    }
}

/**
 * Singleton instance of the i18n helper.
 */
export const i18n = new I18n();
import { Message } from 'discord.js';
import { environment } from './environment.js';
import { getGuildMember } from './disco.js';

/**
 * Interpolation token to be replaced with the developer's mention (e.g., @Username).
 */
const DEV = '#DEV#';

/**
 * Interpolation token to be replaced with the message sender's mention (e.g., @Username).
 */
const SENDER = '#SENDER#';

/**
 * Crofty's recognized string interpolation tokens.
 */
const tokens = [ DEV, SENDER ] as const;

/**
 * Crofty's recognized string interpolation tokens, strongly typed.
 */
type Token = typeof tokens[ number ];

/**
 * Dynamically replaces tokens in a string with their intended values.
 * 
 * @param {string} stringVal 
 * @param {object} values 
 * @returns {string}
 */
export const interpolate = ( stringVal: string, values: {[key: string]: any }): string => {
    Object.keys( values ).forEach(( k: string ) => {
        
        const token = `#${k.toUpperCase()}#`;
        if ( stringVal.includes( token ))
            stringVal = stringVal.replace( token, values[ k ]);
    });

    return stringVal;
}

/**
 * Dynamically replaces tokens in a string with their intended Discord message
 * values.
 * 
 * @param {string} stringVal 
 * @param {Message} message 
 * @returns {string}
 */
export const interpolateFromMessage = ( stringVal: string, message: Message ): string => {
    tokens.forEach(( t: Token ) => {
        if ( stringVal.includes( t )) {
            let replacement = '';

            switch ( t ) {
                case DEV: {
                    const dev = getGuildMember( environment.BotDev!, message );
                    replacement = ( dev )
                        ? `<@${dev.id}>`
                        : 'my creator';
                    break;
                }

                case SENDER: {
                    replacement = `<@${message.author.id}>`;
                    break;
                }

                default:
                    break;
            }

            stringVal = stringVal.replace( t, replacement );
        }
    });

    return stringVal;
};

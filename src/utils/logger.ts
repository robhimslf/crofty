import { DiscordAPIError } from 'discord.js';
import { Response } from 'node-fetch';
import { createRequire } from 'node:module';
import pino from 'pino';

const require = createRequire( import.meta.url );
const config = require( '../../config/config.json' );

let logger = pino({
    formatters: {
        level: label => ({ level: label }),
    }
}, config.logging.pretty
    ? pino.transport({
        target: 'pino-pretty',
        options: {
            colorize: true,
            ignore: 'pid,hostname',
            translateTime: 'mm-dd-yyyy HH:MM:ss.l'
        }
    })
    : undefined
);

export class Logger {
    private static SHARD_ID: number;

    public static async error( message: string, obj?: any ): Promise<void> {
        if ( !obj ) {
            logger.error( message );
            return;
        }

        if ( typeof obj === 'string' )
            logger
                .child({ message: obj })
                .error( message );

        else if ( obj instanceof Response ) {
            let responseText = '';
            try {
                responseText = await obj.text();
            } catch {
                // do nothing
            }

            logger
                .child({
                    path: obj.url,
                    statusCode: obj.status,
                    statusText: obj.statusText,
                    headers: obj.headers.raw(),
                    body: responseText
                })
                .error( message );
        }

        else if ( obj instanceof DiscordAPIError )
            logger
                .child({
                    message: obj.message,
                    code: obj.code,
                    statusCode: obj.status,
                    method: obj.method,
                    url: obj.url,
                    stack: obj.stack
                })
                .error( message );

        else logger.error( obj, message );
    }

    public static info( message: string, obj?: any ): void {
        if ( obj ) logger.info( obj, message );
        else logger.info( message );
    }

    public static warn( message: string, obj?: any ): void {
        if ( obj ) logger.warn( obj, message );
        else logger.warn( message );
    }

    public static setShardId( shardId: number ): void {
        if ( this.SHARD_ID !== shardId ) {
            this.SHARD_ID = shardId;
            logger = logger.child({ shardId });
        }
    }
}

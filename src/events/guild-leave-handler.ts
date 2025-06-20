import { Guild } from 'discord.js';
import { createRequire } from 'node:module';
import { Logger } from '../utils/index.js';
import { type EventHandler } from './event-handler.js';

const require = createRequire( import.meta.url );
const logs = require( '../../i18n/logs.json' );

export class GuildLeaveHandler implements EventHandler {
    public async process( guild: Guild ): Promise<void> {
        Logger.info( logs.info.guild_left
            .replaceAll( '{GUILD_NAME}', guild.name )
            .replaceAll( '{GUILD_ID}', guild.id )
        );
    }
}

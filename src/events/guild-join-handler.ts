import { Guild } from 'discord.js';
import { createRequire } from 'node:module';
import {
    ClientUtils,
    FormatUtils,
    Language,
    Logger,
    MessageUtils,
    i18n
} from '../utils/index.js';
import { EventDataService } from '../services/index.js';
import { type EventHandler } from './event-handler.js';

const require = createRequire( import.meta.url );
const logs = require( '../../i18n/logs.json' );

export class GuildJoinHandler implements EventHandler {
    constructor( private eventDataService: EventDataService ) { }

    public async process( guild: Guild ): Promise<void> {
        Logger.info( logs.info.guild_joined
            .replaceAll( '{GUILD_NAME}', guild.name )
            .replaceAll( '{GUILD_ID}', guild.id )
        );

        const owner = await guild.fetchOwner();
        const data = await this.eventDataService.create({
            user: owner?.user,
            guild
        });

        const notifyChannel = await ClientUtils.findNotificationChannel( guild, data.langGuild );
        if ( notifyChannel )
            await MessageUtils.send(
                notifyChannel,
                i18n.getEmbed( 'displayEmbeds.welcome', data.langGuild, {
                    CMD_LINK_HELP: FormatUtils.commandMention(
                        await ClientUtils.findAppCommand(
                            guild.client,
                            i18n.getRef( 'chatCommands.help', Language.DEFAULT )
                        )
                    )
                }).setAuthor({
                    name: guild.name,
                    iconURL: guild.iconURL()
                })
            );

        if ( owner )
            await MessageUtils.send(
                owner.user,
                i18n.getEmbed( 'displayEmbeds.welcome', data.lang, {
                    CMD_LINK_HELP: FormatUtils.commandMention(
                        await ClientUtils.findAppCommand(
                            guild.client,
                            i18n.getRef( 'chatCommands.help', Language.DEFAULT )
                        )
                    )
                }).setAuthor({
                    name: guild.name,
                    iconURL: guild.iconURL()
                })
            );
    }
}
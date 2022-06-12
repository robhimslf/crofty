import { CommandInteraction, Guild } from 'discord.js';
import {
    discord,
    i18n,
    stringToBoolean,
    stringValue
} from '../../../utilities/index.js';
import { FirestoreAPI } from '../../../api/index.js';
import { CommandBase, ICommandAsync } from '../command-base.js';

export class ServerAutoThreadConfig extends CommandBase implements ICommandAsync {

    /**
     * Guild associated with the interaction.
     */
    private guild: Guild | null;

    /**
     * Channel name in which to place the threads.
     */
    private channelName: string | undefined;
    
    /**
     * Whether the server has (en/dis)abled auto-threads.
     */
    private enabled: boolean | undefined;

    /**
     * Guild ID associated with the server.
     */
    private guildId: string | null;

    /**
     * Constructs, initializes, and validates the query parameters.
     * 
     * @param {CommandInteraction} interaction 
     * @param {string} enabled 
     * @param {string} channelName 
     */
    constructor(
        interaction: CommandInteraction,
        enabled?: string,
        channelName?: string  ) {

        super( interaction );

        this.guild = interaction.guild;
        if ( !this.guild )
            this.reportStatus( i18n.t( 'command.mustRunInServer' ), true );

        this.guildId = interaction.guildId;
        if ( !this.guildId )
            this.reportStatus( i18n.t( 'command.mustRunInServer' ), true );

        this.enabled = stringToBoolean( enabled );
        this.channelName = stringValue( channelName );
        
        if ( this.enabled === undefined && this.channelName === undefined )
            this.reportStatus( i18n.t( 'command.serverAutothread.invalidParams' ), true );
    }

    /**
     * Fetches and prepares the statistics for the requested driver.
     */
    async prepare() {
        let error = this.fallbackReply.content!;

        try {
            const config = await FirestoreAPI.Instance
                .getGuildConfigById( this.guildId! );

            let channel: discord.DiscordChannelType | undefined;
            if ( !this.channelName &&
                config &&
                config.autoEventThreadChannelId )
                channel = await discord.getGuildChannelById(
                    this.guild!, config.autoEventThreadChannelId );

            else if ( this.channelName )
                channel = await discord.getGuildChannelByName(
                    this.guild!, this.channelName );

            if ( this.enabled === undefined && !channel ) {
                error = i18n.t( 'command.serverAutothread.invalidChannel', {
                    channel: this.channelName
                });
                throw new Error( error );
            }

            if ( channel && !channel.isText() ) {
                error = i18n.t( 'command.serverAutothread.invalidTextChannel', {
                    channel: `<#${channel.id}>`
                });
                throw new Error( error );
            }

            let enabled = false,
                channelTag: string | undefined;

            // Nothing changed.
            if ( config &&
                config.isAutoEventThreadEnabled === this.enabled &&
                config.autoEventThreadChannelId === channel?.id ) {
                
                enabled = config.isAutoEventThreadEnabled;
                if ( channel && config.autoEventThreadChannelId === channel.id )
                    channelTag = `<#${channel.id}>`;
            }

            // Create or update.
            else {
                const updated = await FirestoreAPI.Instance.createUpdateGuildConfig(
                    this.guildId!,
                    this.enabled,
                    channel?.id
                );

                if ( !updated ) {
                    error = i18n.t( 'command.failedServerUpdate' );
                    throw new Error( error );
                }

                enabled = updated.isAutoEventThreadEnabled;
                if ( channel && updated.autoEventThreadChannelId === channel.id )
                    channelTag = `<#${channel.id}>`;
            }

            const messageKey = ( enabled )
                ? ( channelTag )
                    ? 'command.serverAutothread.enabled'
                    : 'command.serverAutothread.enabledNoChannel'
                : 'command.serverAutothread.disabled';
            const message = i18n.t( messageKey, { channel: channelTag });

            this.reportStatus( message );
        } catch ( err ) {
            console.warn( `🛑 Failed to prepare server preferences reply.`, err );
            this.reportStatus( error, true );
        }
    }
}
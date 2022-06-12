import { CommandInteraction, Guild } from 'discord.js';
import { discord, i18n, stringToBoolean, stringValue } from '../../../utilities/index.js';
import { FirestoreAPI } from '../../../api/index.js';
import { CommandBase, ICommandAsync } from '../command-base.js';

export class ServerAutoNewsConfig extends CommandBase implements ICommandAsync {

    /**
     * Guild associated with the interaction.
     */
    private guild: Guild | null;

    /**
     * Channel name in which to place the news topics.
     */
    private channelName: string | undefined;
    
    /**
     * Whether the server has (en/dis)abled news reporting.
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
            this.reportStatus( i18n.t( 'command.serverAutonews.invalidParams' ), true );
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
                error = i18n.t( 'command.serverAutonews.invalidChannel', {
                    channel: this.channelName
                });
                throw new Error( error );
            }

            if ( channel && !channel.isText() ) {
                error = i18n.t( 'command.serverAutonews.invalidTextChannel', {
                    channel: `<#${channel.id}>`
                });
                throw new Error( error );
            }            

            let enabled = false,
                channelTag: string | undefined;

            // Nothing changed.
            if ( config &&
                config.isAutoNewsEnabled === this.enabled &&
                config.autoNewsChannelId === channel?.id ) {
                
                enabled = config.isAutoNewsEnabled;
                if ( channel && config.autoNewsChannelId === channel.id )
                    channelTag = `<#${channel.id}>`;
            }

            // Create or update.
            else {
                const updated = await FirestoreAPI.Instance.createUpdateGuildConfig(
                    this.guildId!,
                    undefined,
                    undefined,
                    this.enabled,
                    channel?.id
                );

                if ( !updated ) {
                    error = i18n.t( 'command.failedServerUpdate' );
                    throw new Error( error );
                }

                enabled = updated.isAutoNewsEnabled;
                if ( channel && updated.autoNewsChannelId === channel.id )
                    channelTag = `<#${channel.id}>`;
            }

            const messageKey = ( enabled )
                ? ( channelTag )
                    ? 'command.serverAutonews.enabled'
                    : 'command.serverAutonews.enabledNoChannel'
                : 'command.serverAutonews.disabled';
            const message = i18n.t( messageKey, { channel: channelTag });

            this.reportStatus( message );
        } catch ( err ) {
            console.warn( `🛑 Failed to prepare server preferences reply.`, err );
            this.reportStatus( error, true );
        }
    }
}
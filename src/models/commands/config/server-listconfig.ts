import { CommandInteraction, EmbedFieldData, Guild } from 'discord.js';
import { discord, i18n } from '../../../utilities/index.js';
import { FirestoreAPI } from '../../../api/index.js';
import { CommandBase, ICommandAsync } from '../command-base.js';

export class ServerListConfig extends CommandBase implements ICommandAsync {

    /**
     * Guild associated with the interaction.
     */
    private guild: Guild | null;

    /**
     * Guild ID associated with the server.
     */
    private guildId: string | null;

    /**
     * Member ID associated with the configuration.
     */
    private memberId: string;

    /**
     * Constructs, initializes, and validates the query parameters.
     * 
     * @param {CommandInteraction} interaction 
     */
    constructor( interaction: CommandInteraction  ) {
        super( interaction );

        this.guild = interaction.guild;
        if ( !this.guild )
            this.reportStatus( i18n.t( 'command.mustRunInServer' ), true );

        this.guildId = interaction.guildId;
        if ( !this.guildId )
            this.reportStatus( i18n.t( 'command.mustRunInServer' ), true );

        this.memberId = interaction.user.id;
    }

    /**
     * Fetches and prepares the statistics for the requested driver.
     */
    async prepare() {
        let error = this.fallbackReply.content!;

        try {
            let serverAutoThreadEnabled = false,
                serverAutoNewsEnabled = false,
                serverAutoThreadChannel: discord.DiscordChannelType | undefined,
                serverAutoNewsChannel: discord.DiscordChannelType | undefined,
                memberEnabled = false;

            // Validate the guild configuration.
            const guildConfig = await FirestoreAPI.Instance
                .getGuildConfigById( this.guildId! );
            if ( guildConfig ) {
                serverAutoThreadEnabled = guildConfig.isAutoEventThreadEnabled;
                serverAutoNewsEnabled = guildConfig.isAutoNewsEnabled;

                if ( guildConfig.autoEventThreadChannelId )
                    serverAutoThreadChannel = await discord.getGuildChannelById(
                        this.guild!, guildConfig.autoEventThreadChannelId );

                if ( guildConfig.autoNewsChannelId )
                    serverAutoNewsChannel = await discord.getGuildChannelById(
                        this.guild!, guildConfig.autoNewsChannelId );

                if ( serverAutoThreadChannel && !serverAutoThreadChannel.isText() )
                    serverAutoThreadChannel = undefined;

                if ( serverAutoNewsChannel && !serverAutoNewsChannel.isText() )
                    serverAutoNewsChannel = undefined;
            }

            const memberConfig = await FirestoreAPI.Instance
                .getGuildMemberConfigById( this.guildId!, this.memberId );
            if ( memberConfig && memberConfig.isAutoEventThreadNotify )
                memberEnabled = true;

            const title = i18n.t( 'embed.configList.title' );
            const settingNames = [
                'Auto-News',
                `- Enabled`,
                '- Channel',
                '\u200b',
                'Auto-Race Threads',
                '- Enabled',
                '- Channel',
                '\u200b',
                'Auto-Tag on Race Threads',
                '- Enabled'
            ];

            const settingValues = [
                '\u200b',
                serverAutoNewsEnabled ? '*Yes*' : '*No*',
                serverAutoNewsChannel ? `<#${serverAutoNewsChannel.id}>` : 'n/a',
                '\u200b',
                '\u200b',
                serverAutoThreadEnabled ? '*Yes*' : '*No*',
                serverAutoThreadChannel ? `<#${serverAutoThreadChannel.id}>` : 'n/a',
                '\u200b',
                '\u200b',
                memberEnabled ? '*Yes*' : '*No*'
            ];

            const settingContexts = [
                '\u200b',
                'Server',
                'Server',
                '\u200b',
                '\u200b',
                'Server',
                'Server',
                '\u200b',
                '\u200b',
                `<@${this.memberId}>`
            ];

            const fields: EmbedFieldData[] = [
                { name: i18n.t( 'embed.configList.fields.setting' ), value: settingNames.join( '\n' ), inline: true },
                { name: i18n.t( 'embed.configList.fields.value' ), value: settingValues.join( '\n' ), inline: true },
                { name: i18n.t( 'embed.configList.fields.appliesTo' ), value: settingContexts.join( '\n' ), inline: true }
            ];
            
            this.createEmbed( title, '', fields );
        } catch ( err ) {
            console.warn( `🛑 Failed to fetch preferences reply.`, err );
            this.reportStatus( error, true );
        }
    }
}
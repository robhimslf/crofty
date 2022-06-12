import { CommandInteraction, Guild } from 'discord.js';
import { discord, i18n, stringToBoolean } from '../../../utilities/index.js';
import { FirestoreAPI } from '../../../api/index.js';
import { CommandBase, ICommandAsync } from '../command-base.js';

export class MemberAutotagConfig extends CommandBase implements ICommandAsync {

    /**
     * Guild associated with the interaction.
     */
    private guild: Guild | null;
    
    /**
     * Whether the member has (en/dis)abled auto-tagging.
     */
    private enabled: boolean;

    /**
     * Guild ID associated with the member.
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
     * @param {string} enabled 
     */
    constructor( interaction: CommandInteraction, enabled?: string  ) {
        super( interaction );

        this.guild = interaction.guild;
        if ( !this.guild )
            this.reportStatus( i18n.t( 'command.mustRunInServer' ), true );

        this.guildId = interaction.guildId;
        if ( !this.guildId )
            this.reportStatus( i18n.t( 'command.mustRunInServer' ), true );

        this.enabled = stringToBoolean( enabled ) ?? false;
        this.memberId = interaction.user.id;
    }

    /**
     * Fetches and prepares the statistics for the requested driver.
     */
    async prepare() {
        let error = this.fallbackReply.content!;

        try {

            // Validate the guild configuration.
            const guildConfig = await FirestoreAPI.Instance
                .getGuildConfigById( this.guildId! );
            if ( !guildConfig ||
                !guildConfig.isAutoEventThreadEnabled ||
                guildConfig.autoEventThreadChannelId === null ) {
                error = i18n.t( 'command.memberAutotag.notConfigured' );
                throw new Error( error );
            }

            // Validate the guild channel.
            const channel = await discord.getGuildChannelById(
                this.guild!, guildConfig.autoEventThreadChannelId );
            if ( !channel || !channel.isText() ) {
                error = i18n.t( 'command.memberAutotag.misconfigured' );
                throw new Error( error );
            }

            const memberConfig = await FirestoreAPI.Instance
                .getGuildMemberConfigById( this.guildId!, this.memberId );

            let enabled = false;

            // Nothing changed.
            if ( memberConfig && memberConfig.isAutoEventThreadNotify === this.enabled )
                enabled = memberConfig.isAutoEventThreadNotify;

            // Create or update.
            else {
                const updated = await FirestoreAPI.Instance.createUpdateGuildMemberConfig(
                    this.guildId!, this.memberId!, this.enabled );

                if ( !updated ) {
                    error = i18n.t( 'command.memberAutotag.failed' );
                    throw new Error( error );
                }

                enabled = updated.isAutoEventThreadNotify;
            }

            const messageKey = ( enabled )
                ? 'command.memberAutotag.enabled'
                : 'command.memberAutotag.disabled';
            const message = i18n.t( messageKey, { channel: `<#${channel.id}>` });

            this.reportStatus( message );
        } catch ( err ) {
            console.warn( `🛑 Failed to prepare user preferences reply.`, err );
            this.reportStatus( error, true );
        }
    }
}
import { CommandInteraction } from 'discord.js';
import {
    Discord,
    Slash,
    SlashChoice,
    SlashGroup,
    SlashOption
} from 'discordx';
import {
    constants,
    discord,
    stringToBoolean
} from '../utilities/index.js';
import { FirestoreAPI } from '../api/index.js';

@Discord()
@SlashGroup({
    name: 'me',
    description: `Configure your personal opt-in settings for Crofty.`
})
class me {

    /**
     * Handles configuration of tagging on auto-created race threads for the
     * member's server.
     * 
     * @param {string} enabledParam 
     * @param {CommandInteraction} interaction 
     */
    @Slash( 'autotag', { description: `Configure whether Crofty tags you in auto-created race threads on this server.` })
    @SlashGroup( 'me' )
    async toggleRaceThreadNotify(
        @SlashChoice( 'yes', 'no' )
        @SlashOption( 'enabled', { description: 'Should Crofty tag you in auto-created race threads?', required: true }) enabledParam: string,
        interaction: CommandInteraction ) {

        const enabled = stringToBoolean( enabledParam ) || false;
        let error: string = constants.Strings.FallbackInteractionResponse;

        try {
            if ( !interaction.guildId ) {
                error = 'Please run this command from within a server channel.';
                throw new Error( error );
            }

            const guildConfig = await FirestoreAPI.Instance.getGuildConfigById( interaction.guildId );
            if ( !guildConfig ||
                !guildConfig.isAutoEventThreadEnabled ||
                guildConfig.autoEventThreadChannelId === null ) {
                error = `Crofty is not configured for auto-created race threads on this server, and requires the server owner to configure Crofty.`;
                throw new Error( error );
            }

            // Validate the previously-configured channel.
            const channel = await discord.getGuildChannelById(
                interaction.guild!, guildConfig.autoEventThreadChannelId );
            if ( !channel || !channel.isText() ) {
                error = `Crofty can only be configured to auto-create race threads in text channels. This requires the server owner to reconfigure Crofty.`;
                throw new Error( error );
            }

            const memberConfig = await FirestoreAPI.Instance.getGuildMemberConfigById(
                interaction.guildId, interaction.user.id );

            // Prepare the reply.
            let reply = '';

            // Nothing changed.
            if ( memberConfig &&
                memberConfig.isAutoEventThreadNotify === enabled ) {
                
                reply = ( memberConfig.isAutoEventThreadNotify )
                    ? `Crofty will continue to **tag** you on auto-created race threads in the <#${channel.id}> channel.`
                    : `Crofty will continue to **not tag** you on auto-created race threads in this server.`;
            }

            // Create or modify needed.
            else {
                const updated = await FirestoreAPI.Instance.createUpdateGuildMemberConfig(
                    interaction.guildId,
                    interaction.user.id,
                    enabled );

                if ( !updated )
                    throw new Error( 'Failed to create or update guild member configuration.' );

                reply = ( updated.isAutoEventThreadNotify )
                    ? `Crofty will **tag** you on auto-created race threads in the <#${channel.id}> channel.`
                    : `Crofty will **not tag** you on auto-created race threads in this server.`;
            }

            await interaction.reply( reply );
        } catch ( err ) {
            console.warn( `🛑 Failed '/me autotag' command.`, err );
            await interaction.reply( error );
        }
    }
}
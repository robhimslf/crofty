import { CommandInteraction } from 'discord.js';
import {
    Discord,
    Permission,
    Slash,
    SlashChoice,
    SlashGroup,
    SlashOption
} from 'discordx';
import {
    constants,
    discord,
    stringToBoolean,
    stringValue
} from '../utilities/index.js';
import { FirestoreAPI } from '../api/index.js';

@Discord()
@Permission( false )
@Permission( discord.administrativeRoleResolver )
@SlashGroup({
    name: 'server',
    description: `Configure Crofty's server-level functionality. **Requires administrative rights on the server.**`
})
class server {

    /**
     * Handles configuration of race thread auto-create for a guild (server).
     * 
     * @param {string} enabledParam 
     * @param {string} channelParam 
     * @param {CommandInteraction} interaction 
     */
    @Slash( 'autothread', { description: `Configuration of Crofty's race thread auto-creation functionality.` })
    @SlashGroup( 'server' )
    async toggleRaceThreadCreation(
        @SlashChoice( 'yes', 'no' )
        @SlashOption( 'enabled', { description: 'Should Crofty auto-create race threads?', required: false }) enabledParam: string,
        @SlashOption( 'channel', { description: 'Text channel in which Crofty should auto-create race threads.', required: false }) channelParam: string,
        interaction: CommandInteraction ) {
        
        const enabled = stringToBoolean( enabledParam );
        const channelName = stringValue( channelParam );
        let error: string = constants.Strings.FallbackInteractionResponse;

        try {
            if ( enabled === undefined && channelName === undefined ) {
                error = `One or both of 'enabled' or 'channel' is required.`;
                throw new Error( error );
            }

            if ( !interaction.guildId ) {
                error = 'Please run this command from within a server channel.';
                throw new Error( error );
            }

            const config = await FirestoreAPI.Instance.getGuildConfigById( interaction.guildId );

            // Resolve the channel...
            let channel: discord.DiscordChannelType | undefined;

            // ...from a previous configured ID.
            if ( !channelName &&
                config &&
                config.autoEventThreadChannelId )
                channel = await discord.getGuildChannelById(
                    interaction.guild!, config.autoEventThreadChannelId );

            // ...from the provided channel name.
            else if ( channelName )
                channel = await discord.getGuildChannelByName(
                    interaction.guild!, channelName );

            // Validate that a previously configured channel still exists.
            if ( enabled === undefined && !channel ) {
                error = `Channel "${channelParam}" was not found on this server.`;
                throw new Error( error );
            }

            // Validate that it's a text channel.
            if ( channel && !channel.isText() ) {
                error = `<#${channel.id}> is not a valid text channel.`;
                throw new Error( error );
            }

            // Prepare the reply.
            let enabledReply = '',
                channelReply = '';

            // Nothing changed.
            if ( config &&
                config.isAutoEventThreadEnabled === enabled &&
                config.autoEventThreadChannelId === channel?.id ) {
                
                enabledReply = ( config.isAutoEventThreadEnabled )
                    ? 'enabled'
                    : 'disabled';
                channelReply = ( channel && config.autoEventThreadChannelId === channel.id )
                    ? `and will use the <#${channel.id}> channel.`
                    : 'but a parent text channel has not been set. Run `/server_config race_threads`, and provide the `channel` parameter.';
            }

            // Create or modify needed.
            else {
                const updated = await FirestoreAPI.Instance.createUpdateGuildConfig(
                    interaction.guildId,
                    enabled,
                    channel?.id
                );

                if ( !updated )
                    throw new Error( 'Failed to create or update guild configuration.' );

                enabledReply = ( updated.isAutoEventThreadEnabled )
                    ? 'enabled'
                    : 'disabled';
                channelReply = ( channel && updated.autoEventThreadChannelId === channel.id )
                    ? `and will use the <#${channel.id}> channel.`
                    : 'but a parent text channel has not been set. Run `/server_config race_threads`, and provide the `channel` parameter.';
            }

            await interaction.reply( `Race thread auto-creation is **${enabledReply.toUpperCase()}**, ${channelReply}` );
        } catch ( err ) {
            console.warn( `🛑 Failed '/server autothread' command.`, err );
            await interaction.reply( error );
        }
    }
}
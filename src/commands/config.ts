import { CommandInteraction } from 'discord.js';
import {
    Discord,
    Permission,
    Slash,
    SlashChoice,
    SlashGroup,
    SlashOption
} from 'discordx';
import { discord } from '../utilities/index.js';
import {
    MemberAutotagConfig,
    ServerAutoNewsConfig,
    ServerAutoThreadConfig,
    ServerListConfig
} from '../models/index.js';

@Discord()
@SlashGroup({
    name: 'config',
    description: `Configure Crofty's user- or server-level functionality.`
})
@SlashGroup({ name: 'me', root: 'config' })
@SlashGroup({ name: 'server', root: 'config' })
class config {

    /**
     * Handles configuration of tagging on auto-created race threads for the
     * member's server.
     * 
     * @param {string} enabledParam 
     * @param {CommandInteraction} interaction 
     */
    @Slash( 'autotag', { description: `Configure whether Crofty tags you in auto-created grand prix threads on this server.` })
    @SlashGroup( 'me', 'config' )
    async meAutotag(
        @SlashChoice( 'yes', 'no' )
        @SlashOption( 'enabled', { description: 'Should Crofty tag you in auto-created grand prix threads?', required: true }) enabledParam: string,
        interaction: CommandInteraction ) {
        
        const command = new MemberAutotagConfig( interaction, enabledParam );
        if ( command.reply )
            return await interaction.reply( command.reply );

        await interaction.channel?.sendTyping();
        try {
            await command.prepare();
        } catch ( err ) {
            console.warn( 'Failed `/config me autotag` command.', err );
        }

        await interaction.reply( command.reply! );
    }

    /**
     * Handles configuration of race thread auto-create for a guild (server).
     * 
     * @param {string} enabledParam 
     * @param {string} channelParam 
     * @param {CommandInteraction} interaction 
     */
    @Slash( 'autonews', { description: `Configure whether Crofty auto-reports daily Formula 1 news on this server.` })
    @SlashGroup( 'server', 'config' )
    @Permission( false )
    @Permission( discord.administrativeRoleResolver )
    async serverAutoNews(
        @SlashChoice( 'yes', 'no' )
        @SlashOption( 'enabled', { description: 'Should Crofty auto-report daily Formula 1 news?', required: false }) enabledParam: string,
        @SlashOption( 'channel', { description: 'Text channel in which Crofty should auto-create daily news topics.', required: false }) channelParam: string,
        interaction: CommandInteraction ) {
        
        const command = new ServerAutoNewsConfig( interaction, enabledParam, channelParam );
        if ( command.reply )
            return await interaction.reply( command.reply );

        await interaction.channel?.sendTyping();
        try {
        await command.prepare();
    } catch ( err ) {
        console.warn( 'Failed `/config server autonews` command.', err );
    }
        await interaction.reply( command.reply! );
    }

    /**
     * Handles configuration of race thread auto-create for a guild (server).
     * 
     * @param {string} enabledParam 
     * @param {string} channelParam 
     * @param {CommandInteraction} interaction 
     */
    @Slash( 'autothread', { description: `Configure whether Crofty auto-creates grand prix threads on this server.` })
    @SlashGroup( 'server', 'config' )
    @Permission( false )
    @Permission( discord.administrativeRoleResolver )
    async serverAutothread(
        @SlashChoice( 'yes', 'no' )
        @SlashOption( 'enabled', { description: 'Should Crofty auto-create race threads?', required: false }) enabledParam: string,
        @SlashOption( 'channel', { description: 'Text channel in which Crofty should auto-create race threads.', required: false }) channelParam: string,
        interaction: CommandInteraction ) {
        
        const command = new ServerAutoThreadConfig( interaction, enabledParam, channelParam );
        if ( command.reply )
            return await interaction.reply( command.reply );

        await interaction.channel?.sendTyping();
        try {
            await command.prepare();
        } catch ( err ) {
            console.warn( 'Failed `/config server autothread` command.', err );
        }

        await interaction.reply( command.reply! );
    }

    /**
     * Handles a request to list server and member configuration.
     * 
     * @param {CommandInteraction} interaction 
     */
    @Slash( 'list', { description: `List Crofty's server configuration, and your member preferences.` })
    @SlashGroup( 'config' )
    async rootList( interaction: CommandInteraction ) {
        const command = new ServerListConfig( interaction );
        if ( command.reply )
            return await interaction.reply( command.reply );

        await interaction.channel?.sendTyping();
        try {
            await command.prepare();
        } catch ( err ) {
            console.warn( 'Failed `/config list` command.', err );
        }

        await interaction.reply( command.reply! );
    }
}
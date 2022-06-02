import { CommandInteraction } from 'discord.js';
import { Discord, Slash, SlashChoice, SlashOption } from 'discordx';
import { Help } from '../models/index.js';

@Discord()
class help {

    @Slash( 'help', { description: 'Get help using Crofty.' })
    async help(
        @SlashChoice( 'config', 'results', 'standings' )
        @SlashOption( 'category', { description: `The category within Crofty's help system to view.`, required: false }) category: string,
        interaction: CommandInteraction ) {

        await interaction.channel?.sendTyping();

        const response = new Help( category );
        if ( response.reply )
            return await interaction.reply( response.reply );

        return await interaction.reply( response.fallbackReply );
    }
}
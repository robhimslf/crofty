import { Pagination } from "@discordx/pagination";
import { CommandInteraction, MessageEmbed } from 'discord.js';
import {
    Discord,
    MetadataStorage,
    Slash,
    SlashChoice,
    SlashOption
} from 'discordx';
import { Help } from '../models/index.js';

@Discord()
class help {

    @Slash( 'help', { description: 'Get help using Crofty.' })
    async help(
        @SlashChoice( 'config', 'stats', 'all' )
        @SlashOption( 'category', { description: `The category within Crofty's help system to view.`, required: false }) category: string,
        interaction: CommandInteraction ) {

        const response = new Help( interaction, category );
        await interaction.channel?.sendTyping();
        try {
            if ( response.paginate ) {
                const pagination = response.paginationReply;
                if ( pagination )
                    return await pagination.send();
            }

            if ( response.reply )
                return await interaction.reply( response.reply );
        } catch ( err ) {
            console.warn( 'Failed `/help` command.', err );
        }

        return await interaction.reply( response.fallbackReply );
    }
}
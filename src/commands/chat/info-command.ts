import {
    type PermissionsString,
    ChatInputCommandInteraction,
    EmbedBuilder
} from 'discord.js';
import { i18n, InteractionUtils, Language } from '../../utils/index.js';
import { InfoOption } from '../../types/index.js';
import { EventData } from '../../models/index.js';
import { Command, CommandDeferType } from '../command.js';

export class InfoCommand implements Command {
    public names = [ i18n.getRef( 'chatCommands.info', Language.DEFAULT )];
    public deferType = CommandDeferType.Hidden;
    public requirePermissions: PermissionsString[] = [];

    public async execute(
        interaction: ChatInputCommandInteraction,
        data: EventData ): Promise<void> {

        const args = {
            option: interaction.options.getString(
                i18n.getRef( 'arguments.option', Language.DEFAULT )
            ) as InfoOption
        };

        let embed: EmbedBuilder;
        switch ( args.option ) {
            case InfoOption.ABOUT:
                embed = i18n.getEmbed( 'displayEmbeds.about', data.lang );
                break;
            case InfoOption.TRANSLATE:
                embed = i18n.getEmbed( 'displayEmbeds.translate', data.lang );
                for ( const lang of Language.ENABLED ) {
                    embed.addFields([
                        {
                            name: Language.Data[ lang ].native,
                            value: i18n.getRef( 'meta.translators', lang )
                        }
                    ]);
                }
                break;
            default:
                return;
        }

        await InteractionUtils.send( interaction, embed );
    }
}
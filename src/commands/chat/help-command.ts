import {
    ChatInputCommandInteraction,
    EmbedBuilder,
    PermissionsString
} from 'discord.js';
import {
    ClientUtils,
    FormatUtils,
    i18n,
    InteractionUtils,
    Language
} from '../../utils/index.js';
import { HelpOption } from '../../types/index.js';
import { EventData } from '../../models/index.js';
import { Command, CommandDeferType } from '../command.js';

export class HelpCommand implements Command {
    public names = [i18n.getRef('chatCommands.help', Language.DEFAULT )];

    public deferType = CommandDeferType.Hidden;

    public requirePermissions: PermissionsString[] = [];
    public async execute(intr: ChatInputCommandInteraction, data: EventData): Promise<void> {
        let args = {
            option: intr.options.getString(
                i18n.getRef('arguments.option', Language.DEFAULT )
            ) as HelpOption,
        };

        let embed: EmbedBuilder;
        switch (args.option) {
            case HelpOption.CONTACT_SUPPORT: {
                embed = i18n.getEmbed('displayEmbeds.helpContactSupport', data.lang);
                break;
            }
            case HelpOption.COMMANDS: {
                embed = i18n.getEmbed('displayEmbeds.helpCommands', data.lang, {
                    CMD_LINK_TEST: FormatUtils.commandMention(
                        await ClientUtils.findAppCommand(
                            intr.client,
                            i18n.getRef('chatCommands.test', Language.DEFAULT )
                        )
                    ),
                    CMD_LINK_INFO: FormatUtils.commandMention(
                        await ClientUtils.findAppCommand(
                            intr.client,
                            i18n.getRef('chatCommands.info', Language.DEFAULT )
                        )
                    ),
                });
                break;
            }
            default: {
                return;
            }
        }

        await InteractionUtils.send(intr, embed);
    }
}

import {
    APIApplicationCommandBasicOption,
    ApplicationCommandOptionType
} from 'discord.js';
import { i18n, Language } from '../utils/index.js';
import { DevCommandName, HelpOption, InfoOption } from '../types/index.js';

export class Args {
    public static readonly DEV_COMMAND: APIApplicationCommandBasicOption = {
        name: i18n.getRef( 'arguments.command', Language.DEFAULT ),
        name_localizations: i18n.getRefMap( 'arguments.command' ),
        description: i18n.getRef( 'argDescs.devCommand', Language.DEFAULT ),
        description_localizations: i18n.getRefMap( 'argDescs.devCommand' ),
        type: ApplicationCommandOptionType.String,
        choices: [
            {
                name: i18n.getRef( 'devCommandNames.info', Language.DEFAULT ),
                name_localizations: i18n.getRefMap( 'devCommandNames.info' ),
                value: DevCommandName.INFO,
            },
        ],
    };

    public static readonly HELP_OPTION: APIApplicationCommandBasicOption = {
        name: i18n.getRef( 'arguments.option', Language.DEFAULT ),
        name_localizations: i18n.getRefMap( 'arguments.option' ),
        description: i18n.getRef( 'argDescs.helpOption', Language.DEFAULT ),
        description_localizations: i18n.getRefMap( 'argDescs.helpOption' ),
        type: ApplicationCommandOptionType.String,
        choices: [
            {
                name: i18n.getRef( 'helpOptionDescs.contactSupport', Language.DEFAULT ),
                name_localizations: i18n.getRefMap( 'helpOptionDescs.contactSupport' ),
                value: HelpOption.CONTACT_SUPPORT,
            },
            {
                name: i18n.getRef( 'helpOptionDescs.commands', Language.DEFAULT ),
                name_localizations: i18n.getRefMap( 'helpOptionDescs.commands' ),
                value: HelpOption.COMMANDS,
            },
        ],
    };
    
    public static readonly INFO_OPTION: APIApplicationCommandBasicOption = {
        name: i18n.getRef( 'arguments.option', Language.DEFAULT ),
        name_localizations: i18n.getRefMap( 'arguments.option' ),
        description: i18n.getRef( 'argDescs.helpOption', Language.DEFAULT ),
        description_localizations: i18n.getRefMap( 'argDescs.helpOption' ),
        type: ApplicationCommandOptionType.String,
        choices: [
            {
                name: i18n.getRef( 'infoOptions.about', Language.DEFAULT ),
                name_localizations: i18n.getRefMap( 'infoOptions.about' ),
                value: InfoOption.ABOUT,
            },
            {
                name: i18n.getRef( 'infoOptions.translate', Language.DEFAULT ),
                name_localizations: i18n.getRefMap( 'infoOptions.translate' ),
                value: InfoOption.TRANSLATE,
            },
        ],
    };
}
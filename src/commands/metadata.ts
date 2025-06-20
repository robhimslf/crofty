import {
    ApplicationCommandType,
    PermissionFlagsBits,
    PermissionsBitField,
    RESTPostAPIChatInputApplicationCommandsJSONBody,
    RESTPostAPIContextMenuApplicationCommandsJSONBody,
} from 'discord.js';
import { Args } from './args.js';
import { i18n, Language } from '../utils/index.js';

export const ChatCommandMetadata: {
    [ command: string ]: RESTPostAPIChatInputApplicationCommandsJSONBody; } = {
    DEV: {
        type: ApplicationCommandType.ChatInput,
        name: i18n.getRef( 'chatCommands.dev', Language.DEFAULT ),
        name_localizations: i18n.getRefMap( 'chatCommands.dev' ),
        description: i18n.getRef( 'commandDescs.dev', Language.DEFAULT ),
        description_localizations: i18n.getRefMap( 'commandDescs.dev' ),
        dm_permission: true,
        default_member_permissions: PermissionsBitField.resolve([
            PermissionFlagsBits.Administrator,
        ]).toString(),
        options: [
            {
                ...Args.DEV_COMMAND,
                required: true,
            },
        ],
    },
    HELP: {
        type: ApplicationCommandType.ChatInput,
        name: i18n.getRef( 'chatCommands.help', Language.DEFAULT ),
        name_localizations: i18n.getRefMap( 'chatCommands.help' ),
        description: i18n.getRef( 'commandDescs.help', Language.DEFAULT ),
        description_localizations: i18n.getRefMap( 'commandDescs.help' ),
        dm_permission: true,
        default_member_permissions: undefined,
        options: [
            {
                ...Args.HELP_OPTION,
                required: true,
            },
        ],
    },
    INFO: {
        type: ApplicationCommandType.ChatInput,
        name: i18n.getRef( 'chatCommands.info', Language.DEFAULT ),
        name_localizations: i18n.getRefMap( 'chatCommands.info' ),
        description: i18n.getRef( 'commandDescs.info', Language.DEFAULT ),
        description_localizations: i18n.getRefMap( 'commandDescs.info' ),
        dm_permission: true,
        default_member_permissions: undefined,
        options: [
            {
                ...Args.INFO_OPTION,
                required: true,
            },
        ],
    },
    TEST: {
        type: ApplicationCommandType.ChatInput,
        name: i18n.getRef( 'chatCommands.test', Language.DEFAULT ),
        name_localizations: i18n.getRefMap( 'chatCommands.test' ),
        description: i18n.getRef( 'commandDescs.test', Language.DEFAULT ),
        description_localizations: i18n.getRefMap( 'commandDescs.test' ),
        dm_permission: true,
        default_member_permissions: undefined,
    },
};

export const MessageCommandMetadata: {
    [ command: string ]: RESTPostAPIContextMenuApplicationCommandsJSONBody; } = {
    VIEW_DATE_SENT: {
        type: ApplicationCommandType.Message,
        name: i18n.getRef( 'messageCommands.viewDateSent', Language.DEFAULT ),
        name_localizations: i18n.getRefMap( 'messageCommands.viewDateSent' ),
        default_member_permissions: undefined,
        dm_permission: true,
    },
};

export const UserCommandMetadata: {
    [ command: string ]: RESTPostAPIContextMenuApplicationCommandsJSONBody; } = {
    VIEW_DATE_JOINED: {
        type: ApplicationCommandType.User,
        name: i18n.getRef( 'userCommands.viewDateJoined', Language.DEFAULT ),
        name_localizations: i18n.getRefMap( 'userCommands.viewDateJoined' ),
        default_member_permissions: undefined,
        dm_permission: true,
    },
};

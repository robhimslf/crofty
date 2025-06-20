import {
    Channel,
    DMChannel,
    GuildChannel,
    Locale,
    PermissionFlagsBits,
    PermissionsString,
    ThreadChannel
} from 'discord.js';
import { i18n } from './i18n/index.js';

export class PermissionUtils {

    public static canCreateThreads(
        channel: Channel,
        manage: boolean = false,
        findOld: boolean = false ): boolean {
        
        if ( channel instanceof DMChannel )
            return true;
        else if ( channel instanceof GuildChannel ||
            channel instanceof ThreadChannel ) {

            const perms = channel.permissionsFor( channel.client.user );
            if ( !perms )
                return false;

            return perms.has([
                PermissionFlagsBits.ViewChannel,
                PermissionFlagsBits.SendMessagesInThreads,
                PermissionFlagsBits.CreatePublicThreads,
                ...( manage ? [ PermissionFlagsBits.ManageThreads ] : [] ),
                ...( findOld ? [ PermissionFlagsBits.ReadMessageHistory ] : [] )
            ]);
        }
        else
            return false;
    }

    public static canMention( channel: Channel ): boolean {
        if ( channel instanceof DMChannel )
            return true;
        else if ( channel instanceof GuildChannel ||
            channel instanceof ThreadChannel ) {

            const perms = channel.permissionsFor( channel.client.user );
            if ( !perms )
                return false;

            return perms.has([
                PermissionFlagsBits.ViewChannel,
                PermissionFlagsBits.MentionEveryone
            ]);
        }
        else
            return false;
    }

    public static canPin(
        channel: Channel,
        findOld: boolean = false ): boolean {
        if ( channel instanceof DMChannel )
            return true;
        else if ( channel instanceof GuildChannel ||
            channel instanceof ThreadChannel ) {

            const perms = channel.permissionsFor( channel.client.user );
            if ( !perms )
                return false;

            return perms.has([
                PermissionFlagsBits.ViewChannel,
                PermissionFlagsBits.ManageMessages,
                ...( findOld ? [ PermissionFlagsBits.ReadMessageHistory ] : [] )
            ]);
        }
        else
            return false;
    }

    public static canReact(
        channel: Channel,
        removeOthers: boolean = false ): boolean {
        
        if ( channel instanceof DMChannel )
            return true;
        else if ( channel instanceof GuildChannel ||
            channel instanceof ThreadChannel ) {

            const perms = channel.permissionsFor( channel.client.user );
            if ( !perms )
                return false;

            return perms.has([
                PermissionFlagsBits.ViewChannel,
                PermissionFlagsBits.AddReactions,
                PermissionFlagsBits.ReadMessageHistory,
                ...( removeOthers ? [ PermissionFlagsBits.ManageMessages ] : [] )
            ]);
        }
        else
            return false;
    }

    public static canSend(
        channel: Channel,
        embedLinks: boolean = false ): boolean {
        
        if ( channel instanceof DMChannel )
            return true;
        else if ( channel instanceof GuildChannel ||
            channel instanceof ThreadChannel ) {

            const perms = channel.permissionsFor( channel.client.user );
            if ( !perms )
                return false;

            return perms.has([
                PermissionFlagsBits.ViewChannel,
                PermissionFlagsBits.SendMessages,
                ...( embedLinks ? [ PermissionFlagsBits.EmbedLinks ] : [] )
            ]);
        }
        else
            return false;
    }
}

interface PermissionData {
    displayName(langCode: Locale): string;
}

export class Permission {
    public static Data: {
        [key in PermissionsString]: PermissionData;
    } = {
        AddReactions: {
            displayName(langCode: Locale): string {
                return i18n.getRef('permissions.AddReactions', langCode);
            },
        },
        Administrator: {
            displayName(langCode: Locale): string {
                return i18n.getRef('permissions.Administrator', langCode);
            },
        },
        AttachFiles: {
            displayName(langCode: Locale): string {
                return i18n.getRef('permissions.AttachFiles', langCode);
            },
        },
        BanMembers: {
            displayName(langCode: Locale): string {
                return i18n.getRef('permissions.BanMembers', langCode);
            },
        },
        ChangeNickname: {
            displayName(langCode: Locale): string {
                return i18n.getRef('permissions.ChangeNickname', langCode);
            },
        },
        Connect: {
            displayName(langCode: Locale): string {
                return i18n.getRef('permissions.Connect', langCode);
            },
        },
        CreateEvents: {
            displayName(langCode: Locale): string {
                return i18n.getRef('permissions.CreateEvents', langCode);
            },
        },
        CreateGuildExpressions: {
            displayName(langCode: Locale): string {
                return i18n.getRef('permissions.CreateGuildExpressions', langCode);
            },
        },
        CreateInstantInvite: {
            displayName(langCode: Locale): string {
                return i18n.getRef('permissions.CreateInstantInvite', langCode);
            },
        },
        CreatePrivateThreads: {
            displayName(langCode: Locale): string {
                return i18n.getRef('permissions.CreatePrivateThreads', langCode);
            },
        },
        CreatePublicThreads: {
            displayName(langCode: Locale): string {
                return i18n.getRef('permissions.CreatePublicThreads', langCode);
            },
        },
        DeafenMembers: {
            displayName(langCode: Locale): string {
                return i18n.getRef('permissions.DeafenMembers', langCode);
            },
        },
        EmbedLinks: {
            displayName(langCode: Locale): string {
                return i18n.getRef('permissions.EmbedLinks', langCode);
            },
        },
        KickMembers: {
            displayName(langCode: Locale): string {
                return i18n.getRef('permissions.KickMembers', langCode);
            },
        },
        ManageChannels: {
            displayName(langCode: Locale): string {
                return i18n.getRef('permissions.ManageChannels', langCode);
            },
        },
        ManageEmojisAndStickers: {
            displayName(langCode: Locale): string {
                return i18n.getRef('permissions.ManageEmojisAndStickers', langCode);
            },
        },
        ManageEvents: {
            displayName(langCode: Locale): string {
                return i18n.getRef('permissions.ManageEvents', langCode);
            },
        },
        ManageGuild: {
            displayName(langCode: Locale): string {
                return i18n.getRef('permissions.ManageGuild', langCode);
            },
        },
        ManageGuildExpressions: {
            displayName(langCode: Locale): string {
                return i18n.getRef('permissions.ManageGuildExpressions', langCode);
            },
        },
        ManageMessages: {
            displayName(langCode: Locale): string {
                return i18n.getRef('permissions.ManageMessages', langCode);
            },
        },
        ManageNicknames: {
            displayName(langCode: Locale): string {
                return i18n.getRef('permissions.ManageNicknames', langCode);
            },
        },
        ManageRoles: {
            displayName(langCode: Locale): string {
                return i18n.getRef('permissions.ManageRoles', langCode);
            },
        },
        ManageThreads: {
            displayName(langCode: Locale): string {
                return i18n.getRef('permissions.ManageThreads', langCode);
            },
        },
        ManageWebhooks: {
            displayName(langCode: Locale): string {
                return i18n.getRef('permissions.ManageWebhooks', langCode);
            },
        },
        MentionEveryone: {
            displayName(langCode: Locale): string {
                return i18n.getRef('permissions.MentionEveryone', langCode);
            },
        },
        ModerateMembers: {
            displayName(langCode: Locale): string {
                return i18n.getRef('permissions.ModerateMembers', langCode);
            },
        },
        MoveMembers: {
            displayName(langCode: Locale): string {
                return i18n.getRef('permissions.MoveMembers', langCode);
            },
        },
        MuteMembers: {
            displayName(langCode: Locale): string {
                return i18n.getRef('permissions.MuteMembers', langCode);
            },
        },
        PrioritySpeaker: {
            displayName(langCode: Locale): string {
                return i18n.getRef('permissions.PrioritySpeaker', langCode);
            },
        },
        ReadMessageHistory: {
            displayName(langCode: Locale): string {
                return i18n.getRef('permissions.ReadMessageHistory', langCode);
            },
        },
        RequestToSpeak: {
            displayName(langCode: Locale): string {
                return i18n.getRef('permissions.RequestToSpeak', langCode);
            },
        },
        SendMessages: {
            displayName(langCode: Locale): string {
                return i18n.getRef('permissions.SendMessages', langCode);
            },
        },
        SendMessagesInThreads: {
            displayName(langCode: Locale): string {
                return i18n.getRef('permissions.SendMessagesInThreads', langCode);
            },
        },
        SendPolls: {
            displayName(langCode: Locale): string {
                return i18n.getRef('permissions.SendPolls', langCode);
            },
        },
        SendTTSMessages: {
            displayName(langCode: Locale): string {
                return i18n.getRef('permissions.SendTTSMessages', langCode);
            },
        },
        SendVoiceMessages: {
            displayName(langCode: Locale): string {
                return i18n.getRef('permissions.SendVoiceMessages', langCode);
            },
        },
        Speak: {
            displayName(langCode: Locale): string {
                return i18n.getRef('permissions.Speak', langCode);
            },
        },
        Stream: {
            displayName(langCode: Locale): string {
                return i18n.getRef('permissions.Stream', langCode);
            },
        },
        UseApplicationCommands: {
            displayName(langCode: Locale): string {
                return i18n.getRef('permissions.UseApplicationCommands', langCode);
            },
        },
        UseEmbeddedActivities: {
            displayName(langCode: Locale): string {
                return i18n.getRef('permissions.UseEmbeddedActivities', langCode);
            },
        },
        UseExternalApps: {
            displayName(langCode: Locale): string {
                return i18n.getRef('permissions.UseExternalApps', langCode);
            },
        },
        UseExternalEmojis: {
            displayName(langCode: Locale): string {
                return i18n.getRef('permissions.UseExternalEmojis', langCode);
            },
        },
        UseExternalSounds: {
            displayName(langCode: Locale): string {
                return i18n.getRef('permissions.UseExternalSounds', langCode);
            },
        },
        UseExternalStickers: {
            displayName(langCode: Locale): string {
                return i18n.getRef('permissions.UseExternalStickers', langCode);
            },
        },
        UseSoundboard: {
            displayName(langCode: Locale): string {
                return i18n.getRef('permissions.UseSoundboard', langCode);
            },
        },
        UseVAD: {
            displayName(langCode: Locale): string {
                return i18n.getRef('permissions.UseVAD', langCode);
            },
        },
        ViewAuditLog: {
            displayName(langCode: Locale): string {
                return i18n.getRef('permissions.ViewAuditLog', langCode);
            },
        },
        ViewChannel: {
            displayName(langCode: Locale): string {
                return i18n.getRef('permissions.ViewChannel', langCode);
            },
        },
        ViewCreatorMonetizationAnalytics: {
            displayName(langCode: Locale): string {
                return i18n.getRef('permissions.ViewCreatorMonetizationAnalytics', langCode);
            },
        },
        ViewGuildInsights: {
            displayName(langCode: Locale): string {
                return i18n.getRef('permissions.ViewGuildInsights', langCode);
            },
        },
    };
}

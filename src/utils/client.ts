import {
    ApplicationCommand,
    Channel,
    Client,
    DiscordAPIError,
    RESTJSONErrorCodes as DiscordAPIErrors,
    Guild,
    GuildMember,
    Locale,
    NewsChannel,
    Role,
    StageChannel,
    TextChannel,
    User,
    VoiceChannel
} from 'discord.js';
import { RegexUtils } from './regex.js';
import { PermissionUtils } from './permission.js';
import { i18n } from './i18n/index.js';

const FETCH_MEMBER_LIMIT = 20;
const IGNORED_ERRORS = [
    DiscordAPIErrors.MissingAccess,
    DiscordAPIErrors.UnknownChannel,
    DiscordAPIErrors.UnknownGuild,
    DiscordAPIErrors.UnknownInteraction,
    DiscordAPIErrors.UnknownMember,
    DiscordAPIErrors.UnknownMessage,
    DiscordAPIErrors.UnknownUser,
];

export class ClientUtils {

    public static async findAppCommand( client: Client, name: string ): Promise<ApplicationCommand | undefined> {
        const all = await client.application.commands.fetch();
        return all.find( x => x.name === name );
    }

    public static async findMember( guild: Guild, value: string ): Promise<GuildMember | undefined> {
        try {
            const discordId = RegexUtils.discordId( value );
            if ( discordId )
                return await guild.members.fetch( discordId );

            const tag = RegexUtils.tag( value );
            if ( tag )
                return ( await guild.members.fetch({
                    query: tag.username,
                    limit: FETCH_MEMBER_LIMIT })
                ).find( x => x.user.discriminator === tag.descriminator );

            return ( await guild.members.fetch({ query: value, limit: 1 })).first();
        } catch ( err ) {
            if ( err instanceof DiscordAPIError &&
                typeof err.code === 'number' &&
                IGNORED_ERRORS.includes( err.code ))
                return;

            throw err;
        }
    }

    public static async findRole( guild: Guild, value: string ): Promise<Role | undefined> {
        try {
            const discordId = RegexUtils.discordId( value );
            if ( discordId )
                return await guild.roles.fetch( discordId );

            const search = value.trim().toLowerCase().replace( /^@/, '' );
            const roles = await guild.roles.fetch();
            return (
                roles.find( x => x.name.toLowerCase() === search ) ??
                roles.find( x => x.name.toLowerCase().includes( search ))
            );
        } catch ( err ) {
            if ( err instanceof DiscordAPIError &&
                typeof err.code === 'number' &&
                IGNORED_ERRORS.includes( err.code ))
                return;

            throw err;
        }
    }

    public static async findNotificationChannel( guild: Guild, lang: Locale ):
        Promise<TextChannel | NewsChannel | undefined> {
        
        const sys = guild.systemChannel;
        if ( sys && PermissionUtils.canSend( sys, true ))
            return sys;

        return ( await guild.channels.fetch() ).find( x =>
            ( x instanceof TextChannel || x instanceof NewsChannel ) &&
                PermissionUtils.canSend( x, true ) &&
                i18n.getRegex( 'channelRegexes.bot', lang ).test( x.name )
            ) as TextChannel | NewsChannel | undefined;
    }

    public static async findTextChannel( guild: Guild, value: string ):
        Promise<NewsChannel | TextChannel | undefined> {

        try {
            const discordId = RegexUtils.discordId( value );
            if ( discordId ) {
                const result = await guild.channels.fetch( discordId );
                if ( result &&
                    ( result instanceof NewsChannel ||
                        result instanceof TextChannel ))
                    return result;
                return;
            }

            const search = value
                .trim()
                .toLowerCase()
                .replace( /^#/, '' )
                .replaceAll( ' ', '-' );
            const channels = [ ...( await guild.channels.fetch() ).values() ]
                .filter( x => x instanceof NewsChannel || x instanceof TextChannel );
            return (
                channels.find( x => x.name.toLowerCase() === search ) ??
                channels.find( x => x.name.toLowerCase().includes( search ))
            );
        } catch ( err ) {
            if ( err instanceof DiscordAPIError &&
                typeof err.code === 'number' &&
                IGNORED_ERRORS.includes( err.code ))
                return;

            throw err;
        }
    }

    public static async findVoiceChannel( guild: Guild, value: string ):
        Promise<VoiceChannel | StageChannel | undefined> {

        try {
            const discordId = RegexUtils.discordId( value );
            if ( discordId ) {
                const result = await guild.channels.fetch( discordId );
                if ( result &&
                    ( result instanceof VoiceChannel ||
                        result instanceof StageChannel ))
                    return result;
                return;
            }

            const search = value
                .trim()
                .toLowerCase()
                .replace( /^#/, '' )
                .replaceAll( ' ', '-' );
            const channels = [ ...( await guild.channels.fetch() ).values() ]
                .filter( x => x instanceof VoiceChannel || x instanceof StageChannel );
            return (
                channels.find( x => x.name.toLowerCase() === search ) ??
                channels.find( x => x.name.toLowerCase().includes( search ))
            );
        } catch ( err ) {
            if ( err instanceof DiscordAPIError &&
                typeof err.code === 'number' &&
                IGNORED_ERRORS.includes( err.code ))
                return;

            throw err;
        }
    }

    public static async getChannel( client: Client, discordId: string ): Promise<Channel | undefined> {
        discordId = RegexUtils.discordId( discordId );
        if ( !discordId )
            return;

        try {
            return await client.channels.fetch( discordId );
        } catch ( err ) {
            if ( err instanceof DiscordAPIError &&
                typeof err.code === 'number' &&
                IGNORED_ERRORS.includes( err.code ))
                return;

            throw err;
        }
    }

    public static async getGuild( client: Client, discordId: string ): Promise<Guild | undefined> {
        discordId = RegexUtils.discordId( discordId );
        if ( !discordId )
            return;

        try {
            return await client.guilds.fetch( discordId );
        } catch ( err ) {
            if ( err instanceof DiscordAPIError &&
                typeof err.code === 'number' &&
                IGNORED_ERRORS.includes( err.code ))
                return;

            throw err;
        }
    }

    public static async getUser( client: Client, discordId: string ): Promise<User | undefined> {
        discordId = RegexUtils.discordId( discordId );
        if ( !discordId )
            return;

        try {
            return await client.users.fetch( discordId );
        } catch ( err ) {
            if ( err instanceof DiscordAPIError &&
                typeof err.code === 'number' &&
                IGNORED_ERRORS.includes( err.code ))
                return;

            throw err;
        }
    }
}
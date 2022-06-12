import {
    ApplicationCommandPermissions,
    CategoryChannel,
    Guild,
    GuildMember,
    Message,
    NewsChannel,
    StageChannel,
    StoreChannel,
    TextChannel,
    VoiceChannel
} from 'discord.js';
import {
    ApplicationCommandMixin,
    SimpleCommandMessage
} from 'discordx';

/**
 * Defines a collective Discord channel type.
 */
 export type DiscordChannelType =
    CategoryChannel |
    NewsChannel |
    StageChannel |
    StoreChannel |
    TextChannel |
    VoiceChannel |
    null;

/**
 * Interrogates the guild (Discord server) for roles containing the `ADMINISTRATOR`
 * permission, and returns them as a collection of application command permissions.
 * 
 * @param {Guild} guild 
 * @param {ApplicationCommandMixin | SimpleCommandMessage} _ 
 * @returns {ApplicationCommandPermissions[]}
 */
export const administrativeRoleResolver = (
    guild: Guild,
    _: ApplicationCommandMixin | SimpleCommandMessage )
    : ApplicationCommandPermissions[] => {

    let resolved: ApplicationCommandPermissions[] = [];

    try {
        const administrative = guild.roles.cache.filter( r =>
            r.permissions.has( 'ADMINISTRATOR' ));

        resolved = administrative.map( r => ({
            id: r.id,
            permission: true,
            type: 'ROLE'
        }));
    } catch ( err ) {
        console.warn( `🛑 Failed resolving administrative roles for guild "${guild.name}".`, err );
    }

    return resolved;
};

/**
 * Fetches a Discord channel by unique ID from a guild, if available.
 * 
 * @param {Guild} guild 
 * @param {string} id 
 * @returns {Promise<DiscordChannelType | undefined>}
 */
export const getGuildChannelById = async ( guild: Guild, id: string )
    : Promise<DiscordChannelType | undefined> => {
    
    let result: DiscordChannelType | undefined;
    try {
        result = await guild.channels.fetch( id );
    } catch ( err ) {
        console.warn( `🛑 Failed fetching channel for guild "${guild.name}" with ID "${id}".`, err );
    }

    return result;
}

/**
 * Fetches a Discord channel by name from a guild, if applicable.
 * 
 * @param {Guild} guild 
 * @param {string} name 
 * @returns {Promise<DiscordChannelType | undefined>}
 */
export const getGuildChannelByName = async ( guild: Guild, name: string )
    : Promise<DiscordChannelType | undefined> => {
    
    let result: DiscordChannelType | undefined;
    try {
        const channels = await guild.channels.fetch();
        if ( channels )
            result = channels.find( channel =>
                channel.name.toLowerCase() === name.toLowerCase().trim() );
    } catch ( err ) {
        console.warn( `🛑 Failed fetching channel for guild "${guild.name}" with name "${name}".`, err );
    }

    return result;
};

/**
 * Fetches a member from the cached guild of a message by ID, tag, or nickname.
 * 
 * @param {string} member 
 * @param {Message} message 
 * @returns {GuildMember | undefined}
 */
export const getGuildMember = ( member: string, message: Message ):
    GuildMember | undefined =>
        message.guild?.members.cache.get( member ) ||
        message.guild?.members.cache.find( m =>
            m.user.tag.toLowerCase() === member.toLowerCase() ) ||
        message.guild?.members.cache.find( m =>
            m.nickname?.toLowerCase() === member.toLowerCase() );
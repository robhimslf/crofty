import {
    BaseMessageOptions,
    DiscordAPIError,
    RESTJSONErrorCodes as DiscordAPIErrors,
    EmbedBuilder,
    EmojiResolvable,
    Message,
    MessageEditOptions,
    MessageReaction,
    PartialGroupDMChannel,
    StartThreadOptions,
    TextBasedChannel,
    ThreadChannel,
    User
} from 'discord.js';

const IGNORED_ERRORS = [
    DiscordAPIErrors.CannotSendMessagesToThisUser,
    DiscordAPIErrors.MaximumActiveThreads,
    DiscordAPIErrors.ReactionWasBlocked,
    DiscordAPIErrors.UnknownChannel,
    DiscordAPIErrors.UnknownGuild,
    DiscordAPIErrors.UnknownInteraction,
    DiscordAPIErrors.UnknownMessage,
    DiscordAPIErrors.UnknownUser,
];

export class MessageUtils {

    public static async delete( message: Message ): Promise<Message | undefined> {
        try {
            return await message.delete();
        } catch ( err ) {
            if ( err instanceof DiscordAPIError &&
                typeof err.code === 'number' &&
                IGNORED_ERRORS.includes( err.code ))
                return;

            throw err;
        }
    }

    public static async edit(
        message: Message,
        content: string | EmbedBuilder | MessageEditOptions ): Promise<Message | undefined> {

        try {
            const opts: MessageEditOptions =
                typeof content === 'string'
                    ? { content }
                    : content instanceof EmbedBuilder
                        ? { embeds: [ content ] }
                        : content;
            return await message.edit( opts );
        } catch ( err ) {
            if ( err instanceof DiscordAPIError &&
                typeof err.code === 'number' &&
                IGNORED_ERRORS.includes( err.code ))
                return;

            throw err;
        }
    }

    public static async pin(
        message: Message,
        pinned: boolean = true ): Promise<Message | undefined> {

        try {
            return pinned
                ? await message.pin()
                : await message.unpin();
        } catch ( err ) {
            if ( err instanceof DiscordAPIError &&
                typeof err.code === 'number' &&
                IGNORED_ERRORS.includes( err.code ))
                return;

            throw err;
        }
    }

    public static async react(
        message: Message,
        emoji: EmojiResolvable ): Promise<MessageReaction | undefined> {

        try {
            return await message.react( emoji );
        } catch ( err ) {
            if ( err instanceof DiscordAPIError &&
                typeof err.code === 'number' &&
                IGNORED_ERRORS.includes( err.code ))
                return;

            throw err;
        }
    }

    public static async reply(
        message: Message,
        content: string | EmbedBuilder | BaseMessageOptions ): Promise<Message | undefined> {
        
        try {
            const opts: BaseMessageOptions =
                typeof content === 'string'
                    ? { content }
                    : content instanceof EmbedBuilder
                        ? { embeds: [ content ] }
                        : content;
            return await message.reply( opts );
        } catch ( err ) {
            if ( err instanceof DiscordAPIError &&
                typeof err.code === 'number' &&
                IGNORED_ERRORS.includes( err.code ))
                return;

            throw err;
        }
    }

    public static async send(
        target: User | TextBasedChannel,
        content: string | EmbedBuilder | BaseMessageOptions ): Promise<Message | undefined> {
        
        if ( target instanceof PartialGroupDMChannel )
            return;

        try {
            const opts: BaseMessageOptions =
                typeof content === 'string'
                    ? { content }
                    : content instanceof EmbedBuilder
                        ? { embeds: [ content ] }
                        : content;
            return await target.send( opts );
        } catch ( err ) {
            if ( err instanceof DiscordAPIError &&
                typeof err.code === 'number' &&
                IGNORED_ERRORS.includes( err.code ))
                return;

            throw err;
        }
    }

    public static async startThread(
        message: Message,
        options: StartThreadOptions ): Promise<ThreadChannel | undefined> {

        try {
            return await message.startThread( options );
        } catch ( err ) {
            if ( err instanceof DiscordAPIError &&
                typeof err.code === 'number' &&
                IGNORED_ERRORS.includes( err.code ))
                return;

            throw err;
        }
    }
}

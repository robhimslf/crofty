import {
    DiscordAPIError,
    RESTJSONErrorCodes as DiscordAPIErrors,
    Message,
    MessageReaction,
    PartialMessage,
    PartialMessageReaction,
    PartialUser,
    User
} from 'discord.js';

const IGNORED_ERRORS = [
    DiscordAPIErrors.MissingAccess,
    DiscordAPIErrors.UnknownChannel,
    DiscordAPIErrors.UnknownGuild,
    DiscordAPIErrors.UnknownInteraction,
    DiscordAPIErrors.UnknownMessage,
    DiscordAPIErrors.UnknownUser,
];

export class PartialUtils {

    public static async resolveMessage( message: Message | PartialMessage ): Promise<Message> {
        if ( message.partial ) {
            try {
                return await message.fetch();
            } catch ( err ) {
                if ( err instanceof DiscordAPIError &&
                    typeof err.code === 'number' &&
                    IGNORED_ERRORS.includes( err.code ))
                    return;
                
                throw err;
            }
        }

        return message as Message;
    }

    public static async resolveReaction( reaction: MessageReaction | PartialMessageReaction ): Promise<MessageReaction> {
        if ( reaction.partial ) {
            try {
                return await reaction.fetch();
            } catch ( err ) {
                if ( err instanceof DiscordAPIError &&
                    typeof err.code === 'number' &&
                    IGNORED_ERRORS.includes( err.code ))
                    return;
                
                throw err;
            }
        }

        return reaction as MessageReaction;
    }

    public static async resolveUser( user: User | PartialUser ): Promise<User> {
        if ( user.partial ) {
            try {
                return await user.fetch();
            } catch ( err ) {
                if ( err instanceof DiscordAPIError &&
                    typeof err.code === 'number' &&
                    IGNORED_ERRORS.includes( err.code ))
                    return;
                
                throw err;
            }
        }

        return user as User;
    }
}
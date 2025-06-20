import {
    DiscordAPIError,
    RESTJSONErrorCodes as DiscordAPIErrors,
    ThreadChannel
} from 'discord.js';

const IGNORED_ERRORS = [
    DiscordAPIErrors.CannotSendMessagesToThisUser,
    DiscordAPIErrors.MaximumActiveThreads,
    DiscordAPIErrors.ReactionWasBlocked,
    DiscordAPIErrors.UnknownChannel,
    DiscordAPIErrors.UnknownGuild,
    DiscordAPIErrors.UnknownInteraction,
    DiscordAPIErrors.UnknownMessage,
    DiscordAPIErrors.UnknownUser
];

export class ThreadUtils {

    public static async archive(
        thread: ThreadChannel,
        archived: boolean = true ): Promise<ThreadChannel> {
        try {
            return await thread.setArchived( archived );
        } catch ( err ) {
            if ( err instanceof DiscordAPIError &&
                typeof err.code === 'number' &&
                IGNORED_ERRORS.includes( err.code ))
                return;

            throw err;
        }
    }

    public static async lock(
        thread: ThreadChannel,
        locked: boolean = true ): Promise<ThreadChannel> {
        try {
            return await thread.setLocked( locked );
        } catch ( err ) {
            if ( err instanceof DiscordAPIError &&
                typeof err.code === 'number' &&
                IGNORED_ERRORS.includes( err.code ))
                return;

            throw err;
        }
    }
}

import {
    ApplicationCommandOptionChoiceData,
    AutocompleteInteraction,
    CommandInteraction,
    DiscordAPIError,
    RESTJSONErrorCodes as DiscordAPIErrors,
    EmbedBuilder,
    InteractionReplyOptions,
    InteractionResponse,
    InteractionUpdateOptions,
    Message,
    MessageComponentInteraction,
    ModalSubmitInteraction,
    WebhookMessageEditOptions
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

export class InteractionUtils {

    public static async deferReply(
        interaction: CommandInteraction | MessageComponentInteraction | ModalSubmitInteraction,
        hidden: boolean = false ): Promise<InteractionResponse | undefined> {

        try {
            return await interaction.deferReply({ ephemeral: hidden });
        } catch ( err ) {
            if ( err instanceof DiscordAPIError &&
                typeof err.code === 'number' &&
                IGNORED_ERRORS.includes( err.code ))
                return;

            throw err;
        }
    }

    public static async deferUpdate(
        interaction: MessageComponentInteraction | ModalSubmitInteraction ):
            Promise<InteractionResponse | undefined> {

        try {
            return await interaction.deferUpdate();
        } catch ( err ) {
            if ( err instanceof DiscordAPIError &&
                typeof err.code === 'number' &&
                IGNORED_ERRORS.includes( err.code ))
                return;

            throw err;
        }
    }

    public static async editReply(
        interaction: CommandInteraction | MessageComponentInteraction | ModalSubmitInteraction,
        content: string | EmbedBuilder | WebhookMessageEditOptions ): Promise<Message | undefined> {

        try {
            const opts: InteractionUpdateOptions =
                typeof content === 'string'
                    ? { content }
                    : content instanceof EmbedBuilder
                        ? { embeds: [ content ] }
                        : content;

            return await interaction.editReply( opts );
        } catch ( err ) {
            if ( err instanceof DiscordAPIError &&
                typeof err.code === 'number' &&
                IGNORED_ERRORS.includes( err.code ))
                return;

            throw err;
        }
    }

    public static async respond(
        interaction: AutocompleteInteraction,
        choices: ApplicationCommandOptionChoiceData[] = [] ): Promise<void> {
        
        try {
            await interaction.respond( choices );
        } catch ( err ) {
            if ( err instanceof DiscordAPIError &&
                typeof err.code === 'number' &&
                IGNORED_ERRORS.includes( err.code ))
                return;

            throw err;
        }
    }

    public static async send(
        interaction: CommandInteraction | MessageComponentInteraction | ModalSubmitInteraction,
        content: string | EmbedBuilder | InteractionReplyOptions,
        hidden: boolean = false ): Promise<Message | undefined> {

        try {
            const opts: InteractionReplyOptions =
                typeof content === 'string'
                    ? { content }
                    : content instanceof EmbedBuilder
                        ? { embeds: [ content ] }
                        : content;

            if ( interaction.deferred || interaction.replied )
                return await interaction.followUp({
                    ...opts,
                    ephemeral: hidden
                });

            return await interaction.reply({
                ...opts,
                ephemeral: hidden,
                fetchReply: true
            });
        } catch ( err ) {
            if ( err instanceof DiscordAPIError &&
                typeof err.code === 'number' &&
                IGNORED_ERRORS.includes( err.code ))
                return;

            throw err;
        }
    }

    public static async update(
        interaction: MessageComponentInteraction,
        content: string | EmbedBuilder | InteractionUpdateOptions ): Promise<Message | undefined> {

        try {
            const opts: InteractionUpdateOptions =
                typeof content === 'string'
                    ? { content }
                    : content instanceof EmbedBuilder
                        ? { embeds: [ content ] }
                        : content;

            return await interaction.update({
                ...opts,
                fetchReply: true
            });
        } catch ( err ) {
            if ( err instanceof DiscordAPIError &&
                typeof err.code === 'number' &&
                IGNORED_ERRORS.includes( err.code ))
                return;

            throw err;
        }
    }
}

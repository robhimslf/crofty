import {
    AutocompleteInteraction,
    ChatInputCommandInteraction,
    CommandInteraction,
    NewsChannel,
    TextChannel,
    ThreadChannel
} from 'discord.js';
import { RateLimiter } from 'discord.js-rate-limiter';
import { createRequire } from 'node:module';
import {
    CommandUtils,
    DiscordLimits,
    i18n,
    InteractionUtils,
    Logger
} from '../utils/index.js';
import { Command, CommandDeferType } from '../commands/index.js';
import { EventData } from '../models/index.js';
import { EventDataService } from '../services/index.js';
import { EventHandler } from './event-handler.js';

const require = createRequire(import.meta.url);
let config = require('../../config/config.json');
let logs = require('../../i18n/logs.json');

export class CommandHandler implements EventHandler {
    private rateLimiter = new RateLimiter(
        config.rateLimiting.commands.amount,
        config.rateLimiting.commands.interval * 1000
    );

    constructor(
        public commands: Command[],
        private eventDataService: EventDataService
    ) {}

    public async process(intr: CommandInteraction | AutocompleteInteraction): Promise<void> {
        // Don't respond to self, or other bots
        if (intr.user.id === intr.client.user?.id || intr.user.bot) {
            return;
        }

        let commandParts =
            intr instanceof ChatInputCommandInteraction || intr instanceof AutocompleteInteraction
                ? [
                      intr.commandName,
                      intr.options.getSubcommandGroup(false),
                      intr.options.getSubcommand(false),
                  ].filter(Boolean)
                : [intr.commandName];
        let commandName = commandParts.join(' ');

        // Try to find the command the user wants
        let command = CommandUtils.findCommand(this.commands, commandParts);
        if (!command) {
            Logger.error(
                logs.error.command_not_found
                    .replaceAll('{INTERACTION_ID}', intr.id)
                    .replaceAll('{COMMAND_NAME}', commandName)
            );
            return;
        }

        if (intr instanceof AutocompleteInteraction) {
            if (!command.autocomplete) {
                Logger.error(
                    logs.error.autocomplete_not_found
                        .replaceAll('{INTERACTION_ID}', intr.id)
                        .replaceAll('{COMMAND_NAME}', commandName)
                );
                return;
            }

            try {
                let option = intr.options.getFocused(true);
                let choices = await command.autocomplete(intr, option);
                await InteractionUtils.respond(
                    intr,
                    choices?.slice(0, DiscordLimits.CHOICES_PER_AUTOCOMPLETE)
                );
            } catch (error) {
                Logger.error(
                    intr.channel instanceof TextChannel ||
                        intr.channel instanceof NewsChannel ||
                        intr.channel instanceof ThreadChannel
                        ? logs.error.autocomplete_guild
                              .replaceAll('{INTERACTION_ID}', intr.id)
                              .replaceAll('{OPTION_NAME}', commandName)
                              .replaceAll('{COMMAND_NAME}', commandName)
                              .replaceAll('{USER_TAG}', intr.user.tag)
                              .replaceAll('{USER_ID}', intr.user.id)
                              .replaceAll('{CHANNEL_NAME}', intr.channel.name)
                              .replaceAll('{CHANNEL_ID}', intr.channel.id)
                              .replaceAll('{GUILD_NAME}', intr.guild?.name)
                              .replaceAll('{GUILD_ID}', intr.guild?.id)
                        : logs.error.autocomplete_other
                              .replaceAll('{INTERACTION_ID}', intr.id)
                              .replaceAll('{OPTION_NAME}', commandName)
                              .replaceAll('{COMMAND_NAME}', commandName)
                              .replaceAll('{USER_TAG}', intr.user.tag)
                              .replaceAll('{USER_ID}', intr.user.id),
                    error
                );
            }
            return;
        }

        // Check if user is rate limited
        let limited = this.rateLimiter.take(intr.user.id);
        if (limited) {
            return;
        }

        // Defer interaction
        // NOTE: Anything after this point we should be responding to the interaction
        switch (command.deferType) {
            case CommandDeferType.Public: {
                await InteractionUtils.deferReply(intr, false);
                break;
            }
            case CommandDeferType.Hidden: {
                await InteractionUtils.deferReply(intr, true);
                break;
            }
        }

        // Return if defer was unsuccessful
        if (command.deferType !== CommandDeferType.None && !intr.deferred) {
            return;
        }

        // Get data from database
        let data = await this.eventDataService.create({
            user: intr.user,
            channel: intr.channel,
            guild: intr.guild,
            args: intr instanceof ChatInputCommandInteraction ? intr.options : undefined,
        });

        try {
            // Check if interaction passes command checks
            let passesChecks = await CommandUtils.runChecks(command, intr, data);
            if (passesChecks) {
                // Execute the command
                await command.execute(intr, data);
            }
        } catch (error) {
            await this.sendError(intr, data);

            // Log command error
            Logger.error(
                intr.channel instanceof TextChannel ||
                    intr.channel instanceof NewsChannel ||
                    intr.channel instanceof ThreadChannel
                    ? logs.error.command_guild
                          .replaceAll('{INTERACTION_ID}', intr.id)
                          .replaceAll('{COMMAND_NAME}', commandName)
                          .replaceAll('{USER_TAG}', intr.user.tag)
                          .replaceAll('{USER_ID}', intr.user.id)
                          .replaceAll('{CHANNEL_NAME}', intr.channel.name)
                          .replaceAll('{CHANNEL_ID}', intr.channel.id)
                          .replaceAll('{GUILD_NAME}', intr.guild?.name)
                          .replaceAll('{GUILD_ID}', intr.guild?.id)
                    : logs.error.command_other
                          .replaceAll('{INTERACTION_ID}', intr.id)
                          .replaceAll('{COMMAND_NAME}', commandName)
                          .replaceAll('{USER_TAG}', intr.user.tag)
                          .replaceAll('{USER_ID}', intr.user.id),
                error
            );
        }
    }

    private async sendError(intr: CommandInteraction, data: EventData): Promise<void> {
        try {
            await InteractionUtils.send(
                intr,
                i18n.getEmbed('errorEmbeds.command', data.lang, {
                    ERROR_CODE: intr.id,
                    GUILD_ID: intr.guild?.id ?? i18n.getRef('other.na', data.lang),
                    SHARD_ID: (intr.guild?.shardId ?? 0).toString(),
                })
            );
        } catch {
            // Ignore
        }
    }
}

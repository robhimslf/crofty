import {
    AutocompleteInteraction,
    ButtonInteraction,
    Client,
    CommandInteraction,
    Events,
    Guild,
    Interaction,
    Message,
    MessageReaction,
    PartialMessageReaction,
    PartialUser,
    RateLimitData,
    RESTEvents,
    User,
} from 'discord.js';
import { createRequire } from 'node:module';
import {
    Logger,
    PartialUtils
} from '../utils/index.js';
import {
    ButtonHandler,
    CommandHandler,
    GuildJoinHandler,
    GuildLeaveHandler,
    MessageHandler,
    ReactionHandler,
} from '../events/index.js';
import { JobBroker } from './job-broker.js';

const require = createRequire( import.meta.url );
const config = require( '../../config/config.json' );
const debug = require( '../../config/debug.json' );
const logs = require( '../../i18n/logs.json' );

export class Bot {
    private ready = false;

    constructor(
        private token: string,
        private client: Client,
        private guildJoinHandler: GuildJoinHandler,
        private guildLeaveHandler: GuildLeaveHandler,
        private messageHandler: MessageHandler,
        private commandHandler: CommandHandler,
        private buttonHandler: ButtonHandler,
        private reactionHandler: ReactionHandler,
        private jobBroker: JobBroker
    ) {}

    public async start(): Promise<void> {
        this.registerListeners();
        await this.login(this.token);
    }

    private registerListeners(): void {
        this.client.on(Events.ClientReady, () => this.onReady());
        this.client.on(Events.ShardReady, (shardId: number, unavailableGuilds: Set<string>) =>
            this.onShardReady(shardId, unavailableGuilds)
        );
        this.client.on(Events.GuildCreate, (guild: Guild) => this.onGuildJoin(guild));
        this.client.on(Events.GuildDelete, (guild: Guild) => this.onGuildLeave(guild));
        this.client.on(Events.MessageCreate, (msg: Message) => this.onMessage(msg));
        this.client.on(Events.InteractionCreate, (intr: Interaction) => this.onInteraction(intr));
        this.client.on(
            Events.MessageReactionAdd,
            (messageReaction: MessageReaction | PartialMessageReaction, user: User | PartialUser) =>
                this.onReaction(messageReaction, user)
        );
        this.client.rest.on(RESTEvents.RateLimited, (rateLimitData: RateLimitData) =>
            this.onRateLimit(rateLimitData)
        );
    }

    private async login(token: string): Promise<void> {
        try {
            await this.client.login(token);
        } catch (error) {
            Logger.error(logs.error.client_login, error);
            return;
        }
    }

    private async onReady(): Promise<void> {
        let userTag = this.client.user?.tag;
        Logger.info(logs.info.client_login.replaceAll('{USER_TAG}', userTag));

        if (!debug.debugMode.enabled) {
            this.jobBroker.start();
        }

        this.ready = true;
        Logger.info(logs.info.client_ready);
    }

    private onShardReady(shardId: number, _unavailableGuilds: Set<string>): void {
        Logger.setShardId(shardId);
    }

    private async onGuildJoin(guild: Guild): Promise<void> {
        if (!this.ready || debug.debugMode.enabled) {
            return;
        }

        try {
            await this.guildJoinHandler.process(guild);
        } catch (error) {
            Logger.error(logs.error.guild_join, error);
        }
    }

    private async onGuildLeave(guild: Guild): Promise<void> {
        if (!this.ready || debug.debugMode.enabled) {
            return;
        }

        try {
            await this.guildLeaveHandler.process(guild);
        } catch (error) {
            Logger.error(logs.error.guild_leave, error);
        }
    }

    private async onMessage(msg: Message): Promise<void> {
        if (
            !this.ready ||
            (debug.debugMode.enabled && !debug.debugMode.whitelist.includes(msg.author.id))
        ) {
            return;
        }

        try {
            msg = await PartialUtils.resolveMessage(msg);
            if (!msg) {
                return;
            }

            await this.messageHandler.process(msg);
        } catch (error) {
            Logger.error(logs.error.message, error);
        }
    }

    private async onInteraction(intr: Interaction): Promise<void> {
        if (
            !this.ready ||
            (debug.debugMode.enabled && !debug.debugMode.whitelist.includes(intr.user.id))
        ) {
            return;
        }

        if (intr instanceof CommandInteraction || intr instanceof AutocompleteInteraction) {
            try {
                await this.commandHandler.process(intr);
            } catch (error) {
                Logger.error(logs.error.command, error);
            }
        } else if (intr instanceof ButtonInteraction) {
            try {
                await this.buttonHandler.process(intr);
            } catch (error) {
                Logger.error(logs.error.button, error);
            }
        }
    }

    private async onReaction(
        msgReaction: MessageReaction | PartialMessageReaction,
        reactor: User | PartialUser
    ): Promise<void> {
        if (
            !this.ready ||
            (debug.debugMode.enabled && !debug.debugMode.whitelist.includes(reactor.id))
        ) {
            return;
        }

        try {
            msgReaction = await PartialUtils.resolveReaction(msgReaction);
            if (!msgReaction) {
                return;
            }

            reactor = await PartialUtils.resolveUser(reactor);
            if (!reactor) {
                return;
            }

            await this.reactionHandler.process(
                msgReaction,
                msgReaction.message as Message,
                reactor
            );
        } catch (error) {
            Logger.error(logs.error.reaction, error);
        }
    }

    private async onRateLimit(rateLimitData: RateLimitData): Promise<void> {
        if (rateLimitData.timeToReset >= config.logging.rateLimit.minTimeout) {
            Logger.error(logs.error.api_rate_limit, rateLimitData);
        }
    }
}

import { Message, MessageReaction, User } from 'discord.js';
import { RateLimiter } from 'discord.js-rate-limiter';
import { createRequire } from 'node:module';
import { EventDataService } from '../services/index.js';
import { type Reaction } from '../reactions/index.js';
import { type EventHandler } from './event-handler.js';

const require = createRequire( import.meta.url );
const config = require( '../../config/config.json' );

export class ReactionHandler implements EventHandler {
    private rateLimiter = new RateLimiter(
        config.rateLimiting.triggers.amount,
        config.rateLimiting.triggers.interval
    );

    constructor(
        private reactions: Reaction[],
        private eventDataService: EventDataService ) { }

    public async process(
        messageReaction: MessageReaction,
        message: Message,
        reactor: User ): Promise<void> {

        if ( reactor.id === messageReaction.client.user?.id || reactor.bot )
            return;

        const limited = this.rateLimiter.take( message.author.id );
        if ( limited )
            return;

        const reaction = this.findReaction( messageReaction.emoji.name );
        if ( !reaction )
            return;

        if ( reaction.requireGuild && !message.guild )
            return;

        if ( reaction.requireSentByClient && message.author.id !== message.client.user?.id )
            return;

        if ( reaction.requireEmbedAuthorTag &&
            message.embeds[ 0 ]?.author?.name !== reactor.tag )
            return;

        const data = await this.eventDataService.create({
            user: reactor,
            channel: message.channel,
            guild: message.guild,
        });

        await reaction.execute( messageReaction, message, reactor, data );
    }

    private findReaction( emoji: string ): Reaction | undefined {
        return this.reactions.find( x => x.emoji === emoji );
    }
}

import { Message } from 'discord.js';
import { RateLimiter } from 'discord.js-rate-limiter';
import { createRequire } from 'node:module';
import { type Trigger } from '../triggers/index.js';
import { EventDataService } from '../services/index.js';

const require = createRequire( import.meta.url );
const config = require( '../../config/config.json' );

export class TriggerHandler {
    private rateLimiter = new RateLimiter(
        config.rateLimiting.triggers.amount,
        config.rateLimiting.triggers.interval
    );

    constructor(
        private triggers: Trigger[],
        private eventDataService: EventDataService ) { }

    public async process( message: Message ): Promise<void> {

        const limited = this.rateLimiter.take( message.author.id );
        if ( limited )
            return;

        const triggers = this.triggers.filter( x => {
            if ( x.requireGuild && !message.guild )
                return false;
            if ( !x.triggered( message ))
                return false;
            return true;
        });
        if ( triggers.length === 0 )
            return;

        const data = await this.eventDataService.create({
            user: message.author,
            channel: message.channel,
            guild: message.guild,
        });

        for ( const trigger of triggers )
            await trigger.execute( message, data );
    }
}

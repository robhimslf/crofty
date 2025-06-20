import { ButtonInteraction } from 'discord.js';
import { RateLimiter } from 'discord.js-rate-limiter';
import { createRequire } from 'node:module';
import { InteractionUtils } from '../utils/index.js';
import { EventDataService } from '../services/index.js';
import { type Button, ButtonDeferType } from '../buttons/index.js';
import { type EventHandler } from './event-handler.js';

const require = createRequire( import.meta.url );
const config = require( '../../config/config.json' );

export class ButtonHandler implements EventHandler {
    private rateLimiter = new RateLimiter(
        config.rateLimiting.buttons.amount,
        config.rateLimiting.buttons.interval
    );

    constructor(
        private buttons: Button[],
        private eventDataService: EventDataService ) { }

    public async process( interaction: ButtonInteraction ): Promise<void> {

        // Don't respond to self or other bots.
        if ( interaction.user.id === interaction.client.user?.id ||
            interaction.user.bot )
            return;

        // Rate limit check
        const limited = this.rateLimiter.take( interaction.user.id );
        if ( limited )
            return;

        const button = this.findButton( interaction.customId );
        if ( !button )
            return;

        if ( button.requireGuild && !interaction.guild )
            return;

        if ( button.requireEmbedAuthorTag &&
            interaction.message.embeds[ 0 ]?.author?.name !== interaction.user.tag )
            return;

        // Defer interaction
        switch ( button.deferType ) {
            case ButtonDeferType.REPLY:
                await InteractionUtils.deferReply( interaction );
                break;
            case ButtonDeferType.UPDATE:
                await InteractionUtils.deferUpdate( interaction );
                break;
            default:
                break;
        }

        if ( button.deferType !== ButtonDeferType.NONE &&
            !interaction.deferred )
            return;

        const data = await this.eventDataService.create({
            user: interaction.user,
            channel: interaction.channel,
            guild: interaction.guild,
        });

        await button.execute( interaction, data );
    }

    private findButton( id: string ): Button | undefined {
        return this.buttons.find( x => x.ids.includes( id ));
    }
}

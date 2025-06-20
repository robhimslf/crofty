import { Message } from 'discord.js';
import { TriggerHandler } from './trigger-handler.js';
import { type EventHandler } from './event-handler.js';

export class MessageHandler implements EventHandler {
    constructor( private triggerHandler: TriggerHandler ) { }

    public async process( message: Message ): Promise<void> {
        if ( message.system || message.author.id === message.client.user?.id )
            return;

        await this.triggerHandler.process( message );
    }
}

import { Message } from 'discord.js';
import { EventData } from '../models/index.js';

export interface Trigger {
    requireGuild: boolean;
    triggered( message: Message ): boolean;
    execute( message: Message, data: EventData ): Promise<void>;
}

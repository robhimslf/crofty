import { Message, MessageReaction, User } from 'discord.js';
import { EventData } from '../models/index.js';

export interface Reaction {
    emoji: string;
    requireGuild: boolean;
    requireSentByClient: boolean;
    requireEmbedAuthorTag: boolean;
    execute(
        reaction: MessageReaction,
        message: Message,
        reactor: User,
        data: EventData ): Promise<void>;
}

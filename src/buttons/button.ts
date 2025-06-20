import { ButtonInteraction } from 'discord.js';
import { EventData } from '../models/index.js';

export interface Button {
    ids: string[];
    deferType: ButtonDeferType;
    requireGuild: boolean;
    requireEmbedAuthorTag: boolean;
    execute( interaction: ButtonInteraction, data: EventData ): Promise<void>;    
}

export enum ButtonDeferType {
    REPLY = 'REPLY',
    UPDATE = 'UPDATE',
    NONE = 'NONE'
}

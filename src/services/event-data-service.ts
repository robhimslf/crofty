import {
    type PartialDMChannel,
    Channel,
    CommandInteractionOptionResolver,
    Guild,
    User
} from 'discord.js';
import { Language } from '../utils/index.js';
import { EventData } from '../models/index.js';

export class EventDataService {

    public async create( options: {
        user?: User,
        channel?: Channel | PartialDMChannel,
        guild?: Guild,
        args?: Omit<CommandInteractionOptionResolver, 'getMessage' | 'getFocused'>,
    } = {} ): Promise<EventData> {

        // Event language
        const lang =
            options.guild?.preferredLocale &&
            Language.ENABLED.includes( options.guild.preferredLocale )
                ? options.guild.preferredLocale
                : Language.DEFAULT;

        // Guild language
        const langGuild =
            options.guild?.preferredLocale &&
            Language.ENABLED.includes( options.guild.preferredLocale )
                ? options.guild.preferredLocale
                : Language.DEFAULT;

        return new EventData( lang, langGuild );
    }
}

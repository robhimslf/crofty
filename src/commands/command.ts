import {
    type ApplicationCommandOptionChoiceData,
    type AutocompleteFocusedOption,
    type AutocompleteInteraction,
    type CommandInteraction,
    type PermissionsString
} from 'discord.js';
import { RateLimiter } from 'discord.js-rate-limiter';
import { EventData } from '../models/index.js';

export interface Command {
    cooldown?: RateLimiter;
    deferType: CommandDeferType;
    names: string[];
    requirePermissions: PermissionsString[];
    autocomplete?(
        interaction: AutocompleteInteraction,
        option: AutocompleteFocusedOption ): Promise<ApplicationCommandOptionChoiceData[]>;
    execute(
        interaction: CommandInteraction,
        data: EventData ): Promise<void>;
}

export enum CommandDeferType {
    Hidden = 'HIDDEN',
    Public = 'PUBLIC',
    None = 'NONE'
}

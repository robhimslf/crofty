import { ChatInputCommandInteraction, PermissionsString } from 'discord.js';
import { RateLimiter } from 'discord.js-rate-limiter';

import { i18n, InteractionUtils, Language } from '../../utils/index.js';
import { EventData } from '../../models/index.js';
import { Command, CommandDeferType } from '../command.js';

export class TestCommand implements Command {
    public names = [i18n.getRef('chatCommands.test', Language.DEFAULT)];
    public cooldown = new RateLimiter(1, 5000);
    public deferType = CommandDeferType.Hidden;
    public requirePermissions: PermissionsString[] = [];

    public async execute(intr: ChatInputCommandInteraction, data: EventData): Promise<void> {
        await InteractionUtils.send(intr, i18n.getEmbed('displayEmbeds.test', data.lang));
    }
}

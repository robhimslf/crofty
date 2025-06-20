import { MessageContextMenuCommandInteraction, PermissionsString } from 'discord.js';
import { RateLimiter } from 'discord.js-rate-limiter';
import { DateTime } from 'luxon';
import { i18n, InteractionUtils, Language } from '../../utils/index.js';
import { EventData } from '../../models/index.js';
import { Command, CommandDeferType } from '../command.js';

export class ViewDateSent implements Command {
    public names = [i18n.getRef('messageCommands.viewDateSent', Language.DEFAULT)];
    public cooldown = new RateLimiter(1, 5000);
    public deferType = CommandDeferType.Hidden;
    public requirePermissions: PermissionsString[] = [];

    public async execute(
        intr: MessageContextMenuCommandInteraction,
        data: EventData
    ): Promise<void> {
        await InteractionUtils.send(
            intr,
            i18n.getEmbed('displayEmbeds.viewDateSent', data.lang, {
                DATE: DateTime.fromJSDate(intr.targetMessage.createdAt).toLocaleString(
                    DateTime.DATE_HUGE
                ),
            })
        );
    }
}
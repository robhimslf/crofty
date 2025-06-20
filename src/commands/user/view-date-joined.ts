import {
    DMChannel,
    PermissionsString,
    UserContextMenuCommandInteraction
} from 'discord.js';
import { RateLimiter } from 'discord.js-rate-limiter';
import { DateTime } from 'luxon';

import { i18n, InteractionUtils, Language } from '../../utils/index.js';
import { EventData } from '../../models/index.js';
import { Command, CommandDeferType } from '../command.js';

export class ViewDateJoined implements Command {
    public names = [i18n.getRef('userCommands.viewDateJoined', Language.DEFAULT)];
    public cooldown = new RateLimiter(1, 5000);
    public deferType = CommandDeferType.Hidden;
    public requirePermissions: PermissionsString[] = [];

    public async execute(intr: UserContextMenuCommandInteraction, data: EventData): Promise<void> {
        let joinDate: Date;
        if (!(intr.channel instanceof DMChannel)) {
            let member = await intr.guild.members.fetch(intr.targetUser.id);
            joinDate = member.joinedAt;
        } else joinDate = intr.targetUser.createdAt;

        await InteractionUtils.send(
            intr,
            i18n.getEmbed('displayEmbeds.viewDateJoined', data.lang, {
                TARGET: intr.targetUser.toString(),
                DATE: DateTime.fromJSDate(joinDate).toLocaleString(DateTime.DATE_HUGE),
            })
        );
    }
}

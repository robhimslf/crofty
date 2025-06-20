import {
    ApplicationCommand,
    Guild,
    Locale
} from 'discord.js';
import { filesize } from 'filesize';
import { Duration } from 'luxon';

export class FormatUtils {

    public static ROLE_HERE = '@here';
    public static ROLE_EVERYONE = '@everyone';

    public static channelMention( discordId: string ): string {
        return `<#${discordId}>`;
    }

    public static commandMention(
        command: ApplicationCommand,
        subparts: string[] = [] ): string {
        const name = [ command.name, ...subparts ].join( ' ' );
        return `</${name}:${command.id}>`;
    }

    public static roleMention(
        guild: Guild,
        discordId: string ): string {
        
        if ( discordId === FormatUtils.ROLE_HERE )
            return discordId;

        if ( discordId === guild.id )
            return FormatUtils.ROLE_EVERYONE;

        return `<@&${discordId}>`;
    }

    public static userMention( discordId: string ): string {
        return `<@!${discordId}>`;
    }

    public static duration( ms: number, locale: Locale ): string {
        return Duration.fromObject(
            Object.fromEntries(
                Object.entries(
                    Duration
                        .fromMillis( ms, { locale })
                        .shiftTo(
                            'year',
                            'quarter',
                            'month',
                            'week',
                            'day',
                            'hour',
                            'minute',
                            'second'
                        )
                        .toObject()
                ).filter(([ __dirname, value ]) => !!value )
            )
        ).toHuman({ maximumFractionDigits: 0 });
    }

    public static fileSize( bytes: number ): string {
        return filesize( bytes, {
            outout: 'string',
            pad: true,
            round: 2
        });
    }
}

import { DateTime } from 'luxon';
import { Client } from 'discordx';
import { scheduleJob } from 'node-schedule';
import { Guild, MessageEmbed, TextChannel } from 'discord.js';
import {
    config,
    constants,
    dateTime,
    getF1CircuitImageUrl,
    getImageUrlFromPage,
    i18n,
    markdown,
    slugify
} from '../utilities/index.js';
import { ergastAPI, FirestoreAPI, IF1ScheduledEvent } from '../api/index.js';
import { CronTaskBase, ICronTask } from './cron-task-base.js';

/**
 * A scheduled cron task that creates a topic thread for a Formula 1 race within
 * configured servers 4 days in advance.
 * 
 * Cron runs each day at 1 AM UTC.
 */
export class RaceThreadCronTask extends CronTaskBase implements ICronTask {

    /**
     * Slug identifier of the current Formula 1 race used to ensure that only
     * one driver-of-the-day task is scheduled.
     */
    private raceId: string | undefined;

    /**
     * Constructs and prepares this cron task for execution.
     * 
     * @param {Client} client 
     */
    constructor( client: Client ) {
        super( client, '* * * * *' );
    }

    /**
     * Begins cron task execution.
     */
    async run(): Promise<void> {
        const daysFromNow = config.autoThreads.advanceDays;
        const nextRace = await this.getNextRace( daysFromNow );
        if ( nextRace ) {

            await this.scheduleDriverOfTheDay( nextRace );

            const guilds = await FirestoreAPI.Instance.getGuildsWithAutoEventThreads();
            if ( guilds.length > 0 ) {

                const embed = await this.getEmbed( nextRace );
                for ( let i = 0; i < guilds.length; i++ ) {

                    const config = guilds[ i ];
                    const guild = this.client.guilds.cache.get( config.guildId );
                    const channelId = config.autoEventThreadChannelId;
                    const guildMembers = await FirestoreAPI.Instance
                        .getGuildMembersWithAutoEventThreadNotify( config.guildId );

                    if ( guild && channelId )
                        await this.createThread(
                            guild,
                            channelId,
                            nextRace,
                            embed,
                            guildMembers.map( gm => gm.guildMemberId ));
                }
            }
        }
    }

    /**
     * Creates a new race thread, and 
     * @param {Guild} guild 
     * @param {string} channelId 
     * @param {IF1ScheduledEvent} race 
     * @param {MessageEmbed} embed 
     */
    private async createThread(
        guild: Guild,
        channelId: string,
        race: IF1ScheduledEvent,
        embed: MessageEmbed,
        notifyMemberIds: string[] ) {
        
        const channel = await guild.channels.fetch( channelId );
        if ( channel && channel.isText() ) {

            const name = `${race.season} ${race.raceName}`;
            const manager = ( channel as TextChannel ).threads;

            let thread = manager.cache.find( t => t.name === name );
            if ( !thread ) {
                thread = await manager.create({
                    name,
                    autoArchiveDuration: 4320,
                    reason: name
                });

                await thread.send({ embeds: [ embed ]});

                if ( notifyMemberIds.length > 0 ) {
                    const notifyMembers = notifyMemberIds
                        .map( nmid => `<@${nmid}>` )
                        .join( ' ' );
                    await thread.send({ content: `*Auto-Notification:* ${notifyMembers}` });
                }
            } else if ( thread.archived )
                await thread.setArchived( false, 'Grand prix not complete.' );
        }
    }

    /**
     * Prepares a Discord message embed for first thread topic.
     * 
     * @param {IF1ScheduledEvent} race 
     * @returns {Promise<MessageEmbed>}
     */
    private async getEmbed( race: IF1ScheduledEvent ): Promise<MessageEmbed> {
        const name = markdown.formatF1EventName( race, false, true );
        const date = markdown.formatF1EventDate( race, DateTime.DATE_HUGE );
        const circuit = markdown.formatF1CircuitName( race.Circuit, true, true );

        const title = `${race.season} ${race.raceName}`;
        const description = i18n.t( 'embed.raceThread.description', {
            name,
            round: race.round,
            season: race.season,
            date,
            time: `<t:${race.dateTime!.toSeconds()}:R>`,
            circuit,
            espn: config.links.espn,
            f1tv: config.links.f1tv
        });
        const image = await getF1CircuitImageUrl( race.Circuit.circuitName );

        let cities: string[] = [],
            times: string[] = [];
        dateTime.UnitedStatesTimeZones.forEach( ustz => {
            const time = dateTime.convertTimeToZone( race.dateTime!, ustz.zone );
            cities.push( ustz.city );
            times.push( time.toLocaleString( DateTime.TIME_SIMPLE ));
        });

        const embed = new MessageEmbed()
            .setColor( constants.EmbedColor )
            .setTitle( title )
            .setDescription( description )
            .addFields([
                {
                    name: i18n.t( 'embed.raceThread.fields.city' ),
                    value: cities.join( '\n' ),
                    inline: true
                },
                {
                    name: i18n.t( 'embed.raceThread.fields.time' ),
                    value: times.join( '\n' ),
                    inline: true
                }
            ]);

        if ( image )
            embed.setThumbnail( image );

        return embed;
    }

    /**
     * Fetches the next Formula 1 race that occurs in the next X days.
     * 
     * @param {number} daysFromNow 
     * @returns {Promise<IF1ScheduledEvent>}
     */
    private async getNextRace( daysFromNow: number )
        : Promise<IF1ScheduledEvent | undefined> {

        const now = DateTime.utc();
        return ( await ergastAPI.getUpcomingEvents() )
            .find( race =>
                race.dateTime! > now &&
                race.dateTime!.minus({ days: daysFromNow }) <= now );
    }

    /**
     * Schedules a Driver of the Day message for race day once voting has opened.
     * 
     * @param {IF1ScheduledEvent} race 
     */
    private async scheduleDriverOfTheDay( race: IF1ScheduledEvent ) {

        const link = config.links.dotd;
        const name = `${race.season} ${race.raceName}`;
        const id = slugify( name );

        if ( id !== this.raceId ) {

            this.raceId = id;
            const dotdStarts = race.dateTime!.plus({ hours: 1 });
            const dotdEnds = dotdStarts.plus({ minutes: 50 });

            // Pre-generate the embed.
            const embedName = markdown.formatF1EventName( race, false, true );
            const embedTitle = i18n.t( 'embed.driverOfTheDay.title' );
            const embedDescription = i18n.t( 'embed.driverOfTheDay.description', {
                name: embedName,
                time: `<t:${dotdEnds.toSeconds()}:R>`,
                link
            });
            const embedImage = await getImageUrlFromPage( link, 'twitter:image' );
            const embed = new MessageEmbed()
                .setColor( constants.EmbedColor )
                .setTitle( embedTitle )
                .setDescription( embedDescription );
            if ( embedImage )
                embed.setThumbnail( embedImage );

            // Schedule DotD for race time + 1 hour.
            const schedule = dotdStarts.toJSDate();
            scheduleJob(
                schedule,
                async () => {

                    const guilds = await FirestoreAPI.Instance
                        .getGuildsWithAutoEventThreads();
                    if ( guilds.length > 0 ) {
                        for ( let i = 0; i < guilds.length; i++ ) {

                            const config = guilds[ i ];
                            const guild = this.client.guilds.cache.get( config.guildId );
                            const channelId = config.autoEventThreadChannelId;

                            if ( guild && channelId ) {

                                const channel = await guild.channels.fetch( channelId );
                                if ( channel && channel.isText() ) {

                                    const manager = ( channel as TextChannel ).threads;
                                    const thread = manager.cache.find( t => t.name === name );

                                    if ( thread && !thread.archived )
                                        await thread.send({ embeds: [ embed ]});
                                }
                            }
                        }
                    }
                }
            );
        }
    }
}
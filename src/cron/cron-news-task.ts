import { DateTime } from 'luxon';
import { Client } from 'discordx';
import { EmbedFieldData, Guild, MessageEmbed } from 'discord.js';
import Parser from 'rss-parser';
import {
    config,
    constants,
    dateTime,
    i18n
} from '../utilities/index.js';
import { FirestoreAPI } from '../api/index.js';
import { CronTaskBase, ICronTask } from './cron-task-base.js';

/**
 * Interface contract of an object containing properties of a Formula 1 news item.
 */
interface INewsItem {
    feed: string;
    published: DateTime;
    title: string;
    url: string;
}

/**
 * A scheduled cron task that sends Formula 1 news to subscribed servers each
 * day at 1 AM UTC.
 */
export class NewsCronTask extends CronTaskBase implements ICronTask {

    /**
     * Constructs and prepares this cron task for execution.
     * 
     * @param {Client} client 
     */
    constructor( client: Client ) {
        super( client, '0 1 * * *' );
    }

    /**
     * Begins cron task execution.
     */
    async run(): Promise<void> {
        const newsItems = await this.getNewsItems();
        if ( newsItems.length > 0 ) {
            
            const guilds = await FirestoreAPI.Instance.getGuildsWithAutoNewsReports();
            if ( guilds.length > 0 ) {

                const embed = this.getNewsEmbed( newsItems );
                for ( let i = 0; i < guilds.length; i++ ) {

                    const config = guilds[ i ];
                    const guild = this.client.guilds.cache.get( config.guildId );
                    const channelId = config.autoNewsChannelId;

                    if ( guild && channelId )
                        await this.createTopic( guild, channelId, embed );
                }
            }
        }
    }

    /**
     * Sends a message to a text channel in a guild server with a message embed.
     * 
     * @param {Guild} guild 
     * @param {string} channelId 
     * @param {MessageEmbed} embed 
     */
    private async createTopic( guild: Guild, channelId: string, embed: MessageEmbed ) {
        const channel = await guild.channels.fetch( channelId );
        if ( channel && channel.isText() )
            await channel.send({ embeds: [ embed ]});
    }

    /**
     * Prepares a Discord message embed from a collection of news items.
     * 
     * @param {INewsItem[]} items 
     * @returns {MessageEmbed}
     */
    private getNewsEmbed( items: INewsItem[] ): MessageEmbed {
        let includedSources: string[] = [],
            fields: EmbedFieldData[] = [];

        config.news.sources.forEach(( source, idx ) => {
            const sourceItems = items.filter( i => i.feed === source.name );
            if ( sourceItems.length > 0 ) {
                includedSources.push( `[${source.name}](${source.homepage})` );

                const value = sourceItems
                    .map( si => `• [${si.title}](${si.url}) *- <t:${si.published.toSeconds()}:R>*` )
                    .join( '\n' );
                fields.push({
                    name: source.name,
                    value
                });
            }
        });

        let includedSourcesStr = '';
        includedSources.forEach(( incSrc, idx ) => {
            let delim = ',';

            if ( idx === includedSources.length - 1 )
                delim = ', and';

            includedSourcesStr += ( idx === 0 )
                ? incSrc
                : `${delim} ${incSrc}`;
        });

        const title = i18n.t( 'embed.news.title', {
            date: DateTime.utc().toLocaleString( DateTime.DATE_MED )
        });

        const description = i18n.t( 'embed.news.description', {
            sources: includedSourcesStr
        });

        return new MessageEmbed()
            .setColor( constants.EmbedColor )
            .setTitle( title )
            .setDescription( description )
            .addFields( fields );
    }

    /**
     * Fetches a collection of news articles since the last configured number of
     * hours defined by `config.news.refreshHours`.
     */
    private async getNewsItems(): Promise<INewsItem[]> {
        let items: INewsItem[] = [];

        try {
            const parser = new Parser();
            const now = DateTime.utc();

            for ( let i = 0; i < config.news.sources.length; i++ ) {
                const source = config.news.sources[ i ];
                const sourceFeed = await parser.parseURL( source.rssFeed );
                const sourceItems: INewsItem[] = sourceFeed.items
                    .filter( si =>
                        si.pubDate !== undefined &&
                        si.title !== undefined &&
                        si.link !== undefined )
                    .map( si => ({
                        feed: source.name,
                        published: dateTime.convertToDateTime(
                            si.pubDate!, source.dateType ),
                        title: si.title!,
                        url: si.link!
                    }))
                    .filter( si => {
                        const diff = now.diff( si.published, 'hours' );
                        return ( diff.hours <= config.news.refreshHours );
                    });

                items = items.concat( sourceItems );
            }
        } catch ( err ) {
            console.warn( `🛑 Failed fetching news items.`, err );
        }

        return items;
    }
}
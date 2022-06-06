import { Client } from 'discordx';
import { Guild, MessageEmbed, TextChannel } from 'discord.js';
import {
    config,
    constants,
    getImageUrlFromPage,
    markdown
} from '../utilities/index.js';
import type { IF1Event } from '../api/index.js';
import { FirestoreAPI } from '../api/index.js';
import type { IScheduledTask } from './scheduled-task-base.js';
import { ScheduledTaskBase } from './scheduled-task-base.js';

export class DriverOfTheDayScheduledTask extends ScheduledTaskBase implements IScheduledTask {

    /**
     * Instance of `IF1Event` that spawned this task.
     */
    private race: IF1Event;

    /**
     * Constructor.
     * 
     * @param {IF1Event} race
     */
    constructor( race: IF1Event ) {
        const schedule = race.dateTime!.plus({ hours: 1 });
        super( schedule );

        this.race = race;
    }

    /**
     * Begins scheduled task execution.
     * 
     * @param {Client} client 
     */
    async run( client: Client ): Promise<void> {
        const dotdLink = config.links.dotd;
        const guilds = await FirestoreAPI.Instance.getGuildsWithAutoEventThreads();
        if ( guilds.length > 0 ) {

            const embed = await this.getEmbed( dotdLink );
            for ( let i = 0; i < guilds.length; i++ ) {

                const config = guilds[ i ];
                const guild = client.guilds.cache.get( config.guildId );
                const channelId = config.autoEventThreadChannelId;

                if ( guild && channelId )
                    await this.createTopic( guild, channelId, embed );
            }
        }
    }

    /**
     * Sends a message to the current race thread in a guild server with a message
     * embed.
     * 
     * @param {Guild} guild 
     * @param {string} channelId  
     * @param {MessageEmbed} embed 
     */
    private async createTopic(
        guild: Guild,
        channelId: string,
        embed: MessageEmbed ) {

        const channel = await guild.channels.fetch( channelId );
        if ( channel && channel.isText() ) {

            const name = `${this.race.season} ${this.race.raceName}`;
            const manager = ( channel as TextChannel ).threads;
            const thread = manager.cache.find( t => t.name === name );

            if ( thread && !thread.archived )
                await thread.send({ embeds: [ embed ]});
        }
    }

    /**
     * Prepares a Discord message embed for Driver of the Day voting.
     * 
     * @param {string} dotdLink 
     * @returns {MessageEmbed}
     */
    private async getEmbed( dotdLink: string ): Promise<MessageEmbed> {
        const name = markdown.formatF1EventName( this.race, false, true );
        const title = `Driver of the Day Voting is Open`;
        const closes = this.race.dateTime!.plus({ minutes: 50 });
        const description = `Voting for the ${this.race.season} ${name} Driver of the Day is now open and close(s/ed) <t:${closes.toSeconds()}:R>.\n\n[**Vote for Driver of the Day**](${dotdLink})`;

        const image = await getImageUrlFromPage( dotdLink,
            'twitter:image' );

        const embed = new MessageEmbed()
            .setColor( constants.EmbedColor )
            .setTitle( title )
            .setDescription( description );

        if ( image )
            embed.setThumbnail( image );

        return embed;
    }
}
import { CommandInteraction, EmbedFieldData } from 'discord.js';
import {
    batchize,
    constants,
    F1Season,
    markdown,
    shortenLinks,
    toF1Season
} from '../../../utilities/index.js';
import type { IF1RaceEvent } from '../../../api/index.js';
import { ergastAPI } from '../../../api/index.js';
import {
    CommandBase,
    ICommandAsync,
    ICommandEmbedStub
} from '../command-base.js';

/**
 * Object representing a parsed response for a query to Crofty for all race wins
 * in a season.
 */
export class WinStats extends CommandBase implements ICommandAsync {

    /**
     * Season to which this driver's stats are associated.
     */
    private season: F1Season | undefined;

    /**
     * Constructs, initializes, and validates the query parameters.
     * 
     * @param {CommandInteraction} interaction 
     * @param {string} season 
     * @param {string} driver 
     */
    constructor( interaction: CommandInteraction, season?: string ) {
        super( interaction );

        this.season = toF1Season( season );
        if ( !this.season )
            this.replyContent = constants.Strings.InvalidSeason;
    }

    /**
     * Fetches and prepares the statistics for the requested driver.
     */
    async prepare() {
        let error = this.fallbackReply.content!;

        try {
            let events = await ergastAPI.getWinSeasonResults( this.season! );
            if ( events.length === 0 || events[ 0 ].Results.length === 0 ) {
                error = `Unable to find race winner results for the ${this.season!} Formula 1 season.`;
                throw new Error( error );
            }

            const event = events[ 0 ];
            const embedBase = this.initializeEmbed(
                event.season,
                events.length );
            const hasFastestLap = events.some( e => e.Results.some( r => r.FastestLap ));

            // Resolve all links to be shortened.
            events = await shortenLinks( events ) as IF1RaceEvent[];
            events = events.sort(( a, b ) => a.round - b.round );

            // Break the results into batches for pagination.
            const batches = batchize( events );
            batches.forEach( batch => {
                const fields = this.getPageEmbedFields( batch, hasFastestLap );
                const footer = ( hasFastestLap )
                    ? constants.Strings.EmbedFooterFastestLap
                    : undefined;

                this.createEmbed(
                    embedBase.title,
                    embedBase.description,
                    fields,
                    footer
                );
            });
        } catch ( err ) {
            console.warn( `🛑 Failed to prepare seasonal race wins stats reply.`, err );
            this.replyContent = error;
        }
    }

    /**
     * Fetches a collection of fields within a result page of events.
     * 
     * @param {IF1QualifyingEvent[]} items 
     * @param {boolean} withQ3 
     * @returns {EmbedFieldData[]}
     */
    private getPageEmbedFields(
        items: IF1RaceEvent[],
        withFastestLap: boolean = false ): EmbedFieldData[] {

        const events = items.map( i =>
            markdown.formatF1EventName( i, true, true, true ));
        const drivers = items.map( i =>
            `${markdown.formatF1DriverName( i.Results[ 0 ].Driver, true )}, ${markdown.formatF1ConstructorName( i.Results[ 0 ].Constructor, true )}` );
        const times = items.map( i =>
            markdown.formatF1RaceTime( i.Results[ 0 ], withFastestLap ));

        return [
            { name: 'Round', value: events.join( '\n' ), inline: true },
            { name: 'Driver, Team', value: drivers.join( '\n' ), inline: true },
            { name: 'Finish', value: times.join( '\n' ), inline: true }
        ];
    }

    /**
     * Fetches title and description used for each page of a multi-page embed.
     * 
     * @param {string} season
     * @param {number} resultCount
     * @returns {ICommandEmbedStub}
     */
    private initializeEmbed( season: string, resultCount: number ): ICommandEmbedStub {
        const title = `${season} Race Win Results`;
        const description = `Formula 1 race winners for the ${season} season spanning ${resultCount} races.`;

        return {
            title,
            description
        };
    }
}
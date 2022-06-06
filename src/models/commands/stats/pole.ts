import { CommandInteraction, EmbedFieldData } from 'discord.js';
import {
    batchize,
    constants,
    F1Season,
    markdown,
    shortenLinks,
    toF1Season
} from '../../../utilities/index.js';
import type { IF1QualifyingEvent } from '../../../api/index.js';
import { ergastAPI } from '../../../api/index.js';
import {
    CommandBase,
    ICommandAsync,
    ICommandEmbedStub
} from '../command-base.js';

/**
 * Object representing a parsed response for a query to Crofty for all pole
 * position qualifiers in a season.
 */
export class PoleStats extends CommandBase implements ICommandAsync {

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
            let events = await ergastAPI.getPoleSeasonResults( this.season! );
            if ( events.length === 0 || events[ 0 ].QualifyingResults.length === 0 ) {
                error = `Unable to find pole position results for the ${this.season!} Formula 1 season.`;
                throw new Error( error );
            }

            const event = events[ 0 ];
            const embedBase = this.initializeEmbed(
                event.season,
                events.length );

            // Resolve all links to be shortened.
            events = await shortenLinks( events ) as IF1QualifyingEvent[];
            events = events.sort(( a, b ) => a.round - b.round );

            // Break the results into batches for pagination.
            const batches = batchize( events );
            batches.forEach( batch => {
                const fields = this.getPageEmbedFields( batch );

                this.createEmbed(
                    embedBase.title,
                    embedBase.description,
                    fields
                );
            });
        } catch ( err ) {
            console.warn( `🛑 Failed to prepare seasonal pole position stats reply.`, err );
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
    private getPageEmbedFields( items: IF1QualifyingEvent[] ): EmbedFieldData[] {
        const events = items.map( i =>
            markdown.formatF1EventName( i, true, true, true ));
        const drivers = items.map( i =>
            `${markdown.formatF1DriverName( i.QualifyingResults[ 0 ].Driver, true )}, ${markdown.formatF1ConstructorName( i.QualifyingResults[ 0 ].Constructor, true )}` );
        const bests = items.map( i => {
            const result = i.QualifyingResults[ 0 ];
            let value: string = constants.Strings.DidNotQualify;

            if ( result.Q3 )
                value = result.Q3;
            else if ( result.Q2 )
                value = result.Q2;
            else
                value = result.Q1;

            return value;
        });

        return [
            { name: 'Round', value: events.join( '\n' ), inline: true },
            { name: 'Driver, Team', value: drivers.join( '\n' ), inline: true },
            { name: 'Best', value: bests.join( '\n' ), inline: true }
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
        const title = `${season} Pole Position Results`;
        const description = `Formula 1 pole position results for the ${season} season spanning ${resultCount} races.`;

        return {
            title,
            description
        };
    }
}
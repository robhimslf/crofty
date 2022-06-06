import { DateTime } from 'luxon';
import { CommandInteraction, EmbedFieldData } from 'discord.js';
import {
    batchize,
    constants,
    F1Round,
    F1Season,
    getF1CircuitImageUrl,
    markdown,
    shortenLinks,
    toF1Round,
    toF1Season
} from '../../../utilities/index.js';
import type { IF1RaceEvent, IF1RaceResult } from '../../../api/index.js';
import { ergastAPI } from '../../../api/index.js';
import {
    CommandBase,
    ICommandAsync,
    ICommandEmbedStub
} from '../command-base.js';

/**
 * Object representing a parsed response for a query to Crofty for race results
 * for a specific round and season.
 */
export class RaceStats extends CommandBase implements ICommandAsync {

    /**
     * Round - within the `season` - to which these qualifying results apply.
     */
    private round: F1Round | undefined;

    /**
     * Season in which these qualifying results apply.
     */
    private season: F1Season | undefined;

    /**
     * Constructs, initializes, and validates the query parameters.
     * 
     * @param {CommandInteraction} interaction 
     * @param {string} season 
     * @param {string} driver 
     */
    constructor(
        interaction: CommandInteraction,
        round?: string,
        season?: string ) {
        
        super( interaction );

        this.season = toF1Season( season );
        if ( !this.season )
            this.replyContent = constants.Strings.InvalidSeason;

        this.round = toF1Round( round );
        if ( !this.round )
            this.replyContent = constants.Strings.InvalidRound;
    }

    /**
     * Fetches and prepares the statistics for the requested qualifying session.
     */
    async prepare() {
        let error = this.fallbackReply.content!;

        try {
            const event = await ergastAPI.getRaceResult(
                this.season!, this.round! );
            let results = event?.Results || [];
            if ( !event || results.length === 0 ) {
                error = `Unable to find race results for ${this.round! === 'last' ? 'the last round' : `round ${this.round!}`} of the ${this.season!} Formula 1 season.`;
                throw new Error( error );
            }

            const embedBase = this.initializeEmbed( event );
            const hasFastestLap = results.some( r => r.FastestLap );

            // Resolve all links to be shortened.
            results = await shortenLinks( results ) as IF1RaceResult[];
            results = results.sort(( a, b ) => a.position - b.position );

            // Resolve the circuit's Wikipedia image.
            const image = await getF1CircuitImageUrl( event.Circuit.circuitName );

            // Break the results into batches for pagination.
            const batches = batchize( results );
            batches.forEach( batch => {
                const fields = this.getPageEmbedFields( batch, hasFastestLap );
                const footer = ( hasFastestLap )
                    ? constants.Strings.EmbedFooterFastestLap
                    : undefined;

                this.createEmbed(
                    embedBase.title,
                    embedBase.description,
                    fields,
                    footer,
                    image
                );
            });
        } catch ( err ) {
            console.warn( `🛑 Failed to prepare race stats reply.`, err );
            this.replyContent = error;
        }
    }

    /**
     * Fetches a collection of fields within a result page of events.
     * 
     * @param {IF1RaceResult[]} items 
     * @param {boolean} withFastestLap 
     * @returns {EmbedFieldData[]}
     */
    private getPageEmbedFields(
        items: IF1RaceResult[],
        withFastestLap: boolean = false ): EmbedFieldData[] {

        const positions = items.map( i =>
            i.position );
        const drivers = items.map( i =>
            `${markdown.formatF1DriverName( i.Driver, true, true )}, ${markdown.formatF1ConstructorName( i.Constructor, true, true )}` );
        const times = items.map( i =>
            markdown.formatF1RaceTime( i, withFastestLap ));
        
        return [
            { name: 'Pos', value: positions.join( '\n' ), inline: true },
            { name: 'Driver, Team', value: drivers.join( '\n' ), inline: true },
            { name: 'Finish', value: times.join( '\n' ), inline: true }
        ];
    }

    /**
     * Fetches title and description used for each page of a multi-page embed.
     * 
     * @param {IF1RaceEvent} event 
     * @returns {ICommandEmbedStub}
     */
    private initializeEmbed( event: IF1RaceEvent ): ICommandEmbedStub {
        const name = markdown.formatF1EventName( event, false, true );
        const circuit = markdown.formatF1CircuitName( event.Circuit, true, true );
        const date = markdown.formatF1EventDate( event );
        const eventDateStr = ( event.time )
            ? `${event.date}T${event.time}`
            : event.date;
        const eventDate = DateTime.fromISO( eventDateStr, { zone: 'UTC' });

        let dateDescription = `took place ${date}`;
        if ( eventDate > DateTime.utc() )
            dateDescription = `will take place ${date}`;

        const title = `${event.season} ${event.raceName} Race Results`;
        const description = `Formula 1 race results for the ${name}. The grand prix ${dateDescription} at ${circuit}.`;

        return {
            title,
            description
        };
    }
}
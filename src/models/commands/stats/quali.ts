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
import type { IF1QualifyingEvent, IF1QualifyingResult } from '../../../api/index.js';
import { ergastAPI } from '../../../api/index.js';
import {
    CommandBase,
    ICommandAsync,
    ICommandEmbedStub
} from '../command-base.js';

/**
 * Object representing a parsed response for a query to Crofty for qualifying
 * results for a specific round and season.
 */
export class QualiStats extends CommandBase implements ICommandAsync {

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
            const event = await ergastAPI.getQualifyingResult(
                this.season!, this.round! );
            let results = event?.QualifyingResults || [];
            if ( !event || results.length === 0 ) {
                error = `Unable to find qualifying results for ${this.round! === 'last' ? 'the last round' : `round ${this.round!}`} of the ${this.season!} Formula 1 season.`;
                throw new Error( error );
            }

            const embedBase = this.initializeEmbed( event );
            const multiStage = ( Number( event.season ) >=
                constants.MultiStageQualifyingStartYear );

            // Resolve all links to be shortened.
            results = await shortenLinks( results ) as IF1QualifyingResult[];
            results = results.sort(( a, b ) => a.position - b.position );

            // Resolve the circuit's Wikipedia image.
            const image = await getF1CircuitImageUrl( event.Circuit.circuitName );

            // Break the results into batches for pagination.
            const batches = batchize( results );
            batches.forEach( batch => {
                const fields = this.getPageEmbedFields( batch, multiStage );
                const footer = ( multiStage )
                    ? constants.Strings.EmbedFooterQualifying
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
            console.warn( `🛑 Failed to prepare qualifying stats reply.`, err );
            this.replyContent = error;
        }
    }

    /**
     * Fetches a collection of fields within a result page of events.
     * 
     * @param {IF1QualifyingResult[]} items 
     * @param {boolean} withQ3 
     * @returns {EmbedFieldData[]}
     */
    private getPageEmbedFields(
        items: IF1QualifyingResult[],
        withQ3: boolean = false ): EmbedFieldData[] {

        const positions = items.map( i =>
            i.position );
        const drivers = items.map( i =>
            `${markdown.formatF1DriverName( i.Driver, true, true )}, ${markdown.formatF1ConstructorName( i.Constructor, true, true )}` );
        const bests = items.map( i => {
            let value: string = constants.Strings.DidNotQualify;

            if ( withQ3 && i.Q3 )
                value = i.Q3;
            else if ( withQ3 && i.Q2 )
                value = `${i.Q2}${constants.Strings.SymbolQualifyingQ2Knockout}`;
            else if ( withQ3 && i.Q1 )
                value = `${i.Q1}${constants.Strings.SymbolQualifyingQ1Knockout}`;
            else
                value = i.Q1;

            return value;
        });

        return [
            { name: 'Pos', value: positions.join( '\n' ), inline: true },
            { name: 'Driver, Team', value: drivers.join( '\n' ), inline: true },
            { name: 'Best', value: bests.join( '\n' ), inline: true }
        ];
    }

    /**
     * Fetches title and description used for each page of a multi-page embed.
     * 
     * @param {IF1QualifyingEvent} event 
     * @returns {ICommandEmbedStub}
     */
    private initializeEmbed( event: IF1QualifyingEvent ): ICommandEmbedStub {
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

        const title = `${event.season} ${event.raceName} Qualifying Results`;
        const description = `Formula 1 qualifying results determining the starting order of the ${name}. The qualifying session ${dateDescription} at ${circuit}.`;

        return {
            title,
            description
        };
    }
}
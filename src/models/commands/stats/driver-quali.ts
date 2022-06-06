import { DateTime } from 'luxon';
import { CommandInteraction, EmbedFieldData } from 'discord.js';
import {
    batchize,
    constants,
    F1Season,
    getImageUrlFromPage,
    markdown,
    shortenLinks,
    stringValue,
    toF1Season
} from '../../../utilities/index.js';
import { ergastAPI, IF1Driver, IF1QualifyingEvent } from '../../../api/index.js';
import {
    CommandBase,
    ICommandAsync,
    ICommandEmbedStub
} from '../command-base.js';

/**
 * Object representing a parsed response for a query to Crofty for a driver's
 * seasonal qualifying statistics.
 */
export class DriverQualiStats extends CommandBase implements ICommandAsync {

    /**
     * Season to which this driver's stats are associated.
     */
    private season: F1Season | undefined;

     /**
      * Name of the driver to which these stats are associated.
      */
    private driver: string | undefined;

    /**
     * Constructs, initializes, and validates the query parameters.
     * 
     * @param {CommandInteraction} interaction 
     * @param {string} season 
     * @param {string} driver 
     */
    constructor(
        interaction: CommandInteraction,
        season?: string,
        driver?: string ) {
        
        super( interaction );

        this.season = toF1Season( season );
        if ( !this.season )
            this.replyContent = constants.Strings.InvalidSeason;

        this.driver = stringValue( driver );
        if ( !this.driver )
            this.replyContent = `The 'driver' value must be provided.`;
    }

    /**
     * Fetches and prepares the statistics for the requested driver.
     */
    async prepare() {
        let error = this.fallbackReply.content!;

        try {
            let events = await ergastAPI.getDriverSeasonQuali(
                this.season!, this.driver! );
            if ( events.length === 0 || events[ 0 ].QualifyingResults.length === 0 ) {
                error = `Unable to find qualifying results for driver "${this.driver!}" in the ${this.season!} Formula 1 season.`;
                throw new Error( error );
            }

            const event = events[ 0 ];
            const multiStage = ( Number( event.season ) >=
                constants.MultiStageQualifyingStartYear );
            const driver = event.QualifyingResults[ 0 ].Driver;
            const teams = this.getSeasonTeams( events );
            const embedBase = this.initializeEmbed(
                driver,
                event.season,
                teams );

            // Resolve all links to be shortened.
            events = await shortenLinks( events ) as IF1QualifyingEvent[];
            events = events.sort(( a, b ) => a.round - b.round );

            // Resolve the driver's Wikipedia image.
            const image = await getImageUrlFromPage( driver.url );

            // Break the results into batches for pagination.
            const batches = batchize( events );
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
            console.warn( `🛑 Failed to prepare driver stats reply.`, err );
            this.replyContent = error;
        }
    }

    /**
     * Fetches a collection of fields within a result page of events.
     * 
     * @param {IF1QualifyingEvent[]} items 
     * @param {boolean} hasMultiStage 
     * @returns {EmbedFieldData[]}
     */
    private getPageEmbedFields(
        items: IF1QualifyingEvent[],
        hasMultiStage: boolean = false ): EmbedFieldData[] {
        
        const events = items.map( i =>
            markdown.formatF1EventName( i, true, true, true ));
        const positions = items.map( i =>
            i.QualifyingResults[ 0 ].position );
        const bests = items.map( i => {
            const result = i.QualifyingResults[ 0 ];
            let value: string = constants.Strings.DidNotQualify;

            if ( hasMultiStage && result.Q3 )
                value = result.Q3;
            else if ( hasMultiStage && result.Q2 )
                value = `${result.Q2}${constants.Strings.SymbolQualifyingQ2Knockout}`;
            else if ( hasMultiStage && result.Q1 )
                value = `${result.Q1}${constants.Strings.SymbolQualifyingQ1Knockout}`;
            else
                value = result.Q1;

            return value;
        });

        return [
            { name: 'Round', value: events.join( '\n' ), inline: true },
            { name: 'Pos', value: positions.join( '\n' ), inline: true },
            { name: 'Best', value: bests.join( '\n' ), inline: true }
        ];
    }

    /**
     * Fetches title and description used for each page of a multi-page embed.
     * 
     * @param {IF1Driver} driver 
     * @param {string} season 
     * @param {string[]} teams 
     * @returns {ICommandEmbedStub}
     */
    private initializeEmbed(
        driver: IF1Driver,
        season: string,
        teams: string[] ): ICommandEmbedStub {
        
        const championship = markdown.formatF1ChampionshipName( season, true );
        const name = markdown.formatF1DriverName( driver, false );
        const dob = DateTime
            .fromISO( driver.dateOfBirth )
            .toLocaleString( DateTime.DATE_FULL );
        const homeFlag = markdown.getNationFlag( driver.nationality ) || '';

        let constructors = teams[ 0 ];
        if ( teams.length === 2 )
            constructors = teams.join( ' and ' );
        else if ( teams.length > 2 ) {
            constructors = '';
            teams.forEach(( team, idx ) => constructors +=
                `${idx === teams.length - 1 ? ', and' : ','} ${team}` );
        }

        const title = `${homeFlag} ${name} \u2013 ${season} Season Qualifying Results`.trim();
        const description = `${championship} qualifying results for ${driver.nationality} driver ${name} (born ${dob}) competing for ${constructors}.`;

        return {
            title,
            description
        };
    }

    /**
     * Fetches a collection of Formula 1 constructors that a driver raced for
     * over a season.
     * 
     * @param {IF1RaceEvent[]} events 
     * @returns {string[]}
     */
    private getSeasonTeams( events: IF1QualifyingEvent[] ): string[] {
        return events.reduce<string[]>(( teams, current ) => {
            const ctor = current.QualifyingResults[ 0 ].Constructor;
            const name = markdown.formatF1ConstructorName( ctor, true );
            if ( !teams.includes( name ))
                teams.push( name );

            return teams;
        }, [] );
    }
}
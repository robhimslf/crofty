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
import { ergastAPI, IF1Driver, IF1RaceEvent } from '../../../api/index.js';
import {
    CommandBase,
    ICommandAsync,
    ICommandEmbedStub
} from '../command-base.js';

/**
 * Object representing a parsed response for a query to Crofty for a driver's
 * seasonal race statistics.
 */
export class DriverRaceStats extends CommandBase implements ICommandAsync {

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
            let events = await ergastAPI.getDriverSeasonResults(
                this.season!, this.driver! );
            if ( events.length === 0 || events[ 0 ].Results.length === 0 ) {
                error = `Unable to find race results for driver "${this.driver!}" in the ${this.season!} Formula 1 season.`;
                throw new Error( error );
            }

            const event = events[ 0 ];
            const hasFastestLap = ( events.some( e =>
                e.Results.some( r => r.FastestLap )));
            const driver = event.Results[ 0 ].Driver;
            const teams = this.getSeasonTeams( events );
            const points = this.getSeasonPoints( events );
            const embedBase = this.initializeEmbed(
                driver,
                event.season,
                teams,
                points );

            // Resolve all links to be shortened.
            events = await shortenLinks( events ) as IF1RaceEvent[];
            events = events.sort(( a, b ) => a.round - b.round );

            // Resolve the driver's Wikipedia image.
            const image = await getImageUrlFromPage( driver.url );

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
     * @param {IF1RaceEvent[]} items 
     * @returns {EmbedFieldData[]}
     */
    private getPageEmbedFields(
        items: IF1RaceEvent[],
        hasFastestLap: boolean ): EmbedFieldData[] {

        const events = items.map( i =>
            markdown.formatF1EventName( i, true, true, true ));
        const starts = items.map( i =>
            i.Results[ 0 ].grid );
        const finishes = items.map( i =>
            markdown.formatF1RaceFinish( i.Results[ 0 ], hasFastestLap ));

        return [
            { name: 'Round', value: events.join( '\n' ), inline: true },
            { name: 'Grid', value: starts.join( '\n' ), inline: true },
            { name: 'Pos', value: finishes.join( '\n' ), inline: true }
        ];
    }

    /**
     * Fetches title and description used for each page of a multi-page embed.
     * 
     * @param {IF1Driver} driver 
     * @param {string} season 
     * @param {string[]} teams 
     * @param {number} points 
     * @returns {ICommandEmbedStub}
     */
    private initializeEmbed(
        driver: IF1Driver,
        season: string,
        teams: string[],
        points?: number ): ICommandEmbedStub {

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

        const title = `${homeFlag} ${name} \u2013 ${season} Season Results`.trim();
        
        let description = `${championship} race results for ${driver.nationality} driver ${name} (born ${dob}) competing for ${constructors}.`;
        if ( points !== undefined ) {
            const wdc = markdown.formatF1ChampionshipName( season,
                true, false, true, true );

            let pointsDescription = `finished with **${points} points**`;
            if ( new Date().getUTCFullYear() === Number( season ))
                pointsDescription = `has earned **${points} points** to date`;
            
            
            description = `${description}\n\n${driver.givenName} ${pointsDescription} in the ${wdc}.`;
        }

        return {
            title,
            description
        };
    }

    /**
     * Fetches a tally of championship points accumulated over the course of a
     * Formula 1 season.
     * 
     * @param {IF1RaceEvent[]} events 
     * @returns {number | undefined}
     */
    private getSeasonPoints( events: IF1RaceEvent[] ): number | undefined {
        let points: number | undefined;

        const hasPoints = ( events.some( e => e.Results[ 0 ].points ));
        if ( hasPoints ) {
            points = events.reduce<number>(( sum, current ) => {
                let resultPoints = 0;

                const result = current.Results[ 0 ];
                if ( result &&
                    result.points &&
                    +result.points !== NaN )
                    resultPoints = Number( result.points );
                
                sum += resultPoints;
                return sum;
            }, 0 );
        }

        return points;
    }

    /**
     * Fetches a collection of Formula 1 constructors that a driver raced for
     * over a season.
     * 
     * @param {IF1RaceEvent[]} events 
     * @returns {string[]}
     */
    private getSeasonTeams( events: IF1RaceEvent[] ): string[] {
        return events.reduce<string[]>(( teams, current ) => {
            const ctor = current.Results[ 0 ].Constructor;
            const name = markdown.formatF1ConstructorName( ctor, true );
            if ( !teams.includes( name ))
                teams.push( name );

            return teams;
        }, [] );
    }
}

import { stringToEnum } from '../../utilities/index.js';
import { CommandBase } from './command-base.js';

/**
 * Enumeration of help categories recognized by Crofty.
 */
export enum HelpCategory {
    Me = 'me',
    Server = 'server',
    Stats = 'stats'
}

/**
 * Converts the help parameter to its HelpCategory enumeration.
 * 
 * @param value 
 * @returns 
 */
export const toHelpCategory = ( value?: string ): HelpCategory | undefined =>
    stringToEnum( HelpCategory, value ?? '' );

export class Help extends CommandBase {

    /**
     * Title sent with all content for Crofty's help responses.
     */
    private static readonly TitleContent = '📙 Help System for Crofty';

    /**
     * Content describing how to use Crofty's help system as returned in a request
     * for help without parameters.
     */
    private static readonly BaseContent = [
        `Crofty's functionality is fairly extensive, so in order to not exceed Discord's maximum content length help is broken down into categories.\n\nAlternatively, you can begin typing a slash command to see additional information about a specific feature.\n`,
        '*Member Help*',
        '    Usage: `/help me`\n',
        '*Stats Help*',
        '    Usage: `/help stats`\n',
        '*Server Configuration Help*',
        '    Usage: `/help server`\n'
    ];

    /**
     * Content describing Crofty's results functionality as returned in a request
     * for help.
     */
    private static readonly MeContent = [
        `Your configuration for Crofty on this Discord server.\n`,
        '*Tagging on Race Thread Auto-Creation*',
        `Crofty will tag you in any automatically-created race thread within the server's configured channel four (4) days prior to an upcoming race; around the same time that teams arrive at the circuit for a race weekend.\n`,
        'Usage: `/me autotag [enabled]`\n'
    ];

    /**
     * Content describing Crofty's server configuration as returned in a request
     * for help.
     */
    private static readonly ServerContent = [
        `Crofty's configuration for this Discord server. Requires administrative permissions.\n`,
        '*Race Thread Auto-Creation*',
        'Crofty will automatically create a topic thread within a text channel four (4) days prior to an upcoming race; around the same time that teams arrive at the circuit for a race weekend.\n',
        'Usage: `/server autothread [enabled] [channel]`\n',
        '*Formula 1 News Auto-Reporting*',
        'Crofty will periodically report the latest Formula 1 news briefs to a text channel.\n',
        'Usage: `/server autonews [enabled] [channel]`\n'
    ];

    /**
     * Content describing Crofty's stats functionality as returned in a request
     * for help.
     */
    private static readonly StatsContent = [
        `Crofty's Formula 1 statistics querying functionality.\n`,
        '*Driver Statistics*',
        `Queries Crofty for a Formula 1 driver's race results within any season from 1950 to current.`,
        'Usage: `/stats driver [season] [driver]`\n',
        '*Qualifying Results*',
        `Queries Crofty for the results of a Formula 1 qualifying session within any season from 1950 to current.`,
        'Usage: `/stats quali [season] [round]`\n',
        '*Race Results*',
        `Queries Crofty for the results of a Formula 1 grand prix within any season from 1950 to current.`,
        'Usage: `/stats race [season] [round]`\n',
        `*World Constructors' Championship Standings`,
        `Queries Crofty for the Formula 1 World Constructors' Championship standings for any season from 1950 to current.`,
        'Usage: `/stats wcc [season]`\n',
        `*World Drivers' Championship Standings`,
        `Queries Crofty for the Formula 1 World Drivers' Championship standings for any season from 1950 to current.`,
        'Usage: `/stats wdc [season]`\n'
    ];

    /**
     * Content describing Crofty's standings functionality as returned in a
     * request for help.
     */
    private static readonly StandingsContent = [];

    /**
     * Constructs and prepares Crofty's response to a command request for help.
     * 
     * @param {HelpCategory} category 
     */
    constructor( category?: string ) {
        super();
        this.parse( toHelpCategory( category ));
    }

    /**
     * Prepares Crofty's response to a command request for help.
     * 
     * @param {HelpCategory} category 
     */
    private parse( category?: HelpCategory ) {
        let description = Help.BaseContent,
            title = Help.TitleContent;

        switch ( category ) {
            case HelpCategory.Me:
                description = Help.MeContent;
                title = `${title} - Member`;
                break;

            case HelpCategory.Stats:
                description = Help.StatsContent;
                title = `${title} - Stats`;
                break;

            case HelpCategory.Server:
                description = Help.ServerContent;
                title = `${title} - Server`;
                break;

            default:
                break;
        }

        this.createEmbed(
            title,
            description.join( '\n' ));
    }
}

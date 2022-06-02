import { stringToEnum } from '../../utilities/index.js';
import { CommandBase } from './CommandBase.js';

/**
 * Enumeration of help categories recognized by Crofty.
 */
export enum HelpCategory {
    Config = 'config',
    Results = 'results',
    Standings = 'standings'
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
        `Crofty's functionality is fairly extensive, so in order to not exceed Discord's maximum content length help is broken down into categories.\nAlternatively, you can begin typing a slash command to see additional information about a specific feature.\n`,
        '*Configuration Help*',
        '    Usage: `/help config`\n',
        '*Results Help*',
        '    Usage: `/help results`\n',
        '*Standings Help*',
        '    Usage: `/help standings`\n'
    ];

    /**
     * Content describing Crofty's configuration as returned in a request for
     * help.
     */
    private static readonly ConfigurationContent = [
        '**Configuration Commands**\n',
        '*Race Thread Auto-Creation*',
        'Crofty will automatically create a topic thread within a text channel four (4) days prior to an upcoming race; around the same time that teams arrive at the circuit for a race weekend. Requires server administration privileges.\n',
        'Usage: `/configure eventthread [enabled] [channel]`\n',
        '*Formula 1 News Auto-Reporting*',
        'Crofty will periodically report the latest Formula 1 news briefs to a text channel.\n',
        'Usage: `/configure news [enabled] [channel]`\n'
    ];

    /**
     * Content describing Crofty's results functionality as returned in a request
     * for help.
     */
    private static readonly ResultsContent = [];

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
        let description = Help.BaseContent;
        switch ( category ) {
            case HelpCategory.Config:
                description = Help.ConfigurationContent;
                break;

            case HelpCategory.Results:
                description = Help.ResultsContent;
                break;

            case HelpCategory.Standings:
                description = Help.StandingsContent;
                break;

            default:
                break;
        }

        this.createEmbed(
            Help.TitleContent,
            description.join( '\n' ));
    }
}
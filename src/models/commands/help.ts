import type { CommandInteraction } from 'discord.js';
import { batchize, help, IHelpCategory, stringToEnum } from '../../utilities/index.js';
import { CommandBase } from './command-base.js';

/**
 * Enumeration of help categories recognized by Crofty.
 */
export enum HelpCategory {
    All = 'all',
    Config = 'config',
    Stats = 'stats'
}

/**
 * Converts the help parameter to its HelpCategory enumeration.
 * 
 * @param value 
 * @returns 
 */
export const toHelpCategory = ( value?: string ): HelpCategory | undefined =>
    stringToEnum( HelpCategory, value ?? 'all' );

export class Help extends CommandBase {

    /**
     * Whether the response should paginate.
     */
    private _paginate: boolean = false;

    /**
     * Whether the response should paginate.
     */
    public get paginate(): boolean {
        return this._paginate;
    }

    /**
     * Constructs and prepares Crofty's response to a command request for help.
     * 
     * @param {CommandInteraction} interaction 
     * @param {HelpCategory} category 
     */
    constructor( interaction: CommandInteraction, category?: string ) {
        super( interaction );
        this.parse( toHelpCategory( category ) ?? HelpCategory.All );
    }

    /**
     * Prepares Crofty's response to a command request for help.
     * 
     * @param {HelpCategory} category 
     */
    private parse( category: HelpCategory ) {
        let parsed: IHelpCategory;

        switch ( category ) {
            case HelpCategory.Config:
                parsed = help.config;
                break;

            case HelpCategory.Stats:
                parsed = help.stats;
                this._paginate = true;
                break;

            case HelpCategory.All:
            default:
                parsed = help.all;
                this._paginate = true;
                break;
        }

        const title = parsed.name;
        const description = parsed.description;

        if ( this.paginate ) {
            const batches = batchize( parsed.help, 5 );
            batches.forEach( batch => {
                const descriptions = [ `${description}\n` ];

                batch.forEach( content => {
                    const hasExample = content.example !== undefined;
                    descriptions.push( `**\`${content.usage}\`**` );
                    descriptions.push( `${content.description}${hasExample ? '' : '\n'}` );
                    if ( content.example )
                        descriptions.push( `*Example: \`${content.example}\`*\n` );
                });

                this.createEmbed( title, descriptions.join( '\n' ));
            });
        } else {

            const descriptions = [ `${description}\n` ];
            parsed.help.forEach( content => {
                const hasExample = content.example !== undefined;
                descriptions.push( `**\`${content.usage}\`**` );
                descriptions.push( `${content.description}${hasExample ? '' : '\n'}` );
                if ( content.example )
                    descriptions.push( `*Example: \`${content.example}\`*\n` );
            });

            this.createEmbed( title, descriptions.join( '\n' ));
        }
    }
}

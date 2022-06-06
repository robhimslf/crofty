import { DateTime } from 'luxon';
import { Message, MessageEmbed, ReplyMessageOptions } from 'discord.js';
import {
    ChatEmbeds,
    ChatPatternMatch,
    config,
    constants,
    dateTime,
    IConfigChatPattern,
    interpolate,
    interpolateFromMessage,
    markdown
} from '../../utilities/index.js';
import { ergastAPI } from '../../api/index.js';

export class Chat {

    /**
     * Regular expression used to find patterns of `[word] [word]`.
     */
    private static PhraseRegex: RegExp = /[\w]+\s[\w]+/gm;

    /**
     * Original Discord message that triggered this chat response.
     */
    private received: Message;

    /**
     * Crofty's parsed reply configuration.
     */
    public reply: ReplyMessageOptions;

    /**
     * Constructs and parses a chat response for Crofty.
     * 
     * @param {Message} received 
     */
    constructor( received: Message ) {
        this.received = received;

        this.reply = {
            content: interpolateFromMessage( config.chat.fallback, received )
        };
    }

    /**
     * Parses the received message, and prepares Crofty's response.
     */
    public async parse() {
        let content = this.reply.content!,
            embeds: MessageEmbed[] = [];

        const fuzzyPattern = this.getFuzzyPattern();
        if ( fuzzyPattern ) {

            // Pick a random response.
            const responseIdx = Math.floor( Math.random() *
                fuzzyPattern.responses.length );
            const responseContent = fuzzyPattern.responses[ responseIdx ];

            // Pick a random fallback.
            let fallbackContent = '',
                useFallback = false;
            if ( fuzzyPattern.fallbacks.length > 0 ) {
                const fallbackIdx = Math.floor( Math.random() *
                    fuzzyPattern.fallbacks.length );
                fallbackContent = fuzzyPattern.fallbacks[ fallbackIdx ];
            }

            // Check for embeds.
            if ( fuzzyPattern.embeds.length > 0 ) {

                // Current time. Weird flex, but okay.
                if ( fuzzyPattern.embeds.includes( ChatEmbeds.CurrentTime ))
                    embeds.push( this.getCurrentTimeEmbed() );

                // Next race start times.
                if ( fuzzyPattern.embeds.includes( ChatEmbeds.RaceTime )) {

                    const nextRaceStartEmbed = await this.getRaceStartEmbed();
                    if ( !nextRaceStartEmbed )
                        useFallback = true;
                    else
                        embeds.push( nextRaceStartEmbed );
                }
            }

            content = ( useFallback )
                ? interpolateFromMessage( fallbackContent, this.received )
                : interpolateFromMessage( responseContent, this.received );
        }

        this.reply = {
            content,
            embeds
        };
    }

    /**
     * Creates a Discord message embed with a table of United States time zones
     * recognized by Crofty, and their current time.
     * 
     * This is really more of a debug feature to validate Daylight Savings Time
     * discrepancies as opposed to a useful tool. Time zones are dumb.
     * 
     * @returns {MessageEmbed}
     */
    private getCurrentTimeEmbed(): MessageEmbed {
        const now = DateTime.utc();

        let cities: string[] = [],
            times: string[] = [];

        dateTime.UnitedStatesTimeZones.forEach( ustz => {
            const time = dateTime.convertTimeToZone( now, ustz.zone );
            cities.push( ustz.city );
            times.push( time.toLocaleString( DateTime.TIME_SIMPLE ));
        });

        return new MessageEmbed()
            .setColor( constants.EmbedColor )
            .addFields([
                {
                    name: constants.Strings.City,
                    value: cities.join( '\n' ),
                    inline: true
                },
                {
                    name: constants.Strings.CurrentTime,
                    value: times.join( '\n' ),
                    inline: true
                }
            ]);
    }

    /**
     * Creates a Discord message embed with a table of United States time zones
     * recognized by Crofty, and the locally adjusted start time of the next
     * Formula 1 grand prix.
     * 
     * @returns {Promise<MessageEmbed | undefined>}
     */
    private async getRaceStartEmbed(): Promise<MessageEmbed | undefined> {
        const now = DateTime.utc();
        const upcoming = await ergastAPI.getScheduledEvents( now.year );
        const nextRace = upcoming
            .map( race => {
                const date = ( race.time )
                    ? `${race.date}T${race.time}`
                    : race.date;
                race.dateTime = DateTime.fromISO( date, { zone: 'UTC' });
                return race;
            })
            .sort(( raceA, raceB ) =>
                raceA.dateTime!.toMillis() - raceB.dateTime!.toMillis() )
            .find( race => race.dateTime! > now );

        if ( !nextRace )
            return undefined;

        let descValues = {
            espnLink: config.links.espn,
            f1tvLink: config.links.f1tv,
            raceName: markdown.formatF1EventName( nextRace ),
            raceDate: markdown.formatF1EventDate( nextRace ),
            raceTime: `<t:${nextRace.dateTime!.toSeconds()}:R>`,
            year: now.year.toString(),
        };

        let cities: string[] = [],
            times: string[] = [];
        dateTime.UnitedStatesTimeZones.forEach( ustz => {
            const time = dateTime.convertTimeToZone( nextRace.dateTime!, ustz.zone );
            cities.push( ustz.city );
            times.push( time.toLocaleString( DateTime.TIME_SIMPLE ));
        });

        return new MessageEmbed()
            .setColor( constants.EmbedColor )
            .setDescription( interpolate(
                constants.Strings.EmbedDescriptionRaceStart, descValues ))
            .addFields([
                {
                    name: constants.Strings.City,
                    value: cities.join( '\n' ),
                    inline: true
                },
                {
                    name: constants.Strings.LocalStart,
                    value: times.join( '\n' ),
                    inline: true
                }
            ]);
    }

    /**
     * Fetches a fuzzy pattern configuration from Crofty's global config based,
     * if applicable. The following rules apply:
     * 
     * 1. Regardless of the pattern's match type, if the pattern has phrase-based
     * keywords - and any of those phrases are found in the message - that
     * pattern is returned.
     * 2. If the pattern specifies a match type of `any` - and any of its keywords
     * are found in the message - that pattern is returned (be careful; here
     * there be dragons).
     * 3. If the pattern specifies a match type of `multiple` - and *2 or more*
     * of its keywords are found in the message - that pattern is returned.
     * 4. Failing the previous three rules, returns `undefined`.
     * 
     * @returns {IConfigChatPattern | undefined}
     */
    private getFuzzyPattern(): IConfigChatPattern | undefined {
        let pattern: IConfigChatPattern | undefined;

        try {
            const message = this.received.content.toLowerCase();
            pattern = config.chat.patterns.find( p => {
                
                // Get all phrase keywords for this pattern.
                const phrases = p.keywords.filter( k =>
                    Chat.PhraseRegex.test( k ));

                // Get all phrase non-keywords for this pattern.
                const keywords = p.keywords.filter( k =>
                    !Chat.PhraseRegex.test( k ));

                // 0. Phrases always result in a match.
                if ( phrases.some( k => message.includes( k )))
                    return p;

                // 1. Pattern should match any single keyword.
                else if ( p.keywordMatch === ChatPatternMatch.Any &&
                    keywords.some( k => message.includes( k )))
                    return p;

                // 2. Pattern should match 2+ keywords.
                else if ( p.keywordMatch === ChatPatternMatch.Multiple &&
                    keywords.filter( k => message.includes( k )).length > 1 )
                    return p;

                return undefined;
            });
        } catch ( err ) {
            console.warn( `🛑 Unable to extrapolate fuzzy pattern.`, err );
        }

        return pattern;
    }
}
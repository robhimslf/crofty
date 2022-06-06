import { CommandInteraction } from 'discord.js';
import {
    Discord,
    Slash,
    SlashGroup,
    SlashOption
} from 'discordx';
import {
    DriverQualiStats,
    DriverRaceStats,
    PoleStats,
    QualiStats,
    RaceStats,
    WinStats
} from '../models/index.js';

/**
 * Root statistics slash group.
 */
@Discord()
@SlashGroup({
    name: 'stats',
    description: `Query Crofty for Formula 1 driver and constructor statistics.`
})
@SlashGroup({
    name: 'driver',
    root: 'stats'
})
class stats {

    /**
     * Handles a request for driver qualifying results in a season.
     * 
     * @param {string} seasonParam 
     * @param {string} driverParam 
     * @param {CommandInteraction} interaction 
     */
    @Slash( 'quali', { description: `A Formula 1 driver's qualifying results by season (1950 to current).` })
    @SlashGroup( 'driver', 'stats' )
    async driverQuali(
        @SlashOption( 'season', { description: `4-digit year or 'current'.`, required: true }) seasonParam: string,
        @SlashOption( 'driver', { description: `Last name of driver. If not unique, include first name (e.g., 'mick_schumacher').`, required: true }) driverParam: string,
        interaction: CommandInteraction ) {
        
        const query = new DriverQualiStats( interaction, seasonParam, driverParam );
        if ( query.reply )
            return await interaction.reply( query.reply );

        await interaction.channel?.sendTyping();
        await query.prepare();

        const pagination = query.paginationReply;
        if ( pagination )
            return await pagination.send();
        
        await interaction.reply( query.reply! );
    }

    /**
     * Handles a request for driver race results in a season.
     * 
     * @param {string} seasonParam 
     * @param {string} driverParam 
     * @param {CommandInteraction} interaction 
     */
    @Slash( 'races', { description: `A Formula 1 driver's race results by season (1950 to current).` })
    @SlashGroup( 'driver', 'stats' )
    async driverRaces(
        @SlashOption( 'season', { description: `4-digit year or 'current'.`, required: true }) seasonParam: string,
        @SlashOption( 'driver', { description: `Last name of driver. If not unique, include first name (e.g., 'mick_schumacher').`, required: true }) driverParam: string,
        interaction: CommandInteraction ) {
        
        const query = new DriverRaceStats( interaction, seasonParam, driverParam );
        if ( query.reply )
            return await interaction.reply( query.reply );

        await interaction.channel?.sendTyping();
        try {
            await query.prepare();

            const pagination = query.paginationReply;
            if ( pagination )
                return await pagination.send();
        } catch ( err ) {
            console.warn( 'Failed `/stats driver races` command.', err );
        }
        
        await interaction.reply( query.reply! );
    }

    /**
     * Handles a request for pole position results in a season.
     * 
     * @param {string} seasonParam 
     * @param {CommandInteraction} interaction 
     */
    @Slash( 'poles', { description: `Formula 1 pole position results by season (1950 to current).` })
    @SlashGroup( 'stats' )
    async rootPole(
        @SlashOption( 'season', { description: `4-digit year or 'current'.`, required: true }) seasonParam: string,
        interaction: CommandInteraction ) {
        
        const query = new PoleStats( interaction, seasonParam );
        if ( query.reply )
            return await interaction.reply( query.reply );

        await interaction.channel?.sendTyping();
        try {
            await query.prepare();

            const pagination = query.paginationReply;
            if ( pagination )
                return await pagination.send();
        } catch ( err ) {
            console.warn( 'Failed `/stats poles` command.', err );
        }
        
        await interaction.reply( query.reply! );
    }

    /**
     * Handles a request for qualifying results in a season.
     * 
     * @param {string} seasonParam 
     * @param {string} driverParam 
     * @param {CommandInteraction} interaction 
     */
    @Slash( 'quali', { description: `Formula 1 qualifying results by round and season (1950 to current).` })
    @SlashGroup( 'stats' )
    async rootQuali(
        @SlashOption( 'season', { description: `4-digit year or 'current'.`, required: true }) seasonParam: string,
        @SlashOption( 'round', { description: `1- or 2-digit round, or 'last'.`, required: true }) roundParam: string,
        interaction: CommandInteraction ) {
        
        const query = new QualiStats( interaction, roundParam, seasonParam );
        if ( query.reply )
            return await interaction.reply( query.reply );

        await interaction.channel?.sendTyping();
        try {
            await query.prepare();

            const pagination = query.paginationReply;
            if ( pagination )
                return await pagination.send();
        } catch ( err ) {
            console.warn( 'Failed `/stats quali` command.', err );
        }
        
        await interaction.reply( query.reply! );
    }

    /**
     * Handles a request for race results in a season.
     * 
     * @param {string} seasonParam 
     * @param {string} driverParam 
     * @param {CommandInteraction} interaction 
     */
    @Slash( 'races', { description: `Formula 1 race results by round and season (1950 to current).` })
    @SlashGroup( 'stats' )
    async rootRaces(
        @SlashOption( 'season', { description: `4-digit year or 'current'.`, required: true }) seasonParam: string,
        @SlashOption( 'round', { description: `1- or 2-digit round, or 'last'.`, required: true }) roundParam: string,
        interaction: CommandInteraction ) {
        
        const query = new RaceStats( interaction, roundParam, seasonParam );
        if ( query.reply )
            return await interaction.reply( query.reply );

        await interaction.channel?.sendTyping();
        try {
            await query.prepare();

            const pagination = query.paginationReply;
            if ( pagination )
                return await pagination.send();
        } catch ( err ) {
            console.warn( 'Failed `/stats race` command.', err );
        }
        
        await interaction.reply( query.reply! );
    }

    /**
     * Handles a request for race win results in a season.
     * 
     * @param {string} seasonParam 
     * @param {CommandInteraction} interaction 
     */
    @Slash( 'wins', { description: `Formula 1 grand prix winners by season (1950 to current).` })
    @SlashGroup( 'stats' )
    async rootWins(
        @SlashOption( 'season', { description: `4-digit year or 'current'.`, required: true }) seasonParam: string,
        interaction: CommandInteraction ) {
        
        const query = new WinStats( interaction, seasonParam );
        if ( query.reply )
            return await interaction.reply( query.reply );

        await interaction.channel?.sendTyping();
        try {
            await query.prepare();

            const pagination = query.paginationReply;
            if ( pagination )
                return await pagination.send();
        } catch ( err ) {
            console.warn( 'Failed `/stats wins` command.', err );
        }
        
        await interaction.reply( query.reply! );
    }
}

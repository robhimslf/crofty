import 'reflect-metadata';
import dotenv from 'dotenv';
import { dirname, importx } from '@discordx/importer';
import type { Interaction, Message } from 'discord.js';
import { Intents } from 'discord.js';
import { Client } from 'discordx';
import { environment } from './utilities/index.js';
import { startCron } from './cron/index.js';

// Populate environment variables.
dotenv.config();

/**
 * Crofty's base client configuration.
 */
export const crofty = new Client({

    // Disable global commands.
    botGuilds: [( client ) =>
        client.guilds.cache.map(( guild ) => guild.id )],

    // Discord intents.
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        Intents.FLAGS.GUILD_VOICE_STATES
    ],

    // Disable debug logs.
    silent: true,

    // Configure simple command options.
    simpleCommand: {
        prefix: '!'
    }
});

/**
 * Crofty's startup initialization. This happens as soon as Crofty phones home to
 * Discord, but before Crofty begins receiving or handling requests.
 */
crofty.once( 'ready', async () => {

    // Ensure that all of the Guilds (servers) that Crofty is installed on are
    // cached.
    await crofty.guilds.fetch();

    // Initialize all of Crofty's application commands, and log registration
    // for verification.
    await crofty.initApplicationCommands({
        global: { log: true },
        guild: { log: true }        
    });

    // Initialize all of Crofty's server permissions, and log registration for
    // verification.
    await crofty.initApplicationPermissions( true );

    // Initialize all of Crofty's scheduled tasks.
    startCron( crofty );

    // Report that Crofty is ready.
    console.log( `🚀 It's lights out, and away we go!` );
});

/**
 * Configure Crofty to listen for - and handle - interaction events.
 */
crofty.on( 'interactionCreate', ( interaction: Interaction ) => {
    crofty.executeInteraction( interaction );
});

/**
 * Configure Crofty to listen for - and handle - message events.
 */
crofty.on( 'messageCreate', ( message: Message ) => {
    crofty.executeCommand( message );
});

/**
 * Starts Crofty.
 * 
 * This consists of automatically importing - and registering - all command and
 * event handlers dynamically from source, and instructs Crofty to phone home to
 * Discord with authentication credentials.
 */
async function run() {

    // Validate all environment variables before really starting.
    environment.validate();

    // Dynamically import command and event handlers.
    await importx( dirname( import.meta.url ) +
        '/{events,commands}/**/*.{ts,js}' );    

    // Authenticate Crofty.
    await crofty.login( environment.BotToken! );
}

// When this file is executed, fire-and-forget the `run` method.
run();

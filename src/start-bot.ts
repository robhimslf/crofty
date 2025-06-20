import { REST } from '@discordjs/rest';
import {
    type RESTPostAPIChatInputApplicationCommandsJSONBody,
    type RESTPostAPIContextMenuApplicationCommandsJSONBody,
    Options,
    Partials
} from 'discord.js';
import { createRequire } from 'node:module';
import { Logger } from './utils/index.js';
import { type Trigger } from './triggers/index.js';
import {
    CommandRegistrationService,
    EventDataService
} from './services/index.js';
import { type Reaction } from './reactions/index.js';
import { type Job } from './jobs/index.js';
import { Bot, CustomClient, JobBroker } from './infrastructure/index.js';
import {
    ButtonHandler,
    CommandHandler,
    GuildJoinHandler,
    GuildLeaveHandler,
    MessageHandler,
    ReactionHandler,
    TriggerHandler
} from './events/index.js';
import { ViewDateJoined } from './commands/user/index.js';
import { ViewDateSent } from './commands/message/index.js';
import {
    DevCommand,
    HelpCommand,
    InfoCommand,
    TestCommand
} from './commands/chat/index.js';
import {
    type Command,
    ChatCommandMetadata,
    MessageCommandMetadata,
    UserCommandMetadata
} from './commands/index.js';
import { Button } from './buttons/index.js';

const require = createRequire( import.meta.url );
const config = require( '../config/config.json' );
const logs = require( '../i18n/logs.json' );

type SortableType =
    RESTPostAPIChatInputApplicationCommandsJSONBody |
    RESTPostAPIContextMenuApplicationCommandsJSONBody;

const sortByName = ( a: SortableType, b: SortableType ): number =>
    a.name > b.name ? 1 : -1;

async function start(): Promise<void> {

    // Services...
    const eventDataService = new EventDataService();

    //
    // 1. Bootstrap...
    //

    // 1.1. ...the client.
    const client = new CustomClient({
        intents: config.client.intents,
        partials: ( config.client.partials as string[] )
            .map( x => Partials[ x ]),
        makeCache: Options.cacheWithLimits({

            // Default caching behaviors...
            ...Options.DefaultMakeCacheSettings,

            // ...with overrides.
            ...config.client.caches
        })
    });

    // 1.2. ...commands.
    const commands: Command[] = [

        // Chat
        new DevCommand(),
        new HelpCommand(),
        new InfoCommand(),
        new TestCommand(),

        // Message Context
        new ViewDateSent(),

        // User Context
        new ViewDateJoined(),

        // Other...
    ];

    // 1.3. ...buttons.
    const buttons: Button[] = [];

    // 1.4. ...reactions.
    const reactions: Reaction[] = [];

    // 1.5. ...triggers.
    const triggers: Trigger[] = [];

    // 1.6. ...event handlers.
    const buttonHandler = new ButtonHandler( buttons, eventDataService );
    const commandHandler = new CommandHandler( commands, eventDataService );
    const guildJoinHandler = new GuildJoinHandler( eventDataService );
    const guildLeaveHandler = new GuildLeaveHandler();
    const triggerHandler = new TriggerHandler( triggers, eventDataService );
    const messageHandler = new MessageHandler( triggerHandler );
    const reactionHandler = new ReactionHandler( reactions, eventDataService );

    // 1.7. ...job broker.
    const jobs: Job[] = [];

    // 1.8. ...the bot.
    const bot = new Bot(
        config.client.token,
        client,
        guildJoinHandler,
        guildLeaveHandler,
        messageHandler,
        commandHandler,
        buttonHandler,
        reactionHandler,
        new JobBroker( jobs )
    );

    //
    // 2. Register commands.
    //
    if ( process.argv[ 2 ] === 'commands' ) {
        try {
            const rest = new REST({ version: '10' }).setToken( config.client.token );
            const registry = new CommandRegistrationService( rest );
            const locals = [
                ...Object
                    .values( ChatCommandMetadata )
                    .sort( sortByName ),
                ...Object
                    .values( MessageCommandMetadata )
                    .sort( sortByName ),
                ...Object
                    .values( UserCommandMetadata )
                    .sort( sortByName )
            ];

            await registry.process( locals, process.argv );
        } catch ( err ) {
            Logger.error( logs.error.command_action, err );
        }

        // Await final logs...
        await new Promise( resolve => setTimeout( resolve, 1000 ));
        process.exit();
    }

    await bot.start();
}

process.on( 'unhandledRejection', ( reason, _ ) => {
    Logger.error( logs.error.unhandled_rejection, reason );
});

start().catch( err => {
    Logger.error( logs.error.unspecified, err );
});

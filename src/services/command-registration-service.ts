import { REST } from '@discordjs/rest';
import {
    type APIApplicationCommand,
    type RESTGetAPIApplicationCommandsResult,
    type RESTPatchAPIApplicationCommandJSONBody,
    type RESTPostAPIApplicationCommandsJSONBody,
    Routes
} from 'discord.js';
import { createRequire } from 'node:module';
import { Logger } from '../utils/index.js';

const require = createRequire( import.meta.url );
const config = require( '../../config/config.json' );
const logs = require( '../../i18n/logs.json' );

export class CommandRegistrationService {

    constructor( private client: REST ) { }

    public async process(
        locals: RESTPostAPIApplicationCommandsJSONBody[],
        args: string[] ): Promise<void> {
        
        const remotes = ( await this.client.get(
            Routes.applicationCommands( config.client.id )
        )) as RESTGetAPIApplicationCommandsResult;

        const onlyLocals = locals.filter( x =>
            !remotes.some( y => y.name === x.name ));
        const onlyRemotes = remotes.filter( x =>
            !locals.some( y => y.name === x.name ));
        const remoteLocals = locals.filter( x =>
            remotes.some( y => y.name === x.name ));

        switch ( args[ 3 ]) {
            case 'clear': {
                Logger.info( logs.info.command_action_clearing
                    .replaceAll( '{COMMAND_LIST}', this.formatCommands( remotes ))
                );

                await this.client.put( Routes.applicationCommands( config.client.id ), {
                    body: []
                });
                Logger.info( logs.info.command_action_cleared );

                break;
            }

            case 'delete': {
                const name = args[ 4 ];
                if ( !name ) {
                    Logger.error( logs.error.command_action_delete_missing_arg );
                    break;
                }

                const cmd = remotes.find( x => x.name === name );
                if ( !cmd ) {
                    Logger.error( logs.error.command_action_not_found
                        .replaceAll( '{COMMAND_NAME}', name ));
                    break;
                }

                Logger.info( logs.info.command_action_deleting
                    .replaceAll( '{COMMAND_NAME}', cmd.name ));
                await this.client.delete( Routes.applicationCommand( config.client.id, cmd.id ));
                Logger.info( logs.info.command_action_deleted );
                break;
            }

            case 'register': {
                if ( onlyLocals.length > 0 ) {
                    Logger.info( logs.info.command_action_creating
                        .replaceAll( '{COMMAND_LIST}', this.formatCommands( onlyLocals ))
                    );

                    for ( const cmd of onlyLocals )
                        await this.client.post(
                            Routes.applicationCommands( config.client.id ), {
                                body: cmd
                            }
                        );
                    Logger.info( logs.info.command_action_created );
                }

                if ( remoteLocals.length > 0 ) {
                    Logger.info( logs.info.command_action_updating
                        .replaceAll( '{COMMAND_LIST}', this.formatCommands( remoteLocals ))
                    );

                    for ( const cmd of remoteLocals )
                        await this.client.post(
                            Routes.applicationCommands( config.client.id ), {
                                body: cmd
                            });
                    Logger.info( logs.info.command_action_updated );
                }

                break;
            }

            case 'rename': {
                const prev = args[ 4 ];
                const next = args[ 5 ];
                if ( !prev && !next ) {
                    Logger.error( logs.error.command_action_rename_missing_arg );
                    break;
                }

                const cmd = remotes.find( x => x.name === prev );
                if ( !cmd ) {
                    Logger.error( logs.error.command_action_not_found
                        .replaceAll( '{COMMAND_NAME}', prev ));
                    break;
                }

                Logger.info( logs.info.command_action_renaming
                    .replaceAll( '{OLD_COMMAND_NAME}', cmd.name )
                    .replaceAll( '{NEW_COMMAND_NAME}', next ));
                const body: RESTPatchAPIApplicationCommandJSONBody = {
                    name: next,
                };
                await this.client.patch( Routes.applicationCommand( config.client.id, cmd.id ), {
                    body
                });
                Logger.info( logs.info.command_action_renamed );

                break;
            }

            case 'view': {
                Logger.info( logs.info.command_action_view
                    .replaceAll( '{LOCAL_AND_REMOTE_LIST}', this.formatCommands( remoteLocals ))
                    .replaceAll( '{LOCAL_ONLY_LIST}', this.formatCommands( onlyLocals ))
                    .replaceAll( '{REMOTE_ONLY_LIST}', this.formatCommands( onlyRemotes ))
                );

                break;
            }

            default:
                return;
        }
    }

    private formatCommands( cmds: APIApplicationCommand[] | RESTPostAPIApplicationCommandsJSONBody[] ): string {
        return cmds.length > 0
            ? cmds.map(( cmd: { name: string }) => `'${cmd.name}'` ).join( ', ' )
            : 'n/a';
    }
}

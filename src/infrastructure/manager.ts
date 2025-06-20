import { Shard, ShardingManager } from 'discord.js';
import { createRequire } from 'node:module';
import { Logger } from '../utils/index.js';
import { JobBroker } from './job-broker.js';

const require = createRequire( import.meta.url );
const config = require( '../../config/config.json' );
const debug = require( '../../config/debug.json' );
const logs = require( '../../i18n/logs.json' );

export class Manager {
    constructor( private manager: ShardingManager, private jobs: JobBroker ) { }

    public async start(): Promise<void> {
        this.registerListeners();

        const shards = this.manager.shardList as number[];
        try {
            Logger.info( logs.info.manager_spawning_shards
                .replaceAll( '{SHARD_COUNT}', shards.length.toString() )
                .replaceAll( '{SHARD_LIST}', shards.join( ', ' )));

            await this.manager.spawn({
                amount: this.manager.totalShards,
                delay: config.sharding.spawnDelay,
                timeout: config.sharding.spawnTimeout
            });

            Logger.info( logs.info.manager_all_shards_spawned );
        } catch ( err ) {
            Logger.error( logs.error.manager_spawning_shards, err );
            return;
        }

        if ( debug.debugMode.enabled )
            return;

        this.jobs.start();
    }
    
    private registerListeners(): void {
        this.manager.on( 'shardCreate', shard => this.onShardCreate( shard ));
    }

    private onShardCreate( shard: Shard ): void {
        Logger.info( logs.info.manager_launched_shard.replaceAll( '{SHARD_ID}',
            shard.id.toString() ));
    }
}
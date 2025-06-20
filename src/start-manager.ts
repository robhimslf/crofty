import { ShardingManager } from 'discord.js';
import { createRequire } from 'node:module';
import 'reflect-metadata';

const require = createRequire( import.meta.url );
const config = require( '../../config/config.json' );
const logmsg = require( '../../i18n/logs.json' );

async function start(): Promise<void> {
    
}
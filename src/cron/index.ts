import cron from 'node-cron';
import { Client } from 'discordx';
import type { ICronTask } from './cron-task-base.js';
import { NewsCronTask } from './cron-news-task.js';
import { StatusCronTask } from './cron-status-task.js';
import { RaceThreadCronTask } from './cron-race-thread-task.js';

/**
 * Scheduled task execution handler.
 */
class Cron {

    /**
     * Registry of scheduled cron tasks.
     */
    private cronTasks: ICronTask[] = [];

    /**
     * Constructs and registers scheduled tasks to be executed.
     * 
     * @param {Client} client 
     */
    constructor( client: Client ) {
        this.cronTasks = [
            new StatusCronTask( client ),
            new NewsCronTask( client ),
            new RaceThreadCronTask( client )
        ];
    }

    /**
     * Begins scheduled task execution.
     */
    start() {
        for ( let i = 0; i < this.cronTasks.length; i++ ) {            
            const task = this.cronTasks[ i ];

            if ( task.immediate )
                task.run();

            cron.schedule(
                task.schedule,
                async () => await task.run()
            );
        }
    }
}

/**
 * Instantiates and starts the cron handler.
 * 
 * This should only be called *once* in the `ready` event handler in `crofty.ts`,
 * and only after everything else has been initialized.
 * 
 * @param {Client} client 
 */
export const startCron = ( client: Client ) =>
    new Cron( client ).start();

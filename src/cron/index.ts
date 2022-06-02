import cron from 'node-cron';
import { Client } from 'discordx';
import { StatusCronTask } from './StatusCronTask.js';
import { ICronTask } from './CronTaskBase.js';

/**
 * Scheduled task execution handler.
 */
class Cron {

    /**
     * Registry of scheduled cron tasks.
     */
    private readonly tasks: ICronTask[] = [];

    /**
     * Constructs and registers scheduled tasks to be executed.
     * 
     * @param {Client} client 
     */
    constructor( client: Client ) {
        this.tasks = [
            new StatusCronTask( client )
        ];
    }

    /**
     * Begins scheduled task execution.
     */
    start() {
        for ( let i = 0; i < this.tasks.length; i++ ) {            
            const task = this.tasks[ i ];

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

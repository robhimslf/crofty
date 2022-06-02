import { Client } from 'discordx';
import { config, random } from '../utilities/index.js';
import { CronTaskBase, ICronTask } from './CronTaskBase.js';

/**
 * A scheduled cron task that periodically updates Crofty's current status.
 */
export class StatusCronTask extends CronTaskBase implements ICronTask {

    /**
     * Constructs and prepares this cron task for execution.
     * 
     * @param {Client} client 
     */
    constructor( client: Client ) {
        super( client, '* * * * *', true );
    }

    /**
     * Begins cron task execution.
     */
    async run(): Promise<void> {
        const status = random( config.statuses );
        await this.client.user?.setActivity( status );
    }
}
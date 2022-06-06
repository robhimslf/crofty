import { DateTime } from 'luxon';
import { Client } from 'discordx';

/**
 * Defines a callback signature to register a scheduled task.
 */
export type RegisterCallback = ( scheduledTask: IScheduledTask ) => void;

/**
 * Interface contract of a class defining a scheduled task with date-and-time
 * precision.
 * 
 * *Given the precise nature of the task, this only runs once. For repeated
 * scheduled tasks use `ICronTask`.*
 */
export interface IScheduledTask {

    /**
     * Exact timestamp at which this task should be run.
     */
    schedule: DateTime;

    /**
     * Begins cron task execution.
     */
    run( client: Client ): Promise<void>;
}

export abstract class ScheduledTaskBase {

    /**
     * Exact timestamp at which this task should be run.
     */
    public readonly schedule: DateTime;

    /**
     * Constructs and prepares a base instance of a scheduled cron task.
     * 
     * @param {DateTime} schedule 
     */
    constructor( schedule: DateTime ) {
        this.schedule = schedule;
    }
}
import { Client } from 'discordx';

/**
 * Interface contract of a class defining a scheduled task.
 */
export interface ICronTask {

    /**
     * Whether to run this task immediately at startup in addition to its
     * scheduled time.
     */
    immediate: boolean;

    /**
     * Cron scheduling pattern for this cron task in the format of
     * `[minute] [hour] [day] [month] [week]`.
     * 
     * Example:
     * `* * * * *` will run every minute.
     * 
     * See: https://crontab.guru/
     */
    schedule: string;

    /**
     * Begins cron task execution.
     */
    run(): Promise<void>;
}

export abstract class CronTaskBase {

    /**
     * Whether to run this task immediately at startup in addition to its
     * scheduled time.
     */
    public readonly immediate: boolean = false;

    /**
     * Cron scheduling pattern for this cron task in the format of
     * `[minute] [hour] [day] [month] [week]`.
     * 
     * Example:
     * `* * * * *` will run every minute.
     * 
     * See: https://crontab.guru/
     */
    public readonly schedule: string;

    /**
     * Instance of the Discord client against which this cron task should run.
     */
    public readonly client: Client;

    /**
     * Constructs and prepares a base instance of a scheduled cron task.
     * 
     * @param {Client} client 
     * @param {string} schedule 
     * @param {boolean} immediate
     */
    constructor(
        client: Client,
        schedule: string,
        immediate: boolean = false  ) {

        this.client = client;
        this.schedule = schedule;
        this.immediate = immediate;
    }
}
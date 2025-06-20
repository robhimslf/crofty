import parser from 'cron-parser';
import schedule from 'node-schedule';
import { DateTime } from 'luxon';
import { createRequire } from 'node:module';
import { Logger } from '../utils/index.js';
import { type Job } from '../jobs/index.js';

const require = createRequire( import.meta.url );
const logs = require( '../../i18n/logs.json' );

export class JobBroker {
    constructor( private jobs: Job[] ) { }

    public start(): void {
        for ( const job of this.jobs ) {
            const sched = this.getSchedule( job );
            schedule.scheduleJob( sched, async () => {
                try {
                    if ( job.log )
                        Logger.info( logs.info.job_run.replaceAll( '{JOB}', job.name ));

                    await job.run();

                    if ( job.log )
                        Logger.info( logs.info.job_completed.replaceAll( '{JOB}', job.name ));
                } catch ( err ) {
                    Logger.error( logs.error.job.replaceAll( '{JOB}', job.name ), err );
                }
            });
        }
    }

    private getSchedule( job: Job ) {
        if ( job.runOnce )
            return parser.parse( job.schedule, {
                currentDate: DateTime.now()
                    .plus({ milliseconds: job.initDelayMs })
                    .toJSDate()
                }
            ).next().toDate();

        return {
            start: DateTime.now()
                .plus({ milliseconds: job.initDelayMs })
                .toJSDate(),
            rule: job.schedule
        };
    }
}

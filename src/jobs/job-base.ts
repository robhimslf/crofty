
export interface Job {
    name: string;
    log: boolean;
    schedule: string;
    runOnce?: boolean;
    initDelayMs?: number;
    run(): Promise<void>;
}

export abstract class JobBase implements Job {
    abstract name: string;
    abstract log: boolean;
    abstract schedule: string;

    runOnce = false;
    initDelayMs = 0;

    abstract run(): Promise<void>;
}
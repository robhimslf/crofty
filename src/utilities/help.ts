
/**
 * Interface contract of an object describing command help.
 */
export interface IHelpContent {
    usage: string;
    example?: string;
    description: string;
}

/**
 * Interface contract of an object describing a command group help.
 */
export interface IHelpCategory {
    name: string;
    description: string;
    help: IHelpContent[];
}

/**
 * Help for /config commands.
 */
const configHelp: IHelpCategory = {
    name: 'Configuration Commands',
    description: `Commands for setting Crofty's server configuration or user preferences.`,
    help: [
        {
            usage: '/config list',
            description: `Show Crofty's current server configuration, and your member preferences.`
        },
        {
            usage: '/config me autotag [yes | no]',
            description: `Configure whether Crofty tags you in auto-created grand prix threads on this server.`
        },
        {
            usage: '/config server autonews [yes | no] [channel name]',
            description: `Configure whether Crofty auto-reports daily Formula 1 news on this server.`
        },
        {
            usage: '/config server autothread [yes | no] [channel name]',
            description: `Configure whether Crofty auto-creates grand prix threads on this server.`
        }
    ]
};

/**
 * Help for /stats commands.
 */
const statsHelp: IHelpCategory = {
    name: 'Statistic Commands',
    description: `Commands to query Crofty for current and historical Formula 1 statistics.`,
    help: [
        {
            usage: '/stats poles [season]',
            example: '/stats poles 2003',
            description: 'Formula 1 pole position results by season (1950 to current).'
        },
        {
            usage: '/stats quali [season] [round]',
            example: '/stats quali 2022 1',
            description: 'Formula 1 qualifying results by round and season (1950 to current).'
        },
        {
            usage: '/stats race [season] [round]',
            example: '/stats race current last',
            description: 'Formula 1 grand prix results by round and season (1950 to current).'
        },
        {
            usage: '/stats wins [season]',
            example: '/stats wins 2020',
            description: 'Formula 1 grand prix winners by season (1950 to current).'
        },
        {
            usage: '/stats driver quali [season] [driver]',
            example: '/stats driver races 2004 schumacher',
            description: `A Formula 1 driver's qualifying results by season (1950 to current).`
        },
        {
            usage: '/stats driver races [season] [driver]',
            example: '/stats driver races 2007 heidfeld',
            description: `A Formula 1 driver's race results by season (1950 to current).`
        }
    ]
}

/**
 * All help; no /help arguments.
 */
const allHelp: IHelpCategory = {
    name: 'All Commands',
    description: "A complete listing of Crofty's available commands. To narrow down this list use `/help config` or `/help stats`.",
    help: [
        ...configHelp.help,
        ...statsHelp.help
    ]
};

export const help = {
    config: configHelp,
    stats: statsHelp,
    all: allHelp
};

/**
 * English strings of text used by Crofty in responses.
 */

const en = {
    city: 'City',
    currentTime: 'Current Time',
    didNotFinish: 'DNF',
    didNotQualify: 'DNQ',

    embedDescriptionNews: 'As reported in the last day from #SOURCES#.',
    embedDescriptionRaceStart: 'The #YEAR# #RACENAME# is on **#RACEDATE#** (#RACETIME#). Shown below are the start times adjusted for time zone and organized by city. For live coverage check [ESPN](#ESPNLINK#) or [F1 TV](#F1TVLINK#).',
    embedFooterFastestLap: '🔸Fastest Lap',
    embedFooterQualifying: '🔹Q2 Knockout |🔺Q1 Knockout',
    embedTitleDriverOfTheDay: 'Driver of the Day Voting is Open',
    embedTitleNews: 'Formula 1 News - #DATE#',
    fallbackInteractionResponse: 'Oh dear. I seem to have encountered an issue. Maybe give it another go?',
    f1WorldConstructorsChampionship: `Formula 1 World Constructors' Championship`,
    f1WorldDriversChampionship: `Formula 1 World Drivers' Championship`,
    f1WorldChampionship: 'Formula 1 World Championship',
    invalidRound: `The provided round value is invalid. Try a 1- or 2-digit number or the word 'last'.`,
    invalidSeason: `The provided season value is invalid. Try a 4-digit year or the word 'current'.`,
    localStart: 'Local Start',
    pleaseWaitQuery: '⌛Querying...',
    statusConfigUpdated: 'Updated!',
    statusConfigNoChange: 'No change.',
    statusConfigFailed: 'Uh oh! Something went wrong.',
    symbolFastestLap: '🔸',
    symbolQualifyingQ1Knockout: '🔺',
    symbolQualifyingQ2Knockout: '🔹'
};

/**
 * Dynamic type of keys expected of a language object.
 */
type StringKey = keyof typeof en;

/**
 * English strings of text used by Crofty in responses.
 */
const strings = {
    en: { ...en }
};

/**
 * Dynamic type of keys expected of an i18n object.
 */
type LangKey = keyof typeof strings;

/**
 * Fetches a string by key and language code.
 * 
 * @param {StringKey} key 
 * @param {LangKey} lang 
 * @returns {string}
 */
export function getString( key: StringKey, lang: LangKey = 'en' ): string {
    return strings[ lang ][ key ] ?? '';
}
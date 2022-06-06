
/**
 * Enumeration of commonly-used content.
 */
export enum Strings {
    City = 'City',
    CurrentTime = 'Current Time',
    DidNotFinish = 'DNF',
    DidNotQualify = 'DNQ',
    EmbedDescriptionNews = 'As reported in the last day from #SOURCES#.',
    EmbedDescriptionRaceStart = 'The #YEAR# #RACENAME# is on **#RACEDATE#** (#RACETIME#). Shown below are the start times adjusted for time zone and organized by city. For live coverage check [ESPN](#ESPNLINK#) or [F1 TV](#F1TVLINK#).',
    EmbedFooterFastestLap = '🔸Fastest Lap',
    EmbedFooterQualifying = '🔹Q2 Knockout |🔺Q1 Knockout',
    EmbedTitleNews = 'Formula 1 News - #DATE#',
    FallbackInteractionResponse = 'Oh dear. I seem to have encountered an issue. Maybe give it another go?',
    F1WorldConstructorsChampionship = `Formula 1 World Constructors' Championship`,
    F1WorldDriversChampionship = `Formula 1 World Drivers' Championship`,
    F1WorldChampionship = 'Formula 1 World Championship',
    InvalidRound = `The provided round value is invalid. Try a 1- or 2-digit number or the word 'last'.`,
    InvalidSeason = `The provided season value is invalid. Try a 4-digit year or the word 'current'.`,
    LocalStart = 'Local Start',
    SymbolFastestLap = '🔸',
    SymbolQualifyingQ1Knockout = '🔺',
    SymbolQualifyingQ2Knockout = '🔹'
}

/**
 * Defines the border of embeds included in Crofty's responses. This is the
 * value for Formula 1's red color.
 */
export const EmbedColor = 0xE10500;

/**
 * Defines the year that the current multi-stage qualifying format began use.
 */
export const MultiStageQualifyingStartYear = 2006;

/**
 * Enumeration of national flag characters; used in Markdown.
 */
export enum NationFlagUnicode {
    American = '🇺🇸',
    Australian = '🇦🇺',
    Belgian = '🇧🇪',
    Brazilian = '🇧🇷',
    British = '🇬🇧',
    Canadian = '🇨🇦',
    Danish = '🇩🇰',
    Dutch = '🇳🇱',
    Finnish = '🇫🇮',
    French = '🇫🇷',
    German = '🇩🇪',
    Hungarian = '🇭🇺',
    Indian = '🇮🇳',
    Irish = '🇮🇪',
    Israeli = '🇮🇱',
    Italian = '🇮🇹',
    Japanese = '🇯🇵',
    Mexican = '🇲🇽',
    Monegasque = '🇲🇨',
    'New Zealander' = '🇳🇿',
    Polish = '🇵🇱',
    Russian = '🇷🇺',
    Spanish = '🇪🇸',
    Swedish = '🇸🇪',
    Thai = '🇹🇭'
}

/**
 * Enumeration of static Wikipedia URLs and anchors.
 */
export enum Wikipedia {
    AnchorF1ChampionshipStandings = `World_Drivers'_Championship_standings`,
    UrlF1Championship = 'https://en.wikipedia.org/wiki/#SEASON#_Formula_One_World_Championship',
    UrlF1Season = 'https://en.wikipedia.org/wiki/#SEASON#_Formula_One_season'
}

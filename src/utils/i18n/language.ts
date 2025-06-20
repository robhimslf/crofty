import { Locale } from 'discord.js';

interface LanguageData {
    english: string;
    native: string;
}

export class Language {
    public static DEFAULT: Locale = Locale.EnglishUS;
    public static ENABLED: Locale[] = [ Locale.EnglishUS ];

    public static Data: { [key in Locale ]: LanguageData } = {
        bg: { english: 'Bulgarian', native: 'български' },
        cs: { english: 'Czech', native: 'Čeština' },
        da: { english: 'Danish', native: 'Dansk' },
        de: { english: 'German', native: 'Deutsch' },
        el: { english: 'Greek', native: 'Ελληνικά' },
        'en-GB': { english: 'English, UK', native: 'English, UK' },
        'en-US': { english: 'English, US', native: 'English, US' },
        'es-419': { english: 'Spanish, LATAM', native: 'Español, LATAM' },
        'es-ES': { english: 'Spanish', native: 'Español' },
        fi: { english: 'Finnish', native: 'Suomi' },
        fr: { english: 'French', native: 'Français' },
        hi: { english: 'Hindi', native: 'हिन्दी' },
        hr: { english: 'Croatian', native: 'Hrvatski' },
        hu: { english: 'Hungarian', native: 'Magyar' },
        id: { english: 'Indonesian', native: 'Bahasa Indonesia' },
        it: { english: 'Italian', native: 'Italiano' },
        ja: { english: 'Japanese', native: '日本語' },
        ko: { english: 'Korean', native: '한국어' },
        lt: { english: 'Lithuanian', native: 'Lietuviškai' },
        nl: { english: 'Dutch', native: 'Nederlands' },
        no: { english: 'Norwegian', native: 'Norsk' },
        pl: { english: 'Polish', native: 'Polski' },
        'pt-BR': { english: 'Portuguese, Brazilian', native: 'Português do Brasil' },
        ro: { english: 'Romanian, Romania', native: 'Română' },
        ru: { english: 'Russian', native: 'Pусский' },
        'sv-SE': { english: 'Swedish', native: 'Svenska' },
        th: { english: 'Thai', native: 'ไทย' },
        tr: { english: 'Turkish', native: 'Türkçe' },
        uk: { english: 'Ukrainian', native: 'Українська' },
        vi: { english: 'Vietnamese', native: 'Tiếng Việt' },
        'zh-CN': { english: 'Chinese, China', native: '中文' },
        'zh-TW': { english: 'Chinese, Taiwan', native: '繁體中文' },
    };

    public static findOne( value: string, enabled: boolean ): Locale | undefined {
        return this.findMany( value, enabled, 1 )[ 0 ];
    }

    public static findMany(
        value: string,
        enabled: boolean,
        limit: number = Number.MAX_VALUE ): Locale[] {
        
        const langs = enabled ? this.ENABLED : Object.values( Locale ).sort();
        value = value.toLowerCase();

        let found = new Set<Locale>();
        if ( found.size < limit )
            for ( const lang of langs.filter( x =>
                x.toLowerCase() === value ))
                    found.add( lang );
        if ( found.size < limit )
            for ( const lang of langs.filter( x =>
                this.Data[ x ].native.toLowerCase() === value ))
                    found.add( lang );
        if ( found.size < limit )
            for ( const lang of langs.filter( x =>
                this.Data[ x ].english.toLowerCase() === value ))
                    found.add( lang );
        if ( found.size < limit )
            for ( const lang of langs.filter( x =>
                x.toLowerCase().startsWith( value )))
                    found.add( lang );
        if ( found.size < limit )
            for ( const lang of langs.filter( x =>
                this.Data[ x ].native.toLowerCase().startsWith( value )))
                    found.add( lang );
        if ( found.size < limit )
            for ( const lang of langs.filter( x =>
                this.Data[ x ].english.toLowerCase().startsWith( value )))
                    found.add( lang );

        return [ ...found ];
    }
}
import {
    type LocalizationMap,
    EmbedBuilder,
    Locale,
    resolveColor
} from 'discord.js';
import {
    type TypeMapper,
    Linguini,
    TypeMappers,
    Utils
} from 'linguini';
import path, { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Language } from './language.js';

type Vars = { [name: string]: string };

export class i18n {
    private static linguini = new Linguini(
        path.resolve( dirname( fileURLToPath( import.meta.url )), '../../../i18n' ),
        'lang'
    );

    public static getCom( key: string, vars?: Vars ): string {
        return this.linguini.getCom( key, vars );    
    }

    public static getEmbed( key: string, lang: Locale, vars?: Vars ): EmbedBuilder {
        return (
            this.linguini.get( key, lang, this.embedMapper, vars ) ??
            this.linguini.get( key, Language.DEFAULT, this.embedMapper, vars )
        );
    }

    public static getRef( key: string, lang: Locale, vars?: Vars ): string {
        return (
            this.linguini.getRef( key, lang, vars ) ??
            this.linguini.getRef( key, Language.DEFAULT, vars )
        );
    }

    public static getRefMap( key: string, vars?: Vars ): LocalizationMap {
        let obj = {};
        for ( const lang of Language.ENABLED )
            obj[ lang ] = this.getRef( key, lang, vars );
        return obj;
    }

    public static getRegex( key: string, lang: Locale ): RegExp {
        return (
            this.linguini.get( key, lang, TypeMappers.RegExp ) ??
            this.linguini.get( key, Language.DEFAULT, TypeMappers.RegExp )
        );
    }

    private static embedMapper: TypeMapper<EmbedBuilder> = ( json: any ) =>
        new EmbedBuilder({
            author: json.author,
            title: Utils.join( json.title, '\n' ),
            url: json.url,
            thumbnail: {
                url: json.thumbnail
            },
            description: Utils.join( json.description, '\n' ),
            fields: json.fields?.map( field => ({
                name: Utils.join( field.name, '\n' ),
                value: Utils.join( field.value, '\n' ),
                inline: field.inline ? field.inline : false
            })),
            image: {
                url: json.image
            },
            footer: {
                text: Utils.join( json.footer?.text, '\n' ),
                iconURL: json.footer?.icon
            },
            timestamp: json.timestamp ? Date.now() : undefined,
            color: resolveColor( json.color ?? i18n.getCom( 'colors.default' ))
        });
}

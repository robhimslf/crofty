
export class RegexUtils {

    public static discordId( value?: string ): string | undefined {
        return value?.match( /\b\d{17,20}\b/ )?.[ 0 ];
    }

    public static escape( value?: string ): string {
        return value?.replace( /[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&' );
    }

    public static regex( value: string ): RegExp | undefined {
        let match = value.match( /^\/(.*)\/([^/]*)$/ );
        if ( !match )
            return;

        return new RegExp( match[ 1 ], match[ 2 ]);
    }

    public static tag( value?: string ): {
        username: string;
        tag: string;
        descriminator: string;
    } | undefined {
        let match = value?.match( /\b(.+)#([\d]{4})\b/ );
        if ( !match )
            return;

        return {
            tag: match[ 0 ],
            username: match[ 1 ],
            descriminator: match[ 2 ]
        };
    }
}

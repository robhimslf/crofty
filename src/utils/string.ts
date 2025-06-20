export class StringUtils {

    public static truncate(
        value: string,
        maxlen: number,
        ellipsis: boolean = false ): string {
        
        if ( value.length <= maxlen )
            return value;

        let result = value.substring( 0, ellipsis ? maxlen - 3 : maxlen );
        if ( ellipsis )
            result += '...';

        return result;
    }
}
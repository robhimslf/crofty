
export class RandomUtils {

    public static intFromInterval( min: number, max: number ): number {
        return Math.floor( Math.random() * ( max - min + 1 ) + min );
    }

    public static shuffle<T>( values: T[] ): T[] {
        for ( let i = values.length - 1; i > 0; i-- ) {
            const j = Math.floor( Math.random() * ( i + 1 ));
            [ values[ i ], values[ j ]] = [ values[ j ], values[ i ]];
        }

        return values;
    }
}

export class MathUtils {

    public static ceilToMultiple( value: number, multiple: number ): number {
        return Math.ceil( value / multiple ) * multiple;
    }

    public static clamp( value: number, min: number, max: number ): number {
        return Math.min( Math.max( value, min ), max );
    }

    public static range( start: number, size: number ): number[] {
        return [ ...Array( size ).keys() ].map( x => x + start );
    }

    public static sum( values: number[] ): number {
        return values.reduce(( acc, curr ) => acc + curr, 0 );
    }
}

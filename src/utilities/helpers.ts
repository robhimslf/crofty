/**
 * String values considered falsey as boolean.
 */
const falseyValues = [ 'no', 'n', 'off', 'disabled', 'false', '0' ];

/**
 * String values considered truthy as booleans.
 */
const truthyValues = [ 'yes', 'y', 'on', 'enabled', 'true', '1' ];

/**
 * Converts a potential string value to its boolean equivalent.
 * 
 * *Used primarily to sanitize and normalize command inputs.*
 * 
 * @param {string} value 
 * @returns {boolean | undefined}
 */
export function stringToBoolean( value?: string ): boolean | undefined {
    let result: boolean | undefined;

    if ( value ) {
        value = value.toLowerCase().trim();

        if ( falseyValues.includes( value ))
            result = false;
        else if ( truthyValues.includes( value ))
            result = true;
    }

    return result;
}

/**
 * Returns a validated non-empty string value.
 * 
 * *Used primarily to sanitize and normalize command inputs.*
 * 
 * @param {string} value 
 * @returns {string | undefined}
 */
export function stringValue( value?: string ): string | undefined {
    let result: string | undefined;

    if ( value ) {
        value = value.trim();

        if ( value.length > 0 )
            result = value;
    }

    return result;
}

/**
 * Converts a string value to its enumeration equivalent.
 * 
 * @param enm 
 * @param value 
 * @returns 
 */
export function stringToEnum<T>( enm: {[ s: string ]: T }, value: string )
    : T | undefined {

    return ( Object.values( enm ) as unknown as string[] )
        .includes(value)
            ? value as unknown as T
            : undefined;
}

/**
 * Returns a random item from a collection.
 * 
 * @param {T[]} collection 
 * @returns {T | undefined}
 */
export function random<T>( collection: T[] ): T | undefined {
    let result: T | undefined;

    if ( collection.length > 0 ) {
        const randomIdx = Math.floor( Math.random() * collection.length );
        result = collection[ randomIdx ];
    }

    return result;
}
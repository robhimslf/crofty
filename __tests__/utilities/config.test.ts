import { Config, config } from '../../src/utilities/config.js';

describe( 'utilities/config', () => {
    test( 'should construct from file', () => {
        const testVal = new Config();
        expect( testVal ).toBeInstanceOf( Config );
    });

    test( 'should have a valid singleton', () => {
        expect( config ).toBeInstanceOf( Config );
    });
});
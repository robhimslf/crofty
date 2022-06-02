import {
    constants,
    markdown
} from '../../src/utilities';
import {
    IF1Circuit,
    IF1Constructor,
    IF1Driver
} from '../../src/api/index.js';

describe( 'utilities/markdown', () => {

    test( 'should format F1 championship name', () => {
        let expected = `2022 ${constants.Strings.F1WorldChampionship}`,
            result = markdown.formatF1ChampionshipName( '2022' );
        expect( result ).toEqual( expected );

        expected = `2010 ${constants.Strings.F1WorldConstructorsChampionship}`;
        result = markdown.formatF1ChampionshipName( '2010', false, true );
        expect( result ).toEqual( expected );

        expected = `2021 ${constants.Strings.F1WorldDriversChampionship}`;
        result = markdown.formatF1ChampionshipName( '2021', true, false );
        expect( result ).toEqual( expected );

        expected = `[1951 ${constants.Strings.F1WorldChampionship}](https://wikipedia.com`;
        result = markdown.formatF1ChampionshipName( '1951', false, false, true );
        expect( result ).toContain( expected );
    });

    test( 'should format F1 circuit name', () => {
        const shortUrl = 'tinyurl.com/2prd4epj';

        let circuit: IF1Circuit = {
            circuitId: 'monaco',
            url: 'https://en.wikipedia.org/wiki/Circuit_de_Monaco',
            circuitName: 'Circuit de Monaco',
            Location: {
                lat: '',
                long: '',
                locality: 'Monte-Carlo',
                country: 'Monaco'
            }
        };

        let expected = 'Circuit de Monaco',
            result = markdown.formatF1CircuitName( circuit );
        expect( result ).toEqual( expected );

        expected = 'Circuit de Monaco in Monte-Carlo, Monaco';
        result = markdown.formatF1CircuitName( circuit, true );

        expected = '[Circuit de Monaco](https://en.wikipedia.org/wiki/Circuit_de_Monaco)';
        result = markdown.formatF1CircuitName( circuit, false, true );

        circuit.shortUrl = shortUrl;
        expected = `[Circuit de Monaco](${shortUrl})`;
        result = markdown.formatF1CircuitName( circuit, false, true, true );

        expected = '[Circuit de Monaco](${shortUrl}) in Monte-Carlo, Monaco';
        result = markdown.formatF1CircuitName( circuit, true, true, true );
    });

    test( 'should format F1 constructor name', () => {
        const shortUrl = 'https://w.wiki/3jVN';

        let team: IF1Constructor = {
            constructorId: 'mclaren',
            url: 'https://en.wikipedia.org/wiki/McLaren',
            name: 'McLaren',
            nationality: 'British'
        };

        let expected = 'McLaren',
            result = markdown.formatF1ConstructorName( team );
        expect( result ).toEqual( expected );

        expected = '[McLaren](https://en.wikipedia.org/wiki/McLaren)';
        result = markdown.formatF1ConstructorName( team, true );

        team.shortUrl = shortUrl;
        expected = `[McLaren](${shortUrl})`;
        result = markdown.formatF1ConstructorName( team, true, true );
    });

    test( 'should format F1 driver name', () => {
        const shortUrl = 'https://w.wiki/3hHQ';

        let driver: IF1Driver = {
            driverId: 'hamilton',
            permanentNumber: '44',
            code: '',
            url: 'https://en.wikipedia.org/wiki/Lewis_Hamilton',
            givenName: 'Lewis',
            familyName: 'Hamilton',
            dateOfBirth: '01-07-1985',
            nationality: 'British'
        };

        let expected = 'Lewis Hamilton',
            result = markdown.formatF1DriverName( driver );
        expect( result ).toEqual( expected );

        expected = '[Lewis Hamilton](https://en.wikipedia.org/wiki/Lewis_Hamilton)';
        result = markdown.formatF1DriverName( driver, true );

        driver.shortUrl = shortUrl;
        expected = `[Lewis Hamilton](${shortUrl})`;
        result = markdown.formatF1DriverName( driver, true, true );
    });
});
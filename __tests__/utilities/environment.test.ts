import { environment } from '../../src/utilities/environment';

describe( 'utilities/environment', () => {
    test( 'should be populated from `.env` file', () => {

        expect( environment.BotDev ).toBeDefined();
        expect( environment.BotToken ).toBeDefined();
        expect( environment.CloudinaryFolder ).toBeDefined();
        expect( environment.CloudinaryKey ).toBeDefined();
        expect( environment.CloudinaryName ).toBeDefined();
        expect( environment.CloudinarySecret ).toBeDefined();
        expect( environment.FirebaseClientEmail ).toBeDefined();
        expect( environment.FirebaseClientId ).toBeDefined();
        expect( environment.FirebaseClientX509CertUrl ).toBeDefined();
        expect( environment.FirebasePrivateKey ).toBeDefined();
        expect( environment.FirebasePrivateKeyId ).toBeDefined();
    });
});
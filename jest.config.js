"use strict";
const config = {
    preset: 'ts-jest/presets/default-esm',
    extensionsToTreatAsEsm: ['.ts'],
    globals: {
        'ts-jest': {
            useESM: true
        }
    },
    moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': '$1'
    },
    setupFiles: [
        'dotenv/config'
    ],
    transform: {
        '^.+\\.ts?$': 'ts-jest'
    }
};
module.exports = config;

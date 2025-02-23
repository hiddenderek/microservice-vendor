module.exports = {
    moduleFileExtensions: ['ts', 'js'],
    transform: {
        '^.+\\.ts$': 'ts-jest',
    },
    testTimeout: 10000,
    testMatch: [
        '!**/test/unit/**/*.spec.ts',
        '!**/test/unit/**/*.test.ts',
        '**/test/integration/**/*.spec.ts',
        '**/test/integration/**/*.test.ts',
    ],
    globals: {
        'ts-jest': {
            tsConfig: 'tsconfig.json',
        },
    },
    testEnvironment: 'node',
    moduleNameMapper: {
        '~/(.*)': '<rootDir>/src/$1',
    },
};

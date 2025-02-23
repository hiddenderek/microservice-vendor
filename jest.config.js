module.exports = {
    coverageThreshold: {
        global: {
            // TODO: bump this as we go up
            functions: 0,
            branches: 0,
            lines: 0,
        },
    },
    moduleFileExtensions: ['ts', 'js'],
    transform: {
        '^.+\\.ts$': 'ts-jest',
    },
    testTimeout: 10000,
    testMatch: [
        '**/test/unit/**/*.spec.ts',
        '**/test/unit/**/*.test.ts',
        '!**/test/integration/**/*.spec.ts',
        '!**/test/integration/**/*.test.ts',
    ],
    testEnvironment: 'node',
    moduleNameMapper: {
        '~/(.*)': '<rootDir>/src/$1',
    },
};

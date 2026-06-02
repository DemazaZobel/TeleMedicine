// jest.config.js
// Place this file at the ROOT of your frontend project (same level as package.json)

module.exports = {
    preset: 'jest-expo',
    testEnvironment: 'allure-jest/node',
    testEnvironmentOptions: {
      resultsDir: 'allure-results',
    },
    setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
    setupFiles: ['./src/__tests__/setup.ts'],
    testMatch: [
      '**/__tests__/**/*.test.ts',
      '**/__tests__/**/*.test.tsx',
      '**/src/**/*.test.ts',
      '**/src/**/*.test.tsx',
    ],
    transformIgnorePatterns: [
      'node_modules/(?!(' +
        'expo|' +
        '@expo|' +
        'expo-router|' +
        'expo-secure-store|' +
        'expo-font|' +
        'expo-constants|' +
        'expo-linking|' +
        'expo-splash-screen|' +
        'expo-status-bar|' +
        'expo-modules-core|' +
        'react-native|' +
        '@react-native|' +
        '@react-navigation|' +
        'nativewind|' +
        'zustand|' +
        '@rn-primitives' +
      ')/)',
    ],
    moduleNameMapper: {
      // Path alias from tsconfig.json
      '^@/(.*)$': '<rootDir>/src/$1',
      // Mock static assets
      '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/src/__tests__/__mocks__/fileMock.js',
      '\\.css$': '<rootDir>/src/__tests__/__mocks__/fileMock.js',
    },
    collectCoverageFrom: [
      'src/**/*.{ts,tsx}',
      '!src/**/*.d.ts',
      '!src/**/__tests__/**',
      '!src/locales/**',
    ],
    coverageReporters: ['text', 'lcov', 'html'],
    reporters: [
      "default",
      ["jest-html-reporter", {
        pageTitle: "MedLink Test Report",
        outputPath: "test-report-final.html",
        includeFailureMsg: true,
        includeSuiteFailure: true
      }]
    ]
  };
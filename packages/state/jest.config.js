module.exports = {
  testEnvironment: `jsdom`,
  testMatch: [`**/specs.ts`],
  testPathIgnorePatterns: [
    `<rootDir>/dist/`,
    `<rootDir>/node_modules/`,
  ],
  setupFilesAfterEnv: [
    `<rootDir>/src/test-utils/jest-setup.js`
  ],
}

module.exports = {
  testEnvironment: `jsdom`,
  testMatch: [`**/specs.ts`],
  testPathIgnorePatterns: [
    `<rootDir>/dist/`,
    `<rootDir>/node_modules/`,
  ],
}

/** @type {import('jest').Config} */
const config = {
  testEnvironment: "node",
  verbose: true,
  coverageDirectory: "coverage",
  collectCoverage: true,
  testPathIgnorePatterns: ["/node_modules/"],
  testMatch: ["<rootDir>/src/**/test/*.js"],
  collectCoverageFrom: [
    "src/**/*.js",
    "!src/**/test/*.js?(x)",
    "!**/node_modules/**",
  ],
  coverageThreshold: {
    global: {
      branches: 1,
      functions: 1,
      lines: 1,
      statements: 1,
    },
  },
  coverageReporters: ["text-summary", "lcov"],
};

module.exports = config;

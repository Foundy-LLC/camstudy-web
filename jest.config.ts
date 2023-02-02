// @ts-nocheck
const nextJest = require("next/jest");

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: "./",
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  moduleNameMapper: {
    // Handle module aliases (this will be automatically configured for you soon)
    "^@/constants/(.*)$": "<rootDir>/src/constants/$1",
    "^@/controller/(.*)$": "<rootDir>/src/controller/$1",
    "^@/models/(.*)$": "<rootDir>/src/models/$1",
    "^@/pages/(.*)$": "<rootDir>/src/pages/$1",
    "^@/repository/(.*)$": "<rootDir>/src/repository/$1",
    "^@/service/(.*)$": "<rootDir>/src/service/$1",
    "^@/styles/(.*)$": "<rootDir>/src/styles/$1",
    "^@/stores/(.*)$": "<rootDir>/src/stores/$1",
    "^@/utils/(.*)$": "<rootDir>/src/utils/$1",
  },
  moduleDirectories: ["node_modules", "<rootDir>/"],
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
export default createJestConfig(customJestConfig);

module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    setupFiles: ["<rootDir>/test/utils/jest.setup.js"],
    moduleNameMapper: {
        "^uuid$": "<rootDir>/test/utils/uuid-cjs.cjs",
    },
};
  
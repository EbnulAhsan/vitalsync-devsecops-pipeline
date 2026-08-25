const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset({
  tsconfig: "tsconfig.jest.json",
}).transform;

/** @type {import("jest").Config} */
module.exports = {
  testEnvironment: "node",
  transform: {
    ...tsJestTransformCfg,
  },
  clearMocks: true,
  testPathIgnorePatterns: ["/node_modules/", "/dist/"],
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/server.ts",
    "!src/**/*.route.ts",
    "!src/**/*.controller.ts",
  ],
};

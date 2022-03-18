module.exports = {
  transform: { "^.+\\.tsx?$": "ts-jest" },
  // The next two lines allow jest to work with our other modules
  transformIgnorePatterns: ["node_modules/(?!(@brandonwilliamscs))"],
  preset: "ts-jest/presets/js-with-ts",
  testRegex: "./src/.*\\.(test|spec)\\.(ts|tsx)$",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],
  setupFilesAfterEnv: ["<rootDir>/src/setupTests.ts"],
  moduleDirectories: ["node_modules", "src"],
};

module.exports = {
  "all": true,
  "report-dir": "coverage/cypress",
  "reporter": [
    "lcov",
    "json",
    "html"
  ],
  "include": [
    "src/**/*.ts",
    "src/**/*.tsx",
  ],
  "exclude": [
    "cypress/*",
    "src/**/*.model.ts",
  ],
  "excludeAfterRemap": true
}
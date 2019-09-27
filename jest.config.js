// These assist with vscode-jest debugging
process.env.VUE_CLI_BABEL_TARGET_NODE = true
process.env.VUE_CLI_BABEL_TRANSPILE_MODULES = true

module.exports = {
  moduleFileExtensions: [
    'js',
    'json',
    'vue',
    'ts'
  ],

  transform: {
    '^.+\\.vue$': 'vue-jest',
    '.+\\.(css|styl|less|sass|scss|svg|png|jpg|ttf|woff|woff2)$': 'jest-transform-stub',
    '^.+\\.js$': 'babel-jest',
    '^.+\\.ts$': 'ts-jest'
  },

  transformIgnorePatterns: [
    'node_modules/(?!(babel-jest|jest-vue-preprocessor|vuetify|vue-pdf|vue-resize-sensor)/)'
  ],

  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },

  snapshotSerializers: [
    'jest-serializer-vue'
  ],

  roots: [
    '<rootDir>/src/',
    '<rootDir>/tests/'
  ],

  testMatch: [
    '**/*.spec.(js|ts)'
  ],

  testURL: 'http://localhost/',

  collectCoverageFrom: [
    'src/**/*.{vue,js,ts}'
  ],

  coverageDirectory: 'tests/unit/coverage',

  coverageReporters: [
    'json',
    'text',
    'text-summary',
    'html'
  ],

  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname'
  ],

  globals: {
    'ts-jest': {
      babelConfig: true
    }
  }
}

module.exports = {
  transform: {
    '^.+\\.jsx?$': 'babel-jest',
  },
  modulePaths: [
    '<rootDir>/node_modules/',
  ],
  moduleNameMapper: {
    '^meteor/(.*):(.*)$': '<rootDir>/share/utils/__meteor__/$1_$2',
    '^meteor/': '<rootDir>/share/utils/__meteor__',
  },
  unmockedModulePathPatterns: [
    '/^imports\\/.*\\.jsx?$/',
    '/^node_modules/',
  ],
  setupTestFrameworkScriptFile: '<rootDir>/app/imports/client/util/setupTests.js',
};

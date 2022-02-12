module.exports = {
  modulePaths: ['<rootDir>/assets'],
  testPathIgnorePatterns: ['/node_modules/', '<rootDir>/vendor/'],
  transform: {
    '^.+\\.js$': 'babel-jest'
  }
}

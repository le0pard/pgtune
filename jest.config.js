module.exports = {
  modulePaths: ['<rootDir>/assets'],
  moduleDirectories: ['node_modules', '<rootDir>/assets'],
  testPathIgnorePatterns: ['/node_modules/', '<rootDir>/vendor/'],
  transform: {
    '^.+\\.js$': 'babel-jest'
  }
}

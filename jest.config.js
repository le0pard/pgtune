process.env.TZ = 'UTC' // normalize timezone for tests

export default {
  transform: {},
  coverageReporters: ['json', 'lcov', 'text', 'clover', 'html'],
  clearMocks: true,
  moduleNameMapper: {
    '^@root/(.*)': '<rootDir>/src/$1',
    '^@app/(.*)': '<rootDir>/src/app/$1',
    '^@css/(.*)': '<rootDir>/src/css/$1',
    '^@common/(.*)': '<rootDir>/src/common/$1',
    '^@features/(.*)': '<rootDir>/src/features/$1',
    '^@hooks/(.*)': '<rootDir>/src/hooks/$1',
  }
}

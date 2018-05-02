/* eslint-env node */
/* eslint-disable no-var */

var gulp = require('gulp')
var jest = require('gulp-jest').default

gulp.task('jest', function() {
  process.env.NODE_ENV = 'test'
  return gulp.src('.').pipe(jest())
})

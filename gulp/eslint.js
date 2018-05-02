/* eslint-env node */
/* eslint-disable no-var */

var gulp = require('gulp')
var eslint = require('gulp-eslint')

gulp.task('eslint', function() {
  return gulp.src(['webpack/**/*.js', 'webpack/**/*.jsx'])
    .pipe(eslint())
    .pipe(eslint.format('stylish'))
    .pipe(eslint.failAfterError())
})

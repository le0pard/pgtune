/* eslint-env node */
/* eslint-disable no-var, no-console, strict */

var gulp = require('gulp')
var del = require('del')

gulp.task('cleanup:assets', function () {
  return del([
    '.tmp/dist/**/*'
  ]);
});

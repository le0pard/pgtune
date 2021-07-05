const gulp = require('gulp')
const del = require('del')

gulp.task('cleanup:assets', () => {
  return del([
    '.tmp/dist/**/*'
  ])
})


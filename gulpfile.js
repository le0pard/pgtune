const gulp = require('gulp')
const del = require('del')
const critical = require('critical').stream

const criticalOptions = {
  base: 'build/',
  inline: true,
  minify: true,
  width: 1440,
  height: 1024
}

gulp.task('cleanup:assets', () => {
  return del([
    '.tmp/dist/**/*'
  ])
})

// Generate & Inline Critical-path CSS
gulp.task('critical', () => {
  return gulp
    .src(['build/*.html', '!build/404.html'])
    .pipe(critical(criticalOptions))
    .on('error', (err) => {
      console.error(err.message)
    })
    .pipe(gulp.dest('build'))
})

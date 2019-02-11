/* eslint-env node */
/* eslint-disable no-var, no-console, strict */

'use strict'

var gulp = require('gulp')

require('./gulp/eslint')
require('./gulp/jest')
require('./gulp/cleanup')

gulp.task('test', gulp.parallel('eslint', 'jest'))

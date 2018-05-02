/* eslint-env node */
/* eslint-disable no-var, no-console, strict */

'use strict'

var gulp = require('gulp')

require('./gulp/eslint')
require('./gulp/jest')

gulp.task('test', ['eslint', 'jest'])

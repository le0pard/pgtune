const browserlist = require('./browserslist.config')

module.exports = {
  plugins: [
    require('postcss-import')({
      path: ['assets/css']
    }),
    require('rucksack-css'),
    require('lost')({
      flexbox: 'flex'
    }),
    require('postcss-preset-env')({
      stage: 1,
      browsers: browserlist,
      features: {
        'custom-properties': {
          strict: false,
          warnings: false,
          preserve: true
        }
      }
    }),
    require('postcss-browser-reporter'),
    require('postcss-reporter')
  ]
}

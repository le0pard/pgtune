const path = require('path')
const browserlist = require('./browserslist.config')

module.exports = function (api) {
  var validEnv = ['development', 'test', 'production']
  var currentEnv = api.env()
  var isDevelopmentEnv = api.env('development')
  var isTestEnv = api.env('test')

  if (!validEnv.includes(currentEnv)) {
    throw new Error(
      'Please specify a valid `NODE_ENV` or ' +
      '`BABEL_ENV` environment variables. Valid values are "development", ' +
      '"test", and "production". Instead, received: ' +
      JSON.stringify(currentEnv) +
      '.'
    )
  }

  return {
    presets: [
      [
        '@babel/preset-env',
        {
          targets: browserlist,
          forceAllTransforms: true,
          modules: (isTestEnv ? 'auto' : false),
          useBuiltIns: 'entry',
          corejs: 3,
          exclude: ['transform-typeof-symbol']
        }
      ],
      [
        '@babel/preset-react',
        {
          useBuiltIns: 'entry',
          corejs: 3
        }
      ]
    ],
    plugins: [
      '@babel/plugin-syntax-class-properties',
      '@babel/plugin-syntax-export-default-from',
      '@babel/plugin-syntax-export-namespace-from',
      '@babel/plugin-syntax-object-rest-spread',
      [
        '@babel/plugin-transform-runtime',
        {
          helpers: false,
          regenerator: true,
          corejs: false
        }
      ],
      [
        '@babel/plugin-proposal-class-properties',
        {
          loose: true
        }
      ],
      '@babel/plugin-proposal-export-default-from',
      '@babel/plugin-proposal-export-namespace-from',
      [
        '@babel/plugin-proposal-object-rest-spread',
        {
          useBuiltIns: 'entry'
        }
      ],
      [
        '@babel/plugin-transform-regenerator',
        {
          async: false
        }
      ]
    ]
  }
}

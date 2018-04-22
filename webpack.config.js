// Example webpack configuration with asset fingerprinting in production.
'use strict';

const path = require('path');
const fs = require('fs');
const webpack = require('webpack');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OfflinePlugin = require('offline-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');

// set NODE_ENV=production on the environment to add asset fingerprints
const currentEnv = process.env.NODE_ENV || 'development';
const isProduction = currentEnv === 'production';

const preScripts = {
  development: [],
  production: []
};

const preScriptsEnv = isProduction ?
  preScripts['production'] :
  preScripts['development'];

const cssLoaders = [
  MiniCssExtractPlugin.loader,
  {
    loader: 'css-loader',
    options: {
      modules: false,
      minimize: isProduction,
      sourceMap: true
    }
  },
  {
    loader: 'postcss-loader',
    options: {
      sourceMap: true,
      plugins: function() {
        return [
          require('postcss-import')({
            addDependencyTo: webpack
          }),
          require('postcss-url')(),
          require('lost')({
            flexbox: 'flex'
          }),
          require('rucksack-css')(),
          require('postcss-cssnext')({
            browsers: [
              'last 2 version'
            ],
            features: {
              rem: false,
              customProperties: {
                strict: false,
                warnings: false,
                preserve: true
              }
            }
          }),
          require('postcss-browser-reporter')(),
          require('postcss-reporter')()
        ];
      }
    }
  }
];

const config = {
  target: 'web',
  mode: currentEnv,
  performance: {
    hints: false
  },
  entry: {
    'app': preScriptsEnv.concat(['./webpack/app.js'])
  },

  output: {
    // Build assets directly in to public/webpack/, let webpack know
    // that all webpacked assets start with webpack/

    // must match config.webpack.output_dir
    path: path.join(__dirname, '.tmp', 'dist'),
    publicPath: '/',
    filename: isProduction ? '[name]-[chunkhash].js' : '[name].js'
  },

  resolve: {
    modules: [
      path.join(__dirname, 'webpack'),
      path.join(__dirname, 'node_modules')
    ],
    extensions: ['.js', '.jsx', '.json']
  },

  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: [
          'babel-loader'
        ]
      },
      {
        test: /\.(gif|jpg|png|woff|woff2|eot|ttf|svg|ico)$/,
        use: [{
          loader: 'url-loader',
          options: {
            limit: 10000,
            outputPath: 'assets/'
          }
        }]
      },
      {
        test: /\.scss$/,
        use: cssLoaders.concat({
          loader: 'sass-loader',
          options: {
            indentedSyntax: false,
            sourceMap:      true,
            includePaths:   [path.join(__dirname, 'webpack', 'css')]
          }
        })
      },
      {
        test: /\.sass$/,
        use: cssLoaders.concat({
          loader: 'sass-loader',
          options: {
            indentedSyntax: true,
            sourceMap:      true,
            includePaths:   [path.join(__dirname, 'webpack', 'css')]
          }
        })
      }
    ]
  },

  plugins: [
    new MiniCssExtractPlugin({
      filename: isProduction ? '[name]-[hash].css' : '[name].css'
    })
  ],

  optimization: {
    splitChunks: {
      cacheGroups: {
        styles: {
          name: 'styles',
          test: /\.css$/,
          chunks: 'all',
          enforce: true
        }
      }
    }
  }
};

if (isProduction) {
  config.plugins.push(
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.DefinePlugin({
      'process.env': {NODE_ENV: JSON.stringify('production')}
    }),
    new webpack.optimize.ModuleConcatenationPlugin()
  );
  config.optimization = config.optimization || {};
  config.optimization.minimizer = [
    new UglifyJSPlugin({
      cache: true,
      parallel: 2,
      sourceMap: true,
      uglifyOptions: {
        compressor: {warnings: false},
        mangle: true
      }
    })
  ];
  // Source maps
  config.devtool = 'source-map';
} else {
  config.plugins.push(
    new webpack.NamedModulesPlugin()
  );
  // Source maps
  config.devtool = 'inline-source-map';
}

config.plugins.push(
  new OfflinePlugin({
    cache: {
      main: [
        '*.js',
        '*.css',
        '*.png',
        '*.svg'
      ],
    },
    excludes: [
      '**/.*',
      '**/*.map',
      '**/*.gz'
    ],
    externals: [
      '/'
    ],
    name: 'mp-cache',
    version: '[hash]',
    responseStrategy: 'cache-first',
    prefetchRequest: {
      credentials: 'include'
    },
    ServiceWorker: {
      events: true,
      scope: '/',
      minify: isProduction
    },
    AppCache: null
  }),
  new ManifestPlugin({
    fileName: 'assets-manifest.json',
    publicPath: config.output.publicPath,
    writeToFileEmit: process.env.NODE_ENV !== 'test'
  })
)

module.exports = config;

// Example webpack configuration with asset fingerprinting in production.
'use strict';

const path = require('path');
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const WorkboxPlugin = require('workbox-webpack-plugin');
const WebpackAssetsManifest = require('webpack-assets-manifest');

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
      sourceMap: true
    }
  },
  {
    loader: 'postcss-loader',
    options: {
      sourceMap: true
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
    app: preScriptsEnv.concat(['./assets/app.js'])
  },

  output: {
    // Build assets directly in to public/webpack/, let webpack know
    // that all webpacked assets start with webpack/

    // must match config.webpack.output_dir
    path: path.join(__dirname, '.assets-build'),
    publicPath: '/',
    filename: isProduction ? '[name]-[contenthash].js' : '[name].js',
    assetModuleFilename: 'assets/[name]-[contenthash][ext]',
    clean: true
  },

  resolve: {
    modules: [
      'node_modules',
      path.join(__dirname, 'assets')
    ],
    extensions: ['.js', '.json', '.css']
  },

  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheCompression: true,
            cacheDirectory: path.resolve(
              __dirname,
              'tmp/cache/babel-loader'
            )
          }
        }
      },
      {
        test: /\.(gif|jpg|png|woff|woff2|eot|ttf|svg|ico)$/,
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 10000
          }
        }
      },
      {
        test: /\.css$/,
        use: cssLoaders
      }
    ]
  },

  plugins: [
    new MiniCssExtractPlugin({
      filename: isProduction ? '[name]-[contenthash].css' : '[name].css'
    })
  ],

  optimization: {
    splitChunks: {
      chunks: 'async',
      cacheGroups: {
        styles: {
          name: 'app',
          type: 'css/mini-extract',
          chunks: 'all',
          enforce: true
        }
      }
    }
  },

  cache: {
    type: 'filesystem',
    compression: 'gzip',
    hashAlgorithm: 'md4',
    allowCollectingMemory: true,
    cacheDirectory: path.resolve(__dirname, 'tmp/cache/webpack'),
    buildDependencies: {
      config: [__filename],
      lockfile: [path.resolve(__dirname, 'yarn.lock')]
    }
  },

  snapshot: {
    module: {timestamp: true, hash: Boolean(process.env.CI)},
    resolve: {timestamp: true, hash: Boolean(process.env.CI)},
    buildDependencies: {timestamp: true, hash: true},
    resolveBuildDependencies: {timestamp: true, hash: true}
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
    new TerserPlugin({
      parallel: true,
      terserOptions: {
        toplevel: true,
        parse: {
          // Let terser parse ecma 8 code but always output
          // ES6+ compliant code for older browsers
          ecma: 8
        },
        compress: {
          ecma: 2016,
          warnings: false,
          comparisons: false
        },
        mangle: {
          toplevel: true,
          safari10: false
        },
        output: {
          ecma: 2016,
          comments: false,
          ascii_only: true
        }
      }
    }),
    new CssMinimizerPlugin({
      minimizerOptions: {
        preset: [
          'default',
          {
            discardComments: {removeAll: true},
            mergeRules: false, // right now it break focus-visible
            svgo: false
          }
        ]
      }
    })
  ];
  // Source maps
  config.devtool = 'source-map';
} else {
  config.optimization = config.optimization || {};
  config.optimization.moduleIds = 'named';
  // Source maps
  config.devtool = 'inline-source-map';
}

config.plugins.push(
  new WebpackAssetsManifest({
    output: 'manifest.json',
    publicPath: config.output.publicPath,
    writeToDisk: true,
    integrity: true,
    integrityHashes: ['sha256']
  }),
  new WorkboxPlugin.InjectManifest({
    swSrc: './assets/sw.js',
    swDest: 'sw.js',
    compileSrc: true,
    maximumFileSizeToCacheInBytes: (isProduction ? 2097152 : 15730000)
  })
)

module.exports = config;

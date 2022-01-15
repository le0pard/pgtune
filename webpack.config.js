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
      path.join(__dirname, 'assets'),
      path.join(__dirname, 'node_modules')
    ],
    extensions: ['.js', '.json', '.css']
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
      cacheGroups: {
        styles: {
          name: 'app',
          type: 'css/mini-extract',
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
    new TerserPlugin({
      parallel: 2
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

// ./webpack.dev.config.js
/* eslint import/no-extraneous-dependencies: 0 */
const path = require('path');
const webpack = require('webpack');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');

const BUILD_DIR = path.resolve(__dirname, 'public/build');
const APP_DIR = path.resolve(__dirname, 'react');

module.exports = {
  entry: {
    app: ['babel-polyfill', 'webpack-hot-middleware/client?name=app', APP_DIR]
  },
  output: {
    path: BUILD_DIR,
    filename: '[name].js',
    publicPath: '/build/',
    hotUpdateChunkFilename: 'hot/[hash].hot-update.js',
    hotUpdateMainFilename: 'hot/[hash].hot-update.json',
    devtoolModuleFilenameTemplate: 'webpack:///[absolute-resource-path]'
  },
  devtool: 'cheap-module-source-map',
  plugins: [
    new webpack.DefinePlugin({ ENV: JSON.stringify('development') }),
    new CaseSensitivePathsPlugin(),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.ProgressPlugin()
  ],
  module: {
    rules: [{
      enforce: 'pre',
      test: /\.js$/,
      exclude: /node_modules/,
      loader: 'eslint-loader'
    }, {
      enforce: 'pre',
      test: /\.js$/,
      exclude: /node_modules/,
      loader: 'stylelint-custom-processor-loader'
    }, {
      test: /\.jsx?$|\.js?$/,
      exclude: /node_modules/,
      use: [{
        loader: 'babel-loader',
        options: {
          cacheDirectory: true,
          presets: ['es2015', 'stage-0', 'react'],
          plugins: ['emotion/babel']
        }
      }]
    }, {
      test: /\.json?$/,
      loader: 'json-loader'
    }, {
      test: /\.svg$/,
      loader: 'url-loader?limit=10000&mimetype=image/svg+xml'
    }, {
      test: /\.(woff2?|svg)$/,
      loader: 'url-loader?limit=10000'
    }, {
      test: /\.(ttf|eot)$/,
      loader: 'file-loader'
    }]
  }
};
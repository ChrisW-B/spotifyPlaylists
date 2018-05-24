// ./webpack.config.js
const path = require('path');
// const CompressionPlugin = require('compression-webpack-plugin');
const MinifyPlugin = require('babel-minify-webpack-plugin');
const webpack = require('webpack');

const BUILD_DIR = path.resolve(__dirname, 'public/build');
const APP_DIR = path.resolve(__dirname, 'react');

module.exports = {
  devtool: 'source-map',
  mode: 'production',
  entry: {
    app: ['babel-polyfill', `${APP_DIR}/index`],
  },
  output: {
    path: BUILD_DIR,
    filename: '[name].bundle.js',
    chunkFilename: '[name].bundle.js',
    publicPath: '/build/',
  },
  optimization: {
    runtimeChunk: 'single',
    splitChunks: {
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          enforce: true,
          chunks: 'all',
        },
      },
    },
  },
  plugins: [
    new MinifyPlugin(
      { removeConsole: true, removeDebugger: true },
      { comments: false, sourceMap: false },
    ),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.LoaderOptionsPlugin({ minimize: true, debug: false }),
    new webpack.optimize.ModuleConcatenationPlugin(),
    new webpack.optimize.AggressiveMergingPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
  ],
  resolve: {
    extensions: ['.js', '.jsx', '.json'],
  },
  module: {
    rules: [
      {
        test: /\.jsx?$|\.js?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: [['env', { targets: { browsers: ['> 2%'] } }], 'react'],
              plugins: [
                'emotion',
                'transform-object-rest-spread',
                'transform-export-extensions',
                'transform-class-properties',
                ['transform-react-remove-prop-types', { mode: 'remove', removeImport: true }],
              ],
            },
          },
        ],
      },
      {
        test: /\.(ttf|otf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/,
        exclude: /node_modules/,
        loader: 'file-loader?name=fonts/[name].[ext]',
      },
      {
        test: /\.(png|jpg)$/,
        exclude: /node_modules/,
        loader: 'file-loader?name=images/[name].[ext]',
      },
    ],
  },
};
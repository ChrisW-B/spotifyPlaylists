const path = require('path'),
  CompressionPlugin = require('compression-webpack-plugin'),
  BabiliPlugin = require('babili-webpack-plugin'),
  webpack = require('webpack'),
  BUILD_DIR = path.resolve(__dirname, 'public/build'),
  APP_DIR = path.resolve(__dirname, 'react');

module.exports = {
  entry: {
    app: ['babel-polyfill', APP_DIR + '/index']
  },
  output: {
    path: BUILD_DIR,
    filename: '[name].js',
    publicPath: '/build/'
  },
  plugins: [
    new webpack.DefinePlugin({ ENV: JSON.stringify('production') }),
    new BabiliPlugin({ removeConsole: true, removeDebugger: true }, { comments: false, sourceMap: false }),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.LoaderOptionsPlugin({
      minimize: true,
      debug: false
    }),
    new webpack.optimize.ModuleConcatenationPlugin(),
    new webpack.optimize.AggressiveMergingPlugin(),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    new CompressionPlugin({
      asset: "[path].gz[query]",
      algorithm: "gzip",
      test: /\.js$|\.css$|\.html$/,
      threshold: 10240,
      minRatio: 0
    })
  ],
  resolve: {
    extensions: ['.js', '.jsx', '.json']
  },
  module: {
    rules: [{
      test: /\.jsx?$|\.js?$/,
      exclude: /(node_modules|bower_components)/,
      use: {
        loader: 'babel-loader',
        options: {
          cacheDirectory: './webpack-cache',
          babelrc: false,
          'presets': [
            'es2015', ['minify', { removeConsole: true, removeDebugger: true }],
            'react',
            'stage-0'
          ],
          'plugins': [
            'transform-decorators-legacy', [
              'transform-react-remove-prop-types',
              {
                mode: 'remove',
                removeImport: true
              }
            ],
            [
              'transform-runtime', {
                helpers: false,
                polyfill: false,
                regenerator: true,
                moduleName: 'babel-runtime'
              }
            ]
          ]
        }
      }
    }, {
      test: /\.scss$/,
      exclude: /node_modules/,
      use: [{
        loader: 'style-loader'
      }, {
        loader: 'css-loader',
        options: {
          importLoaders: 1
        }
      }, {
        loader: 'postcss-loader',
        options: {
          plugins: [
            require('postcss-smart-import')({ /* ...options */ }),
            require('precss')({ /* ...options */ }),
            require('autoprefixer')({ /* ...options */ })
          ]
        }
      }, {
        loader: 'sass-loader'
      }]
    }, {
      test: /\.json?$/,
      loader: 'json-loader',
      exclude: /node_modules/
    }, {
      test: /\.css$/,
      exclude: /node_modules/,
      loader: 'style-loader!css-loader!autoprefixer?browsers=last 2 versions'
    }, {
      test: /\.(ttf|otf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/,
      exclude: /node_modules/,
      loader: 'file-loader?name=fonts/[name].[ext]'
    }, {
      test: /\.(png|jpg)$/,
      exclude: /node_modules/,
      loader: 'file-loader?name=images/[name].[ext]'
    }]
  }
};
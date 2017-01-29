var path = require("path");
var HtmlWebpackPlugin = require('html-webpack-plugin');
var CleanWebpackPlugin = require('clean-webpack-plugin');
var webpack = require('webpack');

const isProd = process.argv.findIndex((key) => key === '--prod') > -1;

console.log(isProd ? 'Production build' : 'Development build');

const plugins = [
  new HtmlWebpackPlugin({
    title: 'Simple Tetris',
    template: 'src/index.html',
    inject: 'body'
  })
];

if (isProd) {
  plugins.push(
    new webpack.optimize.UglifyJsPlugin({
      mangle: false
    }));

  plugins.unshift(
    new CleanWebpackPlugin(['build'], {
      root: path.resolve(__dirname, './'),
      verbose: true,
      dry: false
    }));
}

config = {
  entry: [path.resolve(__dirname, './src/js/index.js')],
  output: {
    filename: 'js/bundle.js',
    path: path.resolve(__dirname, "build"),
    publicPath: "",
    pathinfo: true
  },
  resolve: {
    root: path.resolve(__dirname, './js'),
    alias: {
      'styles': path.resolve(__dirname, './styles')
    }
  },
  devServer: {
    contentBase: path.resolve(__dirname, "build")
  },
  stats: {
    colors: true,
    reasons: true,
    hash: false,
    modulesSort: 'name'
  },
  cache: true,
  module: {
    loaders: [{
      test: /\.js$/,
      loader: 'babel',
      cacheable: true,
      query: {
        cacheDirectory: true,
        presets: ['es2015', 'stage-1']
      }
    }, {
      test: /\.scss$/,
      loaders: [
        "style",
        "css" + (isProd ? '?sourceMap' : ''),
        "sass" + (isProd ? '?sourceMap' : '')
      ]
    }]
  },
  resolveLoader: {
    root: path.resolve(__dirname, './')
  },
  plugins: plugins
};

if (!isProd) {
  config.devtool = 'source-map';
  config.debug = true;
}

module.exports = config;

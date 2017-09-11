const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const IgnorePlugin = require("webpack/lib/IgnorePlugin");
const ProvidePlugin = require("webpack/lib/ProvidePlugin");

module.exports = {
  context: path.resolve(__dirname, "src"),
  entry: {
    main: "./app/main.js",
    style: "./style/app.css",
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: "[name]-[hash].bundle.js",
    chunkFilename: '[chunkhash].bundle.js',
    publicPath: "/"
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['raw-loader']
      },
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: "style-loader",
          use: "css-loader"
        })
      },
      {
        test: /\.(ttf|eot|woff|woff2|svg)$/,
        loader: 'file-loader',
        options: {
          name: 'fonts/[name].[ext]'
        }
      },
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        use: [
          'url-loader?limit=10000',
          'img-loader'
        ]
      },
      {
        test: /\.handlebars/,
        loader: "handlebars-loader",
        query: {
          helperDirs: [
            path.resolve(__dirname, 'src', 'handlebar', 'helpers')
          ]
        }
      },
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015', 'es2016']
        }
      }
    ]
    },
    devServer: {
      contentBase: path.join(__dirname, "dist"),
      compress: true,
      port: 9000,
      historyApiFallback: true
    },
    plugins: [
      new HtmlWebpackPlugin({template: './index.html', inject: true}),
      new ExtractTextPlugin("style-[hash].bundle.css"),
      new ProvidePlugin({
        $: 'jquery',
        jQuery: 'jquery',
        moment: 'moment'
      }),
        new CopyWebpackPlugin([{ from: 'assets/', to: 'assets' }]),
        new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),

    ]
};

import path from 'path'

import HtmlWebpackPlugin from 'html-webpack-plugin'

export default {
  mode: process.env.NODE_ENV,
  entry: path.resolve(__dirname, 'kalong', 'front', 'index.js'),
  output: {
    filename: 'front.[hash].js',
    publicPath: '/assets/',
    path: path.resolve(__dirname, 'kalong', 'assets'),
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'kalong',
      template: path.resolve(__dirname, 'kalong', 'front', 'index.ejs'),
    }),
  ],
  devServer: {
    port: 59998,
    historyApiFallback: {
      index: '/assets/index.html',
    },
    hot: true,
    overlay: true,
    disableHostCheck: true,
    compress: true,
    watchOptions: {
      ignored: /node_modules/,
    },
  },
}

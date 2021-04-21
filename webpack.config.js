const path = require('path')
const TerserPlugin = require('terser-webpack-plugin')

module.exports = {
  mode: 'production',
  entry: path.resolve(__dirname, 'bundle', 'index.js'),
  target: 'node',
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        extractComments: false,
        terserOptions: {
          output: {
            comments: false
          }
        }
      })
    ],
    mangleExports: 'size',
    moduleIds: 'size',
    chunkIds: 'size'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'index.js'
  },
  resolve: {
    extensions: ['.js']
  },
  module: {
    rules: [
      {
        test: /\.tsx?/,
        use: 'babel-loader',
        exclude: /node-modules/
      }
    ]
  }
}

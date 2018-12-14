const nodeExternals = require('webpack-node-externals')

module.exports = {
  target: 'node',
  // optimization: {
  //   minimize: false
  // },
  externals: [nodeExternals()],
  module: {
    rules: [
      {
        test: /\.js?$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            babelrc: false
          }
        }
      }
    ]
  }
}

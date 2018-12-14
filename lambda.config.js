const nodeExternals = require('webpack-node-externals')

module.exports = {
  target: 'node',
  // optimization: {
  //   minimize: false
  // },
  externals: [nodeExternals({
    whitelist: [/^core-js/, /^regenerator-runtime/]
  })],
  module: {
    rules: [
      {
        test: /\.js?$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            babelrc: false,
            presets: [
              ['@babel/preset-env', {
                debug: true,
                targets: { node: '8.1' }
              }]
            ]
          }
        }
      }
    ]
  }
}

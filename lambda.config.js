module.exports = {
  target: 'node',
  // optimization: {
  //   minimize: false
  // },
  module: {
    exprContextCritical: false,
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

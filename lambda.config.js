const devMode = process.env.NODE_ENV === 'development'

module.exports = {
  target: 'node',
  optimization: {
    minimize: !devMode
  },
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
              '@babel/preset-typescript',
              ['@babel/preset-env', {
                debug: devMode,
                targets: { node: '8.1' }
              }]
            ],
            plugins: [
              '@babel/plugin-proposal-class-properties',
              '@babel/plugin-transform-object-assign',
              '@babel/plugin-proposal-object-rest-spread'
            ]
          }
        }
      }
    ]
  }
}

module.exports = {
  root: true,
  env: {
    node: true
  },
  extends: [
    'plugin:vue/recommended',
    '@vue/standard'
  ],
  rules: {
    'vue/max-attributes-per-line': ['error', {
      singleline: 3,
      multiline: {
        max: 1,
        allowFirstLine: false
      }
    }],
    'vue/order-in-components': ['error', {
      order: [
        'el',
        'name',
        'parent',
        'functional',
        ['delimiters', 'comments'],
        'extends',
        ['components', 'directives', 'filters'],
        'mixins',
        'inheritAttrs',
        'model',
        ['props', 'propsData'],
        'LIFECYCLE_HOOKS',
        'data',
        'computed',
        'watch',
        'methods',
        ['template', 'render'],
        'renderError'
      ]
    }],
    'vue/no-spaces-around-equal-signs-in-attribute': 'error',
    'vue/name-property-casing': 'off',
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off'
  },
  parserOptions: {
    parser: 'babel-eslint'
  }
}

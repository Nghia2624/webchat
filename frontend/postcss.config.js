export default {
  plugins: {
    'postcss-import': {},
    'tailwindcss/nesting': {},
    'postcss-nested': {},
    'postcss-custom-properties': {
      preserve: false,
    },
    'postcss-calc': {},
    'tailwindcss': {},
    'postcss-preset-env': {
      features: {
        'nesting-rules': false,
      },
      stage: 3,
    },
    'autoprefixer': {},
    'cssnano': {
      preset: ['default', {
        discardComments: {
          removeAll: true,
        },
        normalizeWhitespace: false,
        reduceIdents: false,
        mergeIdents: false,
        zindex: false,
      }],
    },
  }
}; 
/**
 * PostCSS Configuration
 * 
 * Cấu hình này sử dụng:
 * - tailwindcss: Framework CSS utility-first
 * - autoprefixer: Tự động thêm các tiền tố cho trình duyệt
 * - postcss-import: Cho phép sử dụng @import trong CSS
 */

module.exports = {
  plugins: {
    'tailwindcss/nesting': {},
    tailwindcss: {},
    autoprefixer: {},
    'postcss-preset-env': {
      features: {
        'nesting-rules': false,
      },
      stage: 3,
    },
    'postcss-import': {},
    'postcss-nested': {},
    'postcss-custom-properties': {
      preserve: false,
    },
    'postcss-calc': {},
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

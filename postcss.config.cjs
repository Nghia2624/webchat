/**
 * PostCSS configuration
 * 
 * File này sử dụng cú pháp CommonJS (module.exports) và có đuôi .cjs để tương thích
 * với project thiết lập "type": "module" trong package.json
 * 
 * Lưu ý: Chúng ta sử dụng cấu hình Browserslist từ package.json hoặc .browserslistrc
 * thay vì cấu hình trực tiếp trong autoprefixer để tránh cảnh báo và tối ưu khả năng
 * tái sử dụng cấu hình giữa các công cụ (autoprefixer, babel, v.v.)
 */
module.exports = {
  plugins: {
    // Plugin chính của Tailwind CSS
    tailwindcss: {
      config: './tailwind.config.cjs',
    },
    // Tự động thêm các tiền tố cho các thuộc tính CSS
    // Sử dụng browserslist từ package.json hoặc .browserslistrc
    autoprefixer: {},
  },
} 
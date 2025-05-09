/**
 * Script tự động thiết lập cấu hình khi cài đặt
 * 
 * Chạy tự động sau khi npm install thông qua postinstall script
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Lấy __dirname trong ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('⚙️ Thiết lập cấu hình cho ứng dụng...');

// Kiểm tra và tạo file .browserslistrc nếu chưa có
const setupBrowserslist = () => {
  const browserslistPath = path.join(rootDir, '.browserslistrc');
  
  if (!fs.existsSync(browserslistPath)) {
    const content = `# Cấu hình Browserslist cho dự án
# Đây là các cấu hình hiệu quả giúp tối ưu hóa CSS với Autoprefixer

# Các trình duyệt phổ biến
> 1%
last 2 versions

# Loại bỏ các trình duyệt không còn được hỗ trợ
not dead
not ie 11

# Cho các thiết bị di động
cover 95% in VN`;
    
    fs.writeFileSync(browserslistPath, content);
    
    console.log('✅ Đã tạo file .browserslistrc');
  } else {
    console.log('✅ Đã có file .browserslistrc');
  }
};

// Kiểm tra và đổi tên file cấu hình từ .js sang .cjs
const setupConfigFiles = () => {
  const fileMap = [
    { js: 'postcss.config.js', cjs: 'postcss.config.cjs' },
    { js: 'tailwind.config.js', cjs: 'tailwind.config.cjs' }
  ];
  
  fileMap.forEach(({ js, cjs }) => {
    const jsPath = path.join(rootDir, js);
    const cjsPath = path.join(rootDir, cjs);
    
    if (fs.existsSync(jsPath) && !fs.existsSync(cjsPath)) {
      fs.copyFileSync(jsPath, cjsPath);
      fs.unlinkSync(jsPath);
      console.log(`✅ Đã chuyển đổi ${js} thành ${cjs}`);
    } else if (fs.existsSync(cjsPath)) {
      console.log(`✅ Đã có file ${cjs}`);
    }
  });
};

// Kiểm tra và tạo thư mục styles nếu chưa có
const setupStylesDir = () => {
  const stylesDir = path.join(rootDir, 'src', 'styles');
  
  if (!fs.existsSync(stylesDir)) {
    fs.mkdirSync(stylesDir, { recursive: true });
    console.log('✅ Đã tạo thư mục src/styles');
  }
  
  const tailwindCssPath = path.join(stylesDir, 'tailwind.css');
  
  if (!fs.existsSync(tailwindCssPath)) {
    const content = `/**
 * Tailwind CSS base file
 * 
 * File này chứa các directive cơ bản của Tailwind CSS.
 * Được import từ main.css để tích hợp với các styles khác.
 * 
 * Tham khảo: https://tailwindcss.com/docs/functions-and-directives
 */

@tailwind base;
@tailwind components;
@tailwind utilities;`;
    
    fs.writeFileSync(tailwindCssPath, content);
    
    console.log('✅ Đã tạo file tailwind.css');
  } else {
    console.log('✅ Đã có file tailwind.css');
  }
};

// Chạy các chức năng
const setup = () => {
  try {
    setupBrowserslist();
    setupConfigFiles();
    setupStylesDir();
    
    console.log('✨ Hoàn tất thiết lập cấu hình!');
  } catch (error) {
    console.error('❌ Lỗi khi thiết lập cấu hình:', error.message);
  }
};

setup(); 
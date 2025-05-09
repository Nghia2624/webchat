const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Script làm sạch và chuẩn hóa cấu trúc dự án frontend
 * - Kiểm tra cấu hình PostCSS
 * - Tối ưu hóa CSS
 * - Xác minh các dependency
 */

console.log('🧹 Bắt đầu quá trình làm sạch và tối ưu hóa...');

// Kiểm tra cấu hình PostCSS
const postCssCheck = () => {
  try {
    console.log('👉 Kiểm tra cấu hình PostCSS...');
    
    const postCssPath = path.join(__dirname, 'postcss.config.js');
    const content = fs.readFileSync(postCssPath, 'utf8');
    
    // Kiểm tra xem cấu hình có dùng @tailwindcss/postcss không
    if (!content.includes('@tailwindcss/postcss')) {
      console.log('⚠️ Cấu hình PostCSS không sử dụng @tailwindcss/postcss. Tiến hành sửa chữa...');
      
      const newContent = `module.exports = {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
}`;
      
      fs.writeFileSync(postCssPath, newContent);
      console.log('✅ Đã cập nhật cấu hình PostCSS.');
    } else {
      console.log('✅ Cấu hình PostCSS đã chính xác.');
    }
  } catch (error) {
    console.error('❌ Lỗi khi kiểm tra cấu hình PostCSS:', error.message);
  }
};

// Xóa các file CSS không sử dụng
const cleanupCss = () => {
  try {
    console.log('👉 Dọn dẹp các file CSS không cần thiết...');
    
    const stylesDir = path.join(__dirname, 'src', 'styles');
    const cssFiles = fs.readdirSync(stylesDir).filter(file => file.endsWith('.css'));
    
    // Dữ liệu thiết yếu: tailwind.css, main.css, layout.css
    const essentialFiles = ['tailwind.css', 'main.css', 'layout.css'];
    
    for (const file of cssFiles) {
      if (!essentialFiles.includes(file)) {
        const filePath = path.join(stylesDir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isFile()) {
          // Lưu trữ file trước khi xóa
          const backupDir = path.join(__dirname, 'backup', 'styles');
          
          if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
          }
          
          fs.copyFileSync(filePath, path.join(backupDir, file));
          
          // Kiểm tra nội dung file dài hơn 10 dòng thì không xóa
          const content = fs.readFileSync(filePath, 'utf8');
          const lines = content.split('\n');
          
          if (lines.length <= 10) {
            fs.unlinkSync(filePath);
            console.log(`🗑️ Đã xóa ${file} (đã sao lưu).`);
          } else {
            console.log(`⚠️ Không xóa ${file} (${lines.length} dòng) vì có thể chứa code quan trọng.`);
          }
        }
      }
    }
    
    console.log('✅ Hoàn tất dọn dẹp CSS.');
  } catch (error) {
    console.error('❌ Lỗi khi dọn dẹp CSS:', error.message);
  }
};

// Kiểm tra các dependency
const checkDependencies = () => {
  try {
    console.log('👉 Kiểm tra các dependency...');
    
    // Đảm bảo @tailwindcss/postcss được cài đặt
    try {
      execSync('npm ls @tailwindcss/postcss', { stdio: 'pipe' });
      console.log('✅ @tailwindcss/postcss đã được cài đặt.');
    } catch (error) {
      console.log('⚠️ @tailwindcss/postcss chưa được cài đặt. Tiến hành cài đặt...');
      execSync('npm install @tailwindcss/postcss --save-dev', { stdio: 'inherit' });
    }
    
    // Kiểm tra các package vật tư quan trọng
    const essentialPackages = [
      'autoprefixer',
      'postcss',
    ];
    
    for (const pkg of essentialPackages) {
      try {
        execSync(`npm ls ${pkg}`, { stdio: 'pipe' });
        console.log(`✅ ${pkg} đã được cài đặt.`);
      } catch (error) {
        console.log(`⚠️ ${pkg} chưa được cài đặt. Tiến hành cài đặt...`);
        execSync(`npm install ${pkg} --save-dev`, { stdio: 'inherit' });
      }
    }
    
    console.log('✅ Hoàn tất kiểm tra dependencies.');
  } catch (error) {
    console.error('❌ Lỗi khi kiểm tra dependencies:', error.message);
  }
};

// Tối ưu hóa cấu trúc thư mục
const optimizeDirectory = () => {
  try {
    console.log('👉 Tối ưu hóa cấu trúc thư mục...');
    
    // Đảm bảo có các thư mục cần thiết
    const requiredDirs = [
      'src/components/common',
      'src/components/layout',
      'src/hooks',
      'src/utils/api',
      'src/utils/helpers',
      'src/assets/icons',
      'src/assets/images',
    ];
    
    for (const dir of requiredDirs) {
      const dirPath = path.join(__dirname, dir);
      
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`📁 Đã tạo thư mục ${dir}`);
      }
    }
    
    console.log('✅ Hoàn tất tối ưu hóa cấu trúc thư mục.');
  } catch (error) {
    console.error('❌ Lỗi khi tối ưu hóa cấu trúc thư mục:', error.message);
  }
};

// Chạy các chức năng
const runCleanup = async () => {
  console.log('🚀 Bắt đầu quy trình làm sạch và tối ưu hóa...');
  
  postCssCheck();
  cleanupCss();
  checkDependencies();
  optimizeDirectory();
  
  console.log('✨ Hoàn tất quy trình làm sạch và tối ưu hóa!');
};

runCleanup(); 
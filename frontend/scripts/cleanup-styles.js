/**
 * Cleanup Styles Script
 * Dọn dẹp thư mục styles, xóa các thư mục con rỗng và các file không sử dụng
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Đường dẫn thư mục styles
const stylesDir = path.join(__dirname, '../src/styles');

// Mảng chứa các thư mục con cần kiểm tra
const subDirs = ['components', 'pages'];

// Hàm kiểm tra và xóa thư mục rỗng
function removeEmptyDir(dirPath) {
  try {
    if (!fs.existsSync(dirPath)) {
      return false;
    }
    
    const files = fs.readdirSync(dirPath);
    
    if (files.length === 0) {
      console.log(`Xóa thư mục rỗng: ${dirPath}`);
      fs.rmdirSync(dirPath);
      return true;
    }
    
    return false;
  } catch (err) {
    console.error(`Lỗi khi kiểm tra thư mục ${dirPath}:`, err);
    return false;
  }
}

// Hàm tạo thư mục nếu không tồn tại
function ensureDirExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    console.log(`Tạo thư mục: ${dirPath}`);
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Hàm kiểm tra xem file có được import trong main.css không
function isFileImportedInMain(filePath) {
  try {
    const mainCssPath = path.join(stylesDir, 'main.css');
    const mainCssContent = fs.readFileSync(mainCssPath, 'utf8');
    const fileName = path.basename(filePath);
    
    return mainCssContent.includes(`@import '${fileName}'`) || 
           mainCssContent.includes(`@import "./${fileName}"`);
  } catch (err) {
    console.error('Lỗi khi kiểm tra import:', err);
    return false;
  }
}

// Hàm chính thực hiện dọn dẹp
function cleanupStyles() {
  console.log('Bắt đầu dọn dẹp thư mục styles...');
  
  // Đảm bảo thư mục styles tồn tại
  ensureDirExists(stylesDir);
  
  // Xóa các file CSS không sử dụng
  for (const dir of subDirs) {
    const dirPath = path.join(stylesDir, dir);
    
    if (fs.existsSync(dirPath)) {
      try {
        const files = fs.readdirSync(dirPath);
        
        for (const file of files) {
          if (file.endsWith('.css')) {
            const filePath = path.join(dirPath, file);
            
            if (!isFileImportedInMain(filePath)) {
              console.log(`Xóa file không sử dụng: ${filePath}`);
              fs.unlinkSync(filePath);
            }
          }
        }
      } catch (err) {
        console.error(`Lỗi khi dọn dẹp thư mục ${dirPath}:`, err);
      }
    }
  }
  
  // Xóa các thư mục rỗng
  for (const dir of subDirs) {
    const dirPath = path.join(stylesDir, dir);
    removeEmptyDir(dirPath);
  }
  
  console.log('Hoàn thành dọn dẹp thư mục styles!');
}

// Thực thi hàm chính
cleanupStyles(); 
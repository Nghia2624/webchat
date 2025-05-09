/**
 * Force Remove Empty Directories
 * Script xóa thư mục rỗng bằng cách sử dụng lệnh hệ thống
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Đường dẫn thư mục gốc
const srcDir = path.join(__dirname, '../src');

// Các thư mục cần xóa nếu rỗng
const emptyDirs = [
  path.join(srcDir, 'styles/components'),
  path.join(srcDir, 'styles/pages')
];

// Sử dụng lệnh hệ thống để xóa thư mục
function forceRemoveDir(dirPath) {
  try {
    if (fs.existsSync(dirPath)) {
      console.log(`Đang xóa thư mục: ${dirPath}`);
      
      if (process.platform === 'win32') {
        // Windows
        execSync(`rmdir "${dirPath}" /s /q`, { stdio: 'ignore' });
      } else {
        // Linux/Mac
        execSync(`rm -rf "${dirPath}"`, { stdio: 'ignore' });
      }
      
      console.log(`Đã xóa thư mục: ${dirPath}`);
      return true;
    }
    return false;
  } catch (err) {
    console.error(`Lỗi khi xóa thư mục ${dirPath}:`, err);
    return false;
  }
}

// Xóa các thư mục rỗng
function removeEmptyDirectories() {
  for (const dir of emptyDirs) {
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir);
      if (files.length === 0) {
        forceRemoveDir(dir);
      } else {
        console.log(`Thư mục không rỗng: ${dir}`);
      }
    } else {
      console.log(`Thư mục không tồn tại: ${dir}`);
    }
  }
}

console.log('Bắt đầu xóa các thư mục rỗng...');
removeEmptyDirectories();
console.log('Hoàn thành xóa các thư mục rỗng!'); 
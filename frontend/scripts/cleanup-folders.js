/**
 * Cleanup Folders Script
 * Dọn dẹp các thư mục rỗng và cấu trúc thư mục không cần thiết
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Đường dẫn thư mục gốc của frontend
const rootDir = path.join(__dirname, '..');
const srcDir = path.join(rootDir, 'src');

// Các thư mục cần kiểm tra
const dirsToCheck = [
  path.join(srcDir, 'styles', 'components'),
  path.join(srcDir, 'styles', 'pages'),
  path.join(srcDir, 'components', 'unused'),
  path.join(srcDir, 'utils', 'unused'),
  path.join(srcDir, 'assets', 'unused'),
];

/**
 * Xóa thư mục rỗng
 */
function removeEmptyDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    return false;
  }
  
  try {
    const items = fs.readdirSync(dirPath);
    
    // Kiểm tra và xóa các thư mục con rỗng trước
    for (const item of items) {
      const itemPath = path.join(dirPath, item);
      const stats = fs.statSync(itemPath);
      
      if (stats.isDirectory()) {
        removeEmptyDir(itemPath);
      }
    }
    
    // Kiểm tra lại sau khi đã xóa các thư mục con
    const remainingItems = fs.readdirSync(dirPath);
    
    if (remainingItems.length === 0) {
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

/**
 * Quét toàn bộ thư mục src để tìm và xóa thư mục rỗng
 */
function scanAndCleanDirectories(dir) {
  if (!fs.existsSync(dir)) {
    return;
  }
  
  try {
    const items = fs.readdirSync(dir);
    
    // Đi vào từng thư mục con và kiểm tra
    for (const item of items) {
      const itemPath = path.join(dir, item);
      const stats = fs.statSync(itemPath);
      
      if (stats.isDirectory()) {
        scanAndCleanDirectories(itemPath);
        removeEmptyDir(itemPath);
      }
    }
  } catch (err) {
    console.error(`Lỗi khi quét thư mục ${dir}:`, err);
  }
}

/**
 * Tối ưu hóa node_modules
 */
function optimizeNodeModules() {
  try {
    console.log('Dọn dẹp cache và module không sử dụng...');
    execSync('npm prune', { cwd: rootDir, stdio: 'inherit' });
    console.log('Hoàn thành dọn dẹp các module không sử dụng!');
  } catch (err) {
    console.error('Lỗi khi tối ưu node_modules:', err);
  }
}

/**
 * Hàm chính để dọn dẹp thư mục
 */
function cleanupFolders() {
  console.log('Bắt đầu dọn dẹp cấu trúc thư mục...');
  
  // Xóa các thư mục rỗng cụ thể
  for (const dir of dirsToCheck) {
    removeEmptyDir(dir);
  }
  
  // Quét toàn bộ thư mục src để tìm và xóa thư mục rỗng
  scanAndCleanDirectories(srcDir);
  
  // Tối ưu hóa node_modules
  optimizeNodeModules();
  
  console.log('Hoàn thành dọn dẹp cấu trúc thư mục!');
}

// Thực thi hàm chính
cleanupFolders(); 
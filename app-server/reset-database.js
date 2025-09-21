const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔄 Resetting database...');

// 1. Stop any running server
console.log('1. Stopping any running processes...');
try {
  execSync('taskkill /f /im node.exe', { stdio: 'ignore' });
} catch (e) {
  // Ignore if no processes found
}

// 2. Delete database file if exists (SQLite)
const dbPath = path.join(__dirname, 'database.sqlite');
if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
  console.log('2. ✓ Deleted existing database file');
} else {
  console.log('2. ✓ No existing database file found');
}

// 3. Build the application
console.log('3. Building application...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('3. ✓ Build completed');
} catch (e) {
  console.error('3. ❌ Build failed:', e.message);
  process.exit(1);
}

// 4. Start server in background
console.log('4. Starting server...');
const server = execSync('start /B npm run start:prod', { stdio: 'pipe' });

// Wait a bit for server to start
setTimeout(() => {
  console.log('5. ✅ Database reset completed!');
  console.log('');
  console.log('🚀 Server should be running at http://localhost:3000');
  console.log('📚 API docs at http://localhost:3000/api');
  console.log('');
  console.log('Default admin credentials:');
  console.log('  Email: admin@system.local');
  console.log('  Password: admin123');
  console.log('');
  console.log('To stop the server, run: taskkill /f /im node.exe');
}, 5000);

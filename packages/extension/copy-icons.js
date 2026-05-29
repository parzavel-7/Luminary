const fs = require('fs');
const path = require('path');

const srcPath = 'C:\\Users\\Dell\\.gemini\\antigravity-ide\\brain\\c0f7f932-0f63-419e-8e1e-779f80f119f2\\luminary_logo_1780024677775.png';
const destDir = path.join(__dirname, 'src', 'icons');

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

const sizes = [16, 48, 128];
sizes.forEach((size) => {
  const destPath = path.join(destDir, `icon-${size}.png`);
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath);
    console.log(`Copied icon successfully to: ${destPath}`);
  } else {
    console.error(`Error: Source icon not found at ${srcPath}`);
  }
});

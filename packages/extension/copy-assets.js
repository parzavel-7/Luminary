const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const distDir = path.join(__dirname, 'dist');

function copyRecursive(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();

  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursive(
        path.join(src, childItemName),
        path.join(dest, childItemName)
      );
    });
  } else {
    // Only copy non-typescript files
    if (!src.endsWith('.ts')) {
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.copyFileSync(src, dest);
      console.log(`Copied static asset: ${path.relative(srcDir, src)}`);
    }
  }
}

console.log('Copying static assets to dist...');
if (fs.existsSync(srcDir)) {
  copyRecursive(srcDir, distDir);
  console.log('Static assets copied successfully.');
} else {
  console.error('Error: Source directory (src) does not exist!');
  process.exit(1);
}

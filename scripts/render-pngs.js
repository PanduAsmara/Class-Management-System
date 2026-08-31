const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const publicIconsDir = path.join(__dirname, '..', 'public', 'icons');
const svgPath = path.join(publicIconsDir, 'icon.svg');

async function renderIcons() {
  const svgBuffer = fs.readFileSync(svgPath);

  // 1. 512x512 PNG
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicIconsDir, 'icon-512x512.png'));
  console.log("Rendered icon-512x512.png");

  // 2. 192x192 PNG
  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.join(publicIconsDir, 'icon-192x192.png'));
  console.log("Rendered icon-192x192.png");

  // 3. Apple Touch Icon 180x180 PNG
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.join(publicIconsDir, 'apple-touch-icon.png'));
  console.log("Rendered apple-touch-icon.png");

  // 4. Favicon 32x32 PNG
  const publicDir = path.join(__dirname, '..', 'public');
  await sharp(svgBuffer)
    .resize(32, 32)
    .png()
    .toFile(path.join(publicDir, 'favicon.ico'));
  console.log("Rendered favicon.ico");
}

renderIcons().catch(console.error);

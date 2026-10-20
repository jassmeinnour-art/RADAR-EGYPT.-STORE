import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

// Simple PNG encoder using Node's built-in zlib
function createCRC32Table() {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c >>> 0;
  }
  return table;
}

const crcTable = createCRC32Table();

function crc32(buf) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xFF];
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function makeChunk(type, data) {
  const len = data.length;
  const buf = Buffer.alloc(8 + len + 4);
  buf.writeUInt32BE(len, 0);
  buf.write(type, 4, 4, 'ascii');
  data.copy(buf, 8);
  const crcTarget = buf.subarray(4, 8 + len);
  const crcVal = crc32(crcTarget);
  buf.writeUInt32BE(crcVal, 8 + len);
  return buf;
}

function generatePng(width, height, drawPixelFn) {
  const signature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  
  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // 8 bits per channel
  ihdrData[9] = 6; // RGBA
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  const ihdrChunk = makeChunk('IHDR', ihdrData);

  // Raw image scanlines
  const rowStride = 1 + width * 4;
  const rawData = Buffer.alloc(height * rowStride);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowStride;
    rawData[rowOffset] = 0; // Filter: None
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = drawPixelFn(x, y, width, height);
      const pxOffset = rowOffset + 1 + x * 4;
      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const compressedData = zlib.deflateSync(rawData, { level: 9 });
  const idatChunk = makeChunk('IDAT', compressedData);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// Function to render the Radar / Merchant Icon
function drawRadarMerchantIcon(x, y, w, h, isMaskable = false) {
  // Center coordinates normalized (-1 to 1)
  const cx = w / 2;
  const cy = h / 2;
  const dx = x - cx;
  const dy = y - cy;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const maxR = w / 2;

  // Background gradient: Deep Indigo (#1e1b4b) to Vibrant Royal Indigo (#4338ca)
  const normY = y / h;
  const bgR = Math.round(30 + normY * 35);
  const bgG = Math.round(27 + normY * 29);
  const bgB = Math.round(75 + normY * 127);

  // For non-maskable icon, round the corners with a squircle radius
  if (!isMaskable) {
    const cornerRadius = w * 0.22;
    // Box bounds
    const boxInset = w * 0.02;
    const minX = boxInset, maxX = w - boxInset;
    const minY = boxInset, maxY = h - boxInset;
    
    // Check if outside rounded rect
    let isInside = true;
    if (x < minX + cornerRadius && y < minY + cornerRadius) {
      const d = Math.hypot(x - (minX + cornerRadius), y - (minY + cornerRadius));
      if (d > cornerRadius) isInside = false;
    } else if (x > maxX - cornerRadius && y < minY + cornerRadius) {
      const d = Math.hypot(x - (maxX - cornerRadius), y - (minY + cornerRadius));
      if (d > cornerRadius) isInside = false;
    } else if (x < minX + cornerRadius && y > maxY - cornerRadius) {
      const d = Math.hypot(x - (minX + cornerRadius), y - (maxY - cornerRadius));
      if (d > cornerRadius) isInside = false;
    } else if (x > maxX - cornerRadius && y > maxY - cornerRadius) {
      const d = Math.hypot(x - (maxX - cornerRadius), y - (maxY - cornerRadius));
      if (d > cornerRadius) isInside = false;
    } else if (x < minX || x > maxX || y < minY || y > maxY) {
      isInside = false;
    }

    if (!isInside) {
      return [0, 0, 0, 0]; // transparent outside
    }
  }

  // Safe scale for elements (maskable requires 80% safe zone, so scale down slightly)
  const scale = isMaskable ? 0.72 : 0.88;
  const rScaled = dist / (maxR * scale);

  // 1. Radar rings (concentric circles)
  const ring1 = Math.abs(rScaled - 0.35);
  const ring2 = Math.abs(rScaled - 0.65);
  const ring3 = Math.abs(rScaled - 0.92);
  const isRing = ring1 < 0.025 || ring2 < 0.022 || ring3 < 0.02;

  // 2. Radar sweep glow (quadrant sweep in upper-right)
  const angle = Math.atan2(dy, dx); // -PI to PI
  let sweepGlow = 0;
  if (rScaled <= 0.95) {
    // Sweep beam around angle -0.8 radians (~ -45 deg)
    const angleDiff = Math.abs(((angle + Math.PI * 0.3) % (Math.PI * 2)));
    if (angleDiff < 0.8) {
      sweepGlow = (1 - angleDiff / 0.8) * (1 - rScaled * 0.6) * 0.4;
    }
  }

  // 3. Center Merchant Emblem: Store Front + Electric Pulse Bolt
  // Center Diamond / Shield
  const scaleDiamond = maxR * scale * 0.42;
  const diamondDist = (Math.abs(dx) + Math.abs(dy)) / scaleDiamond;
  const isDiamond = diamondDist <= 1.0;
  const isDiamondBorder = diamondDist <= 1.08 && diamondDist >= 0.92;

  // Center Lightning/Radar Beam Icon
  // Stylized bolt in center
  const bx = dx / (maxR * scale * 0.28);
  const by = dy / (maxR * scale * 0.28);
  let isBolt = false;
  // Segment 1: top part
  if (by >= -0.7 && by <= 0.1 && bx >= (-0.2 - by * 0.4) && bx <= (0.35 - by * 0.3)) {
    isBolt = true;
  }
  // Segment 2: bottom part
  if (by >= -0.1 && by <= 0.7 && bx >= (-0.4 - by * 0.3) && bx <= (0.15 - by * 0.4)) {
    isBolt = true;
  }

  // Radar crosshairs (subtle)
  const isCrosshair = (Math.abs(dx) < 1.5 || Math.abs(dy) < 1.5) && rScaled > 0.45 && rScaled < 0.95;

  // Color blending
  let r = bgR;
  let g = bgG;
  let b = bgB;
  let a = 255;

  // Apply sweep glow (cyan/emerald tint)
  if (sweepGlow > 0) {
    r = Math.round(r * (1 - sweepGlow) + 16 * sweepGlow);
    g = Math.round(g * (1 - sweepGlow) + 185 * sweepGlow);
    b = Math.round(b * (1 - sweepGlow) + 129 * sweepGlow);
  }

  // Apply radar rings (cyan/emerald glow)
  if (isRing) {
    r = 56;
    g = 189;
    b = 248; // sky-400
  } else if (isCrosshair) {
    r = 99;
    g = 102;
    b = 241; // indigo-500
  }

  // Apply Center Diamond
  if (isDiamondBorder) {
    r = 245;
    g = 158;
    b = 11; // amber-500 / gold
  } else if (isDiamond) {
    r = 67;
    g = 56;
    b = 202; // indigo-700
  }

  // Apply Bolt (bright amber/white gold)
  if (isBolt) {
    r = 254;
    g = 240;
    b = 138; // amber-200
  }

  // Subtle outer border for the card
  if (!isMaskable && dist > maxR * 0.96 && dist < maxR * 0.99) {
    r = 129;
    g = 140;
    b = 248;
  }

  return [r, g, b, a];
}

// Generate all required PWA icons
const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

console.log('Generating PWA Icons into public/ ...');

// 1. pwa-192x192.png
const png192 = generatePng(192, 192, (x, y, w, h) => drawRadarMerchantIcon(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), png192);
console.log('✓ Created pwa-192x192.png');

// 2. pwa-512x512.png
const png512 = generatePng(512, 512, (x, y, w, h) => drawRadarMerchantIcon(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), png512);
console.log('✓ Created pwa-512x512.png');

// 3. pwa-maskable-512x512.png (with 15% safe-zone margin & full bleed)
const pngMaskable512 = generatePng(512, 512, (x, y, w, h) => drawRadarMerchantIcon(x, y, w, h, true));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), pngMaskable512);
console.log('✓ Created pwa-maskable-512x512.png');

// 4. apple-touch-icon.png (180x180)
const pngApple180 = generatePng(180, 180, (x, y, w, h) => drawRadarMerchantIcon(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), pngApple180);
console.log('✓ Created apple-touch-icon.png');

// 5. favicon-32x32.png
const pngFavicon32 = generatePng(32, 32, (x, y, w, h) => drawRadarMerchantIcon(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'favicon-32x32.png'), pngFavicon32);
console.log('✓ Created favicon-32x32.png');

console.log('All PWA PNG icons generated successfully!');

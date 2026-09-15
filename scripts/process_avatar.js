const fs = require('fs');
const zlib = require('zlib');

// Read source PNG
const buf = fs.readFileSync('d:/Portfolio/assets/profile.png');

let pos = 8;
let width = 0, height = 0;
let idatChunks = [];

while (pos < buf.length) {
  const len = buf.readUInt32BE(pos);
  const type = buf.toString('ascii', pos + 4, pos + 8);
  const data = buf.subarray(pos + 8, pos + 8 + len);
  if (type === 'IHDR') {
    width = data.readUInt32BE(0);
    height = data.readUInt32BE(4);
  } else if (type === 'IDAT') {
    idatChunks.push(data);
  }
  pos += 12 + len;
}

const compressed = Buffer.concat(idatChunks);
const decompressed = zlib.inflateSync(compressed);

const bpp = 4; // RGBA
const rowBytes = width * bpp;
const uncompressedRows = Buffer.alloc(height * rowBytes);

function paethPredictor(a, b, c) {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  if (pa <= pb && pa <= pc) return a;
  if (pb <= pc) return b;
  return c;
}

let srcOffset = 0;
for (let y = 0; y < height; y++) {
  const filterType = decompressed[srcOffset++];
  const prevRowOffset = (y - 1) * rowBytes;
  const currRowOffset = y * rowBytes;

  for (let x = 0; x < rowBytes; x++) {
    const rawByte = decompressed[srcOffset++];
    const a = (x >= bpp) ? uncompressedRows[currRowOffset + x - bpp] : 0;
    const b = (y > 0) ? uncompressedRows[prevRowOffset + x] : 0;
    const c = (y > 0 && x >= bpp) ? uncompressedRows[prevRowOffset + x - bpp] : 0;

    let val = 0;
    switch (filterType) {
      case 0: val = rawByte; break;
      case 1: val = (rawByte + a) & 0xff; break;
      case 2: val = (rawByte + b) & 0xff; break;
      case 3: val = (rawByte + Math.floor((a + b) / 2)) & 0xff; break;
      case 4: val = (rawByte + paethPredictor(a, b, c)) & 0xff; break;
    }
    uncompressedRows[currRowOffset + x] = val;
  }
}

// Flood fill from corners and top edges to remove light grey studio background
// Sample background around top-left (0, 0)
const bgSamples = [
  [0, 0], [width - 1, 0], [0, 50], [width - 1, 50], [Math.floor(width / 2), 0]
];

// Create visited map and mask
const isBg = new Uint8Array(width * height);
const queue = [];

// Seed the flood fill from top, left, right borders where background is
for (let x = 0; x < width; x++) {
  queue.push(x, 0);
  isBg[0 * width + x] = 1;
}
for (let y = 0; y < Math.floor(height * 0.7); y++) {
  queue.push(0, y);
  isBg[y * width + 0] = 1;
  queue.push(width - 1, y);
  isBg[y * width + (width - 1)] = 1;
}

// Background is light grey studio backdrop (~ RGB 205-230, low saturation)
function isSimilarBg(r, g, b) {
  // Check if pixel is light neutral grey (R, G, B roughly equal and > 185)
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const diff = max - min;
  const isLightGrey = (r >= 180 && g >= 180 && b >= 180 && diff < 28);
  const isSlightlyDarkerGrey = (r >= 165 && g >= 165 && b >= 165 && diff < 20);
  return isLightGrey || isSlightlyDarkerGrey;
}

let qHead = 0;
while (qHead < queue.length) {
  const cx = queue[qHead++];
  const cy = queue[qHead++];

  const neighbors = [
    [cx + 1, cy],
    [cx - 1, cy],
    [cx, cy + 1],
    [cx, cy - 1]
  ];

  for (const [nx, ny] of neighbors) {
    if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
      const nIdx = ny * width + nx;
      if (!isBg[nIdx]) {
        const offset = (ny * width + nx) * 4;
        const r = uncompressedRows[offset];
        const g = uncompressedRows[offset + 1];
        const b = uncompressedRows[offset + 2];

        if (isSimilarBg(r, g, b)) {
          isBg[nIdx] = 1;
          queue.push(nx, ny);
        }
      }
    }
  }
}

// Feather edges and apply alpha transparency
const finalAlpha = new Uint8Array(width * height);
for (let i = 0; i < width * height; i++) {
  finalAlpha[i] = isBg[i] ? 0 : 255;
}

// Gaussian blur on mask edge for soft transition
const blurredAlpha = new Uint8Array(width * height);
for (let y = 1; y < height - 1; y++) {
  for (let x = 1; x < width - 1; x++) {
    const idx = y * width + x;
    if (isBg[idx]) {
      blurredAlpha[idx] = 0;
    } else {
      // Check distance to bg
      let nearBg = false;
      for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
          const ny = y + dy;
          const nx = x + dx;
          if (ny >= 0 && ny < height && nx >= 0 && nx < width) {
            if (isBg[ny * width + nx]) nearBg = true;
          }
        }
      }
      if (nearBg) {
        // Average surrounding
        let sum = 0, count = 0;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            sum += finalAlpha[(y + dy) * width + (x + dx)];
            count++;
          }
        }
        blurredAlpha[idx] = Math.round(sum / count);
      } else {
        blurredAlpha[idx] = 255;
      }
    }
  }
}

// Build new filtered scanlines (Filter 0 for simplicity and perfect preservation)
const filteredOut = Buffer.alloc(height * (rowBytes + 1));
let dstOffset = 0;

for (let y = 0; y < height; y++) {
  filteredOut[dstOffset++] = 0; // Filter 0 (None)
  for (let x = 0; x < width; x++) {
    const pOffset = (y * width + x) * 4;
    filteredOut[dstOffset++] = uncompressedRows[pOffset];     // R
    filteredOut[dstOffset++] = uncompressedRows[pOffset + 1]; // G
    filteredOut[dstOffset++] = uncompressedRows[pOffset + 2]; // B
    filteredOut[dstOffset++] = blurredAlpha[y * width + x];   // A (Cutout background)
  }
}

// Compress with zlib
const newIdatData = zlib.deflateSync(filteredOut, { level: 9 });

// Write PNG chunks
function createChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);

  const typeBuf = Buffer.from(type, 'ascii');
  const crcData = Buffer.concat([typeBuf, data]);

  // Compute CRC32
  let crc = 0 ^ (-1);
  for (let i = 0; i < crcData.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ crcData[i]) & 0xff];
  }
  crc = (crc ^ (-1)) >>> 0;

  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc, 0);

  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

// CRC32 table
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = ((c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1)) >>> 0;
  }
  crcTable[n] = c;
}

// Build IHDR
const ihdrData = Buffer.alloc(13);
ihdrData.writeUInt32BE(width, 0);
ihdrData.writeUInt32BE(height, 4);
ihdrData[8] = 8; // bit depth
ihdrData[9] = 6; // RGBA
ihdrData[10] = 0;
ihdrData[11] = 0;
ihdrData[12] = 0;

const pngHeader = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const ihdrChunk = createChunk('IHDR', ihdrData);
const idatChunk = createChunk('IDAT', newIdatData);
const iendChunk = createChunk('IEND', Buffer.alloc(0));

const finalPng = Buffer.concat([pngHeader, ihdrChunk, idatChunk, iendChunk]);
fs.writeFileSync('d:/Portfolio/assets/profile_transparent.png', finalPng);
console.log('Successfully created d:/Portfolio/assets/profile_transparent.png! Size:', finalPng.length);

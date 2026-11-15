// Generates a tiny "SR" default shop image as a PNG data URI (no dependencies).
const zlib = require('zlib');
const W = 96, H = 96, S = 6; // canvas, glyph scale
const bg = [232, 69, 44], fg = [255, 255, 255];
const glyph = {
  S: ['01110', '10001', '10000', '01110', '00001', '10001', '01110'],
  R: ['11110', '10001', '10001', '11110', '10100', '10010', '10001'],
};
const px = Buffer.alloc(W * H * 3);
for (let i = 0; i < W * H; i++) px.set(bg, i * 3);
const ox = Math.floor((W - (5 * S * 2 + S)) / 2), oy = Math.floor((H - 7 * S) / 2);
['S', 'R'].forEach((ch, gi) => {
  glyph[ch].forEach((row, r) => [...row].forEach((c, col) => {
    if (c !== '1') return;
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
      const X = ox + gi * (5 * S + S) + col * S + x, Y = oy + r * S + y;
      px.set(fg, (Y * W + X) * 3);
    }
  }));
});
const raw = Buffer.alloc((W * 3 + 1) * H);
for (let y = 0; y < H; y++) { raw[y * (W * 3 + 1)] = 0; px.copy(raw, y * (W * 3 + 1) + 1, y * W * 3, (y + 1) * W * 3); }
const crcT = []; for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; crcT[n] = c >>> 0; }
const crc = (b) => { let c = 0xffffffff; for (const x of b) c = crcT[(c ^ x) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
const chunk = (t, d) => { const l = Buffer.alloc(4); l.writeUInt32BE(d.length); const td = Buffer.concat([Buffer.from(t), d]); const c = Buffer.alloc(4); c.writeUInt32BE(crc(td)); return Buffer.concat([l, td, c]); };
const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(W, 0); ihdr.writeUInt32BE(H, 4); ihdr[8] = 8; ihdr[9] = 2;
const png = Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
require('fs').writeFileSync('default-sr.png', png);
console.log('data:image/png;base64,' + png.toString('base64'));

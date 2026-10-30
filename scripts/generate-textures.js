const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function generateTextures() {
  console.log('Launching headless Chrome to generate luscious liquid marble textures...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  const script = `
    function createMarbleTexture(type, width, height) {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      const imgData = ctx.createImageData(width, height);
      const data = imgData.data;

      // Seeded random
      let seed = type === 'critical' ? 42 : type === 'pending' ? 108 : 333;
      function rnd() {
        seed = (seed * 16807 + 11) % 2147483647;
        return (seed - 1) / 2147483646;
      }

      // Permutation table
      const perm = new Uint8Array(512);
      for (let i = 0; i < 256; i++) perm[i] = i;
      for (let i = 255; i > 0; i--) {
        const j = Math.floor(rnd() * (i + 1));
        const temp = perm[i];
        perm[i] = perm[j];
        perm[j] = temp;
      }
      for (let i = 0; i < 256; i++) perm[256 + i] = perm[i];

      function grad(hash, x, y, z, w) {
        const h = hash & 15;
        const u = h < 8 ? x : y;
        const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
        return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
      }

      function sCurve(t) { return t * t * t * (t * (t * 6 - 15) + 10); }

      function noise4D(x, y, z, w) {
        const X = Math.floor(x) & 255;
        const Y = Math.floor(y) & 255;
        const Z = Math.floor(z) & 255;
        const W = Math.floor(w) & 255;

        x -= Math.floor(x);
        y -= Math.floor(y);
        z -= Math.floor(z);
        w -= Math.floor(w);

        const u = sCurve(x);
        const v = sCurve(y);
        const s = sCurve(z);
        const t = sCurve(w);

        const A = perm[X] + Y, AA = perm[A] + Z, AB = perm[A + 1] + Z;
        const B = perm[X + 1] + Y, BA = perm[B] + Z, BB = perm[B + 1] + Z;

        const AAA = perm[AA] + W, AAB = perm[AA + 1] + W;
        const ABA = perm[AB] + W, ABB = perm[AB + 1] + W;
        const BAA = perm[BA] + W, BAB = perm[BA + 1] + W;
        const BBA = perm[BB] + W, BBB = perm[BB + 1] + W;

        return (1 - t) * (
          (1 - s) * (
            (1 - v) * ((1 - u) * grad(perm[AAA], x, y, z, w) + u * grad(perm[BAA], x - 1, y, z, w)) +
            v * ((1 - u) * grad(perm[ABA], x, y - 1, z, w) + u * grad(perm[BBA], x - 1, y - 1, z, w))
          ) +
          s * (
            (1 - v) * ((1 - u) * grad(perm[AAB], x, y, z - 1, w) + u * grad(perm[BAB], x - 1, y, z - 1, w)) +
            v * ((1 - u) * grad(perm[ABB], x, y - 1, z - 1, w) + u * grad(perm[BBB], x - 1, y - 1, z - 1, w))
          )
        ) + t * (
          (1 - s) * (
            (1 - v) * ((1 - u) * grad(perm[AAA + 1], x, y, z, w - 1) + u * grad(perm[BAA + 1], x - 1, y, z, w - 1)) +
            v * ((1 - u) * grad(perm[ABA + 1], x, y - 1, z, w - 1) + u * grad(perm[BBA + 1], x - 1, y - 1, z, w - 1))
          ) +
          s * (
            (1 - v) * ((1 - u) * grad(perm[AAB + 1], x, y, z - 1, w - 1) + u * grad(perm[BAB + 1], x - 1, y, z - 1, w - 1)) +
            v * ((1 - u) * grad(perm[ABB + 1], x, y - 1, z - 1, w - 1) + u * grad(perm[BBB + 1], x - 1, y - 1, z - 1, w - 1))
          )
        );
      }

      // Toroidal 4D seamless noise
      function seamlessNoise(u, v, scale) {
        const angleU = u * 2 * Math.PI;
        const angleV = v * 2 * Math.PI;
        const r = 1.0;
        const nx = Math.cos(angleU) * r * scale;
        const ny = Math.sin(angleU) * r * scale;
        const nz = Math.cos(angleV) * r * scale;
        const nw = Math.sin(angleV) * r * scale;
        return noise4D(nx, ny, nz, nw);
      }

      // Large scale FBM (low frequency = bold ribbons)
      function fbm(u, v, octaves = 3, scale = 0.55) {
        let value = 0;
        let amp = 0.6;
        let s = scale;
        for (let i = 0; i < octaves; i++) {
          value += amp * seamlessNoise(u, v, s);
          s *= 1.85;
          amp *= 0.45;
        }
        return value;
      }

      // Deep domain warping with large displacement amplitude
      function domainWarp(u, v) {
        const qx = fbm(u, v, 3, 0.45);
        const qy = fbm((u + 0.35) % 1.0, (v + 0.22) % 1.0, 3, 0.45);

        const rx = fbm((u + 1.8 * qx + 0.12) % 1.0, (v + 1.8 * qy + 0.45) % 1.0, 3, 0.55);
        const ry = fbm((u + 1.8 * qx + 0.72) % 1.0, (v + 1.8 * qy + 0.88) % 1.0, 3, 0.55);

        const f = fbm((u + 2.2 * rx) % 1.0, (v + 2.2 * ry) % 1.0, 3, 0.65);
        return { f, qx, qy, rx, ry };
      }

      // Pre-compute height field to calculate 3D surface normals for liquid glossy sheen
      const hField = new Float32Array(width * height);
      for (let y = 0; y < height; y++) {
        const v = y / height;
        for (let x = 0; x < width; x++) {
          const u = x / width;
          const w = domainWarp(u, v);
          hField[y * width + x] = w.f;
        }
      }

      // Render with 3D normals and color palette mapping
      for (let y = 0; y < height; y++) {
        const ym = (y - 1 + height) % height;
        const yp = (y + 1) % height;
        for (let x = 0; x < width; x++) {
          const xm = (x - 1 + width) % width;
          const xp = (x + 1) % width;

          const f = hField[y * width + x];
          // Gradient for normal vector
          const dx = (hField[y * width + xp] - hField[y * width + xm]) * 3.5;
          const dy = (hField[yp * width + x] - hField[ym * width + x]) * 3.5;

          // Normal
          const len = Math.sqrt(dx * dx + dy * dy + 1.0);
          const nx = -dx / len;
          const ny = -dy / len;
          const nz = 1.0 / len;

          // Light direction from top-left-front: [-0.45, -0.55, 0.70]
          const lx = -0.45, ly = -0.55, lz = 0.70;
          const lLen = Math.sqrt(lx * lx + ly * ly + lz * lz);
          const lNormX = lx / lLen, lNormY = ly / lLen, lNormZ = lz / lLen;

          const diff = Math.max(0, nx * lNormX + ny * lNormY + nz * lNormZ);

          // Specular (reflection)
          const rx = 2 * diff * nx - lNormX;
          const ry = 2 * diff * ny - lNormY;
          const rz = 2 * diff * nz - lNormZ;
          const spec = Math.pow(Math.max(0, rz), 18) * 1.4;

          const normVal = Math.max(0, Math.min(1, (f + 0.6) * 0.85));

          let r, g, b;

          if (type === 'critical') {
            // Palette 1: Reference Card 1 (Red + Slate Teal / Dark Charcoal)
            // Bold swirling rivers of crimson/vermilion red cutting through deep charcoal slate-teal
            if (normVal < 0.38) {
              // Deep slate teal / charcoal
              const k = normVal / 0.38;
              r = 20 + k * (42 - 20);
              g = 36 + k * (68 - 36);
              b = 48 + k * (82 - 48);
            } else if (normVal < 0.58) {
              // Transition from dark slate into rich dark cherry / crimson
              const k = (normVal - 0.38) / 0.20;
              r = 42 + k * (195 - 42);
              g = 68 - k * 45;
              b = 82 - k * 56;
            } else if (normVal < 0.82) {
              // Vibrant fiery crimson / vermilion liquid
              const k = (normVal - 0.58) / 0.24;
              r = 195 + k * (235 - 195);
              g = 23 + k * (65 - 23);
              b = 26 + k * (45 - 26);
            } else {
              // Bright molten coral highlight
              const k = (normVal - 0.82) / 0.18;
              r = 235 + k * (255 - 235);
              g = 65 + k * (120 - 65);
              b = 45 + k * (80 - 45);
            }

            // Glossy liquid specular highlights on the folds
            r = Math.min(255, r * (0.8 + diff * 0.3) + spec * 140);
            g = Math.min(255, g * (0.8 + diff * 0.3) + spec * 110);
            b = Math.min(255, b * (0.8 + diff * 0.3) + spec * 90);
          } else if (type === 'pending') {
            // Palette 2: Reference Card 2 (Peach + Lavender + Copper)
            // Molten copper bronze, rich amethyst lavender, glowing soft peach
            if (normVal < 0.35) {
              // Deep smoky lavender / amethyst plum
              const k = normVal / 0.35;
              r = 75 + k * (125 - 75);
              g = 45 + k * (68 - 45);
              b = 105 + k * (165 - 105);
            } else if (normVal < 0.65) {
              // Metallic copper & bronze ribbon
              const k = (normVal - 0.35) / 0.30;
              r = 125 + k * (215 - 125);
              g = 68 + k * (115 - 68);
              b = 165 - k * (165 - 65);
            } else {
              // Warm glowing peach / liquid caramel
              const k = (normVal - 0.65) / 0.35;
              r = 215 + k * (252 - 215);
              g = 115 + k * (185 - 115);
              b = 65 + k * (145 - 65);
            }

            // Liquid metallic sheen
            r = Math.min(255, r * (0.8 + diff * 0.3) + spec * 160);
            g = Math.min(255, g * (0.8 + diff * 0.3) + spec * 135);
            b = Math.min(255, b * (0.8 + diff * 0.3) + spec * 120);
          } else {
            // Palette 3: Reference Card 3 (Emerald + Cream-Gold)
            // Deep luxurious emerald forest green, lustrous champagne cream, liquid bullion gold
            if (normVal < 0.38) {
              // Deep emerald pine / dark jungle
              const k = normVal / 0.38;
              r = 16 + k * (28 - 16);
              g = 48 + k * (78 - 48);
              b = 38 + k * (58 - 38);
            } else if (normVal < 0.68) {
              // Rich emerald transitioning into antique gold
              const k = (normVal - 0.38) / 0.30;
              r = 28 + k * (185 - 28);
              g = 78 + k * (158 - 78);
              b = 58 - k * (58 - 45);
            } else {
              // Champagne cream & radiant liquid gold
              const k = (normVal - 0.68) / 0.32;
              r = 185 + k * (248 - 185);
              g = 158 + k * (232 - 158);
              b = 45 + k * (150 - 45);
            }

            // Golden specular highlights
            r = Math.min(255, r * (0.8 + diff * 0.3) + spec * 160);
            g = Math.min(255, g * (0.8 + diff * 0.3) + spec * 150);
            b = Math.min(255, b * (0.8 + diff * 0.3) + spec * 95);
          }

          const idx = (y * width + x) * 4;
          data[idx] = Math.floor(r);
          data[idx + 1] = Math.floor(g);
          data[idx + 2] = Math.floor(b);
          data[idx + 3] = 255;
        }
      }

      ctx.putImageData(imgData, 0, 0);
      return canvas.toDataURL('image/webp', 0.82);
    }
  `;

  await page.evaluate(script);

  const variants = ['critical', 'pending', 'approved'];
  for (const v of variants) {
    console.log(`Rendering texture for ${v}...`);
    const dataUrl = await page.evaluate((type) => {
      // 560x440: crisp, beautiful ribbons and strictly under 120KB in WebP
      return createMarbleTexture(type, 560, 440);
    }, v);

    const base64Data = dataUrl.replace(/^data:image\/webp;base64,/, '');
    const outPath = path.join(__dirname, '..', 'public', 'textures', `marble-${v}.webp`);
    fs.writeFileSync(outPath, Buffer.from(base64Data, 'base64'));

    const stats = fs.statSync(outPath);
    console.log(`Saved ${outPath} (${(stats.size / 1024).toFixed(1)} KB)`);
  }

  await browser.close();
  console.log('All 3 luscious marble textures generated successfully!');
}

generateTextures().catch(console.error);

// Dynamic dominant color extractor from album artwork

export interface ColorPalette {
  dominant: string;       // hex: #rrggbb
  dominantRgb: [number, number, number];
  gradientCss: string;    // radial-gradient or conic style
  ambientGlow: string;    // rgba string
  secondaryGlow: string;  // complementary or lighter tone
}

const colorCache = new Map<string, ColorPalette>();

// Fallback dark palette
const DEFAULT_PALETTE: ColorPalette = {
  dominant: '#1a1e29',
  dominantRgb: [26, 30, 41],
  gradientCss: 'radial-gradient(circle at 50% 35%, rgba(35, 45, 65, 0.45) 0%, rgba(10, 12, 18, 0.95) 75%, #000000 100%)',
  ambientGlow: 'rgba(35, 45, 65, 0.4)',
  secondaryGlow: 'rgba(20, 25, 38, 0.25)',
};

export async function extractDominantColor(imageUrl: string): Promise<ColorPalette> {
  if (!imageUrl) return DEFAULT_PALETTE;

  if (colorCache.has(imageUrl)) {
    return colorCache.get(imageUrl)!;
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(DEFAULT_PALETTE);
          return;
        }

        // Small canvas for fast sampling
        const sampleSize = 64;
        canvas.width = sampleSize;
        canvas.height = sampleSize;
        ctx.drawImage(img, 0, 0, sampleSize, sampleSize);

        const imageData = ctx.getImageData(0, 0, sampleSize, sampleSize).data;
        let totalR = 0;
        let totalG = 0;
        let totalB = 0;
        let countedPixels = 0;

        // Also track most saturated candidate pixel
        let maxSaturation = -1;
        let bestR = 25;
        let bestG = 30;
        let bestB = 45;

        for (let i = 0; i < imageData.length; i += 16) { // step by 4 pixels (16 bytes)
          const r = imageData[i];
          const g = imageData[i + 1];
          const b = imageData[i + 2];
          const a = imageData[i + 3];

          if (a < 128) continue;

          // Compute saturation
          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          const lum = (max + min) / 2;
          const delta = max - min;
          const sat = delta === 0 ? 0 : delta / (1 - Math.abs(2 * lum / 255 - 1));

          // Ignore extreme near-black or extreme near-white for dominant vibrancy
          if (lum > 20 && lum < 235) {
            totalR += r;
            totalG += g;
            totalB += b;
            countedPixels++;

            if (sat > maxSaturation) {
              maxSaturation = sat;
              bestR = r;
              bestG = g;
              bestB = b;
            }
          }
        }

        let finalR = bestR;
        let finalG = bestG;
        let finalB = bestB;

        // If average had meaningful color
        if (countedPixels > 0 && maxSaturation < 0.25) {
          finalR = Math.round(totalR / countedPixels);
          finalG = Math.round(totalG / countedPixels);
          finalB = Math.round(totalB / countedPixels);
        }

        // Ensure not too pitch dark for ambient glow visibility
        const intensity = Math.max(finalR, finalG, finalB);
        if (intensity < 60) {
          const boost = 60 / (intensity || 1);
          finalR = Math.min(255, Math.round(finalR * boost));
          finalG = Math.min(255, Math.round(finalG * boost));
          finalB = Math.min(255, Math.round(finalB * boost));
        }

        const hex = `#${((1 << 24) + (finalR << 16) + (finalG << 8) + finalB).toString(16).slice(1)}`;
        
        // Secondary softer color
        const secR = Math.round(finalR * 0.7);
        const secG = Math.round(finalG * 0.7);
        const secB = Math.round(finalB * 0.85);

        const palette: ColorPalette = {
          dominant: hex,
          dominantRgb: [finalR, finalG, finalB],
          gradientCss: `radial-gradient(circle at 50% 38%, rgba(${finalR}, ${finalG}, ${finalB}, 0.52) 0%, rgba(${secR}, ${secG}, ${secB}, 0.22) 55%, rgba(0, 0, 0, 0.92) 85%, #000000 100%)`,
          ambientGlow: `rgba(${finalR}, ${finalG}, ${finalB}, 0.45)`,
          secondaryGlow: `rgba(${secR}, ${secG}, ${secB}, 0.28)`,
        };

        colorCache.set(imageUrl, palette);
        resolve(palette);
      } catch {
        resolve(DEFAULT_PALETTE);
      }
    };

    img.onerror = () => {
      resolve(DEFAULT_PALETTE);
    };

    img.src = imageUrl;
  });
}

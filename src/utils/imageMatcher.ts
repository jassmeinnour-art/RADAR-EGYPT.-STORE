/**
 * Utility for basic client-side image matching:
 * 1. Resizes image to standard thumbnail (e.g. 16x16 or 32x32) using an offscreen canvas
 * 2. Computes color histogram & average luminance/hash vector
 * 3. Compares uploaded image against product images to score visual similarity (0 to 100%)
 */

export interface ImageFingerprint {
  avgR: number;
  avgG: number;
  avgB: number;
  brightness: number;
  aspectRatio: number;
  // 64-bit dHash or 16-point luminance grid
  grid: number[];
}

/**
 * Loads an image from URL or base64 and extracts a perceptual fingerprint using HTML5 Canvas.
 */
export async function extractImageFingerprint(imageSrc: string): Promise<ImageFingerprint | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      try {
        const width = 16;
        const height = 16;
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(null);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const imgData = ctx.getImageData(0, 0, width, height);
        const data = imgData.data;

        let totalR = 0;
        let totalG = 0;
        let totalB = 0;
        const grid: number[] = [];

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          totalR += r;
          totalG += g;
          totalB += b;
          // Luminance formula
          const lum = 0.299 * r + 0.587 * g + 0.114 * b;
          grid.push(lum);
        }

        const totalPixels = width * height;
        const avgR = totalR / totalPixels;
        const avgG = totalG / totalPixels;
        const avgB = totalB / totalPixels;
        const brightness = 0.299 * avgR + 0.587 * avgG + 0.114 * avgB;
        const aspectRatio = img.naturalWidth / (img.naturalHeight || 1);

        resolve({
          avgR,
          avgG,
          avgB,
          brightness,
          aspectRatio,
          grid
        });
      } catch (err) {
        console.warn('Could not extract image fingerprint:', err);
        resolve(null);
      }
    };

    img.onerror = () => {
      resolve(null);
    };

    img.src = imageSrc;
  });
}

/**
 * Calculates similarity between two image fingerprints (returns score 0 to 100).
 */
export function calculateImageSimilarity(fp1: ImageFingerprint, fp2: ImageFingerprint): number {
  // 1. Color distance (Euclidean in RGB, max distance is sqrt(255^2 * 3) ≈ 441.67)
  const dr = fp1.avgR - fp2.avgR;
  const dg = fp1.avgG - fp2.avgG;
  const db = fp1.avgB - fp2.avgB;
  const colorDist = Math.sqrt(dr * dr + dg * dg + db * db);
  const colorSimilarity = Math.max(0, 100 - (colorDist / 441.67) * 100);

  // 2. Structural grid correlation (mean squared difference of normalized luminance)
  let sumSqDiff = 0;
  const len = Math.min(fp1.grid.length, fp2.grid.length);
  for (let i = 0; i < len; i++) {
    const diff = fp1.grid[i] - fp2.grid[i];
    sumSqDiff += diff * diff;
  }
  const rmsDiff = Math.sqrt(sumSqDiff / len);
  const structuralSimilarity = Math.max(0, 100 - (rmsDiff / 255) * 100);

  // 3. Aspect ratio closeness
  const arRatio = Math.min(fp1.aspectRatio, fp2.aspectRatio) / Math.max(fp1.aspectRatio, fp2.aspectRatio || 1);
  const aspectSimilarity = arRatio * 100;

  // Weighted composite score (Structural: 50%, Color: 35%, Aspect: 15%)
  const composite = structuralSimilarity * 0.5 + colorSimilarity * 0.35 + aspectSimilarity * 0.15;
  return Math.round(Math.min(100, Math.max(0, composite)));
}

/**
 * Quick text helper for checking if file is valid image
 */
export function isValidImageFile(file: File): boolean {
  return file.type.startsWith('image/');
}

export type HashType = "ahash" | "dhash" | "phash";

export interface HashResult {
  ahash: string;
  dhash: string;
  phash: string;
  ahashBits: number[];
  dhashBits: number[];
  phashBits: number[];
}

const GRID = 8;

function toGrayscale(data: Uint8ClampedArray, w: number, h: number): Float32Array {
  const gray = new Float32Array(w * h);
  for (let i = 0, p = 0; i < data.length; i += 4, p++) {
    gray[p] = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
  }
  return gray;
}

function downscale(img: HTMLImageElement, size: number): Float32Array {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(img, 0, 0, size, size);
  const { data } = ctx.getImageData(0, 0, size, size);
  return toGrayscale(data, size, size);
}

function mean(arr: Float32Array): number {
  let s = 0;
  for (let i = 0; i < arr.length; i++) s += arr[i];
  return s / arr.length;
}

function bitsToHex(bits: number[]): string {
  let hex = "";
  for (let i = 0; i < bits.length; i += 4) {
    const nibble =
      (bits[i] << 3) | (bits[i + 1] << 2) | (bits[i + 2] << 1) | bits[i + 3];
    hex += nibble.toString(16);
  }
  return hex;
}

function computeAHash(gray: Float32Array): { hex: string; bits: number[] } {
  const avg = mean(gray);
  const bits: number[] = [];
  for (let i = 0; i < gray.length; i++) bits.push(gray[i] >= avg ? 1 : 0);
  return { hex: bitsToHex(bits), bits };
}

function computeDHash(gray: Float32Array): { hex: string; bits: number[] } {
  const bits: number[] = [];
  for (let y = 0; y < GRID; y++) {
    for (let x = 0; x < GRID - 1; x++) {
      const left = gray[y * GRID + x];
      const right = gray[y * GRID + x + 1];
      bits.push(left > right ? 1 : 0);
    }
  }
  return { hex: bitsToHex(bits), bits };
}

function computePHash(img: HTMLImageElement): { hex: string; bits: number[] } {
  const size = 32;
  const gray = downscale(img, size);

  // 1D DCT along rows, then along columns -> 8x8 low-frequency coefficients
  const N = size;
  const rowDct = new Float32Array(N * N);
  const cosTable = new Float32Array(N * N);
  for (let k = 0; k < N; k++) {
    for (let n = 0; n < N; n++) {
      cosTable[k * N + n] = Math.cos((Math.PI * (2 * n + 1) * k) / (2 * N));
    }
  }
  const scaleK = (k: number) => (k === 0 ? 1 / Math.sqrt(N) : Math.sqrt(2 / N));

  for (let y = 0; y < N; y++) {
    for (let k = 0; k < N; k++) {
      let s = 0;
      for (let n = 0; n < N; n++) s += gray[y * N + n] * cosTable[k * N + n];
      rowDct[y * N + k] = scaleK(k) * s;
    }
  }
  const fullDct = new Float32Array(N * N);
  for (let k = 0; k < N; k++) {
    for (let y = 0; y < N; y++) {
      let s = 0;
      for (let n = 0; n < N; n++) s += rowDct[n * N + k] * cosTable[y * N + n];
      fullDct[y * N + k] = scaleK(y) * s;
    }
  }

  // Top-left 8x8 (skip DC term at [0,0] for median)
  const coeffs: number[] = [];
  for (let y = 0; y < GRID; y++) {
    for (let x = 0; x < GRID; x++) {
      if (x === 0 && y === 0) continue;
      coeffs.push(fullDct[y * N + x]);
    }
  }
  const sorted = [...coeffs].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)];
  const bits: number[] = [];
  for (let y = 0; y < GRID; y++) {
    for (let x = 0; x < GRID; x++) {
      if (x === 0 && y === 0) {
        bits.push(0);
        continue;
      }
      bits.push(fullDct[y * N + x] > median ? 1 : 0);
    }
  }
  return { hex: bitsToHex(bits), bits };
}

export async function computeHashes(file: File): Promise<HashResult> {
  const url = URL.createObjectURL(file);
  try {
    const img = await loadImage(url);
    const gray = downscale(img, GRID);
    const a = computeAHash(gray);
    const d = computeDHash(gray);
    const p = computePHash(img);
    return {
      ahash: a.hex,
      dhash: d.hex,
      phash: p.hex,
      ahashBits: a.bits,
      dhashBits: d.bits,
      phashBits: p.bits,
    };
  } finally {
    URL.revokeObjectURL(url);
  }
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = url;
  });
}

export function hammingDistance(a: string, b: string): number {
  if (a.length !== b.length) return Math.max(a.length, b.length) * 4;
  let dist = 0;
  for (let i = 0; i < a.length; i++) {
    const x = parseInt(a[i], 16) ^ parseInt(b[i], 16);
    dist += (x & 1) + ((x >> 1) & 1) + ((x >> 2) & 1) + ((x >> 3) & 1);
  }
  return dist;
}

export function bitDistance(a: number[], b: number[]): number {
  let dist = 0;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) dist++;
  return dist;
}

// Combined similarity across all three hashes (0-100)
export function similarity(a: HashResult, b: HashResult): number {
  const totalBits = 64;
  const aDist = bitDistance(a.ahashBits, b.ahashBits);
  const dDist = bitDistance(a.dhashBits, b.dhashBits);
  const pDist = bitDistance(a.phashBits, b.phashBits);
  const aSim = ((totalBits - aDist) / totalBits) * 100;
  const dSim = ((totalBits - dDist) / totalBits) * 100;
  const pSim = ((totalBits - pDist) / totalBits) * 100;
  // Weighted blend — pHash is most discriminative
  return 0.2 * aSim + 0.3 * dSim + 0.5 * pSim;
}

export function exactDuplicate(a: HashResult, b: HashResult): boolean {
  return (
    a.ahash === b.ahash && a.dhash === b.dhash && a.phash === b.phash
  );
}

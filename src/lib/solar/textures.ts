import * as THREE from "three";
import type { Body } from "./bodies";

function noise(x: number, y: number) {
  const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
  return n - Math.floor(n);
}

function fbm(x: number, y: number) {
  return (
    noise(x, y) * 0.5 +
    noise(x * 2.1, y * 2.1) * 0.25 +
    noise(x * 4.3, y * 4.3) * 0.125
  );
}

function hexToRgb(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function mix(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export function makeBodyTexture(body: Body, enhanced: boolean, size = 256) {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const base = hexToRgb(enhanced ? body.enhanced : body.color);

  const img = ctx.createImageData(size, size);
  const d = img.data;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const u = x / size;
      const v = y / size;
      const lat = (v - 0.5) * 2;
      let r = base.r,
        g = base.g,
        b = base.b;
      const n = fbm(u * 8, v * 8);

      if (body.id === "sun") {
        const gran = 0.85 + n * 0.3;
        r = mix(255, 242, n) * gran;
        g = mix(210, 180, n) * gran;
        b = mix(140, 90, n) * gran;
      } else if (body.id === "earth") {
        const land = n > 0.52;
        const cloud = fbm(u * 14, v * 10) > 0.62;
        const ice = Math.abs(lat) > 0.78 + n * 0.08;
        if (ice) {
          r = 232;
          g = 236;
          b = 242;
        } else if (land) {
          r = enhanced ? 70 : 92;
          g = enhanced ? 120 : 118;
          b = enhanced ? 70 : 86;
        } else {
          r = enhanced ? 40 : 90;
          g = enhanced ? 90 : 130;
          b = enhanced ? 190 : 180;
        }
        if (cloud) {
          r = mix(r, 245, 0.55);
          g = mix(g, 248, 0.55);
          b = mix(b, 252, 0.55);
        }
      } else if (body.id === "jupiter" || body.id === "saturn") {
        const band = Math.sin(lat * Math.PI * (body.id === "jupiter" ? 7 : 5) + n * 2);
        const k = 0.78 + band * 0.22 + n * 0.08;
        r *= k;
        g *= k * 0.96;
        b *= k * 0.85;
        if (body.id === "jupiter" && Math.hypot(u - 0.72, (v - 0.58) * 1.6) < 0.06) {
          r = mix(r, 180, 0.5);
          g = mix(g, 90, 0.45);
          b = mix(b, 70, 0.4);
        }
      } else if (body.id === "mars") {
        const cap = Math.abs(lat) > 0.72;
        const k = 0.85 + n * 0.3;
        r *= k;
        g *= k * 0.9;
        b *= k * 0.8;
        if (cap) {
          r = 230;
          g = 228;
          b = 222;
        }
      } else if (body.id === "venus") {
        const swirl = Math.sin(u * 18 + n * 6 + lat * 3);
        const k = 0.9 + swirl * 0.08 + n * 0.08;
        r *= k;
        g *= k * 0.98;
        b *= k * 0.9;
      } else if (body.id === "neptune" || body.id === "uranus") {
        const k = 0.88 + n * 0.15 + Math.sin(lat * 6) * 0.04;
        r *= k;
        g *= k;
        b *= k * 1.05;
      } else if (body.id === "pluto") {
        const heart = Math.hypot((u - 0.55) * 1.4, v - 0.48) < 0.16;
        const k = 0.75 + n * 0.35;
        r *= k;
        g *= k;
        b *= k * 0.9;
        if (heart) {
          r = 220;
          g = 210;
          b = 200;
        }
      } else {
        const crater = n > 0.72 ? 0.65 : 1;
        r *= (0.8 + n * 0.3) * crater;
        g *= (0.8 + n * 0.3) * crater;
        b *= (0.8 + n * 0.3) * crater;
      }

      const i = (y * size + x) * 4;
      d[i] = Math.max(0, Math.min(255, r));
      d[i + 1] = Math.max(0, Math.min(255, g));
      d[i + 2] = Math.max(0, Math.min(255, b));
      d[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

export function makeGlowTexture() {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createRadialGradient(64, 64, 4, 64, 64, 64);
  g.addColorStop(0, "rgba(255,244,210,1)");
  g.addColorStop(0.25, "rgba(255,220,150,0.45)");
  g.addColorStop(0.55, "rgba(255,200,120,0.12)");
  g.addColorStop(1, "rgba(255,200,120,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function makeDotTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createRadialGradient(32, 32, 2, 32, 32, 30);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.4, "rgba(255,255,255,0.7)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  const tex = new THREE.CanvasTexture(canvas);
  return tex;
}

export function makeRingTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 64;
  const ctx = canvas.getContext("2d")!;
  for (let x = 0; x < 512; x++) {
    const t = x / 512;
    const n = noise(t * 40, 1);
    const a = t < 0.08 || t > 0.92 ? 0 : 0.35 + n * 0.45;
    const gap = t > 0.42 && t < 0.5;
    ctx.fillStyle = `rgba(210,195,160,${gap ? 0.05 : a})`;
    ctx.fillRect(x, 0, 1, 64);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function makeLabelTexture(text: string) {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 64;
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, 256, 64);
  ctx.font = "600 28px 'IBM Plex Sans', system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "rgba(7,8,12,0.55)";
  ctx.fillText(text, 128, 34);
  ctx.fillStyle = "#e8e6e1";
  ctx.fillText(text, 128, 32);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export type Quality = "high" | "low" | "off";

export const runtime = {
  reduce: false,
  compact: false,
  quality: "low" as Quality,
};

export const pointer = { x: 0, y: 0 };

export function detectQuality(): Quality {
  if (typeof window === "undefined") return "low";
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  runtime.reduce = reduce;
  runtime.compact = window.matchMedia("(max-width: 767px)").matches;
  let gl = false;
  try {
    const canvas = document.createElement("canvas");
    gl = !!(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl2") || canvas.getContext("webgl"))
    );
  } catch {
    gl = false;
  }
  if (!gl) {
    runtime.quality = "off";
    return "off";
  }
  const cores = navigator.hardwareConcurrency || 4;
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
  const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
  const quality: Quality =
    reduce || runtime.compact || cores <= 4 || memory <= 4 || saveData ? "low" : "high";
  runtime.quality = quality;
  return quality;
}

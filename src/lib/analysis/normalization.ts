const TRANSPARENT_COLORS = new Set([
  "transparent",
  "rgba(0, 0, 0, 0)",
  "rgba(0,0,0,0)",
  "initial",
  "inherit",
]);

const ZERO_VALUES = new Set(["0", "0px", "0em", "0rem"]);

export function normalizeFontFamily(value: string) {
  return value
    .split(",")
    .map((font) => font.trim().replace(/^["']|["']$/g, ""))
    .filter(Boolean)[0] ?? "Unknown";
}

export function normalizeFontSize(value: string) {
  return normalizePixelValue(value, 1);
}

export function normalizeFontWeight(value: string) {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) {
    return value;
  }
  return String(Math.round(parsed / 100) * 100);
}

export function normalizeColor(value: string) {
  const normalized = value.trim().toLowerCase();
  if (!normalized || TRANSPARENT_COLORS.has(normalized)) {
    return null;
  }

  const rgba = normalized.match(/^rgba?\(([^)]+)\)$/);
  if (!rgba) {
    return normalized;
  }

  const parts = rgba[1].split(",").map((part) => part.trim());
  const [red, green, blue] = parts.map((part) => Number.parseFloat(part));
  const alpha = parts[3] === undefined ? 1 : Number.parseFloat(parts[3]);

  if ([red, green, blue, alpha].some((part) => Number.isNaN(part)) || alpha < 0.05) {
    return null;
  }

  return rgbToHex(red, green, blue);
}

export function normalizeLength(value: string) {
  if (!value || value === "normal" || value === "auto") {
    return null;
  }

  const first = value.split(" ")[0];
  if (ZERO_VALUES.has(first)) {
    return "0px";
  }

  return normalizePixelValue(first, 2);
}

export function normalizeShadow(value: string) {
  if (!value || value === "none") {
    return null;
  }
  return value
    .replace(/\s+/g, " ")
    .replace(/rgba?\([^)]+\)/g, (color) => normalizeColor(color) ?? color)
    .trim();
}

export function normalizeMotionValue(value: string) {
  if (!value || value === "none" || value === "all 0s ease 0s") {
    return null;
  }
  return value.replace(/\s+/g, " ").trim();
}

function normalizePixelValue(value: string, bucket: number) {
  const match = value.match(/^(-?\d*\.?\d+)px$/);
  if (!match) {
    return value.trim();
  }

  const parsed = Number.parseFloat(match[1]);
  if (Math.abs(parsed) < 0.5) {
    return "0px";
  }

  return `${Math.round(parsed / bucket) * bucket}px`;
}

function rgbToHex(red: number, green: number, blue: number) {
  return `#${[red, green, blue]
    .map((channel) =>
      Math.max(0, Math.min(255, Math.round(channel))).toString(16).padStart(2, "0"),
    )
    .join("")}`;
}

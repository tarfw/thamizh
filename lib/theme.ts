export const ACCENT = "#1A73E8";
export const ACCENT_DARK = "#1967D2";
export const ACCENT_SOFT = "#E8F0FE";
export const TEXT = "#202124";
export const TEXT_SECONDARY = "#3C4043";
export const MUTED = "#5F6368";
export const HAIRLINE = "#E8EAED";
export const BORDER_IDLE = "#DADCE0";
export const SURFACE = "#FFFFFF";
export const SURFACE_ALT = "#F1F3F4";
export const SURFACE_HOVER = "#F8F9FA";
export const DANGER = "#D93025";
export const SUCCESS = "#188038";

const AVATAR_PALETTE = [
  { bg: "#1A73E8", fg: "#FFFFFF" },
  { bg: "#188038", fg: "#FFFFFF" },
  { bg: "#D93025", fg: "#FFFFFF" },
  { bg: "#F9AB00", fg: "#202124" },
  { bg: "#9334E6", fg: "#FFFFFF" },
  { bg: "#1E8E3E", fg: "#FFFFFF" },
  { bg: "#E8710A", fg: "#FFFFFF" },
  { bg: "#12B5CB", fg: "#FFFFFF" },
  { bg: "#A142F4", fg: "#FFFFFF" },
  { bg: "#F538A0", fg: "#FFFFFF" },
];

export function avatarColor(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return AVATAR_PALETTE[h % AVATAR_PALETTE.length];
}

export function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0 || !parts[0]) return "?";
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

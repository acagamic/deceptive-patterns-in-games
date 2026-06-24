// Per-pattern Font Awesome (fa6-solid, Free) icons, keyed by pattern code, and
// rendered as inline SVG via astro-icon. Every name is validated against
// @iconify-json/fa6-solid; only the icons used here are bundled (no webfont/CDN).
const BY_CODE: Record<string, string> = {
  // Informational / interface
  I1: "sack-dollar", I2: "face-frown", I3: "shuffle", I4: "door-closed",
  I5: "mask", I6: "eye-low-vision", I7: "thumbs-up", I8: "scale-unbalanced",
  I9: "share-from-square", I10: "crosshairs", I11: "comment-dots", I12: "square-check",
  I13: "layer-group", I14: "id-card", I15: "language", I16: "circle-question",
  // Monetary / randomised
  M1: "dice", M2: "percent", M3: "coins", M4: "tags", M5: "trophy", M6: "forward",
  M7: "hourglass-half", M8: "wrench", M9: "right-left", M10: "rectangle-ad",
  M11: "hand-pointer", M12: "repeat", M13: "arrow-trend-up", M14: "door-open",
  M15: "hand-holding-dollar",
  // Psychological / reinforcement
  P1: "bullseye", P2: "anchor", P3: "hat-wizard", P4: "wand-magic-sparkles",
  P5: "bullhorn", P6: "bars-progress", P7: "boxes-stacked", P8: "face-smile",
  // Social / parasocial
  S1: "people-arrows", S2: "masks-theater", S3: "envelope", S4: "user-secret",
  S5: "crown", S6: "handshake", S7: "user-slash", S8: "ranking-star", S9: "star",
  S10: "list-ol", S11: "heart",
  // Temporal
  T1: "arrows-rotate", T2: "battery-half", T3: "calendar-check", T4: "clock",
  T5: "infinity", T6: "floppy-disk", T7: "person-running",
};

const BY_FAMILY: Record<string, string> = {
  sneaking: "user-ninja",
  "interface-interference": "hand-pointer",
  "forced-action": "lock",
  obstruction: "ban",
  nagging: "bell",
  temporal: "clock",
  monetary: "coins",
  social: "users",
  psychological: "brain",
};

/** fa6-solid icon name for a pattern, by code, falling back to its family. */
export function patternIconName(code: string, family: string): string {
  return BY_CODE[code] ?? BY_FAMILY[family] ?? "circle-question";
}

/** Full astro-icon name, e.g. "fa6-solid:dice". */
export function patternIcon(code: string, family: string): string {
  return `fa6-solid:${patternIconName(code, family)}`;
}

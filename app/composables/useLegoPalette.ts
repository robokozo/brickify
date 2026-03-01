import colorsData from "~/assets/colors.json";

export interface LegoColor {
  id: string;
  name: string;
  hex: string;
  platePartNumber: string; // BrickLink design number for 1×1 plate
  rebrickableId: number;
}

// Lookup map: Rebrickable color ID → color entry from colors.json
const colorByRebrickableId = new Map(
  colorsData.map((c) => [c.rebrickableId, c]),
);

/**
 * Curated list of LEGO solid colors available as 1×1 plates (Part 3024).
 * Hex values sourced from Rebrickable's colors.csv (colors.json).
 * Add a color by adding its Rebrickable ID + a slug below.
 */
const PALETTE_ENTRIES: ReadonlyArray<{ rebrickableId: number; slug: string }> =
  [
    // Neutrals
    { rebrickableId: 15, slug: "white" },
    { rebrickableId: 71, slug: "light-bluish-gray" },
    { rebrickableId: 72, slug: "dark-bluish-gray" },
    { rebrickableId: 0, slug: "black" },
    // Reds
    { rebrickableId: 320, slug: "dark-red" },
    { rebrickableId: 4, slug: "red" },
    { rebrickableId: 1136, slug: "reddish-orange" },
    { rebrickableId: 1050, slug: "coral" },
    // Oranges
    { rebrickableId: 484, slug: "dark-orange" },
    { rebrickableId: 25, slug: "orange" },
    { rebrickableId: 462, slug: "medium-orange" },
    { rebrickableId: 191, slug: "bright-light-orange" },
    // Yellows
    { rebrickableId: 14, slug: "yellow" },
    { rebrickableId: 226, slug: "bright-light-yellow" },
    { rebrickableId: 1062, slug: "neon-yellow" }, // "Vibrant Yellow" in Rebrickable
    // Yellow-greens
    { rebrickableId: 158, slug: "yellowish-green" },
    { rebrickableId: 27, slug: "lime" },
    { rebrickableId: 326, slug: "olive-green" },
    // Greens
    { rebrickableId: 10, slug: "bright-green" },
    { rebrickableId: 2, slug: "green" },
    { rebrickableId: 288, slug: "dark-green" },
    { rebrickableId: 378, slug: "sand-green" },
    { rebrickableId: 3, slug: "dark-turquoise" },
    { rebrickableId: 323, slug: "light-aqua" },
    // Blues
    { rebrickableId: 272, slug: "dark-blue" },
    { rebrickableId: 1, slug: "blue" },
    { rebrickableId: 321, slug: "dark-azure" },
    { rebrickableId: 322, slug: "medium-azure" },
    { rebrickableId: 73, slug: "medium-blue" },
    { rebrickableId: 212, slug: "bright-light-blue" },
    { rebrickableId: 9, slug: "light-blue" },
    { rebrickableId: 379, slug: "sand-blue" },
    { rebrickableId: 1147, slug: "blue-violet" },
    // Purples / Lavenders
    { rebrickableId: 85, slug: "dark-purple" },
    { rebrickableId: 22, slug: "purple" },
    { rebrickableId: 30, slug: "medium-lavender" },
    { rebrickableId: 31, slug: "lavender" },
    // Pinks / Magentas
    { rebrickableId: 26, slug: "magenta" },
    { rebrickableId: 5, slug: "dark-pink" },
    { rebrickableId: 29, slug: "bright-pink" },
    { rebrickableId: 1146, slug: "warm-pink" },
    { rebrickableId: 12, slug: "salmon" },
    // Skin tones / Nougats
    { rebrickableId: 78, slug: "light-nougat" },
    { rebrickableId: 92, slug: "nougat" },
    { rebrickableId: 84, slug: "medium-nougat" },
    // Tans / Browns
    { rebrickableId: 19, slug: "tan" },
    { rebrickableId: 28, slug: "dark-tan" },
    { rebrickableId: 70, slug: "reddish-brown" },
    { rebrickableId: 6, slug: "brown" },
    { rebrickableId: 308, slug: "dark-brown" },
  ] as const;

export const LEGO_COLORS: readonly LegoColor[] = PALETTE_ENTRIES.map(
  ({ rebrickableId, slug }) => {
    const entry = colorByRebrickableId.get(rebrickableId);
    if (!entry)
      throw new Error(
        `Rebrickable color ID ${rebrickableId} not found in colors.json`,
      );
    return {
      id: slug,
      name: entry.name,
      hex: entry.hex,
      platePartNumber: "3024",
      rebrickableId,
    };
  },
);

// --- CIE Lab color space conversion ---
// Used for perceptually accurate nearest-color matching

interface Rgb {
  r: number;
  g: number;
  b: number;
}

interface Lab {
  l: number;
  a: number;
  b: number;
}

const linearize = (c: number): number => {
  const normalized = c / 255;
  return normalized <= 0.04045
    ? normalized / 12.92
    : Math.pow((normalized + 0.055) / 1.055, 2.4);
};

const rgbToLab = ({ r, g, b }: Rgb): Lab => {
  const rl = linearize(r);
  const gl = linearize(g);
  const bl = linearize(b);

  // D65 illuminant matrix (sRGB → XYZ)
  const x = rl * 0.4124564 + gl * 0.3575761 + bl * 0.1804375;
  const y = rl * 0.2126729 + gl * 0.7151522 + bl * 0.072175;
  const z = rl * 0.0193339 + gl * 0.119192 + bl * 0.9503041;

  // Normalize by D65 white point
  const fx = x / 0.95047;
  const fy = y / 1.0;
  const fz = z / 1.08883;

  const cube = (t: number): number =>
    t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116;

  const fx2 = cube(fx);
  const fy2 = cube(fy);
  const fz2 = cube(fz);

  return {
    l: 116 * fy2 - 16,
    a: 500 * (fx2 - fy2),
    b: 200 * (fy2 - fz2),
  };
};

const labDistance = (a: Lab, b: Lab): number => {
  const dl = a.l - b.l;
  const da = a.a - b.a;
  const db = a.b - b.b;
  return dl * dl + da * da + db * db;
};

// Pre-compute Lab values for the whole palette once
const PALETTE_LAB: ReadonlyArray<{ color: LegoColor; lab: Lab }> =
  LEGO_COLORS.map((color) => {
    const hex = color.hex.slice(1);
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return { color, lab: rgbToLab({ r, g, b }) };
  });

// --- Public composable ---

export const useLegoPalette = () => {
  const findNearestColor = ({ r, g, b }: Rgb): LegoColor => {
    const target = rgbToLab({ r, g, b });

    // LEGO_COLORS is non-empty (compile-time const) so this is always defined
    let bestColor: LegoColor = LEGO_COLORS[0] as LegoColor;
    let bestDist = Infinity;

    for (const entry of PALETTE_LAB) {
      const dist = labDistance(target, entry.lab);
      if (dist < bestDist) {
        bestDist = dist;
        bestColor = entry.color;
      }
    }

    return bestColor;
  };

  const getColorById = (id: string): LegoColor | null =>
    LEGO_COLORS.find((c) => c.id === id) ?? null;

  const hexToRgb = (hex: string): Rgb => {
    const h = hex.replace("#", "");
    return {
      r: parseInt(h.slice(0, 2), 16),
      g: parseInt(h.slice(2, 4), 16),
      b: parseInt(h.slice(4, 6), 16),
    };
  };

  return { findNearestColor, getColorById, hexToRgb };
};

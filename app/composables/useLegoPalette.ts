export interface LegoColor {
  id: string;
  name: string;
  hex: string;
  platePartNumber: string; // BrickLink design number for 1×1 plate
}

// Official LEGO color palette — common colors available as 1×1 plates (Part 3024)
// Hex values are close approximations of real LEGO plastic colors
export const LEGO_COLORS: readonly LegoColor[] = [
  { id: "white", name: "White", hex: "#F2F3F2", platePartNumber: "3024" },
  {
    id: "light-bluish-gray",
    name: "Light Bluish Gray",
    hex: "#A0A5A9",
    platePartNumber: "3024",
  },
  {
    id: "dark-bluish-gray",
    name: "Dark Bluish Gray",
    hex: "#6C6E68",
    platePartNumber: "3024",
  },
  { id: "black", name: "Black", hex: "#1B2A34", platePartNumber: "3024" },
  { id: "dark-red", name: "Dark Red", hex: "#720E0F", platePartNumber: "3024" },
  { id: "red", name: "Red", hex: "#C91A09", platePartNumber: "3024" },
  { id: "coral", name: "Coral", hex: "#FF698F", platePartNumber: "3024" },
  {
    id: "dark-orange",
    name: "Dark Orange",
    hex: "#A95500",
    platePartNumber: "3024",
  },
  { id: "orange", name: "Orange", hex: "#FE8A18", platePartNumber: "3024" },
  {
    id: "medium-orange",
    name: "Medium Orange",
    hex: "#FFB24D",
    platePartNumber: "3024",
  },
  { id: "yellow", name: "Yellow", hex: "#F2CD37", platePartNumber: "3024" },
  {
    id: "bright-light-yellow",
    name: "Bright Light Yellow",
    hex: "#FFE001",
    platePartNumber: "3024",
  },
  { id: "lime", name: "Lime", hex: "#BBE90B", platePartNumber: "3024" },
  {
    id: "bright-green",
    name: "Bright Green",
    hex: "#4B9F4A",
    platePartNumber: "3024",
  },
  { id: "green", name: "Green", hex: "#237841", platePartNumber: "3024" },
  {
    id: "dark-green",
    name: "Dark Green",
    hex: "#184632",
    platePartNumber: "3024",
  },
  {
    id: "sand-green",
    name: "Sand Green",
    hex: "#A0BCAC",
    platePartNumber: "3024",
  },
  {
    id: "dark-turquoise",
    name: "Dark Turquoise",
    hex: "#008F9B",
    platePartNumber: "3024",
  },
  {
    id: "medium-azure",
    name: "Medium Azure",
    hex: "#36AEBF",
    platePartNumber: "3024",
  },
  {
    id: "medium-blue",
    name: "Medium Blue",
    hex: "#5A93DB",
    platePartNumber: "3024",
  },
  { id: "blue", name: "Blue", hex: "#0055BF", platePartNumber: "3024" },
  {
    id: "dark-blue",
    name: "Dark Blue",
    hex: "#003580",
    platePartNumber: "3024",
  },
  {
    id: "dark-azure",
    name: "Dark Azure",
    hex: "#078BC9",
    platePartNumber: "3024",
  },
  {
    id: "light-blue",
    name: "Light Blue",
    hex: "#9FC3E9",
    platePartNumber: "3024",
  },
  {
    id: "sand-blue",
    name: "Sand Blue",
    hex: "#7988A1",
    platePartNumber: "3024",
  },
  {
    id: "dark-purple",
    name: "Dark Purple",
    hex: "#2E1A47",
    platePartNumber: "3024",
  },
  { id: "purple", name: "Purple", hex: "#81007F", platePartNumber: "3024" },
  {
    id: "medium-lavender",
    name: "Medium Lavender",
    hex: "#AC78BA",
    platePartNumber: "3024",
  },
  { id: "lavender", name: "Lavender", hex: "#E1D5ED", platePartNumber: "3024" },
  {
    id: "dark-pink",
    name: "Dark Pink",
    hex: "#C870A0",
    platePartNumber: "3024",
  },
  {
    id: "bright-pink",
    name: "Bright Pink",
    hex: "#F9A7B0",
    platePartNumber: "3024",
  },
  { id: "magenta", name: "Magenta", hex: "#C870A0", platePartNumber: "3024" },
  { id: "salmon", name: "Salmon", hex: "#F2A58E", platePartNumber: "3024" },
  {
    id: "light-nougat",
    name: "Light Nougat",
    hex: "#F6D7B3",
    platePartNumber: "3024",
  },
  { id: "nougat", name: "Nougat", hex: "#D09168", platePartNumber: "3024" },
  {
    id: "medium-nougat",
    name: "Medium Nougat",
    hex: "#AA7D55",
    platePartNumber: "3024",
  },
  { id: "tan", name: "Tan", hex: "#E4CD9E", platePartNumber: "3024" },
  { id: "dark-tan", name: "Dark Tan", hex: "#958A73", platePartNumber: "3024" },
  {
    id: "reddish-brown",
    name: "Reddish Brown",
    hex: "#82422A",
    platePartNumber: "3024",
  },
  { id: "brown", name: "Brown", hex: "#583927", platePartNumber: "3024" },
  {
    id: "dark-brown",
    name: "Dark Brown",
    hex: "#352100",
    platePartNumber: "3024",
  },
] as const;

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

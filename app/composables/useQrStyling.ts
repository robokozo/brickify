import type {
  Brick,
  BrickLayout,
  BrickSize,
  BrickTypeCount,
} from "./useBrickConverter";
import { useBrickConverter } from "./useBrickConverter";

export type GradientDirection = "horizontal" | "vertical" | "diagonal" | "radial";
export type EyeShape = "square" | "round";

export interface QrStyleConfig {
  /** Shape of the dark modules in the three corner finder patterns */
  eyeShape: EyeShape;
  /** Separate color for the corner finder patterns (null = foreground color) */
  eyeColor: string | null;
  /** Foreground gradient toward this color (null = solid foreground) */
  gradient: {
    color: string;
    direction: GradientDirection;
  } | null;
}

export interface StyledColorGroup {
  colorHex: string;
  label: string;
  /** Group consists of round 1×1 pieces */
  round: boolean;
  counts: Array<BrickTypeCount>;
  total: number;
}

export interface StyledQrBuild {
  bricks: Array<Brick>;
  foregroundGroups: Array<StyledColorGroup>;
  backgroundCounts: Array<BrickTypeCount>;
  foregroundTotal: number;
  backgroundTotal: number;
  total: number;
  savingsPercent: number;
}

/** Number of discrete color bands a gradient is quantized into (physical
 * builds need a fixed set of orderable colors) */
export const GRADIENT_STEPS = 5;

const mixHex = (a: string, b: string, t: number): string => {
  const pa = a.replace("#", "");
  const pb = b.replace("#", "");
  const channel = (offset: number): string => {
    const ca = parseInt(pa.substring(offset, offset + 2), 16);
    const cb = parseInt(pb.substring(offset, offset + 2), 16);
    return Math.round(ca + (cb - ca) * t)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${channel(0)}${channel(2)}${channel(4)}`.toUpperCase();
};

/** The three 7×7 finder patterns sit in the top-left, top-right, and
 * bottom-left corners of every QR code */
const isEyeModule = (x: number, y: number, size: number): boolean =>
  (x < 7 && y < 7) || (x >= size - 7 && y < 7) || (x < 7 && y >= size - 7);

const gradientPosition = (
  x: number,
  y: number,
  size: number,
  direction: GradientDirection,
): number => {
  const max = size - 1;
  if (direction === "horizontal") return x / max;
  if (direction === "vertical") return y / max;
  if (direction === "diagonal") return (x + y) / (2 * max);
  // radial: distance from center, normalized to the corner distance
  const cx = max / 2;
  const cy = max / 2;
  return Math.hypot(x - cx, y - cy) / Math.hypot(cx, cy);
};

const emptyMask = (size: number): Array<Array<boolean>> =>
  Array.from({ length: size }, () => Array.from({ length: size }, () => false));

const maskLayout = (mask: Array<Array<boolean>>): BrickLayout => ({
  grid: mask,
  scale: 1,
  totalWidth: mask[0]?.length ?? 0,
  totalHeight: mask.length,
});

/** A dark module's resolved appearance (null = light module / background) */
export interface ModuleCell {
  hex: string;
  round: boolean;
}

const createModuleColorResolver = ({
  size,
  foreground,
  style,
}: {
  size: number;
  foreground: string;
  style: QrStyleConfig;
}): { moduleColor: (x: number, y: number) => string; bandHexes: Array<string> } => {
  // Precompute the gradient band colors so each band hex is stable
  const bandHexes: Array<string> =
    style.gradient !== null
      ? Array.from({ length: GRADIENT_STEPS }, (_, i) =>
          mixHex(foreground, style.gradient?.color ?? foreground, i / (GRADIENT_STEPS - 1)),
        )
      : [];

  const moduleColor = (x: number, y: number): string => {
    if (style.eyeColor !== null && isEyeModule(x, y, size)) {
      return style.eyeColor.toUpperCase();
    }
    if (style.gradient !== null) {
      const t = gradientPosition(x, y, size, style.gradient.direction);
      const band = Math.min(GRADIENT_STEPS - 1, Math.floor(t * GRADIENT_STEPS));
      return bandHexes[band] ?? foreground.toUpperCase();
    }
    return foreground.toUpperCase();
  };

  return { moduleColor, bandHexes };
};

export const useQrStyling = () => {
  const { optimizeBrickLayout } = useBrickConverter();

  const buildStyledQrBricks = ({
    matrix,
    foreground,
    style,
    foregroundSizes,
    backgroundSizes,
  }: {
    matrix: Array<Array<boolean>>;
    foreground: string;
    style: QrStyleConfig;
    foregroundSizes: Array<BrickSize>;
    backgroundSizes: Array<BrickSize>;
  }): StyledQrBuild => {
    const size = matrix.length;
    const { moduleColor, bandHexes } = createModuleColorResolver({
      size,
      foreground,
      style,
    });

    const labelFor = ({ hex, round }: { hex: string; round: boolean }): string => {
      if (round) return "Corner dots";
      if (style.eyeColor !== null && hex === style.eyeColor.toUpperCase()) {
        return "Corner markers";
      }
      if (style.gradient !== null) {
        const band = bandHexes.indexOf(hex);
        if (band >= 0) return `Gradient shade ${band + 1}`;
      }
      return "Foreground";
    };

    // Sort key so groups list as: solid/gradient shades first, corners last
    const orderFor = ({ hex, round }: { hex: string; round: boolean }): number => {
      if (round) return 1000;
      if (style.eyeColor !== null && hex === style.eyeColor.toUpperCase()) return 999;
      const band = bandHexes.indexOf(hex);
      return band >= 0 ? band : 0;
    };

    // Split the dark modules into masks, one per color (round eye cells are
    // kept apart since they must stay 1×1 and cannot be merged)
    interface GroupEntry {
      hex: string;
      round: boolean;
      mask: Array<Array<boolean>>;
      cellCount: number;
    }
    const entries = new Map<string, GroupEntry>();
    const roundEyes = style.eyeShape === "round";

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        if (matrix[y]?.[x] !== true) continue;
        const hex = moduleColor(x, y);
        const round = roundEyes && isEyeModule(x, y, size);
        const key = `${hex}|${round ? "r" : "s"}`;
        let entry = entries.get(key);
        if (entry === undefined) {
          entry = { hex, round, mask: emptyMask(size), cellCount: 0 };
          entries.set(key, entry);
        }
        const row = entry.mask[y];
        if (row !== undefined) row[x] = true;
        entry.cellCount++;
      }
    }

    const bricks: Array<Brick> = [];
    const foregroundGroups: Array<StyledColorGroup> = [];

    const sortedEntries = [...entries.values()].sort(
      (a, b) => orderFor(a) - orderFor(b),
    );

    for (const entry of sortedEntries) {
      if (entry.round === true) {
        // Round pieces are always 1×1, emit them directly
        for (let y = 0; y < size; y++) {
          for (let x = 0; x < size; x++) {
            if (entry.mask[y]?.[x] !== true) continue;
            bricks.push({
              width: 1,
              height: 1,
              x,
              y,
              panelCol: 0,
              panelRow: 0,
              isForeground: true,
              colorHex: entry.hex,
              isRound: true,
            });
          }
        }
        foregroundGroups.push({
          colorHex: entry.hex,
          label: labelFor(entry),
          round: true,
          counts: [{ width: 1, height: 1, count: entry.cellCount }],
          total: entry.cellCount,
        });
        continue;
      }

      const optimized = optimizeBrickLayout(
        maskLayout(entry.mask),
        foregroundSizes,
        [],
      );
      for (const brick of optimized.bricks) {
        if (brick.isForeground !== true) continue;
        bricks.push({ ...brick, colorHex: entry.hex });
      }
      foregroundGroups.push({
        colorHex: entry.hex,
        label: labelFor(entry),
        round: false,
        counts: optimized.foreground,
        total: optimized.foregroundTotal,
      });
    }

    // Background: optimize the inverted matrix as its own mask
    const bgMask = matrix.map((row) => row.map((cell) => cell !== true));
    const bgOptimized = optimizeBrickLayout(maskLayout(bgMask), backgroundSizes, []);
    for (const brick of bgOptimized.bricks) {
      if (brick.isForeground !== true) continue;
      bricks.push({ ...brick, isForeground: false, colorHex: null });
    }

    const foregroundTotal = foregroundGroups.reduce((sum, g) => sum + g.total, 0);
    const backgroundTotal = bgOptimized.foregroundTotal;
    const total = foregroundTotal + backgroundTotal;
    const naiveTotal = size * size;

    return {
      bricks,
      foregroundGroups,
      backgroundCounts: bgOptimized.foreground,
      foregroundTotal,
      backgroundTotal,
      total,
      savingsPercent:
        naiveTotal > 0 ? Math.round((1 - total / naiveTotal) * 100) : 0,
    };
  };

  /** Resolve every module to its final color/shape, as a scanner would see it */
  const buildModuleColorGrid = ({
    matrix,
    foreground,
    style,
  }: {
    matrix: Array<Array<boolean>>;
    foreground: string;
    style: QrStyleConfig;
  }): Array<Array<ModuleCell | null>> => {
    const size = matrix.length;
    const { moduleColor } = createModuleColorResolver({ size, foreground, style });
    const roundEyes = style.eyeShape === "round";
    return matrix.map((row, y) =>
      row.map((cell, x) =>
        cell === true
          ? {
              hex: moduleColor(x, y),
              round: roundEyes && isEyeModule(x, y, size),
            }
          : null,
      ),
    );
  };

  return { buildStyledQrBricks, buildModuleColorGrid };
};

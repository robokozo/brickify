import { useLegoPalette } from "~/composables/useLegoPalette";
import { useBrickConverter } from "~/composables/useBrickConverter";
import type { LegoColor } from "~/composables/useLegoPalette";
import type {
  BrickTypeCount,
  BrickSize,
} from "~/composables/useBrickConverter";

export const MOSAIC_SIZE = 48; // fixed 48×48 studs to match max baseplate

export interface MosaicColorGroup {
  colorId: string;
  color: LegoColor;
  bricks: BrickTypeCount[];
  positionedBricks: Brick[];
  total: number;
}

export interface MosaicResult {
  colorGrid: string[][]; // MOSAIC_SIZE × MOSAIC_SIZE — each cell is a LegoColor.id
  colorGroups: MosaicColorGroup[];
  totalPieces: number;
}

// --- Image sampling ---

const sampleImageToGrid = ({
  imageFile,
  useDithering,
}: {
  imageFile: File;
  useDithering: boolean;
}): Promise<string[][]> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    canvas.width = MOSAIC_SIZE;
    canvas.height = MOSAIC_SIZE;

    const ctx = canvas.getContext("2d");
    if (ctx === null) {
      reject(new Error("Canvas 2D context unavailable"));
      return;
    }

    const img = new Image();
    const url = URL.createObjectURL(imageFile);

    img.onload = () => {
      URL.revokeObjectURL(url);

      // Draw image scaled to MOSAIC_SIZE × MOSAIC_SIZE using cover crop
      const srcAspect = img.naturalWidth / img.naturalHeight;
      let sx = 0;
      let sy = 0;
      let sw = img.naturalWidth;
      let sh = img.naturalHeight;

      if (srcAspect > 1) {
        // Wider than tall — crop sides
        sw = img.naturalHeight;
        sx = Math.floor((img.naturalWidth - sw) / 2);
      } else if (srcAspect < 1) {
        // Taller than wide — crop top/bottom
        sh = img.naturalWidth;
        sy = Math.floor((img.naturalHeight - sh) / 2);
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, MOSAIC_SIZE, MOSAIC_SIZE);

      const { data } = ctx.getImageData(0, 0, MOSAIC_SIZE, MOSAIC_SIZE);
      const { findNearestColor } = useLegoPalette();

      if (useDithering === true) {
        // Work with a mutable float copy of RGB channels (ignore alpha)
        const floats = new Float32Array(MOSAIC_SIZE * MOSAIC_SIZE * 3);
        for (let i = 0; i < MOSAIC_SIZE * MOSAIC_SIZE; i++) {
          floats[i * 3 + 0] = data[i * 4 + 0] ?? 0;
          floats[i * 3 + 1] = data[i * 4 + 1] ?? 0;
          floats[i * 3 + 2] = data[i * 4 + 2] ?? 0;
        }

        const grid: string[][] = Array.from({ length: MOSAIC_SIZE }, () =>
          Array(MOSAIC_SIZE).fill(""),
        );

        for (let y = 0; y < MOSAIC_SIZE; y++) {
          for (let x = 0; x < MOSAIC_SIZE; x++) {
            const idx = (y * MOSAIC_SIZE + x) * 3;
            const r = Math.max(0, Math.min(255, floats[idx + 0] ?? 0));
            const g = Math.max(0, Math.min(255, floats[idx + 1] ?? 0));
            const b = Math.max(0, Math.min(255, floats[idx + 2] ?? 0));

            const nearest = findNearestColor({ r, g, b });
            const row = grid[y];
            if (row !== undefined) row[x] = nearest.id;

            // Floyd-Steinberg error diffusion
            const hexStr = nearest.hex.replace("#", "");
            const nr = parseInt(hexStr.slice(0, 2), 16);
            const ng = parseInt(hexStr.slice(2, 4), 16);
            const nb = parseInt(hexStr.slice(4, 6), 16);

            const er = r - nr;
            const eg = g - ng;
            const eb = b - nb;

            const distribute = (
              ox: number,
              oy: number,
              factor: number,
            ): void => {
              const nx = x + ox;
              const ny = y + oy;
              if (nx < 0 || nx >= MOSAIC_SIZE || ny < 0 || ny >= MOSAIC_SIZE)
                return;
              const ni = (ny * MOSAIC_SIZE + nx) * 3;
              floats[ni + 0] = (floats[ni + 0] ?? 0) + er * factor;
              floats[ni + 1] = (floats[ni + 1] ?? 0) + eg * factor;
              floats[ni + 2] = (floats[ni + 2] ?? 0) + eb * factor;
            };

            distribute(1, 0, 7 / 16);
            distribute(-1, 1, 3 / 16);
            distribute(0, 1, 5 / 16);
            distribute(1, 1, 1 / 16);
          }
        }

        resolve(grid);
      } else {
        // Nearest color only — no dithering
        const grid: string[][] = Array.from({ length: MOSAIC_SIZE }, () =>
          Array(MOSAIC_SIZE).fill(""),
        );

        for (let y = 0; y < MOSAIC_SIZE; y++) {
          for (let x = 0; x < MOSAIC_SIZE; x++) {
            const i = (y * MOSAIC_SIZE + x) * 4;
            const r = data[i + 0] ?? 0;
            const g = data[i + 1] ?? 0;
            const b = data[i + 2] ?? 0;
            const nearest = findNearestColor({ r, g, b });
            const row = grid[y];
            if (row !== undefined) row[x] = nearest.id;
          }
        }

        resolve(grid);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };

    img.src = url;
  });
};

// --- Parts list generation ---

const buildPartsList = ({
  colorGrid,
  brickSizes,
}: {
  colorGrid: string[][];
  brickSizes: BrickSize[];
}): MosaicColorGroup[] => {
  const { optimizeBrickLayout } = useBrickConverter();
  const { getColorById } = useLegoPalette();

  // Find unique color IDs present in the grid
  const colorIds = new Set<string>();
  for (const row of colorGrid) {
    for (const id of row) {
      if (id.length > 0) colorIds.add(id);
    }
  }

  const groups: MosaicColorGroup[] = [];

  for (const colorId of colorIds) {
    // Build a boolean grid: true = this color
    const boolGrid: boolean[][] = colorGrid.map((row) =>
      row.map((id) => id === colorId),
    );

    const layout = {
      grid: boolGrid,
      scale: 1,
      totalWidth: MOSAIC_SIZE,
      totalHeight: MOSAIC_SIZE,
    };

    // Run optimizer — only foreground (this color) bricks are used
    const optimized = optimizeBrickLayout(layout, brickSizes, []);

    const color = getColorById(colorId);
    if (color === null) continue;

    // Stamp each positioned brick with the color's hex so BuildingInstructions can render it
    const positionedBricks = optimized.bricks.map((b) => ({
      ...b,
      colorHex: color.hex,
    }));

    groups.push({
      colorId,
      color,
      bricks: optimized.foreground,
      positionedBricks,
      total: optimized.foregroundTotal,
    });
  }

  // Sort groups by piece count descending (most-used colors first)
  groups.sort((a, b) => b.total - a.total);

  return groups;
};

// --- Public composable ---

export const useMosaicConverter = () => {
  const convertImageToColorGrid = ({
    imageFile,
    useDithering,
  }: {
    imageFile: File;
    useDithering: boolean;
  }): Promise<string[][]> => sampleImageToGrid({ imageFile, useDithering });

  const generateMosaicPartsList = ({
    colorGrid,
    brickSizes,
  }: {
    colorGrid: string[][];
    brickSizes: BrickSize[];
  }): MosaicColorGroup[] => buildPartsList({ colorGrid, brickSizes });

  return { convertImageToColorGrid, generateMosaicPartsList };
};

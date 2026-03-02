import { useLegoPalette } from "~/composables/useLegoPalette";
import { useBrickConverter } from "~/composables/useBrickConverter";
import type { LegoColor } from "~/composables/useLegoPalette";
import type {
  Brick,
  BrickTypeCount,
  BrickSize,
} from "~/composables/useBrickConverter";

/** Studs on one physical 48×48 baseplate panel. */
export const PANEL_SIZE = 48;

/** @deprecated use PANEL_SIZE */
export const MOSAIC_SIZE = PANEL_SIZE;

export interface MosaicColorGroup {
  colorId: string;
  color: LegoColor;
  bricks: BrickTypeCount[];    // aggregate counts across all panels
  positionedBricks: Brick[];   // positioned within their respective panel
  total: number;
}

export interface MosaicResult {
  colorGrid: string[][];       // (panelRows*48) × (panelCols*48) grid of LegoColor.id
  colorGroups: MosaicColorGroup[];
  totalPieces: number;
}

// --- Image sampling ---

const sampleImageToGrid = ({
  imageFile,
  useDithering,
  panelCols = 1,
  panelRows = 1,
}: {
  imageFile: File;
  useDithering: boolean;
  panelCols?: number;
  panelRows?: number;
}): Promise<string[][]> => {
  return new Promise((resolve, reject) => {
    const totalW = panelCols * PANEL_SIZE;
    const totalH = panelRows * PANEL_SIZE;

    const canvas = document.createElement("canvas");
    canvas.width = totalW;
    canvas.height = totalH;

    const ctx = canvas.getContext("2d");
    if (ctx === null) {
      reject(new Error("Canvas 2D context unavailable"));
      return;
    }

    const img = new Image();
    const url = URL.createObjectURL(imageFile);

    img.onload = () => {
      URL.revokeObjectURL(url);

      // Cover-crop to match the target aspect ratio (panelCols : panelRows)
      const targetAspect = totalW / totalH;
      const srcAspect = img.naturalWidth / img.naturalHeight;
      let sx = 0;
      let sy = 0;
      let sw = img.naturalWidth;
      let sh = img.naturalHeight;

      if (srcAspect > targetAspect) {
        // Source is wider — crop sides
        sw = Math.round(img.naturalHeight * targetAspect);
        sx = Math.floor((img.naturalWidth - sw) / 2);
      } else if (srcAspect < targetAspect) {
        // Source is taller — crop top/bottom
        sh = Math.round(img.naturalWidth / targetAspect);
        sy = Math.floor((img.naturalHeight - sh) / 2);
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, totalW, totalH);

      const { data } = ctx.getImageData(0, 0, totalW, totalH);
      const { findNearestColor } = useLegoPalette();

      if (useDithering === true) {
        // Work with a mutable float copy of RGB channels (ignore alpha)
        const floats = new Float32Array(totalW * totalH * 3);
        for (let i = 0; i < totalW * totalH; i++) {
          floats[i * 3 + 0] = data[i * 4 + 0] ?? 0;
          floats[i * 3 + 1] = data[i * 4 + 1] ?? 0;
          floats[i * 3 + 2] = data[i * 4 + 2] ?? 0;
        }

        const grid: string[][] = Array.from({ length: totalH }, () =>
          Array(totalW).fill(""),
        );

        for (let y = 0; y < totalH; y++) {
          for (let x = 0; x < totalW; x++) {
            const idx = (y * totalW + x) * 3;
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
              if (nx < 0 || nx >= totalW || ny < 0 || ny >= totalH) return;
              const ni = (ny * totalW + nx) * 3;
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
        const grid: string[][] = Array.from({ length: totalH }, () =>
          Array(totalW).fill(""),
        );

        for (let y = 0; y < totalH; y++) {
          for (let x = 0; x < totalW; x++) {
            const i = (y * totalW + x) * 4;
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
  panelCols = 1,
  panelRows = 1,
}: {
  colorGrid: string[][];
  brickSizes: BrickSize[];
  panelCols?: number;
  panelRows?: number;
}): MosaicColorGroup[] => {
  const { optimizeBrickLayout } = useBrickConverter();
  const { getColorById } = useLegoPalette();

  // Collect all unique color IDs across the entire grid
  const colorIds = new Set<string>();
  for (const row of colorGrid) {
    for (const id of row) {
      if (id.length > 0) colorIds.add(id);
    }
  }

  // Pre-build per-color group shells
  const groupMap = new Map<string, MosaicColorGroup>();
  for (const colorId of colorIds) {
    const color = getColorById(colorId);
    if (color === null) continue;
    groupMap.set(colorId, { colorId, color, bricks: [], positionedBricks: [], total: 0 });
  }

  // Process each 48×48 panel independently — bricks cannot span panel boundaries
  for (let pr = 0; pr < panelRows; pr++) {
    for (let pc = 0; pc < panelCols; pc++) {
      // Extract this panel's PANEL_SIZE×PANEL_SIZE sub-grid
      const panelGrid: string[][] = [];
      for (let y = 0; y < PANEL_SIZE; y++) {
        const row: string[] = [];
        for (let x = 0; x < PANEL_SIZE; x++) {
          row.push(colorGrid[pr * PANEL_SIZE + y]?.[pc * PANEL_SIZE + x] ?? "");
        }
        panelGrid.push(row);
      }

      // Find colors present in this panel
      const panelColorIds = new Set<string>();
      for (const row of panelGrid) {
        for (const id of row) {
          if (id.length > 0) panelColorIds.add(id);
        }
      }

      for (const colorId of panelColorIds) {
        const group = groupMap.get(colorId);
        if (group === undefined) continue;

        // Boolean mask: true = this color
        const boolGrid: boolean[][] = panelGrid.map((row) =>
          row.map((id) => id === colorId),
        );

        const layout = {
          grid: boolGrid,
          scale: 1,
          totalWidth: PANEL_SIZE,
          totalHeight: PANEL_SIZE,
        };

        const optimized = optimizeBrickLayout(layout, brickSizes, []);

        // Stamp each brick with its panel coordinates and color
        const panelBricks: Brick[] = optimized.bricks.map((b) => ({
          ...b,
          panelCol: pc,
          panelRow: pr,
          colorHex: group.color.hex,
        }));

        group.positionedBricks.push(...panelBricks);
        group.total += optimized.foregroundTotal;

        // Merge brick-type counts into the aggregate list
        for (const btc of optimized.foreground) {
          const existing = group.bricks.find(
            (b) => b.width === btc.width && b.height === btc.height,
          );
          if (existing !== undefined) {
            existing.count += btc.count;
          } else {
            group.bricks.push({ ...btc });
          }
        }
      }
    }
  }

  // Return only colors that actually appear, sorted by piece count desc
  const groups = [...groupMap.values()].filter((g) => g.total > 0);
  groups.sort((a, b) => b.total - a.total);
  return groups;
};

// --- Public composable ---

export const useMosaicConverter = () => {
  const convertImageToColorGrid = ({
    imageFile,
    useDithering,
    panelCols = 1,
    panelRows = 1,
  }: {
    imageFile: File;
    useDithering: boolean;
    panelCols?: number;
    panelRows?: number;
  }): Promise<string[][]> =>
    sampleImageToGrid({ imageFile, useDithering, panelCols, panelRows });

  const generateMosaicPartsList = ({
    colorGrid,
    brickSizes,
    panelCols = 1,
    panelRows = 1,
  }: {
    colorGrid: string[][];
    brickSizes: BrickSize[];
    panelCols?: number;
    panelRows?: number;
  }): MosaicColorGroup[] =>
    buildPartsList({ colorGrid, brickSizes, panelCols, panelRows });

  return { convertImageToColorGrid, generateMosaicPartsList };
};

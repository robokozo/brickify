export interface BaseplateConfig {
  width: number;
  height: number;
}

export interface LegoLayout {
  grid: boolean[][];
  scale: number;
  totalWidth: number;
  totalHeight: number;
}

export interface Brick {
  width: number;
  height: number;
  x: number;
  y: number;
  isForeground: boolean;
}

export interface BrickTypeCount {
  width: number;
  height: number;
  count: number;
}

export interface BrickCount {
  foreground: number;
  background: number;
  total: number;
}

export interface OptimizedBrickCount {
  foreground: BrickTypeCount[];
  background: BrickTypeCount[];
  foregroundTotal: number;
  backgroundTotal: number;
  total: number;
  savingsPercent: number;
  bricks: Brick[]; // Add actual brick placements
}

export interface BrickSize {
  width: number;
  height: number;
}

export const useLegoConverter = () => {
  // Fixed baseplate size - 48x48 is required for QR codes
  const baseplateSize = 48;

  // All available brick/plate sizes (normalized: larger dimension first)
  // Used as defaults and for the selector
  const allBrickSizes: BrickSize[] = [
    { width: 8, height: 2 },
    { width: 6, height: 2 },
    { width: 4, height: 2 },
    { width: 4, height: 1 },
    { width: 3, height: 2 },
    { width: 3, height: 1 },
    { width: 2, height: 2 },
    { width: 2, height: 1 },
    { width: 1, height: 1 }, // Always included
  ];

  // Convert user-selected sizes to algorithm format (sorted by area, largest first)
  const getBrickSizesForOptimization = (
    selectedSizes: BrickSize[],
  ): BrickSize[] => {
    // Always include 1x1
    const sizes = [...selectedSizes, { width: 1, height: 1 }];

    // Remove duplicates and sort by area (largest first)
    const unique = sizes.filter(
      (size, index, self) =>
        index ===
        self.findIndex(
          (s) => s.width === size.width && s.height === size.height,
        ),
    );

    return unique.sort((a, b) => {
      const areaA = a.width * a.height;
      const areaB = b.width * b.height;
      if (areaB !== areaA) return areaB - areaA;
      return b.width - a.width;
    });
  };

  const getMaxScale = (
    qrSize: number,
    baseplateWidth: number,
    baseplateHeight: number,
  ): number => {
    if (baseplateWidth === 0 || baseplateHeight === 0) {
      return 1;
    }

    const maxScaleWidth = Math.floor(baseplateWidth / qrSize);
    const maxScaleHeight = Math.floor(baseplateHeight / qrSize);

    return Math.max(1, Math.min(maxScaleWidth, maxScaleHeight));
  };

  const convertToLegoLayout = (
    qrMatrix: boolean[][],
    scale: number = 1,
  ): LegoLayout => {
    const qrSize = qrMatrix.length;
    const totalSize = qrSize * scale;

    // Create scaled grid
    const grid: boolean[][] = [];

    for (let y = 0; y < totalSize; y++) {
      const row: boolean[] = [];
      for (let x = 0; x < totalSize; x++) {
        // Map scaled coordinates back to original QR coordinates
        const qrX = Math.floor(x / scale);
        const qrY = Math.floor(y / scale);
        row.push(qrMatrix[qrY]?.[qrX] ?? false);
      }
      grid.push(row);
    }

    return {
      grid,
      scale,
      totalWidth: totalSize,
      totalHeight: totalSize,
    };
  };

  const calculateBrickCount = (layout: LegoLayout): BrickCount => {
    let foreground = 0;
    let background = 0;

    for (const row of layout.grid) {
      for (const cell of row) {
        if (cell) {
          foreground++;
        } else {
          background++;
        }
      }
    }

    return {
      foreground,
      background,
      total: foreground + background,
    };
  };

  // Check if a brick can be placed at the given position
  const canPlaceBrick = (
    grid: boolean[][],
    used: boolean[][],
    x: number,
    y: number,
    width: number,
    height: number,
    isForeground: boolean,
  ): boolean => {
    // Check bounds
    const gridWidth = grid[0]?.length ?? 0;
    if (x + width > gridWidth || y + height > grid.length) {
      return false;
    }

    // Check if all cells match the color and are not used
    for (let dy = 0; dy < height; dy++) {
      for (let dx = 0; dx < width; dx++) {
        if (used[y + dy]?.[x + dx]) {
          return false;
        }
        if (grid[y + dy]?.[x + dx] !== isForeground) {
          return false;
        }
      }
    }

    return true;
  };

  // Mark cells as used by a brick
  const markBrickUsed = (
    used: boolean[][],
    x: number,
    y: number,
    width: number,
    height: number,
  ): void => {
    for (let dy = 0; dy < height; dy++) {
      for (let dx = 0; dx < width; dx++) {
        const row = used[y + dy];
        if (row) row[x + dx] = true;
      }
    }
  };

  // Optimize brick layout using greedy algorithm
  const optimizeBrickLayout = (
    layout: LegoLayout,
    availableSizes: BrickSize[] = [],
  ): OptimizedBrickCount => {
    const { grid } = layout;
    const height = grid.length;
    const width = grid[0]?.length ?? 0;

    // Get brick sizes to use (sorted by area, includes 1x1)
    const brickSizes = getBrickSizesForOptimization(availableSizes);

    // Track which cells have been covered
    const used: boolean[][] = Array(height)
      .fill(null)
      .map(() => Array(width).fill(false));

    // Count bricks by size
    const foregroundBricks: Map<string, number> = new Map();
    const backgroundBricks: Map<string, number> = new Map();

    // Store actual brick placements
    const bricks: Brick[] = [];

    // Greedy algorithm: try to place largest bricks first
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (used[y]?.[x]) continue;

        const isForeground = grid[y]?.[x] ?? false;
        const brickMap = isForeground ? foregroundBricks : backgroundBricks;

        // Try each brick size from largest to smallest
        let placed = false;
        for (const size of brickSizes) {
          // Try both orientations
          const orientations = [
            { w: size.width, h: size.height },
            { w: size.height, h: size.width },
          ];

          for (const { w, h } of orientations) {
            if (canPlaceBrick(grid, used, x, y, w, h, isForeground)) {
              markBrickUsed(used, x, y, w, h);
              // Normalize key: always use larger×smaller format (e.g., 4×1 not 1×4)
              const key = `${Math.max(w, h)}×${Math.min(w, h)}`;
              brickMap.set(key, (brickMap.get(key) || 0) + 1);
              // Store the brick placement
              bricks.push({
                width: w,
                height: h,
                x,
                y,
                isForeground,
              });
              placed = true;
              break;
            }
          }

          if (placed) break;
        }
      }
    }

    // Convert maps to sorted arrays
    const foregroundList: BrickTypeCount[] = Array.from(
      foregroundBricks.entries(),
    )
      .map(([size, count]) => {
        const parts = size.split("×").map(Number);
        return { width: parts[0] || 1, height: parts[1] || 1, count };
      })
      .sort((a, b) => {
        // Sort by brick area (larger first)
        const areaA = a.width * a.height;
        const areaB = b.width * b.height;
        if (areaB !== areaA) return areaB - areaA;
        return b.width - a.width;
      });

    const backgroundList: BrickTypeCount[] = Array.from(
      backgroundBricks.entries(),
    )
      .map(([size, count]) => {
        const parts = size.split("×").map(Number);
        return { width: parts[0] || 1, height: parts[1] || 1, count };
      })
      .sort((a, b) => {
        const areaA = a.width * a.height;
        const areaB = b.width * b.height;
        if (areaB !== areaA) return areaB - areaA;
        return b.width - a.width;
      });

    const foregroundTotal = foregroundList.reduce(
      (sum, item) => sum + item.count,
      0,
    );
    const backgroundTotal = backgroundList.reduce(
      (sum, item) => sum + item.count,
      0,
    );
    const total = foregroundTotal + backgroundTotal;

    // Calculate original (1×1 only) count for savings
    const originalCount = calculateBrickCount(layout);
    const savingsPercent = Math.round(
      ((originalCount.total - total) / originalCount.total) * 100,
    );

    return {
      foreground: foregroundList,
      background: backgroundList,
      foregroundTotal,
      backgroundTotal,
      total,
      savingsPercent,
      bricks,
    };
  };

  const validateFit = (
    qrSize: number,
    scale: number,
    baseplateWidth: number,
    baseplateHeight: number,
  ): { fits: boolean; requiredWidth: number; requiredHeight: number } => {
    const requiredWidth = qrSize * scale;
    const requiredHeight = qrSize * scale;

    const fits =
      requiredWidth <= baseplateWidth && requiredHeight <= baseplateHeight;

    return {
      fits,
      requiredWidth,
      requiredHeight,
    };
  };

  return {
    baseplateSize,
    allBrickSizes,
    getMaxScale,
    convertToLegoLayout,
    calculateBrickCount,
    optimizeBrickLayout,
    validateFit,
  };
};

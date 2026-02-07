export interface BaseplateConfig {
  width: number
  height: number
}

export interface LegoLayout {
  grid: boolean[][]
  scale: number
  totalWidth: number
  totalHeight: number
}

export interface Brick {
  width: number
  height: number
  x: number
  y: number
  isForeground: boolean
}

export interface BrickTypeCount {
  size: string
  count: number
}

export interface BrickCount {
  foreground: number
  background: number
  total: number
}

export interface OptimizedBrickCount {
  foreground: BrickTypeCount[]
  background: BrickTypeCount[]
  foregroundTotal: number
  backgroundTotal: number
  total: number
  savingsPercent: number
}

export const useLegoConverter = () => {
  // Common baseplate presets in studs
  const baseplatePresets = [
    { name: '16x16', width: 16, height: 16 },
    { name: '32x32', width: 32, height: 32 },
    { name: '48x48', width: 48, height: 48 },
    { name: 'Custom', width: 0, height: 0 },
  ]

  // Standard LEGO brick/plate sizes (width x height)
  // Prioritized from largest to smallest for greedy algorithm
  const standardBrickSizes = [
    { width: 2, height: 8 },
    { width: 2, height: 6 },
    { width: 2, height: 4 },
    { width: 2, height: 3 },
    { width: 2, height: 2 },
    { width: 1, height: 4 },
    { width: 1, height: 3 },
    { width: 1, height: 2 },
    { width: 1, height: 1 },
  ]

  const getMaxScale = (
    qrSize: number,
    baseplateWidth: number,
    baseplateHeight: number
  ): number => {
    if (baseplateWidth === 0 || baseplateHeight === 0) {
      return 1
    }
    
    const maxScaleWidth = Math.floor(baseplateWidth / qrSize)
    const maxScaleHeight = Math.floor(baseplateHeight / qrSize)
    
    return Math.max(1, Math.min(maxScaleWidth, maxScaleHeight))
  }

  const convertToLegoLayout = (
    qrMatrix: boolean[][],
    scale: number = 1
  ): LegoLayout => {
    const qrSize = qrMatrix.length
    const totalSize = qrSize * scale
    
    // Create scaled grid
    const grid: boolean[][] = []
    
    for (let y = 0; y < totalSize; y++) {
      const row: boolean[] = []
      for (let x = 0; x < totalSize; x++) {
        // Map scaled coordinates back to original QR coordinates
        const qrX = Math.floor(x / scale)
        const qrY = Math.floor(y / scale)
        row.push(qrMatrix[qrY][qrX])
      }
      grid.push(row)
    }
    
    return {
      grid,
      scale,
      totalWidth: totalSize,
      totalHeight: totalSize,
    }
  }

  const calculateBrickCount = (layout: LegoLayout): BrickCount => {
    let foreground = 0
    let background = 0
    
    for (const row of layout.grid) {
      for (const cell of row) {
        if (cell) {
          foreground++
        } else {
          background++
        }
      }
    }
    
    return {
      foreground,
      background,
      total: foreground + background,
    }
  }

  // Check if a brick can be placed at the given position
  const canPlaceBrick = (
    grid: boolean[][],
    used: boolean[][],
    x: number,
    y: number,
    width: number,
    height: number,
    isForeground: boolean
  ): boolean => {
    // Check bounds
    if (x + width > grid[0].length || y + height > grid.length) {
      return false
    }

    // Check if all cells match the color and are not used
    for (let dy = 0; dy < height; dy++) {
      for (let dx = 0; dx < width; dx++) {
        if (used[y + dy][x + dx]) {
          return false
        }
        if (grid[y + dy][x + dx] !== isForeground) {
          return false
        }
      }
    }

    return true
  }

  // Mark cells as used by a brick
  const markBrickUsed = (
    used: boolean[][],
    x: number,
    y: number,
    width: number,
    height: number
  ): void => {
    for (let dy = 0; dy < height; dy++) {
      for (let dx = 0; dx < width; dx++) {
        used[y + dy][x + dx] = true
      }
    }
  }

  // Optimize brick layout using greedy algorithm
  const optimizeBrickLayout = (layout: LegoLayout): OptimizedBrickCount => {
    const { grid } = layout
    const height = grid.length
    const width = grid[0].length

    // Track which cells have been covered
    const used: boolean[][] = Array(height).fill(null).map(() => Array(width).fill(false))
    
    // Count bricks by size
    const foregroundBricks: Map<string, number> = new Map()
    const backgroundBricks: Map<string, number> = new Map()

    // Greedy algorithm: try to place largest bricks first
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (used[y][x]) continue

        const isForeground = grid[y][x]
        const brickMap = isForeground ? foregroundBricks : backgroundBricks

        // Try each brick size from largest to smallest
        let placed = false
        for (const size of standardBrickSizes) {
          // Try both orientations
          const orientations = [
            { w: size.width, h: size.height },
            { w: size.height, h: size.width }
          ]

          for (const { w, h } of orientations) {
            if (canPlaceBrick(grid, used, x, y, w, h, isForeground)) {
              markBrickUsed(used, x, y, w, h)
              const key = `${w}×${h}`
              brickMap.set(key, (brickMap.get(key) || 0) + 1)
              placed = true
              break
            }
          }

          if (placed) break
        }
      }
    }

    // Convert maps to sorted arrays
    const foregroundList: BrickTypeCount[] = Array.from(foregroundBricks.entries())
      .map(([size, count]) => ({ size, count }))
      .sort((a, b) => {
        // Sort by brick area (larger first), then alphabetically
        const [aw, ah] = a.size.split('×').map(Number)
        const [bw, bh] = b.size.split('×').map(Number)
        const areaA = aw * ah
        const areaB = bw * bh
        if (areaB !== areaA) return areaB - areaA
        return a.size.localeCompare(b.size)
      })

    const backgroundList: BrickTypeCount[] = Array.from(backgroundBricks.entries())
      .map(([size, count]) => ({ size, count }))
      .sort((a, b) => {
        const [aw, ah] = a.size.split('×').map(Number)
        const [bw, bh] = b.size.split('×').map(Number)
        const areaA = aw * ah
        const areaB = bw * bh
        if (areaB !== areaA) return areaB - areaA
        return a.size.localeCompare(b.size)
      })

    const foregroundTotal = foregroundList.reduce((sum, item) => sum + item.count, 0)
    const backgroundTotal = backgroundList.reduce((sum, item) => sum + item.count, 0)
    const total = foregroundTotal + backgroundTotal

    // Calculate original (1×1 only) count for savings
    const originalCount = calculateBrickCount(layout)
    const savingsPercent = Math.round(((originalCount.total - total) / originalCount.total) * 100)

    return {
      foreground: foregroundList,
      background: backgroundList,
      foregroundTotal,
      backgroundTotal,
      total,
      savingsPercent
    }
  }

  const validateFit = (
    qrSize: number,
    scale: number,
    baseplateWidth: number,
    baseplateHeight: number
  ): { fits: boolean; requiredWidth: number; requiredHeight: number } => {
    const requiredWidth = qrSize * scale
    const requiredHeight = qrSize * scale
    
    const fits = requiredWidth <= baseplateWidth && requiredHeight <= baseplateHeight
    
    return {
      fits,
      requiredWidth,
      requiredHeight,
    }
  }

  return {
    baseplatePresets,
    getMaxScale,
    convertToLegoLayout,
    calculateBrickCount,
    optimizeBrickLayout,
    validateFit,
  }
}

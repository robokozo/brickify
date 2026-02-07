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
    validateFit,
  }
}

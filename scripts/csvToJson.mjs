// Converts app/assets/colors.csv → app/assets/colors.json
import { readFileSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const csvPath = resolve(__dirname, '../app/assets/colors.csv')
const jsonPath = resolve(__dirname, '../app/assets/colors.json')

const lines = readFileSync(csvPath, 'utf8').trim().split('\n')
const [header, ...rows] = lines
const keys = header.split(',')

const colors = rows.map(line => {
  // Split carefully — no quotes in this CSV, so simple split is fine
  const [id, name, rgb, is_trans, num_parts, num_sets, y1, y2] = line.split(',')
  return {
    rebrickableId: parseInt(id, 10),
    name: name.trim(),
    hex: `#${rgb.trim().toUpperCase()}`,
    isTransparent: is_trans.trim() === 'True',
    numParts: parseInt(num_parts, 10) || 0,
    yearFrom: y1 ? parseInt(y1, 10) : null,
    yearTo: y2 ? parseInt(y2, 10) : null,
  }
})

writeFileSync(jsonPath, JSON.stringify(colors, null, 2))
console.log(`✓ Wrote ${colors.length} colors to ${jsonPath}`)

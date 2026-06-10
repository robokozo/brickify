<script setup lang="ts">
import { computed, shallowRef, watch, onUnmounted, markRaw } from 'vue'
import { TresCanvas } from '@tresjs/core'
import { OrbitControls } from '@tresjs/cientos'
import {
  Group,
  Matrix4,
  Color,
  InstancedMesh,
  BoxGeometry,
  CylinderGeometry,
  MeshStandardMaterial,
  Mesh,
  EdgesGeometry,
  LineSegments,
  LineBasicMaterial,
  type BufferGeometry,
  type Material,
} from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { PANEL_SIZE } from '~/composables/useMosaicConverter'
import type { Brick } from '~/composables/useBrickConverter'

const props = withDefaults(defineProps<{
  bricks: Array<Brick>
  panelCols?: number
  panelRows?: number
  /** Studs per physical panel/baseplate edge */
  panelSize?: number
  /** Color fallbacks for bricks without an explicit colorHex (QR codes) */
  foreground?: string
  background?: string
  /** Render studs on foreground / background bricks (false = smooth tile) */
  studsForeground?: boolean
  studsBackground?: boolean
  baseplateColor?: string
  /** Stud offset of the brick layout within the panel (QR alignment) */
  offsetX?: number
  offsetY?: number
  /** Bricks to outline in red, booklet-style ("place these now") */
  highlightBricks?: Array<Brick>
}>(), {
  panelCols: 1,
  panelRows: 1,
  panelSize: PANEL_SIZE,
  foreground: '#000000',
  background: '#FFFFFF',
  studsForeground: true,
  studsBackground: true,
  baseplateColor: '#a0a5a9',
  offsetX: 0,
  offsetY: 0,
  highlightBricks: () => [],
})

// All sizes in stud units (1 unit = 8mm stud pitch)
const PLATE_HEIGHT = 0.4 // 3.2mm / 8mm
const STUD_RADIUS = 0.3 // 4.8mm diameter
const STUD_HEIGHT = 0.21 // ~1.7mm
const BASEPLATE_HEIGHT = 0.25
const PANEL_GAP = 0.75 // visual gap between physical panels
const BRICK_BEVEL = 0.06

const totalWidth = computed(
  () => props.panelCols * props.panelSize + (props.panelCols - 1) * PANEL_GAP,
)
const totalDepth = computed(
  () => props.panelRows * props.panelSize + (props.panelRows - 1) * PANEL_GAP,
)
const extent = computed(() => Math.max(totalWidth.value, totalDepth.value))

const cameraPosition = computed<[number, number, number]>(() => [
  0,
  extent.value * 0.85,
  extent.value * 1.05,
])

const colorCache = new Map<string, Color>()

function getColor({ hex }: { hex: string }): Color {
  const cached = colorCache.get(hex)
  if (cached !== undefined) return cached
  const color = new Color(hex)
  colorCache.set(hex, color)
  return color
}

function resolveBrickHex({ brick }: { brick: Brick }): string {
  if (brick.colorHex !== undefined && brick.colorHex !== null) {
    return brick.colorHex
  }
  return brick.isForeground === true ? props.foreground : props.background
}

function resolveBrickColor({ brick }: { brick: Brick }): Color {
  return getColor({ hex: resolveBrickHex({ brick }) })
}

// Studs are tinted toward a contrast color (darker on light bricks, lighter
// on dark bricks) so they stay readable regardless of lighting. Same
// treatment and strength as the flat views.
const studColorCache = new Map<string, Color>()

function getStudColor({ hex }: { hex: string }): Color {
  const cached = studColorCache.get(hex)
  if (cached !== undefined) return cached
  const raw = hex.replace('#', '')
  const r = parseInt(raw.substring(0, 2), 16)
  const g = parseInt(raw.substring(2, 4), 16)
  const b = parseInt(raw.substring(4, 6), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  const color = luminance > 0.5
    ? new Color(`rgb(${Math.round(r * 0.7)}, ${Math.round(g * 0.7)}, ${Math.round(b * 0.7)})`)
    : new Color(`rgb(${Math.min(255, r + 70)}, ${Math.min(255, g + 70)}, ${Math.min(255, b + 70)})`)
  studColorCache.set(hex, color)
  return color
}

function resolveStudColor({ brick }: { brick: Brick }): Color {
  return getStudColor({ hex: resolveBrickHex({ brick }) })
}

function hasStuds({ brick }: { brick: Brick }): boolean {
  return brick.isForeground === true || brick.colorHex != null
    ? props.studsForeground
    : props.studsBackground
}

function panelOffsetX({ panelCol }: { panelCol: number }): number {
  return panelCol * (props.panelSize + PANEL_GAP) - totalWidth.value / 2
}

function panelOffsetZ({ panelRow }: { panelRow: number }): number {
  return panelRow * (props.panelSize + PANEL_GAP) - totalDepth.value / 2
}

function buildScene(): Group {
  const group = new Group()
  const matrix = new Matrix4()

  const brickMaterial = new MeshStandardMaterial({
    roughness: 0.35,
    metalness: 0,
  })

  // Baseplates: one per physical panel
  const baseplateGeometry = new BoxGeometry(
    props.panelSize,
    BASEPLATE_HEIGHT,
    props.panelSize,
  )
  const baseplateMaterial = new MeshStandardMaterial({
    color: props.baseplateColor,
    roughness: 0.6,
    metalness: 0,
  })
  for (let pr = 0; pr < props.panelRows; pr++) {
    for (let pc = 0; pc < props.panelCols; pc++) {
      const plate = new Mesh(baseplateGeometry, baseplateMaterial)
      plate.position.set(
        panelOffsetX({ panelCol: pc }) + props.panelSize / 2,
        -BASEPLATE_HEIGHT / 2,
        panelOffsetZ({ panelRow: pr }) + props.panelSize / 2,
      )
      group.add(plate)
    }
  }

  // Group bricks by footprint (and shape) so each variant shares one geometry
  const bySize = new Map<string, Array<Brick>>()
  for (const brick of props.bricks) {
    const key = `${brick.width}x${brick.height}${brick.isRound === true ? 'r' : ''}`
    const list = bySize.get(key)
    if (list !== undefined) {
      list.push(brick)
    } else {
      bySize.set(key, [brick])
    }
  }

  let studCount = 0
  const coveredCells = new Set<string>()
  for (const brick of props.bricks) {
    for (let cy = 0; cy < brick.height; cy++) {
      for (let cx = 0; cx < brick.width; cx++) {
        coveredCells.add(
          `${brick.panelCol}|${brick.panelRow}|${props.offsetX + brick.x + cx}|${props.offsetY + brick.y + cy}`,
        )
      }
    }
  }

  for (const [, bricks] of bySize) {
    const first = bricks[0]
    if (first === undefined) continue

    // Round 1×1 pieces are cylinders; everything else is a beveled box
    const geometry = first.isRound === true
      ? new CylinderGeometry(0.47, 0.47, PLATE_HEIGHT, 20)
      : new RoundedBoxGeometry(
        first.width,
        PLATE_HEIGHT,
        first.height,
        2,
        BRICK_BEVEL,
      )
    const mesh = new InstancedMesh(geometry, brickMaterial, bricks.length)

    bricks.forEach((brick, i) => {
      const x = panelOffsetX({ panelCol: brick.panelCol })
        + props.offsetX + brick.x + brick.width / 2
      const z = panelOffsetZ({ panelRow: brick.panelRow })
        + props.offsetY + brick.y + brick.height / 2
      matrix.setPosition(x, PLATE_HEIGHT / 2, z)
      mesh.setMatrixAt(i, matrix)
      mesh.setColorAt(i, resolveBrickColor({ brick }))
      if (hasStuds({ brick }) === true) studCount += brick.width * brick.height
    })

    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor !== null) mesh.instanceColor.needsUpdate = true
    group.add(mesh)
  }

  // Baseplate studs: every cell not covered by a brick shows the plate's own
  // studs (covered cells would be hidden inside the bricks)
  const baseplateStudCells: Array<{ x: number; z: number }> = []
  for (let pr = 0; pr < props.panelRows; pr++) {
    for (let pc = 0; pc < props.panelCols; pc++) {
      const ox = panelOffsetX({ panelCol: pc })
      const oz = panelOffsetZ({ panelRow: pr })
      for (let cy = 0; cy < props.panelSize; cy++) {
        for (let cx = 0; cx < props.panelSize; cx++) {
          if (coveredCells.has(`${pc}|${pr}|${cx}|${cy}`) === false) {
            baseplateStudCells.push({ x: ox + cx + 0.5, z: oz + cy + 0.5 })
          }
        }
      }
    }
  }

  // Studs: one instanced cylinder per covered cell of studded bricks plus one
  // per exposed baseplate cell. Glossier than the brick body so they catch a
  // specular highlight
  const totalStuds = studCount + baseplateStudCells.length
  if (totalStuds > 0) {
    const studMaterial = new MeshStandardMaterial({
      roughness: 0.2,
      metalness: 0,
    })
    const studGeometry = new CylinderGeometry(
      STUD_RADIUS,
      STUD_RADIUS,
      STUD_HEIGHT,
      14,
    )
    const studs = new InstancedMesh(studGeometry, studMaterial, totalStuds)

    let i = 0
    for (const brick of props.bricks) {
      if (hasStuds({ brick }) === false) continue
      const color = resolveStudColor({ brick })
      const baseX = panelOffsetX({ panelCol: brick.panelCol }) + props.offsetX + brick.x
      const baseZ = panelOffsetZ({ panelRow: brick.panelRow }) + props.offsetY + brick.y
      for (let cy = 0; cy < brick.height; cy++) {
        for (let cx = 0; cx < brick.width; cx++) {
          matrix.setPosition(
            baseX + cx + 0.5,
            PLATE_HEIGHT + STUD_HEIGHT / 2,
            baseZ + cy + 0.5,
          )
          studs.setMatrixAt(i, matrix)
          studs.setColorAt(i, color)
          i++
        }
      }
    }

    const baseplateStudColor = getStudColor({ hex: props.baseplateColor })
    for (const cell of baseplateStudCells) {
      matrix.setPosition(cell.x, STUD_HEIGHT / 2, cell.z)
      studs.setMatrixAt(i, matrix)
      studs.setColorAt(i, baseplateStudColor)
      i++
    }

    studs.instanceMatrix.needsUpdate = true
    if (studs.instanceColor !== null) studs.instanceColor.needsUpdate = true
    group.add(studs)
  }

  // Booklet-style highlight: red outline around the pieces placed this step
  if (props.highlightBricks.length > 0) {
    const outlineMaterial = new LineBasicMaterial({ color: '#e3000b' })
    for (const brick of props.highlightBricks) {
      const box = new BoxGeometry(
        brick.width + 0.06,
        PLATE_HEIGHT + STUD_HEIGHT + 0.06,
        brick.height + 0.06,
      )
      const edges = new EdgesGeometry(box)
      box.dispose()
      const outline = new LineSegments(edges, outlineMaterial)
      outline.position.set(
        panelOffsetX({ panelCol: brick.panelCol }) + props.offsetX + brick.x + brick.width / 2,
        (PLATE_HEIGHT + STUD_HEIGHT) / 2,
        panelOffsetZ({ panelRow: brick.panelRow }) + props.offsetY + brick.y + brick.height / 2,
      )
      group.add(outline)
    }
  }

  return group
}

function disposeGroup({ group }: { group: Group }): void {
  const geometries = new Set<BufferGeometry>()
  const materials = new Set<Material>()
  group.traverse((obj) => {
    if (obj instanceof Mesh || obj instanceof InstancedMesh || obj instanceof LineSegments) {
      geometries.add(obj.geometry)
      if (obj.material instanceof Array) {
        for (const m of obj.material) materials.add(m)
      } else {
        materials.add(obj.material)
      }
      if (obj instanceof InstancedMesh) obj.dispose()
    }
  })
  for (const g of geometries) g.dispose()
  for (const m of materials) m.dispose()
}

const sceneGroup = shallowRef<Group>(markRaw(new Group()))

// cientos OrbitControls exposes the raw three.js controls as `instance`;
// reset() restores the camera pose saved when the controls were created
const controls = shallowRef<{ instance?: { reset?: () => void } } | null>(null)

const resetCamera = (): void => {
  controls.value?.instance?.reset?.()
}

watch(
  [
    () => props.bricks,
    () => props.studsForeground,
    () => props.studsBackground,
    () => props.panelCols,
    () => props.panelRows,
    () => props.panelSize,
    () => props.foreground,
    () => props.background,
    () => props.baseplateColor,
    () => props.offsetX,
    () => props.offsetY,
    () => props.highlightBricks,
  ],
  () => {
    disposeGroup({ group: sceneGroup.value })
    sceneGroup.value = markRaw(buildScene())
  },
  { immediate: true },
)

onUnmounted(() => {
  disposeGroup({ group: sceneGroup.value })
})
</script>

<template>
  <div class="relative w-full h-full">
    <TresCanvas clear-color="#e9eef5" :antialias="true">
      <TresPerspectiveCamera :position="cameraPosition" :fov="40" />
      <OrbitControls ref="controls" :enable-damping="true" :max-polar-angle="1.5" :min-distance="extent * 0.25"
        :max-distance="extent * 3" />
      <TresHemisphereLight :args="['#ffffff', '#c8ccd4', 0.9]" />
      <TresDirectionalLight :position="[extent * 0.6, extent * 1.2, extent * 0.8]" :intensity="1.3" />
      <TresDirectionalLight :position="[-extent * 0.8, extent * 0.5, -extent * 0.6]" :intensity="0.4" />
      <!-- Overhead spotlight: a soft hotspot that makes the glossy studs pop -->
      <TresSpotLight :position="[0, extent * 1.8, extent * 0.4]" :intensity="0.7" :angle="0.45" :penumbra="0.7"
        :decay="0" />
      <primitive :object="sceneGroup" />
    </TresCanvas>
    <button type="button"
      class="absolute top-2 right-2 z-10 text-xs font-semibold text-gray-600 bg-white/80 backdrop-blur px-2.5 py-1.5 rounded-full shadow hover:bg-white hover:text-gray-900 transition-colors"
      @click="resetCamera">
      ⟲ Reset view
    </button>
  </div>
</template>

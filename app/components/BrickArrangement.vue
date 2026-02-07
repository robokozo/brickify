<template>
  <div class="brick-arrangement">
    <h2 class="section-title">🧱 Brick Arrangement</h2>

    <div class="controls">
      <div class="scale-selector">
        <label for="scale">Scale Factor:</label>
        <select
          id="scale"
          v-model.number="selectedScale"
          class="form-input"
          @change="$emit('update:scale', selectedScale)"
        >
          <option
            v-for="s in availableScales"
            :key="s"
            :value="s"
          >
            {{ s }}x ({{ qrSize * s }} × {{ qrSize * s }} studs)
          </option>
        </select>
      </div>

      <div v-if="!fitsOnBaseplate" class="warning-message">
        ⚠️ Warning: This scale ({{ totalSize }}×{{ totalSize }}) exceeds your baseplate dimensions ({{ baseplateWidth }}×{{ baseplateHeight }})
      </div>
    </div>

    <div class="grid-container">
      <div 
        class="grid"
        :style="{
          gridTemplateColumns: `repeat(${totalSize}, 1fr)`,
          maxWidth: `${Math.min(totalSize * cellSize, 600)}px`,
          maxHeight: `${Math.min(totalSize * cellSize, 600)}px`,
        }"
      >
        <template v-for="(row, y) in grid" :key="`row-${y}`">
          <div
            v-for="(cell, x) in row"
            :key="`cell-${y}-${x}`"
            class="cell"
            :class="{ 'cell-dark': cell, 'cell-light': !cell }"
            :style="{
              background: cell ? foreground : background,
            }"
            :title="`Row ${y + 1}, Col ${x + 1}`"
          />
        </template>
      </div>
    </div>

    <div class="grid-info">
      <p><strong>Grid Size:</strong> {{ totalSize }} × {{ totalSize }} studs</p>
      <p><strong>Each brick:</strong> 1×1 plate/tile</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  grid: boolean[][]
  qrSize: number
  scale: number
  maxScale: number
  foreground: string
  background: string
  baseplateWidth: number
  baseplateHeight: number
}>()

const emit = defineEmits<{
  (e: 'update:scale', value: number): void
}>()

const selectedScale = ref(props.scale)

const availableScales = computed(() => {
  const scales = []
  for (let i = 1; i <= Math.min(props.maxScale, 4); i++) {
    scales.push(i)
  }
  return scales
})

const totalSize = computed(() => props.qrSize * selectedScale.value)

const fitsOnBaseplate = computed(() => {
  return totalSize.value <= props.baseplateWidth && 
         totalSize.value <= props.baseplateHeight
})

const cellSize = computed(() => {
  // Dynamically adjust cell size based on total grid size
  if (totalSize.value <= 32) return 16
  if (totalSize.value <= 48) return 12
  if (totalSize.value <= 64) return 8
  return 6
})
</script>

<style scoped>
.brick-arrangement {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.section-title {
  margin: 0 0 1.5rem 0;
  color: #2c3e50;
  font-size: 1.5rem;
  font-weight: 600;
}

.controls {
  margin-bottom: 1.5rem;
}

.scale-selector {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.scale-selector label {
  color: #34495e;
  font-weight: 500;
}

.form-input {
  padding: 0.5rem 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 1rem;
  background: white;
  cursor: pointer;
}

.form-input:focus {
  outline: none;
  border-color: #3498db;
}

.warning-message {
  padding: 0.75rem;
  background: #fff3cd;
  border-left: 4px solid #ffc107;
  border-radius: 4px;
  color: #856404;
  font-size: 0.95rem;
}

.grid-container {
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
  overflow: auto;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 6px;
}

.grid {
  display: grid;
  gap: 1px;
  background: #999;
  border: 2px solid #666;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.cell {
  aspect-ratio: 1;
  min-width: 4px;
  min-height: 4px;
  transition: transform 0.1s;
}

.cell:hover {
  transform: scale(1.1);
  z-index: 1;
  box-shadow: 0 0 0 2px #3498db;
}

.grid-info {
  padding: 1rem;
  background: #e8f4f8;
  border-left: 4px solid #3498db;
  border-radius: 4px;
}

.grid-info p {
  margin: 0.5rem 0;
  color: #2c3e50;
  font-size: 0.95rem;
}

.grid-info strong {
  color: #1a5490;
}
</style>

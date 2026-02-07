<template>
  <div class="brick-list">
    <h2 class="section-title">📋 Parts List</h2>

    <div class="brick-items">
      <div class="brick-item">
        <div class="brick-preview" :style="{ background: foreground }"></div>
        <div class="brick-details">
          <div class="brick-type">1×1 Plate/Tile</div>
          <div class="brick-color">Foreground Color</div>
          <div class="brick-quantity">{{ brickCount.foreground }} pieces</div>
        </div>
      </div>

      <div class="brick-item">
        <div class="brick-preview" :style="{ background: background }"></div>
        <div class="brick-details">
          <div class="brick-type">1×1 Plate/Tile</div>
          <div class="brick-color">Background Color</div>
          <div class="brick-quantity">{{ brickCount.background }} pieces</div>
        </div>
      </div>
    </div>

    <div class="total-count">
      <strong>Total pieces needed:</strong> {{ brickCount.total }}
    </div>

    <div class="shopping-tips">
      <h3>💡 Shopping Tips</h3>
      <ul>
        <li>1×1 plates are approximately 3.2mm thick</li>
        <li>1×1 tiles have a smooth top surface (recommended for finished look)</li>
        <li>Consider ordering 5-10% extra pieces for any mistakes</li>
        <li>Both foreground and background pieces should be opaque for best scanning results</li>
      </ul>
    </div>

    <div class="action-buttons">
      <button class="btn btn-primary" @click="printPartsList">
        🖨️ Print Parts List
      </button>
      <button class="btn btn-secondary" @click="copyPartsList">
        📋 Copy to Clipboard
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { BrickCount } from '~/composables/useLegoConverter'

const props = defineProps<{
  brickCount: BrickCount
  foreground: string
  background: string
}>()

const printPartsList = () => {
  const printContent = `
LEGO WiFi QR Code - Parts List
================================

Foreground (Dark modules):
- Part: 1×1 Plate/Tile
- Color: ${props.foreground}
- Quantity: ${props.brickCount.foreground} pieces

Background (Light modules):
- Part: 1×1 Plate/Tile
- Color: ${props.background}
- Quantity: ${props.brickCount.background} pieces

Total pieces needed: ${props.brickCount.total}

Shopping Tips:
- Order 5-10% extra pieces for any mistakes
- Both colors should be opaque for best scanning
- 1×1 tiles have smooth tops (recommended)
- 1×1 plates are 3.2mm thick
  `.trim()

  const printWindow = window.open('', '_blank')
  if (printWindow) {
    printWindow.document.write(`
      <html>
        <head>
          <title>LEGO WiFi QR Code - Parts List</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              padding: 2rem;
              max-width: 800px;
              margin: 0 auto;
            }
            pre { 
              white-space: pre-wrap; 
              background: #f5f5f5;
              padding: 1rem;
              border-radius: 4px;
            }
            @media print {
              body { padding: 1rem; }
            }
          </style>
        </head>
        <body>
          <pre>${printContent}</pre>
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
  }
}

const copyPartsList = async () => {
  const text = `LEGO WiFi QR Code - Parts List

Foreground: ${props.brickCount.foreground} × 1×1 Plate/Tile (${props.foreground})
Background: ${props.brickCount.background} × 1×1 Plate/Tile (${props.background})
Total: ${props.brickCount.total} pieces`

  try {
    await navigator.clipboard.writeText(text)
    alert('Parts list copied to clipboard!')
  } catch (err) {
    console.error('Failed to copy:', err)
    alert('Failed to copy to clipboard')
  }
}
</script>

<style scoped>
.brick-list {
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

.brick-items {
  display: grid;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.brick-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
}

.brick-preview {
  width: 60px;
  height: 60px;
  border-radius: 6px;
  border: 2px solid #999;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.brick-details {
  flex: 1;
}

.brick-type {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.25rem;
}

.brick-color {
  color: #7f8c8d;
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
}

.brick-quantity {
  color: #3498db;
  font-weight: 500;
  font-size: 1.1rem;
}

.total-count {
  padding: 1rem;
  background: #e8f4f8;
  border-left: 4px solid #3498db;
  border-radius: 4px;
  margin-bottom: 1.5rem;
  color: #2c3e50;
  font-size: 1.1rem;
}

.shopping-tips {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #fff9e6;
  border-radius: 6px;
  border-left: 4px solid #f39c12;
}

.shopping-tips h3 {
  margin: 0 0 0.75rem 0;
  color: #2c3e50;
  font-size: 1.1rem;
}

.shopping-tips ul {
  margin: 0;
  padding-left: 1.5rem;
  color: #34495e;
}

.shopping-tips li {
  margin: 0.5rem 0;
  font-size: 0.95rem;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary {
  background: #3498db;
  color: white;
}

.btn-primary:hover {
  background: #2980b9;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(52, 152, 219, 0.3);
}

.btn-secondary {
  background: #95a5a6;
  color: white;
}

.btn-secondary:hover {
  background: #7f8c8d;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(149, 165, 166, 0.3);
}
</style>

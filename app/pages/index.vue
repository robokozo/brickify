<script setup lang="ts">
interface ToolCard {
  to: string
  title: string
  description: string
  colorClass: string
}

const tools: ToolCard[] = [
  {
    to: '/qr',
    title: 'QR Code Builder',
    description: 'Turn WiFi logins, links, and contacts into scannable brick QR codes',
    colorClass: 'bg-brick-red',
  },
  {
    to: '/mosaic',
    title: 'Mosaic Builder',
    description: 'Turn any photo into a brick mosaic with full building instructions',
    colorClass: 'bg-brick-blue',
  },
]
</script>

<template>
  <UContainer class="py-16 max-w-4xl">
    <header class="text-center mb-14">
      <h1 class="text-4xl md:text-5xl font-black text-gray-900 leading-tight mb-4">
        Build photos &amp; QR codes<br class="hidden md:block" />
        out of <span class="text-brick-red">b</span><span class="text-brick-yellow">r</span><span
          class="text-brick-blue">i</span><span class="text-brick-green">c</span><span
          class="text-brick-red">k</span><span class="text-brick-blue">s</span>
      </h1>
      <p class="text-lg text-gray-600 max-w-xl mx-auto">
        Pick a builder, customise your design, and get a 3D preview, a parts list, and
        step-by-step instructions, ready to order and build.
      </p>
    </header>

    <div class="grid sm:grid-cols-2 gap-8">
      <NuxtLink v-for="tool in tools" :key="tool.to" :to="tool.to" class="group block">
        <!-- 2×4 brick -->
        <div :class="[
          'rounded-2xl px-6 pt-5 pb-8 transition-transform duration-150 group-hover:-translate-y-1.5 shadow-xl',
          tool.colorClass,
        ]" style="box-shadow: inset 0 -10px 0 rgb(0 0 0 / 0.18), 0 20px 25px -5px rgb(0 0 0 / 0.2)">
          <div class="grid grid-cols-4 gap-3 mb-6">
            <div v-for="n in 8" :key="n" class="stud aspect-square w-full max-w-12 mx-auto" />
          </div>
          <h2 class="text-white text-2xl font-black text-center">{{ tool.title }}</h2>
          <p class="text-white/85 text-sm font-semibold text-center mt-1.5">{{ tool.description }}</p>
        </div>
      </NuxtLink>
    </div>
  </UContainer>
</template>

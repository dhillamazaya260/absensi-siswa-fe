<script setup>
import { ref } from 'vue'
import { Monitor, LayoutDashboard } from 'lucide-vue-next'
import AdminView from './views/AdminView.vue'
// Uncomment saat KioskView sudah tersedia:
// import KioskView from './views/KioskView.vue'

const activeView = ref('admin')
</script>

<template>
  <!--
    data-theme="dark" → pakai tema DaisyUI dark.
    Ganti ke "light" jika butuh tema terang.
  -->
  <div data-theme="dark" class="min-h-screen bg-base-200">

    <!-- Global top navbar: Kiosk ↔ Admin switcher -->
    <nav class="fixed top-0 inset-x-0 z-20 h-10 bg-base-100/90 backdrop-blur-sm border-b border-base-300/60 flex items-center px-4 gap-3">
      <span class="text-xs font-bold text-base-content/60 tracking-wide mr-1">
        ABSENSI SISWA
      </span>

      <div class="flex gap-1">
        <button
          class="btn btn-xs gap-1.5"
          :class="activeView === 'kiosk' ? 'btn-primary' : 'btn-ghost text-base-content/60'"
          @click="activeView = 'kiosk'"
        >
          <Monitor class="w-3.5 h-3.5" />
          Kiosk
        </button>
        <button
          class="btn btn-xs gap-1.5"
          :class="activeView === 'admin' ? 'btn-primary' : 'btn-ghost text-base-content/60'"
          @click="activeView = 'admin'"
        >
          <LayoutDashboard class="w-3.5 h-3.5" />
          Admin
        </button>
      </div>
    </nav>

    <!-- Page content with top offset for fixed nav -->
    <div class="pt-10">
      <!--
        Kiosk View — implementasikan di KioskView.vue
        <KioskView v-if="activeView === 'kiosk'" />
      -->
      <div
        v-if="activeView === 'kiosk'"
        class="flex items-center justify-center min-h-[calc(100vh-2.5rem)] text-base-content/30 text-sm"
      >
        Kiosk View · Akan diimplementasikan di <code class="mx-1 font-mono text-xs">KioskView.vue</code>
      </div>

      <AdminView v-if="activeView === 'admin'" />
    </div>

  </div>
</template>
<script setup>
import { ref } from 'vue'
<<<<<<< HEAD
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
=======
import KioskView from './views/KioskView.vue'
import AdminView from './views/AdminView.vue'

// State untuk navigasi halaman utama
const currentView = ref('kiosk') // 'kiosk' atau 'admin'
</script>

<template>
  <div class="flex min-h-screen bg-base-200 text-base-content font-sans antialiased">
    
    <aside class="w-64 bg-base-100 border-r border-base-300 flex flex-col shrink-0">
      <div class="h-16 flex items-center px-6 border-b border-base-300 gap-3">
        <div class="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-content font-black text-lg shadow-sm">
          A
        </div>
        <div>
          <h1 class="text-sm font-bold tracking-tight leading-none">AbsensiWajah</h1>
          <span class="text-[11px] opacity-50 font-medium">v1.0.0 — Kiosk System</span>
        </div>
      </div>

      <nav class="flex-1 p-4 flex flex-col gap-1">
        <button 
          @click="currentView = 'kiosk'" 
          class="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
          :class="currentView === 'kiosk' ? 'bg-primary text-primary-content font-semibold shadow-sm' : 'hover:bg-base-300 opacity-80'"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 002-2H3a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          Kiosk Antarmuka
        </button>

        <button 
          @click="currentView = 'admin'" 
          class="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
          :class="currentView === 'admin' ? 'bg-primary text-primary-content font-semibold shadow-sm' : 'hover:bg-base-300 opacity-80'"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Dashboard Monitoring
        </button>
      </nav>

      <div class="p-4 border-t border-base-300 bg-base-200/50 text-[11px] opacity-60">
        <p>Terminal: <strong>KIOSK-01</strong></p>
        <p class="mt-0.5">Status: <span class="text-success font-semibold">Online & Terkoneksi</span></p>
      </div>
    </aside>

    <div class="flex-1 flex flex-col overflow-hidden">
      <header class="h-16 bg-base-100 border-b border-base-300 flex items-center justify-between px-8 shrink-0">
        <div class="flex items-center gap-4">
          <h2 class="text-base font-bold tracking-tight text-neutral">
            {{ currentView === 'kiosk' ? 'Layar Kiosk Siswa' : 'Dashboard Admin & Rekap Guru' }}
          </h2>
          <span class="badge badge-sm font-semibold tracking-wider" :class="currentView === 'kiosk' ? 'badge-info' : 'badge-neutral'">
            {{ currentView === 'kiosk' ? 'LIVE CAPTURE' : 'REAL-TIME DATA' }}
          </span>
        </div>
        
        <div class="flex items-center gap-2">
          <div class="text-right">
            <p class="text-xs font-bold leading-none">SDN Nusantara 01</p>
            <span class="text-[10px] opacity-50 font-medium">Tahun Ajaran 2026/2027</span>
          </div>
          <div class="w-8 h-8 rounded-full bg-neutral-content flex items-center justify-center font-bold text-xs">
            SD
          </div>
        </div>
      </header>

      <main class="flex-1 overflow-y-auto">
        <KioskView v-if="currentView === 'kiosk'" />
        <AdminView v-else />
      </main>
>>>>>>> f7d2eaa1886e912809de46d2707d68763dc0d77d
    </div>

  </div>
</template>
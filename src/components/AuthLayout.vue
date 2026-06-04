<script setup>
import ThemeToggle from '@/components/ThemeToggle.vue'
</script>

<template>
  <div class="min-h-screen bg-base-200 flex flex-col">
    <!-- Top bar -->
    <div class="flex items-center justify-between px-6 py-4 border-b border-base-300/40">
      <!-- Brand -->
      <div class="flex items-center gap-2.5">
        <div class="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0 shadow-sm">
          <i class="ti ti-scan text-primary-content text-base" aria-hidden="true"></i>
        </div>
        <div class="leading-tight">
          <p class="text-sm font-semibold text-base-content">AbsensiWajah</p>
          <p class="text-[10px] text-base-content/45">SD Negeri Kalikondang 01 · Kudus</p>
        </div>
      </div>

      <ThemeToggle />
    </div>

    <!-- Content -->
    <div class="flex flex-1 items-center justify-center px-4 py-8">
      <div class="w-full max-w-md">
        <slot />
      </div>
    </div>

    <!-- Footer -->
    <p class="text-center text-[11px] text-base-content/25 pb-5 border-t border-base-300/30 pt-4">
      © 2026 SD Negeri Kalikondang 01 · Sistem Absensi Biometrik Wajah
    </p>
  </div>
</template>
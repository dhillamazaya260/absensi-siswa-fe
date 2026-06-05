<script setup>
import { useTheme } from '@/composables/useTheme'
import { usePasswordStrength } from '@/composables/usePasswordStrength'

// Init theme on mount (watchEffect runs automatically)
useTheme()
// Catatan: Biasanya usePasswordStrength butuh argument password, 
// pastikan ini tidak bikin error di halaman utama jika dipanggil kosongan.
usePasswordStrength() 
</script>

<template>
  <RouterView />
</template>
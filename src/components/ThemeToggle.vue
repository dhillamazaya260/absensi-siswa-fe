<script setup>
import { useTheme } from '@/composables/UseTheme'
const { isDark, toggleTheme } = useTheme()
</script>

<template>
  <button
    type="button"
    class="btn btn-sm gap-2 px-2 py-2 font-medium border-0 transition-all duration-300 shadow-sm hover:shadow-md focus:ring-2 focus:ring-offset-1 focus:ring-primary/50 bg-clip-padding"
    :class="isDark ? 'btn-gradient-light' : 'btn-gradient-dark'"
    :aria-label="isDark ? 'Aktifkan light mode' : 'Aktifkan dark mode'"
    @click="toggleTheme"
  >
    <i :class="`ti ti-${isDark ? 'sun' : 'moon-stars'} text-sm`" aria-hidden="true"></i>
    {{ isDark ? 'Light Mode' : 'Dark Mode' }}
  </button>
</template>
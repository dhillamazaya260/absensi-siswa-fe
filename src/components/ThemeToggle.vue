<script setup>
import { useTheme } from '@/composables/useTheme'

const { isDark, toggleTheme } = useTheme()
</script>

<template>
  <button
    type="button"
    class="btn btn-sm gap-2 px-3 py-2 font-bold transition-all duration-500 rounded-xl border-2"
    :class="isDark 
      ? 'bg-[#0f172a] border-indigo-500/50 text-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:border-indigo-400' 
      : 'bg-orange-50 border-orange-200 text-orange-600 hover:bg-orange-100 shadow-none'"
    :aria-label="isDark ? 'Aktifkan light mode' : 'Aktifkan dark mode'"
    @click="toggleTheme"
  >
    <i :class="[`ti ti-${isDark ? 'sun' : 'moon-stars'} text-base`, isDark ? 'animate-pulse' : '']" aria-hidden="true"></i>
    <span class="text-xs uppercase tracking-wider">{{ isDark ? 'Light' : 'Dark' }}</span>
  </button>
</template>
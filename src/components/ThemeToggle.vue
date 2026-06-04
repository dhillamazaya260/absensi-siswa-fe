<script setup>
import { useTheme } from '@/composables/useTheme'

const { isDark, toggleTheme } = useTheme()
</script>

<template>
  <button
    type="button"
    class="btn btn-ghost btn-sm gap-1.5 text-xs font-normal border border-base-300"
    :aria-label="isDark ? 'Aktifkan light mode' : 'Aktifkan dark mode'"
    @click="toggleTheme"
  >
    <i :class="`ti ti-${isDark ? 'sun' : 'moon'} text-sm`" aria-hidden="true"></i>
    {{ isDark ? 'Light Mode' : 'Dark Mode' }}
  </button>
</template>
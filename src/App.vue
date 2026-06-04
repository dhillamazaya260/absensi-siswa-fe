<script setup>
import { useTheme } from '@/composables/useTheme'

// Init theme on mount (watchEffect runs automatically)
useTheme()
</script>

<template>
  <RouterView />
</template>
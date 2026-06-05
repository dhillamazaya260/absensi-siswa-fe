<script setup>
import { useTheme } from '@/composables/useTheme'
import { useTheme } from '@/composables/useTheme.js'

// Init theme on mount (watchEffect runs automatically)
useTheme()
</script>

<template>
  <RouterView />
</template>
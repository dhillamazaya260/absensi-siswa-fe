<script setup>
import { useTheme } from '@/composables/useTheme'
import { usePasswordStrength } from '@/composables/usePasswordStrength'

// Init theme on mount (watchEffect runs automatically)
useTheme()
usePasswordStrength()
</script>

<template>
  <RouterView />
</template>
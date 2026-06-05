<script setup>
import { useTheme } from '@/composables/UseTheme'
import { usePasswordStrength } from '@/composables/UsePasswordStrength'

// Init theme on mount (watchEffect runs automatically)
useTheme()
usePasswordStrength()

</script>

<template>
  <RouterView />
</template>
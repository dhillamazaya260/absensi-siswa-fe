<script setup>
import { usePasswordStrength } from '@/composables/usePasswordStrength'
import { toRef } from 'vue'

const props = defineProps({
  password: { type: String, default: '' },
})

const pass = toRef(props, 'password')
const { score, label, color } = usePasswordStrength(pass)

const colorMap = {
  error: 'bg-error',
  warning: 'bg-warning',
  success: 'bg-success',
}
</script>

<template>
  <div v-if="password" class="mt-1.5 space-y-1">
    <div class="flex gap-1">
      <div
        v-for="i in 4"
        :key="i"
        class="h-1 flex-1 rounded-full transition-all duration-300"
        :class="i <= score ? colorMap[color] : 'bg-base-300'"
      ></div>
    </div>
    <p class="text-xs flex items-center gap-1" :class="`text-${color}`">
      <i class="ti ti-shield text-xs" aria-hidden="true"></i>
      Kekuatan: <span class="font-medium">{{ label }}</span>
    </p>
  </div>
</template>
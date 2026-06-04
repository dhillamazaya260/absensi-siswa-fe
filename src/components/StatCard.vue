<script setup>
defineProps({
  label:   { type: String,          required: true },
  value:   { type: [Number, String], default: 0    },
  sub:     { type: String,          default: ''    },
  loading: { type: Boolean,         default: false },
  color: {
    type: String,
    default: 'neutral',
    validator: v => ['success', 'warning', 'error', 'info', 'neutral'].includes(v),
  },
})

const valueColor = {
  success: 'text-success',
  warning: 'text-warning',
  error:   'text-error',
  info:    'text-info',
  neutral: 'text-base-content/60',
}

const iconColor = {
  success: 'text-success/50',
  warning: 'text-warning/50',
  error:   'text-error/50',
  info:    'text-info/50',
  neutral: 'text-base-content/25',
}
</script>

<template>
  <div class="card bg-base-100 shadow-sm border border-base-300/50 hover:shadow-md transition-shadow">
    <div class="card-body p-4 gap-0">
      <div class="flex items-start justify-between gap-2">
        <div class="flex-1 min-w-0">
          <p class="text-[11px] font-medium text-base-content/50 uppercase tracking-wide mb-2">
            {{ label }}
          </p>
          <!-- Loading skeleton -->
          <div v-if="loading" class="skeleton h-9 w-16 rounded mb-1.5"></div>
          <p v-else class="text-[2.1rem] font-semibold leading-none tracking-tight mb-2" :class="valueColor[color]">
            {{ value }}
          </p>
          <p class="text-[11px] text-base-content/35">{{ sub }}</p>
        </div>
        <!-- Icon slot -->
        <div v-if="$slots.icon" class="mt-0.5 flex-shrink-0" :class="iconColor[color]">
          <slot name="icon" />
        </div>
      </div>
    </div>
  </div>
</template>
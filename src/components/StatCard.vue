<script setup>
import { ref } from 'vue'

const props = defineProps({
  label:   { type: String,           required: true },
  value:   { type: [Number, String], default: 0     },
  sub:     { type: String,           default: ''    },
  loading: { type: Boolean,          default: false },
  color: {
    type: String,
    default: 'neutral',
    validator: v => ['success', 'warning', 'error', 'info', 'neutral'].includes(v),
  },
  // detail popup
  detail: { type: Object, default: null },
  // e.g. { title: 'Hadir Hari Ini', rows: [{ label: 'Kelas 4A', value: 32 }, ...], note: '...' }
})

const showModal = ref(false)

const valueColor = {
  success: 'text-success',
  warning: 'text-warning',
  error:   'text-error',
  info:    'text-info',
  neutral: 'text-base-content/70',
}

const iconBg = {
  success: 'bg-success/10 text-success/80',
  warning: 'bg-warning/10 text-warning/80',
  error:   'bg-error/10 text-error/80',
  info:    'bg-info/10 text-info/80',
  neutral: 'bg-base-300/50 text-base-content/40',
}

const borderAccent = {
  success: 'hover:border-success/30',
  warning: 'hover:border-warning/30',
  error:   'hover:border-error/30',
  info:    'hover:border-info/30',
  neutral: 'hover:border-base-300',
}

const modalHeaderColor = {
  success: 'from-success/15 to-success/5 border-success/20',
  warning: 'from-warning/15 to-warning/5 border-warning/20',
  error:   'from-error/15 to-error/5 border-error/20',
  info:    'from-info/15 to-info/5 border-info/20',
  neutral: 'from-base-200 to-base-100 border-base-300/60',
}
</script>

<template>
  <div
    class="card bg-base-100 shadow-sm border border-base-300/60 transition-all duration-200 cursor-pointer select-none"
    :class="[borderAccent[color], 'hover:shadow-md hover:-translate-y-0.5']"
    @click="showModal = true"
  >
    <div class="card-body p-4 gap-0">
      <div class="flex items-start justify-between gap-2">
        <div class="flex-1 min-w-0">
          <p class="text-[11px] font-semibold text-base-content/40 uppercase tracking-wider mb-2.5">
            {{ label }}
          </p>
          <div v-if="loading" class="skeleton h-9 w-16 rounded mb-1.5"></div>
          <p v-else class="text-[2.1rem] font-bold leading-none tracking-tight mb-2" :class="valueColor[color]">
            {{ value }}
          </p>
          <p class="text-[11px] text-base-content/40 font-medium">{{ sub }}</p>
        </div>
        <div
          v-if="$slots.icon"
          class="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
          :class="iconBg[color]"
        >
          <slot name="icon" />
        </div>
      </div>

      <!-- Tap hint -->
      <div class="mt-3 pt-2.5 border-t border-base-200/80 flex items-center gap-1 text-[10px] text-base-content/25">
        <i class="ti ti-info-circle text-xs"></i>
        Ketuk untuk detail
      </div>
    </div>
  </div>

  <!-- ── Detail Modal ── -->
  <Teleport to="body">
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="showModal"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        @click.self="showModal = false"
      >
        <Transition
          enter-active-class="transition ease-out duration-200"
          enter-from-class="opacity-0 scale-95 translate-y-2"
          enter-to-class="opacity-100 scale-100 translate-y-0"
        >
          <div v-if="showModal" class="card bg-base-100 shadow-2xl w-full max-w-sm border border-base-300/60 overflow-hidden">

            <!-- Modal header — gradient sesuai warna -->
            <div
              class="px-5 py-4 bg-gradient-to-br border-b flex items-center justify-between"
              :class="modalHeaderColor[color]"
            >
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl flex items-center justify-center" :class="iconBg[color]">
                  <slot name="icon" />
                </div>
                <div>
                  <h3 class="font-bold text-base-content text-[15px]">{{ label }}</h3>
                  <p class="text-[11px] text-base-content/45 mt-0.5">{{ sub }}</p>
                </div>
              </div>
              <button class="btn btn-xs btn-ghost btn-circle" @click="showModal = false">
                <i class="ti ti-x text-sm"></i>
              </button>
            </div>

            <!-- Big number -->
            <div class="px-5 py-4 border-b border-base-200/60 flex items-baseline gap-2">
              <span class="text-5xl font-black leading-none" :class="valueColor[color]">{{ value }}</span>
              <span class="text-sm text-base-content/40 font-medium">{{ sub }}</span>
            </div>

            <!-- Detail rows (jika ada) -->
            <div v-if="detail?.rows?.length" class="divide-y divide-base-200/60">
              <div
                v-for="row in detail.rows"
                :key="row.label"
                class="flex items-center justify-between px-5 py-2.5"
              >
                <span class="text-sm text-base-content/60">{{ row.label }}</span>
                <span class="text-sm font-semibold text-base-content">{{ row.value }}</span>
              </div>
            </div>

            <!-- Fallback jika tidak ada detail rows -->
            <div v-else class="px-5 py-4 text-sm text-base-content/40 italic">
              Data rincian belum tersedia.
            </div>

            <!-- Note -->
            <div v-if="detail?.note" class="px-5 py-3 bg-base-200/40 border-t border-base-200/60">
              <p class="text-[11px] text-base-content/40 flex items-start gap-1.5">
                <i class="ti ti-clock text-xs mt-0.5 flex-shrink-0"></i>
                {{ detail.note }}
              </p>
            </div>

            <!-- Close button -->
            <div class="px-5 py-3 border-t border-base-200/60">
              <button class="btn btn-sm btn-ghost w-full" @click="showModal = false">Tutup</button>
            </div>

          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
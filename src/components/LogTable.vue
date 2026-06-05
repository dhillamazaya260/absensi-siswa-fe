<script setup>
defineProps({
  data:    { type: Array,   default: () => [] },
  loading: { type: Boolean, default: false    },
})

const statusCfg = {
  hadir:     { cls: 'bg-success/10 text-success border-success/20', label: 'Hadir'     },
  terlambat: { cls: 'bg-warning/10 text-warning border-warning/20', label: 'Terlambat' },
  gagal:     { cls: 'bg-error/10 text-error border-error/20',   label: 'Gagal'     },
}
</script>

<template>
  <!-- Loading -->
  <div v-if="loading" class="flex justify-center py-16">
    <span class="loading loading-spinner loading-md text-primary"></span>
  </div>

  <!-- Empty state -->
  <div v-else-if="data.length === 0" class="flex flex-col items-center justify-center py-16 gap-2">
    <svg class="w-10 h-10 text-base-content/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
    <p class="text-sm text-base-content/35">Belum ada log aktivitas hari ini.</p>
  </div>

  <!-- Table -->
  <div v-else class="overflow-x-auto">
    <table class="table table-sm w-full">
      <thead>
        <tr class="border-b border-base-200 dark:border-white/10 bg-base-200/50 dark:bg-white/[0.02]">
          <th class="text-[11px] font-medium text-base-content/45 uppercase tracking-wide w-24">Waktu</th>
          <th class="text-[11px] font-medium text-base-content/45 uppercase tracking-wide">Kejadian</th>
          <th class="text-[11px] font-medium text-base-content/45 uppercase tracking-wide w-16">Kelas</th>
          <th class="text-[11px] font-medium text-base-content/45 uppercase tracking-wide w-24 text-right">Status</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="log in data"
          :key="log.id"
          class="border-b border-base-200/70 dark:border-white/5 hover:bg-primary/[0.03] transition-colors"
        >
          <td class="font-mono text-[11px] text-base-content/50 whitespace-nowrap">{{ log.waktu }}</td>
          <td class="text-sm font-medium text-base-content/80">{{ log.kejadian }}</td>
          <td class="text-sm text-base-content/55">{{ log.kelas }}</td>
          <td class="text-right">
            <span class="badge badge-sm border font-bold px-2.5 py-2 h-auto" :class="statusCfg[log.status]?.cls ?? 'badge-ghost'">
              {{ statusCfg[log.status]?.label ?? log.status }}
            </span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
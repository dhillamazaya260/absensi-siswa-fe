<script setup>
import { ref, computed } from 'vue'
import { useQuery, useQueryClient } from '@tanstack/vue-query'
import {
  RefreshCw,
  FileSpreadsheet,
  FileText,
  Camera,
  UserPlus,
  Edit3,
  CheckCircle2,
  AlertTriangle,
  UserX,
  Clock,
  X,
  Check,
} from 'lucide-vue-next'
import StatCard  from '../components/StatCard.vue'
import LogTable  from '../components/LogTable.vue'
import {
  fetchStatistik,
  fetchAbsensiHariIni,
  fetchLogAktivitas,
  registrasiSiswa,
  overrideStatusAbsensi,
} from '../api/absensi.js'

// ─── State ────────────────────────────────────────────────────
const activeTab   = ref('today')
const kelasFilter = ref('')
const qClient     = useQueryClient()

const KELAS_LIST = ['1A','1B','2A','2B','3A','3B','4A','4B','5A','5B','6A','6B']

const STATUS_CFG = {
  hadir:     { badge: 'badge-success', label: 'Hadir',     dot: 'bg-success'  },
  terlambat: { badge: 'badge-warning', label: 'Terlambat', dot: 'bg-warning'  },
  absen:     { badge: 'badge-error',   label: 'Absen',     dot: 'bg-error'    },
  gagal:     { badge: 'badge-error',   label: 'Gagal',     dot: 'bg-error'    },
}

// ─── TanStack Queries (auto-refetch every 5 s) ────────────────
const {
  data: stats,
  isLoading: statsLoading,
} = useQuery({
  queryKey:       ['statistik'],
  queryFn:        fetchStatistik,
  refetchInterval: 5_000,
})

const {
  data:     absensiData,
  isLoading: absensiLoading,
  isFetching: absensiFetching,
  refetch:   refetchAbsensi,
} = useQuery({
  queryKey:       ['absensi-hari-ini', kelasFilter],
  queryFn:        () => fetchAbsensiHariIni(kelasFilter.value),
  refetchInterval: 5_000,
})

const {
  data:     logData,
  isLoading: logLoading,
  isFetching: logFetching,
  refetch:   refetchLog,
} = useQuery({
  queryKey:       ['log-aktivitas'],
  queryFn:        fetchLogAktivitas,
  refetchInterval: 5_000,
})

// ─── Computed ─────────────────────────────────────────────────
const isFetching = computed(() =>
  activeTab.value === 'today' ? absensiFetching.value
  : activeTab.value === 'log' ? logFetching.value
  : false
)

const filteredAbsensi = computed(() => {
  if (!absensiData.value) return []
  return kelasFilter.value
    ? absensiData.value.filter(s => s.kelas === kelasFilter.value)
    : absensiData.value
})

const today = computed(() =>
  new Date().toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
)

// ─── Helpers ──────────────────────────────────────────────────
const initials = (name) =>
  name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()

const handleManualRefetch = () => {
  if (activeTab.value === 'today') refetchAbsensi()
  else if (activeTab.value === 'log') refetchLog()
}

// ─── Override Modal ───────────────────────────────────────────
const overrideTarget  = ref(null)
const overrideStatus  = ref('')
const overrideLoading = ref(false)

const openOverride = (siswa) => {
  overrideTarget.value = siswa
  overrideStatus.value = siswa.status
}

const closeOverride = () => { overrideTarget.value = null }

const submitOverride = async () => {
  if (!overrideTarget.value || !overrideStatus.value) return
  overrideLoading.value = true
  try {
    await overrideStatusAbsensi(overrideTarget.value.id, overrideStatus.value)
    await qClient.invalidateQueries({ queryKey: ['absensi-hari-ini'] })
    closeOverride()
  } finally {
    overrideLoading.value = false
  }
}

// ─── Face Registration ────────────────────────────────────────
const regForm    = ref({ nama: '', kelas: '4A', nis: '' })
const regLoading = ref(false)
const regSuccess = ref(false)
const regError   = ref('')

const PHOTO_SLOTS = [
  { key: 'depan', label: 'Depan'    },
  { key: 'kanan', label: 'Kanan 45°' },
  { key: 'kiri',  label: 'Kiri 45°'  },
]
const photos = ref({ depan: null, kanan: null, kiri: null })

const regValid = computed(() =>
  regForm.value.nama.trim() !== '' && regForm.value.nis.trim() !== ''
)

const submitReg = async () => {
  if (!regValid.value) return
  regLoading.value = true
  regError.value   = ''
  try {
    await registrasiSiswa({ ...regForm.value, photos: photos.value })
    regSuccess.value = true
    regForm.value    = { nama: '', kelas: '4A', nis: '' }
    photos.value     = { depan: null, kanan: null, kiri: null }
    setTimeout(() => { regSuccess.value = false }, 4_000)
  } catch (e) {
    regError.value = 'Gagal mendaftarkan siswa. Silakan coba lagi.'
  } finally {
    regLoading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-base-200">

    <!-- ─── Sticky Header ───────────────────────────────────── -->
    <header class="sticky top-0 z-10 bg-base-100/95 backdrop-blur-sm border-b border-base-300/60 px-4 sm:px-6 py-3">
      <div class="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div class="min-w-0">
          <h1 class="font-semibold text-base-content text-[15px] leading-tight truncate">
            Dashboard Guru
          </h1>
          <p class="text-[11px] text-base-content/45 mt-0.5 truncate">
            SD Negeri Kalikondang 01 &middot; {{ today }}
          </p>
        </div>

        <!-- Manual sync button with spin indicator -->
        <button
          class="btn btn-sm btn-ghost gap-2 flex-shrink-0"
          :disabled="isFetching"
          @click="handleManualRefetch"
          title="Sinkronisasi manual"
        >
          <RefreshCw class="w-4 h-4" :class="{ 'animate-spin': isFetching }" />
          <span class="hidden sm:inline text-xs">
            {{ isFetching ? 'Memuat…' : 'Sinkronisasi' }}
          </span>
        </button>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-5">

      <!-- ─── Bento Stat Cards ──────────────────────────────── -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Hadir Hari Ini"
          :value="stats?.hadir    ?? 138"
          :sub="`dari ${stats?.totalSiswa ?? 168} siswa`"
          color="success"
          :loading="statsLoading"
        >
          <template #icon>
            <CheckCircle2 class="w-5 h-5" />
          </template>
        </StatCard>

        <StatCard
          label="Terlambat"
          :value="stats?.terlambat ?? 8"
          sub="setelah 07:15"
          color="warning"
          :loading="statsLoading"
        >
          <template #icon>
            <AlertTriangle class="w-5 h-5" />
          </template>
        </StatCard>

        <StatCard
          label="Absen"
          :value="stats?.absen     ?? 12"
          sub="tidak hadir"
          color="error"
          :loading="statsLoading"
        >
          <template #icon>
            <UserX class="w-5 h-5" />
          </template>
        </StatCard>

        <StatCard
          label="Belum Absen"
          :value="stats?.belumAbsen ?? 10"
          sub="menunggu"
          color="neutral"
          :loading="statsLoading"
        >
          <template #icon>
            <Clock class="w-5 h-5" />
          </template>
        </StatCard>
      </div>

      <!-- ─── Main Card ─────────────────────────────────────── -->
      <div class="card bg-base-100 shadow-sm border border-base-300/50">
        <div class="card-body p-0">

          <!-- Tab Bar -->
          <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between border-b border-base-200 px-5 pt-4 gap-3">
            <div role="tablist" class="tabs tabs-bordered -mb-px">
              <button
                role="tab"
                class="tab text-sm font-medium"
                :class="{ 'tab-active': activeTab === 'today' }"
                @click="activeTab = 'today'"
              >
                Hari Ini
                <span v-if="activeTab !== 'today' && absensiFetching"
                  class="ml-1.5 loading loading-ring loading-xs text-primary"></span>
              </button>
              <button
                role="tab"
                class="tab text-sm font-medium"
                :class="{ 'tab-active': activeTab === 'reg' }"
                @click="activeTab = 'reg'"
              >
                Registrasi Wajah
              </button>
              <button
                role="tab"
                class="tab text-sm font-medium"
                :class="{ 'tab-active': activeTab === 'log' }"
                @click="activeTab = 'log'"
              >
                Log Aktivitas
                <span v-if="activeTab !== 'log' && logFetching"
                  class="ml-1.5 loading loading-ring loading-xs text-primary"></span>
              </button>
            </div>

            <!-- Filter row — only on Hari Ini tab -->
            <Transition name="slide-fade">
              <div v-if="activeTab === 'today'" class="flex items-center gap-2 pb-2 sm:pb-1">
                <select
                  v-model="kelasFilter"
                  class="select select-xs select-bordered min-w-[110px]"
                >
                  <option value="">Semua Kelas</option>
                  <option v-for="k in KELAS_LIST" :key="k" :value="k">Kelas {{ k }}</option>
                </select>
                <button class="btn btn-xs btn-outline gap-1.5">
                  <FileSpreadsheet class="w-3 h-3" />
                  <span class="hidden sm:inline">Excel</span>
                </button>
                <button class="btn btn-xs btn-outline gap-1.5">
                  <FileText class="w-3 h-3" />
                  <span class="hidden sm:inline">PDF</span>
                </button>
              </div>
            </Transition>
          </div>

          <!-- ── TAB: Hari Ini ───────────────────────────────── -->
          <div v-show="activeTab === 'today'" class="p-4 sm:p-5">
            <!-- Loading -->
            <div v-if="absensiLoading" class="flex justify-center py-16">
              <span class="loading loading-spinner loading-md text-primary"></span>
            </div>

            <!-- Table -->
            <div v-else class="overflow-x-auto">
              <table class="table table-sm w-full">
                <thead>
                  <tr class="border-b border-base-200">
                    <th class="text-[11px] font-medium text-base-content/45 uppercase tracking-wide">Siswa</th>
                    <th class="text-[11px] font-medium text-base-content/45 uppercase tracking-wide w-16">Kelas</th>
                    <th class="text-[11px] font-medium text-base-content/45 uppercase tracking-wide w-20">Masuk</th>
                    <th class="text-[11px] font-medium text-base-content/45 uppercase tracking-wide w-28">Status</th>
                    <th class="text-[11px] font-medium text-base-content/45 uppercase tracking-wide w-24 text-right">Override</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="siswa in filteredAbsensi"
                    :key="siswa.id"
                    class="border-b border-base-200/60 hover:bg-base-200/40 transition-colors"
                  >
                    <!-- Nama + Avatar -->
                    <td>
                      <div class="flex items-center gap-2.5">
                        <div class="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold flex-shrink-0 select-none">
                          {{ initials(siswa.nama) }}
                        </div>
                        <span class="text-sm font-medium text-base-content">{{ siswa.nama }}</span>
                      </div>
                    </td>

                    <!-- Kelas -->
                    <td class="text-sm text-base-content/60">{{ siswa.kelas }}</td>

                    <!-- Waktu Masuk -->
                    <td class="font-mono text-xs text-base-content/55">{{ siswa.waktuMasuk }}</td>

                    <!-- Status Badge -->
                    <td>
                      <span class="badge badge-sm gap-1" :class="STATUS_CFG[siswa.status]?.badge ?? 'badge-ghost'">
                        <span class="w-1.5 h-1.5 rounded-full inline-block" :class="STATUS_CFG[siswa.status]?.dot"></span>
                        {{ STATUS_CFG[siswa.status]?.label ?? siswa.status }}
                      </span>
                    </td>

                    <!-- Override Button -->
                    <td class="text-right">
                      <button
                        class="btn btn-xs btn-ghost gap-1 text-[11px]"
                        @click="openOverride(siswa)"
                      >
                        <Edit3 class="w-3 h-3" />
                        Manual
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>

              <!-- Empty state -->
              <div v-if="filteredAbsensi.length === 0" class="flex flex-col items-center justify-center py-14 gap-2">
                <UserX class="w-10 h-10 text-base-content/20" />
                <p class="text-sm text-base-content/35">
                  Tidak ada data untuk kelas <strong>{{ kelasFilter }}</strong>.
                </p>
              </div>
            </div>
          </div>

          <!-- ── TAB: Registrasi Wajah ──────────────────────── -->
          <div v-show="activeTab === 'reg'" class="p-4 sm:p-5">
            <div class="max-w-md">
              <p class="text-sm text-base-content/60 mb-5">
                Foto wajah siswa dari 3 sudut berbeda untuk akurasi pengenalan yang optimal.
              </p>

              <!-- Success alert -->
              <Transition name="fade">
                <div v-if="regSuccess" role="alert" class="alert alert-success alert-sm mb-4 py-2">
                  <CheckCircle2 class="w-4 h-4 flex-shrink-0" />
                  <span class="text-sm">Siswa berhasil didaftarkan!</span>
                </div>
              </Transition>

              <!-- Error alert -->
              <Transition name="fade">
                <div v-if="regError" role="alert" class="alert alert-error alert-sm mb-4 py-2">
                  <X class="w-4 h-4 flex-shrink-0" />
                  <span class="text-sm">{{ regError }}</span>
                </div>
              </Transition>

              <!-- Form: Nama + Kelas -->
              <div class="flex gap-3 mb-4">
                <div class="flex-1">
                  <label class="label py-0.5">
                    <span class="label-text text-xs">Nama Lengkap</span>
                  </label>
                  <input
                    v-model="regForm.nama"
                    type="text"
                    placeholder="cth. Budi Santoso"
                    class="input input-sm input-bordered w-full"
                  />
                </div>
                <div class="w-24">
                  <label class="label py-0.5">
                    <span class="label-text text-xs">Kelas</span>
                  </label>
                  <select v-model="regForm.kelas" class="select select-sm select-bordered w-full">
                    <option v-for="k in KELAS_LIST" :key="k" :value="k">{{ k }}</option>
                  </select>
                </div>
              </div>

              <!-- Form: NIS -->
              <div class="mb-5">
                <label class="label py-0.5">
                  <span class="label-text text-xs">NIS (Nomor Induk Siswa)</span>
                </label>
                <input
                  v-model="regForm.nis"
                  type="text"
                  placeholder="cth. 2024001"
                  class="input input-sm input-bordered w-44"
                />
              </div>

              <!-- Photo Slots (3 sudut) -->
              <p class="text-xs font-medium mb-2.5">
                Ambil Foto Wajah
                <span class="font-normal text-base-content/40 ml-1">(3 sudut)</span>
              </p>
              <div class="grid grid-cols-3 gap-3 mb-5">
                <button
                  v-for="slot in PHOTO_SLOTS"
                  :key="slot.key"
                  type="button"
                  class="aspect-square rounded-xl border border-dashed flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all group"
                  :class="photos[slot.key]
                    ? 'bg-success/8 border-success/60 text-success'
                    : 'bg-base-200 border-base-300 hover:bg-base-300 hover:border-primary/40'"
                >
                  <Camera
                    class="w-5 h-5 transition-colors"
                    :class="photos[slot.key]
                      ? 'text-success'
                      : 'text-base-content/30 group-hover:text-base-content/50'"
                  />
                  <span
                    class="text-[11px] transition-colors"
                    :class="photos[slot.key]
                      ? 'text-success font-medium'
                      : 'text-base-content/40 group-hover:text-base-content/60'"
                  >
                    {{ slot.label }}
                  </span>
                </button>
              </div>

              <!-- Submit Button -->
              <button
                class="btn btn-primary btn-sm gap-2"
                :disabled="!regValid || regLoading"
                @click="submitReg"
              >
                <span v-if="regLoading" class="loading loading-spinner loading-xs"></span>
                <UserPlus v-else class="w-4 h-4" />
                {{ regLoading ? 'Mendaftarkan…' : 'Daftarkan Siswa' }}
              </button>
            </div>
          </div>

          <!-- ── TAB: Log Aktivitas ──────────────────────────── -->
          <div v-show="activeTab === 'log'" class="p-4 sm:p-5">
            <LogTable :data="logData ?? []" :loading="logLoading" />
          </div>

        </div>
      </div>
    </main>

    <!-- ─── Override Modal ────────────────────────────────────── -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="overrideTarget"
          class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          @click.self="closeOverride"
        >
          <div class="card bg-base-100 shadow-2xl w-full max-w-sm border border-base-300/60">
            <div class="card-body p-5">
              <!-- Modal Header -->
              <div class="flex items-start justify-between mb-4">
                <div>
                  <h3 class="font-semibold text-base">Override Status Manual</h3>
                  <p class="text-xs text-base-content/50 mt-0.5">{{ overrideTarget?.nama }} · {{ overrideTarget?.kelas }}</p>
                </div>
                <button class="btn btn-xs btn-ghost btn-circle" @click="closeOverride">
                  <X class="w-4 h-4" />
                </button>
              </div>

              <!-- Status Picker -->
              <p class="text-xs font-medium text-base-content/60 mb-2.5">Pilih status baru:</p>
              <div class="flex flex-col gap-2 mb-5">
                <label
                  v-for="(cfg, key) in STATUS_CFG"
                  v-if="key !== 'gagal'"
                  :key="key"
                  class="flex items-center gap-3 cursor-pointer p-2.5 rounded-lg border transition-all"
                  :class="overrideStatus === key
                    ? 'border-primary/50 bg-primary/5'
                    : 'border-base-300/60 hover:border-base-300'"
                >
                  <input
                    type="radio"
                    :value="key"
                    v-model="overrideStatus"
                    class="radio radio-xs radio-primary"
                  />
                  <span class="badge badge-sm" :class="cfg.badge">{{ cfg.label }}</span>
                  <span class="text-xs text-base-content/50 ml-auto">{{ key }}</span>
                </label>
              </div>

              <!-- Modal Actions -->
              <div class="flex gap-2 justify-end">
                <button class="btn btn-sm btn-ghost" @click="closeOverride">Batal</button>
                <button
                  class="btn btn-sm btn-primary gap-1.5"
                  :disabled="overrideLoading"
                  @click="submitOverride"
                >
                  <span v-if="overrideLoading" class="loading loading-spinner loading-xs"></span>
                  <Check v-else class="w-4 h-4" />
                  Simpan
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

  </div>
</template>

<style scoped>
/* Slide + fade for filter controls */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

/* Simple fade for alerts */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Modal backdrop + card pop */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-active .card,
.modal-leave-active .card {
  transition: transform 0.2s ease;
}
.modal-enter-from .card {
  transform: scale(0.94) translateY(8px);
}
.modal-leave-to .card {
  transform: scale(0.94);
}
</style>
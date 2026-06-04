<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useQuery, useQueryClient } from '@tanstack/vue-query'
import {
  RefreshCw, FileSpreadsheet, FileText, Camera,
  UserPlus, Edit3, CheckCircle2, AlertTriangle,
  UserX, Clock, X, Check, LogOut, Settings,
  User, Bell, ChevronDown, Sun, Moon,
} from 'lucide-vue-next'
import StatCard from '../components/StatCard.vue'
import LogTable from '../components/LogTable.vue'
import { useTheme } from '@/composables/UseTheme'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import {
  fetchStatistik, fetchAbsensiHariIni, fetchLogAktivitas,
  registrasiSiswa, overrideStatusAbsensi,
} from '../api/absensi.js'

// ─── Theme & Auth ────────────────────────────────────────────
const { isDark, toggleTheme } = useTheme()
const auth   = useAuthStore()
const router = useRouter()

async function handleLogout() {
  await auth.logout()
  router.push({ name: 'Login' })
}

// ─── Profile dropdown ─────────────────────────────────────────
const showProfile = ref(false)
const profileRef  = ref(null)
function closeProfile(e) {
  if (profileRef.value && !profileRef.value.contains(e.target)) showProfile.value = false
}
onMounted(() => document.addEventListener('click', closeProfile))
onUnmounted(() => document.removeEventListener('click', closeProfile))

// ─── State ────────────────────────────────────────────────────
const activeTab   = ref('today')
const kelasFilter = ref('')
const qClient     = useQueryClient()
const KELAS_LIST  = ['1A','1B','2A','2B','3A','3B','4A','4B','5A','5B','6A','6B']
const STATUS_CFG  = {
  hadir:     { badge: 'badge-success', label: 'Hadir',     dot: 'bg-success' },
  terlambat: { badge: 'badge-warning', label: 'Terlambat', dot: 'bg-warning' },
  absen:     { badge: 'badge-error',   label: 'Absen',     dot: 'bg-error'   },
  gagal:     { badge: 'badge-error',   label: 'Gagal',     dot: 'bg-error'   },
}

// ─── Queries ──────────────────────────────────────────────────
const { data: stats, isLoading: statsLoading } = useQuery({
  queryKey: ['statistik'], queryFn: fetchStatistik, refetchInterval: 5_000,
})
const { data: absensiData, isLoading: absensiLoading, isFetching: absensiFetching, refetch: refetchAbsensi } = useQuery({
  queryKey: ['absensi-hari-ini', kelasFilter],
  queryFn: () => fetchAbsensiHariIni(kelasFilter.value),
  refetchInterval: 5_000,
})
const { data: logData, isLoading: logLoading, isFetching: logFetching, refetch: refetchLog } = useQuery({
  queryKey: ['log-aktivitas'], queryFn: fetchLogAktivitas, refetchInterval: 5_000,
})

const isFetching = computed(() =>
  activeTab.value === 'today' ? absensiFetching.value
  : activeTab.value === 'log' ? logFetching.value : false
)
const filteredAbsensi = computed(() => {
  if (!absensiData.value) return []
  return kelasFilter.value ? absensiData.value.filter(s => s.kelas === kelasFilter.value) : absensiData.value
})
const today = computed(() => new Date().toLocaleDateString('id-ID', {
  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
}))
const initials = (name) => name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
const handleManualRefetch = () => {
  if (activeTab.value === 'today') refetchAbsensi()
  else if (activeTab.value === 'log') refetchLog()
}

// ─── StatCard detail data ──────────────────────────────────────
const hadirDetail = computed(() => ({
  rows: [
    { label: 'Hadir tepat waktu', value: (stats.value?.hadir ?? 138) - (stats.value?.terlambat ?? 8) },
    { label: 'Terlambat (tetap hadir)', value: stats.value?.terlambat ?? 8 },
    { label: 'Total terdaftar', value: stats.value?.totalSiswa ?? 168 },
  ],
  note: `Data diperbarui otomatis setiap 5 detik`,
}))
const terlambatDetail = computed(() => ({
  rows: [
    { label: 'Batas waktu masuk', value: '07:15 WIB' },
    { label: 'Paling terlambat', value: '07:42 WIB' },
    { label: 'Rata-rata keterlambatan', value: '12 menit' },
  ],
  note: 'Siswa terlambat masih dicatat sebagai hadir.',
}))
const absenDetail = computed(() => ({
  rows: [
    { label: 'Tanpa keterangan', value: stats.value?.absen ?? 12 },
    { label: 'Sakit (surat)', value: 0 },
    { label: 'Izin resmi', value: 0 },
  ],
  note: 'Absen tanpa keterangan memerlukan tindak lanjut wali kelas.',
}))
const belumAbsenDetail = computed(() => ({
  rows: [
    { label: 'Belum scan wajah', value: stats.value?.belumAbsen ?? 10 },
    { label: 'Kamera error', value: 0 },
    { label: 'Tidak terdeteksi', value: 0 },
  ],
  note: 'Siswa yang belum absen akan otomatis ditandai absen pukul 08:00.',
}))

// ─── Override Modal ───────────────────────────────────────────
const overrideTarget = ref(null)
const overrideStatus = ref('')
const overrideLoading = ref(false)
const openOverride = (siswa) => { overrideTarget.value = siswa; overrideStatus.value = siswa.status }
const closeOverride = () => { overrideTarget.value = null }
const submitOverride = async () => {
  if (!overrideTarget.value || !overrideStatus.value) return
  overrideLoading.value = true
  try {
    await overrideStatusAbsensi(overrideTarget.value.id, overrideStatus.value)
    await qClient.invalidateQueries({ queryKey: ['absensi-hari-ini'] })
    closeOverride()
  } finally { overrideLoading.value = false }
}

// ─── Face Registration ────────────────────────────────────────
const regForm    = ref({ nama: '', kelas: '4A', nis: '' })
const regLoading = ref(false)
const regSuccess = ref(false)
const regError   = ref('')
const PHOTO_SLOTS = [
  { key: 'depan', label: 'Depan' }, { key: 'kanan', label: 'Kanan 45°' }, { key: 'kiri', label: 'Kiri 45°' },
]
const photos   = ref({ depan: null, kanan: null, kiri: null })
const regValid = computed(() => regForm.value.nama.trim() !== '' && regForm.value.nis.trim() !== '')
const submitReg = async () => {
  if (!regValid.value) return
  regLoading.value = true; regError.value = ''
  try {
    await registrasiSiswa({ ...regForm.value, photos: photos.value })
    regSuccess.value = true
    regForm.value = { nama: '', kelas: '4A', nis: '' }
    photos.value = { depan: null, kanan: null, kiri: null }
    setTimeout(() => { regSuccess.value = false }, 4_000)
  } catch (e) {
    regError.value = 'Gagal mendaftarkan siswa. Silakan coba lagi.'
  } finally { regLoading.value = false }
}
</script>

<template>
  <div class="min-h-screen bg-base-200">

    <!-- ─── Header ────────────────────────────────────────────── -->
    <header class="sticky top-0 z-20 bg-base-100/95 backdrop-blur-md border-b border-base-300/60 px-4 sm:px-6 py-0">
      <div class="max-w-7xl mx-auto flex items-center justify-between gap-4 h-14">

        <!-- Brand -->
        <div class="flex items-center gap-3 min-w-0">
          <div class="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0 shadow-sm">
            <i class="ti ti-scan text-primary-content text-base"></i>
          </div>
          <div class="min-w-0">
            <h1 class="font-semibold text-base-content text-[14px] leading-tight truncate">Dashboard Guru</h1>
            <p class="text-[11px] text-base-content/45 truncate hidden sm:block">SD Negeri Kalikondang 01 &middot; {{ today }}</p>
          </div>
        </div>

        <!-- Right controls -->
        <div class="flex items-center gap-1.5 flex-shrink-0">

          <!-- Sync -->
          <button class="btn btn-sm btn-ghost gap-1.5 border border-base-300/70 hover:border-base-300"
            :disabled="isFetching" @click="handleManualRefetch" title="Sinkronisasi manual">
            <RefreshCw class="w-3.5 h-3.5" :class="{ 'animate-spin': isFetching }" />
            <span class="hidden sm:inline text-xs font-normal">{{ isFetching ? 'Memuat…' : 'Sinkronisasi' }}</span>
          </button>

          <!-- Dark mode gradient button -->
          <button
            type="button"
            class="btn btn-sm border-0 transition-all duration-300 shadow-sm gap-1.5 font-medium"
            :class="isDark ? 'btn-gradient-light' : 'btn-gradient-dark'"
            :aria-label="isDark ? 'Light mode' : 'Dark mode'"
            @click="toggleTheme"
          >
            <Sun v-if="isDark" class="w-3.5 h-3.5" />
            <Moon v-else class="w-3.5 h-3.5" />
            <span class="hidden sm:inline text-xs">{{ isDark ? 'Light' : 'Dark' }}</span>
          </button>

          <!-- Notification -->
          <div class="relative">
            <button class="btn btn-sm btn-ghost btn-square border border-base-300/70 hover:border-base-300">
              <Bell class="w-3.5 h-3.5 text-base-content/60" />
            </button>
            <span class="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-error rounded-full ring-1 ring-base-100 pointer-events-none"></span>
          </div>

          <!-- Profile dropdown -->
          <div class="relative" ref="profileRef">
            <button
              class="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg hover:bg-base-200 transition-colors border border-transparent hover:border-base-300/60 h-9"
              @click.stop="showProfile = !showProfile"
            >
              <div class="w-7 h-7 rounded-md bg-primary/15 border border-primary/25 text-primary flex items-center justify-center text-[10px] font-bold flex-shrink-0 select-none">
                {{ auth.user?.nama ? auth.user.nama.split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase() : 'AD' }}
              </div>
              <div class="hidden md:block text-left leading-tight">
                <p class="text-[12px] font-semibold text-base-content">{{ auth.user?.nama ?? 'Admin' }}</p>
                <p class="text-[10px] text-base-content/45">{{ auth.user?.role ?? 'Administrator' }}</p>
              </div>
              <ChevronDown class="w-3 h-3 text-base-content/40 hidden md:block transition-transform duration-200" :class="showProfile ? 'rotate-180' : ''" />
            </button>

            <Transition
              enter-active-class="transition ease-out duration-150"
              enter-from-class="opacity-0 scale-95 -translate-y-1"
              enter-to-class="opacity-100 scale-100 translate-y-0"
              leave-active-class="transition ease-in duration-100"
              leave-from-class="opacity-100 scale-100 translate-y-0"
              leave-to-class="opacity-0 scale-95 -translate-y-1"
            >
              <div v-if="showProfile"
                class="absolute right-0 mt-1.5 w-56 bg-base-100 border border-base-300/70 rounded-xl shadow-xl shadow-black/10 overflow-hidden z-50">
                <!-- Profile info -->
                <div class="px-4 py-3 border-b border-base-300/60 bg-base-200/50">
                  <div class="flex items-center gap-2.5">
                    <div class="w-9 h-9 rounded-lg bg-primary/15 border border-primary/25 text-primary flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {{ auth.user?.nama ? auth.user.nama.split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase() : 'AD' }}
                    </div>
                    <div class="min-w-0">
                      <p class="text-[13px] font-semibold text-base-content truncate">{{ auth.user?.nama ?? 'Admin Sekolah' }}</p>
                      <p class="text-[11px] text-base-content/45 truncate">{{ auth.user?.email ?? 'admin@sdnkalikondang.sch.id' }}</p>
                    </div>
                  </div>
                </div>
                <div class="py-1">
                  <a href="#" class="flex items-center gap-2.5 px-4 py-2 text-sm text-base-content/75 hover:bg-base-200 hover:text-base-content transition-colors">
                    <User class="w-4 h-4 text-base-content/40" /> Profil Saya
                  </a>
                  <a href="#" class="flex items-center gap-2.5 px-4 py-2 text-sm text-base-content/75 hover:bg-base-200 hover:text-base-content transition-colors">
                    <Settings class="w-4 h-4 text-base-content/40" /> Pengaturan
                  </a>
                </div>
                <div class="border-t border-base-300/60 py-1">
                  <button
                    class="flex items-center gap-2.5 px-4 py-2 text-sm text-error/80 hover:bg-error/8 hover:text-error transition-colors w-full text-left"
                    @click="handleLogout"
                  >
                    <LogOut class="w-4 h-4" /> Keluar
                  </button>
                </div>
              </div>
            </Transition>
          </div>

        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-5">

      <!-- ─── Stat Cards ──────────────────────────────────────── -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Hadir Hari Ini" :value="stats?.hadir ?? 138"
          :sub="`dari ${stats?.totalSiswa ?? 168} siswa`" color="success"
          :loading="statsLoading" :detail="hadirDetail">
          <template #icon><CheckCircle2 class="w-5 h-5" /></template>
        </StatCard>

        <StatCard label="Terlambat" :value="stats?.terlambat ?? 8"
          sub="setelah 07:15" color="warning"
          :loading="statsLoading" :detail="terlambatDetail">
          <template #icon><AlertTriangle class="w-5 h-5" /></template>
        </StatCard>

        <StatCard label="Absen" :value="stats?.absen ?? 12"
          sub="tidak hadir" color="error"
          :loading="statsLoading" :detail="absenDetail">
          <template #icon><UserX class="w-5 h-5" /></template>
        </StatCard>

        <StatCard label="Belum Absen" :value="stats?.belumAbsen ?? 10"
          sub="menunggu" color="neutral"
          :loading="statsLoading" :detail="belumAbsenDetail">
          <template #icon><Clock class="w-5 h-5" /></template>
        </StatCard>
      </div>

      <!-- ─── Main Card ─────────────────────────────────────── -->
      <div class="card bg-base-100 shadow-sm border border-base-300/50">
        <div class="card-body p-0">

          <!-- Tab Bar -->
          <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between border-b border-base-200 px-5 pt-4 gap-3">
            <div role="tablist" class="tabs tabs-bordered -mb-px">
              <button role="tab" class="tab text-sm font-medium" :class="{ 'tab-active': activeTab === 'today' }" @click="activeTab = 'today'">
                Hari Ini
                <span v-if="activeTab !== 'today' && absensiFetching" class="ml-1.5 loading loading-ring loading-xs text-primary"></span>
              </button>
              <button role="tab" class="tab text-sm font-medium" :class="{ 'tab-active': activeTab === 'reg' }" @click="activeTab = 'reg'">
                Registrasi Wajah
              </button>
              <button role="tab" class="tab text-sm font-medium" :class="{ 'tab-active': activeTab === 'log' }" @click="activeTab = 'log'">
                Log Aktivitas
                <span v-if="activeTab !== 'log' && logFetching" class="ml-1.5 loading loading-ring loading-xs text-primary"></span>
              </button>
            </div>
            <Transition name="slide-fade">
              <div v-if="activeTab === 'today'" class="flex items-center gap-2 pb-2 sm:pb-1">
                <select v-model="kelasFilter" class="select select-xs select-bordered min-w-[110px]">
                  <option value="">Semua Kelas</option>
                  <option v-for="k in KELAS_LIST" :key="k" :value="k">Kelas {{ k }}</option>
                </select>
                <button class="btn btn-xs btn-outline gap-1.5">
                  <FileSpreadsheet class="w-3 h-3" /><span class="hidden sm:inline">Excel</span>
                </button>
                <button class="btn btn-xs btn-outline gap-1.5">
                  <FileText class="w-3 h-3" /><span class="hidden sm:inline">PDF</span>
                </button>
              </div>
            </Transition>
          </div>

          <!-- TAB: Hari Ini -->
          <div v-show="activeTab === 'today'" class="p-4 sm:p-5">
            <div v-if="absensiLoading" class="flex justify-center py-16">
              <span class="loading loading-spinner loading-md text-primary"></span>
            </div>
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
                  <tr v-for="siswa in filteredAbsensi" :key="siswa.id"
                    class="border-b border-base-200/60 hover:bg-base-200/40 transition-colors">
                    <td>
                      <div class="flex items-center gap-2.5">
                        <div class="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold flex-shrink-0 select-none">
                          {{ initials(siswa.nama) }}
                        </div>
                        <span class="text-sm font-medium text-base-content">{{ siswa.nama }}</span>
                      </div>
                    </td>
                    <td class="text-sm text-base-content/60">{{ siswa.kelas }}</td>
                    <td class="font-mono text-xs text-base-content/55">{{ siswa.waktuMasuk }}</td>
                    <td>
                      <span class="badge badge-sm gap-1" :class="STATUS_CFG[siswa.status]?.badge ?? 'badge-ghost'">
                        <span class="w-1.5 h-1.5 rounded-full inline-block" :class="STATUS_CFG[siswa.status]?.dot"></span>
                        {{ STATUS_CFG[siswa.status]?.label ?? siswa.status }}
                      </span>
                    </td>
                    <td class="text-right">
                      <button class="btn btn-xs btn-ghost gap-1 text-[11px]" @click="openOverride(siswa)">
                        <Edit3 class="w-3 h-3" /> Manual
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
              <div v-if="filteredAbsensi.length === 0" class="flex flex-col items-center justify-center py-14 gap-2">
                <UserX class="w-10 h-10 text-base-content/20" />
                <p class="text-sm text-base-content/35">Tidak ada data untuk kelas <strong>{{ kelasFilter }}</strong>.</p>
              </div>
            </div>
          </div>

          <!-- TAB: Registrasi Wajah -->
          <div v-show="activeTab === 'reg'" class="p-4 sm:p-5">
            <div class="max-w-md">
              <p class="text-sm text-base-content/60 mb-5">Foto wajah siswa dari 3 sudut berbeda untuk akurasi pengenalan yang optimal.</p>
              <Transition name="fade">
                <div v-if="regSuccess" role="alert" class="alert alert-success alert-sm mb-4 py-2">
                  <CheckCircle2 class="w-4 h-4 flex-shrink-0" /><span class="text-sm">Siswa berhasil didaftarkan!</span>
                </div>
              </Transition>
              <Transition name="fade">
                <div v-if="regError" role="alert" class="alert alert-error alert-sm mb-4 py-2">
                  <X class="w-4 h-4 flex-shrink-0" /><span class="text-sm">{{ regError }}</span>
                </div>
              </Transition>
              <div class="flex gap-3 mb-4">
                <div class="flex-1">
                  <label class="label py-0.5"><span class="label-text text-xs">Nama Lengkap</span></label>
                  <input v-model="regForm.nama" type="text" placeholder="cth. Budi Santoso" class="input input-sm input-bordered w-full" />
                </div>
                <div class="w-24">
                  <label class="label py-0.5"><span class="label-text text-xs">Kelas</span></label>
                  <select v-model="regForm.kelas" class="select select-sm select-bordered w-full">
                    <option v-for="k in KELAS_LIST" :key="k" :value="k">{{ k }}</option>
                  </select>
                </div>
              </div>
              <div class="mb-5">
                <label class="label py-0.5"><span class="label-text text-xs">NIS (Nomor Induk Siswa)</span></label>
                <input v-model="regForm.nis" type="text" placeholder="cth. 2024001" class="input input-sm input-bordered w-44" />
              </div>
              <p class="text-xs font-medium mb-2.5">Ambil Foto Wajah <span class="font-normal text-base-content/40 ml-1">(3 sudut)</span></p>
              <div class="grid grid-cols-3 gap-3 mb-5">
                <button v-for="slot in PHOTO_SLOTS" :key="slot.key" type="button"
                  class="aspect-square rounded-xl border border-dashed flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all group"
                  :class="photos[slot.key] ? 'bg-success/8 border-success/60 text-success' : 'bg-base-200 border-base-300 hover:bg-base-300 hover:border-primary/40'">
                  <Camera class="w-5 h-5 transition-colors" :class="photos[slot.key] ? 'text-success' : 'text-base-content/30 group-hover:text-base-content/50'" />
                  <span class="text-[11px] transition-colors" :class="photos[slot.key] ? 'text-success font-medium' : 'text-base-content/40 group-hover:text-base-content/60'">{{ slot.label }}</span>
                </button>
              </div>
              <button class="btn btn-primary btn-sm gap-2" :disabled="!regValid || regLoading" @click="submitReg">
                <span v-if="regLoading" class="loading loading-spinner loading-xs"></span>
                <UserPlus v-else class="w-4 h-4" />
                {{ regLoading ? 'Mendaftarkan…' : 'Daftarkan Siswa' }}
              </button>
            </div>
          </div>

          <!-- TAB: Log Aktivitas -->
          <div v-show="activeTab === 'log'" class="p-4 sm:p-5">
            <LogTable :data="logData ?? []" :loading="logLoading" />
          </div>

        </div>
      </div>
    </main>

    <!-- ─── Override Modal ─────────────────────────────────────── -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="overrideTarget"
          class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          @click.self="closeOverride">
          <div class="card bg-base-100 shadow-2xl w-full max-w-sm border border-base-300/60">
            <div class="card-body p-5">
              <div class="flex items-start justify-between mb-4">
                <div>
                  <h3 class="font-semibold text-base">Override Status Manual</h3>
                  <p class="text-xs text-base-content/50 mt-0.5">{{ overrideTarget?.nama }} · {{ overrideTarget?.kelas }}</p>
                </div>
                <button class="btn btn-xs btn-ghost btn-circle" @click="closeOverride"><X class="w-4 h-4" /></button>
              </div>
              <p class="text-xs font-medium text-base-content/60 mb-2.5">Pilih status baru:</p>
              <div class="flex flex-col gap-2 mb-5">
                <label v-for="(cfg, key) in STATUS_CFG" v-if="key !== 'gagal'" :key="key"
                  class="flex items-center gap-3 cursor-pointer p-2.5 rounded-lg border transition-all"
                  :class="overrideStatus === key ? 'border-primary/50 bg-primary/5' : 'border-base-300/60 hover:border-base-300'">
                  <input type="radio" :value="key" v-model="overrideStatus" class="radio radio-xs radio-primary" />
                  <span class="badge badge-sm" :class="cfg.badge">{{ cfg.label }}</span>
                  <span class="text-xs text-base-content/50 ml-auto">{{ key }}</span>
                </label>
              </div>
              <div class="flex gap-2 justify-end">
                <button class="btn btn-sm btn-ghost" @click="closeOverride">Batal</button>
                <button class="btn btn-sm btn-primary gap-1.5" :disabled="overrideLoading" @click="submitOverride">
                  <span v-if="overrideLoading" class="loading loading-spinner loading-xs"></span>
                  <Check v-else class="w-4 h-4" /> Simpan
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
.slide-fade-enter-active, .slide-fade-leave-active { transition: opacity 0.15s ease, transform 0.15s ease; }
.slide-fade-enter-from, .slide-fade-leave-to { opacity: 0; transform: translateY(-4px); }
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.modal-enter-active, .modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-active .card, .modal-leave-active .card { transition: transform 0.2s ease; }
.modal-enter-from .card { transform: scale(0.94) translateY(8px); }
.modal-leave-to .card { transform: scale(0.94); }
</style>
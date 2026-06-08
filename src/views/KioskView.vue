<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { fetchStatistik, fetchLogAktivitas } from '@/api/absensi'
import CameraFeed from '@/components/CameraFeed.vue'
import { useTheme } from '@/composables/useTheme'
import { Sun, Moon, LogOut, CheckCircle2, XCircle, Clock } from 'lucide-vue-next'

const router = useRouter()
const auth   = useAuthStore()
const { isDark, toggleTheme } = useTheme()

// ── State ─────────────────────────────────────────────────────
const status      = ref('idle')   // 'idle' | 'success' | 'fail'
const resultData  = ref(null)     // { nama, kelas, waktu, absen_status }
const errorMsg    = ref('')
const stats       = ref({ hadir: 0, terlambat: 0, absen: 0, belumAbsen: 0, totalSiswa: 0 })
const recentLog   = ref([])
const clock       = ref('')
const dateStr     = ref('')

// ── Clock ──────────────────────────────────────────────────────
function updateClock() {
  const now = new Date()
  clock.value   = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  dateStr.value = now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

// ── Handlers dari CameraFeed ───────────────────────────────────
let resetTimer = null

function onResult(data) {
  resultData.value = data
  status.value     = 'success'
  // Text-to-Speech ramah anak
  if ('speechSynthesis' in window) {
    const msg = new SpeechSynthesisUtterance(
      `Selamat ${data.absen_status === 'terlambat' ? 'pagi' : 'pagi'}, ${data.nama}. ${data.absen_status === 'terlambat' ? 'Kamu terlambat hari ini.' : 'Selamat belajar!'}`
    )
    msg.lang = 'id-ID'
    window.speechSynthesis.speak(msg)
  }
  refreshData()
  clearTimeout(resetTimer)
  resetTimer = setTimeout(() => { status.value = 'idle'; resultData.value = null }, 4500)
}

function onError(msg) {
  errorMsg.value = msg
  status.value   = 'fail'
  clearTimeout(resetTimer)
  resetTimer = setTimeout(() => { status.value = 'idle'; errorMsg.value = '' }, 3000)
}

// ── Data refresh ───────────────────────────────────────────────
async function refreshData() {
  try {
    const [s, l] = await Promise.all([fetchStatistik(), fetchLogAktivitas()])
    stats.value     = s
    recentLog.value = l.slice(0, 8)
  } catch { /* silent */ }
}

async function handleLogout() {
  await auth.logout()
  router.push({ name: 'Login' })
}

// ── Log status color ──────────────────────────────────────────
const dotColor = (s) => ({
  hadir:     'bg-success',
  terlambat: 'bg-warning',
  gagal:     'bg-error',
  manual:    'bg-info',
}[s] || 'bg-base-content/20')

// ── Lifecycle ──────────────────────────────────────────────────
let clockTimer, dataTimer

onMounted(() => {
  updateClock()
  refreshData()
  clockTimer = setInterval(updateClock, 1000)
  dataTimer  = setInterval(refreshData, 30_000)
})

onUnmounted(() => {
  clearInterval(clockTimer)
  clearInterval(dataTimer)
  clearTimeout(resetTimer)
})
</script>

<template>
  <div class="min-h-screen flex overflow-hidden" :class="isDark ? 'bg-base-300' : 'bg-base-200'">

    <!-- ═══ LEFT — Camera Panel ══════════════════════════════════ -->
    <div class="flex-1 flex flex-col items-center justify-between p-8 relative">

      <!-- Top bar -->
      <div class="w-full flex items-center justify-between">
        <div>
          <h1 class="text-xl font-black text-primary tracking-wide">SD NEGERI NUSANTARA</h1>
          <p class="text-base-content/50 text-xs mt-0.5">{{ dateStr }}</p>
        </div>
        <div class="flex items-center gap-2">
          <!-- Theme toggle -->
          <button @click="toggleTheme" class="btn btn-sm btn-ghost border border-base-300/60">
            <Sun v-if="isDark" class="w-3.5 h-3.5 text-warning" />
            <Moon v-else class="w-3.5 h-3.5 text-base-content/60" />
          </button>
          <!-- Logout -->
          <button @click="handleLogout" class="btn btn-sm btn-ghost border border-base-300/60 gap-1">
            <LogOut class="w-3.5 h-3.5" />
            <span class="text-xs hidden sm:inline">Keluar</span>
          </button>
        </div>
      </div>

      <!-- Camera + overlay -->
      <div class="relative w-full max-w-2xl aspect-video select-none">

        <!-- Camera component (kiosk mode — auto-scan tiap 2 detik) -->
        <CameraFeed
          mode="kiosk"
          :interval="2000"
          class="w-full h-full shadow-2xl border-4"
          :class="{
            'border-success animate-pulse-glow-success': status === 'success',
            'border-error':   status === 'fail',
            'border-base-100': status === 'idle',
          }"
          @result="onResult"
          @error="onError"
        >
          <!-- Face bracket overlay -->
          <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div class="relative w-52 h-64">
              <!-- corners -->
              <span class="absolute top-0 left-0 w-7 h-7 border-t-[3px] border-l-[3px] rounded-tl-sm"
                :class="status === 'success' ? 'border-success' : status === 'fail' ? 'border-error' : 'border-primary'" />
              <span class="absolute top-0 right-0 w-7 h-7 border-t-[3px] border-r-[3px] rounded-tr-sm"
                :class="status === 'success' ? 'border-success' : status === 'fail' ? 'border-error' : 'border-primary'" />
              <span class="absolute bottom-0 left-0 w-7 h-7 border-b-[3px] border-l-[3px] rounded-bl-sm"
                :class="status === 'success' ? 'border-success' : status === 'fail' ? 'border-error' : 'border-primary'" />
              <span class="absolute bottom-0 right-0 w-7 h-7 border-b-[3px] border-r-[3px] rounded-br-sm"
                :class="status === 'success' ? 'border-success' : status === 'fail' ? 'border-error' : 'border-primary'" />
              <!-- Scan line (idle only) -->
              <div v-if="status === 'idle'"
                class="absolute left-2 right-2 h-px bg-gradient-to-r from-transparent via-primary to-transparent animate-scan opacity-70" />
            </div>
          </div>

          <!-- Result overlay (success) -->
          <Transition name="fade">
            <div v-if="status === 'success'"
              class="absolute inset-0 bg-success/90 flex flex-col items-center justify-center gap-4 text-success-content text-center p-8">
              <CheckCircle2 class="w-24 h-24" />
              <h2 class="text-4xl font-black leading-tight">ABSEN BERHASIL!</h2>
              <p class="text-2xl font-bold bg-white/20 px-5 py-2 rounded-full">{{ resultData?.nama }}</p>
              <div class="flex items-center gap-4 text-sm font-semibold opacity-80">
                <span>Kelas {{ resultData?.kelas }}</span>
                <span>·</span>
                <span>{{ resultData?.waktu }}</span>
                <span>·</span>
                <span class="capitalize">{{ resultData?.absen_status }}</span>
              </div>
            </div>
          </Transition>

          <!-- Result overlay (fail) -->
          <Transition name="fade">
            <div v-if="status === 'fail'"
              class="absolute inset-0 bg-error/80 flex flex-col items-center justify-center gap-4 text-error-content text-center p-8">
              <XCircle class="w-20 h-20" />
              <h2 class="text-3xl font-black">Tidak Dikenali</h2>
              <p class="text-base font-medium opacity-80">{{ errorMsg }}</p>
            </div>
          </Transition>
        </CameraFeed>

        <!-- Status badge below camera -->
        <div class="absolute -bottom-10 left-0 right-0 flex justify-center">
          <span class="flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium"
            :class="status === 'success' ? 'bg-success/15 text-success'
                  : status === 'fail'    ? 'bg-error/15 text-error'
                  : 'bg-base-content/10 text-base-content/60'">
            <span class="w-1.5 h-1.5 rounded-full animate-pulse"
              :class="status === 'success' ? 'bg-success' : status === 'fail' ? 'bg-error' : 'bg-primary'" />
            {{ status === 'success' ? 'Absensi Tercatat'
              : status === 'fail'   ? 'Gagal Dikenali'
              : 'Menunggu Wajah...' }}
          </span>
        </div>
      </div>

      <!-- Instruction footer -->
      <p class="text-base-content/40 text-sm text-center">
        Hadapkan wajah ke kamera &mdash; absensi tercatat otomatis 😊
      </p>
    </div>

    <!-- ═══ RIGHT — Info Panel ════════════════════════════════════ -->
    <div class="w-80 xl:w-96 border-l border-base-content/10 flex flex-col gap-4 p-5 overflow-hidden">

      <!-- Clock -->
      <div class="text-center py-2">
        <p class="text-4xl font-black tabular-nums text-base-content tracking-widest">{{ clock }}</p>
      </div>

      <!-- Stats 2×2 -->
      <div class="grid grid-cols-2 gap-3">
        <div class="rounded-2xl p-4 flex flex-col bg-success/10 border border-success/20">
          <p class="text-3xl font-black text-success">{{ stats.hadir }}</p>
          <p class="text-xs text-base-content/50 mt-1">Hadir</p>
        </div>
        <div class="rounded-2xl p-4 flex flex-col bg-warning/10 border border-warning/20">
          <p class="text-3xl font-black text-warning">{{ stats.terlambat }}</p>
          <p class="text-xs text-base-content/50 mt-1">Terlambat</p>
        </div>
        <div class="rounded-2xl p-4 flex flex-col bg-error/10 border border-error/20">
          <p class="text-3xl font-black text-error">{{ stats.absen }}</p>
          <p class="text-xs text-base-content/50 mt-1">Absen</p>
        </div>
        <div class="rounded-2xl p-4 flex flex-col bg-base-content/5 border border-base-content/10">
          <p class="text-3xl font-black text-base-content/60">{{ stats.belumAbsen }}</p>
          <p class="text-xs text-base-content/50 mt-1">Belum</p>
        </div>
      </div>

      <!-- Log aktivitas -->
      <div class="flex-1 rounded-2xl border border-base-content/10 bg-base-100/50 p-4 flex flex-col min-h-0">
        <p class="text-sm font-bold text-base-content mb-3">Log Aktivitas</p>
        <div class="flex-1 overflow-y-auto space-y-2.5 min-h-0" style="scrollbar-width:none">
          <div v-for="log in recentLog" :key="log.id"
            class="flex items-start gap-3 pb-2.5 border-b border-base-content/5">
            <span class="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" :class="dotColor(log.status)" />
            <div class="flex-1 min-w-0">
              <p class="text-xs font-medium text-base-content/80 truncate">{{ log.kejadian }}</p>
              <p class="text-xs text-base-content/35 mt-0.5">{{ log.waktu }}</p>
            </div>
          </div>
          <p v-if="!recentLog.length" class="text-xs text-base-content/30 text-center py-4">
            Belum ada aktivitas hari ini
          </p>
        </div>
      </div>

      <!-- Admin link -->
      <button @click="router.push({ name: 'Admin' })"
        class="btn btn-sm btn-outline w-full gap-1.5 text-xs">
        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
        </svg>
        Buka Panel Admin
      </button>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

@keyframes scan {
  0%   { top: 15%; }
  50%  { top: 80%; }
  100% { top: 15%; }
}
.animate-scan { position: absolute; animation: scan 2.5s ease-in-out infinite; }
</style>
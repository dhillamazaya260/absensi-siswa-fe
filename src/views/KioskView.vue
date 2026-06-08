<!--
  KioskView.vue — Layar Kiosk Absensi Wajah
  ═══════════════════════════════════════════════════════════════════
  UPGRADE v2:
    ▸ pauseScan() saat overlay sukses/gagal tampil (stop kirim frame percuma)
    ▸ resumeScan() setelah overlay selesai
    ▸ Bedakan tampilan: "no_face" (guide saja) vs "fail" (error overlay)
    ▸ Fix bug TTS: "pagi" selalu tampil bahkan untuk "terlambat"
    ▸ Fix nama sekolah hardcode yang salah
    ▸ Tambah status 'already' (sudah absen) dengan tampilan tersendiri
-->

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { fetchStatistik, fetchLogAktivitas } from '@/api/absensi'
import CameraFeed from '@/components/CameraFeed.vue'
import { useTheme } from '@/composables/useTheme'
import { Sun, Moon, LogOut, CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-vue-next'

const router = useRouter()
const auth   = useAuthStore()
const { isDark, toggleTheme } = useTheme()

// ── State ──────────────────────────────────────────────────────────────
// status: 'idle' | 'success' | 'fail' | 'already'
const status     = ref('idle')
const resultData = ref(null)
const errorMsg   = ref('')
const errorReason = ref('') // 'not_found' | 'error' | 'no_face'
const stats      = ref({ hadir: 0, terlambat: 0, absen: 0, belumAbsen: 0, totalSiswa: 0 })
const recentLog  = ref([])
const clock      = ref('')
const dateStr    = ref('')
const cameraRef  = ref(null)

// ── Clock ──────────────────────────────────────────────────────────────
function updateClock() {
  const now  = new Date()
  clock.value   = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  dateStr.value = now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

// ── Text-to-Speech ─────────────────────────────────────────────────────
function speak(text) {
  if (!('speechSynthesis' in window)) return
  window.speechSynthesis.cancel()
  const msg = new SpeechSynthesisUtterance(text)
  msg.lang  = 'id-ID'
  window.speechSynthesis.speak(msg)
}

// ── Handlers dari CameraFeed ───────────────────────────────────────────
let resetTimer = null

function resetToIdle(delay = 4500) {
  clearTimeout(resetTimer)
  resetTimer = setTimeout(() => {
    status.value     = 'idle'
    resultData.value = null
    errorMsg.value   = ''
    errorReason.value = ''
    cameraRef.value?.resumeScan()
  }, delay)
}

function onResult(data) {
  // Pause scan segera agar tidak ada kiriman frame saat overlay tampil
  cameraRef.value?.pauseScan()

  if (data.status === 'success') {
    resultData.value = data
    status.value     = 'success'

    // FIX: TTS yang benar (sebelumnya selalu bilang 'pagi' untuk terlambat)
    const salam = data.absen_status === 'terlambat'
      ? `${data.nama}, kamu terlambat hari ini.`
      : `Selamat pagi, ${data.nama}. Selamat belajar!`
    speak(salam)

    refreshData()
    resetToIdle(5000)

  } else if (data.status === 'already') {
    // Sudah absen — tampilkan notifikasi ringan, bukan error
    resultData.value = data
    status.value     = 'already'
    speak(`${data.nama} sudah absen tadi.`)
    resetToIdle(3500)
  }
  // 'cooldown' — silent, tidak perlu tampilkan apapun
}

function onError(msg) {
  cameraRef.value?.pauseScan()
  errorMsg.value    = msg
  errorReason.value = 'not_found'
  status.value      = 'fail'
  resetToIdle(3000)
}

// "no_face" — tidak tampilkan error, cukup reset status
function onNoFace() {
  if (status.value === 'idle') {
    // Tidak ada face — tetap idle, tidak perlu apa-apa
  }
}

// ── Data refresh ───────────────────────────────────────────────────────
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

// ── Log dot color ──────────────────────────────────────────────────────
const dotColor = (s) => ({
  hadir    : 'bg-success',
  terlambat: 'bg-warning',
  gagal    : 'bg-error',
  manual   : 'bg-info',
}[s] || 'bg-base-content/20')

// ── Lifecycle ──────────────────────────────────────────────────────────
let clockTimer, dataTimer

onMounted(() => {
  updateClock()
  refreshData()
  clockTimer = setInterval(updateClock,   1_000)
  dataTimer  = setInterval(refreshData, 30_000)
})

onUnmounted(() => {
  clearInterval(clockTimer)
  clearInterval(dataTimer)
  clearTimeout(resetTimer)
})
</script>

<template>
  <div class="min-h-screen flex overflow-hidden"
       :class="isDark ? 'bg-base-300' : 'bg-base-200'">

    <!-- ═══ LEFT — Camera Panel ═════════════════════════════════════════ -->
    <div class="flex-1 flex flex-col items-center justify-between p-8 relative">

      <!-- Top bar -->
      <div class="w-full flex items-center justify-between">
        <div>
          <!-- FIX: nama sekolah yang benar -->
          <h1 class="text-xl font-black text-primary tracking-wide">
            SD NEGERI KALIKONDANG 01
          </h1>
          <p class="text-base-content/50 text-xs mt-0.5">{{ dateStr }}</p>
        </div>
        <div class="flex items-center gap-2">
          <button @click="toggleTheme"
                  class="btn btn-sm btn-ghost border border-base-300/60">
            <Sun  v-if="isDark" class="w-3.5 h-3.5 text-warning" />
            <Moon v-else        class="w-3.5 h-3.5 text-base-content/60" />
          </button>
          <button @click="handleLogout"
                  class="btn btn-sm btn-ghost border border-base-300/60 gap-1">
            <LogOut class="w-3.5 h-3.5" />
            <span class="text-xs hidden sm:inline">Keluar</span>
          </button>
        </div>
      </div>

      <!-- Camera + overlay -->
      <div class="relative w-full max-w-2xl aspect-video select-none">

        <CameraFeed
          ref="cameraRef"
          mode="kiosk"
          :interval="2000"
          class="w-full h-full shadow-2xl border-4"
          :class="{
            'border-success animate-pulse-glow-success': status === 'success',
            'border-info'   : status === 'already',
            'border-error'  : status === 'fail',
            'border-base-100': status === 'idle',
          }"
          @result="onResult"
          @error="onError"
          @no-face="onNoFace"
        >
          <!-- Face bracket overlay (idle only) -->
          <div v-if="status === 'idle'"
               class="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div class="relative w-52 h-64">
              <span class="absolute top-0 left-0 w-7 h-7 border-t-[3px] border-l-[3px] rounded-tl-sm border-primary" />
              <span class="absolute top-0 right-0 w-7 h-7 border-t-[3px] border-r-[3px] rounded-tr-sm border-primary" />
              <span class="absolute bottom-0 left-0 w-7 h-7 border-b-[3px] border-l-[3px] rounded-bl-sm border-primary" />
              <span class="absolute bottom-0 right-0 w-7 h-7 border-b-[3px] border-r-[3px] rounded-br-sm border-primary" />
              <!-- Scan line -->
              <div class="absolute left-2 right-2 h-px bg-gradient-to-r
                          from-transparent via-primary to-transparent animate-scan opacity-70" />
            </div>
          </div>

          <!-- Overlay: Sukses ─────────────────────────────────────── -->
          <Transition name="fade">
            <div v-if="status === 'success'"
              class="absolute inset-0 bg-success/90 flex flex-col items-center
                     justify-center gap-4 text-success-content text-center p-8">
              <CheckCircle2 class="w-24 h-24" />
              <h2 class="text-4xl font-black leading-tight">ABSEN BERHASIL!</h2>
              <p class="text-2xl font-bold bg-white/20 px-5 py-2 rounded-full">
                {{ resultData?.nama }}
              </p>
              <div class="flex items-center gap-4 text-sm font-semibold opacity-80">
                <span>Kelas {{ resultData?.kelas }}</span>
                <span>·</span>
                <span>{{ resultData?.waktu }}</span>
                <span>·</span>
                <span class="capitalize px-2 py-0.5 rounded-full"
                      :class="resultData?.absen_status === 'terlambat'
                        ? 'bg-warning/30' : 'bg-white/20'">
                  {{ resultData?.absen_status === 'terlambat' ? '⚠️ Terlambat' : '✅ Hadir' }}
                </span>
              </div>
            </div>
          </Transition>

          <!-- Overlay: Sudah Absen ────────────────────────────────── -->
          <Transition name="fade">
            <div v-if="status === 'already'"
              class="absolute inset-0 bg-info/85 flex flex-col items-center
                     justify-center gap-4 text-info-content text-center p-8">
              <Clock class="w-20 h-20" />
              <h2 class="text-3xl font-black">Sudah Absen</h2>
              <p class="text-xl font-bold bg-white/20 px-5 py-2 rounded-full">
                {{ resultData?.nama }}
              </p>
              <p class="text-sm opacity-75">
                Absen tercatat pukul {{ resultData?.waktu_masuk || resultData?.waktu }}
              </p>
            </div>
          </Transition>

          <!-- Overlay: Gagal ──────────────────────────────────────── -->
          <Transition name="fade">
            <div v-if="status === 'fail'"
              class="absolute inset-0 bg-error/80 flex flex-col items-center
                     justify-center gap-4 text-error-content text-center p-8">
              <XCircle class="w-20 h-20" />
              <h2 class="text-3xl font-black">Tidak Dikenali</h2>
              <p class="text-base font-medium opacity-80">{{ errorMsg }}</p>
              <p class="text-xs opacity-60 max-w-xs">
                Pastikan wajah menghadap kamera dengan pencahayaan yang cukup
              </p>
            </div>
          </Transition>
        </CameraFeed>

        <!-- Status badge bawah kamera -->
        <div class="absolute -bottom-10 left-0 right-0 flex justify-center">
          <span class="flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium"
            :class="status === 'success' ? 'bg-success/15 text-success'
                  : status === 'already' ? 'bg-info/15 text-info'
                  : status === 'fail'    ? 'bg-error/15 text-error'
                  : 'bg-base-content/10 text-base-content/60'">
            <span class="w-1.5 h-1.5 rounded-full animate-pulse"
              :class="status === 'success' ? 'bg-success'
                    : status === 'already' ? 'bg-info'
                    : status === 'fail'    ? 'bg-error'
                    : 'bg-primary'" />
            {{ status === 'success' ? 'Absensi Tercatat'
              : status === 'already' ? 'Sudah Absen Hari Ini'
              : status === 'fail'   ? 'Gagal Dikenali'
              : 'Hadapkan Wajah ke Kamera...' }}
          </span>
        </div>
      </div>

      <!-- Footer instruction -->
      <p class="text-base-content/40 text-sm text-center">
        Hadapkan wajah ke kamera &mdash; absensi tercatat otomatis 😊
      </p>
    </div>

    <!-- ═══ RIGHT — Info Panel ══════════════════════════════════════════ -->
    <div class="w-80 xl:w-96 border-l border-base-content/10
                flex flex-col gap-4 p-5 overflow-hidden">

      <!-- Clock -->
      <div class="text-center py-2">
        <p class="text-4xl font-black tabular-nums text-base-content tracking-widest">
          {{ clock }}
        </p>
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
      <div class="flex-1 rounded-2xl border border-base-content/10
                  bg-base-100/50 p-4 flex flex-col min-h-0">
        <p class="text-sm font-bold text-base-content mb-3">Log Aktivitas</p>
        <div class="flex-1 overflow-y-auto space-y-2.5 min-h-0"
             style="scrollbar-width:none">
          <div v-for="log in recentLog" :key="log.id"
            class="flex items-start gap-3 pb-2.5 border-b border-base-content/5">
            <span class="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                  :class="dotColor(log.status)" />
            <div class="flex-1 min-w-0">
              <p class="text-xs font-medium text-base-content/80 truncate">{{ log.kejadian }}</p>
              <p class="text-xs text-base-content/35 mt-0.5">{{ log.waktu }}</p>
            </div>
          </div>
          <p v-if="!recentLog.length"
             class="text-xs text-base-content/30 text-center py-4">
            Belum ada aktivitas hari ini
          </p>
        </div>
      </div>

      <!-- Admin link -->
      <button @click="router.push({ name: 'Admin' })"
              class="btn btn-sm btn-outline w-full gap-1.5 text-xs">
        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24"
             stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round"
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2
               M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
        </svg>
        Buka Panel Admin
      </button>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from,  .fade-leave-to      { opacity: 0; }

@keyframes scan {
  0%   { top: 15%; }
  50%  { top: 80%; }
  100% { top: 15%; }
}
.animate-scan {
  position: absolute;
  animation: scan 2.5s ease-in-out infinite;
}
</style>
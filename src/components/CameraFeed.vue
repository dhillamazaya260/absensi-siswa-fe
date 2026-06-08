<!--
  CameraFeed.vue — Komponen kamera pintar dengan pause/resume
  ═══════════════════════════════════════════════════════════════════
  UPGRADE v2:
    ▸ pauseScan() / resumeScan() — parent bisa hentikan scan saat overlay tampil
      → mencegah kiriman API yang tidak perlu selama animasi sukses/gagal
    ▸ Bedakan status "no_face" vs "not_found" vs "already" dari backend v2
    ▸ Frame quality guard: skip frame terlalu gelap (brightness < 30)
    ▸ Cooldown 3 detik setelah 'fail' sebelum scan berikutnya
    ▸ Indikator scanning lebih informatif

  Events:
    @result(data)  — { status:'success', nama, kelas, waktu, absen_status }
                   — { status:'already', nama, waktu_masuk }
    @no-face       — wajah tidak terdeteksi (dipakai untuk atur overlay kamera)
    @error(msg)    — kegagalan lain (not_found, error)
    @photo(base64) — foto diambil (mode capture)

  Exposed (untuk AdminView):
    captureBase64()  — ambil foto untuk registrasi
    pauseScan()      — hentikan auto-scan sementara
    resumeScan()     — lanjutkan auto-scan
-->

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { recognizeFace } from '@/api/absensi'

const props = defineProps({
  mode    : { type: String, default: 'kiosk' },   // 'kiosk' | 'capture'
  interval: { type: Number, default: 2000 },
})

const emit = defineEmits(['result', 'error', 'no-face', 'photo'])

const videoEl    = ref(null)
const canvasEl   = ref(null)
const scanning   = ref(false)   // sedang mengirim ke backend
const paused     = ref(false)   // scan dijeda oleh parent
const hasError   = ref(false)
const errMsg     = ref('')
const faceStatus = ref('waiting') // 'waiting' | 'detected' | 'processing'

// ── Camera ────────────────────────────────────────────────────────────
let stream = null

async function startCamera() {
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width     : { ideal: 1280 },
        height    : { ideal: 720  },
        facingMode: 'user',
      },
      audio: false,
    })
    if (videoEl.value) videoEl.value.srcObject = stream
    hasError.value = false
  } catch (e) {
    hasError.value = true
    errMsg.value   = 'Kamera tidak dapat diakses. Periksa izin browser.'
    emit('error', errMsg.value)
  }
}

function stopCamera() {
  if (stream) {
    stream.getTracks().forEach((t) => t.stop())
    stream = null
  }
}

// ── Capture frame → Blob ──────────────────────────────────────────────
function captureBlob(quality = 0.85) {
  return new Promise((resolve) => {
    const video  = videoEl.value
    const canvas = canvasEl.value
    if (!video || !canvas || video.readyState < 2) return resolve(null)

    canvas.width  = video.videoWidth  || 640
    canvas.height = video.videoHeight || 480

    const ctx = canvas.getContext('2d')
    // Koreksi mirror: video CSS di-flip scaleX(-1), canvas perlu di-unflip
    ctx.save()
    ctx.scale(-1, 1)
    ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height)
    ctx.restore()

    canvas.toBlob(resolve, 'image/jpeg', quality)
  })
}

// Cek kecerahan frame di sisi client (hindari kirim frame gelap)
function checkBrightness() {
  const video  = videoEl.value
  const canvas = canvasEl.value
  if (!video || !canvas || video.readyState < 2) return true // assume ok

  const sampleCanvas = document.createElement('canvas')
  sampleCanvas.width  = 64
  sampleCanvas.height = 48
  const ctx = sampleCanvas.getContext('2d')
  ctx.drawImage(video, 0, 0, 64, 48)

  const data = ctx.getImageData(0, 0, 64, 48).data
  let sum = 0
  for (let i = 0; i < data.length; i += 4) {
    // luminance approximation
    sum += (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114)
  }
  const mean = sum / (64 * 48)
  return mean >= 25 // threshold kecerahan minimum
}

// ── captureBase64 (mode capture di AdminView) ─────────────────────────
async function captureBase64() {
  const blob = await captureBlob(0.92)
  if (!blob) return
  const reader = new FileReader()
  reader.onload = () => emit('photo', reader.result)
  reader.readAsDataURL(blob)
}

// ── Recognize loop (mode kiosk) ───────────────────────────────────────
let failCooldown = false
let failTimer    = null

async function recognize() {
  // Jangan scan jika: sedang scanning, dijeda parent, atau dalam cooldown fail
  if (scanning.value || paused.value || failCooldown) return

  // Skip frame gelap
  if (!checkBrightness()) {
    faceStatus.value = 'waiting'
    return
  }

  const blob = await captureBlob()
  if (!blob) return

  scanning.value   = true
  faceStatus.value = 'processing'

  try {
    const data = await recognizeFace(blob)

    // ── Wajah tidak ada di frame — tidak perlu emit error ────────────
    if (data.status === 'fail' && data.reason === 'no_face') {
      faceStatus.value = 'waiting'
      emit('no-face')
      return
    }

    // ── Sukses atau sudah absen ───────────────────────────────────────
    if (data.status === 'success' || data.status === 'already') {
      faceStatus.value = 'detected'
      emit('result', data)
      return
    }

    // ── Cooldown (double-scan) ────────────────────────────────────────
    if (data.status === 'cooldown') {
      faceStatus.value = 'waiting'
      // Silent — tidak perlu tampilkan error
      return
    }

    // ── Wajah tidak dikenal — terapkan fail cooldown 3 detik ─────────
    faceStatus.value = 'waiting'
    emit('error', data.message || 'Wajah tidak dikenali')
    failCooldown = true
    clearTimeout(failTimer)
    failTimer = setTimeout(() => { failCooldown = false }, 3000)

  } catch {
    faceStatus.value = 'waiting'
    emit('error', 'Koneksi ke server gagal')
    failCooldown = true
    clearTimeout(failTimer)
    failTimer = setTimeout(() => { failCooldown = false }, 5000)
  } finally {
    scanning.value = false
  }
}

// ── Kontrol scan (diakses parent via expose) ──────────────────────────
function pauseScan() {
  paused.value = true
}

function resumeScan() {
  paused.value     = false
  faceStatus.value = 'waiting'
  failCooldown     = false
  clearTimeout(failTimer)
}

defineExpose({ captureBase64, pauseScan, resumeScan })

// ── Lifecycle ─────────────────────────────────────────────────────────
let scanTimer = null

onMounted(async () => {
  await startCamera()
  if (props.mode === 'kiosk') {
    scanTimer = setInterval(recognize, props.interval)
  }
})

onUnmounted(() => {
  stopCamera()
  if (scanTimer) clearInterval(scanTimer)
  clearTimeout(failTimer)
})
</script>

<template>
  <div class="relative w-full h-full overflow-hidden rounded-2xl bg-neutral">
    <!-- Video — di-mirror secara visual (CSS) -->
    <video
      ref="videoEl"
      class="w-full h-full object-cover"
      style="transform: scaleX(-1);"
      autoplay muted playsinline
    />
    <!-- Hidden canvas untuk capture (tidak di-mirror — kirim asli ke backend) -->
    <canvas ref="canvasEl" class="hidden" />

    <!-- Status indicator pojok kanan atas -->
    <div v-if="mode === 'kiosk' && !hasError"
      class="absolute top-3 right-3 flex items-center gap-1.5 bg-black/50
             rounded-full px-2.5 py-1 text-xs text-white backdrop-blur-sm">
      <template v-if="paused">
        <span class="w-1.5 h-1.5 rounded-full bg-gray-400" />
        Dijeda
      </template>
      <template v-else-if="scanning">
        <span class="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
        Menganalisa...
      </template>
      <template v-else>
        <span class="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
        Siap
      </template>
    </div>

    <!-- Camera error state -->
    <div v-if="hasError"
      class="absolute inset-0 flex flex-col items-center justify-center
             bg-neutral text-error gap-3">
      <svg class="w-10 h-10 opacity-60" fill="none" viewBox="0 0 24 24"
           stroke="currentColor" stroke-width="1.5">
        <path stroke-linecap="round" stroke-linejoin="round"
          d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71
             c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5
             -3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/>
      </svg>
      <p class="text-sm text-center px-4 opacity-70">{{ errMsg }}</p>
      <button class="btn btn-xs btn-outline btn-error mt-1"
              @click="startCamera">
        Coba Lagi
      </button>
    </div>

    <!-- Slot untuk overlay (bracket wajah, scan line, result overlay) -->
    <slot />
  </div>
</template>
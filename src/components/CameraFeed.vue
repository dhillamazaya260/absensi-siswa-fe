<!--
  CameraFeed.vue
  ─────────────────────────────────────────────────────────────────
  Komponen kamera yang bisa dipakai di:
    - KioskView  → mode="kiosk"   (scan otomatis tiap 2 detik)
    - AdminView  → mode="capture" (tombol ambil foto manual)

  Events:
    @result(data)  → hasil recognize dari backend { status, nama, kelas, waktu, absen_status }
    @error(msg)    → pesan gagal
    @photo(base64) → foto diambil (mode capture)
-->
<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { recognizeFace } from '@/api/absensi'

const props = defineProps({
  mode:     { type: String, default: 'kiosk' },   // 'kiosk' | 'capture'
  interval: { type: Number, default: 2000 },
})

const emit = defineEmits(['result', 'error', 'photo'])

const videoEl  = ref(null)
const canvasEl = ref(null)
const scanning = ref(false)
const hasError = ref(false)
const errMsg   = ref('')

// ── Camera ─────────────────────────────────────────────────────
let stream = null

async function startCamera() {
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
      audio: false,
    })
    if (videoEl.value) videoEl.value.srcObject = stream
    hasError.value = false
  } catch {
    hasError.value = true
    errMsg.value   = 'Kamera tidak bisa diakses. Periksa izin browser.'
    emit('error', errMsg.value)
  }
}

function stopCamera() {
  if (stream) { stream.getTracks().forEach(t => t.stop()); stream = null }
}

// ── Capture frame → Blob ───────────────────────────────────────
function captureBlob(quality = 0.85) {
  return new Promise((resolve) => {
    const video  = videoEl.value
    const canvas = canvasEl.value
    if (!video || !canvas || video.readyState < 2) return resolve(null)

    canvas.width  = video.videoWidth  || 640
    canvas.height = video.videoHeight || 480

    const ctx = canvas.getContext('2d')
    // Mirror correction (video CSS is mirrored, backend needs original)
    ctx.save()
    ctx.scale(-1, 1)
    ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height)
    ctx.restore()

    canvas.toBlob(resolve, 'image/jpeg', quality)
  })
}

// ── captureBase64 (untuk mode capture di AdminView) ────────────
async function captureBase64() {
  const blob = await captureBlob(0.9)
  if (!blob) return
  const reader = new FileReader()
  reader.onload = () => emit('photo', reader.result) // data:image/jpeg;base64,...
  reader.readAsDataURL(blob)
}

// ── Recognize loop (mode kiosk) ────────────────────────────────
async function recognize() {
  if (scanning.value) return
  const blob = await captureBlob()
  if (!blob) return

  scanning.value = true
  try {
    const data = await recognizeFace(blob)
    if (data.status === 'success') emit('result', data)
    else emit('error', data.reason || 'Wajah tidak dikenali')
  } catch {
    emit('error', 'Koneksi ke server gagal')
  } finally {
    scanning.value = false
  }
}

// ── Expose captureBase64 to parent ────────────────────────────
defineExpose({ captureBase64 })

// ── Lifecycle ──────────────────────────────────────────────────
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
})
</script>

<template>
  <div class="relative w-full h-full overflow-hidden rounded-2xl bg-neutral">
    <!-- Video -->
    <video
      ref="videoEl"
      class="w-full h-full object-cover"
      style="transform: scaleX(-1);"
      autoplay muted playsinline
    />
    <!-- Hidden canvas for capture -->
    <canvas ref="canvasEl" class="hidden" />

    <!-- Scanning indicator -->
    <div v-if="scanning && mode === 'kiosk'"
      class="absolute top-3 right-3 flex items-center gap-1.5 bg-black/50 rounded-full px-2.5 py-1 text-xs text-white">
      <span class="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
      Menganalisa
    </div>

    <!-- Camera error -->
    <div v-if="hasError"
      class="absolute inset-0 flex flex-col items-center justify-center bg-neutral text-error gap-3">
      <svg class="w-10 h-10 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
        <path stroke-linecap="round" stroke-linejoin="round"
          d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/>
      </svg>
      <p class="text-sm text-center px-4 opacity-70">{{ errMsg }}</p>
    </div>

    <!-- Slot for overlay content (brackets, scan line, etc.) -->
    <slot />
  </div>
</template>
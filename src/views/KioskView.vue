<script setup>
import { ref, onUnmounted } from 'vue'
import { Camera, CheckCircle2, XCircle } from 'lucide-vue-next'
import { useTheme } from '@/composables/useTheme'
import { Sun, Moon } from 'lucide-vue-next'

const { isDark, toggleTheme } = useTheme()

// State untuk simulasi status kiosk absensi
const status = ref('idle') // opsi: 'idle', 'success', 'failed'
const studentName = ref('')
let resetTimer = null

// Fitur ramah anak: Text-to-Speech langsung di Browser
const ucapkanSalam = (nama) => {
  if ('speechSynthesis' in window) {
    const kalimat = `Selamat pagi, ${nama}. Selamat belajar!`
    const utterance = new SpeechSynthesisUtterance(kalimat)
    utterance.lang = 'id-ID'
    window.speechSynthesis.speak(utterance)
  }
}

// Simulasi jika deteksi wajah berhasil dari Flask API
const pemicuAbsenSukses = () => {
  status.value = 'success'
  studentName.value = 'Budi Santoso (Kelas 4A)'
  ucapkanSalam('Budi Santoso')

  clearTimeout(resetTimer)
  resetTimer = setTimeout(() => {
    status.value = 'idle'
    studentName.value = ''
  }, 3000)
}

onUnmounted(() => {
  clearTimeout(resetTimer)
})
</script>

<template>
  <div class="min-h-screen bg-base-300 flex flex-col items-center justify-between p-6 select-none relative">

    <!-- Dark mode toggle — pojok kanan atas -->
    <button
      type="button"
      class="absolute top-5 right-5 btn btn-sm btn-ghost border border-base-300/60 gap-1.5 z-10"
      :aria-label="isDark ? 'Aktifkan light mode' : 'Aktifkan dark mode'"
      @click="toggleTheme"
    >
      <Sun v-if="isDark" class="w-3.5 h-3.5 text-warning" />
      <Moon v-else class="w-3.5 h-3.5 text-base-content/60" />
      <span class="text-xs font-normal hidden sm:inline">{{ isDark ? 'Light' : 'Dark' }}</span>
    </button>

    <header class="text-center mt-4">
      <h1 class="text-4xl font-black tracking-wider text-primary">SD NEGERI NUSANTARA</h1>
      <p class="text-base-content/70 font-medium mt-1 text-lg">Yuk, senyum di depan kamera untuk absen! 😊</p>
    </header>

    <main class="relative w-full max-w-2xl aspect-video bg-neutral rounded-3xl overflow-hidden shadow-2xl border-4 border-base-100 animate-pulse-glow">
      
      <div class="absolute inset-0 flex flex-col items-center justify-center text-neutral-content opacity-40">
        <Camera class="w-20 h-20 animate-bounce" />
        <span class="text-sm font-semibold mt-2 tracking-widest">MENUNGGU WAJAH...</span>
      </div>

      <div v-if="status === 'success'" class="absolute inset-0 bg-success text-success-content flex flex-col items-center justify-center p-6 text-center animate-fade-in">
        <CheckCircle2 class="w-36 h-36 animate-scale" />
        <h2 class="text-5xl font-black mt-4 tracking-tight">ABSEN BERHASIL!</h2>
        <p class="text-2xl font-bold mt-2 bg-base-100/20 px-6 py-2 rounded-full shadow-sm">{{ studentName }}</p>
        <span class="text-lg opacity-80 mt-2 font-medium">Hadir Tepat Waktu • 07:10 WIB</span>
      </div>

    </main>

    <footer class="w-full max-w-md mb-4">
      <button @click="pemicuAbsenSukses" class="btn btn-primary btn-block btn-lg rounded-2xl font-bold shadow-lg shadow-primary/30">
        Simulasi Deteksi Wajah Sukses
      </button>
    </footer>
  </div>
</template>
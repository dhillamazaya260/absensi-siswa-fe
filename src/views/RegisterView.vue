<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AuthLayout from '@/components/AuthLayout.vue'
import InputField from '@/components/InputField.vue'
import PasswordStrengthBar from '@/components/PasswordStrengthBar.vue'

const router = useRouter()
const auth = useAuthStore()

// ─── Step state ────────────────────────────────────────────────
const currentStep = ref(1)
const totalSteps = 3

const stepLabels = [
  { num: 1, title: 'Data Pribadi' },
  { num: 2, title: 'Kata Sandi' },
  { num: 3, title: 'Konfirmasi' },
]

// ─── Form data ─────────────────────────────────────────────────
const form = reactive({
  nama: '',
  nip: '',
  email: '',
  password: '',
  konfirmasi: '',
  agree: false,
})

const errors = reactive({
  nama: '', nip: '', email: '',
  password: '', konfirmasi: '',
  general: '',
})

const isLoading = ref(false)
const isSuccess = ref(false)

// ─── Password match ─────────────────────────────────────────────
const passwordMatch = computed(() => {
  if (!form.konfirmasi) return null
  return form.password === form.konfirmasi
})

// ─── Validate per step ─────────────────────────────────────────
function validateStep1() {
  errors.nama = ''
  errors.nip = ''
  errors.email = ''
  let ok = true

  if (!form.nama.trim()) {
    errors.nama = 'Nama lengkap wajib diisi.'
    ok = false
  }
  if (!form.nip) {
    errors.nip = 'NIP wajib diisi.'
    ok = false
  } else if (form.nip.length !== 18) {
    errors.nip = 'NIP harus tepat 18 digit angka.'
    ok = false
  }
  if (!form.email) {
    errors.email = 'Email wajib diisi.'
    ok = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Format email tidak valid.'
    ok = false
  }

  return ok
}

function validateStep2() {
  errors.password = ''
  errors.konfirmasi = ''
  let ok = true

  if (!form.password) {
    errors.password = 'Kata sandi wajib diisi.'
    ok = false
  } else if (form.password.length < 8) {
    errors.password = 'Kata sandi minimal 8 karakter.'
    ok = false
  }
  if (!form.konfirmasi) {
    errors.konfirmasi = 'Konfirmasi kata sandi wajib diisi.'
    ok = false
  } else if (form.password !== form.konfirmasi) {
    errors.konfirmasi = 'Kata sandi tidak cocok.'
    ok = false
  }

  return ok
}

function nextStep() {
  if (currentStep.value === 1 && !validateStep1()) return
  if (currentStep.value === 2 && !validateStep2()) return
  if (currentStep.value < totalSteps) currentStep.value++
}

function prevStep() {
  if (currentStep.value > 1) currentStep.value--
}

// ─── Submit ────────────────────────────────────────────────────
async function handleRegister() {
  errors.general = ''

  if (!form.agree) {
    errors.general = 'Anda harus menyetujui ketentuan penggunaan.'
    return
  }

  isLoading.value = true
  try {
    await auth.register({
      nama: form.nama,
      nip: form.nip,
      email: form.email,
      password: form.password,
      password_confirmation: form.konfirmasi,
    })
    isSuccess.value = true
  } catch (err) {
    const msg = err.response?.data?.message || 'Pendaftaran gagal. Silakan coba lagi.'
    errors.general = msg
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <AuthLayout>
    <!-- Success state -->
    <div v-if="isSuccess" class="card bg-base-100 border border-base-300 shadow-lg">
      <div class="card-body items-center text-center py-12 px-8">
        <div class="w-16 h-16 rounded-full bg-success/15 flex items-center justify-center mb-4">
          <i class="ti ti-circle-check text-success text-4xl" aria-hidden="true"></i>
        </div>
        <h2 class="text-lg font-medium text-base-content">Pendaftaran Berhasil!</h2>
        <p class="text-sm text-base-content/50 mt-2 leading-relaxed max-w-xs">
          Akun Anda telah dikirim untuk ditinjau oleh admin sekolah. Anda akan mendapat notifikasi melalui email setelah akun disetujui.
        </p>
        <RouterLink :to="{ name: 'Login' }" class="btn btn-primary mt-6 gap-2">
          <i class="ti ti-login text-sm" aria-hidden="true"></i>
          Kembali ke Login
        </RouterLink>
      </div>
    </div>

    <!-- Register form card -->
    <div v-else class="card bg-base-100 border border-base-300 shadow-lg">
      <div class="card-body gap-0 p-8">

        <!-- Logo area -->
        <div class="flex flex-col items-center mb-5">
          <div class="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-3">
            <i class="ti ti-user-plus text-primary text-2xl" aria-hidden="true"></i>
          </div>
          <h1 class="text-xl font-medium text-base-content">Buat akun baru</h1>
          <p class="text-sm text-base-content/50 mt-1">Daftarkan akun guru atau staf sekolah</p>
        </div>

        <!-- School badge -->
        <div class="flex justify-center mb-5">
          <div class="inline-flex items-center gap-1.5 bg-base-200 border border-base-300 rounded-lg px-3 py-1.5">
            <i class="ti ti-building-school text-xs text-base-content/40" aria-hidden="true"></i>
            <span class="text-xs text-base-content/50">SD Negeri Kalikondang 01 · Kudus</span>
          </div>
        </div>

        <!-- Tab nav -->
        <div class="tabs tabs-boxed bg-base-200 p-1 mb-6 rounded-xl">
          <RouterLink :to="{ name: 'Login' }" class="tab flex-1 text-sm gap-1.5" active-class="tab-active">
            <i class="ti ti-login text-sm" aria-hidden="true"></i> Masuk
          </RouterLink>
          <RouterLink :to="{ name: 'Register' }" class="tab flex-1 text-sm gap-1.5" active-class="tab-active">
            <i class="ti ti-user-plus text-sm" aria-hidden="true"></i> Daftar
          </RouterLink>
        </div>

        <!-- Step progress -->
        <div class="mb-1">
          <div class="flex gap-1.5 mb-2">
            <div
              v-for="step in totalSteps"
              :key="step"
              class="h-1 flex-1 rounded-full transition-all duration-300"
              :class="step <= currentStep ? 'bg-primary' : 'bg-base-300'"
            ></div>
          </div>
          <p class="text-[11px] text-base-content/40">
            Langkah {{ currentStep }} dari {{ totalSteps }} ·
            <span class="text-base-content/60">{{ stepLabels[currentStep - 1].title }}</span>
          </p>
        </div>

        <!-- General error -->
        <div v-if="errors.general" role="alert" class="alert alert-error py-2.5 px-3 my-3 text-sm">
          <i class="ti ti-alert-circle" aria-hidden="true"></i>
          <span>{{ errors.general }}</span>
        </div>

        <!-- ── STEP 1: Data Pribadi ── -->
        <Transition name="fade" mode="out-in">
          <form v-if="currentStep === 1" key="step1" class="space-y-1 mt-4" novalidate @submit.prevent="nextStep">
            <InputField
              id="s-nama"
              v-model="form.nama"
              label="Nama Lengkap"
              icon="user"
              placeholder="Nama sesuai SK pengangkatan"
              autocomplete="name"
              :error="errors.nama"
            />
            <InputField
              id="s-nip"
              v-model="form.nip"
              label="NIP (Nomor Induk Pegawai)"
              icon="id-badge-2"
              placeholder="18 digit NIP"
              :maxlength="18"
              hint="NIP terdiri dari 18 digit angka"
              autocomplete="off"
              :error="errors.nip"
            />
            <InputField
              id="s-email"
              v-model="form.email"
              label="Email Dinas"
              type="email"
              icon="mail"
              placeholder="nip@disdik.kudus.go.id"
              autocomplete="email"
              :error="errors.email"
            />

            <div class="pt-3">
              <button type="submit" class="btn btn-primary w-full gap-2">
                Lanjut <i class="ti ti-arrow-right text-sm" aria-hidden="true"></i>
              </button>
            </div>
          </form>
        </Transition>

        <!-- ── STEP 2: Kata Sandi ── -->
        <Transition name="fade" mode="out-in">
          <form v-if="currentStep === 2" key="step2" class="space-y-1 mt-4" novalidate @submit.prevent="nextStep">
            <div>
              <InputField
                id="s-pass"
                v-model="form.password"
                label="Kata Sandi Baru"
                type="password"
                icon="lock"
                placeholder="Min. 8 karakter"
                autocomplete="new-password"
                :error="errors.password"
              />
              <PasswordStrengthBar :password="form.password" />
            </div>

            <div>
              <InputField
                id="s-konfir"
                v-model="form.konfirmasi"
                label="Konfirmasi Kata Sandi"
                type="password"
                icon="lock-check"
                placeholder="Ulangi kata sandi"
                autocomplete="new-password"
                :error="errors.konfirmasi"
              />
              <!-- Match indicator -->
              <div v-if="form.konfirmasi && !errors.konfirmasi" class="mt-1 px-1">
                <p
                  class="text-xs flex items-center gap-1"
                  :class="passwordMatch ? 'text-success' : 'text-error'"
                >
                  <i :class="`ti ti-${passwordMatch ? 'circle-check' : 'circle-x'} text-xs`" aria-hidden="true"></i>
                  {{ passwordMatch ? 'Kata sandi cocok' : 'Kata sandi tidak cocok' }}
                </p>
              </div>
            </div>

            <div class="flex gap-2 pt-3">
              <button type="button" class="btn btn-ghost border border-base-300 gap-1" @click="prevStep">
                <i class="ti ti-arrow-left text-sm" aria-hidden="true"></i>
              </button>
              <button type="submit" class="btn btn-primary flex-1 gap-2">
                Lanjut <i class="ti ti-arrow-right text-sm" aria-hidden="true"></i>
              </button>
            </div>
          </form>
        </Transition>

        <!-- ── STEP 3: Konfirmasi ── -->
        <Transition name="fade" mode="out-in">
          <div v-if="currentStep === 3" key="step3" class="mt-4">
            <!-- Info box -->
            <div class="flex gap-2.5 bg-info/10 border border-info/20 rounded-xl px-3.5 py-3 mb-4">
              <i class="ti ti-circle-check text-info text-sm mt-0.5 flex-shrink-0" aria-hidden="true"></i>
              <p class="text-xs text-base-content/60 leading-relaxed">
                Periksa kembali data Anda sebelum mendaftar. Akun akan ditinjau oleh admin sekolah sebelum aktif.
              </p>
            </div>

            <!-- Data review -->
            <div class="bg-base-200 border border-base-300 rounded-xl overflow-hidden mb-4 text-sm">
              <div class="flex justify-between items-center px-4 py-3 border-b border-base-300">
                <span class="text-base-content/50 text-xs">Nama</span>
                <span class="font-medium text-base-content">{{ form.nama || '—' }}</span>
              </div>
              <div class="flex justify-between items-center px-4 py-3 border-b border-base-300">
                <span class="text-base-content/50 text-xs">NIP</span>
                <span class="font-mono tracking-wide text-base-content">{{ form.nip || '—' }}</span>
              </div>
              <div class="flex justify-between items-center px-4 py-3">
                <span class="text-base-content/50 text-xs">Email</span>
                <span class="text-primary text-xs">{{ form.email || '—' }}</span>
              </div>
            </div>

            <!-- Agreement -->
            <label class="flex items-start gap-2.5 cursor-pointer mb-4">
              <input v-model="form.agree" type="checkbox" class="checkbox checkbox-primary checkbox-sm mt-0.5 flex-shrink-0" />
              <span class="text-xs text-base-content/60 leading-relaxed">
                Saya menyetujui
                <a href="#" class="text-primary hover:underline">ketentuan penggunaan</a>
                dan
                <a href="#" class="text-primary hover:underline">kebijakan privasi</a>
                sistem absensi ini.
              </span>
            </label>

            <div class="flex gap-2">
              <button type="button" class="btn btn-ghost border border-base-300 gap-1" @click="prevStep">
                <i class="ti ti-arrow-left text-sm" aria-hidden="true"></i>
              </button>
              <button
                type="button"
                class="btn btn-primary flex-1 gap-2"
                :class="{ loading: isLoading }"
                :disabled="isLoading"
                @click="handleRegister"
              >
                <i v-if="!isLoading" class="ti ti-user-check text-sm" aria-hidden="true"></i>
                {{ isLoading ? 'Memproses...' : 'Kirim Pendaftaran' }}
              </button>
            </div>
          </div>
        </Transition>

        <p class="text-center text-xs text-base-content/40 mt-5">
          Sudah punya akun?
          <RouterLink :to="{ name: 'Login' }" class="text-primary font-medium hover:underline">
            Masuk di sini
          </RouterLink>
        </p>
      </div>
    </div>
  </AuthLayout>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}
.fade-enter-from {
  opacity: 0;
  transform: translateX(12px);
}
.fade-leave-to {
  opacity: 0;
  transform: translateX(-12px);
}
</style>
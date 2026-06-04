<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AuthLayout from '@/components/AuthLayout.vue'
import InputField from '@/components/InputField.vue'

const router = useRouter()
const auth = useAuthStore()

const form = reactive({
  nip: '',
  email: '',
  password: '',
  remember: false,
})

const errors = reactive({ nip: '', email: '', password: '', general: '' })
const isLoading = ref(false)

function validate() {
  errors.nip = ''
  errors.email = ''
  errors.password = ''
  errors.general = ''
  let ok = true

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

  if (!form.password) {
    errors.password = 'Kata sandi wajib diisi.'
    ok = false
  } else if (form.password.length < 6) {
    errors.password = 'Kata sandi minimal 6 karakter.'
    ok = false
  }

  return ok
}

async function handleLogin() {
  if (!validate()) return

  isLoading.value = true
  try {
    await auth.login({
      nip: form.nip,
      email: form.email,
      password: form.password,
    })
    router.push({ name: 'Admin' })
  } catch (err) {
    const msg = err.response?.data?.message || 'Login gagal. Periksa kembali data Anda.'
    errors.general = msg
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <AuthLayout>
    <!-- Card -->
    <div class="card bg-base-100 border border-base-300 shadow-lg">
      <div class="card-body gap-0 p-8">

        <!-- Logo area -->
        <div class="flex flex-col items-center mb-6">
          <div class="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-3">
            <i class="ti ti-face-id text-primary text-3xl" aria-hidden="true"></i>
          </div>
          <h1 class="text-xl font-medium text-base-content">Selamat datang</h1>
          <p class="text-sm text-base-content/50 mt-1">Masuk ke sistem absensi guru &amp; admin</p>
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
          <RouterLink
            :to="{ name: 'Login' }"
            class="tab flex-1 text-sm gap-1.5"
            active-class="tab-active"
          >
            <i class="ti ti-login text-sm" aria-hidden="true"></i> Masuk
          </RouterLink>
          <RouterLink
            :to="{ name: 'Register' }"
            class="tab flex-1 text-sm gap-1.5"
            active-class="tab-active"
          >
            <i class="ti ti-user-plus text-sm" aria-hidden="true"></i> Daftar
          </RouterLink>
        </div>

        <!-- General error -->
        <div
          v-if="errors.general"
          role="alert"
          class="alert alert-error py-2.5 px-3 mb-4 text-sm"
        >
          <i class="ti ti-alert-circle" aria-hidden="true"></i>
          <span>{{ errors.general }}</span>
        </div>

        <!-- Info box -->
        <div class="flex gap-2.5 bg-info/10 border border-info/20 rounded-xl px-3.5 py-3 mb-5">
          <i class="ti ti-info-circle text-info text-sm mt-0.5 flex-shrink-0" aria-hidden="true"></i>
          <p class="text-xs text-base-content/60 leading-relaxed">
            Login menggunakan NIP, alamat email, dan kata sandi yang terdaftar di sistem sekolah.
          </p>
        </div>

        <!-- Form -->
        <form class="space-y-1" novalidate @submit.prevent="handleLogin">
          <InputField
            id="nip"
            v-model="form.nip"
            label="NIP (Nomor Induk Pegawai)"
            icon="id-badge-2"
            placeholder="Contoh: 198501152010011002"
            :maxlength="18"
            autocomplete="username"
            :error="errors.nip"
          />

          <InputField
            id="email"
            v-model="form.email"
            label="Email"
            type="email"
            icon="mail"
            placeholder="email@sekolah.sch.id"
            autocomplete="email"
            :error="errors.email"
          />

          <InputField
            id="password"
            v-model="form.password"
            label="Kata Sandi"
            type="password"
            icon="lock"
            placeholder="Masukkan kata sandi"
            autocomplete="current-password"
            :error="errors.password"
          />

          <!-- Remember + forgot -->
          <div class="flex items-center justify-between pt-1 pb-2">
            <label class="label cursor-pointer gap-2 p-0">
              <input v-model="form.remember" type="checkbox" class="checkbox checkbox-primary checkbox-xs" />
              <span class="label-text text-xs">Ingat saya</span>
            </label>
            <RouterLink
              to="/forgot-password"
              class="text-xs text-primary hover:underline"
            >
              Lupa kata sandi?
            </RouterLink>
          </div>

          <button
            type="submit"
            class="btn btn-primary w-full gap-2"
            :class="{ loading: isLoading }"
            :disabled="isLoading"
          >
            <i v-if="!isLoading" class="ti ti-login text-sm" aria-hidden="true"></i>
            {{ isLoading ? 'Memproses...' : 'Masuk ke Sistem' }}
          </button>
        </form>

        <p class="text-center text-xs text-base-content/40 mt-5">
          Belum punya akun?
          <RouterLink :to="{ name: 'Register' }" class="text-primary font-medium hover:underline">
            Daftar sekarang
          </RouterLink>
        </p>
      </div>
    </div>
  </AuthLayout>
</template>
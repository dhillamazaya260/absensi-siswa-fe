<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AuthLayout from '@/components/AuthLayout.vue'
import InputField from '@/components/InputField.vue'

const router = useRouter()
const auth   = useAuthStore()

const form   = reactive({ nip: '', email: '', password: '', remember: false })
const errors = reactive({ nip: '', email: '', password: '', general: '' })
const isLoading = ref(false)

function validate() {
  errors.nip = ''; errors.email = ''; errors.password = ''; errors.general = ''
  let ok = true
  if (!form.nip)                             { errors.nip = 'NIP wajib diisi.'; ok = false }
  else if (form.nip.length !== 18)           { errors.nip = 'NIP harus tepat 18 digit angka.'; ok = false }
  if (!form.email)                           { errors.email = 'Email wajib diisi.'; ok = false }
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { errors.email = 'Format email tidak valid.'; ok = false }
  if (!form.password)                        { errors.password = 'Kata sandi wajib diisi.'; ok = false }
  else if (form.password.length < 6)        { errors.password = 'Kata sandi minimal 6 karakter.'; ok = false }
  return ok
}

async function handleLogin() {
  if (!validate()) return
  isLoading.value = true
  try {
    await auth.login({ nip: form.nip, email: form.email, password: form.password })
    router.push({ name: 'Admin' })
  } catch (err) {
    errors.general = err.response?.data?.message || 'Login gagal. Periksa kembali data Anda.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <AuthLayout>
    <div class="card bg-base-100 border border-base-300/60 shadow-lg shadow-black/8">
      <div class="card-body gap-0 p-0">

        <!-- ── Hero banner ── -->
        <div class="relative overflow-hidden rounded-t-2xl bg-gradient-to-br from-primary px-7 pt-7 pb-6">
          <!-- Decorative orbs -->
          <div class="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-white/5 blur-xl pointer-events-none"></div>
          <div class="absolute -bottom-4 -left-4 w-24 h-24 rounded-full bg-white/[0.06] blur-lg pointer-events-none"></div>

          <!-- Icon cluster -->
          <div class="relative flex items-center gap-4 mb-4">
            <div class="w-13 h-13 rounded-xlbg-white/18 backdrop-blur-sm border border-white/50 flex items-center justify-center shadow-md flex-shrink-0">
              <i class="ti ti-face-id text-white text-3xl" aria-hidden="true"></i>
            </div>
            <div class="flex flex-col gap-1.5">
              <div class="flex items-center gap-1.5 flex-wrap">
                <span class="inline-flex items-center gap-1 bg-white/14 border border-white/22 rounded-full px-2 py-0.5 text-[10px] text-white/88 font-medium">
                  <i class="ti ti-shield-check text-[10px]"></i> Biometrik Wajah
                </span>
                <span class="inline-flex items-center gap-1 bg-white/14 border border-white/22 rounded-full px-2 py-0.5 text-[10px] text-white/88 font-medium">
                  <i class="ti ti-lock text-[10px]"></i> Aman & Terenkripsi
                </span>
              </div>
              <div class="flex items-center gap-1.5 flex-wrap">
                <span class="inline-flex items-center gap-1 bg-white/14 border border-white/22 rounded-full px-2 py-0.5 text-[10px] text-white/88 font-medium">
                  <i class="ti ti-clock text-[10px]"></i> Real-time Sync
                </span>
                <span class="inline-flex items-center gap-1 bg-white/14 border border-white/22 rounded-full px-2 py-0.5 text-[10px] text-white/88 font-medium">
                  <i class="ti ti-users text-[10px]"></i> Multi Kelas
                </span>
              </div>
            </div>
          </div>

          <h1 class="text-xl font-bold text-white relative">Selamat datang</h1>
          <p class="text-sm text-white/68 mt-0.5 relative">Masuk ke sistem absensi guru &amp; admin</p>

          <!-- School badge -->
          <div class="inline-flex items-center gap-1.5 bg-white/14 border border-white/22 rounded-lg px-2.5 py-1.5 mt-3 relative">
            <i class="ti ti-building-school text-xs text-white/68" aria-hidden="true"></i>
            <span class="text-xs text-white/78 font-medium">SD Negeri Kalikondang 01 · Kudus</span>
          </div>
        </div>

        <!-- ── Form area ── -->
        <div class="px-7 pt-6 pb-7">

          <!-- Tab nav -->
          <div class="tabs tabs-boxed bg-base-200 border border-base-300/50 p-1 mb-6 rounded-xl">
            <RouterLink :to="{ name: 'Login' }" class="tab flex-1 text-sm gap-1.5 rounded-lg" active-class="tab-active">
              <i class="ti ti-login text-sm" aria-hidden="true"></i> Masuk
            </RouterLink>
            <RouterLink :to="{ name: 'Register' }" class="tab flex-1 text-sm gap-1.5 rounded-lg" active-class="tab-active">
              <i class="ti ti-user-plus text-sm" aria-hidden="true"></i> Daftar
            </RouterLink>
          </div>

          <!-- General error -->
          <div v-if="errors.general" role="alert" class="alert alert-error py-2.5 px-3.5 mb-4 text-sm border border-error/25 rounded-xl">
            <i class="ti ti-alert-circle flex-shrink-0" aria-hidden="true"></i>
            <span>{{ errors.general }}</span>
          </div>

          <!-- Info box -->
          <div class="flex gap-2.5 bg-info/[0.07] border border-info/20 rounded-xl px-3.5 py-3 mb-5">
            <i class="ti ti-info-circle text-info text-sm mt-0.5 flex-shrink-0" aria-hidden="true"></i>
            <p class="text-xs text-base-content/60 leading-relaxed">
              Login menggunakan NIP, alamat email, dan kata sandi yang terdaftar di sistem sekolah.
            </p>
          </div>

          <!-- Form -->
          <form class="space-y-3" novalidate @submit.prevent="handleLogin">
            <InputField
              id="nip" v-model="form.nip"
              label="NIP (Nomor Induk Pegawai)" icon="id-badge-2"
              placeholder="Contoh: 198501152010011002" :maxlength="18"
              autocomplete="username" :error="errors.nip"
            />
            <InputField
              id="email" v-model="form.email"
              label="Email" type="email" icon="mail"
              placeholder="email@sekolah.sch.id"
              autocomplete="email" :error="errors.email"
            />
            <InputField
              id="password" v-model="form.password"
              label="Kata Sandi" type="password" icon="lock"
              placeholder="Masukkan kata sandi"
              autocomplete="current-password" :error="errors.password"
            />

            <!-- Remember + forgot -->
            <div class="flex items-center justify-between pt-1 pb-1">
              <label class="label cursor-pointer gap-2 p-0">
                <input v-model="form.remember" type="checkbox" class="checkbox checkbox-primary checkbox-sm" />
                <span class="label-text text-xs text-base-content/60">Ingat saya</span>
              </label>
              <RouterLink to="/forgot-password" class="text-xs text-primary hover:underline font-medium">
                Lupa kata sandi?
              </RouterLink>
            </div>

            <!-- Submit -->
            <button
              type="submit"
              class="btn btn-primary w-full gap-2 shadow-md shadow-primary/20 h-11 min-h-11 text-sm font-semibold mt-4"
              :class="{ loading: isLoading }"
              :disabled="isLoading"
            >
              <i v-if="!isLoading" class="ti ti-login text-sm" aria-hidden="true"></i>
              {{ isLoading ? 'Memproses...' : 'Masuk ke Sistem' }}
            </button>
          </form>

          <p class="text-center text-xs text-base-content/38 mt-5">
            Belum punya akun?
            <RouterLink :to="{ name: 'Register' }" class="text-primary font-medium hover:underline">
              Daftar sekarang
            </RouterLink>
          </p>
        </div>

      </div>
    </div>
  </AuthLayout>
</template>
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '@/api/auth'

export const useAuthStore = defineStore('auth', () => {
  const user  = ref(JSON.parse(localStorage.getItem('auth_user')  || 'null'))
  const token = ref(localStorage.getItem('auth_token') || null)

  const isLoggedIn = computed(() => !!token.value && !!user.value)

  function setAuth(userData, tokenValue) {
    user.value  = userData
    token.value = tokenValue
    localStorage.setItem('auth_user',  JSON.stringify(userData))
    localStorage.setItem('auth_token', tokenValue)
  }

  function clearAuth() {
    user.value  = null
    token.value = null
    localStorage.removeItem('auth_user')
    localStorage.removeItem('auth_token')
  }

  // ── Login ─────────────────────────────────────────────────────
  async function login(payload) {
    // Backend Flask expects { username, password }
    // LoginView mengirim { nip, email, password } — kita coba nip dulu, fallback ke email
    const username = payload.nip || payload.email || payload.username
    const { data } = await authApi.login({ username, password: payload.password })
    setAuth(data.user, data.token)
  }

  // ── Register ──────────────────────────────────────────────────
  async function register(payload) {
    // payload: { nip, nama_lengkap, email, password, role }
    const { data } = await authApi.register({
      username     : payload.nip || payload.username,
      password     : payload.password,
      nama_lengkap : payload.nama_lengkap || payload.nama || '',
      role         : payload.role || 'guru',
    })
    return data
  }

  // ── Logout ────────────────────────────────────────────────────
  async function logout() {
    clearAuth()
  }

  return { user, token, isLoggedIn, login, register, logout }
})
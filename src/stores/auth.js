import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(JSON.parse(localStorage.getItem('auth_user') || 'null'))
  const token = ref(localStorage.getItem('auth_token') || null)

  const isLoggedIn = computed(() => !!token.value && !!user.value)

  function setAuth(userData, tokenValue) {
    user.value = userData
    token.value = tokenValue
    localStorage.setItem('auth_user', JSON.stringify(userData))
    localStorage.setItem('auth_token', tokenValue)
  }

  function clearAuth() {
    user.value = null
    token.value = null
    localStorage.removeItem('auth_user')
    localStorage.removeItem('auth_token')
  }

  async function login(payload) {
    // TODO: ganti dengan API call ke backend Flask
    // const { data } = await authApi.login(payload)
    // setAuth(data.user, data.token)

    // Simulasi login sementara — hapus blok ini jika backend sudah siap
    const mockUser = { nama: 'Admin', nip: payload.nip, email: payload.email, role: 'admin' }
    const mockToken = 'mock-token-' + Date.now()
    setAuth(mockUser, mockToken)
  }

  async function register(payload) {
    // TODO: ganti dengan API call ke backend Flask
    // const { data } = await authApi.register(payload)

    // Simulasi register sementara
    return { message: 'Pendaftaran berhasil, menunggu persetujuan admin.' }
  }

  async function logout() {
    clearAuth()
  }

  return { user, token, isLoggedIn, login, register, logout }
})
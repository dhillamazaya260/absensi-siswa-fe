import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 10_000,
  headers: { 'Content-Type': 'application/json' },
})

// Inject token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ─── Statistik ─────────────────────────────────────────────────
export async function fetchStatistik() {
  const { data } = await api.get('/statistik/hari-ini')
  return data
}

// ─── Absensi hari ini ──────────────────────────────────────────
export async function fetchAbsensiHariIni(kelas = '') {
  const { data } = await api.get('/absensi/hari-ini', {
    params: kelas ? { kelas } : {},
  })
  // Normalize field: backend returns waktu_masuk, FE expects waktuMasuk
  return data.map(s => ({
    ...s,
    waktuMasuk: s.waktu_masuk ?? s.waktuMasuk ?? '—',
  }))
}

// ─── Log aktivitas ────────────────────────────────────────────
export async function fetchLogAktivitas() {
  const { data } = await api.get('/log/aktivitas')
  return data
}

// ─── Registrasi siswa (dengan foto base64) ────────────────────
export async function registrasiSiswa(payload) {
  // payload: { nama, kelas, nis, photos: { depan, kanan, kiri } }
  // Backend expects: { nama, kelas, nisn, photos: [base64, ...] }
  const photosArr = Object.values(payload.photos || {}).filter(Boolean)
  const { data } = await api.post('/siswa', {
    nama   : payload.nama,
    kelas  : payload.kelas,
    nisn   : payload.nis,
    photos : photosArr,
  })
  return data
}

// ─── Override status absensi manual ──────────────────────────
export async function overrideStatusAbsensi(absensiId, status) {
  const { data } = await api.patch(`/absensi/${absensiId}/override`, { status })
  return data
}

// ─── Recognize face (kiosk) ───────────────────────────────────
export async function recognizeFace(blob) {
  const fd = new FormData()
  fd.append('image', blob, 'frame.jpg')
  const { data } = await api.post('/absen/recognize', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 8_000,
  })
  return data
}

export default api
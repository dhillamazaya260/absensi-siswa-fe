/**
 * src/api/absensi.js — Axios layer untuk endpoint absensi & siswa
 */
import client from './client'

// ── Statistik ─────────────────────────────────────────────────────────
export async function fetchStatistik() {
  const { data } = await client.get('/statistik/hari-ini')
  return data
}

// ── Absensi hari ini ──────────────────────────────────────────────────
export async function fetchAbsensiHariIni(kelas = '') {
  const { data } = await client.get('/absensi/hari-ini', {
    params: kelas ? { kelas } : {},
  })
  return data.map((s) => ({
    ...s,
    // Normalisasi field name: backend kirim waktu_masuk, FE pakai waktuMasuk
    waktuMasuk: s.waktu_masuk ?? s.waktuMasuk ?? '—',
  }))
}

// ── Log aktivitas ─────────────────────────────────────────────────────
export async function fetchLogAktivitas() {
  const { data } = await client.get('/log/aktivitas')
  return data
}

// ── Daftar siswa ──────────────────────────────────────────────────────
export async function fetchSiswaList(kelas = '') {
  const { data } = await client.get('/siswa', {
    params: kelas ? { kelas } : {},
  })
  return data
}

// ── Registrasi siswa (dengan foto base64) ─────────────────────────────
export async function registrasiSiswa(payload) {
  const photosArr = Object.values(payload.photos || {}).filter(Boolean)
  const { data }  = await client.post('/siswa', {
    nama  : payload.nama,
    kelas : payload.kelas,
    nisn  : payload.nis,
    photos: photosArr,
  })
  return data
}

// ── Override status absensi manual ───────────────────────────────────
export async function overrideStatusAbsensi(absensiId, status) {
  const { data } = await client.patch(`/absensi/${absensiId}/override`, { status })
  return data
}

// ── Recognize face (kiosk) ────────────────────────────────────────────
export async function recognizeFace(blob) {
  const fd = new FormData()
  fd.append('image', blob, 'frame.jpg')
  const { data } = await client.post('/absen/recognize', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 15_000,  // Khusus recognize naik ke 15s untuk ArcFace
  })
  return data
}

export default client
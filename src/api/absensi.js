import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 10_000,
  headers: { 'Content-Type': 'application/json' },
})

// ─── Mock Data ────────────────────────────────────────────────
const _stats = {
  hadir: 138, terlambat: 8, absen: 12, belumAbsen: 10, totalSiswa: 168,
}

const _absensi = [
  { id: 1,  nama: 'Budi Santoso',    kelas: '4A', waktuMasuk: '06:58', status: 'hadir'     },
  { id: 2,  nama: 'Siti Rahayu',     kelas: '4A', waktuMasuk: '07:02', status: 'hadir'     },
  { id: 3,  nama: 'Ahmad Fauzi',     kelas: '4B', waktuMasuk: '07:21', status: 'terlambat' },
  { id: 4,  nama: 'Dewi Pertiwi',    kelas: '5A', waktuMasuk: '07:05', status: 'hadir'     },
  { id: 5,  nama: 'Rudi Hermawan',   kelas: '5B', waktuMasuk: '—',     status: 'absen'     },
  { id: 6,  nama: 'Maya Sari',       kelas: '6A', waktuMasuk: '07:11', status: 'hadir'     },
  { id: 7,  nama: 'Eko Prasetyo',    kelas: '3A', waktuMasuk: '07:18', status: 'terlambat' },
  { id: 8,  nama: 'Fitri Handayani', kelas: '2B', waktuMasuk: '—',     status: 'absen'     },
  { id: 9,  nama: 'Susi Susanti',    kelas: '1A', waktuMasuk: '06:55', status: 'hadir'     },
  { id: 10, nama: 'Doni Prasetya',   kelas: '6B', waktuMasuk: '07:14', status: 'hadir'     },
]

const _log = [
  { id: 1, waktu: '07:32:14', kejadian: 'Budi Santoso berhasil dikenali',         kelas: '4A', status: 'hadir'     },
  { id: 2, waktu: '07:31:58', kejadian: 'Wajah tidak dikenali (percobaan gagal)', kelas: '—',  status: 'gagal'     },
  { id: 3, waktu: '07:29:03', kejadian: 'Siti Rahayu berhasil dikenali',          kelas: '4A', status: 'hadir'     },
  { id: 4, waktu: '07:21:45', kejadian: 'Ahmad Fauzi dikenali — terlambat',       kelas: '4B', status: 'terlambat' },
  { id: 5, waktu: '07:18:22', kejadian: 'Eko Prasetyo dikenali — terlambat',      kelas: '3A', status: 'terlambat' },
  { id: 6, waktu: '07:11:09', kejadian: 'Maya Sari berhasil dikenali',            kelas: '6A', status: 'hadir'     },
  { id: 7, waktu: '07:05:33', kejadian: 'Dewi Pertiwi berhasil dikenali',         kelas: '5A', status: 'hadir'     },
  { id: 8, waktu: '07:02:11', kejadian: 'Siti Rahayu berhasil dikenali',          kelas: '4A', status: 'hadir'     },
]

// ─── API Functions ─────────────────────────────────────────────
/**
 * Ambil statistik kehadiran hari ini.
 * TODO: Ganti dengan → const { data } = await api.get('/statistik/hari-ini')
 */
export async function fetchStatistik() {
  // const { data } = await api.get('/statistik/hari-ini')
  // return data
  return _stats
}

/**
 * Ambil daftar absensi hari ini, opsional filter per kelas.
 * TODO: Ganti dengan → api.get('/absensi/hari-ini', { params: { kelas } })
 */
export async function fetchAbsensiHariIni(kelas = '') {
  // const { data } = await api.get('/absensi/hari-ini', { params: { kelas } })
  // return data
  return kelas ? _absensi.filter(s => s.kelas === kelas) : _absensi
}

/**
 * Ambil log aktivitas sistem secara realtime.
 * TODO: Ganti dengan → api.get('/log/aktivitas')
 */
export async function fetchLogAktivitas() {
  // const { data } = await api.get('/log/aktivitas')
  // return data
  return _log
}

/**
 * Kirim data registrasi wajah siswa baru ke backend.
 * TODO: Ganti dengan → api.post('/siswa/registrasi', payload)
 */
export async function registrasiSiswa(payload) {
  // const { data } = await api.post('/siswa/registrasi', payload)
  // return data
  console.log('[mock] Registrasi siswa:', payload)
  return { success: true, message: 'Siswa berhasil didaftarkan' }
}

/**
 * Override status absensi siswa secara manual.
 * TODO: Ganti dengan → api.patch(`/absensi/${siswaId}/override`, { status })
 */
export async function overrideStatusAbsensi(siswaId, status) {
  // const { data } = await api.patch(`/absensi/${siswaId}/override`, { status })
  // return data
  console.log(`[mock] Override siswa ${siswaId} → ${status}`)
  return { success: true }
}

export default api
import { computed } from 'vue'

export function usePasswordStrength(password) {
  const score = computed(() => {
    const val = password.value || ''
    let s = 0
    if (val.length >= 8) s++
    if (/[A-Z]/.test(val)) s++
    if (/[0-9]/.test(val)) s++
    if (/[^A-Za-z0-9]/.test(val)) s++
    return s
  })

  const label = computed(() => {
    if (!password.value) return ''
    const labels = ['', 'Lemah', 'Cukup', 'Cukup', 'Kuat']
    return labels[score.value] || 'Lemah'
  })

  const color = computed(() => {
    const colors = ['', 'error', 'warning', 'warning', 'success']
    return colors[score.value] || 'error'
  })

  return { score, label, color }
}
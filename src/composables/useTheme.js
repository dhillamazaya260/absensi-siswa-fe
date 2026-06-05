import { ref, watchEffect } from 'vue'

const isDark = ref(localStorage.getItem('theme') === 'dark' ?? true)

watchEffect(() => {
  const html = document.documentElement
  if (isDark.value) {
    html.setAttribute('data-theme', 'dark')
    html.classList.add('dark')
  } else {
    html.setAttribute('data-theme', 'light')
    html.classList.remove('dark')
  }
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
})

export function useTheme() {
  function toggleTheme() {
    isDark.value = !isDark.value
  }

  return { isDark, toggleTheme }
}
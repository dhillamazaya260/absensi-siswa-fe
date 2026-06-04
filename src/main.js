import { createApp } from 'vue'
import { VueQueryPlugin, QueryClient } from '@tanstack/vue-query'
import App from './App.vue'
import './style.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime:           4_000,   // data dianggap fresh selama 4 detik
      retry:               2,        // ulangi max 2× jika request gagal
      refetchOnWindowFocus: false,   // jangan auto-refetch saat tab kembali fokus
    },
  },
})

createApp(App)
  .use(VueQueryPlugin, { queryClient })
  .mount('#app')
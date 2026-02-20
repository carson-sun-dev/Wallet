import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

const DARK_KEY = 'wallet_dark'
const PRIMARY_KEY = 'wallet_primary_color'

export const useThemeStore = defineStore('theme', () => {
  const isDark = ref(localStorage.getItem(DARK_KEY) === 'true')
  const primaryColor = ref(localStorage.getItem(PRIMARY_KEY) || '#1a3a63')

  function toggleDark() {
    isDark.value = !isDark.value
  }

  function setPrimaryColor(color: string) {
    primaryColor.value = color
  }

  watch(isDark, (v) => {
    localStorage.setItem(DARK_KEY, String(v))
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', v)
    }
  }, { immediate: true })

  watch(primaryColor, (v) => {
    localStorage.setItem(PRIMARY_KEY, v)
    if (typeof document !== 'undefined') {
      document.documentElement.style.setProperty('--el-color-primary', v)
      document.documentElement.style.setProperty('--app-primary', v)
    }
  }, { immediate: true })

  return { isDark, primaryColor, toggleDark, setPrimaryColor }
})

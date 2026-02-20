import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const ACCESS_KEY = 'wallet_access_token'
const REFRESH_KEY = 'wallet_refresh_token'
const USER_KEY = 'wallet_user'

export interface User {
  id: number
  username: string
  email: string
}

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref<string | null>(sessionStorage.getItem(ACCESS_KEY))
  const refreshToken = ref<string | null>(localStorage.getItem(REFRESH_KEY))
  function loadUser(): User | null {
    try {
      const s = sessionStorage.getItem(USER_KEY)
      return s ? JSON.parse(s) : null
    } catch {
      return null
    }
  }
  const user = ref<User | null>(loadUser())

  const isLoggedIn = computed(() => !!accessToken.value && !!user.value)

  function setTokens(access: string, refresh: string, userData: User) {
    accessToken.value = access
    refreshToken.value = refresh
    user.value = userData
    sessionStorage.setItem(ACCESS_KEY, access)
    localStorage.setItem(REFRESH_KEY, refresh)
    sessionStorage.setItem(USER_KEY, JSON.stringify(userData))
  }

  function setAccessToken(token: string) {
    accessToken.value = token
    sessionStorage.setItem(ACCESS_KEY, token)
  }

  function setUser(userData: User) {
    user.value = userData
    sessionStorage.setItem(USER_KEY, JSON.stringify(userData))
  }

  function logout() {
    accessToken.value = null
    refreshToken.value = null
    user.value = null
    sessionStorage.removeItem(ACCESS_KEY)
    sessionStorage.removeItem(USER_KEY)
    localStorage.removeItem(REFRESH_KEY)
  }

  function getRefreshToken(): string | null {
    return refreshToken.value || localStorage.getItem(REFRESH_KEY)
  }

  return {
    accessToken,
    refreshToken,
    user,
    isLoggedIn,
    setTokens,
    setAccessToken,
    setUser,
    logout,
    getRefreshToken
  }
})

import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

const GOAL_KEY = 'wallet_goal'
const NOTE_KEY = 'wallet_note'

export const useUserPrefsStore = defineStore('userPrefs', () => {
  const savingGoal = ref({ title: '', target: 0, current: 0 })
  const monthlyNote = ref('')

  function load() {
    try {
      const g = localStorage.getItem(GOAL_KEY)
      if (g) savingGoal.value = JSON.parse(g)
      const n = localStorage.getItem(NOTE_KEY)
      if (n) monthlyNote.value = n
    } catch {
      // ignore
    }
  }

  function setGoal(title: string, target: number, current: number) {
    savingGoal.value = { title, target, current }
  }

  function setNote(note: string) {
    monthlyNote.value = note
  }

  watch(savingGoal, (v) => {
    localStorage.setItem(GOAL_KEY, JSON.stringify(v))
  }, { deep: true })

  watch(monthlyNote, (v) => {
    localStorage.setItem(NOTE_KEY, v)
  })

  return { savingGoal, monthlyNote, load, setGoal, setNote }
})

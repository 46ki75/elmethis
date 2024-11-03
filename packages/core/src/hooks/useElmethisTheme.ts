import { onMounted, ref, watch } from 'vue'

const LOCAL_STORAGE_KEY = 'elmethis-theme'

export function useElmethisTheme() {
  const isDarkTheme = ref(false)

  const toggleTheme = () => {
    isDarkTheme.value = !isDarkTheme.value
  }

  watch(isDarkTheme, () => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute(
        'data-theme',
        isDarkTheme.value ? 'dark' : 'light'
      )
      const body = document.querySelector('body')
      if (body != null) {
        body.style.colorScheme = isDarkTheme.value ? 'dark' : 'light'
      }

      if (localStorage != null) {
        localStorage.setItem(
          LOCAL_STORAGE_KEY,
          isDarkTheme.value ? 'dark' : 'light'
        )
      }
    }
  })

  onMounted(() => {
    if (typeof document !== 'undefined') {
      const currentTheme = document.documentElement.getAttribute('data-theme')
      if (currentTheme != null) {
        isDarkTheme.value = currentTheme === 'dark'
      } else {
        const localStorageTheme = localStorage.getItem(LOCAL_STORAGE_KEY)
        if (localStorageTheme != null) {
          isDarkTheme.value = localStorageTheme === 'dark'
        }
      }
    }
  })

  return { isDarkTheme, toggleTheme }
}

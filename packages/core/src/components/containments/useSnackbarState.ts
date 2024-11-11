import { ref, VNode } from 'vue'
import { nanoid } from 'nanoid'
import { useTimeoutFn } from '@vueuse/core'

export function useSnackbarState() {
  const snackbars = ref<
    Array<{
      id: string
      label?: string
      timeout: number
      children?: VNode
      close: () => void
    }>
  >([])

  const remove = (id: string) => {
    snackbars.value = snackbars.value.filter((snackbar) => snackbar.id !== id)
  }

  const push = ({
    label,
    timeout = 5000,
    children
  }: {
    label?: string
    timeout?: number
    children?: VNode
  }) => {
    const id = nanoid()
    snackbars.value.push({
      id,
      label,
      timeout,
      children,
      close: () => remove(id)
    })

    useTimeoutFn(() => {
      remove(id)
    }, 5000)

    return id
  }

  return {
    snackbars,
    push,
    remove
  }
}

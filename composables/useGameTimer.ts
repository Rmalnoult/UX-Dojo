export const useGameTimer = () => {
  const time = ref(0)
  const isRunning = ref(false)
  let intervalId: NodeJS.Timeout | null = null

  const start = () => {
    if (isRunning.value) return

    isRunning.value = true
    intervalId = setInterval(() => {
      time.value++
    }, 1000)
  }

  const stop = () => {
    if (!isRunning.value) return

    isRunning.value = false
    if (intervalId) {
      clearInterval(intervalId)
      intervalId = null
    }
  }

  const reset = () => {
    stop()
    time.value = 0
  }

  const setTime = (seconds: number) => {
    time.value = seconds
  }

  onUnmounted(() => {
    stop()
  })

  return {
    time: readonly(time),
    isRunning: readonly(isRunning),
    start,
    stop,
    reset,
    setTime,
  }
}
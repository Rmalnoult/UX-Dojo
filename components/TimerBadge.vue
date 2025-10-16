<template>
  <div class="flex items-center gap-2">
    <UiBadge :variant="timeWarning ? 'destructive' : 'secondary'" class="text-lg px-4 py-1">
      <Clock class="w-4 h-4 mr-2" />
      {{ formattedTime }}
    </UiBadge>
  </div>
</template>

<script setup lang="ts">
import { Clock } from 'lucide-vue-next'

interface Props {
  time: number // in seconds
}

const props = defineProps<Props>()

const formattedTime = computed(() => {
  const minutes = Math.floor(props.time / 60)
  const seconds = props.time % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
})

const timeWarning = computed(() => props.time <= 10)
</script>
<template>
  <div class="flex items-center gap-2">
    <UiBadge variant="default" class="text-lg px-4 py-1">
      <Trophy class="w-4 h-4 mr-2" />
      {{ score.toLocaleString() }} pts
    </UiBadge>
    <div v-if="streak > 0" class="flex items-center">
      <Flame class="w-5 h-5 text-orange-500 animate-pulse" />
      <span class="ml-1 font-bold">{{ streak }}x</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Trophy, Flame } from 'lucide-vue-next'

interface Props {
  score: number
  streak?: number
}

withDefaults(defineProps<Props>(), {
  streak: 0,
})
</script>
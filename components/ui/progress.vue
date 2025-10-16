<template>
  <div
    :class="cn('relative h-4 w-full overflow-hidden rounded-full bg-secondary', $attrs.class ?? '')"
    v-bind="$attrs"
  >
    <div
      class="h-full bg-primary transition-all"
      :style="`width: ${value}%`"
    />
  </div>
</template>

<script setup lang="ts">
import { cn } from '~/utils/cn'

interface Props {
  value?: number
}

const props = withDefaults(defineProps<Props>(), {
  value: 0,
})
</script>
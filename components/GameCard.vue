<template>
  <NuxtLink :to="link" class="block transition-transform hover:scale-105">
    <UiCard class="p-6 h-full">
      <div class="flex flex-col items-center text-center space-y-4">
        <div class="text-4xl">{{ icon }}</div>
        <h3 class="text-lg font-semibold">{{ title }}</h3>
        <p class="text-sm text-muted-foreground">{{ description }}</p>
        <UiBadge variant="outline">{{ duration }}</UiBadge>
      </div>
    </UiCard>
  </NuxtLink>
</template>

<script setup lang="ts">
interface Props {
  title: string
  description: string
  icon: string
  link: string
  duration: string
}

defineProps<Props>()
</script>
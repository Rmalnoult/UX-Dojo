<template>
  <div class="min-h-screen bg-background">
    <div class="container mx-auto px-4 py-8">
      <!-- Header -->
      <header class="text-center mb-12">
        <h1 class="text-4xl md:text-6xl font-bold mb-4">
          UX Dojo
          <span class="text-primary">🥋🎮</span>
        </h1>
        <p class="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          Master the Laws of UX through interactive mini-games.
          Learn by doing, not just reading!
        </p>
        <NuxtLink to="/games/hick">
          <UiButton size="lg">
            Start with a 2-minute game
          </UiButton>
        </NuxtLink>
      </header>

      <!-- Games Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <GameCard
          v-for="game in games"
          :key="game.id"
          :title="game.title"
          :description="game.description"
          :icon="game.icon"
          :link="game.link"
          :duration="game.duration"
        />
      </div>

      <!-- Info Section -->
      <div class="max-w-4xl mx-auto">
        <UiCard class="p-8">
          <h2 class="text-2xl font-bold mb-4">How It Works</h2>
          <div class="grid md:grid-cols-3 gap-6 text-center">
            <div>
              <div class="text-3xl mb-2">🎯</div>
              <h3 class="font-semibold mb-1">Pick a Game</h3>
              <p class="text-sm text-muted-foreground">Choose a UX law to practice</p>
            </div>
            <div>
              <div class="text-3xl mb-2">🕹️</div>
              <h3 class="font-semibold mb-1">Play & Learn</h3>
              <p class="text-sm text-muted-foreground">3-5 minute interactive challenges</p>
            </div>
            <div>
              <div class="text-3xl mb-2">📊</div>
              <h3 class="font-semibold mb-1">See Results</h3>
              <p class="text-sm text-muted-foreground">Understand why it matters</p>
            </div>
          </div>
        </UiCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { games } from '~/utils/games'

// The global titleTemplate appends " | UX Dojo"; the home page keeps its
// existing full title instead of getting the suffix twice.
useHead({
  titleTemplate: (title) => title || 'UX Dojo',
})

useSeoMeta({
  title: 'UX Dojo - Learn UX Laws Through Games',
  description: 'Interactive mini-games that teach the Laws of UX through fun challenges',
  ogTitle: 'UX Dojo - Learn UX Laws Through Games',
  ogDescription: 'Interactive mini-games that teach the Laws of UX through fun challenges',
  ogUrl: 'https://ux-dojo.com/',
})

useJsonLd([
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'UX Dojo',
    url: 'https://ux-dojo.com/',
    description: 'Interactive mini-games that teach the Laws of UX through fun challenges',
  },
  {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: games.map((game, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: game.title,
      url: `https://ux-dojo.com${game.link}`,
      description: game.description,
    })),
  },
])
</script>
<template>
  <div class="min-h-screen bg-background">
    <div class="container mx-auto px-4 py-8">
      <!-- Header -->
      <header class="text-center mb-12">
        <h1 class="text-4xl md:text-6xl font-bold mb-4">
          UX Dojo
          <span class="text-primary">🥋🎮</span>
        </h1>
        <p class="text-xl text-muted-foreground max-w-2xl mx-auto">
          Master the Laws of UX through interactive mini-games.
          Learn by doing, not just reading!
        </p>
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
const games = [
  {
    id: 'hick',
    title: "Hick's Law Challenge",
    description: "More choices = slower decisions. Test how menu complexity affects your speed.",
    icon: "🎯",
    link: "/games/hick",
    duration: "3-5 min"
  },
  {
    id: 'fitts',
    title: "Fitts's Law Reflex",
    description: "Size and distance matter! Click targets and discover the science of pointing.",
    icon: "🎪",
    link: "/games/fitts",
    duration: "3 min"
  },
  {
    id: 'miller',
    title: "Miller's Law Memory",
    description: "Can you remember 7±2 items? Test your short-term memory limits.",
    icon: "🧠",
    link: "/games/miller",
    duration: "4 min"
  },
  {
    id: 'serial',
    title: "Serial Position Recall",
    description: "First and last stick best. Experience the primacy and recency effects.",
    icon: "📝",
    link: "/games/serial",
    duration: "3 min"
  },
  {
    id: 'progressive',
    title: "Progressive Disclosure Race",
    description: "All at once vs step-by-step. Which interface is faster?",
    icon: "🔄",
    link: "/games/progressive",
    duration: "5 min"
  },
  {
    id: 'quiz',
    title: "Law or Not?",
    description: "UX truth or myth? Test your knowledge in this rapid-fire quiz.",
    icon: "❓",
    link: "/games/quiz",
    duration: "3 min"
  },
  {
    id: 'gestalt',
    title: "Gestalt Principles Puzzle",
    description: "Group elements using proximity, similarity, closure, and continuity.",
    icon: "🧩",
    link: "/games/gestalt",
    duration: "4-6 min"
  },
  {
    id: 'contrast',
    title: "Color Contrast Speedrun",
    description: "Train your eye for WCAG accessibility standards. AA or AAA?",
    icon: "🎨",
    link: "/games/contrast",
    duration: "3 min"
  },
  {
    id: 'accessibility',
    title: "Accessibility Audit Challenge",
    description: "Find and fix WCAG violations. Make the web accessible for everyone!",
    icon: "♿",
    link: "/games/accessibility",
    duration: "5-7 min"
  },
  {
    id: 'dark-patterns',
    title: "Dark Pattern Detective",
    description: "Spot manipulative design tactics and learn ethical alternatives.",
    icon: "🕵️",
    link: "/games/dark-patterns",
    duration: "4 min"
  }
]
</script>
<template>
  <div class="min-h-screen bg-background p-4">
    <div class="container mx-auto max-w-6xl">
      <!-- Game Header -->
      <div class="mb-8 text-center">
        <NuxtLink to="/" class="inline-flex items-center text-muted-foreground hover:text-foreground mb-4">
          <ChevronLeft class="w-4 h-4 mr-1" />
          Back to Games
        </NuxtLink>
        <h1 class="text-3xl font-bold mb-2">Hick's Law Challenge</h1>
        <p class="text-muted-foreground">More choices = slower decisions</p>
      </div>

      <!-- Game Stats -->
      <div class="flex justify-center gap-4 mb-8">
        <ScoreBadge :score="score" />
        <TimerBadge :time="timer.time.value" />
        <UiBadge variant="outline">
          Level {{ currentLevel + 1 }} / {{ levels.length }}
        </UiBadge>
      </div>

      <!-- Game State -->
      <div v-if="gameState === 'intro'" class="max-w-2xl mx-auto">
        <UiCard class="p-8 text-center">
          <h2 class="text-2xl font-bold mb-4">How to Play</h2>
          <p class="mb-6">
            You'll see a grid of menu options. Your task is to find and click the highlighted target as quickly as possible.
            As levels progress, more options will appear, demonstrating how choice overload affects decision speed.
          </p>
          <p class="text-sm text-muted-foreground mb-6">
            This demonstrates Hick's Law: The time to make a decision increases logarithmically with the number of choices.
          </p>
          <UiButton @click="startGame" size="lg">
            Start Game
          </UiButton>
        </UiCard>
      </div>

      <!-- Game Playing -->
      <div v-else-if="gameState === 'playing'" class="space-y-6">
        <!-- Instruction -->
        <div class="text-center">
          <h2 class="text-2xl font-semibold mb-2">
            Find and click:
            <span class="text-primary font-bold">{{ currentTarget }}</span>
          </h2>
          <p class="text-muted-foreground">Level {{ currentLevel + 1 }}: {{ currentOptions.length }} options</p>
        </div>

        <!-- Options Grid -->
        <div
          :class="gridClass"
          class="gap-4 max-w-4xl mx-auto"
        >
          <button
            v-for="option in currentOptions"
            :key="option.id"
            @click="selectOption(option)"
            class="p-6 bg-card hover:bg-accent hover:scale-105 rounded-lg transition-all cursor-pointer border-2 border-transparent hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
            :class="{ 'animate-pulse border-primary': showHint && option.label === currentTarget }"
          >
            <div class="text-3xl mb-2">{{ option.icon }}</div>
            <div class="font-medium">{{ option.label }}</div>
          </button>
        </div>

        <!-- Performance indicator -->
        <div class="text-center text-sm text-muted-foreground">
          <p>Response time: {{ lastResponseTime }}ms</p>
        </div>
      </div>

      <!-- Results -->
      <div v-else-if="gameState === 'results'" class="max-w-4xl mx-auto space-y-6">
        <UiCard class="p-8">
          <h2 class="text-2xl font-bold mb-6 text-center">Game Complete!</h2>

          <div class="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 class="font-semibold mb-2">Your Stats</h3>
              <div class="space-y-2">
                <p>Final Score: <span class="font-bold text-primary">{{ score }}</span></p>
                <p>Total Time: <span class="font-bold">{{ timer.time.value }}s</span></p>
                <p>Accuracy: <span class="font-bold">{{ accuracy }}%</span></p>
              </div>
            </div>
            <div>
              <h3 class="font-semibold mb-2">What This Shows</h3>
              <p class="text-sm text-muted-foreground">
                Your response times increased as more options were added, demonstrating Hick's Law.
                This is why good UX design limits choices and uses progressive disclosure.
              </p>
            </div>
          </div>

          <!-- Response Time Chart -->
          <div class="mb-6">
            <h3 class="font-semibold mb-4">Response Time by Number of Options</h3>
            <div class="bg-muted p-4 rounded-lg">
              <div class="flex items-end justify-around h-32">
                <div v-for="(result, index) in levelResults" :key="index" class="flex flex-col items-center">
                  <div
                    class="w-12 bg-primary rounded-t"
                    :style="{ height: `${(result.avgTime / maxTime) * 100}%` }"
                  ></div>
                  <div class="text-xs mt-2">{{ result.options }}</div>
                  <div class="text-xs text-muted-foreground">{{ result.avgTime }}ms</div>
                </div>
              </div>
              <div class="text-center text-xs text-muted-foreground mt-2">Number of Options</div>
            </div>
          </div>

          <div class="flex gap-4 justify-center">
            <UiButton @click="saveScore" variant="default">
              Save Score
            </UiButton>
            <UiButton @click="resetGame" variant="outline">
              Play Again
            </UiButton>
            <NuxtLink to="/">
              <UiButton variant="ghost">
                Back to Games
              </UiButton>
            </NuxtLink>
          </div>
        </UiCard>

        <!-- Leaderboard -->
        <UiCard class="p-6" v-if="topScores.length > 0">
          <h3 class="font-semibold mb-4">Top Scores</h3>
          <div class="space-y-2">
            <div v-for="(entry, index) in topScores" :key="entry.id" class="flex justify-between items-center">
              <div class="flex items-center gap-2">
                <UiBadge variant="outline">{{ index + 1 }}</UiBadge>
                <span>{{ entry.playerName }}</span>
              </div>
              <span class="font-bold">{{ entry.score }} pts</span>
            </div>
          </div>
        </UiCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ChevronLeft } from 'lucide-vue-next'

interface Option {
  id: string
  label: string
  icon: string
}

// Game state
const gameState = ref<'intro' | 'playing' | 'results'>('intro')
const currentLevel = ref(0)
const score = ref(0)
const currentTarget = ref('')
const currentOptions = ref<Option[]>([])
const showHint = ref(false)
const lastResponseTime = ref(0)
const levelStartTime = ref(0)
const correctAnswers = ref(0)
const totalAnswers = ref(0)
const levelResults = ref<Array<{ options: number; avgTime: number }>>([])

// Timer
const timer = useGameTimer()

// Leaderboard
const leaderboard = useLeaderboard()
const topScores = ref(leaderboard.getTopScores('hick', 5))

// All available options
const allOptions: Option[] = [
  { id: 'settings', label: 'Settings', icon: '⚙️' },
  { id: 'profile', label: 'Profile', icon: '👤' },
  { id: 'export', label: 'Export', icon: '📤' },
  { id: 'import', label: 'Import', icon: '📥' },
  { id: 'share', label: 'Share', icon: '🔗' },
  { id: 'print', label: 'Print', icon: '🖨️' },
  { id: 'save', label: 'Save', icon: '💾' },
  { id: 'delete', label: 'Delete', icon: '🗑️' },
  { id: 'edit', label: 'Edit', icon: '✏️' },
  { id: 'copy', label: 'Copy', icon: '📋' },
  { id: 'paste', label: 'Paste', icon: '📌' },
  { id: 'undo', label: 'Undo', icon: '↩️' },
  { id: 'redo', label: 'Redo', icon: '↪️' },
  { id: 'help', label: 'Help', icon: '❓' },
  { id: 'search', label: 'Search', icon: '🔍' },
  { id: 'filter', label: 'Filter', icon: '🔽' },
  { id: 'sort', label: 'Sort', icon: '📊' },
  { id: 'view', label: 'View', icon: '👁️' },
  { id: 'download', label: 'Download', icon: '⬇️' },
  { id: 'upload', label: 'Upload', icon: '⬆️' },
]

// Level configurations
const levels = [
  { options: 3, time: 10 },
  { options: 6, time: 10 },
  { options: 9, time: 12 },
  { options: 12, time: 12 },
  { options: 16, time: 15 },
]

// Computed
const gridClass = computed(() => {
  const count = currentOptions.value.length
  if (count <= 3) return 'grid grid-cols-3'
  if (count <= 6) return 'grid grid-cols-3'
  if (count <= 9) return 'grid grid-cols-3'
  if (count <= 12) return 'grid grid-cols-4'
  return 'grid grid-cols-4'
})

const accuracy = computed(() => {
  if (totalAnswers.value === 0) return 100
  return Math.round((correctAnswers.value / totalAnswers.value) * 100)
})

const maxTime = computed(() => {
  return Math.max(...levelResults.value.map(r => r.avgTime))
})

// Methods
const startGame = () => {
  gameState.value = 'playing'
  score.value = 0
  currentLevel.value = 0
  correctAnswers.value = 0
  totalAnswers.value = 0
  levelResults.value = []
  timer.reset()
  timer.start()
  setupLevel()
}

const setupLevel = () => {
  const level = levels[currentLevel.value]

  // Shuffle and pick random options
  const shuffled = [...allOptions].sort(() => Math.random() - 0.5)
  currentOptions.value = shuffled.slice(0, level.options)

  // Pick a random target
  currentTarget.value = currentOptions.value[Math.floor(Math.random() * currentOptions.value.length)].label

  // Reset hint
  showHint.value = false
  levelStartTime.value = Date.now()

  // Show hint after 3 seconds
  setTimeout(() => {
    if (gameState.value === 'playing') {
      showHint.value = true
    }
  }, 3000)
}

const selectOption = (option: Option) => {
  const responseTime = Date.now() - levelStartTime.value
  lastResponseTime.value = responseTime
  totalAnswers.value++

  if (option.label === currentTarget.value) {
    // Correct answer
    correctAnswers.value++
    const points = Math.max(0, 1000 - responseTime)
    score.value += points

    // Store level result
    if (!levelResults.value[currentLevel.value]) {
      levelResults.value[currentLevel.value] = {
        options: currentOptions.value.length,
        avgTime: responseTime
      }
    }

    // Next level or end game
    if (currentLevel.value < levels.length - 1) {
      currentLevel.value++
      setupLevel()
    } else {
      endGame()
    }
  } else {
    // Wrong answer
    score.value = Math.max(0, score.value - 50)
  }
}

const endGame = () => {
  timer.stop()
  gameState.value = 'results'
}

const saveScore = async () => {
  const playerName = prompt('Enter your name:') || 'Anonymous'
  leaderboard.addScore({
    gameId: 'hick',
    playerName,
    score: score.value,
    metadata: {
      accuracy: accuracy.value,
      time: timer.time.value,
      levelResults: levelResults.value
    }
  })
  topScores.value = leaderboard.getTopScores('hick', 5)
}

const resetGame = () => {
  gameState.value = 'intro'
  score.value = 0
  currentLevel.value = 0
  timer.reset()
}

// Cleanup
onUnmounted(() => {
  timer.stop()
})
</script>
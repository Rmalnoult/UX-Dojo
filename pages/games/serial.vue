<template>
  <div class="min-h-screen bg-background p-4">
    <div class="container mx-auto max-w-6xl">
      <!-- Game Header -->
      <div class="mb-8 text-center">
        <NuxtLink to="/" class="inline-flex items-center text-muted-foreground hover:text-foreground mb-4">
          <ChevronLeft class="w-4 h-4 mr-1" />
          Back to Games
        </NuxtLink>
        <h1 class="text-3xl font-bold mb-2">Serial Position Recall</h1>
        <p class="text-muted-foreground">First and last stick best</p>
      </div>

      <!-- Game Stats -->
      <div class="flex justify-center gap-4 mb-8">
        <ScoreBadge :score="score" />
        <UiBadge variant="outline">
          Round {{ currentRound + 1 }} / {{ totalRounds }}
        </UiBadge>
      </div>

      <!-- Game State -->
      <div v-if="gameState === 'intro'" class="max-w-2xl mx-auto">
        <UiCard class="p-8 text-center">
          <h2 class="text-2xl font-bold mb-4">How to Play</h2>
          <p class="mb-6">
            You'll see 10 words displayed one at a time. After the sequence, type as many words as you can remember in any order.
          </p>
          <p class="text-sm text-muted-foreground mb-6">
            This demonstrates the Serial Position Effect: items at the beginning (primacy) and end (recency) are remembered better than those in the middle.
          </p>
          <UiButton @click="startGame" size="lg">
            Start Game
          </UiButton>
        </UiCard>
      </div>

      <!-- Presentation Phase -->
      <div v-else-if="gameState === 'presenting'" class="space-y-6">
        <div class="text-center">
          <div class="flex justify-center gap-2 mb-8">
            <div
              v-for="i in 10"
              :key="i"
              class="w-3 h-3 rounded-full transition-all"
              :class="i <= currentWordIndex + 1 ? 'bg-primary' : 'bg-muted'"
            ></div>
          </div>
          <div class="min-h-[200px] flex items-center justify-center">
            <h2 class="text-6xl font-bold animate-pulse">
              {{ currentWord }}
            </h2>
          </div>
          <p class="text-muted-foreground mt-4">Focus on the word...</p>
        </div>
      </div>

      <!-- Recall Phase -->
      <div v-else-if="gameState === 'recalling'" class="space-y-6 max-w-2xl mx-auto">
        <div class="text-center">
          <h2 class="text-2xl font-semibold mb-2">Recall the words!</h2>
          <p class="text-muted-foreground">Type words you remember and press Enter</p>
        </div>

        <!-- Input -->
        <div class="space-y-4">
          <input
            v-model="recallInput"
            @keyup.enter="addRecalledWord"
            type="text"
            placeholder="Type a word and press Enter..."
            class="w-full px-4 py-3 text-lg border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
            :disabled="timeUp"
          />

          <!-- Timer -->
          <UiProgress :value="(recallTimeLeft / 30) * 100" />
          <p class="text-center text-sm text-muted-foreground">
            Time left: {{ recallTimeLeft }}s
          </p>
        </div>

        <!-- Recalled words -->
        <div class="space-y-2">
          <h3 class="font-semibold">Words recalled ({{ recalledWords.length }})</h3>
          <div class="flex flex-wrap gap-2">
            <UiBadge
              v-for="word in recalledWords"
              :key="word"
              :variant="correctWords.includes(word) ? 'default' : 'destructive'"
            >
              {{ word }}
            </UiBadge>
          </div>
        </div>

        <div class="text-center">
          <UiButton @click="endRound" :disabled="!timeUp && recallTimeLeft > 25">
            {{ timeUp ? 'Continue' : 'Done (skip remaining time)' }}
          </UiButton>
        </div>
      </div>

      <!-- Results -->
      <div v-else-if="gameState === 'results'" class="max-w-4xl mx-auto space-y-6">
        <UiCard class="p-8">
          <h2 class="text-2xl font-bold mb-6 text-center">Game Complete!</h2>

          <div class="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 class="font-semibold mb-2">Your Performance</h3>
              <div class="space-y-2">
                <p>Final Score: <span class="font-bold text-primary">{{ score }}</span></p>
                <p>Total Words Recalled: <span class="font-bold">{{ totalRecalled }}</span></p>
                <p>Accuracy: <span class="font-bold">{{ Math.round(accuracy) }}%</span></p>
              </div>
            </div>
            <div>
              <h3 class="font-semibold mb-2">The U-Curve Effect</h3>
              <p class="text-sm text-muted-foreground">
                Your results show the classic serial position curve: better recall for first items (primacy) and last items (recency), with poor recall in the middle.
              </p>
            </div>
          </div>

          <!-- Position Effect Chart -->
          <div class="mb-6">
            <h3 class="font-semibold mb-4">Recall Rate by Position</h3>
            <div class="bg-muted p-4 rounded-lg">
              <div class="flex items-end justify-around h-32">
                <div v-for="(rate, index) in positionRecallRates" :key="index" class="flex flex-col items-center flex-1">
                  <div
                    class="w-full rounded-t"
                    :class="{
                      'bg-green-500': index < 2 || index >= 8,
                      'bg-primary': index >= 2 && index < 8
                    }"
                    :style="{ height: `${rate}%` }"
                  ></div>
                  <div class="text-xs mt-1">{{ index + 1 }}</div>
                </div>
              </div>
              <div class="text-center text-xs text-muted-foreground mt-2">Word Position</div>
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
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ChevronLeft } from 'lucide-vue-next'

// Word pools by category
const wordPools = {
  tech: ['keyboard', 'monitor', 'browser', 'database', 'algorithm', 'interface', 'network', 'server', 'cloud', 'software'],
  nature: ['mountain', 'river', 'forest', 'ocean', 'desert', 'valley', 'meadow', 'canyon', 'glacier', 'waterfall'],
  abstract: ['wisdom', 'courage', 'freedom', 'justice', 'beauty', 'harmony', 'passion', 'mystery', 'destiny', 'serenity'],
  daily: ['coffee', 'newspaper', 'umbrella', 'wallet', 'glasses', 'backpack', 'bicycle', 'sandwich', 'notebook', 'calendar']
}

// Game configuration
const totalRounds = 3
const wordsPerRound = 10
const presentationSpeed = ref(2000) // Start at 2s per word

// Game state
const gameState = ref<'intro' | 'presenting' | 'recalling' | 'results'>('intro')
const currentRound = ref(0)
const score = ref(0)
const currentWords = ref<string[]>([])
const currentWordIndex = ref(0)
const currentWord = ref('')
const recalledWords = ref<string[]>([])
const correctWords = ref<string[]>([])
const recallInput = ref('')
const recallTimeLeft = ref(30)
const timeUp = ref(false)
const positionRecalls = ref<number[]>(new Array(10).fill(0))
const positionCounts = ref<number[]>(new Array(10).fill(0))

// Recall timer
let recallTimer: NodeJS.Timeout | null = null

// Leaderboard
const leaderboard = useLeaderboard()

// Computed
const totalRecalled = computed(() => {
  return positionRecalls.value.reduce((sum, count) => sum + count, 0)
})

const accuracy = computed(() => {
  const total = positionCounts.value.reduce((sum, count) => sum + count, 0)
  if (total === 0) return 100
  return (totalRecalled.value / total) * 100
})

const positionRecallRates = computed(() => {
  return positionRecalls.value.map((recalls, index) => {
    const attempts = positionCounts.value[index]
    if (attempts === 0) return 0
    return Math.round((recalls / attempts) * 100)
  })
})

// Methods
const startGame = () => {
  gameState.value = 'presenting'
  score.value = 0
  currentRound.value = 0
  positionRecalls.value = new Array(10).fill(0)
  positionCounts.value = new Array(10).fill(0)
  presentationSpeed.value = 2000
  startRound()
}

const startRound = () => {
  // Select random word pool
  const poolNames = Object.keys(wordPools) as Array<keyof typeof wordPools>
  const selectedPool = wordPools[poolNames[Math.floor(Math.random() * poolNames.length)]]

  // Shuffle and select 10 words
  currentWords.value = [...selectedPool].sort(() => Math.random() - 0.5).slice(0, wordsPerRound)
  currentWordIndex.value = 0
  currentWord.value = currentWords.value[0]

  // Start presenting words
  presentWords()
}

const presentWords = () => {
  if (currentWordIndex.value < wordsPerRound - 1) {
    setTimeout(() => {
      currentWordIndex.value++
      currentWord.value = currentWords.value[currentWordIndex.value]
      presentWords()
    }, presentationSpeed.value)
  } else {
    // After last word, start recall phase
    setTimeout(() => {
      startRecallPhase()
    }, presentationSpeed.value)
  }
}

const startRecallPhase = () => {
  gameState.value = 'recalling'
  recalledWords.value = []
  correctWords.value = []
  recallInput.value = ''
  recallTimeLeft.value = 30
  timeUp.value = false

  // Start countdown
  recallTimer = setInterval(() => {
    recallTimeLeft.value--
    if (recallTimeLeft.value <= 0) {
      timeUp.value = true
      if (recallTimer) clearInterval(recallTimer)
    }
  }, 1000)
}

const addRecalledWord = () => {
  const word = recallInput.value.trim().toLowerCase()
  if (!word || recalledWords.value.includes(word)) {
    recallInput.value = ''
    return
  }

  recalledWords.value.push(word)

  // Check if word is correct and find its position
  const originalIndex = currentWords.value.findIndex(w => w.toLowerCase() === word)
  if (originalIndex !== -1) {
    correctWords.value.push(word)
    positionRecalls.value[originalIndex]++
    score.value += 100

    // Bonus for primacy (first 2) or recency (last 2)
    if (originalIndex < 2 || originalIndex >= 8) {
      score.value += 25
    }
  }

  recallInput.value = ''
}

const endRound = () => {
  if (recallTimer) clearInterval(recallTimer)

  // Update position counts
  for (let i = 0; i < wordsPerRound; i++) {
    positionCounts.value[i]++
  }

  // Next round or end game
  if (currentRound.value < totalRounds - 1) {
    currentRound.value++
    presentationSpeed.value = Math.max(500, presentationSpeed.value - 500) // Speed up each round
    gameState.value = 'presenting'
    startRound()
  } else {
    endGame()
  }
}

const endGame = () => {
  gameState.value = 'results'
}

const saveScore = async () => {
  const playerName = prompt('Enter your name:') || 'Anonymous'
  leaderboard.addScore({
    gameId: 'serial',
    playerName,
    score: score.value,
    metadata: {
      totalRecalled: totalRecalled.value,
      accuracy: accuracy.value,
      positionRecallRates: positionRecallRates.value
    }
  })
}

const resetGame = () => {
  gameState.value = 'intro'
  score.value = 0
  currentRound.value = 0
  recalledWords.value = []
  if (recallTimer) clearInterval(recallTimer)
}

// Cleanup
onUnmounted(() => {
  if (recallTimer) clearInterval(recallTimer)
})
</script>
<template>
  <div class="min-h-screen bg-background p-4">
    <div class="container mx-auto max-w-6xl">
      <!-- Game Header -->
      <div class="mb-8 text-center">
        <NuxtLink to="/" class="inline-flex items-center text-muted-foreground hover:text-foreground mb-4">
          <ChevronLeft class="w-4 h-4 mr-1" />
          Back to Games
        </NuxtLink>
        <h1 class="text-3xl font-bold mb-2">Fitts's Law Reflex Test</h1>
        <p class="text-muted-foreground">Size and distance affect pointing speed</p>
      </div>

      <!-- Game Stats -->
      <div class="flex justify-center gap-4 mb-8">
        <ScoreBadge :score="score" />
        <UiBadge variant="outline">
          Target {{ currentTarget }} / {{ totalTargets }}
        </UiBadge>
        <UiBadge variant="secondary">
          Hits: {{ hits }} | Misses: {{ misses }}
        </UiBadge>
      </div>

      <!-- Game State -->
      <div v-if="gameState === 'intro'" class="max-w-2xl mx-auto">
        <UiCard class="p-8 text-center">
          <h2 class="text-2xl font-bold mb-4">How to Play</h2>
          <p class="mb-6">
            Click the targets as quickly and accurately as possible.
            Targets will vary in size and distance to demonstrate Fitts's Law.
          </p>
          <p class="text-sm text-muted-foreground mb-6">
            Fitts's Law: The time to acquire a target is a function of the distance to and size of the target.
            Formula: MT = a + b × log₂(2D/W)
          </p>
          <UiButton @click="startGame" size="lg">
            Start Game
          </UiButton>
        </UiCard>
      </div>

      <!-- Game Playing -->
      <div v-else-if="gameState === 'playing'" class="space-y-6">
        <!-- Play Area -->
        <div
          ref="playArea"
          @click="handlePlayAreaClick"
          class="relative bg-muted rounded-lg cursor-crosshair overflow-hidden"
          :style="{ height: '600px' }"
        >
          <!-- Target -->
          <div
            v-if="showTarget"
            @click.stop="clickTarget"
            class="absolute rounded-full bg-primary hover:bg-primary/90 transition-all duration-75 cursor-pointer animate-pulse"
            :style="{
              width: `${targetSize}px`,
              height: `${targetSize}px`,
              left: `${targetPosition.x}px`,
              top: `${targetPosition.y}px`,
              transform: 'translate(-50%, -50%)'
            }"
          >
            <div class="absolute inset-2 rounded-full bg-white/30"></div>
            <div class="absolute inset-4 rounded-full bg-white/50"></div>
          </div>

          <!-- Miss indicator -->
          <div
            v-for="miss in missIndicators"
            :key="miss.id"
            class="absolute w-8 h-8 border-2 border-destructive rounded-full animate-ping pointer-events-none"
            :style="{
              left: `${miss.x}px`,
              top: `${miss.y}px`,
              transform: 'translate(-50%, -50%)'
            }"
          ></div>

          <!-- Hit indicator -->
          <div
            v-for="hit in hitIndicators"
            :key="hit.id"
            class="absolute pointer-events-none"
            :style="{
              left: `${hit.x}px`,
              top: `${hit.y}px`,
              transform: 'translate(-50%, -50%)'
            }"
          >
            <div class="text-green-500 font-bold animate-bounce">+{{ hit.points }}</div>
          </div>
        </div>

        <!-- Current stats -->
        <div class="text-center text-sm text-muted-foreground">
          <p>Last reaction time: {{ lastReactionTime }}ms | Target size: {{ targetSize }}px</p>
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
                <p>Accuracy: <span class="font-bold">{{ accuracy }}%</span></p>
                <p>Average Time: <span class="font-bold">{{ avgReactionTime }}ms</span></p>
              </div>
            </div>
            <div>
              <h3 class="font-semibold mb-2">What This Demonstrates</h3>
              <p class="text-sm text-muted-foreground">
                Smaller targets took longer to hit, as did targets further away.
                This is why important UI elements should be larger and closer to common interaction areas.
              </p>
            </div>
          </div>

          <!-- Performance Chart -->
          <div class="mb-6">
            <h3 class="font-semibold mb-4">Performance by Target Size</h3>
            <div class="bg-muted p-4 rounded-lg">
              <div class="space-y-2">
                <div v-for="size in targetSizes" :key="size" class="flex items-center gap-4">
                  <span class="w-20 text-sm">{{ size }}px:</span>
                  <div class="flex-1 bg-background rounded-full h-6 relative">
                    <div
                      class="absolute inset-y-0 left-0 bg-primary rounded-full"
                      :style="{ width: `${getPerformanceBySize(size)}%` }"
                    ></div>
                  </div>
                  <span class="text-sm">{{ getAvgTimeBySize(size) }}ms</span>
                </div>
              </div>
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

interface TargetMetric {
  size: number
  distance: number
  reactionTime: number
  hit: boolean
}

// Game configuration
const totalTargets = 20
const targetSizes = [140, 96, 64, 44]

// Game state
const gameState = ref<'intro' | 'playing' | 'results'>('intro')
const score = ref(0)
const currentTarget = ref(0)
const hits = ref(0)
const misses = ref(0)
const showTarget = ref(false)
const targetSize = ref(96)
const targetPosition = ref({ x: 0, y: 0 })
const lastPosition = ref({ x: 0, y: 0 })
const targetStartTime = ref(0)
const lastReactionTime = ref(0)
const metrics = ref<TargetMetric[]>([])

// Visual feedback
const missIndicators = ref<Array<{ id: string; x: number; y: number }>>([])
const hitIndicators = ref<Array<{ id: string; x: number; y: number; points: number }>>([])

// Refs
const playArea = ref<HTMLElement>()

// Leaderboard
const leaderboard = useLeaderboard()
const topScores = ref(leaderboard.getTopScores('fitts', 5))

// Computed
const accuracy = computed(() => {
  const total = hits.value + misses.value
  if (total === 0) return 100
  return Math.round((hits.value / total) * 100)
})

const avgReactionTime = computed(() => {
  const hitMetrics = metrics.value.filter(m => m.hit)
  if (hitMetrics.length === 0) return 0
  const avg = hitMetrics.reduce((sum, m) => sum + m.reactionTime, 0) / hitMetrics.length
  return Math.round(avg)
})

// Methods
const startGame = () => {
  gameState.value = 'playing'
  score.value = 0
  currentTarget.value = 0
  hits.value = 0
  misses.value = 0
  metrics.value = []
  missIndicators.value = []
  hitIndicators.value = []

  // Start with center position
  const rect = playArea.value?.getBoundingClientRect()
  if (rect) {
    lastPosition.value = { x: rect.width / 2, y: rect.height / 2 }
  }

  showNextTarget()
}

const showNextTarget = () => {
  if (currentTarget.value >= totalTargets) {
    endGame()
    return
  }

  currentTarget.value++
  showTarget.value = false

  // Random delay before showing next target
  setTimeout(() => {
    const rect = playArea.value?.getBoundingClientRect()
    if (!rect) return

    // Choose random size
    targetSize.value = targetSizes[Math.floor(Math.random() * targetSizes.length)]

    // Calculate position ensuring target stays within bounds
    const margin = targetSize.value / 2 + 20
    let x, y, distance

    // Ensure minimum distance from last position
    do {
      x = margin + Math.random() * (rect.width - 2 * margin)
      y = margin + Math.random() * (rect.height - 2 * margin)
      distance = Math.sqrt(
        Math.pow(x - lastPosition.value.x, 2) +
        Math.pow(y - lastPosition.value.y, 2)
      )
    } while (distance < 100) // Minimum 100px distance

    targetPosition.value = { x, y }
    showTarget.value = true
    targetStartTime.value = Date.now()
  }, 200 + Math.random() * 300)
}

const clickTarget = () => {
  if (!showTarget.value) return

  const reactionTime = Date.now() - targetStartTime.value
  lastReactionTime.value = reactionTime

  // Calculate distance from last position
  const distance = Math.sqrt(
    Math.pow(targetPosition.value.x - lastPosition.value.x, 2) +
    Math.pow(targetPosition.value.y - lastPosition.value.y, 2)
  )

  // Store metric
  metrics.value.push({
    size: targetSize.value,
    distance,
    reactionTime,
    hit: true
  })

  // Calculate score (inversely proportional to time, bonus for smaller targets)
  const sizeBonus = (140 - targetSize.value) * 2
  const points = Math.max(0, Math.round(2000 - reactionTime + sizeBonus))
  score.value += points
  hits.value++

  // Show hit indicator
  hitIndicators.value.push({
    id: crypto.randomUUID(),
    x: targetPosition.value.x,
    y: targetPosition.value.y,
    points
  })

  // Remove indicator after animation
  setTimeout(() => {
    hitIndicators.value.shift()
  }, 1000)

  lastPosition.value = { ...targetPosition.value }
  showNextTarget()
}

const handlePlayAreaClick = (event: MouseEvent) => {
  if (!showTarget.value || event.target === playArea.value) {
    // Missed the target
    misses.value++
    score.value = Math.max(0, score.value - 50)

    const rect = playArea.value?.getBoundingClientRect()
    if (rect) {
      missIndicators.value.push({
        id: crypto.randomUUID(),
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      })

      // Remove indicator after animation
      setTimeout(() => {
        missIndicators.value.shift()
      }, 500)
    }
  }
}

const endGame = () => {
  gameState.value = 'results'
  showTarget.value = false
}

const getPerformanceBySize = (size: number) => {
  const sizeMetrics = metrics.value.filter(m => m.hit && m.size === size)
  if (sizeMetrics.length === 0) return 0

  const avgTime = sizeMetrics.reduce((sum, m) => sum + m.reactionTime, 0) / sizeMetrics.length
  // Normalize to percentage (best = 100%, worst = 0%)
  const normalized = Math.max(0, Math.min(100, (2000 - avgTime) / 15))
  return normalized
}

const getAvgTimeBySize = (size: number) => {
  const sizeMetrics = metrics.value.filter(m => m.hit && m.size === size)
  if (sizeMetrics.length === 0) return 0

  const avgTime = sizeMetrics.reduce((sum, m) => sum + m.reactionTime, 0) / sizeMetrics.length
  return Math.round(avgTime)
}

const saveScore = async () => {
  const playerName = prompt('Enter your name:') || 'Anonymous'
  leaderboard.addScore({
    gameId: 'fitts',
    playerName,
    score: score.value,
    metadata: {
      accuracy: accuracy.value,
      avgTime: avgReactionTime.value,
      metrics: metrics.value
    }
  })
  topScores.value = leaderboard.getTopScores('fitts', 5)
}

const resetGame = () => {
  gameState.value = 'intro'
  score.value = 0
  currentTarget.value = 0
  metrics.value = []
}
</script>
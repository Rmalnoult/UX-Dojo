<template>
  <div class="min-h-screen bg-background p-4">
    <div class="container mx-auto max-w-6xl">
      <!-- Header -->
      <div class="mb-8 text-center">
        <NuxtLink to="/" class="inline-flex items-center text-muted-foreground hover:text-foreground mb-4">
          <ChevronLeft class="w-4 h-4 mr-1" />
          Back to Games
        </NuxtLink>
        <h1 class="text-3xl font-bold mb-2">Gestalt Principles Puzzle</h1>
        <p class="text-muted-foreground">Group elements using visual perception principles</p>
      </div>

      <!-- Stats -->
      <div class="flex justify-center gap-4 mb-8">
        <ScoreBadge :score="score" />
        <TimerBadge :time="timer.time.value" />
        <UiBadge variant="outline">
          Level {{ currentLevel + 1 }} / {{ levels.length }}
        </UiBadge>
      </div>

      <!-- Game States -->
      <div v-if="gameState === 'intro'" class="max-w-2xl mx-auto">
        <UiCard class="p-8 text-center">
          <h2 class="text-2xl font-bold mb-4">How to Play</h2>
          <p class="mb-6">
            Arrange UI elements to create meaningful visual groups using Gestalt principles:
            <strong>Proximity</strong>, <strong>Similarity</strong>, <strong>Closure</strong>, and <strong>Continuity</strong>.
          </p>
          <div class="grid md:grid-cols-2 gap-4 text-left mb-6">
            <div class="p-4 bg-muted rounded-lg">
              <h3 class="font-semibold mb-2">📏 Proximity</h3>
              <p class="text-sm">Items close together are perceived as related</p>
            </div>
            <div class="p-4 bg-muted rounded-lg">
              <h3 class="font-semibold mb-2">🎨 Similarity</h3>
              <p class="text-sm">Similar items are perceived as a group</p>
            </div>
            <div class="p-4 bg-muted rounded-lg">
              <h3 class="font-semibold mb-2">⭕ Closure</h3>
              <p class="text-sm">Mind completes incomplete shapes</p>
            </div>
            <div class="p-4 bg-muted rounded-lg">
              <h3 class="font-semibold mb-2">➡️ Continuity</h3>
              <p class="text-sm">Eye follows smooth paths</p>
            </div>
          </div>
          <UiButton @click="startGame" size="lg">Start Game</UiButton>
        </UiCard>
      </div>

      <!-- Playing State -->
      <div v-else-if="gameState === 'playing'" class="space-y-6">
        <!-- Instructions -->
        <UiCard class="p-4">
          <h2 class="text-xl font-semibold mb-2">
            {{ levels[currentLevel].title }}
          </h2>
          <p>{{ levels[currentLevel].instruction }}</p>
        </UiCard>

        <!-- Canvas Area -->
        <div class="grid md:grid-cols-2 gap-6">
          <!-- Work Area -->
          <UiCard class="p-6">
            <h3 class="font-semibold mb-4">Arrange These Elements</h3>
            <div
              ref="workArea"
              class="relative bg-muted rounded-lg min-h-[400px] p-4"
              @drop="onDrop"
              @dragover.prevent
            >
              <div
                v-for="element in workElements"
                :key="element.id"
                :draggable="true"
                @dragstart="onDragStart($event, element)"
                class="absolute cursor-move hover:scale-105 transition-transform"
                :style="{
                  left: `${element.x}px`,
                  top: `${element.y}px`,
                  width: `${element.width}px`,
                  height: `${element.height}px`,
                  backgroundColor: element.color,
                  borderRadius: element.shape === 'circle' ? '50%' : '8px',
                  border: element.selected ? '3px solid blue' : '2px solid transparent'
                }"
                @click="toggleSelect(element)"
              >
                <div class="flex items-center justify-center h-full text-xs">
                  {{ element.label }}
                </div>
              </div>
            </div>
          </UiCard>

          <!-- Reference/Target -->
          <UiCard class="p-6">
            <h3 class="font-semibold mb-4">Goal Pattern</h3>
            <div class="bg-muted rounded-lg min-h-[400px] p-4 relative">
              <div
                v-for="element in targetElements"
                :key="element.id"
                class="absolute"
                :style="{
                  left: `${element.x}px`,
                  top: `${element.y}px`,
                  width: `${element.width}px`,
                  height: `${element.height}px`,
                  backgroundColor: element.color,
                  borderRadius: element.shape === 'circle' ? '50%' : '8px',
                  opacity: 0.5
                }"
              >
                <div class="flex items-center justify-center h-full text-xs">
                  {{ element.label }}
                </div>
              </div>
            </div>
            <p class="text-sm text-muted-foreground mt-2">
              Arrange elements to match this grouping
            </p>
          </UiCard>
        </div>

        <!-- Actions -->
        <div class="flex justify-center gap-4">
          <UiButton @click="checkSolution">
            Check Solution
          </UiButton>
          <UiButton @click="resetLevel" variant="outline">
            Reset
          </UiButton>
          <UiButton @click="giveHint" variant="ghost">
            Hint
          </UiButton>
        </div>

        <!-- Feedback -->
        <div v-if="feedback" class="text-center">
          <UiBadge :variant="feedback.correct ? 'default' : 'destructive'" class="text-lg px-4 py-2">
            {{ feedback.message }}
          </UiBadge>
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
                <p>Total Time: <span class="font-bold">{{ timer.time.value }}s</span></p>
                <p>Levels Completed: <span class="font-bold">{{ levelsCompleted }}/{{ levels.length }}</span></p>
                <p>Hints Used: <span class="font-bold">{{ hintsUsed }}</span></p>
              </div>
            </div>
            <div>
              <h3 class="font-semibold mb-2">Gestalt Mastery</h3>
              <p class="text-sm text-muted-foreground">
                You've learned how visual grouping principles guide user perception.
                Apply these in your designs to create intuitive layouts!
              </p>
            </div>
          </div>

          <!-- Principle Breakdown -->
          <div class="mb-6">
            <h3 class="font-semibold mb-4">Principles Learned</h3>
            <div class="grid md:grid-cols-4 gap-4">
              <div v-for="principle in principlesLearned" :key="principle" class="p-3 bg-muted rounded-lg text-center">
                <p class="text-sm font-semibold">{{ principle }}</p>
              </div>
            </div>
          </div>

          <div class="flex gap-4 justify-center">
            <UiButton @click="saveScore" variant="default">Save Score</UiButton>
            <UiButton @click="resetGame" variant="outline">Play Again</UiButton>
            <NuxtLink to="/"><UiButton variant="ghost">Back to Games</UiButton></NuxtLink>
          </div>
        </UiCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ChevronLeft } from 'lucide-vue-next'

interface Element {
  id: string
  x: number
  y: number
  width: number
  height: number
  color: string
  shape: 'square' | 'circle'
  label: string
  group?: number
  selected?: boolean
}

// Game state
const gameState = ref<'intro' | 'playing' | 'results'>('intro')
const currentLevel = ref(0)
const score = ref(0)
const workElements = ref<Element[]>([])
const targetElements = ref<Element[]>([])
const draggedElement = ref<Element | null>(null)
const feedback = ref<{ correct: boolean; message: string } | null>(null)
const levelsCompleted = ref(0)
const hintsUsed = ref(0)
const principlesLearned = ref<string[]>([])

const timer = useGameTimer()
const leaderboard = useLeaderboard()
const workArea = ref<HTMLElement>()

// Levels configuration
const levels = [
  {
    title: 'Proximity Challenge',
    instruction: 'Group similar buttons by placing them close together',
    principle: 'Proximity',
    elements: [
      { id: 'btn1', label: 'Save', color: '#3b82f6', width: 80, height: 40, shape: 'square', group: 1 },
      { id: 'btn2', label: 'Edit', color: '#3b82f6', width: 80, height: 40, shape: 'square', group: 1 },
      { id: 'btn3', label: 'Delete', color: '#ef4444', width: 80, height: 40, shape: 'square', group: 2 },
      { id: 'btn4', label: 'Cancel', color: '#ef4444', width: 80, height: 40, shape: 'square', group: 2 },
    ] as Element[],
    target: [
      { id: 'btn1', x: 20, y: 20, label: 'Save', color: '#3b82f6', width: 80, height: 40, shape: 'square', group: 1 },
      { id: 'btn2', x: 110, y: 20, label: 'Edit', color: '#3b82f6', width: 80, height: 40, shape: 'square', group: 1 },
      { id: 'btn3', x: 20, y: 100, label: 'Delete', color: '#ef4444', width: 80, height: 40, shape: 'square', group: 2 },
      { id: 'btn4', x: 110, y: 100, label: 'Cancel', color: '#ef4444', width: 80, height: 40, shape: 'square', group: 2 },
    ] as Element[]
  },
  {
    title: 'Similarity Challenge',
    instruction: 'Group elements by visual similarity (color and shape)',
    principle: 'Similarity',
    elements: [
      { id: 'c1', label: '●', color: '#3b82f6', width: 60, height: 60, shape: 'circle', group: 1 },
      { id: 'c2', label: '●', color: '#3b82f6', width: 60, height: 60, shape: 'circle', group: 1 },
      { id: 's1', label: '■', color: '#10b981', width: 60, height: 60, shape: 'square', group: 2 },
      { id: 's2', label: '■', color: '#10b981', width: 60, height: 60, shape: 'square', group: 2 },
      { id: 'c3', label: '●', color: '#3b82f6', width: 60, height: 60, shape: 'circle', group: 1 },
      { id: 's3', label: '■', color: '#10b981', width: 60, height: 60, shape: 'square', group: 2 },
    ] as Element[],
    target: [
      { id: 'c1', x: 20, y: 50, label: '●', color: '#3b82f6', width: 60, height: 60, shape: 'circle', group: 1 },
      { id: 'c2', x: 90, y: 50, label: '●', color: '#3b82f6', width: 60, height: 60, shape: 'circle', group: 1 },
      { id: 'c3', x: 160, y: 50, label: '●', color: '#3b82f6', width: 60, height: 60, shape: 'circle', group: 1 },
      { id: 's1', x: 20, y: 150, label: '■', color: '#10b981', width: 60, height: 60, shape: 'square', group: 2 },
      { id: 's2', x: 90, y: 150, label: '■', color: '#10b981', width: 60, height: 60, shape: 'square', group: 2 },
      { id: 's3', x: 160, y: 150, label: '■', color: '#10b981', width: 60, height: 60, shape: 'square', group: 2 },
    ] as Element[]
  },
  {
    title: 'Closure Challenge',
    instruction: 'Complete the pattern - your mind fills in the gaps',
    principle: 'Closure',
    elements: [
      { id: 'p1', label: '◜', color: '#8b5cf6', width: 50, height: 50, shape: 'square', group: 1 },
      { id: 'p2', label: '◝', color: '#8b5cf6', width: 50, height: 50, shape: 'square', group: 1 },
      { id: 'p3', label: '◟', color: '#8b5cf6', width: 50, height: 50, shape: 'square', group: 1 },
      { id: 'p4', label: '◞', color: '#8b5cf6', width: 50, height: 50, shape: 'square', group: 1 },
    ] as Element[],
    target: [
      { id: 'p1', x: 100, y: 100, label: '◜', color: '#8b5cf6', width: 50, height: 50, shape: 'square', group: 1 },
      { id: 'p2', x: 150, y: 100, label: '◝', color: '#8b5cf6', width: 50, height: 50, shape: 'square', group: 1 },
      { id: 'p3', x: 100, y: 150, label: '◟', color: '#8b5cf6', width: 50, height: 50, shape: 'square', group: 1 },
      { id: 'p4', x: 150, y: 150, label: '◞', color: '#8b5cf6', width: 50, height: 50, shape: 'square', group: 1 },
    ] as Element[]
  },
  {
    title: 'Continuity Challenge',
    instruction: 'Arrange in a smooth visual flow',
    principle: 'Continuity',
    elements: [
      { id: 'f1', label: '1', color: '#ec4899', width: 50, height: 50, shape: 'circle', group: 1 },
      { id: 'f2', label: '2', color: '#ec4899', width: 50, height: 50, shape: 'circle', group: 1 },
      { id: 'f3', label: '3', color: '#ec4899', width: 50, height: 50, shape: 'circle', group: 1 },
      { id: 'f4', label: '4', color: '#ec4899', width: 50, height: 50, shape: 'circle', group: 1 },
      { id: 'f5', label: '5', color: '#ec4899', width: 50, height: 50, shape: 'circle', group: 1 },
    ] as Element[],
    target: [
      { id: 'f1', x: 50, y: 50, label: '1', color: '#ec4899', width: 50, height: 50, shape: 'circle', group: 1 },
      { id: 'f2', x: 100, y: 75, label: '2', color: '#ec4899', width: 50, height: 50, shape: 'circle', group: 1 },
      { id: 'f3', x: 150, y: 100, label: '3', color: '#ec4899', width: 50, height: 50, shape: 'circle', group: 1 },
      { id: 'f4', x: 200, y: 125, label: '4', color: '#ec4899', width: 50, height: 50, shape: 'circle', group: 1 },
      { id: 'f5', x: 250, y: 150, label: '5', color: '#ec4899', width: 50, height: 50, shape: 'circle', group: 1 },
    ] as Element[]
  }
]

// Methods
const startGame = () => {
  gameState.value = 'playing'
  score.value = 0
  currentLevel.value = 0
  levelsCompleted.value = 0
  hintsUsed.value = 0
  principlesLearned.value = []
  timer.reset()
  timer.start()
  setupLevel()
}

const setupLevel = () => {
  const level = levels[currentLevel.value]

  // Randomize positions for work elements
  workElements.value = level.elements.map(el => ({
    ...el,
    x: Math.random() * 250 + 20,
    y: Math.random() * 250 + 20
  }))

  targetElements.value = level.target
  feedback.value = null
}

const onDragStart = (event: DragEvent, element: Element) => {
  draggedElement.value = element
}

const onDrop = (event: DragEvent) => {
  if (!draggedElement.value || !workArea.value) return

  const rect = workArea.value.getBoundingClientRect()
  const x = event.clientX - rect.left - draggedElement.value.width / 2
  const y = event.clientY - rect.top - draggedElement.value.height / 2

  const index = workElements.value.findIndex(el => el.id === draggedElement.value!.id)
  if (index !== -1) {
    workElements.value[index].x = Math.max(0, Math.min(x, rect.width - draggedElement.value.width))
    workElements.value[index].y = Math.max(0, Math.min(y, rect.height - draggedElement.value.height))
  }

  draggedElement.value = null
}

const toggleSelect = (element: Element) => {
  element.selected = !element.selected
}

const checkSolution = () => {
  let correct = true
  const tolerance = 30 // pixels

  for (const workEl of workElements.value) {
    const targetEl = targetElements.value.find(t => t.id === workEl.id)
    if (!targetEl) continue

    const distance = Math.sqrt(
      Math.pow(workEl.x - targetEl.x, 2) + Math.pow(workEl.y - targetEl.y, 2)
    )

    if (distance > tolerance) {
      correct = false
      break
    }
  }

  if (correct) {
    const points = Math.max(500, 1000 - (timer.time.value * 10))
    score.value += points
    levelsCompleted.value++

    const principle = levels[currentLevel.value].principle
    if (!principlesLearned.value.includes(principle)) {
      principlesLearned.value.push(principle)
    }

    feedback.value = { correct: true, message: `Perfect! +${points} points` }

    setTimeout(() => {
      if (currentLevel.value < levels.length - 1) {
        currentLevel.value++
        setupLevel()
      } else {
        endGame()
      }
    }, 2000)
  } else {
    feedback.value = { correct: false, message: 'Not quite right. Try again!' }
    score.value = Math.max(0, score.value - 50)
  }
}

const resetLevel = () => {
  setupLevel()
}

const giveHint = () => {
  hintsUsed.value++
  score.value = Math.max(0, score.value - 100)

  // Move first element closer to target
  if (workElements.value.length > 0) {
    const firstWork = workElements.value[0]
    const firstTarget = targetElements.value.find(t => t.id === firstWork.id)
    if (firstTarget) {
      firstWork.x = firstTarget.x
      firstWork.y = firstTarget.y
    }
  }
}

const endGame = () => {
  timer.stop()
  gameState.value = 'results'
}

const saveScore = () => {
  const playerName = prompt('Enter your name:') || 'Anonymous'
  leaderboard.addScore({
    gameId: 'gestalt',
    playerName,
    score: score.value,
    metadata: {
      time: timer.time.value,
      levelsCompleted: levelsCompleted.value,
      hintsUsed: hintsUsed.value
    }
  })
}

const resetGame = () => {
  gameState.value = 'intro'
  timer.reset()
}

onUnmounted(() => {
  timer.stop()
})
</script>
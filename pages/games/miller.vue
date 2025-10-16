<template>
  <div class="min-h-screen bg-background p-4">
    <div class="container mx-auto max-w-6xl">
      <!-- Game Header -->
      <div class="mb-8 text-center">
        <NuxtLink to="/" class="inline-flex items-center text-muted-foreground hover:text-foreground mb-4">
          <ChevronLeft class="w-4 h-4 mr-1" />
          Back to Games
        </NuxtLink>
        <h1 class="text-3xl font-bold mb-2">Miller's Law Memory Sprint</h1>
        <p class="text-muted-foreground">Can you remember 7±2 items?</p>
      </div>

      <!-- Game Stats -->
      <div class="flex justify-center gap-4 mb-8">
        <ScoreBadge :score="score" />
        <UiBadge variant="outline">
          Level {{ currentLevel + 1 }} / {{ levels.length }}
        </UiBadge>
        <UiBadge variant="secondary">
          {{ levels[currentLevel] }} items
        </UiBadge>
      </div>

      <!-- Game State -->
      <div v-if="gameState === 'intro'" class="max-w-2xl mx-auto">
        <UiCard class="p-8 text-center">
          <h2 class="text-2xl font-bold mb-4">How to Play</h2>
          <p class="mb-6">
            Watch the sequence of icons carefully. Then, drag and drop them in the correct order.
            The number of items increases with each level: 5 → 7 → 9 → 11
          </p>
          <p class="text-sm text-muted-foreground mb-6">
            Miller's Law states that the average person can hold 7±2 items in working memory.
            Notice how it gets harder as we exceed this limit!
          </p>
          <UiButton @click="startGame" size="lg">
            Start Game
          </UiButton>
        </UiCard>
      </div>

      <!-- Memorization Phase -->
      <div v-else-if="gameState === 'memorizing'" class="space-y-6">
        <div class="text-center">
          <h2 class="text-2xl font-semibold mb-2">Memorize this sequence!</h2>
          <UiProgress :value="(currentShowIndex / sequence.length) * 100" class="max-w-md mx-auto" />
        </div>

        <!-- Sequence Display -->
        <div class="flex justify-center items-center min-h-[200px]">
          <div class="flex gap-4 flex-wrap justify-center max-w-2xl">
            <div
              v-for="(item, index) in visibleSequence"
              :key="index"
              class="relative"
              :class="{ 'scale-110': index === currentShowIndex - 1 }"
            >
              <div class="w-24 h-24 bg-card rounded-lg flex flex-col items-center justify-center transition-all duration-300 border-2"
                   :class="index === currentShowIndex - 1 ? 'border-primary shadow-lg' : 'border-transparent'">
                <span class="text-4xl mb-1">{{ item }}</span>
                <span class="text-xs text-muted-foreground">{{ index + 1 }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="text-center text-muted-foreground">
          <p>Focus on patterns or groups to remember better!</p>
        </div>
      </div>

      <!-- Recall Phase -->
      <div v-else-if="gameState === 'recalling'" class="space-y-6">
        <div class="text-center">
          <h2 class="text-2xl font-semibold mb-2">Now arrange them in order!</h2>
          <p class="text-muted-foreground">Drag items from the pool to the slots</p>
        </div>

        <!-- Drop Zones -->
        <div class="flex gap-4 flex-wrap justify-center max-w-3xl mx-auto mb-8">
          <div
            v-for="(slot, index) in dropZones"
            :key="index"
            @drop="onDrop($event, index)"
            @dragover.prevent
            @dragenter.prevent
            class="w-24 h-24 bg-muted rounded-lg flex flex-col items-center justify-center transition-all border-2 border-dashed"
            :class="slot ? 'border-primary bg-card' : 'border-muted-foreground'"
          >
            <span v-if="slot" class="text-4xl">{{ slot }}</span>
            <span v-else class="text-muted-foreground">{{ index + 1 }}</span>
          </div>
        </div>

        <!-- Item Pool -->
        <div class="bg-muted rounded-lg p-4">
          <p class="text-center text-sm text-muted-foreground mb-4">Available items (drag these up)</p>
          <div class="flex gap-4 flex-wrap justify-center">
            <div
              v-for="item in availableItems"
              :key="item"
              draggable="true"
              @dragstart="onDragStart($event, item)"
              class="w-20 h-20 bg-card rounded-lg flex items-center justify-center cursor-move hover:shadow-lg transition-all hover:scale-105 border-2 border-transparent hover:border-primary"
            >
              <span class="text-3xl select-none">{{ item }}</span>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex justify-center gap-4">
          <UiButton @click="checkAnswer" :disabled="!isSequenceComplete">
            Check Answer
          </UiButton>
          <UiButton @click="resetDropZones" variant="outline">
            Clear
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
                <p>Perfect Sequences: <span class="font-bold">{{ perfectSequences }}</span></p>
                <p>Success Rate: <span class="font-bold">{{ successRate }}%</span></p>
              </div>
            </div>
            <div>
              <h3 class="font-semibold mb-2">The Science</h3>
              <p class="text-sm text-muted-foreground">
                Most people struggle with more than 7-9 items because of working memory limits.
                Chunking (grouping items) can help overcome this limitation.
              </p>
            </div>
          </div>

          <!-- Performance by sequence length -->
          <div class="mb-6">
            <h3 class="font-semibold mb-4">Success by Sequence Length</h3>
            <div class="space-y-2">
              <div v-for="result in levelResults" :key="result.level" class="flex items-center gap-4">
                <span class="w-20 text-sm">{{ result.items }} items:</span>
                <div class="flex-1 bg-muted rounded-full h-6 relative">
                  <div
                    class="absolute inset-y-0 left-0 rounded-full"
                    :class="result.success ? 'bg-green-500' : 'bg-destructive'"
                    :style="{ width: `${(result.correctItems / result.items) * 100}%` }"
                  ></div>
                </div>
                <span class="text-sm">{{ result.correctItems }}/{{ result.items }}</span>
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
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ChevronLeft } from 'lucide-vue-next'

// Game configuration
const levels = [5, 7, 9, 11]
const itemPool = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯',
                  '🍎', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍒', '🥝',
                  '📱', '💻', '⌨️', '🖱️', '📷', '📹', '🎮', '🕹️', '🎯', '🎪',
                  '🌳', '🌲', '🌴', '🌵', '🌾', '🌿', '☘️', '🍀', '🌺', '🌸']

// Game state
const gameState = ref<'intro' | 'memorizing' | 'recalling' | 'results'>('intro')
const currentLevel = ref(0)
const score = ref(0)
const sequence = ref<string[]>([])
const visibleSequence = ref<string[]>([])
const currentShowIndex = ref(0)
const dropZones = ref<(string | null)[]>([])
const availableItems = ref<string[]>([])
const draggedItem = ref<string | null>(null)
const perfectSequences = ref(0)
const levelResults = ref<Array<{ level: number; items: number; correctItems: number; success: boolean }>>([])

// Leaderboard
const leaderboard = useLeaderboard()

// Computed
const isSequenceComplete = computed(() => {
  return dropZones.value.every(zone => zone !== null)
})

const successRate = computed(() => {
  if (levelResults.value.length === 0) return 0
  const successes = levelResults.value.filter(r => r.success).length
  return Math.round((successes / levelResults.value.length) * 100)
})

// Methods
const startGame = () => {
  gameState.value = 'memorizing'
  score.value = 0
  currentLevel.value = 0
  perfectSequences.value = 0
  levelResults.value = []
  startLevel()
}

const startLevel = () => {
  const sequenceLength = levels[currentLevel.value]

  // Create random sequence
  const shuffled = [...itemPool].sort(() => Math.random() - 0.5)
  sequence.value = shuffled.slice(0, sequenceLength)
  visibleSequence.value = []
  currentShowIndex.value = 0

  // Show items one by one
  showNextItem()
}

const showNextItem = () => {
  if (currentShowIndex.value < sequence.value.length) {
    currentShowIndex.value++
    visibleSequence.value = sequence.value.slice(0, currentShowIndex.value)

    setTimeout(() => {
      showNextItem()
    }, 800) // Show each item for 800ms
  } else {
    // Give a brief pause before recall phase
    setTimeout(() => {
      startRecallPhase()
    }, 1500)
  }
}

const startRecallPhase = () => {
  gameState.value = 'recalling'
  dropZones.value = new Array(sequence.value.length).fill(null)
  availableItems.value = [...sequence.value].sort(() => Math.random() - 0.5)
}

const onDragStart = (event: DragEvent, item: string) => {
  draggedItem.value = item
  event.dataTransfer!.effectAllowed = 'move'
}

const onDrop = (event: DragEvent, index: number) => {
  event.preventDefault()

  if (!draggedItem.value) return

  // If there's already an item in this slot, put it back in available items
  if (dropZones.value[index]) {
    availableItems.value.push(dropZones.value[index]!)
  }

  // Place the dragged item
  dropZones.value[index] = draggedItem.value

  // Remove from available items
  const itemIndex = availableItems.value.indexOf(draggedItem.value)
  if (itemIndex > -1) {
    availableItems.value.splice(itemIndex, 1)
  }

  draggedItem.value = null
}

const resetDropZones = () => {
  availableItems.value = [...availableItems.value, ...dropZones.value.filter(z => z !== null) as string[]]
  dropZones.value = new Array(sequence.value.length).fill(null)
}

const checkAnswer = () => {
  let correctItems = 0
  let points = 0

  // Check each position
  for (let i = 0; i < sequence.value.length; i++) {
    if (dropZones.value[i] === sequence.value[i]) {
      correctItems++
      points += 100
    }
  }

  // Perfect sequence bonus
  const isPerfect = correctItems === sequence.value.length
  if (isPerfect) {
    points += 200
    perfectSequences.value++
  }

  score.value += points

  // Store level result
  levelResults.value.push({
    level: currentLevel.value + 1,
    items: sequence.value.length,
    correctItems,
    success: isPerfect
  })

  // Show feedback and continue
  if (currentLevel.value < levels.length - 1) {
    alert(`${isPerfect ? 'Perfect!' : `${correctItems}/${sequence.value.length} correct`}. Moving to next level...`)
    currentLevel.value++
    gameState.value = 'memorizing'
    startLevel()
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
    gameId: 'miller',
    playerName,
    score: score.value,
    metadata: {
      perfectSequences: perfectSequences.value,
      successRate: successRate.value,
      levelResults: levelResults.value
    }
  })
}

const resetGame = () => {
  gameState.value = 'intro'
  score.value = 0
  currentLevel.value = 0
  sequence.value = []
  visibleSequence.value = []
}
</script>
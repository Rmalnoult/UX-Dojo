<template>
  <div class="min-h-screen bg-background p-4">
    <div class="container mx-auto max-w-4xl">
      <!-- Header -->
      <div class="mb-8 text-center">
        <NuxtLink to="/" class="inline-flex items-center text-muted-foreground hover:text-foreground mb-4">
          <ChevronLeft class="w-4 h-4 mr-1" />
          Back to Games
        </NuxtLink>
        <h1 class="text-3xl font-bold mb-2">Color Contrast Speedrun</h1>
        <p class="text-muted-foreground">Train your eye for WCAG accessibility</p>
      </div>

      <!-- Stats -->
      <div class="flex justify-center gap-4 mb-8">
        <ScoreBadge :score="score" :streak="streak" />
        <UiBadge variant="outline">
          Question {{ currentQuestion + 1 }} / {{ totalQuestions }}
        </UiBadge>
        <UiBadge :variant="colorblindMode ? 'default' : 'secondary'">
          {{ colorblindMode || 'Normal Vision' }}
        </UiBadge>
      </div>

      <!-- Game States -->
      <div v-if="gameState === 'intro'" class="max-w-2xl mx-auto">
        <UiCard class="p-8 text-center">
          <h2 class="text-2xl font-bold mb-4">How to Play</h2>
          <p class="mb-6">
            Judge whether text-background color combinations meet WCAG standards.
            You'll need to determine if they pass AA (4.5:1) or AAA (7:1) contrast ratios.
          </p>

          <div class="grid md:grid-cols-3 gap-4 mb-6 text-left">
            <div class="p-4 bg-muted rounded-lg">
              <h3 class="font-semibold mb-2">✗ Fail</h3>
              <p class="text-sm">Below 4.5:1 ratio</p>
            </div>
            <div class="p-4 bg-muted rounded-lg">
              <h3 class="font-semibold mb-2">✓ AA Pass</h3>
              <p class="text-sm">4.5:1 to 7:1 ratio</p>
            </div>
            <div class="p-4 bg-muted rounded-lg">
              <h3 class="font-semibold mb-2">✓✓ AAA Pass</h3>
              <p class="text-sm">7:1+ ratio</p>
            </div>
          </div>

          <div class="mb-6">
            <label class="block mb-2 font-semibold">Vision Mode:</label>
            <select v-model="colorblindMode" class="px-4 py-2 border rounded-lg">
              <option :value="null">Normal Vision</option>
              <option value="protanopia">Protanopia (Red-blind)</option>
              <option value="deuteranopia">Deuteranopia (Green-blind)</option>
              <option value="tritanopia">Tritanopia (Blue-blind)</option>
            </select>
          </div>

          <UiButton @click="startGame" size="lg">Start Game</UiButton>
        </UiCard>
      </div>

      <!-- Playing -->
      <div v-else-if="gameState === 'playing'" class="space-y-6">
        <!-- Timer Bar -->
        <div class="relative h-2 bg-muted rounded-full overflow-hidden">
          <div
            class="absolute h-full transition-all duration-100"
            :class="timeLeft <= 2 ? 'bg-destructive' : 'bg-primary'"
            :style="{ width: `${(timeLeft / timePerQuestion) * 100}%` }"
          ></div>
        </div>

        <!-- Color Sample -->
        <UiCard class="p-8">
          <div class="text-center mb-6">
            <div
              class="mx-auto p-8 rounded-lg inline-block min-w-[300px]"
              :style="{
                backgroundColor: currentSample.bgColor,
                filter: getColorblindFilter()
              }"
            >
              <p
                class="text-2xl font-bold"
                :style="{ color: currentSample.textColor }"
              >
                The quick brown fox jumps
              </p>
              <p
                class="text-base mt-2"
                :style="{ color: currentSample.textColor }"
              >
                Regular text sample for testing
              </p>
            </div>
          </div>

          <!-- Answer Buttons -->
          <div class="grid grid-cols-3 gap-4">
            <UiButton
              @click="answer('fail')"
              variant="destructive"
              size="lg"
              :disabled="answered"
              class="h-20"
            >
              <div>
                <div class="text-lg font-bold">✗ Fail</div>
                <div class="text-xs">Below 4.5:1</div>
              </div>
            </UiButton>
            <UiButton
              @click="answer('aa')"
              variant="default"
              size="lg"
              :disabled="answered"
              class="h-20"
            >
              <div>
                <div class="text-lg font-bold">✓ AA</div>
                <div class="text-xs">4.5:1 - 7:1</div>
              </div>
            </UiButton>
            <UiButton
              @click="answer('aaa')"
              variant="default"
              size="lg"
              :disabled="answered"
              class="h-20"
            >
              <div>
                <div class="text-lg font-bold">✓✓ AAA</div>
                <div class="text-xs">7:1+</div>
              </div>
            </UiButton>
          </div>
        </UiCard>

        <!-- Feedback -->
        <div v-if="showFeedback" class="animate-bounce">
          <UiCard :class="lastCorrect ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'" class="p-4 border-2">
            <div class="text-center">
              <p class="text-lg font-bold" :class="lastCorrect ? 'text-green-700' : 'text-red-700'">
                {{ lastCorrect ? '✓ Correct!' : '✗ Wrong!' }}
              </p>
              <p class="text-sm mt-2">
                Actual ratio: <strong>{{ currentSample.ratio.toFixed(2) }}:1</strong>
                ({{ currentSample.level }})
              </p>
            </div>
          </UiCard>
        </div>
      </div>

      <!-- Results -->
      <div v-else-if="gameState === 'results'" class="max-w-2xl mx-auto space-y-6">
        <UiCard class="p-8">
          <h2 class="text-2xl font-bold mb-6 text-center">Game Complete!</h2>

          <div class="text-center mb-6">
            <div class="text-6xl font-bold text-primary mb-2">{{ correctAnswers }}/{{ totalQuestions }}</div>
            <p class="text-xl">Final Score: {{ score }} points</p>
            <p class="text-muted-foreground">Best Streak: {{ bestStreak }}x</p>
            <p class="text-muted-foreground">Mode: {{ colorblindMode || 'Normal Vision' }}</p>
          </div>

          <!-- Accuracy by Level -->
          <div class="mb-6">
            <h3 class="font-semibold mb-4">Accuracy by Standard</h3>
            <div class="space-y-2">
              <div v-for="(acc, level) in accuracyByLevel" :key="level" class="flex items-center gap-4">
                <span class="w-20 text-sm">{{ level }}:</span>
                <div class="flex-1 bg-muted rounded-full h-6 relative">
                  <div
                    class="absolute inset-y-0 left-0 bg-primary rounded-full flex items-center justify-center"
                    :style="{ width: `${acc}%` }"
                  >
                    <span v-if="acc > 20" class="text-xs text-white font-bold">{{ acc }}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Learning Tips -->
          <div class="bg-muted p-4 rounded-lg">
            <h3 class="font-semibold mb-2">WCAG Quick Reference</h3>
            <ul class="text-sm space-y-1">
              <li>• <strong>4.5:1</strong> - Minimum for normal text (Level AA)</li>
              <li>• <strong>3:1</strong> - Large text (18pt+ or 14pt+ bold)</li>
              <li>• <strong>7:1</strong> - Enhanced contrast (Level AAA)</li>
              <li>• Test all color combinations in your designs!</li>
            </ul>
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

interface ColorSample {
  textColor: string
  bgColor: string
  ratio: number
  level: 'fail' | 'aa' | 'aaa'
}

// Game configuration
const totalQuestions = 15
const timePerQuestion = 5

// State
const gameState = ref<'intro' | 'playing' | 'results'>('intro')
const currentQuestion = ref(0)
const score = ref(0)
const correctAnswers = ref(0)
const streak = ref(0)
const bestStreak = ref(0)
const timeLeft = ref(timePerQuestion)
const answered = ref(false)
const showFeedback = ref(false)
const lastCorrect = ref(false)
const colorblindMode = ref<string | null>(null)
const currentSample = ref<ColorSample>({
  textColor: '#000000',
  bgColor: '#ffffff',
  ratio: 21,
  level: 'aaa'
})
const accuracyByLevel = ref<Record<string, number>>({
  'Fail': 0,
  'AA': 0,
  'AAA': 0
})
const questionsByLevel = ref<Record<string, number>>({
  'Fail': 0,
  'AA': 0,
  'AAA': 0
})
const correctByLevel = ref<Record<string, number>>({
  'Fail': 0,
  'AA': 0,
  'AAA': 0
})

let timer: NodeJS.Timeout | null = null

const leaderboard = useLeaderboard()

// Color pairs with known contrast ratios
const colorPairs = [
  // Fail
  { text: '#777777', bg: '#888888', ratio: 1.3, level: 'fail' },
  { text: '#ffcc00', bg: '#ffffff', ratio: 1.8, level: 'fail' },
  { text: '#00aaff', bg: '#0088cc', ratio: 1.2, level: 'fail' },
  { text: '#ff6b6b', bg: '#ffffff', ratio: 3.2, level: 'fail' },
  // AA
  { text: '#595959', bg: '#ffffff', ratio: 6.5, level: 'aa' },
  { text: '#0066cc', bg: '#ffffff', ratio: 5.1, level: 'aa' },
  { text: '#ffffff', bg: '#0088cc', ratio: 4.8, level: 'aa' },
  { text: '#2c5aa0', bg: '#ffffff', ratio: 5.9, level: 'aa' },
  // AAA
  { text: '#000000', bg: '#ffffff', ratio: 21.0, level: 'aaa' },
  { text: '#ffffff', bg: '#000000', ratio: 21.0, level: 'aaa' },
  { text: '#004085', bg: '#ffffff', ratio: 10.7, level: 'aaa' },
  { text: '#003d00', bg: '#ffffff', ratio: 12.3, level: 'aaa' },
  { text: '#ffffff', bg: '#005a00', ratio: 8.2, level: 'aaa' },
  { text: '#333333', bg: '#ffffff', ratio: 12.6, level: 'aaa' },
  { text: '#1a1a1a', bg: '#ffffff', ratio: 16.1, level: 'aaa' }
]

// Methods
const startGame = () => {
  gameState.value = 'playing'
  currentQuestion.value = 0
  score.value = 0
  correctAnswers.value = 0
  streak.value = 0
  bestStreak.value = 0
  answered.value = false
  showFeedback.value = false
  questionsByLevel.value = { 'Fail': 0, 'AA': 0, 'AAA': 0 }
  correctByLevel.value = { 'Fail': 0, 'AA': 0, 'AAA': 0 }

  showNextQuestion()
}

const showNextQuestion = () => {
  if (currentQuestion.value >= totalQuestions) {
    endGame()
    return
  }

  // Pick random color pair
  const pair = colorPairs[Math.floor(Math.random() * colorPairs.length)]
  currentSample.value = {
    textColor: pair.text,
    bgColor: pair.bg,
    ratio: pair.ratio,
    level: pair.level as 'fail' | 'aa' | 'aaa'
  }

  const levelKey = pair.level.toUpperCase()
  questionsByLevel.value[levelKey]++

  timeLeft.value = timePerQuestion
  answered.value = false
  showFeedback.value = false

  startTimer()
}

const startTimer = () => {
  timer = setInterval(() => {
    timeLeft.value -= 0.1
    if (timeLeft.value <= 0) {
      timeLeft.value = 0
      answer(null)
    }
  }, 100)
}

const answer = (userAnswer: 'fail' | 'aa' | 'aaa' | null) => {
  if (answered.value) return

  answered.value = true
  if (timer) clearInterval(timer)

  const correct = userAnswer === currentSample.value.level

  if (correct) {
    correctAnswers.value++
    streak.value++
    bestStreak.value = Math.max(bestStreak.value, streak.value)

    const levelKey = currentSample.value.level.toUpperCase()
    correctByLevel.value[levelKey]++

    const timeBonus = Math.round(timeLeft.value * 20)
    const streakBonus = Math.min(streak.value * 50, 250)
    score.value += 100 + timeBonus + streakBonus
  } else {
    streak.value = 0
    score.value = Math.max(0, score.value - 50)
  }

  lastCorrect.value = correct
  showFeedback.value = true

  setTimeout(() => {
    showFeedback.value = false
    currentQuestion.value++
    showNextQuestion()
  }, 2000)
}

const getColorblindFilter = () => {
  if (!colorblindMode.value) return 'none'

  const filters: Record<string, string> = {
    protanopia: 'url(#protanopia)',
    deuteranopia: 'url(#deuteranopia)',
    tritanopia: 'url(#tritanopia)'
  }

  // Simplified: use grayscale as approximation
  // In production, you'd use proper SVG filters
  switch (colorblindMode.value) {
    case 'protanopia':
      return 'hue-rotate(180deg) saturate(60%)'
    case 'deuteranopia':
      return 'hue-rotate(60deg) saturate(70%)'
    case 'tritanopia':
      return 'hue-rotate(240deg) saturate(50%)'
    default:
      return 'none'
  }
}

const endGame = () => {
  gameState.value = 'results'
  if (timer) clearInterval(timer)

  // Calculate accuracy by level
  for (const level of ['Fail', 'AA', 'AAA']) {
    const total = questionsByLevel.value[level]
    const correct = correctByLevel.value[level]
    accuracyByLevel.value[level] = total > 0 ? Math.round((correct / total) * 100) : 0
  }
}

const saveScore = () => {
  const playerName = prompt('Enter your name:') || 'Anonymous'
  leaderboard.addScore({
    gameId: 'contrast',
    playerName,
    score: score.value,
    metadata: {
      correctAnswers: correctAnswers.value,
      totalQuestions,
      bestStreak: bestStreak.value,
      colorblindMode: colorblindMode.value || 'normal',
      accuracyByLevel: accuracyByLevel.value
    }
  })
}

const resetGame = () => {
  gameState.value = 'intro'
  if (timer) clearInterval(timer)
}

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>
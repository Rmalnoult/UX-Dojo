<template>
  <div class="min-h-screen bg-background p-4">
    <div class="container mx-auto max-w-4xl">
      <!-- Header -->
      <div class="mb-8 text-center">
        <NuxtLink to="/" class="inline-flex items-center text-muted-foreground hover:text-foreground mb-4">
          <ChevronLeft class="w-4 h-4 mr-1" />
          Back to Games
        </NuxtLink>
        <h1 class="text-3xl font-bold mb-2">Law or Not?</h1>
        <p class="text-muted-foreground">UX truth or myth buster</p>
      </div>

      <!-- Stats -->
      <div class="flex justify-center gap-4 mb-8">
        <ScoreBadge :score="score" :streak="streak" />
        <UiBadge variant="outline">
          Question {{ currentQuestion + 1 }} / {{ totalQuestions }}
        </UiBadge>
      </div>

      <!-- Game States -->
      <div v-if="gameState === 'intro'" class="max-w-2xl mx-auto">
        <UiCard class="p-8 text-center">
          <h2 class="text-2xl font-bold mb-4">How to Play</h2>
          <p class="mb-6">
            You'll see statements about UX. Decide if each one is a real UX law or just a myth.
            Answer quickly - you only have 5 seconds per question!
          </p>
          <UiButton @click="startGame" size="lg">Start Quiz</UiButton>
        </UiCard>
      </div>

      <div v-else-if="gameState === 'playing'" class="space-y-6">
        <!-- Timer -->
        <div class="relative h-2 bg-muted rounded-full overflow-hidden">
          <div
            class="absolute h-full bg-primary transition-all duration-100"
            :style="{ width: `${(timeLeft / 5) * 100}%` }"
            :class="{ 'bg-destructive': timeLeft <= 2 }"
          ></div>
        </div>

        <!-- Question Card -->
        <UiCard class="p-8">
          <div class="text-center mb-8">
            <h2 class="text-2xl md:text-3xl font-bold">
              {{ questions[currentQuestion].statement }}
            </h2>
          </div>

          <!-- Answer Buttons -->
          <div class="grid grid-cols-2 gap-4">
            <UiButton
              @click="answer(true)"
              size="lg"
              variant="default"
              class="h-20 text-lg"
              :disabled="answered"
            >
              ✓ UX Law
            </UiButton>
            <UiButton
              @click="answer(false)"
              size="lg"
              variant="destructive"
              class="h-20 text-lg"
              :disabled="answered"
            >
              ✗ Not a Law
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
              <p class="text-sm mt-2">{{ questions[currentQuestion - 1].explanation }}</p>
            </div>
          </UiCard>
        </div>
      </div>

      <div v-else-if="gameState === 'results'" class="max-w-2xl mx-auto space-y-6">
        <UiCard class="p-8">
          <h2 class="text-2xl font-bold mb-6 text-center">Quiz Complete!</h2>

          <div class="text-center mb-6">
            <div class="text-6xl font-bold text-primary mb-2">{{ correctAnswers }}/{{ totalQuestions }}</div>
            <p class="text-xl">Final Score: {{ score }} points</p>
            <p class="text-muted-foreground">Best Streak: {{ bestStreak }}x</p>
          </div>

          <!-- Review Wrong Answers -->
          <div v-if="wrongAnswers.length > 0" class="space-y-4">
            <h3 class="font-semibold">Review These Laws:</h3>
            <div v-for="q in wrongAnswers" :key="q.id" class="p-3 bg-muted rounded-lg">
              <p class="font-medium">{{ q.statement }}</p>
              <p class="text-sm text-muted-foreground mt-1">
                {{ q.isLaw ? '✓ This IS a UX Law' : '✗ This is NOT a law' }}
              </p>
              <p class="text-sm mt-1">{{ q.explanation }}</p>
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

interface Question {
  id: string
  statement: string
  isLaw: boolean
  explanation: string
  category: string
}

// Questions database
const questionsDB: Question[] = [
  // True UX Laws
  {
    id: 'fitts',
    statement: "The time to reach a target depends on its size and distance",
    isLaw: true,
    explanation: "Fitts's Law: Larger, closer targets are faster to click",
    category: 'interaction'
  },
  {
    id: 'hick',
    statement: "Decision time increases logarithmically with the number of choices",
    isLaw: true,
    explanation: "Hick's Law: More options = slower decisions",
    category: 'cognition'
  },
  {
    id: 'miller',
    statement: "People can hold 7±2 items in working memory",
    isLaw: true,
    explanation: "Miller's Law: The magic number for short-term memory",
    category: 'cognition'
  },
  {
    id: 'jakob',
    statement: "Users prefer sites that work like ones they already know",
    isLaw: true,
    explanation: "Jakob's Law: Familiarity breeds usability",
    category: 'behavior'
  },
  {
    id: 'gestalt',
    statement: "Elements close together are perceived as related",
    isLaw: true,
    explanation: "Law of Proximity (Gestalt): Spacing creates relationships",
    category: 'perception'
  },
  {
    id: 'peak-end',
    statement: "People judge experiences by their peak moment and ending",
    isLaw: true,
    explanation: "Peak-End Rule: The most intense and final moments matter most",
    category: 'psychology'
  },
  {
    id: 'pareto',
    statement: "80% of effects come from 20% of causes",
    isLaw: true,
    explanation: "Pareto Principle: Focus on the vital few, not the trivial many",
    category: 'efficiency'
  },
  {
    id: 'zeigarnik',
    statement: "People remember incomplete tasks better than completed ones",
    isLaw: true,
    explanation: "Zeigarnik Effect: Unfinished business sticks in memory",
    category: 'psychology'
  },
  // Myths and Misconceptions
  {
    id: 'three-click',
    statement: "Users will leave if they can't find something in 3 clicks",
    isLaw: false,
    explanation: "The 3-click rule is a myth. Users care about progress, not click count",
    category: 'myth'
  },
  {
    id: 'fold',
    statement: "Users never scroll below the fold",
    isLaw: false,
    explanation: "Users do scroll if content is engaging. The fold is less important now",
    category: 'myth'
  },
  {
    id: 'f-pattern',
    statement: "Users always read content in an F-shaped pattern",
    isLaw: false,
    explanation: "F-pattern is common but not universal. Design influences reading patterns",
    category: 'myth'
  },
  {
    id: 'icons',
    statement: "Icons are always better than text labels",
    isLaw: false,
    explanation: "Icons without labels can be ambiguous. Text + icon is often best",
    category: 'myth'
  },
  {
    id: 'mobile-hurry',
    statement: "Mobile users are always in a hurry",
    isLaw: false,
    explanation: "Mobile usage patterns vary. Many use phones for extended browsing",
    category: 'myth'
  },
  {
    id: 'minimal',
    statement: "Minimal design is always better",
    isLaw: false,
    explanation: "Minimalism can harm usability if it hides necessary features",
    category: 'myth'
  },
  {
    id: 'young-tech',
    statement: "Young people don't need usability testing",
    isLaw: false,
    explanation: "All age groups benefit from good UX. Tech-savvy ≠ tolerant of bad design",
    category: 'myth'
  },
  {
    id: 'pretty',
    statement: "Beautiful design automatically means good UX",
    isLaw: false,
    explanation: "Aesthetics matter but don't guarantee usability or functionality",
    category: 'myth'
  }
]

// Game configuration
const totalQuestions = 10
const timePerQuestion = 5

// State
const gameState = ref<'intro' | 'playing' | 'results'>('intro')
const questions = ref<Question[]>([])
const currentQuestion = ref(0)
const score = ref(0)
const correctAnswers = ref(0)
const wrongAnswers = ref<Question[]>([])
const streak = ref(0)
const bestStreak = ref(0)
const timeLeft = ref(timePerQuestion)
const answered = ref(false)
const showFeedback = ref(false)
const lastCorrect = ref(false)

let timer: NodeJS.Timeout | null = null

// Leaderboard
const leaderboard = useLeaderboard()

// Methods
const startGame = () => {
  // Shuffle and select questions
  const shuffled = [...questionsDB].sort(() => Math.random() - 0.5)
  questions.value = shuffled.slice(0, totalQuestions)

  // Reset state
  gameState.value = 'playing'
  currentQuestion.value = 0
  score.value = 0
  correctAnswers.value = 0
  wrongAnswers.value = []
  streak.value = 0
  bestStreak.value = 0
  answered.value = false
  showFeedback.value = false

  startTimer()
}

const startTimer = () => {
  timeLeft.value = timePerQuestion
  answered.value = false

  timer = setInterval(() => {
    timeLeft.value -= 0.1
    if (timeLeft.value <= 0) {
      timeLeft.value = 0
      answer(null) // Time's up
    }
  }, 100)
}

const answer = (userAnswer: boolean | null) => {
  if (answered.value) return

  answered.value = true
  if (timer) clearInterval(timer)

  const question = questions.value[currentQuestion.value]
  const correct = userAnswer === question.isLaw

  if (correct) {
    correctAnswers.value++
    streak.value++
    bestStreak.value = Math.max(bestStreak.value, streak.value)

    // Calculate points
    const timeBonus = Math.round(timeLeft.value * 20)
    const streakBonus = Math.min(streak.value * 50, 250)
    score.value += 100 + timeBonus + streakBonus
  } else {
    wrongAnswers.value.push(question)
    streak.value = 0
    score.value = Math.max(0, score.value - 50)
  }

  lastCorrect.value = correct
  showFeedback.value = true

  // Next question or end
  setTimeout(() => {
    showFeedback.value = false
    currentQuestion.value++

    if (currentQuestion.value < totalQuestions) {
      startTimer()
    } else {
      endGame()
    }
  }, 2000)
}

const endGame = () => {
  gameState.value = 'results'
  if (timer) clearInterval(timer)
}

const saveScore = async () => {
  const playerName = prompt('Enter your name:') || 'Anonymous'
  leaderboard.addScore({
    gameId: 'quiz',
    playerName,
    score: score.value,
    metadata: {
      correctAnswers: correctAnswers.value,
      totalQuestions,
      bestStreak: bestStreak.value
    }
  })
}

const resetGame = () => {
  gameState.value = 'intro'
  if (timer) clearInterval(timer)
}

// Cleanup
onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>
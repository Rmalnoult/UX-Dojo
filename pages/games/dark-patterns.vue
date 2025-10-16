<template>
  <div class="min-h-screen bg-background p-4">
    <div class="container mx-auto max-w-5xl">
      <!-- Header -->
      <div class="mb-8 text-center">
        <NuxtLink to="/" class="inline-flex items-center text-muted-foreground hover:text-foreground mb-4">
          <ChevronLeft class="w-4 h-4 mr-1" />
          Back to Games
        </NuxtLink>
        <h1 class="text-3xl font-bold mb-2">Dark Pattern Detective</h1>
        <p class="text-muted-foreground">Spot manipulative design patterns</p>
      </div>

      <!-- Stats -->
      <div class="flex justify-center gap-4 mb-8">
        <ScoreBadge :score="score" />
        <UiBadge variant="outline">
          Pattern {{ currentPattern + 1 }} / {{ patterns.length }}
        </UiBadge>
        <UiBadge variant="secondary">
          Found: {{ foundPatterns }}/{{ patterns.length }}
        </UiBadge>
      </div>

      <!-- Game States -->
      <div v-if="gameState === 'intro'" class="max-w-2xl mx-auto">
        <UiCard class="p-8 text-center">
          <h2 class="text-2xl font-bold mb-4">How to Play</h2>
          <p class="mb-6">
            Dark patterns are manipulative design tactics that trick users into actions they didn't intend.
            Your job: identify the dark pattern type and suggest an ethical alternative!
          </p>

          <div class="grid md:grid-cols-2 gap-3 mb-6 text-left">
            <div class="p-3 bg-red-50 border border-red-200 rounded-lg">
              <h3 class="font-semibold text-sm">🎭 Confirmshaming</h3>
              <p class="text-xs text-muted-foreground">Guilt-tripping users</p>
            </div>
            <div class="p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <h3 class="font-semibold text-sm">💰 Hidden Costs</h3>
              <p class="text-xs text-muted-foreground">Surprise charges</p>
            </div>
            <div class="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h3 class="font-semibold text-sm">🪳 Roach Motel</h3>
              <p class="text-xs text-muted-foreground">Easy in, hard out</p>
            </div>
            <div class="p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <h3 class="font-semibold text-sm">🔄 Forced Continuity</h3>
              <p class="text-xs text-muted-foreground">Hard to cancel</p>
            </div>
            <div class="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 class="font-semibold text-sm">🎣 Bait & Switch</h3>
              <p class="text-xs text-muted-foreground">Misleading actions</p>
            </div>
            <div class="p-3 bg-green-50 border border-green-200 rounded-lg">
              <h3 class="font-semibold text-sm">🎭 Disguised Ads</h3>
              <p class="text-xs text-muted-foreground">Ads look like content</p>
            </div>
          </div>

          <UiButton @click="startGame" size="lg">Start Detecting</UiButton>
        </UiCard>
      </div>

      <!-- Playing -->
      <div v-else-if="gameState === 'playing'" class="space-y-6">
        <!-- Pattern Example -->
        <UiCard class="p-6">
          <div class="mb-4">
            <UiBadge variant="outline">{{ patterns[currentPattern].category }}</UiBadge>
          </div>

          <!-- UI Mockup -->
          <div class="border-2 border-dashed rounded-lg p-6 bg-white mb-4">
            <component :is="patterns[currentPattern].component" />
          </div>

          <div class="flex items-start gap-2 text-sm text-muted-foreground">
            <span>💡</span>
            <p>What's manipulative about this design? How would you fix it?</p>
          </div>
        </UiCard>

        <!-- Detection Interface -->
        <div class="grid md:grid-cols-2 gap-6">
          <!-- Pattern Selection -->
          <UiCard class="p-6">
            <h3 class="font-semibold mb-4">Identify the Dark Pattern</h3>
            <div class="space-y-2">
              <button
                v-for="type in patternTypes"
                :key="type.id"
                @click="selectPattern(type.id)"
                class="w-full p-3 text-left border-2 rounded-lg transition-all hover:border-primary"
                :class="{
                  'border-primary bg-primary/5': selectedPattern === type.id,
                  'border-muted': selectedPattern !== type.id
                }"
              >
                <div class="font-semibold text-sm">{{ type.emoji }} {{ type.name }}</div>
                <div class="text-xs text-muted-foreground">{{ type.description }}</div>
              </button>
            </div>
          </UiCard>

          <!-- Ethical Fix -->
          <UiCard class="p-6">
            <h3 class="font-semibold mb-4">Suggest Ethical Alternative</h3>
            <textarea
              v-model="ethicalFix"
              placeholder="How would you redesign this ethically?"
              class="w-full h-40 p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary"
            ></textarea>

            <div class="mt-4">
              <UiButton
                @click="submitAnswer"
                :disabled="!selectedPattern || !ethicalFix.trim()"
                class="w-full"
              >
                Submit Answer
              </UiButton>
            </div>
          </UiCard>
        </div>

        <!-- Feedback -->
        <div v-if="showFeedback" class="animate-bounce">
          <UiCard :class="lastCorrect ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'" class="p-6 border-2">
            <div class="space-y-3">
              <p class="text-lg font-bold" :class="lastCorrect ? 'text-green-700' : 'text-red-700'">
                {{ lastCorrect ? '✓ Correct!' : '✗ Wrong!' }}
              </p>
              <div>
                <p class="font-semibold mb-1">This is: {{ patterns[currentPattern - 1].type }}</p>
                <p class="text-sm">{{ patterns[currentPattern - 1].explanation }}</p>
              </div>
              <div class="bg-white p-3 rounded">
                <p class="font-semibold text-sm mb-1">Ethical Alternative:</p>
                <p class="text-sm text-muted-foreground">{{ patterns[currentPattern - 1].ethicalFix }}</p>
              </div>
            </div>
          </UiCard>
        </div>
      </div>

      <!-- Results -->
      <div v-else-if="gameState === 'results'" class="max-w-3xl mx-auto space-y-6">
        <UiCard class="p-8">
          <h2 class="text-2xl font-bold mb-6 text-center">Detection Complete!</h2>

          <div class="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 class="font-semibold mb-2">Your Performance</h3>
              <div class="space-y-2">
                <p>Final Score: <span class="font-bold text-primary">{{ score }}</span></p>
                <p>Patterns Identified: <span class="font-bold">{{ foundPatterns }}/{{ patterns.length }}</span></p>
                <p>Accuracy: <span class="font-bold">{{ Math.round((foundPatterns / patterns.length) * 100) }}%</span></p>
              </div>
            </div>
            <div>
              <h3 class="font-semibold mb-2">Ethical Design</h3>
              <p class="text-sm text-muted-foreground">
                Dark patterns erode trust and harm users. As designers and developers,
                we have a responsibility to create honest, user-respecting interfaces.
              </p>
            </div>
          </div>

          <!-- Patterns Breakdown -->
          <div class="mb-6">
            <h3 class="font-semibold mb-4">Dark Patterns You Found</h3>
            <div class="grid md:grid-cols-2 gap-3">
              <div v-for="pattern in foundPatternsList" :key="pattern" class="p-3 bg-green-50 border border-green-300 rounded-lg">
                <p class="text-sm font-semibold">✓ {{ pattern }}</p>
              </div>
            </div>
          </div>

          <div class="bg-yellow-50 border border-yellow-300 p-4 rounded-lg mb-6">
            <h3 class="font-semibold mb-2">🛡️ Design Ethically</h3>
            <ul class="text-sm space-y-1">
              <li>• Be transparent about costs and terms</li>
              <li>• Make cancellation as easy as signup</li>
              <li>• Use honest, respectful language</li>
              <li>• Clearly distinguish ads from content</li>
              <li>• Respect user autonomy and choices</li>
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
import { defineComponent, h } from 'vue'

// Mock UI patterns
const ConfirmshamingExample = defineComponent({
  render() {
    return h('div', { class: 'space-y-4 text-center' }, [
      h('h3', { class: 'font-bold' }, 'Get 50% Off!'),
      h('p', 'Subscribe to our newsletter for exclusive deals'),
      h('button', { class: 'px-6 py-3 bg-green-500 text-white rounded-lg font-semibold w-full' }, 'Yes! I want to save money'),
      h('button', { class: 'text-sm text-gray-500 underline mt-2' }, 'No, I prefer paying full price')
    ])
  }
})

const HiddenCostsExample = defineComponent({
  render() {
    return h('div', { class: 'space-y-4' }, [
      h('div', { class: 'flex justify-between' }, [
        h('span', 'Product'), h('span', '$29.99')
      ]),
      h('div', { class: 'flex justify-between' }, [
        h('span', 'Shipping'), h('span', '$4.99')
      ]),
      h('div', { class: 'flex justify-between font-bold text-lg border-t pt-2' }, [
        h('span', 'Total'), h('span', '$34.98')
      ]),
      h('button', { class: 'w-full px-4 py-2 bg-blue-500 text-white rounded' }, 'Continue to Payment'),
      h('p', { class: 'text-xs text-gray-400 mt-2' }, '*Plus $12 processing fee and tax added at final step')
    ])
  }
})

const RoachMotelExample = defineComponent({
  render() {
    return h('div', { class: 'space-y-4' }, [
      h('h3', { class: 'font-bold text-center' }, 'Cancel Subscription'),
      h('p', { class: 'text-sm text-center' }, 'To cancel, please call 1-800-HARD-TO-CANCEL'),
      h('p', { class: 'text-xs text-gray-500 text-center' }, 'Available Mon-Fri 9am-11am EST only'),
      h('button', { class: 'w-full px-4 py-2 bg-green-500 text-white rounded' }, 'Keep My Subscription!')
    ])
  }
})

const BaitSwitchExample = defineComponent({
  render() {
    return h('div', { class: 'space-y-4 text-center' }, [
      h('p', 'Would you like to enable location services?'),
      h('div', { class: 'flex gap-2' }, [
        h('button', { class: 'flex-1 px-4 py-3 bg-blue-500 text-white rounded font-semibold' }, 'OK'),
        h('button', { class: 'px-4 py-3 text-gray-400 text-sm' }, 'Later')
      ]),
      h('p', { class: 'text-xs text-gray-400' }, '"Later" will ask again in 5 minutes')
    ])
  }
})

interface Pattern {
  id: string
  type: string
  category: string
  component: any
  explanation: string
  ethicalFix: string
}

// Game state
const gameState = ref<'intro' | 'playing' | 'results'>('intro')
const currentPattern = ref(0)
const score = ref(0)
const selectedPattern = ref<string | null>(null)
const ethicalFix = ref('')
const showFeedback = ref(false)
const lastCorrect = ref(false)
const foundPatterns = ref(0)
const foundPatternsList = ref<string[]>([])

const leaderboard = useLeaderboard()

// Pattern types
const patternTypes = [
  { id: 'confirmshaming', name: 'Confirmshaming', emoji: '🎭', description: 'Guilt-tripping decline option' },
  { id: 'hidden-costs', name: 'Hidden Costs', emoji: '💰', description: 'Surprise fees at checkout' },
  { id: 'roach-motel', name: 'Roach Motel', emoji: '🪳', description: 'Easy to subscribe, hard to cancel' },
  { id: 'forced-continuity', name: 'Forced Continuity', emoji: '🔄', description: 'Charges without reminder' },
  { id: 'bait-switch', name: 'Bait & Switch', emoji: '🎣', description: 'Action does something else' },
  { id: 'disguised-ads', name: 'Disguised Ads', emoji: '🎭', description: 'Ads look like content' }
]

// Patterns
const patterns: Pattern[] = [
  {
    id: 'p1',
    type: 'Confirmshaming',
    category: 'Manipulative Language',
    component: ConfirmshamingExample,
    explanation: 'Uses guilt and shame to manipulate users into accepting. The decline option implies the user makes poor financial decisions.',
    ethicalFix: 'Use neutral language for both options: "Subscribe" and "No thanks" or "Maybe later"'
  },
  {
    id: 'p2',
    type: 'Hidden Costs',
    category: 'Pricing Deception',
    component: HiddenCostsExample,
    explanation: 'Hides the true cost until the final step, wasting user time and creating frustration.',
    ethicalFix: 'Show all costs upfront including processing fees, taxes, and shipping before checkout'
  },
  {
    id: 'p3',
    type: 'Roach Motel',
    category: 'Cancellation Barriers',
    component: RoachMotelExample,
    explanation: 'Makes cancellation deliberately difficult while keeping subscription easy. Phone-only cancellation with limited hours.',
    ethicalFix: 'Allow instant online cancellation with the same ease as signup'
  },
  {
    id: 'p4',
    type: 'Bait & Switch',
    category: 'Misleading Actions',
    component: BaitSwitchExample,
    explanation: 'The "Later" button doesn\'t actually defer the decision - it nags again in 5 minutes.',
    ethicalFix: 'Be honest: "Ask me later" should truly postpone, or offer "Never ask again"'
  }
]

// Methods
const startGame = () => {
  gameState.value = 'playing'
  currentPattern.value = 0
  score.value = 0
  foundPatterns.value = 0
  foundPatternsList.value = []
  showFeedback.value = false
}

const selectPattern = (type: string) => {
  selectedPattern.value = type
}

const submitAnswer = () => {
  const pattern = patterns[currentPattern.value]
  const correct = selectedPattern.value === pattern.type.toLowerCase().replace(/\s+/g, '-')

  if (correct) {
    foundPatterns.value++
    foundPatternsList.value.push(pattern.type)
    score.value += 200

    // Bonus for good ethical fix (simple length check)
    if (ethicalFix.value.length > 20) {
      score.value += 50
    }
  }

  lastCorrect.value = correct
  showFeedback.value = true

  setTimeout(() => {
    showFeedback.value = false
    if (currentPattern.value < patterns.length - 1) {
      currentPattern.value++
      selectedPattern.value = null
      ethicalFix.value = ''
    } else {
      endGame()
    }
  }, 4000)
}

const endGame = () => {
  gameState.value = 'results'
}

const saveScore = () => {
  const playerName = prompt('Enter your name:') || 'Anonymous'
  leaderboard.addScore({
    gameId: 'dark-patterns',
    playerName,
    score: score.value,
    metadata: {
      foundPatterns: foundPatterns.value,
      totalPatterns: patterns.length
    }
  })
}

const resetGame = () => {
  gameState.value = 'intro'
}
</script>
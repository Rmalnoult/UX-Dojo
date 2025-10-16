<template>
  <div class="min-h-screen bg-background p-4">
    <div class="container mx-auto max-w-6xl">
      <!-- Header -->
      <div class="mb-8 text-center">
        <NuxtLink to="/" class="inline-flex items-center text-muted-foreground hover:text-foreground mb-4">
          <ChevronLeft class="w-4 h-4 mr-1" />
          Back to Games
        </NuxtLink>
        <h1 class="text-3xl font-bold mb-2">Progressive Disclosure Race</h1>
        <p class="text-muted-foreground">All at once vs step-by-step</p>
      </div>

      <!-- Stats -->
      <div class="flex justify-center gap-4 mb-8">
        <UiBadge variant="outline">
          Scenario {{ currentScenario + 1 }} / {{ scenarios.length }}
        </UiBadge>
      </div>

      <!-- Game States -->
      <div v-if="gameState === 'intro'" class="max-w-2xl mx-auto">
        <UiCard class="p-8 text-center">
          <h2 class="text-2xl font-bold mb-4">How to Play</h2>
          <p class="mb-6">
            You'll complete the same task twice: once with all options visible (flat), and once with progressive disclosure (step-by-step).
            We'll measure which approach is faster and less error-prone.
          </p>
          <UiButton @click="startGame" size="lg">Start Game</UiButton>
        </UiCard>
      </div>

      <div v-else-if="gameState === 'playing'" class="space-y-6">
        <!-- Task Description -->
        <UiCard class="p-4">
          <h2 class="text-xl font-semibold mb-2">Your Task:</h2>
          <p class="text-lg">{{ scenarios[currentScenario].description }}</p>
          <div class="mt-2 flex flex-wrap gap-2">
            <UiBadge v-for="req in scenarios[currentScenario].requirements" :key="req">
              ✓ {{ req }}
            </UiBadge>
          </div>
        </UiCard>

        <!-- Interface Variant -->
        <div class="grid md:grid-cols-2 gap-6">
          <!-- Flat Version -->
          <UiCard class="p-6" :class="{ 'opacity-50': currentVariant !== 'flat' }">
            <h3 class="font-semibold mb-4">All Options (Flat)</h3>
            <div v-if="currentVariant === 'flat'" class="space-y-3">
              <label v-for="option in flatOptions" :key="option.id" class="flex items-center gap-2 cursor-pointer">
                <input
                  :type="option.type"
                  :name="option.group"
                  :id="option.id"
                  v-model="flatSelections[option.id]"
                  :value="true"
                  :true-value="true"
                  :false-value="false"
                  class="cursor-pointer"
                />
                <span>{{ option.label }}</span>
              </label>
              <UiButton @click="submitFlat" :disabled="!canSubmitFlat" class="w-full">
                Complete Task
              </UiButton>
            </div>
            <div v-else class="text-center text-muted-foreground">
              Time: {{ flatTime }}ms
            </div>
          </UiCard>

          <!-- Progressive Version -->
          <UiCard class="p-6" :class="{ 'opacity-50': currentVariant !== 'progressive' }">
            <h3 class="font-semibold mb-4">Step by Step (Progressive)</h3>
            <div v-if="currentVariant === 'progressive'" class="space-y-4">
              <!-- Progress indicator -->
              <div class="flex gap-1 mb-4">
                <div
                  v-for="(step, i) in progressiveSteps"
                  :key="i"
                  class="flex-1 h-2 rounded"
                  :class="i <= currentStep ? 'bg-primary' : 'bg-muted'"
                ></div>
              </div>

              <!-- Current step options -->
              <div class="space-y-3">
                <h4 class="font-medium">{{ progressiveSteps[currentStep].title }}</h4>
                <label v-for="option in progressiveSteps[currentStep].options" :key="option.id" class="flex items-center gap-2 cursor-pointer">
                  <input
                    :type="option.type"
                    :name="option.group"
                    :id="`prog-${option.id}`"
                    v-model="progressiveSelections[option.id]"
                    :value="true"
                    :true-value="true"
                    :false-value="false"
                    class="cursor-pointer"
                  />
                  <span>{{ option.label }}</span>
                </label>
              </div>

              <!-- Navigation -->
              <div class="flex gap-2">
                <UiButton v-if="currentStep > 0" @click="currentStep--" variant="outline">
                  Back
                </UiButton>
                <UiButton
                  v-if="currentStep < progressiveSteps.length - 1"
                  @click="currentStep++"
                  class="flex-1"
                >
                  Next
                </UiButton>
                <UiButton
                  v-else
                  @click="submitProgressive"
                  :disabled="!canSubmitProgressive"
                  class="flex-1"
                >
                  Complete Task
                </UiButton>
              </div>
            </div>
            <div v-else class="text-center text-muted-foreground">
              Time: {{ progressiveTime }}ms
            </div>
          </UiCard>
        </div>
      </div>

      <div v-else-if="gameState === 'results'" class="max-w-4xl mx-auto space-y-6">
        <UiCard class="p-8">
          <h2 class="text-2xl font-bold mb-6 text-center">Results</h2>

          <!-- Comparison Chart -->
          <div class="mb-6">
            <h3 class="font-semibold mb-4">Time Comparison</h3>
            <div class="space-y-4">
              <div v-for="result in results" :key="result.scenario">
                <p class="text-sm text-muted-foreground mb-2">{{ result.scenario }}</p>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <div class="flex items-center justify-between mb-1">
                      <span class="text-sm">Flat</span>
                      <span class="text-sm font-bold">{{ result.flatTime }}ms</span>
                    </div>
                    <UiProgress :value="(result.flatTime / Math.max(result.flatTime, result.progressiveTime)) * 100" />
                  </div>
                  <div>
                    <div class="flex items-center justify-between mb-1">
                      <span class="text-sm">Progressive</span>
                      <span class="text-sm font-bold">{{ result.progressiveTime }}ms</span>
                    </div>
                    <UiProgress :value="(result.progressiveTime / Math.max(result.flatTime, result.progressiveTime)) * 100" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="text-center">
            <p class="text-lg mb-4">
              <span class="font-semibold">Winner:</span>
              <span class="text-primary ml-2">
                {{ averageFlatTime < averageProgressiveTime ? 'Flat Interface' : 'Progressive Disclosure' }}
              </span>
              was {{ Math.abs(averageFlatTime - averageProgressiveTime) }}ms faster on average
            </p>
            <p class="text-sm text-muted-foreground">
              Progressive disclosure typically wins for complex tasks, while flat interfaces work better for simple choices.
            </p>
          </div>

          <div class="flex gap-4 justify-center">
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

// Scenarios
const scenarios = [
  {
    id: 'export',
    description: 'Export a presentation as PDF',
    requirements: ['A4 size', 'Landscape orientation', 'High quality', 'Include speaker notes'],
    flatOptions: [
      { id: 'format-pdf', label: 'PDF', type: 'radio', group: 'format' },
      { id: 'format-ppt', label: 'PowerPoint', type: 'radio', group: 'format' },
      { id: 'format-jpg', label: 'Images', type: 'radio', group: 'format' },
      { id: 'size-a4', label: 'A4', type: 'radio', group: 'size' },
      { id: 'size-letter', label: 'Letter', type: 'radio', group: 'size' },
      { id: 'size-a3', label: 'A3', type: 'radio', group: 'size' },
      { id: 'orient-portrait', label: 'Portrait', type: 'radio', group: 'orientation' },
      { id: 'orient-landscape', label: 'Landscape', type: 'radio', group: 'orientation' },
      { id: 'quality-low', label: 'Low Quality', type: 'radio', group: 'quality' },
      { id: 'quality-medium', label: 'Medium Quality', type: 'radio', group: 'quality' },
      { id: 'quality-high', label: 'High Quality', type: 'radio', group: 'quality' },
      { id: 'notes', label: 'Include Speaker Notes', type: 'checkbox', group: 'extras' },
      { id: 'comments', label: 'Include Comments', type: 'checkbox', group: 'extras' },
      { id: 'animations', label: 'Include Animations', type: 'checkbox', group: 'extras' },
    ],
    progressiveSteps: [
      {
        title: 'Choose Format',
        options: [
          { id: 'format-pdf', label: 'PDF', type: 'radio', group: 'format' },
          { id: 'format-ppt', label: 'PowerPoint', type: 'radio', group: 'format' },
          { id: 'format-jpg', label: 'Images', type: 'radio', group: 'format' },
        ]
      },
      {
        title: 'Page Setup',
        options: [
          { id: 'size-a4', label: 'A4', type: 'radio', group: 'size' },
          { id: 'size-letter', label: 'Letter', type: 'radio', group: 'size' },
          { id: 'orient-portrait', label: 'Portrait', type: 'radio', group: 'orientation' },
          { id: 'orient-landscape', label: 'Landscape', type: 'radio', group: 'orientation' },
        ]
      },
      {
        title: 'Quality & Extras',
        options: [
          { id: 'quality-low', label: 'Low Quality', type: 'radio', group: 'quality' },
          { id: 'quality-medium', label: 'Medium Quality', type: 'radio', group: 'quality' },
          { id: 'quality-high', label: 'High Quality', type: 'radio', group: 'quality' },
          { id: 'notes', label: 'Include Speaker Notes', type: 'checkbox', group: 'extras' },
        ]
      }
    ],
    correct: {
      'format-pdf': true,
      'size-a4': true,
      'orient-landscape': true,
      'quality-high': true,
      'notes': true
    }
  }
]

// State
const gameState = ref<'intro' | 'playing' | 'results'>('intro')
const currentScenario = ref(0)
const currentVariant = ref<'flat' | 'progressive'>('flat')
const flatSelections = ref<Record<string, boolean>>({})
const progressiveSelections = ref<Record<string, boolean>>({})
const currentStep = ref(0)
const flatStartTime = ref(0)
const flatTime = ref(0)
const progressiveStartTime = ref(0)
const progressiveTime = ref(0)
const results = ref<Array<{ scenario: string; flatTime: number; progressiveTime: number }>>([])

// Computed
const flatOptions = computed(() => scenarios[currentScenario.value].flatOptions || [])
const progressiveSteps = computed(() => scenarios[currentScenario.value].progressiveSteps || [])

const canSubmitFlat = computed(() => {
  const scenario = scenarios[currentScenario.value]
  return Object.keys(scenario.correct).every(key =>
    flatSelections.value[key] === scenario.correct[key as keyof typeof scenario.correct]
  )
})

const canSubmitProgressive = computed(() => {
  const scenario = scenarios[currentScenario.value]
  return Object.keys(scenario.correct).every(key =>
    progressiveSelections.value[key] === scenario.correct[key as keyof typeof scenario.correct]
  )
})

const averageFlatTime = computed(() => {
  if (results.value.length === 0) return 0
  return Math.round(results.value.reduce((sum, r) => sum + r.flatTime, 0) / results.value.length)
})

const averageProgressiveTime = computed(() => {
  if (results.value.length === 0) return 0
  return Math.round(results.value.reduce((sum, r) => sum + r.progressiveTime, 0) / results.value.length)
})

// Methods
const startGame = () => {
  gameState.value = 'playing'
  currentScenario.value = 0
  results.value = []
  startScenario()
}

const startScenario = () => {
  currentVariant.value = 'flat'
  flatSelections.value = {}
  progressiveSelections.value = {}
  currentStep.value = 0
  flatStartTime.value = Date.now()
}

const submitFlat = () => {
  flatTime.value = Date.now() - flatStartTime.value
  currentVariant.value = 'progressive'
  progressiveStartTime.value = Date.now()
}

const submitProgressive = () => {
  progressiveTime.value = Date.now() - progressiveStartTime.value

  results.value.push({
    scenario: scenarios[currentScenario.value].description,
    flatTime: flatTime.value,
    progressiveTime: progressiveTime.value
  })

  if (currentScenario.value < scenarios.length - 1) {
    currentScenario.value++
    startScenario()
  } else {
    gameState.value = 'results'
  }
}

const resetGame = () => {
  gameState.value = 'intro'
  currentScenario.value = 0
  results.value = []
}
</script>
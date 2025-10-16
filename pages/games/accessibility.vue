<template>
  <div class="min-h-screen bg-background p-4">
    <div class="container mx-auto max-w-6xl">
      <!-- Header -->
      <div class="mb-8 text-center">
        <NuxtLink to="/" class="inline-flex items-center text-muted-foreground hover:text-foreground mb-4">
          <ChevronLeft class="w-4 h-4 mr-1" />
          Back to Games
        </NuxtLink>
        <h1 class="text-3xl font-bold mb-2">Accessibility Audit Challenge</h1>
        <p class="text-muted-foreground">Find and fix WCAG accessibility issues</p>
      </div>

      <!-- Stats -->
      <div class="flex justify-center gap-4 mb-8">
        <ScoreBadge :score="score" />
        <TimerBadge :time="timer.time.value" />
        <UiBadge variant="outline">
          Scenario {{ currentScenario + 1 }} / {{ scenarios.length }}
        </UiBadge>
      </div>

      <!-- Game States -->
      <div v-if="gameState === 'intro'" class="max-w-2xl mx-auto">
        <UiCard class="p-8 text-center">
          <h2 class="text-2xl font-bold mb-4">How to Play</h2>
          <p class="mb-6">
            Review UI mockups and identify accessibility issues. Check for color contrast, keyboard navigation,
            ARIA labels, focus indicators, and more. Each scenario has multiple issues to find!
          </p>

          <div class="grid md:grid-cols-2 gap-4 mb-6 text-left">
            <div class="p-3 bg-red-50 border border-red-200 rounded-lg">
              <h3 class="font-semibold text-red-700 mb-1">🔴 Critical</h3>
              <p class="text-sm">Blocks access entirely</p>
            </div>
            <div class="p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <h3 class="font-semibold text-orange-700 mb-1">🟠 Serious</h3>
              <p class="text-sm">Major difficulty</p>
            </div>
            <div class="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h3 class="font-semibold text-yellow-700 mb-1">🟡 Moderate</h3>
              <p class="text-sm">Some difficulty</p>
            </div>
            <div class="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 class="font-semibold text-blue-700 mb-1">🔵 Minor</h3>
              <p class="text-sm">Small improvement</p>
            </div>
          </div>

          <UiButton @click="startGame" size="lg">Start Audit</UiButton>
        </UiCard>
      </div>

      <!-- Playing -->
      <div v-else-if="gameState === 'playing'" class="space-y-6">
        <!-- Scenario Description -->
        <UiCard class="p-4">
          <h2 class="text-xl font-semibold mb-2">{{ scenarios[currentScenario].title }}</h2>
          <p class="text-muted-foreground">{{ scenarios[currentScenario].description }}</p>
        </UiCard>

        <!-- UI Mockup & Issue List -->
        <div class="grid lg:grid-cols-2 gap-6">
          <!-- Mockup Preview -->
          <UiCard class="p-6">
            <h3 class="font-semibold mb-4">UI Preview</h3>
            <div class="border-2 border-dashed border-muted rounded-lg p-4 bg-white">
              <component :is="scenarios[currentScenario].component" />
            </div>
          </UiCard>

          <!-- Issues Checklist -->
          <UiCard class="p-6">
            <h3 class="font-semibold mb-4">Find the Issues ({{ foundIssues.length }}/{{ scenarios[currentScenario].issues.length }})</h3>
            <div class="space-y-2 max-h-[500px] overflow-y-auto">
              <div
                v-for="issue in scenarios[currentScenario].issues"
                :key="issue.id"
                @click="toggleIssue(issue)"
                class="p-3 border rounded-lg cursor-pointer transition-all"
                :class="{
                  'bg-green-50 border-green-300': foundIssues.includes(issue.id),
                  'hover:bg-muted': !foundIssues.includes(issue.id)
                }"
              >
                <div class="flex items-start gap-2">
                  <div class="mt-1">
                    <input
                      type="checkbox"
                      :checked="foundIssues.includes(issue.id)"
                      @click.stop
                      class="cursor-pointer"
                    />
                  </div>
                  <div class="flex-1">
                    <div class="flex items-center gap-2 mb-1">
                      <span class="text-lg">{{ getSeverityEmoji(issue.severity) }}</span>
                      <span class="text-sm font-semibold">{{ issue.category }}</span>
                      <UiBadge variant="outline" class="text-xs">{{ issue.severity }}</UiBadge>
                    </div>
                    <p class="text-sm">{{ issue.description }}</p>
                    <div v-if="foundIssues.includes(issue.id)" class="mt-2 text-xs text-green-700 bg-green-50 p-2 rounded">
                      ✓ Fix: {{ issue.fix }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="mt-6 flex gap-2">
              <UiButton @click="submitAudit" :disabled="foundIssues.length === 0">
                Submit Audit
              </UiButton>
              <UiButton @click="showHint" variant="outline">
                Hint (-100pts)
              </UiButton>
            </div>
          </UiCard>
        </div>
      </div>

      <!-- Results -->
      <div v-else-if="gameState === 'results'" class="max-w-4xl mx-auto space-y-6">
        <UiCard class="p-8">
          <h2 class="text-2xl font-bold mb-6 text-center">Audit Complete!</h2>

          <div class="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 class="font-semibold mb-2">Your Performance</h3>
              <div class="space-y-2">
                <p>Final Score: <span class="font-bold text-primary">{{ score }}</span></p>
                <p>Total Time: <span class="font-bold">{{ timer.time.value }}s</span></p>
                <p>Issues Found: <span class="font-bold">{{ totalIssuesFound }}/{{ totalIssues }}</span></p>
                <p>Accuracy: <span class="font-bold">{{ accuracy }}%</span></p>
              </div>
            </div>
            <div>
              <h3 class="font-semibold mb-2">Accessibility Matters</h3>
              <p class="text-sm text-muted-foreground">
                15% of people have disabilities. Making your designs accessible isn't just good practice—it's essential for inclusion.
              </p>
            </div>
          </div>

          <!-- Issues by Severity -->
          <div class="mb-6">
            <h3 class="font-semibold mb-4">Issues Found by Severity</h3>
            <div class="space-y-2">
              <div v-for="(count, severity) in issuesBySeverity" :key="severity" class="flex items-center gap-4">
                <span class="w-24 text-sm">{{ severity }}:</span>
                <div class="flex-1 bg-muted rounded-full h-6 relative">
                  <div
                    class="absolute inset-y-0 left-0 rounded-full"
                    :class="getSeverityColor(severity)"
                    :style="{ width: `${(count.found / count.total) * 100}%` }"
                  ></div>
                </div>
                <span class="text-sm">{{ count.found }}/{{ count.total }}</span>
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
import { defineComponent, h } from 'vue'

interface Issue {
  id: string
  category: string
  description: string
  severity: 'critical' | 'serious' | 'moderate' | 'minor'
  fix: string
}

interface Scenario {
  title: string
  description: string
  component: any
  issues: Issue[]
}

// Mock UI Components for scenarios
const LoginForm = defineComponent({
  render() {
    return h('div', { class: 'space-y-4' }, [
      h('h2', { class: 'text-xl font-bold', style: { color: '#cccccc' } }, 'Login'),
      h('div', [
        h('input', {
          type: 'text',
          placeholder: 'Username',
          class: 'w-full p-2 border rounded',
          style: { outline: 'none' }
        })
      ]),
      h('div', [
        h('input', {
          type: 'password',
          placeholder: 'Password',
          class: 'w-full p-2 border rounded'
        })
      ]),
      h('button', {
        class: 'px-4 py-2 rounded text-sm',
        style: { backgroundColor: '#ffcc00', color: '#ffffff' }
      }, 'Login'),
      h('a', { href: '#', class: 'text-blue-500 underline text-sm' }, 'click here')
    ])
  }
})

const ImageGallery = defineComponent({
  render() {
    return h('div', { class: 'grid grid-cols-2 gap-2' }, [
      h('img', { src: 'https://placehold.co/150x100/e2e8f0/64748b?text=Image', class: 'w-full rounded' }),
      h('img', { src: 'https://placehold.co/150x100/e2e8f0/64748b?text=Image', class: 'w-full rounded' }),
      h('img', { src: 'https://placehold.co/150x100/e2e8f0/64748b?text=Image', class: 'w-full rounded' }),
      h('img', { src: 'https://placehold.co/150x100/e2e8f0/64748b?text=Image', class: 'w-full rounded' })
    ])
  }
})

// Game state
const gameState = ref<'intro' | 'playing' | 'results'>('intro')
const currentScenario = ref(0)
const score = ref(0)
const foundIssues = ref<string[]>([])
const totalIssuesFound = ref(0)
const issuesBySeverity = ref<Record<string, { found: number; total: number }>>({})

const timer = useGameTimer()
const leaderboard = useLeaderboard()

// Scenarios
const scenarios: Scenario[] = [
  {
    title: 'Login Form Audit',
    description: 'Review this login form for accessibility issues',
    component: LoginForm,
    issues: [
      {
        id: 'contrast-heading',
        category: 'Color Contrast',
        description: 'Heading text has poor contrast (#cccccc on white)',
        severity: 'serious',
        fix: 'Use darker text color (min 4.5:1 ratio)'
      },
      {
        id: 'no-labels',
        category: 'Form Labels',
        description: 'Input fields have no associated labels',
        severity: 'critical',
        fix: 'Add <label> elements or aria-label attributes'
      },
      {
        id: 'no-focus',
        category: 'Focus Indicators',
        description: 'Username input has outline:none removing focus indicator',
        severity: 'critical',
        fix: 'Remove outline:none or provide alternative focus style'
      },
      {
        id: 'button-contrast',
        category: 'Color Contrast',
        description: 'Button has poor contrast (#ffcc00 bg with #ffffff text)',
        severity: 'moderate',
        fix: 'Increase contrast or use darker text'
      },
      {
        id: 'link-context',
        category: 'Link Text',
        description: '"click here" is not descriptive link text',
        severity: 'moderate',
        fix: 'Use descriptive text like "Reset your password"'
      }
    ]
  },
  {
    title: 'Image Gallery Audit',
    description: 'Check this image gallery for accessibility',
    component: ImageGallery,
    issues: [
      {
        id: 'no-alt',
        category: 'Alt Text',
        description: 'Images missing alt attributes',
        severity: 'critical',
        fix: 'Add descriptive alt text to all images'
      },
      {
        id: 'keyboard-nav',
        category: 'Keyboard Navigation',
        description: 'No keyboard navigation between images',
        severity: 'serious',
        fix: 'Make images focusable with tabindex or use buttons'
      },
      {
        id: 'aria-role',
        category: 'ARIA',
        description: 'Gallery missing role="region" and aria-label',
        severity: 'moderate',
        fix: 'Add semantic structure with ARIA landmarks'
      }
    ]
  }
]

// Computed
const totalIssues = computed(() => {
  return scenarios.reduce((sum, s) => sum + s.issues.length, 0)
})

const accuracy = computed(() => {
  if (totalIssues.value === 0) return 100
  return Math.round((totalIssuesFound.value / totalIssues.value) * 100)
})

// Methods
const startGame = () => {
  gameState.value = 'playing'
  currentScenario.value = 0
  score.value = 0
  foundIssues.value = []
  totalIssuesFound.value = 0
  timer.reset()
  timer.start()
}

const toggleIssue = (issue: Issue) => {
  const index = foundIssues.value.indexOf(issue.id)
  if (index > -1) {
    foundIssues.value.splice(index, 1)
  } else {
    foundIssues.value.push(issue.id)

    // Award points based on severity
    const points = {
      critical: 200,
      serious: 150,
      moderate: 100,
      minor: 50
    }
    score.value += points[issue.severity]
  }
}

const getSeverityEmoji = (severity: string) => {
  const emojis: Record<string, string> = {
    critical: '🔴',
    serious: '🟠',
    moderate: '🟡',
    minor: '🔵'
  }
  return emojis[severity] || '⚪'
}

const getSeverityColor = (severity: string) => {
  const colors: Record<string, string> = {
    critical: 'bg-red-500',
    serious: 'bg-orange-500',
    moderate: 'bg-yellow-500',
    minor: 'bg-blue-500'
  }
  return colors[severity] || 'bg-gray-500'
}

const showHint = () => {
  score.value = Math.max(0, score.value - 100)
  // Find first unfound issue and reveal it
  const scenario = scenarios[currentScenario.value]
  const unfound = scenario.issues.find(i => !foundIssues.value.includes(i.id))
  if (unfound) {
    alert(`Hint: Look for ${unfound.category} issue - ${unfound.description}`)
  }
}

const submitAudit = () => {
  const scenario = scenarios[currentScenario.value]
  const correctCount = foundIssues.value.filter(id =>
    scenario.issues.some(i => i.id === id)
  ).length

  totalIssuesFound.value += correctCount

  if (currentScenario.value < scenarios.length - 1) {
    currentScenario.value++
    foundIssues.value = []
  } else {
    endGame()
  }
}

const endGame = () => {
  timer.stop()
  gameState.value = 'results'

  // Calculate issues by severity
  const bySeverity: Record<string, { found: number; total: number }> = {
    critical: { found: 0, total: 0 },
    serious: { found: 0, total: 0 },
    moderate: { found: 0, total: 0 },
    minor: { found: 0, total: 0 }
  }

  scenarios.forEach(scenario => {
    scenario.issues.forEach(issue => {
      bySeverity[issue.severity].total++
      if (foundIssues.value.includes(issue.id)) {
        bySeverity[issue.severity].found++
      }
    })
  })

  issuesBySeverity.value = bySeverity
}

const saveScore = () => {
  const playerName = prompt('Enter your name:') || 'Anonymous'
  leaderboard.addScore({
    gameId: 'accessibility',
    playerName,
    score: score.value,
    metadata: {
      time: timer.time.value,
      issuesFound: totalIssuesFound.value,
      totalIssues: totalIssues.value,
      accuracy: accuracy.value
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
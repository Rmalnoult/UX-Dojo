# UX Dojo 🥋🎮

A playful website hosting **mini-games that teach the Laws of UX**.
Students (design/graphic profiles) can learn and practice UI/UX principles through short challenges with scoring, leaderboards, and visual feedback.

---

## 🎯 Goal

UX Dojo is an educational playground where each game demonstrates one or more **Laws of UX** in action:
- Hick’s Law (choice overload)
- Fitts’s Law (size & distance)
- Miller’s Law (7±2 memory)
- Serial Position Effect (primacy/recency)
- Progressive Disclosure (step-by-step)
- UX Laws Quiz (myth vs truth)

Each game is **short (3–5 minutes)**, provides **scoring and analytics**, and ends with a **mini-debrief** showing why the law matters in real interfaces.

---

## 🛠️ Tech stack

- **Framework**: Vite + Vue 3 + TypeScript
- **Package manager**: PNPM
- **State**: simple local state + localStorage persistence
- **UI**: TailwindCSS (or lightweight CSS modules)
- **Charts**: Recharts or Chart.js for performance graphs
- **Accessibility**:
  - Keyboard navigation (Tab/Enter/Space)
  - Visible focus states
  - ARIA roles (`button`, `listbox`, `status`, `progressbar`)
  - Prefers-reduced-motion respected
  - Minimum target size 44×44 px (except in Fitts game where challenge requires smaller)

---

## 📂 File structure
ux-dojo/
src/
components/        # Shared UI
GameCard.vue
TimerBadge.vue
ScoreBadge.vue
Leaderboard.vue
games/
hick/            # Hick’s Law Challenge
HickGame.vue
fitts/           # Fitts’s Law Reflex Test
FittsGame.vue
miller/          # Miller’s Law Memory Sprint
MillerGame.vue
serial/          # Serial Position Recall
SerialGame.vue
progressive/     # Progressive Disclosure Race
ProgressiveGame.vue
quiz/            # Law or Not Quiz
QuizGame.vue
App.vue            # Main navigation
main.ts
public/
README.md
package.json
pnpm-lock.yaml


---

## 🖥️ Shared UI Guidelines

- **Palette**:
  - Background: `#F7F7F8`
  - Text: `#1C1C1E`
  - Primary: `#4F46E5`
  - Success: `#16A34A`
  - Danger: `#DC2626`

- **Typography**: large bold headers, clear sans-serif body text, consistent text scales.

- **Layout**:
  - Max width: 960px
  - Grid 12 columns, `gap` 16–24px
  - Center content, responsive mobile-first

- **Components**:
  - `GameCard`: shadowed rounded container with icon + label
  - `TimerBadge`: pill with countdown
  - `ScoreBadge`: current score
  - `ProgressDots`: level progression

---

## 🕹️ Games

### 1. Hick’s Law Challenge
- **Objective**: Show that more options → slower decisions.
- **Mechanic**:
  - Each level displays a menu with 3 → 6 → 9 → 12 → 16 options.
  - Instruction: “Click **Settings**” (target changes each round).
- **Scoring**:
  - Reaction time: `max(0, 1000 - t_ms)`
  - Wrong click: –50 points
  - No error bonus per level: +200
- **UI**: responsive grid of option tiles (icon + label).
- **Data**: JSON list of options (`label`, `icon`).

---

### 2. Fitts’s Law Reflex Test
- **Objective**: Target size + distance affect pointing speed.
- **Mechanic**:
  - 20 random targets appear in sequence.
  - Sizes: 140, 96, 64, 44 px.
  - Distances vary (short, medium, long).
- **Scoring**:
  - Reaction time per target.
  - Missed click: +150 ms penalty.
  - Final score = `20000 - Σ times`.
- **UI**: large play area with clickable circles.
- **Analytics**: export per-target performance.

---

### 3. Miller’s Law Memory Sprint
- **Objective**: Demonstrate short-term memory limits (7±2).
- **Mechanic**:
  - Show sequence of N icons (5 → 7 → 9 → 11).
  - Hide, then ask player to reorder via drag-and-drop.
- **Scoring**:
  - +100 per correct item in right position.
  - Perfect sequence = +200 bonus.
  - Optional hint: –100.
- **UI**: sequence strip (phase 1), DnD slots (phase 2).
- **Data**: ~20 reusable icons/emojis.

---

### 4. Serial Position Recall
- **Objective**: Primacy & recency effect.
- **Mechanic**:
  - Display 10 words one by one (2000 → 1000 → 500 ms).
  - Ask player to recall as many as possible (tag input).
- **Scoring**:
  - +100 per correct word (any order).
  - +25 if both positions 1–2 recalled.
  - +25 if both positions 9–10 recalled.
- **UI**: carousel for display, tag entry for recall.
- **Results**: bar chart by position.

---

### 5. Progressive Disclosure Race
- **Objective**: Compare “all options visible” vs “progressive reveal”.
- **Mechanic**:
  - Scenario (e.g., “Export PNG, 1024px, transparent, medium compression”).
  - Do it in Variant A (flat panel) and Variant B (progressive panel).
- **Scoring**:
  - Time to complete.
  - Errors (touching irrelevant fields) = +500 ms penalty.
- **UI**: side-by-side or sequential tasks.
- **Results**: bar chart comparing A vs B.

---

### 6. Law or Not? (Fast Quiz)
- **Objective**: Recognize UX laws vs myths.
- **Mechanic**:
  - 20 quick statements.
  - 5s per question. Answer “UX Law” / “Not a Law”.
- **Scoring**:
  - +100 correct, –50 wrong.
  - Combo streak: +50 × streak (max 5).
- **UI**: large statement card, progress ring timer, 2 big buttons.
- **Data**: bank of true/false statements.

---

## 📊 Leaderboards & Stats (optional)

- Store `{gameId, playerName, score, date}` in localStorage.
- Show top 10, average, distribution histogram.
- Modal to enter name at end of game.
- Accessible (focus trap, keyboard friendly).

---

## 🚀 Development setup

```bash
pnpm create vite ux-dojo --template vue
cd ux-dojo
pnpm install
pnpm dev


Each game lives in src/games/ and is registered in App.vue with routing or conditional rendering.

⸻

🧑‍🏫 Classroom usage
	•	Each game lasts ~5–7 minutes.
	•	After play, display results screen (graphs, averages).
	•	Debrief with students:
	•	What made it harder/easier?
	•	How does this connect to real UI?

⸻

✅ LLM Development Instructions

When giving a task to an LLM (Claude, GPT, etc.), provide:
	1.	The name of the game (e.g. “HickGame.vue”).
	2.	The mechanics & scoring rules (from sections above).
	3.	The UI guidelines (shared above).
	4.	Any data format (JSON, icons, words list).
	5.	Expected test cases (e.g. perfect sequence = X points).

⸻

📚 License

MIT — free to use in teaching & workshops.


Instructions: use playwright mcp to test the games and make sure they work perfectly. you should be able to bet $1000 it works fine. use playwright mcp to run the site, test it exhaustively and iterate as many times as needed it if doesnt work.

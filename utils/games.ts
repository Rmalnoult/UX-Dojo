export interface GameLaw {
  formulatedBy: string
  paragraphs: string[]
}

export interface Game {
  id: string
  title: string
  description: string
  icon: string
  link: string
  duration: string
  seoTitle: string
  seoDescription: string
  law: GameLaw
  relatedIds: string[]
}

export const games: Game[] = [
  {
    id: 'hick',
    title: "Hick's Law Challenge",
    description: 'More choices = slower decisions. Test how menu complexity affects your speed.',
    icon: '🎯',
    link: '/games/hick',
    duration: '3-5 min',
    seoTitle: "Hick's Law Game: Test How Choice Overload Slows You Down",
    seoDescription: "Play an interactive Hick's Law game and see how adding more menu options slows down real decision-making, then learn why simpler UI choices win.",
    law: {
      formulatedBy: 'William Edmund Hick and Ray Hyman, 1952',
      paragraphs: [
        "Hick's Law states that the time it takes someone to make a decision grows logarithmically with the number and complexity of the choices in front of them. Double the options and decision time doesn't double, it creeps up, but it still creeps up.",
        'It is named after psychologists William Edmund Hick and Ray Hyman, who measured reaction times against the number of stimuli in a series of experiments published in 1952.',
        "In product design, this is why a search bar with a single input usually beats a forty-item navigation menu, and why breaking a long form into fewer, well-organized steps reduces drop-off.",
      ],
    },
    relatedIds: ['miller', 'progressive', 'quiz'],
  },
  {
    id: 'fitts',
    title: "Fitts's Law Reflex",
    description: 'Size and distance matter! Click targets and discover the science of pointing.',
    icon: '🎪',
    link: '/games/fitts',
    duration: '3 min',
    seoTitle: "Fitts's Law Game: Target Size and Distance Reflex Test",
    seoDescription: "An interactive Fitts's Law game testing how target size and distance affect click speed and accuracy, then explains why bigger, closer buttons feel faster.",
    law: {
      formulatedBy: 'Paul Fitts, 1954',
      paragraphs: [
        "Fitts's Law predicts that the time needed to move a pointer to a target depends on two things: how far away the target is and how big it is. Closer, bigger targets get hit faster and with fewer errors.",
        'Psychologist Paul Fitts introduced the model in 1954 while studying human motor control, and it has since become one of the most reliable predictive models in interface design.',
        "It's why the macOS menu bar sits at the very top edge of the screen, which behaves like an infinitely tall target, and why mobile apps use large, thumb-friendly tap targets instead of tiny icons.",
      ],
    },
    relatedIds: ['gestalt', 'serial', 'contrast'],
  },
  {
    id: 'miller',
    title: "Miller's Law Memory",
    description: 'Can you remember 7±2 items? Test your short-term memory limits.',
    icon: '🧠',
    link: '/games/miller',
    duration: '4 min',
    seoTitle: "Miller's Law Memory Game: How Many Items Can You Really Hold?",
    seoDescription: "Test your short-term memory against Miller's Law (7 plus or minus 2 items) in this interactive game, then learn why good UI chunks information.",
    law: {
      formulatedBy: 'George A. Miller, 1956',
      paragraphs: [
        'Miller\'s Law holds that the average person can only hold about seven items, plus or minus two, in short-term working memory at once.',
        "Psychologist George A. Miller described the limit in his influential 1956 paper 'The Magical Number Seven, Plus or Minus Two.'",
        'Designers apply it by chunking phone numbers into groups, limiting primary navigation to five to seven items, and breaking dense dashboards into digestible sections instead of one long list.',
      ],
    },
    relatedIds: ['hick', 'serial', 'progressive'],
  },
  {
    id: 'serial',
    title: 'Serial Position Recall',
    description: 'First and last stick best. Experience the primacy and recency effects.',
    icon: '📝',
    link: '/games/serial',
    duration: '3 min',
    seoTitle: 'Serial Position Effect Game: Why First and Last Items Stick',
    seoDescription: 'Play a memory game that demonstrates the serial position effect: why you remember the first and last items in a list far better than the middle ones.',
    law: {
      formulatedBy: 'Hermann Ebbinghaus, 19th century',
      paragraphs: [
        'The serial position effect describes how people recall the first items in a sequence (primacy) and the last items (recency) far better than anything in the middle.',
        'It was first documented by psychologist Hermann Ebbinghaus in his 19th-century memory experiments and remains a cornerstone of cognitive psychology.',
        'In interfaces, it is why the most important navigation links go at the start or end of a menu, and why onboarding flows put the single most critical action as the first or last step, not buried in the middle.',
      ],
    },
    relatedIds: ['miller', 'gestalt', 'hick'],
  },
  {
    id: 'progressive',
    title: 'Progressive Disclosure Race',
    description: 'All at once vs step-by-step. Which interface is faster?',
    icon: '🔄',
    link: '/games/progressive',
    duration: '5 min',
    seoTitle: 'Progressive Disclosure Game: All-at-Once vs Step-by-Step Speed Test',
    seoDescription: 'Race two interfaces, one showing everything at once and one revealing options step by step, to see why progressive disclosure speeds up real tasks.',
    law: {
      formulatedBy: 'Popularized by Jakob Nielsen, building on Jef Raskin',
      paragraphs: [
        'Progressive disclosure means showing users only the options they need right now, and deferring secondary or advanced features to a later screen or an expandable section.',
        'The technique was popularized in interface design by usability researcher Jakob Nielsen, building on ideas from computer scientist Jef Raskin about staged information reveal.',
        "A classic example is a settings page that shows the basics up front with an 'Advanced' toggle for power users, keeping the interface approachable without removing capability.",
      ],
    },
    relatedIds: ['hick', 'miller', 'quiz'],
  },
  {
    id: 'quiz',
    title: 'Law or Not?',
    description: 'UX truth or myth? Test your knowledge in this rapid-fire quiz.',
    icon: '❓',
    link: '/games/quiz',
    duration: '3 min',
    seoTitle: 'UX Laws Quiz: Real Law or Design Myth?',
    seoDescription: 'A rapid-fire quiz that separates real, research-backed Laws of UX from popular design myths. Test how well you can tell UX science from folklore.',
    law: {
      formulatedBy: 'Compiled from the Laws of UX',
      paragraphs: [
        'The Laws of UX are a set of well-tested psychological principles, from Hick\'s Law to the serial position effect, that explain how people perceive, learn and make decisions when they use an interface.',
        "Not every popular design 'rule' is backed by research, though. Ideas like the 3-click rule or strict adherence to the golden ratio are often repeated in design folklore without solid evidence behind them.",
        'This quiz mixes real, research-backed laws with common myths so you can build an instinct for which design advice is worth following and which is just tradition dressed up as science.',
      ],
    },
    relatedIds: ['hick', 'dark-patterns', 'gestalt'],
  },
  {
    id: 'gestalt',
    title: 'Gestalt Principles Puzzle',
    description: 'Group elements using proximity, similarity, closure, and continuity.',
    icon: '🧩',
    link: '/games/gestalt',
    duration: '4-6 min',
    seoTitle: 'Gestalt Principles Game: Proximity, Similarity and Closure',
    seoDescription: 'An interactive puzzle that teaches Gestalt principles, proximity, similarity, closure and continuity, by having you group elements the way brains already do.',
    law: {
      formulatedBy: 'Max Wertheimer, Wolfgang Köhler and Kurt Koffka, early 20th century',
      paragraphs: [
        'Gestalt principles describe how the human brain automatically groups visual elements into patterns, using cues like proximity, similarity, closure and continuity, rather than perceiving each element in isolation.',
        'The theory comes from early 20th-century Gestalt psychologists Max Wertheimer, Wolfgang Köhler and Kurt Koffka, who studied how people perceive wholes rather than collections of parts.',
        'Interface designers rely on these principles constantly: grouping a label tightly with its input field (proximity), styling related buttons the same color (similarity), or aligning cards into a clean grid (continuity).',
      ],
    },
    relatedIds: ['contrast', 'fitts', 'serial'],
  },
  {
    id: 'contrast',
    title: 'Color Contrast Speedrun',
    description: 'Train your eye for WCAG accessibility standards. AA or AAA?',
    icon: '🎨',
    link: '/games/contrast',
    duration: '3 min',
    seoTitle: 'Color Contrast Game: Train Your Eye for WCAG AA and AAA',
    seoDescription: 'Train your eye for WCAG color contrast in a fast-paced game, then learn the AA and AAA ratios that keep text readable for low-vision users.',
    law: {
      formulatedBy: 'Web Content Accessibility Guidelines (WCAG)',
      paragraphs: [
        'Sufficient color contrast between text and its background is what makes content readable, especially for users with low vision or color blindness, and for anyone using a screen in bright sunlight.',
        'The Web Content Accessibility Guidelines (WCAG) codify this into measurable ratios: at least 4.5:1 for normal text to meet level AA, and 7:1 to meet the stricter level AAA.',
        "In practice, this is why light gray text on a white background fails accessibility audits even though it looks 'clean,' and why most design systems define a small, tested palette of text and background color pairs instead of leaving contrast to chance.",
      ],
    },
    relatedIds: ['accessibility', 'gestalt', 'dark-patterns'],
  },
  {
    id: 'accessibility',
    title: 'Accessibility Audit Challenge',
    description: 'Find and fix WCAG violations. Make the web accessible for everyone!',
    icon: '♿',
    link: '/games/accessibility',
    duration: '5-7 min',
    seoTitle: 'Accessibility Audit Game: Find and Fix Real WCAG Violations',
    seoDescription: 'Hunt down real WCAG violations, missing alt text, poor contrast, unlabeled fields, keyboard traps, in this interactive accessibility audit game.',
    law: {
      formulatedBy: 'Web Content Accessibility Guidelines (WCAG), maintained by the W3C',
      paragraphs: [
        'Web accessibility means designing and building interfaces that people with visual, auditory, motor or cognitive disabilities can actually use, not as an afterthought but as a baseline requirement.',
        'The Web Content Accessibility Guidelines (WCAG), maintained by the W3C, organize this work around four principles: content must be Perceivable, Operable, Understandable and Robust (POUR).',
        "Common violations include images missing alt text, form fields without labels, insufficient color contrast, and interactive elements that can't be reached with a keyboard alone, all things this game asks you to spot and fix.",
      ],
    },
    relatedIds: ['contrast', 'dark-patterns', 'quiz'],
  },
  {
    id: 'dark-patterns',
    title: 'Dark Pattern Detective',
    description: 'Spot manipulative design tactics and learn ethical alternatives.',
    icon: '🕵️',
    link: '/games/dark-patterns',
    duration: '4 min',
    seoTitle: 'Dark Pattern Detective Game: Spot Manipulative UI Tactics',
    seoDescription: 'Spot manipulative dark patterns like confirmshaming and forced continuity in this interactive game, then learn the ethical alternative for each.',
    law: {
      formulatedBy: 'Term coined by Harry Brignull, 2010',
      paragraphs: [
        "Dark patterns are interface tricks deliberately designed to manipulate users into doing something they wouldn't choose to do with full information, like signing up for a subscription they can't easily cancel.",
        "UX researcher Harry Brignull coined the term in 2010 and began cataloguing recurring tactics such as confirmshaming, forced continuity and the 'roach motel' pattern, where it's easy to get in and hard to get out.",
        'Ethical alternatives exist for every dark pattern: clear pricing instead of drip pricing, a visible cancel button instead of a hidden one, and opt-in defaults instead of pre-checked boxes that trick users into unwanted purchases.',
      ],
    },
    relatedIds: ['accessibility', 'quiz', 'contrast'],
  },
]

export function getGame(id: string): Game | undefined {
  return games.find(game => game.id === id)
}

export function getRelatedGames(id: string): Game[] {
  const game = getGame(id)
  if (!game) return []
  return game.relatedIds
    .map(relatedId => getGame(relatedId))
    .filter((g): g is Game => Boolean(g))
}

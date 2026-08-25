/**
 * Single source of truth for every string on the site.
 * Milo Kestrel is a fictional designer created for this portfolio.
 */

export const person = {
  name: 'Milo Kestrel',
  first: 'Milo',
  last: 'Kestrel',
  role: 'Product Designer & Creative Technologist',
  shortRole: 'Product design · Creative dev',
  base: 'Lisbon, PT',
  timezone: 'Europe/Lisbon',
  email: 'studio@milokestrel.com',
  availability: 'Two slots open — Q1 2027',
  years: 11,
}

export const hero = {
  eyebrow: 'Independent studio practice — est. 2016',
  lines: ['Interfaces', 'with a', 'pulse'],
  statement:
    'I design and build product for teams solving hard, unglamorous problems — wallets, editors, dashboards, tools people live inside for eight hours a day.',
  marquee: [
    'Product design',
    'Design systems',
    'Motion & interaction',
    'Creative development',
    'Prototyping',
    'Design direction',
  ],
}

export const manifesto = {
  label: 'The practice',
  headline: 'Taste is a system, not a mood board.',
  body: [
    'Most products fail at the seams — the empty state nobody drew, the loading moment nobody timed, the fifth screen where the grid quietly gives up. That is where I work.',
    'I take a product from ambiguous brief to shipped surface: research thin enough to move on, systems strong enough to survive a roadmap, and motion that carries meaning instead of decorating the wait.',
  ],
  facts: [
    { k: '11', v: 'Years shipping product' },
    { k: '40+', v: 'Products in market' },
    { k: '6', v: 'Design systems in production' },
    { k: '2', v: 'Studios built and handed over' },
  ],
}

export const projects = [
  {
    id: 'slushbox',
    index: '01',
    name: 'Slushbox',
    kicker: 'Self-custody, minus the fear',
    year: '2026',
    role: 'Product design lead',
    scope: ['Product design', 'Design system', 'Motion'],
    accent: 'lime',
    summary:
      'A consumer wallet that treats a seed phrase like a household object, not a hazing ritual. Onboarding rebuilt around one idea: never show a warning you have not earned.',
    body: [
      'The old flow lost 71% of first-time users before their first transaction. We rebuilt it as five honest screens, each one answering the question the previous screen provoked.',
      'Recovery became a progressive story rather than a wall of red text, and the transaction sheet was re-timed so the security check reads as confidence rather than friction.',
    ],
    metrics: [
      { k: '+164%', v: 'Activation to first send' },
      { k: '-71%', v: 'Onboarding drop-off' },
      { k: '4.8', v: 'Store rating, post-launch' },
    ],
    stack: ['Figma', 'SwiftUI spec', 'Rive', 'Token pipeline'],
  },
  {
    id: 'pikafold',
    index: '02',
    name: 'Pikafold',
    kicker: 'A timeline for generated video',
    year: '2025',
    role: 'Design direction · Prototyping',
    scope: ['Interaction design', 'Prototyping', 'Design direction'],
    accent: 'violet',
    summary:
      'A node-and-timeline editor for generative video. The hard part was not the canvas — it was making non-determinism feel like a craft tool instead of a slot machine.',
    body: [
      'Every generation is a branch. We designed a version graph that sits under the timeline, so editors can fork a shot, compare four takes side by side, and promote one without losing the others.',
      'Latency was designed for, not hidden: the editor keeps working while renders resolve, and each pending clip carries its own live progress skin.',
    ],
    metrics: [
      { k: '3.1×', v: 'Shots per session' },
      { k: '−48%', v: 'Time to first export' },
      { k: '92%', v: 'Beta retention, week 4' },
    ],
    stack: ['Figma', 'React prototype', 'WebGL', 'Framer Motion'],
  },
  {
    id: 'portal-os',
    index: '03',
    name: 'Portal OS',
    kicker: 'The workspace as an operating system',
    year: '2025',
    role: 'Principal designer',
    scope: ['Product design', 'Systems', 'Creative dev'],
    accent: 'blue',
    summary:
      'A spatial workspace for distributed engineering teams — windows, presence and long-running jobs in one persistent canvas that survives a closed laptop.',
    body: [
      'We modelled the workspace as durable state instead of a session. Panes remember their scroll, their filters and their unfinished sentence, and presence is ambient rather than performative.',
      'A dark, low-glare surface treatment keeps twelve hours of use comfortable, with a strict elevation ladder so density never turns into noise.',
    ],
    metrics: [
      { k: '−36%', v: 'Context switches per day' },
      { k: '11k', v: 'Weekly active engineers' },
      { k: '99.2', v: 'Lighthouse, app shell' },
    ],
    stack: ['Figma', 'Storybook', 'CSS architecture', 'Perf budget'],
  },
  {
    id: 'halo',
    index: '04',
    name: 'Halo Health',
    kicker: 'Rosters for people, not spreadsheets',
    year: '2024',
    role: 'Lead product designer',
    scope: ['Research', 'Product design', 'Accessibility'],
    accent: 'sky',
    summary:
      'Shift planning for hospital care teams. Designed on ward, at 3am, with the nurses who would be using it at 3am.',
    body: [
      'The interface had to work on a glare-heavy tablet, one-handed, by someone mid-conversation. Every target grew, every colour was re-tested at AA against a washed-out screen.',
      'Swaps became a two-tap negotiation instead of a phone tree, and the fairness model was made visible so the roster could be argued with rather than resented.',
    ],
    metrics: [
      { k: '−4.5h', v: 'Admin per manager, weekly' },
      { k: 'AAA', v: 'Contrast on core flows' },
      { k: '38', v: 'Wards rolled out' },
    ],
    stack: ['Field research', 'Figma', 'WCAG audit', 'Design system'],
  },
  {
    id: 'kiln',
    index: '05',
    name: 'Kiln',
    kicker: 'Tokens that survive contact with engineering',
    year: '2024',
    role: 'Systems design · Tooling',
    scope: ['Design systems', 'Tooling', 'Creative dev'],
    accent: 'orange',
    summary:
      'A token pipeline and documentation surface that turns one source of truth into iOS, Android, web and Figma without a human retyping a hex code.',
    body: [
      'Kiln treats design decisions as versioned data. A colour change opens a pull request, runs a contrast suite, and previews every affected component before anyone approves it.',
      'The docs are generated from the same graph, so a component can never be documented as something it is not.',
    ],
    metrics: [
      { k: '−92%', v: 'Token drift incidents' },
      { k: '4', v: 'Platforms, one source' },
      { k: '11 min', v: 'Decision to production' },
    ],
    stack: ['Style Dictionary', 'Figma API', 'CI checks', 'Docs engine'],
  },
  {
    id: 'terra',
    index: '06',
    name: 'Terra Grid',
    kicker: 'Watching a country keep the lights on',
    year: '2023',
    role: 'Design direction',
    scope: ['Data design', 'Product design', 'Motion'],
    accent: 'paper',
    summary:
      'Real-time grid monitoring for a national energy operator — 40,000 telemetry points reduced to the six things a controller must notice in the next ninety seconds.',
    body: [
      'We designed for the worst ten minutes of the year. Alarm states earn colour; everything else surrenders it, so the screen is almost monochrome until it must not be.',
      'Motion is used strictly as a change signal — nothing on this interface moves unless the grid did.',
    ],
    metrics: [
      { k: '−58%', v: 'Time to acknowledge' },
      { k: '6', v: 'Signals on the wall board' },
      { k: '24/7', v: 'Control-room deployment' },
    ],
    stack: ['Data viz', 'Figma', 'Canvas rendering', 'Ops research'],
  },
]

export const capabilities = [
  {
    id: 'product',
    tone: 'lime',
    span: 'wide',
    title: 'Product design',
    line: 'Zero to shipped',
    body: 'Ambiguous brief to a surface real people use. Flows, states, edge cases, the unglamorous fifth screen.',
    items: ['Discovery & framing', 'End-to-end flows', 'Interface craft', 'Ship support'],
  },
  {
    id: 'systems',
    tone: 'blue',
    span: 'tall',
    title: 'Design systems',
    line: 'Built to be inherited',
    body: 'Tokens, components and documentation that hold up after I leave the room — versioned, tested, adopted.',
    items: ['Token architecture', 'Component libraries', 'Governance', 'Adoption tooling'],
  },
  {
    id: 'motion',
    tone: 'violet',
    span: 'auto',
    title: 'Motion & interaction',
    line: 'Timing is meaning',
    body: 'Choreography that explains state instead of decorating a wait. Specced to the millisecond.',
    items: ['Motion language', 'Prototypes', 'Handoff specs'],
  },
  {
    id: 'dev',
    tone: 'paper',
    span: 'auto',
    title: 'Creative development',
    line: 'I build what I draw',
    body: 'Production front-end, WebGL and shaders. The prototype and the product speak the same language.',
    items: ['React & TypeScript', 'GLSL / Three.js', 'Performance budgets'],
  },
  {
    id: 'direction',
    tone: 'orange',
    span: 'wide',
    title: 'Design direction',
    line: 'For teams who already have designers',
    body: 'Embedded critique, hiring, standards and taste calibration — a fortnightly cadence that raises the floor.',
    items: ['Critique cadence', 'Portfolio review', 'Hiring & levelling', 'Standards'],
  },
]

export const process = [
  {
    n: '01',
    t: 'Frame',
    d: 'A week of listening. Users, support tickets, the sales call nobody wants to replay. We leave with one problem stated in one sentence.',
    out: 'Problem brief · Success metric',
  },
  {
    n: '02',
    t: 'Sketch wide',
    d: 'Three genuinely different directions, drawn cheaply and argued honestly. Killing two of them is the deliverable.',
    out: 'Direction study · Decision log',
  },
  {
    n: '03',
    t: 'Build the real thing',
    d: 'Interactive from week two — real data, real latency, real device. Static comps lie about timing and they always lie in your favour.',
    out: 'Working prototype',
  },
  {
    n: '04',
    t: 'Systemise',
    d: 'Once the shape holds, it becomes tokens, components and rules so the tenth screen costs a tenth of the first.',
    out: 'System + documentation',
  },
  {
    n: '05',
    t: 'Ship & stay',
    d: 'Pairing with engineering through release, then a month of watching what actually happened. Design ends at behaviour, not handoff.',
    out: 'Release support · Post-launch read',
  },
]

export const recognition = [
  { y: '2026', t: 'Awwwards — Site of the Day', s: 'Slushbox' },
  { y: '2026', t: 'Fast Company Innovation by Design', s: 'Halo Health, finalist' },
  { y: '2025', t: 'Webby — Best Interface', s: 'Portal OS' },
  { y: '2025', t: 'CSS Design Awards — Website of the Year', s: 'Nominee' },
  { y: '2024', t: 'D&AD Wood Pencil', s: 'Kiln, digital design' },
  { y: '2023', t: 'Core77 Design Award', s: 'Terra Grid, professional' },
]

export const stats = [
  { k: 164, suffix: '%', label: 'Median lift in activation across shipped work' },
  { k: 11, suffix: '', label: 'Years designing product, in-house and independent' },
  { k: 6, suffix: '', label: 'Design systems still in production today' },
  { k: 40, suffix: '+', label: 'Products taken from brief to release' },
]

export const voices = [
  {
    q: 'Milo redrew our onboarding in three weeks and then sat with the engineers until it actually shipped. Nobody else on that project could hold both halves.',
    n: 'Ines Vidal',
    r: 'VP Product, Slushbox',
    tone: 'lime',
  },
  {
    q: 'The rare designer whose prototype is faster than the argument. We stopped debating and started watching people use it.',
    n: 'Dmitri Auer',
    r: 'Co-founder, Pikafold',
    tone: 'violet',
  },
  {
    q: 'Our system had been "almost done" for two years. Milo made it boring, versioned and adopted in one quarter.',
    n: 'Rae Okonjo',
    r: 'Head of Design Eng, Portal',
    tone: 'blue',
  },
  {
    q: 'They spent two night shifts on the ward before opening Figma. That is why the nurses trusted the thing.',
    n: 'Dr. Anneke Roth',
    r: 'Clinical Lead, Halo Health',
    tone: 'sky',
  },
]

export const clients = [
  'Slushbox',
  'Pikafold',
  'Portal',
  'Halo Health',
  'Kiln',
  'Terra Grid',
  'Northwind',
  'Aperture Labs',
  'Vector Union',
]

export const socials = [
  { label: 'Email', short: 'EM', href: 'mailto:studio@milokestrel.com' },
  { label: 'Read.cv', short: 'CV', href: 'https://read.cv/' },
  { label: 'Instagram', short: 'IG', href: 'https://instagram.com/' },
  { label: 'X', short: 'X', href: 'https://x.com/' },
  { label: 'GitHub', short: 'GH', href: 'https://github.com/' },
]

export const nav = [
  { id: 'work', label: 'Work' },
  { id: 'practice', label: 'Practice' },
  { id: 'capabilities', label: 'Capabilities' },
  { id: 'process', label: 'Process' },
  { id: 'contact', label: 'Contact' },
]

export const faqLite = [
  { k: 'Engagements', v: 'Six-week sprints or embedded quarters' },
  { k: 'Working with', v: 'Seed to Series C, plus two enterprise teams' },
  { k: 'Not taking', v: 'Logo-only briefs, unpaid pitches' },
]

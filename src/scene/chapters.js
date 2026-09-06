// The script. Every chapter is a shot: where the camera stands, what it looks
// at, how the object behaves, and how the frame is graded. The director
// interpolates between them as you scroll, so the page is one continuous take.

export const SITE = {
  name: 'מעיין זי',
  role: 'מאפרת כלות',

  // Drop a real Gaussian Splatting capture here (.splat or .ply) and it replaces
  // the generated object with no other changes. Leave null to use the generator.
  splatUrl: null,

  // TODO: replace these placeholders with the real details before going live.
  contact: {
    phone: '050-000-0000',
    phoneHref: 'tel:+972500000000',
    email: 'hello@example.com',
    instagram: '@example',
    instagramHref: 'https://instagram.com/',
    whatsappHref: 'https://wa.me/972500000000',
    area: 'מרכז הארץ · ניידת לכל הארץ',
  },
};

// Makeup shades. The lip and lid splats are repainted with these in real time --
// the palette is not a swatch next to the object, it is the object.
export const SHADES = {
  lips: [
    { id: 'nude',     name: 'עירום',      hex: '#D8A98C' },
    { id: 'rose',     name: 'ורד יבש',    hex: '#C98A86' },
    { id: 'copper',   name: 'נחושת',      hex: '#B26A3E' },
    { id: 'burgundy', name: 'בורדו',      hex: '#8E3B45' },
    { id: 'cherry',   name: 'דובדבן',     hex: '#A83244' },
  ],
  eyes: [
    { id: 'champagne', name: 'שמפניה',   hex: '#E4CBA6' },
    { id: 'taupe',     name: 'חוּם רך',  hex: '#8C7566' },
    { id: 'gold',      name: 'זהב',      hex: '#C9A227' },
    { id: 'plum',      name: 'שזיף',     hex: '#6E4A5C' },
    { id: 'charcoal',  name: 'פחם',      hex: '#4A3F44' },
  ],
};

const BASE_GRADE = {
  exposure: 1.0,
  contrast: 1.06,
  saturation: 1.04,
  lift: [0.008, 0.005, 0.010],
  gain: [1.02, 0.995, 0.975],
  vignette: 0.62,
  grain: 0.045,
  bloomStrength: 0.55,
  bloomThreshold: 0.72,
  bloomTint: [1.0, 0.88, 0.74],
  aberration: 0.22,
  bleed: 0.0,
  letterbox: 0.0,
  flash: 0.0,
  fade: 0.0,
  sequenceOpacity: 0.0,
  sequenceScale: 1.0,
};

const BASE_BACKDROP = {
  top: [0.052, 0.042, 0.050],
  bottom: [0.016, 0.013, 0.017],
  glowColor: [0.85, 0.62, 0.42],
  glowPos: [0.5, 0.62],
  glowStrength: 0.16,
};

const BASE_GROUPS = { skin: 1, veil: 1, flower: 1, mote: 1, lips: 1, eyes: 1 };

const chapter = (config) => ({
  ...config,
  grade: { ...BASE_GRADE, ...(config.grade || {}) },
  backdrop: { ...BASE_BACKDROP, ...(config.backdrop || {}) },
  groups: { ...BASE_GROUPS, ...(config.groups || {}) },
  dissolve: config.dissolve ?? 0,
  breathe: config.breathe ?? 1,
  focusOffset: config.focusOffset ?? 0,
  dof: config.dof ?? { strength: 2.2, max: 7.0 },
});

export const CHAPTERS = [
  chapter({
    id: 'overture',
    nav: 'פתיחה',
    kicker: null,
    title: SITE.name,
    lead: SITE.role,
    body: 'הבוקר הזה מתחיל בשקט. עוד לפני השמלה, לפני הצלם, לפני כולם — יש חדר אחד, כיסא אחד, ואת.',
    hint: 'גללי כדי להתחיל',
    camera: { pos: [0.35, 1.62, 9.10], target: [0.0, 1.18, 0.0], fov: 30 },
    dissolve: 0.34,
    breathe: 1.5,
    groups: { veil: 0.55, flower: 0.4, mote: 1.4 },
    grade: {
      exposure: 0.82, vignette: 0.78, grain: 0.062, bloomStrength: 0.85,
      aberration: 0.45, letterbox: 0.055, saturation: 0.86,
    },
    backdrop: { glowStrength: 0.10, glowPos: [0.5, 0.55] },
  }),

  chapter({
    id: 'canvas',
    nav: 'הבד',
    kicker: '01',
    title: 'הבד',
    lead: 'לפני הצבע — העור.',
    body: 'שכבה על שכבה, דקה מהקודמת. עבודה שנועדה להיעלם: אף אחד לא אמור לראות אותה, כולם אמורים להרגיש אותה. זה הבסיס שמחזיק שתים־עשרה שעות, שלוש שמלות ומאתיים חיבוקים.',
    camera: { pos: [2.08, 1.99, 3.83], target: [0.0, 1.45, 0.20], fov: 30, shift: [0.62, -0.10] },
    focusOffset: -0.05,
    dof: { strength: 3.4, max: 11 },
    groups: { veil: 0.75, mote: 0.7 },
    grade: { exposure: 1.02, letterbox: 0.0, bloomStrength: 0.5, aberration: 0.16 },
    backdrop: { glowPos: [0.62, 0.58], glowStrength: 0.22 },
  }),

  chapter({
    id: 'eye',
    nav: 'העין',
    kicker: '02',
    title: 'העין',
    lead: 'כאן מסתכלים עלייך.',
    body: 'בתמונות של החתונה, בסרטון של הריקוד, בעוד עשרים שנה על המדף. העין היא המשפט הראשון — ואני כותבת אותו בשכבות דקות, עם יד קרובה מאוד.',
    camera: { pos: [0.96, 1.97, 1.89], target: [0.30, 1.62, 0.50], fov: 26, shift: [-0.16, 0.02] },
    focusOffset: -0.02,
    dof: { strength: 7.5, max: 22 },
    groups: { veil: 0.5, mote: 0.5, flower: 0.8 },
    grade: {
      exposure: 1.08, contrast: 1.12, bloomStrength: 0.42, aberration: 0.14,
      grain: 0.05, vignette: 0.72,
    },
    backdrop: { glowPos: [0.58, 0.66], glowStrength: 0.26 },
  }),

  chapter({
    id: 'lip',
    nav: 'השפה',
    kicker: '03',
    title: 'השפה',
    lead: 'הצבע היחיד שמדבר.',
    body: 'קו אחד מחליט אם הפנים רכות או חדות, קלאסיות או מודרניות. אנחנו נבחר אותו יחד — ואז נוודא שהוא שורד את הכוס הראשונה, את הנשיקה ואת החופה.',
    camera: { pos: [-0.50, 1.44, 2.09], target: [0.0, 1.21, 0.52], fov: 26, shift: [0.20, -0.02] },
    dof: { strength: 8.5, max: 24 },
    groups: { veil: 0.42, mote: 0.45, flower: 0.6 },
    grade: {
      exposure: 1.06, contrast: 1.14, saturation: 1.12, bloomStrength: 0.38,
      aberration: 0.14, vignette: 0.74, bleed: 0.05,
    },
    backdrop: { glowPos: [0.42, 0.52], glowStrength: 0.24 },
  }),

  chapter({
    id: 'veil',
    nav: 'הצעיף',
    kicker: '04',
    title: 'הצעיף',
    lead: 'ואז הכול זז.',
    body: 'רוח, בד, מדרגות, אור אחר. איפור טוב הוא לא איך שהוא נראה בכיסא — אלא איך שהוא נראה אחרי שהצעיף עבר עליו.',
    camera: { pos: [-3.90, 2.75, 2.80], target: [0.0, 1.35, 0.0], fov: 42 },
    dissolve: 0.09,
    breathe: 1.9,
    dof: { strength: 1.6, max: 9 },
    groups: { veil: 1.35, mote: 1.5, skin: 0.92 },
    grade: {
      exposure: 0.98, bloomStrength: 0.8, aberration: 0.32, grain: 0.055,
      letterbox: 0.045, saturation: 0.96, bloomThreshold: 0.6,
      sequenceOpacity: 0.42, sequenceScale: 1.08,
    },
    backdrop: { glowPos: [0.3, 0.7], glowStrength: 0.3, top: [0.062, 0.05, 0.058] },
  }),

  chapter({
    id: 'palette',
    nav: 'הפלטה',
    kicker: '05',
    title: 'הפלטה',
    lead: 'עכשיו תורך.',
    body: 'בחרי גוון לשפתיים ולעפעפיים — ותראי אותו נכנס לפנים בזמן אמת. ככה בדיוק נראית פגישת הניסיון, רק בלי הנסיעה.',
    interactive: 'palette',
    camera: { pos: [0.52, 1.62, 5.35], target: [0.0, 1.34, 0.15], fov: 30, shift: [0.0, -0.14] },
    dof: { strength: 2.6, max: 10 },
    groups: { veil: 0.7, mote: 0.55 },
    grade: {
      exposure: 1.05, contrast: 1.08, saturation: 1.10, bloomStrength: 0.5,
      aberration: 0.14, vignette: 0.6,
    },
    backdrop: { glowPos: [0.5, 0.6], glowStrength: 0.28 },
  }),

  chapter({
    id: 'light',
    nav: 'האור',
    kicker: '06',
    title: 'האור',
    lead: 'הזיזי את העכבר. תראי מה קורה.',
    body: 'אולם, גינה, שקיעה, ניאון של מסיבה. אותו איפור מקבל ארבע פנים. אני מאפרת לאור שבו את הולכת לעמוד — לא לאור שבו אני עובדת.',
    interactive: 'light',
    camera: { pos: [3.70, 1.95, 1.93], target: [0.0, 1.45, 0.0], fov: 34, shift: [-0.46, 0.0] },
    dof: { strength: 2.2, max: 9 },
    groups: { veil: 0.9, mote: 0.9 },
    grade: {
      exposure: 0.96, contrast: 1.12, bloomStrength: 0.68, aberration: 0.20,
      vignette: 0.7, bloomThreshold: 0.65,
    },
    backdrop: { glowPos: [0.72, 0.55], glowStrength: 0.3 },
  }),

  chapter({
    id: 'moment',
    nav: 'הרגע',
    kicker: '07',
    title: 'הרגע',
    lead: 'הדלת נפתחת.',
    body: 'כל מה שעשינו בשלוש השעות האחרונות קיים בשביל שתי שניות אחת. אני כבר לא בחדר — ואת מוכנה.',
    camera: { pos: [0.25, 1.45, 6.90], target: [0.0, 1.05, 0.0], fov: 34 },
    breathe: 1.3,
    dof: { strength: 1.2, max: 6 },
    groups: { veil: 1.15, mote: 1.35, flower: 1.1 },
    grade: {
      exposure: 1.12, bloomStrength: 0.95, bloomThreshold: 0.58, aberration: 0.20,
      grain: 0.05, vignette: 0.55, letterbox: 0.06, bleed: 0.09,
      sequenceOpacity: 0.55, sequenceScale: 1.0, saturation: 1.05,
    },
    backdrop: { glowPos: [0.5, 0.68], glowStrength: 0.4, top: [0.075, 0.06, 0.062] },
  }),

  chapter({
    id: 'contact',
    nav: 'קשר',
    kicker: '08',
    title: 'נדבר?',
    lead: 'תאריכים לעונה הקרובה נסגרים מוקדם.',
    body: 'ספרי לי מתי, איפה, ואיך את מדמיינת את עצמך. אחזור אלייך עם הצעה, ועם תאריך לניסיון.',
    camera: { pos: [0.0, 1.30, 11.50], target: [0.0, 1.20, 0.0], fov: 30, shift: [0.0, -0.55] },
    dissolve: 0.26,
    breathe: 1.7,
    dof: { strength: 1.0, max: 6 },
    groups: { veil: 0.65, mote: 1.6, flower: 0.7 },
    grade: {
      exposure: 0.86, bloomStrength: 0.8, aberration: 0.30, grain: 0.06,
      vignette: 0.8, saturation: 0.9, letterbox: 0.03,
    },
    backdrop: { glowStrength: 0.14, glowPos: [0.5, 0.5] },
  }),
];

export function hexToRgb(hex) {
  const value = parseInt(hex.replace('#', ''), 16);
  return [
    ((value >> 16) & 255) / 255,
    ((value >> 8) & 255) / 255,
    (value & 255) / 255,
  ];
}

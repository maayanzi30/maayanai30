// ============================================================
// נתוני האתר — ביו-טי (איפור לא שגרתי)
// מקור אמת אחד לפרטי קשר, ניווט וקריאות לפעולה.
// עדכנו כאן את מספר הוואטסאפ והאימייל האמיתיים לפני עלייה לאוויר.
// ============================================================

export const business = {
  name: 'ביו-טי',
  tagline: 'איפור לא שגרתי ואמנותי',
  message:
    'איפור אמנותי שמביא את האופי והנוכחות שלך לקדמת הבמה, בלי להרגיש כמו תחפושת.',
  phoneDisplay: '050-000-0000',
  whatsappNumber: '972500000000', // מספר לדוגמה — יש להחליף במספר האמיתי
  email: 'hello@bio-ti.co.il',
  areas: 'איזור המרכז והשרון, וניידות לאירועים בכל הארץ',
}

export const whatsappLink = (text = 'היי, הגעתי דרך האתר ואשמח לפרטים על איפור') =>
  `https://wa.me/${business.whatsappNumber}?text=${encodeURIComponent(text)}`

// ניווט ראשי (עמודי התוכן)
export const mainNav = [
  { to: '/', label: 'בית' },
  { to: '/portfolio', label: 'תיק עבודות' },
  { to: '/events', label: 'איפור לאירועים' },
  { to: '/workshops', label: 'סדנאות איפור' },
  { to: '/contact', label: 'יצירת קשר' },
]

// קישורים משפטיים (פוטר)
export const legalNav = [
  { to: '/accessibility', label: 'הצהרת נגישות' },
  { to: '/privacy', label: 'מדיניות פרטיות' },
  { to: '/terms', label: 'תקנון' },
]

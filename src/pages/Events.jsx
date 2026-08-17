import Layout from '../components/Layout.jsx'
import EventsHero from '../sections/events/EventsHero.jsx'
import WhoFor from '../sections/events/WhoFor.jsx'
import WhatIncluded from '../sections/events/WhatIncluded.jsx'
import WorkProcess from '../sections/events/WorkProcess.jsx'
import RelevantTestimonials from '../sections/events/RelevantTestimonials.jsx'
import EventsFaq from '../sections/events/EventsFaq.jsx'
import BookingForm from '../sections/events/BookingForm.jsx'

// עמוד "איפור לאירועים" — 8 אזורים (הפוטר משותף דרך Layout).
export default function Events() {
  return (
    <Layout title="איפור לאירועים וימי צילום">
      <EventsHero />
      <WhoFor />
      <WhatIncluded />
      <WorkProcess />
      <RelevantTestimonials />
      <EventsFaq />
      <BookingForm />
    </Layout>
  )
}

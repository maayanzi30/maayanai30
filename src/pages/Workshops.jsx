import Layout from '../components/Layout.jsx'
import WorkshopsHero from '../sections/workshops/WorkshopsHero.jsx'
import WorkshopTypes from '../sections/workshops/WorkshopTypes.jsx'
import WhatYouLearn from '../sections/workshops/WhatYouLearn.jsx'
import WhoForWorkshop from '../sections/workshops/WhoForWorkshop.jsx'
import HowItWorksWorkshop from '../sections/workshops/HowItWorksWorkshop.jsx'
import WorkshopsFaq from '../sections/workshops/WorkshopsFaq.jsx'
import WorkshopRegForm from '../sections/workshops/WorkshopRegForm.jsx'

// עמוד "סדנאות איפור" — 8 אזורים (הפוטר משותף דרך Layout).
export default function Workshops() {
  return (
    <Layout title="סדנאות איפור">
      <WorkshopsHero />
      <WorkshopTypes />
      <WhatYouLearn />
      <WhoForWorkshop />
      <HowItWorksWorkshop />
      <WorkshopsFaq />
      <WorkshopRegForm />
    </Layout>
  )
}

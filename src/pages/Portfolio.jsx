import Layout from '../components/Layout.jsx'
import PortfolioIntro from '../sections/portfolio/PortfolioIntro.jsx'
import GalleryFull from '../sections/portfolio/GalleryFull.jsx'
import MakeupStyles from '../sections/portfolio/MakeupStyles.jsx'
import BeforeAfter from '../sections/portfolio/BeforeAfter.jsx'
import MeetingCta from '../sections/portfolio/MeetingCta.jsx'

// עמוד "תיק עבודות" — 6 אזורים (הפוטר משותף דרך Layout).
export default function Portfolio() {
  return (
    <Layout title="תיק עבודות">
      <PortfolioIntro />
      <GalleryFull />
      <MakeupStyles />
      <BeforeAfter />
      <MeetingCta />
    </Layout>
  )
}

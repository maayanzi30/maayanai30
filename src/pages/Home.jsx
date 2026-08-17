import Layout from '../components/Layout.jsx'
import HeroMain from '../sections/home/HeroMain.jsx'
import PortfolioTeaser from '../sections/home/PortfolioTeaser.jsx'
import CoreServices from '../sections/home/CoreServices.jsx'
import HowItWorks from '../sections/home/HowItWorks.jsx'
import Testimonials from '../sections/home/Testimonials.jsx'
import FaqHome from '../sections/home/FaqHome.jsx'
import CtaMain from '../sections/home/CtaMain.jsx'

// עמוד "בית" — 8 אזורים (הפוטר משותף דרך Layout).
export default function Home() {
  return (
    <Layout title="בית — איפור לא שגרתי ואמנותי">
      <HeroMain />
      <PortfolioTeaser />
      <CoreServices />
      <HowItWorks />
      <Testimonials />
      <FaqHome />
      <CtaMain />
    </Layout>
  )
}

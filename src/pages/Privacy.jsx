import Layout from '../components/Layout.jsx'
import PrivacyHeader from '../sections/legal/PrivacyHeader.jsx'
import PrivacyBody from '../sections/legal/PrivacyBody.jsx'

// עמוד "מדיניות פרטיות" — 3 אזורים (הפוטר משותף דרך Layout).
export default function Privacy() {
  return (
    <Layout title="מדיניות פרטיות">
      <PrivacyHeader />
      <PrivacyBody />
    </Layout>
  )
}

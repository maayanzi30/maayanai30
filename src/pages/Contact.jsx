import Layout from '../components/Layout.jsx'
import ContactIntro from '../sections/contact/ContactIntro.jsx'
import ContactOptions from '../sections/contact/ContactOptions.jsx'
import ContactForm from '../sections/contact/ContactForm.jsx'
import ContactDetails from '../sections/contact/ContactDetails.jsx'
import ShortFaq from '../sections/contact/ShortFaq.jsx'

// עמוד "יצירת קשר" — 6 אזורים (הפוטר משותף דרך Layout).
export default function Contact() {
  return (
    <Layout title="יצירת קשר">
      <ContactIntro />
      <ContactOptions />
      <ContactForm />
      <ContactDetails />
      <ShortFaq />
    </Layout>
  )
}

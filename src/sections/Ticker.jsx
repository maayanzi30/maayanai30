import Marquee from '../components/Marquee.jsx'
import { hero } from '../data/site.js'

export default function Ticker() {
  return (
    <div className="ticker" aria-hidden="true">
      <Marquee items={hero.marquee} speed={30} separator="✦" className="mq--lime" />
    </div>
  )
}

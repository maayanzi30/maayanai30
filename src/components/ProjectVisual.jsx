/**
 * Procedural interface vignettes — one per case study.
 *
 * Rather than fake screenshots, each project gets an abstracted UI built from
 * markup, so it stays crisp at any size, weighs nothing, recolours from a
 * single accent token and animates for free.
 */

const Bar = ({ w = '60%', h = 6, o = 0.16, r = 99, bg }) => (
  <i className="pv-bar" style={{ width: w, height: h, opacity: o, borderRadius: r, background: bg }} />
)

function Slushbox() {
  return (
    <div className="pv pv--slushbox">
      <div className="pv__phone">
        <div className="pv__row pv__row--top">
          <Bar w="34%" h={7} o={0.3} />
          <span className="pv__pill">Sui</span>
        </div>
        <div className="pv__balance">
          <em>1,284</em>
          <span>.06</span>
        </div>
        <Bar w="46%" h={5} o={0.22} />
        <div className="pv__actions">
          {['Send', 'Swap', 'Buy'].map((a) => (
            <span key={a} className="pv__act">
              {a}
            </span>
          ))}
        </div>
        <div className="pv__spark" aria-hidden="true">
          {[38, 52, 30, 66, 44, 78, 58, 90, 72, 96].map((v, i) => (
            <i key={i} style={{ height: `${v}%`, animationDelay: `${i * 0.09}s` }} />
          ))}
        </div>
        <div className="pv__list">
          {[0, 1, 2].map((i) => (
            <div className="pv__li" key={i}>
              <span className="pv__dot" />
              <Bar w={`${52 - i * 9}%`} h={5} o={0.18} />
              <Bar w="16%" h={5} o={0.1} />
            </div>
          ))}
        </div>
      </div>
      <div className="pv__float pv__float--a">
        <span className="pv__check">✓</span>
        Sent · 0.4s
      </div>
    </div>
  )
}

function Pikafold() {
  return (
    <div className="pv pv--pikafold">
      <div className="pv__viewport">
        <div className="pv__frame" />
        <span className="pv__badge">take 03</span>
      </div>
      <div className="pv__timeline">
        <div className="pv__ruler" aria-hidden="true">
          {Array.from({ length: 22 }, (_, i) => (
            <i key={i} data-major={i % 4 === 0 || undefined} />
          ))}
        </div>
        {[
          [4, 26],
          [22, 34],
          [12, 20],
        ].map(([off, len], row) => (
          <div className="pv__track" key={row}>
            <span className="pv__clip" style={{ marginLeft: `${off}%`, width: `${len}%` }}>
              <i />
            </span>
            <span
              className="pv__clip pv__clip--ghost"
              style={{ marginLeft: '4%', width: `${len * 0.6}%` }}
            />
          </div>
        ))}
        <span className="pv__playhead" />
      </div>
      <div className="pv__nodes" aria-hidden="true">
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className="pv__node" data-i={i} />
        ))}
      </div>
    </div>
  )
}

function PortalOS() {
  return (
    <div className="pv pv--portal">
      <div className="pv__panes">
        <div className="pv__pane pv__pane--main">
          <div className="pv__paneBar">
            <span className="pv__tab" data-on="true">
              runtime
            </span>
            <span className="pv__tab">graph</span>
            <span className="pv__tab">logs</span>
          </div>
          <div className="pv__code">
            {[74, 52, 88, 40, 66, 30, 58].map((w, i) => (
              <span key={i}>
                <i style={{ width: 14 }} />
                <Bar w={`${w}%`} h={5} o={i % 3 === 0 ? 0.3 : 0.14} />
              </span>
            ))}
          </div>
        </div>
        <div className="pv__side">
          <div className="pv__pane">
            <div className="pv__presence">
              {['RA', 'DV', 'MK', 'JL'].map((p, i) => (
                <span key={p} style={{ animationDelay: `${i * 0.4}s` }}>
                  {p}
                </span>
              ))}
            </div>
            <Bar w="70%" h={5} o={0.18} />
          </div>
          <div className="pv__pane pv__pane--job">
            <Bar w="44%" h={5} o={0.26} />
            <div className="pv__prog">
              <i />
            </div>
            <Bar w="62%" h={4} o={0.12} />
          </div>
        </div>
      </div>
    </div>
  )
}

function Halo() {
  const cells = Array.from({ length: 28 }, (_, i) => i)
  return (
    <div className="pv pv--halo">
      <div className="pv__weekHead">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
          <span key={i}>{d}</span>
        ))}
      </div>
      <div className="pv__roster">
        {cells.map((i) => {
          const state = i % 9 === 3 ? 'gap' : i % 5 === 0 ? 'night' : i % 3 === 0 ? 'day' : 'off'
          return <span key={i} className="pv__cell" data-state={state} />
        })}
      </div>
      <div className="pv__swap">
        <span className="pv__swapDot" />
        <Bar w="42%" h={6} o={0.28} />
        <span className="pv__yes">Swap</span>
      </div>
    </div>
  )
}

function Kiln() {
  const swatches = ['#ff6b2c', '#ffa06b', '#0e0e12', '#f4f1ea', '#2b5cff', '#ccf553']
  return (
    <div className="pv pv--kiln">
      <div className="pv__swatches">
        {swatches.map((s, i) => (
          <span key={s} style={{ background: s, animationDelay: `${i * 0.12}s` }} />
        ))}
      </div>
      <div className="pv__diff">
        {[
          ['+', 'color.brand.core', '#FF6B2C'],
          ['~', 'space.gutter', '24 → 28'],
          ['+', 'radius.pill', '999'],
          ['-', 'color.legacy.tan', 'removed'],
        ].map(([sign, key, val]) => (
          <div className="pv__diffRow" key={key} data-sign={sign}>
            <em>{sign}</em>
            <span>{key}</span>
            <b>{val}</b>
          </div>
        ))}
      </div>
      <div className="pv__ci">
        <span className="pv__ciOk">contrast ✓</span>
        <span className="pv__ciOk">a11y ✓</span>
        <span className="pv__ciRun">building…</span>
      </div>
    </div>
  )
}

function Terra() {
  return (
    <div className="pv pv--terra">
      <div className="pv__wall">
        <svg viewBox="0 0 300 110" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <linearGradient id="tg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="rgba(244,241,234,0.28)" />
              <stop offset="1" stopColor="rgba(244,241,234,0)" />
            </linearGradient>
          </defs>
          {[0, 1, 2, 3].map((i) => (
            <line key={i} x1="0" y1={22 * i + 12} x2="300" y2={22 * i + 12} stroke="rgba(244,241,234,0.08)" />
          ))}
          <path
            className="pv__wave"
            d="M0 78 C 24 62, 40 88, 62 70 S 104 40, 128 58 S 168 84, 194 60 S 236 28, 262 46 S 288 62, 300 52"
            fill="none"
            stroke="rgba(244,241,234,0.75)"
            strokeWidth="1.6"
          />
          <path
            d="M0 78 C 24 62, 40 88, 62 70 S 104 40, 128 58 S 168 84, 194 60 S 236 28, 262 46 S 288 62, 300 52 L300 110 L0 110 Z"
            fill="url(#tg)"
          />
        </svg>
        <span className="pv__alarm">
          <i />
          Δ 412 MW
        </span>
      </div>
      <div className="pv__signals">
        {['Frequency', 'Reserve', 'Interconnect', 'Demand', 'Wind', 'Solar'].map((s, i) => (
          <span key={s} className="pv__sig" data-alert={i === 2 || undefined}>
            {s}
          </span>
        ))}
      </div>
    </div>
  )
}

const MAP = {
  slushbox: Slushbox,
  pikafold: Pikafold,
  'portal-os': PortalOS,
  halo: Halo,
  kiln: Kiln,
  terra: Terra,
}

export default function ProjectVisual({ id }) {
  const Cmp = MAP[id]
  return Cmp ? <Cmp /> : null
}

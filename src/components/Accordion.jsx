// אקורדיון נגיש מבוסס <details>/<summary> נטיבי (דפוס disclosure).
// items: [{ q, a }]
export default function Accordion({ items }) {
  return (
    <div className="faq">
      {items.map((item, i) => (
        <details className="faq__item" key={i}>
          <summary className="faq__q">{item.q}</summary>
          <div className="faq__a">
            <p>{item.a}</p>
          </div>
        </details>
      ))}
    </div>
  )
}

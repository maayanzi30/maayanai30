import { useState, useId } from 'react'

// טופס נגיש עם ולידציה, הכרזת שגיאות (role="alert" / aria-live),
// וצ׳קבוקס הסכמה אמיתי (תיקון 13 לחוק הגנת הפרטיות).
// אין שרת בשלב זה — בשליחה תקינה מוצג אישור. יש לחבר לטיפול בפניות לפני עלייה לאוויר.
export default function SmartForm({
  fields, // [{ name, label, type, required, options?, placeholder?, autoComplete? }]
  consentText,
  submitLabel = 'שליחה',
  successText = 'הפנייה נשלחה בהצלחה! נחזור אליך בהקדם.',
  name = 'form',
}) {
  const baseId = useId()
  const [values, setValues] = useState({})
  const [errors, setErrors] = useState({})
  const [sent, setSent] = useState(false)

  const setVal = (n, v) => setValues((s) => ({ ...s, [n]: v }))

  const validate = () => {
    const e = {}
    fields.forEach((f) => {
      const v = (values[f.name] || '').toString().trim()
      if (f.required && !v) e[f.name] = 'שדה חובה'
      else if (f.type === 'email' && v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v))
        e[f.name] = 'כתובת אימייל לא תקינה'
      else if (f.type === 'tel' && v && !/^[0-9()+\-\s]{7,}$/.test(v))
        e[f.name] = 'מספר טלפון לא תקין'
    })
    if (consentText && !values.__consent)
      e.__consent = 'יש לאשר את ההסכמה כדי לשלוח'
    return e
  }

  const onSubmit = (ev) => {
    ev.preventDefault()
    const e = validate()
    setErrors(e)
    if (Object.keys(e).length === 0) {
      setSent(true)
    } else {
      // מיקוד לשדה הראשון עם שגיאה
      const first = fields.find((f) => e[f.name]) || (e.__consent && { name: '__consent' })
      if (first) {
        const el = document.getElementById(`${baseId}-${first.name}`)
        if (el) el.focus()
      }
    }
  }

  if (sent) {
    return (
      <div className="form">
        <p className="form__status form__status--ok" role="status">
          {successText}
        </p>
      </div>
    )
  }

  return (
    <form className="form" onSubmit={onSubmit} noValidate aria-label={name}>
      {fields.map((f) => {
        const fid = `${baseId}-${f.name}`
        const errId = `${fid}-err`
        const invalid = Boolean(errors[f.name])
        return (
          <div
            className={`field${invalid ? ' field--invalid' : ''}`}
            key={f.name}
          >
            <label htmlFor={fid}>
              {f.label}{' '}
              {f.required && (
                <span className="req" aria-hidden="true">
                  *
                </span>
              )}
            </label>
            {f.type === 'textarea' ? (
              <textarea
                id={fid}
                name={f.name}
                value={values[f.name] || ''}
                placeholder={f.placeholder}
                required={f.required}
                aria-required={f.required || undefined}
                aria-invalid={invalid || undefined}
                aria-describedby={invalid ? errId : undefined}
                onChange={(e) => setVal(f.name, e.target.value)}
              />
            ) : f.type === 'select' ? (
              <select
                id={fid}
                name={f.name}
                value={values[f.name] || ''}
                required={f.required}
                aria-required={f.required || undefined}
                aria-invalid={invalid || undefined}
                aria-describedby={invalid ? errId : undefined}
                onChange={(e) => setVal(f.name, e.target.value)}
              >
                <option value="">בחרו…</option>
                {f.options.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            ) : (
              <input
                id={fid}
                name={f.name}
                type={f.type || 'text'}
                value={values[f.name] || ''}
                placeholder={f.placeholder}
                required={f.required}
                autoComplete={f.autoComplete}
                aria-required={f.required || undefined}
                aria-invalid={invalid || undefined}
                aria-describedby={invalid ? errId : undefined}
                onChange={(e) => setVal(f.name, e.target.value)}
              />
            )}
            {invalid && (
              <span className="field__error" id={errId} role="alert">
                {errors[f.name]}
              </span>
            )}
          </div>
        )
      })}

      {consentText && (
        <div
          className={`consent${errors.__consent ? ' field--invalid' : ''}`}
        >
          <input
            type="checkbox"
            id={`${baseId}-__consent`}
            checked={Boolean(values.__consent)}
            aria-invalid={errors.__consent ? true : undefined}
            aria-describedby={errors.__consent ? `${baseId}-consent-err` : undefined}
            onChange={(e) => setVal('__consent', e.target.checked)}
          />
          <label htmlFor={`${baseId}-__consent`}>
            {consentText}
            {errors.__consent && (
              <span
                className="field__error"
                id={`${baseId}-consent-err`}
                role="alert"
                style={{ display: 'block', marginTop: 6 }}
              >
                {errors.__consent}
              </span>
            )}
          </label>
        </div>
      )}

      <div>
        <button type="submit" className="btn btn--primary">
          {submitLabel}
        </button>
      </div>
    </form>
  )
}

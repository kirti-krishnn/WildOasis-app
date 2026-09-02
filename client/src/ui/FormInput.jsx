export function FormInput({ id, label, value, onChange, type = 'text', placeholder = '', extraClass = '' }) {
  return (
    <div className={`form__group ${extraClass}`.trim()}>
      <label className="form__label" htmlFor={id}>{label}</label>
      <input id={id} className="form__input" type={type} value={value} 
      placeholder={placeholder} required minLength={type === 'password' ? 8 : undefined} 
      onChange={(event) => onChange(event.target.value)} />
    </div>
  )
}

export function PasswordInput({ placeholder = '........', ...props }) {
  return <FormInput {...props} type="password" placeholder={placeholder} />
}

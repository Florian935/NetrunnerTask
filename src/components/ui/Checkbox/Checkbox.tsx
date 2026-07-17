import { useId } from 'react'
import type { InputHTMLAttributes, ReactNode } from 'react'
import './Checkbox.css'

export interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: ReactNode
}

/** Case à cocher personnalisée, halo cyan une fois cochée. */
export function Checkbox({
  label,
  checked,
  defaultChecked,
  disabled = false,
  onChange,
  className = '',
  id,
  ...rest
}: CheckboxProps) {
  const autoId = useId()
  const fieldId = id ?? autoId
  const cls = ['nt-check', disabled ? 'nt-check--disabled' : '', className]
    .filter(Boolean)
    .join(' ')
  return (
    <label className={cls} htmlFor={fieldId}>
      <input
        id={fieldId}
        type="checkbox"
        className="nt-check__native"
        checked={checked}
        defaultChecked={defaultChecked}
        disabled={disabled}
        onChange={onChange}
        {...rest}
      />
      <span className="nt-check__box">
        <span className="nt-check__mark">
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
            <path
              d="M2 6.2L4.6 9L10 3"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="square"
            />
          </svg>
        </span>
      </span>
      {label && <span>{label}</span>}
    </label>
  )
}

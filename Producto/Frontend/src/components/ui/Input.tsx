import { forwardRef } from 'react'
import { cn } from '../../lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, id, className, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s/g, '-')

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="text-body font-medium text-text-primary">
            {label}
            {props.required && <span className="text-status-rejected ml-1" aria-label="campo obligatorio">*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'w-full border border-border rounded-lg px-4 py-3 text-body-large text-text-primary',
            'bg-bg-surface placeholder:text-text-secondary',
            'focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20',
            'transition-colors duration-150',
            error && 'border-status-rejected focus:border-status-rejected focus:ring-status-rejected/20',
            className
          )}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          {...props}
        />
        {hint && !error && (
          <p id={`${inputId}-hint`} className="text-caption text-text-secondary">{hint}</p>
        )}
        {error && (
          <p id={`${inputId}-error`} className="text-caption text-status-rejected" role="alert">{error}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

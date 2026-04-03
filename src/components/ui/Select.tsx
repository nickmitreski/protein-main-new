import { SelectHTMLAttributes, forwardRef } from 'react';
import { components, colors, cn } from '../../design-system';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  options: Array<{ value: string; label: string }>;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    { label, error, helperText, fullWidth = false, options, className = '', disabled, ...props },
    ref
  ) => {
    const selectStyle = {
      ...components.input.base,
      appearance: 'none' as const,
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23616161' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'right 1rem center',
      paddingRight: '2.5rem',
      ...(error && components.input.error),
      ...(disabled && components.input.disabled),
      ...(fullWidth && { width: '100%' }),
    };

    return (
      <div style={{ width: fullWidth ? '100%' : 'auto' }}>
        {label && (
          <label
            style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: error ? colors.error.main : colors.text.primary,
              marginBottom: '0.5rem',
              letterSpacing: '0.025em',
            }}
          >
            {label}
          </label>
        )}

        <select
          ref={ref}
          className={cn('select', className)}
          style={selectStyle}
          disabled={disabled}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {(error || helperText) && (
          <p
            style={{
              marginTop: '0.5rem',
              fontSize: '0.875rem',
              color: error ? colors.error.main : colors.text.secondary,
            }}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

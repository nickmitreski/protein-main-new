import { InputHTMLAttributes, useState, forwardRef } from 'react';
import { components, colors, cn } from '../../design-system';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, fullWidth = false, className = '', disabled, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);

    const inputStyle = {
      ...components.input.base,
      ...(isFocused && !error && components.input.focus),
      ...(error && components.input.error),
      ...(error && isFocused && components.input.error.focus),
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

        <input
          ref={ref}
          className={cn('input', className)}
          style={inputStyle}
          disabled={disabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />

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

Input.displayName = 'Input';

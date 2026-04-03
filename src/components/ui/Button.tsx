import { ButtonHTMLAttributes, ReactNode } from 'react';
import { components, cn } from '../../design-system';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'accent';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  children: ReactNode;
  isLoading?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  children,
  isLoading = false,
  className = '',
  disabled,
  style = {},
  ...props
}: ButtonProps) {
  const baseStyles = components.button.base;
  const sizeStyles = components.button.sizes[size];
  const variantStyles = components.button.variants[variant];

  const buttonStyle = {
    ...baseStyles,
    ...sizeStyles,
    ...variantStyles,
    ...(fullWidth && { width: '100%' }),
    ...(disabled || isLoading ? components.button.disabled : {}),
    ...style,
  };

  const buttonClass = cn(
    'button',
    fullWidth && 'w-full',
    disabled || isLoading ? 'opacity-50 cursor-not-allowed' : '',
    className
  );

  return (
    <button
      className={buttonClass}
      disabled={disabled || isLoading}
      style={buttonStyle}
      onMouseEnter={(e) => {
        if (!disabled && !isLoading) {
          const hoverStyles = variantStyles.hover;
          Object.entries(hoverStyles).forEach(([key, value]) => {
            (e.currentTarget.style as any)[key] = value;
          });
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled && !isLoading) {
          Object.entries(variantStyles).forEach(([key, value]) => {
            if (key !== 'hover') {
              (e.currentTarget.style as any)[key] = value;
            }
          });
        }
      }}
      {...props}
    >
      {isLoading ? (
        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
          <svg
            className="animate-spin"
            style={{ width: '1rem', height: '1rem' }}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Loading...
        </span>
      ) : (
        children
      )}
    </button>
  );
}

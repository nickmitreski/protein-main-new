import { ButtonHTMLAttributes } from 'react';
import { components } from '../utils/design-system';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
}

export default function Button({ variant = 'primary', children, className = '', ...props }: ButtonProps) {
  const baseClasses = components.button;
  const variantClasses = variant === 'primary' ? components.buttonPrimary : components.buttonSecondary;

  return (
    <button className={`${baseClasses} ${variantClasses} ${className}`} {...props}>
      {children}
    </button>
  );
}

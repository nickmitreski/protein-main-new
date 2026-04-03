import { ReactNode } from 'react';
import { components, cn } from '../../design-system';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info' | 'danger';
  className?: string;
}

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  // Map 'danger' to 'error' for backwards compatibility
  const actualVariant = variant === 'danger' ? 'error' : variant;

  const badgeStyle = {
    ...components.badge.base,
    ...components.badge.variants[actualVariant],
  };

  return (
    <span className={cn('badge', className)} style={badgeStyle}>
      {children}
    </span>
  );
}

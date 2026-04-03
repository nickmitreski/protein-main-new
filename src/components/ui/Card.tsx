import { ReactNode, useState } from 'react';
import { components, colors, cn } from '../../design-system';

interface CardProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
  padding?: 'sm' | 'md' | 'lg';
}

export function Card({
  children,
  title,
  subtitle,
  className = '',
  onClick,
  hover = false,
  padding = 'md',
}: CardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const cardStyle = {
    ...components.card.base,
    padding: components.card.padding[padding],
    ...(isHovered && hover && components.card.hover),
    cursor: onClick ? 'pointer' : 'default',
  };

  return (
    <div
      className={cn('card', className)}
      style={cardStyle}
      onClick={onClick}
      onMouseEnter={() => hover && setIsHovered(true)}
      onMouseLeave={() => hover && setIsHovered(false)}
    >
      {(title || subtitle) && (
        <div
          style={{
            paddingBottom: components.card.padding.sm,
            marginBottom: components.card.padding.sm,
            borderBottom: `1px solid ${colors.border.light}`,
          }}
        >
          {title && (
            <h3
              style={{
                fontSize: '1.125rem',
                fontWeight: '700',
                color: colors.text.primary,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: subtitle ? '0.5rem' : '0',
              }}
            >
              {title}
            </h3>
          )}
          {subtitle && (
            <p
              style={{
                fontSize: '0.875rem',
                color: colors.text.secondary,
              }}
            >
              {subtitle}
            </p>
          )}
        </div>
      )}
      {children}
    </div>
  );
}

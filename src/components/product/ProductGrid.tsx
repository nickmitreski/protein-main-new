import { ReactNode } from 'react';
import { layout, spacing } from '../../utils/design-system';

interface ProductGridProps {
  children: ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
}

export function ProductGrid({ children, columns = 4, className = '' }: ProductGridProps) {
  const gridClass = columns === 2 ? layout.grid2 : columns === 3 ? layout.grid3 : layout.grid4;

  return (
    <div className={`${gridClass} ${spacing.gap} ${className}`}>
      {children}
    </div>
  );
}

import { useState } from 'react';
import { colors, spacing, typography, borderRadius, transitions, cn } from '../../design-system';

interface CategoryFilterProps {
  categories: ReadonlyArray<{ readonly id: string; readonly name: string; readonly icon?: string }>;
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  showAll?: boolean;
}

export function CategoryFilter({
  categories,
  activeCategory,
  onCategoryChange,
  showAll = true,
}: CategoryFilterProps) {
  const filters = showAll ? [{ id: '', name: 'All' }, ...categories] : categories;
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <div
      className={cn('flex', 'flex-wrap')}
      style={{ gap: spacing[2] }}
      role="group"
      aria-label="Filter products by category"
    >
      {filters.map((category) => {
        const isActive = activeCategory === category.id;
        const isHovered = hoveredId === category.id;

        return (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            onMouseEnter={() => setHoveredId(category.id)}
            onMouseLeave={() => setHoveredId(null)}
            aria-pressed={isActive}
            className="uppercase"
            style={{
              padding: `${spacing[2]} ${spacing[5]}`,
              fontSize: typography.fontSize.xs,
              fontWeight: typography.fontWeight.semibold,
              letterSpacing: typography.letterSpacing.widest,
              backgroundColor: isActive ? colors.neutral.black : colors.background.primary,
              color: isActive ? colors.text.inverse : colors.text.secondary,
              border: `1px solid ${isActive ? colors.neutral.black : colors.border.light}`,
              borderRadius: borderRadius.sm,
              transition: transitions.default,
              cursor: 'pointer',
              ...(isHovered &&
                !isActive && {
                  borderColor: colors.border.dark,
                  color: colors.text.primary,
                }),
            }}
          >
            {category.name}
          </button>
        );
      })}
    </div>
  );
}

import { TrendingUp, Sparkles, Award, TestTube } from 'lucide-react';
import { colors, spacing, typography, borderRadius, shadows, cn } from '../../design-system';

type BadgeType = 'Best Seller' | 'New' | 'Athlete Approved' | 'Lab Tested' | 'Sale';

interface ProductBadgeProps {
  type: BadgeType;
  className?: string;
}

const badgeConfig: Record<
  BadgeType,
  { bg: string; color: string; Icon: typeof TrendingUp }
> = {
  'Best Seller': {
    bg: colors.primary.main,
    color: colors.primary.contrast,
    Icon: TrendingUp,
  },
  'New': {
    bg: colors.accent.main,
    color: colors.accent.contrast,
    Icon: Sparkles,
  },
  'Athlete Approved': {
    bg: colors.secondary.main,
    color: colors.secondary.contrast,
    Icon: Award,
  },
  'Lab Tested': {
    bg: colors.success.main,
    color: colors.text.inverse,
    Icon: TestTube,
  },
  'Sale': {
    bg: colors.error.main,
    color: colors.text.inverse,
    Icon: TrendingUp,
  },
};

export function ProductBadge({ type, className = '' }: ProductBadgeProps) {
  const config = badgeConfig[type];
  const Icon = config.Icon;

  return (
    <div
      className={cn('flex', 'items-center', 'uppercase', className)}
      style={{
        padding: `${spacing[2]} ${spacing[3]}`,
        gap: spacing[2],
        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.bold,
        letterSpacing: typography.letterSpacing.wider,
        backgroundColor: config.bg,
        color: config.color,
        borderRadius: borderRadius.full,
        boxShadow: shadows.lg,
      }}
    >
      <Icon style={{ width: '0.875rem', height: '0.875rem' }} />
      <span>{type}</span>
    </div>
  );
}

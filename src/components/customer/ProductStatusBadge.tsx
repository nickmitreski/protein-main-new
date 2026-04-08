import { colors } from '../../utils/design-system';
import type { ProductStatus } from '../../utils/productStatus';

interface ProductStatusBadgeProps {
  status: ProductStatus;
  className?: string;
}

export function ProductStatusBadge({ status, className = '' }: ProductStatusBadgeProps) {
  if (status === 'available') {
    return null; // Don't show badge for available products
  }

  const getBadgeStyles = () => {
    switch (status) {
      case 'sold-out':
        return {
          backgroundColor: colors.error,
          color: colors.white,
          text: 'SOLD OUT',
        };
      case 'coming-soon':
        return {
          backgroundColor: colors.warning,
          color: colors.black,
          text: 'COMING SOON',
        };
      default:
        return null;
    }
  };

  const badgeStyles = getBadgeStyles();
  if (!badgeStyles) return null;

  return (
    <div
      className={`px-4 py-2 text-xs font-bold uppercase tracking-wider ${className}`}
      style={{
        backgroundColor: badgeStyles.backgroundColor,
        color: badgeStyles.color,
      }}
    >
      {badgeStyles.text}
    </div>
  );
}

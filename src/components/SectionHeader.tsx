import { colors, typography, spacing } from '../utils/design-system';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  align?: 'left' | 'center';
}

export default function SectionHeader({ title, subtitle, align = 'left' }: SectionHeaderProps) {
  const alignClass = align === 'center' ? 'text-center' : '';

  return (
    <div className={`${spacing.headingMargin} ${alignClass}`}>
      <h2 className={`${typography.h2} mb-4`} style={{ color: colors.black }}>{title}</h2>
      {subtitle && <p className={typography.body} style={{ color: colors.darkGrey }}>{subtitle}</p>}
    </div>
  );
}

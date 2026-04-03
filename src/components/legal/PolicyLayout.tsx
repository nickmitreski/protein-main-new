import { Link } from 'react-router-dom';
import { colors, spacing, typography } from '../../utils/design-system';
import { BUSINESS } from '../../constants/business';

type PolicyLayoutProps = {
  title: string;
  updated: string;
  children: React.ReactNode;
};

export function PolicyLayout({ title, updated, children }: PolicyLayoutProps) {
  return (
    <div className={`${spacing.container} py-16 max-w-3xl`}>
      <p className="text-xs uppercase tracking-widest mb-4" style={{ color: colors.gray500 }}>
        <Link to="/" className="hover:opacity-70 transition-opacity">
          Home
        </Link>
        <span className="mx-2">·</span>
        Legal
      </p>
      <h1 className={`${typography.h2} mb-2`} style={{ color: colors.black }}>
        {title}
      </h1>
      <p className="text-sm mb-2" style={{ color: colors.gray500 }}>
        Last updated: {updated}
      </p>
      <p className="text-xs mb-10 pb-6 border-b" style={{ color: colors.gray400, borderColor: colors.lightGrey }}>
        {BUSINESS.legalName} · ABN {BUSINESS.abn} · {BUSINESS.addressLines.join(', ')}
      </p>
      <div className="space-y-6 text-sm leading-relaxed" style={{ color: colors.gray500 }}>
        {children}
      </div>
    </div>
  );
}

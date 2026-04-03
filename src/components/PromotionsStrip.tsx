import { Tag, Package, Percent } from 'lucide-react';
import { Button } from './ui/Button';
import { colors, spacing } from '../utils/design-system';

const offers = [
  {
    icon: Percent,
    headline: '10% Off Your First Order',
    detail: 'Use code CF10 at checkout. New customers only.',
  },
  {
    icon: Package,
    headline: 'Free Shipping Over $100',
    detail: 'Australia-wide. No minimum item count.',
  },
  {
    icon: Tag,
    headline: 'Bundle & Save Up to 20%',
    detail: 'Build your stack and save more with every product you add.',
  },
];

export default function PromotionsStrip() {
  return (
    <section style={{ backgroundColor: colors.black }}>
      <div className={spacing.container}>
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x" style={{ borderColor: colors.gray800 }}>
          {offers.map(({ icon: Icon, headline, detail }) => (
            <div
              key={headline}
              className="flex flex-col items-center text-center py-12 px-8 gap-3"
              style={{ borderColor: colors.gray800 }}
            >
              <Icon size={22} style={{ color: colors.red }} />
              <p className="text-base font-semibold text-white">{headline}</p>
              <p className="text-sm" style={{ color: colors.gray400 }}>{detail}</p>
            </div>
          ))}
        </div>
        <div className="flex justify-center pb-12">
          <Button variant="primary">Unlock Your Offer</Button>
        </div>
      </div>
    </section>
  );
}

import { colors, spacing, layout } from '../utils/design-system';

const stats = [
  { value: 'AUD', label: 'Pricing in Australian dollars' },
  { value: '$100+', label: 'Free standard shipping' },
  { value: '30-day', label: 'Returns on unopened items' },
  { value: 'Clear', label: 'Ingredients & directions on every product' },
];

export default function StatsBreak() {
  return (
    <section style={{ backgroundColor: colors.red }}>
      <div className={spacing.container}>
        <div className={layout.grid4}>
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className="flex flex-col items-center justify-center py-14 px-8 text-center"
              style={{
                borderLeft: i > 0 ? `1px solid ${colors.redDark}` : 'none',
              }}
            >
              <span
                className="text-4xl md:text-5xl font-bold text-white mb-2"
                style={{ letterSpacing: '-0.02em' }}
              >
                {stat.value}
              </span>
              <span
                className="text-xs font-semibold uppercase text-white"
                style={{ opacity: 0.65, letterSpacing: '0.12em' }}
              >
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

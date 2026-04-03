import { colors, spacing, layout } from '../utils/design-system';

const stats = [
  { value: 'Listed', label: 'Ingredients & allergens on product pages' },
  { value: 'Open', label: 'Shipping, returns & privacy policies' },
  { value: '0', label: 'Hidden fees at checkout' },
  { value: 'TGA', label: 'General supplement disclaimer on site' },
];

export default function TrustSection() {
  return (
    <section style={{ backgroundColor: colors.black }}>
      <div className={spacing.container}>
        <div className={`${layout.grid4} gap-px`} style={{ backgroundColor: colors.gray800 }}>
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center justify-center py-16 px-8 text-center"
              style={{ backgroundColor: colors.black }}
            >
              <span className="text-5xl md:text-6xl font-bold text-white mb-3 tracking-tight">
                {stat.value}
              </span>
              <span className="text-sm tracking-widest uppercase" style={{ color: colors.gray400 }}>
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

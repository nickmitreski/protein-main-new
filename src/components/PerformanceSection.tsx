import { colors, spacing, layout, typography } from '../utils/design-system';

const benefits = [
  {
    label: 'Support training energy',
    detail:
      'Pre-workout and creatine products intended to support alertness and power output as part of your usual programme—always follow label directions.',
  },
  {
    label: 'Meet protein needs',
    detail:
      'Protein powders to help you reach daily protein targets alongside whole foods; not a sole source of nutrition.',
  },
  {
    label: 'Recovery & hydration support',
    detail:
      'Amino acid and electrolyte products formulated to support hydration and recovery between sessions—individual responses vary.',
  },
];

export default function PerformanceSection() {
  return (
    <section className={spacing.section} style={{ backgroundColor: colors.lightGrey }}>
      <div className={spacing.container}>
        <div className={`${layout.grid2} gap-20 items-center`}>
          <div className="order-2 md:order-1 overflow-hidden">
            <img
              src="https://images.pexels.com/photos/2261477/pexels-photo-2261477.jpeg?auto=compress&cs=tinysrgb&w=1200"
              alt="Athlete in training session"
              className="w-full h-[560px] object-cover"
              loading="lazy"
            />
          </div>

          <div className="order-1 md:order-2 space-y-10">
            <div className="space-y-4">
              <p
                className="text-xs font-semibold uppercase tracking-widest"
                style={{ color: colors.red, letterSpacing: '0.14em' }}
              >
                What We Do
              </p>
              <h2 className={`${typography.h2} leading-tight`} style={{ color: colors.black }}>
                Everything you need.<br />Nothing you don't.
              </h2>
              <p className={typography.body} style={{ color: colors.gray500 }}>
                A focused range of supplements built around the basics — because the basics done right are all most athletes need.
              </p>
            </div>

            <div className="space-y-6">
              {benefits.map((b) => (
                <div key={b.label} className="flex gap-4">
                  <div className="w-1 flex-shrink-0 mt-1" style={{ backgroundColor: colors.red }} />
                  <div>
                    <p className="text-sm font-semibold mb-1" style={{ color: colors.black }}>{b.label}</p>
                    <p className="text-sm leading-relaxed" style={{ color: colors.gray500 }}>{b.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

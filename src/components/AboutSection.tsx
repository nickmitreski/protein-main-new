import { colors, spacing, typography } from '../utils/design-system';

const pillars = [
  {
    title: 'No Fillers',
    body: 'Every scoop is packed with what your body actually needs. We never pad formulas with cheap bulking agents.',
  },
  {
    title: 'Real Ingredients',
    body: 'We use premium-grade ingredients at the doses athletes actually need, not token amounts added for label appeal.',
  },
  {
    title: 'Built for training days',
    body: 'Whether you are strength training, doing cardio, or staying active day to day, our range is designed to support nutrition and hydration goals alongside your coach or clinician’s advice.',
  },
];

export default function AboutSection() {
  return (
    <section className={spacing.section} id="about" style={{ backgroundColor: colors.white }}>
      <div className={spacing.container}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div>
            <p
              className="text-xs font-semibold uppercase tracking-widest mb-6"
              style={{ color: colors.red, letterSpacing: '0.15em' }}
            >
              Why CoreForge
            </p>
            <h2
              className={`${typography.h2} mb-8`}
              style={{ color: colors.black, lineHeight: '1.1' }}
            >
              Straightforward supplements. Clear information.
            </h2>
            <p
              className={`${typography.body} mb-6`}
              style={{ color: colors.gray500, lineHeight: '1.75' }}
            >
              We focus on transparent labels, sensible serve sizes, and products that fit into an active lifestyle. No
              hype, no medical promises—just quality-focused formulas with ingredients and directions published on every
              product page.
            </p>
            <p
              className={typography.body}
              style={{ color: colors.gray500, lineHeight: '1.75' }}
            >
              We keep it simple: great tasting, high-quality supplements made for people who take their training seriously.
            </p>
          </div>

          <div className="flex flex-col gap-8">
            {pillars.map((p) => (
              <div
                key={p.title}
                className="border-l-2 pl-8"
                style={{ borderColor: colors.red }}
              >
                <h3
                  className="text-base font-semibold mb-2"
                  style={{ color: colors.black }}
                >
                  {p.title}
                </h3>
                <p
                  className={typography.bodySmall}
                  style={{ color: colors.gray500, lineHeight: '1.75' }}
                >
                  {p.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

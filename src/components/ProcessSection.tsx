import { colors, spacing, typography } from '../utils/design-system';

const steps = [
  {
    number: '01',
    title: 'Research & formulation',
    body: 'We review sports-nutrition literature and work with qualified professionals to design formulas with clear serve sizes—without making unsubstantiated disease claims.',
  },
  {
    number: '02',
    title: 'Sourcing & manufacturing',
    body: 'Ingredients are sourced from verified suppliers and manufactured under quality systems appropriate to food or supplement production, with batch records retained.',
  },
  {
    number: '03',
    title: 'Quality checks',
    body: 'Where applicable, we use specification checks and third-party analysis to support label accuracy. Testing scope varies by product line and is described on the relevant batch or certificate where provided.',
  },
  {
    number: '04',
    title: 'Transparent labelling',
    body: 'Product pages list ingredients, allergens, and directions. Avoid proprietary “mystery” blends on the retail label so you can compare products confidently.',
  },
];

export default function ProcessSection() {
  return (
    <section className={spacing.section} style={{ backgroundColor: colors.black }}>
      <div className={spacing.container}>
        <div className="mb-20">
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-6"
            style={{ color: colors.red, letterSpacing: '0.15em' }}
          >
            How We Work
          </p>
          <h2
            className={`${typography.h2} text-white`}
            style={{ maxWidth: '520px', lineHeight: '1.1' }}
          >
            From research to your doorstep.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-px" style={{ backgroundColor: colors.gray800 }}>
          {steps.map((step) => (
            <div
              key={step.number}
              className="p-12 flex flex-col gap-5"
              style={{ backgroundColor: colors.black }}
            >
              <span
                className="text-4xl font-bold"
                style={{ color: colors.red, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}
              >
                {step.number}
              </span>
              <h3
                className="text-lg font-semibold text-white"
                style={{ letterSpacing: '-0.01em' }}
              >
                {step.title}
              </h3>
              <p
                className={typography.bodySmall}
                style={{ color: colors.gray400, lineHeight: '1.75' }}
              >
                {step.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

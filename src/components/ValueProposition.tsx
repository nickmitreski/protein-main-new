import { Dumbbell, FlaskConical, Truck, Users } from 'lucide-react';
import { colors, spacing, layout, typography } from '../utils/design-system';

const values = [
  {
    icon: Dumbbell,
    title: 'Premium Quality Ingredients',
    body: 'Straightforward formulas with ingredients listed on each product. We avoid unnecessary fillers and publish allergens where relevant.',
  },
  {
    icon: FlaskConical,
    title: 'Evidence-informed formulation',
    body: 'Our team draws on published sports-nutrition research when designing products—without overstating effects or making disease claims.',
  },
  {
    icon: Truck,
    title: 'Reliable delivery',
    body: 'Orders are dispatched from Australia with timelines explained in our shipping policy. Free standard shipping on orders over $100 where stated.',
  },
  {
    icon: Users,
    title: 'For active lifestyles',
    body: 'From weekend lifters to competitive athletes—our range is meant to support wellbeing and performance nutrition as part of a balanced diet.',
  },
];

export default function ValueProposition() {
  return (
    <section className={spacing.section} style={{ backgroundColor: colors.white }}>
      <div className={spacing.container}>
        <div className="text-center mb-16">
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-4"
            style={{ color: colors.red, letterSpacing: '0.15em' }}
          >
            Why Choose Us
          </p>
          <h2 className={typography.h2} style={{ color: colors.black }}>
            The CoreForge Difference
          </h2>
        </div>

        <div className={`${layout.grid4} gap-8`}>
          {values.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="flex flex-col p-8 border transition-all duration-200 hover:border-black"
              style={{ borderColor: colors.lightGrey }}
            >
              <div
                className="w-10 h-10 flex items-center justify-center mb-6"
                style={{ backgroundColor: colors.red }}
              >
                <Icon size={18} color="#fff" />
              </div>
              <h3 className="text-base font-semibold mb-3" style={{ color: colors.black }}>
                {title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: colors.gray500 }}>
                {body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

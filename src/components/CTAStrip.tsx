import { Button } from './ui/Button';
import { colors, spacing, typography } from '../utils/design-system';

export default function CTAStrip() {
  return (
    <section
      className={spacing.section}
      style={{ backgroundColor: colors.red }}
    >
      <div className={`${spacing.container} text-center`}>
        <p
          className="text-xs font-semibold uppercase mb-6 text-white"
          style={{ letterSpacing: '0.16em', opacity: 0.75 }}
        >
          CoreForge Nutrition
        </p>
        <h2 className={`${typography.h2} text-white mb-4 leading-tight`}>
          Support your next<br />training block
        </h2>
        <p className="text-base mb-10 text-white" style={{ opacity: 0.8 }}>
          Browse the range, read ingredients and directions on each product, and choose what fits your routine.
        </p>
        <Button variant="secondary">Shop Now</Button>
      </div>
    </section>
  );
}

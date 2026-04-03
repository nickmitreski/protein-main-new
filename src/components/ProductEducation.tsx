import { Zap, Dumbbell, Battery, Wind } from 'lucide-react';
import { Button } from './ui/Button';
import { colors, spacing, layout, typography } from '../utils/design-system';

const goals = [
  {
    icon: Dumbbell,
    supplement: 'Protein',
    goal: 'Daily protein & recovery support',
    description:
      'Protein contributes to the growth and maintenance of muscle mass as part of adequate overall protein intake and training—not a substitute for meals.',
    cta: 'Shop Protein',
  },
  {
    icon: Zap,
    supplement: 'Creatine',
    goal: 'Strength & power (training support)',
    description:
      'Creatine is widely studied for high-intensity exercise. Effects depend on diet, training, and individual response; read the label and warnings.',
    cta: 'Shop Creatine',
  },
  {
    icon: Battery,
    supplement: 'Pre-Workout',
    goal: 'Energy & alertness',
    description:
      'Caffeine-containing blends may support focus and perceived energy before training. Start with a partial serve if you are sensitive to stimulants.',
    cta: 'Shop Pre-Workout',
  },
  {
    icon: Wind,
    supplement: 'BCAAs',
    goal: 'Between-session support',
    description:
      'Branched-chain amino acids can complement protein intake around workouts. They are not a replacement for complete protein or medical care.',
    cta: 'Shop BCAAs',
  },
];

export default function ProductEducation() {
  return (
    <section className={spacing.section} style={{ backgroundColor: colors.lightGrey }} id="goals">
      <div className={spacing.container}>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div>
            <p
              className="text-xs font-semibold uppercase tracking-widest mb-4"
              style={{ color: colors.red, letterSpacing: '0.15em' }}
            >
              Supplement Guide
            </p>
            <h2 className={typography.h2} style={{ color: colors.black, lineHeight: '1.1' }}>
              Learn how products may fit<br />your routine.
            </h2>
          </div>
          <Button variant="primary">Take Our Supplement Quiz</Button>
        </div>

        <div className={`${layout.grid4} gap-6`}>
          {goals.map(({ icon: Icon, supplement, goal, description }) => (
            <div
              key={supplement}
              className="group flex flex-col bg-white border transition-all duration-200 hover:border-black cursor-pointer"
              style={{ borderColor: colors.lightGrey }}
            >
              <div
                className="flex items-center gap-3 p-6 border-b"
                style={{ borderColor: colors.lightGrey }}
              >
                <div
                  className="w-8 h-8 flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: colors.red }}
                >
                  <Icon size={15} color="#fff" />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: colors.black, letterSpacing: '0.1em' }}>
                  {supplement}
                </span>
              </div>
              <div className="p-6 flex flex-col flex-1">
                <h3 className="text-sm font-semibold mb-3" style={{ color: colors.black }}>
                  {goal}
                </h3>
                <p className="text-sm leading-relaxed flex-1" style={{ color: colors.gray500 }}>
                  {description}
                </p>
                <a
                  href="#shop"
                  className="mt-5 text-xs font-semibold uppercase tracking-wider inline-flex items-center gap-1 transition-colors"
                  style={{ color: colors.red, letterSpacing: '0.1em' }}
                >
                  Shop Now →
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

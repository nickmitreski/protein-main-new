import { Button } from './ui/Button';
import { colors, spacing, typography } from '../utils/design-system';

export default function LifestyleSection() {
  return (
    <section className="relative overflow-hidden min-h-[70vh] flex items-center">
      <div className="absolute inset-0">
        <img
          src="https://images.pexels.com/photos/1552249/pexels-photo-1552249.jpeg?auto=compress&cs=tinysrgb&w=1600"
          alt="Athlete focused on performance"
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to right, rgba(10,10,10,0.92) 45%, rgba(10,10,10,0.4) 100%)' }}
        />
      </div>

      <div className={`relative w-full ${spacing.container} py-24`}>
        <div className="max-w-xl text-white">
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-6"
            style={{ color: colors.red, letterSpacing: '0.15em' }}
          >
            Our Mission
          </p>
          <h2 className={`${typography.h2} mb-6`} style={{ lineHeight: '1.1' }}>
            Active living.<br />Informed choices.
          </h2>
          <p className="text-base md:text-lg leading-relaxed mb-10" style={{ color: colors.gray400 }}>
            Whether you train for sport or stay active for wellbeing, we offer supplements that may support energy,
            hydration, and recovery as part of a balanced diet—not a shortcut or medical treatment. Always read the
            label and follow directions.
          </p>
          <Button variant="primary">Shop the Full Range</Button>
        </div>
      </div>
    </section>
  );
}

import { Button } from './ui/Button';
import { colors, typography, spacing } from '../utils/design-system';

export default function Hero() {
  return (
    <section className="relative text-white overflow-hidden min-h-[92vh] flex items-center" style={{ backgroundColor: colors.black }}>
      <div className="absolute inset-0">
        <img
          src="https://images.pexels.com/photos/1954524/pexels-photo-1954524.jpeg?auto=compress&cs=tinysrgb&w=1600"
          alt="Athletic performance"
          className="w-full h-full object-cover opacity-25"
        />
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(105deg, ${colors.black} 45%, ${colors.black}cc 70%, transparent 100%)`
          }}
        />
      </div>

      <div className={`relative w-full ${spacing.container} py-32`}>
        <div className="max-w-2xl">
          <p className="text-xs font-medium mb-6 uppercase tracking-widest" style={{ color: colors.gray400 }}>
            Sports nutrition · Australia
          </p>

          <h1 className={`${typography.h1} mb-6`}>
            Support Your<br />Training.<br />
            <span style={{ color: colors.red }}>Fuel Active Days.</span>
          </h1>

          <p className="text-base md:text-lg leading-relaxed max-w-lg mb-10" style={{ color: colors.gray400 }}>
            Protein, creatine, pre-workout, and recovery products formulated to support energy, recovery, and wellbeing
            as part of a balanced diet and exercise routine—not a substitute for professional advice.
          </p>

          <div className="flex flex-wrap gap-4">
            <Button variant="primary">Shop Now</Button>
            <Button variant="secondary">Explore Products</Button>
          </div>
        </div>
      </div>
    </section>
  );
}

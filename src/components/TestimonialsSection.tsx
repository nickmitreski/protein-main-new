import { Link } from 'react-router-dom';
import { colors, spacing, layout, typography } from '../utils/design-system';
import StarRating from './StarRating';

/** Illustrative feedback only—not a guarantee of outcomes. */
const testimonials = [
  {
    name: 'Jake M.',
    location: 'VIC',
    text: 'The chocolate whey mixes easily and tastes good. I use it after training to help hit my protein goals.',
    product: 'Whey Protein Isolate',
    rating: 5,
  },
  {
    name: 'Sarah L.',
    location: 'NSW',
    text: 'The pre-workout helps me feel alert before early sessions. I follow the label and don’t exceed the serve size.',
    product: 'Pre-Workout Complex',
    rating: 5,
  },
  {
    name: 'Tom R.',
    location: 'QLD',
    text: 'Creatine is straightforward—no grit, dissolves fine. I pair it with my usual strength program.',
    product: 'Creatine Monohydrate',
    rating: 4,
  },
  {
    name: 'Priya K.',
    location: 'WA',
    text: 'Plant protein flavour is better than others I’ve tried. Good option while I’m eating mostly plant-based.',
    product: 'Plant Protein Blend',
    rating: 5,
  },
  {
    name: 'Daniel W.',
    location: 'SA',
    text: 'BCAA drink is easy to sip between sessions. I like having something light on heavy training weeks.',
    product: 'BCAA Recovery',
    rating: 4,
  },
  {
    name: 'Mia T.',
    location: 'TAS',
    text: 'Meal replacement shake is convenient on busy days. Macros are listed clearly on the tub.',
    product: 'Meal Replacement',
    rating: 5,
  },
];

export default function TestimonialsSection() {
  return (
    <section className={spacing.section} style={{ backgroundColor: colors.black }} id="reviews">
      <div className={spacing.container}>
        <div className="mb-16">
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-4"
            style={{ color: colors.red, letterSpacing: '0.15em' }}
          >
            Reviews
          </p>
          <h2 className={`${typography.h2} text-white`} style={{ lineHeight: '1.1' }}>
            What customers say
          </h2>
          <p className="text-sm mt-4 max-w-2xl" style={{ color: colors.gray400 }}>
            Individual experiences vary. These comments are opinions only—not medical claims or promised outcomes.{' '}
            <Link to="/supplement-disclaimer" className="underline hover:text-white">
              Read our disclaimer
            </Link>
            .
          </p>
        </div>

        <div className={`${layout.grid3} ${spacing.gap}`}>
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="flex flex-col gap-4 p-8 border"
              style={{ borderColor: colors.gray700, backgroundColor: colors.darkGrey }}
            >
              <StarRating rating={t.rating} size={13} />
              <p
                className="text-sm leading-relaxed flex-1"
                style={{ color: colors.gray400, lineHeight: '1.75' }}
              >
                "{t.text}"
              </p>
              <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: colors.gray700 }}>
                <div>
                  <p className="text-sm font-semibold text-white">{t.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: colors.gray500 }}>{t.location}</p>
                </div>
                <span
                  className="text-xs font-medium px-2.5 py-1 border"
                  style={{ color: colors.red, borderColor: colors.redDark, letterSpacing: '0.06em' }}
                >
                  {t.product}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

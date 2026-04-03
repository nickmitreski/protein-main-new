import { Link } from 'react-router-dom';
import { colors, spacing, layout } from '../utils/design-system';
import { CATEGORY_STRIP_ITEMS } from '../data/categoryStrip';
import { useCategoryStripImages } from '../hooks/useCategoryStripImages';

export default function CategoryStrip() {
  const imageByKey = useCategoryStripImages();

  return (
    <section className="py-14" style={{ backgroundColor: colors.white, borderBottom: `1px solid ${colors.lightGrey}` }}>
      <div className={spacing.container}>
        <p className="text-center text-sm mb-10" style={{ color: colors.gray500 }}>
          Everything you need to build muscle, boost endurance, and recover faster.
        </p>
        <div className={`${layout.grid6} gap-4`}>
          {CATEGORY_STRIP_ITEMS.map((cat) => (
            <Link
              key={cat.key}
              to={cat.to}
              className="group flex flex-col overflow-hidden border transition-all duration-200 hover:border-black"
              style={{ borderColor: colors.lightGrey, backgroundColor: colors.white }}
            >
              <div className="aspect-square overflow-hidden" style={{ backgroundColor: colors.lightGrey }}>
                <img
                  src={imageByKey[cat.key] ?? cat.fallbackImage}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              </div>
              <div className="py-3 px-2">
                <h3 className="text-xs font-semibold text-center uppercase leading-tight" style={{ color: colors.black, letterSpacing: '0.07em' }}>
                  {cat.name}
                </h3>
                <p className="text-xs text-center mt-0.5" style={{ color: colors.gray500 }}>
                  {cat.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

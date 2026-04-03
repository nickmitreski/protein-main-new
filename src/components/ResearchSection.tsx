import { useState } from 'react';
import { researchCompounds } from '../data/products';
import { colors, spacing, layout, components, typography } from '../utils/design-system';

type FilterType = 'Recovery' | 'Cognitive' | 'Metabolic' | 'Performance';

const filterMapping: Record<FilterType, string> = {
  Recovery: 'Tissue Regeneration',
  Cognitive: 'Cognitive & Neurological',
  Metabolic: 'Metabolic Research',
  Performance: 'Performance Biology'
};

const filters: FilterType[] = ['Recovery', 'Cognitive', 'Metabolic', 'Performance'];

export default function ResearchSection() {
  const [activeFilter, setActiveFilter] = useState<FilterType>('Recovery');

  const filteredCompounds = researchCompounds.filter(
    (compound) => compound.collection === filterMapping[activeFilter]
  );

  return (
    <section className={spacing.section} style={{ backgroundColor: colors.black }} id="research">
      <div className={spacing.container}>
        <div className={spacing.headingMargin}>
          <p
            className="text-xs font-semibold uppercase mb-4"
            style={{ color: colors.red, letterSpacing: '0.14em' }}
          >
            Ingredient education
          </p>
          <h2 className={`${typography.h2} text-white mb-4`}>Ingredient education</h2>
          <p className="text-base max-w-2xl" style={{ color: colors.gray400 }}>
            These topics are for general learning only. They are not product claims, dosing advice, or indications to
            treat any condition. Products available for purchase are listed in the shop—each has its own label,
            ingredients, and directions.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 mb-12">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className="px-5 py-2.5 text-xs font-semibold uppercase transition-all duration-200"
              style={{
                letterSpacing: '0.1em',
                backgroundColor: activeFilter === filter ? colors.white : 'transparent',
                color: activeFilter === filter ? colors.black : colors.gray400,
                border: `1px solid ${activeFilter === filter ? colors.white : colors.gray700}`,
              }}
            >
              {filter}
            </button>
          ))}
        </div>

        <div className={`${layout.grid3} ${spacing.gap}`}>
          {filteredCompounds.map((compound) => (
            <div
              key={compound.id}
              className={`${components.cardDark} overflow-hidden group cursor-pointer`}
            >
              <div className="aspect-[4/3] overflow-hidden" style={{ backgroundColor: colors.gray900 }}>
                <img
                  src={compound.image}
                  alt={compound.name}
                  className={`${components.image} opacity-60 group-hover:opacity-80 transition-opacity duration-300 ${components.imageHover}`}
                />
              </div>
              <div className={spacing.cardPadding}>
                <h3 className="font-semibold text-base text-white mb-3">{compound.name}</h3>
                <div className="flex flex-wrap gap-2">
                  {compound.categories.map((category) => (
                    <span
                      key={category}
                      className="text-xs px-2.5 py-1 border font-medium"
                      style={{
                        color: colors.gray400,
                        borderColor: colors.gray700,
                        letterSpacing: '0.06em'
                      }}
                    >
                      {category}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

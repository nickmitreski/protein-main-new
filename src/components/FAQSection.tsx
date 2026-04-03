import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Minus } from 'lucide-react';
import { colors, spacing, typography } from '../utils/design-system';

const faqs: { question: string; answer: ReactNode }[] = [
  {
    question: 'Are your supplements safe?',
    answer:
      'We work with reputable manufacturers and publish ingredients, allergens, and warnings on each product page. Supplements are not risk-free for everyone. Consult a qualified healthcare professional before use if you are pregnant, nursing, have a medical condition, or take medication—especially with caffeinated products.',
  },
  {
    question: 'How do I choose the right product?',
    answer:
      'Start with your training schedule, dietary gaps, and any advice from your doctor or dietitian. Many customers use protein to support daily intake, creatine alongside resistance training, and pre-workout only when they tolerate caffeine well. Product pages list serve sizes and directions; nothing here is a personal medical recommendation.',
  },
  {
    question: 'Do you ship Australia-wide?',
    answer:
      'Yes, we ship to Australian states and territories. International shipping, if offered, will be shown at checkout. Full details are in our shipping policy.',
  },
  {
    question: 'How long does delivery take?',
    answer:
      'Metro orders often arrive in about 2–4 business days; regional areas may take longer. Timeframes are estimates, not guarantees. See our Shipping & Returns page for the latest information.',
  },
  {
    question: 'Can I return or exchange a product?',
    answer: (
      <>
        Unopened items in original condition may be returned within 30 days subject to our returns policy. Damaged or
        faulty items—contact us with your order number. See{' '}
        <Link to="/shipping-returns" className="underline" style={{ color: colors.black }}>
          Shipping &amp; Returns
        </Link>
        .
      </>
    ),
  },
  {
    question: 'Are your supplements suitable for vegetarians and vegans?',
    answer:
      'Several products are plant-based or free of animal ingredients; always check the ingredients and allergen statements on the specific product page before buying.',
  },
];

export default function FAQSection() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className={spacing.section} style={{ backgroundColor: colors.white }} id="faq">
      <div className={`${spacing.container} max-w-3xl mx-auto`}>
        <div className="text-center mb-16">
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-4"
            style={{ color: colors.red, letterSpacing: '0.15em' }}
          >
            FAQ
          </p>
          <h2 className={typography.h2} style={{ color: colors.black }}>
            Common questions
          </h2>
        </div>

        <div className="flex flex-col divide-y" style={{ borderColor: colors.lightGrey }}>
          {faqs.map((faq, i) => (
            <div key={faq.question}>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                aria-expanded={open === i}
                aria-controls={`faq-answer-${i}`}
                className="w-full flex items-center justify-between py-6 text-left gap-6 transition-colors"
              >
                <span className="text-sm font-semibold" style={{ color: colors.black }}>
                  {faq.question}
                </span>
                {open === i
                  ? <Minus size={16} style={{ color: colors.red, flexShrink: 0 }} />
                  : <Plus size={16} style={{ color: colors.gray400, flexShrink: 0 }} />
                }
              </button>
              {open === i && (
                <div
                  id={`faq-answer-${i}`}
                  className="text-sm leading-relaxed pb-6"
                  style={{ color: colors.gray500 }}
                >
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

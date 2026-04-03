import { Link } from 'react-router-dom';
import { PolicyLayout } from '../../components/legal/PolicyLayout';
import { BUSINESS } from '../../constants/business';
import { colors } from '../../utils/design-system';

function P({ children }: { children: React.ReactNode }) {
  return <p>{children}</p>;
}

function H({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-base font-semibold pt-4" style={{ color: colors.black }}>
      {children}
    </h2>
  );
}

function Ul({ children }: { children: React.ReactNode }) {
  return <ul className="list-disc pl-5 space-y-2">{children}</ul>;
}

export function PrivacyPolicyPage() {
  return (
    <PolicyLayout title="Privacy Policy" updated="31 March 2026">
      <P>
        {BUSINESS.legalName} (“we”, “us”) respects your privacy. This policy explains what we collect, why we collect
        it, and your choices. It applies to this website and orders placed through our checkout (including payments
        processed by our payment partners).
      </P>
      <H>Information we collect</H>
      <Ul>
        <li>Contact and account details (name, email, phone).</li>
        <li>Shipping and billing addresses.</li>
        <li>Order history, cart activity, and support messages.</li>
        <li>Payment is handled by our payment processor; we do not store full card numbers on our servers.</li>
      </Ul>
      <H>How we use information</H>
      <Ul>
        <li>To process and deliver orders, handle returns, and provide support.</li>
        <li>To send transactional emails (order confirmation, shipping updates).</li>
        <li>With your consent, marketing emails; you can unsubscribe at any time.</li>
        <li>To meet legal, accounting, and fraud-prevention obligations.</li>
      </Ul>
      <H>Sharing</H>
      <P>
        We share data with service providers who help us run the store (e.g. hosting, email, payments, shipping
        carriers) only as needed to provide those services, and subject to appropriate safeguards.
      </P>
      <H>Retention</H>
      <P>We keep order and account records for as long as needed to fulfil orders and meet legal requirements.</P>
      <H>Your rights</H>
      <P>
        Depending on applicable law, you may request access to or correction of your personal information. Contact us
        at{' '}
        <a href={`mailto:${BUSINESS.email}`} className="underline" style={{ color: colors.black }}>
          {BUSINESS.email}
        </a>
        .
      </P>
      <H>Contact</H>
      <P>
        {BUSINESS.legalName}
        <br />
        {BUSINESS.addressLines.join(', ')}
        <br />
        Email: {BUSINESS.email} · Phone: {BUSINESS.phoneDisplay}
      </P>
    </PolicyLayout>
  );
}

export function TermsOfServicePage() {
  return (
    <PolicyLayout title="Terms of Service" updated="31 March 2026">
      <P>
        These terms govern your use of this website and purchases from {BUSINESS.legalName} trading as{' '}
        {BUSINESS.tradingName}. By placing an order, you agree to these terms.
      </P>
      <H>Products</H>
      <P>
        We sell foods and dietary supplements for general wellbeing and sports nutrition. Product descriptions,
        labels, and usage directions on each product page apply. Nothing on this site is medical advice.
      </P>
      <H>Orders and pricing</H>
      <P>
        Prices are in AUD unless stated otherwise. We may correct pricing errors before acceptance. We reserve the
        right to refuse or cancel orders in cases of error, suspected fraud, or stock unavailability.
      </P>
      <H>Payment</H>
      <P>Payments are processed securely by our third-party payment provider. You authorise us to charge your selected payment method for the order total.</P>
      <H>Risk and title</H>
      <P>Risk of loss passes to you on delivery to the address you provide. Title passes when we receive full payment.</P>
      <H>Limitation</H>
      <P>
        To the maximum extent permitted by Australian law, we are not liable for indirect or consequential loss. Our
        liability for any claim relating to a product is limited to replacing the product or refunding the amount paid
        for that product, in line with our returns policy.
      </P>
      <H>Governing law</H>
      <P>These terms are governed by the laws of New South Wales, Australia.</P>
      <H>Contact</H>
      <P>
        Questions:{' '}
        <a href={`mailto:${BUSINESS.email}`} className="underline" style={{ color: colors.black }}>
          {BUSINESS.email}
        </a>
      </P>
    </PolicyLayout>
  );
}

export function ShippingReturnsPage() {
  return (
    <PolicyLayout title="Shipping & Returns" updated="31 March 2026">
      <H>Shipping (Australia)</H>
      <Ul>
        <li>We ship Australia-wide. International shipping may be offered where stated at checkout.</li>
        <li>
          Typical delivery: metro areas about 2–4 business days; regional areas often 4–7 business days. Times are
          estimates only and not guaranteed.
        </li>
        <li>Standard shipping is free on orders over $100 (before tax), unless we state otherwise on the site.</li>
        <li>Express and other options, if offered, are shown at checkout with estimated timeframes and fees.</li>
      </Ul>
      <H>Order processing</H>
      <P>We aim to dispatch in-stock orders within 1–2 business days. You will receive tracking when your order ships, where available.</P>
      <H>Returns and refunds</H>
      <Ul>
        <li>
          Unopened products in original condition may be returned within 30 days of delivery for a refund or store
          credit, unless the product is excluded (e.g. opened consumables for health and safety).
        </li>
        <li>If a product arrives damaged or faulty, contact us at {BUSINESS.email} with your order number and photos; we will arrange a replacement or refund.</li>
        <li>Refunds are issued to the original payment method where possible and may take several business days to appear.</li>
      </Ul>
      <H>Contact</H>
      <P>
        {BUSINESS.email} · {BUSINESS.phoneDisplay}
        <br />
        <Link to="/privacy-policy" className="underline" style={{ color: colors.black }}>
          Privacy Policy
        </Link>
      </P>
    </PolicyLayout>
  );
}

export function CookiePolicyPage() {
  return (
    <PolicyLayout title="Cookie Policy" updated="31 March 2026">
      <P>We use cookies and similar technologies to run the site, remember preferences, and understand how the store is used.</P>
      <H>Types</H>
      <Ul>
        <li>
          <strong style={{ color: colors.black }}>Essential:</strong> required for security, cart, checkout, and account sessions.
        </li>
        <li>
          <strong style={{ color: colors.black }}>Functional:</strong> remember choices such as region or language where we offer them.
        </li>
        <li>
          <strong style={{ color: colors.black }}>Analytics:</strong> may be used in aggregate to improve the site; you can limit these via browser settings where applicable.
        </li>
      </Ul>
      <P>You can control cookies through your browser. Blocking essential cookies may affect checkout and login.</P>
      <H>Contact</H>
      <P>{BUSINESS.email}</P>
    </PolicyLayout>
  );
}

export function SupplementDisclaimerPage() {
  return (
    <PolicyLayout title="Supplement & health disclaimer" updated="31 March 2026">
      <P>
        <strong style={{ color: colors.black }}>Not medical advice.</strong> Information on this website is for general
        information only. It is not intended to diagnose, treat, cure, or prevent any disease or health condition.
      </P>
      <P>
        <strong style={{ color: colors.black }}>Therapeutic goods.</strong> Statements about our products have not been
        evaluated by the Therapeutic Goods Administration (TGA), unless a specific product is listed on the Australian
        Register of Therapeutic Goods and labelled accordingly.
      </P>
      <P>
        <strong style={{ color: colors.black }}>Individual variation.</strong> Results and experiences differ between
        people. Dietary supplements support general wellbeing and nutrition when used as directed and alongside a balanced
        diet—not as a substitute for varied nutrition or professional care.
      </P>
      <P>
        <strong style={{ color: colors.black }}>Healthcare professional.</strong> Consult a qualified healthcare
        professional before using supplements if you are pregnant, nursing, have a medical condition, or take
        medication—especially stimulant-containing products.
      </P>
      <P>
        <strong style={{ color: colors.black }}>Reviews.</strong> Any customer reviews or testimonials on this site
        reflect individual opinions only and are not claims that you will achieve the same outcome.
      </P>
      <p className="pt-4">
        <Link to="/shop" className="underline font-medium" style={{ color: colors.black }}>
          Continue shopping
        </Link>
      </p>
    </PolicyLayout>
  );
}

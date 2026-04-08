import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Facebook, Instagram, Twitter, Youtube, Dumbbell, LayoutDashboard } from 'lucide-react';
import toast from 'react-hot-toast';
import { colors, spacing } from '../utils/design-system';
import { useAuthStore } from '../store/authStore';
import { BUSINESS } from '../constants/business';
import { useSubscribe } from '../hooks/useSubscribers';

type FooterLink = { label: string; to: string } | { label: string; href: string };

const footerSections: { title: string; links: FooterLink[] }[] = [
  {
    title: 'Shop',
    links: [
      { label: 'Protein Powders', to: '/shop?category=Protein Powders' },
      { label: 'Pre-Workout', to: '/shop?category=Pre-Workout' },
      { label: 'Creatine', to: '/shop?category=Creatine' },
      { label: 'Recovery', to: '/shop?category=Recovery & Performance' },
      { label: 'Stacks & Bundles', to: '/shop?category=Stacks & Bundles' },
      { label: 'All Products', to: '/shop' },
    ]
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '/#about' },
      { label: 'Contact Us', to: '/contact' },
    ]
  },
  {
    title: 'Support',
    links: [
      { label: 'Track order', to: '/orders' },
      { label: 'Shipping & delivery', to: '/shipping-returns' },
      { label: 'Returns & refunds', to: '/shipping-returns' },
      { label: 'FAQs', href: '/#faq' },
    ]
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', to: '/privacy-policy' },
      { label: 'Terms of Service', to: '/terms-of-service' },
      { label: 'Cookie Policy', to: '/cookie-policy' },
      { label: 'Supplement disclaimer', to: '/supplement-disclaimer' },
    ]
  }
];

const socialLinks = [
  { Icon: Facebook, href: 'https://facebook.com', label: 'Facebook' },
  { Icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
  { Icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
  { Icon: Youtube, href: 'https://youtube.com', label: 'YouTube' },
];

export default function Footer() {
  const { user } = useAuthStore();
  const [footerEmail, setFooterEmail] = useState('');
  const subscribe = useSubscribe();

  const handleFooterSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!footerEmail.trim()) return;
    try {
      await subscribe.mutateAsync({ email: footerEmail.trim(), source: 'footer' });
      toast.success("You're subscribed. Check your inbox for offers.");
      setFooterEmail('');
    } catch {
      /* useSubscribe toasts on error */
    }
  };

  return (
    <footer style={{ backgroundColor: colors.darkGrey, color: colors.gray400 }}>
      {/* Newsletter Section */}
      <div style={{ backgroundColor: colors.secondary }}>
        <div className={`${spacing.container} py-12`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">
                Join the CoreForge Community
              </h3>
              <p className="text-gray-300">
                Get offers, training ideas, and product updates. General information only—not personal medical or
                nutrition advice.
              </p>
            </div>
            <div>
              <form className="flex gap-3" onSubmit={handleFooterSubscribe}>
                <input
                  type="email"
                  value={footerEmail}
                  onChange={(e) => setFooterEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  autoComplete="email"
                  className="flex-1 px-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-white"
                  style={{ backgroundColor: colors.white }}
                />
                <button
                  type="submit"
                  disabled={subscribe.isPending}
                  className="px-6 py-3 font-semibold rounded-lg transition-all duration-300 hover:scale-105 disabled:opacity-60"
                  style={{ backgroundColor: colors.primary, color: colors.white }}
                >
                  {subscribe.isPending ? '…' : 'Subscribe'}
                </button>
              </form>
              <p className="text-xs text-gray-300 mt-2">
                By subscribing, you agree to our{' '}
                <Link to="/privacy-policy" className="underline hover:text-white">
                  Privacy Policy
                </Link>{' '}
                and consent to receive updates.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className={`${spacing.container} py-16`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12 mb-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4 group">
              <div
                className="flex items-center justify-center w-12 h-12 rounded-lg"
                style={{ backgroundColor: colors.primary }}
              >
                <Dumbbell className="w-7 h-7 text-white group-hover:scale-110 transition-transform duration-300" />
              </div>
              <span className="text-2xl font-bold text-white">
                CORE<span style={{ color: colors.primary }}>FORGE</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed mb-4">
              Sports nutrition and supplement products formulated to support active lifestyles, training, and general
              wellbeing when used as directed alongside a balanced diet.
            </p>
            <p className="text-xs leading-relaxed mb-6" style={{ color: colors.gray500 }}>
              {BUSINESS.legalName} · ABN {BUSINESS.abn}
            </p>

            {/* Contact Info */}
            <div className="space-y-3" id="contact">
              <p className="text-sm font-semibold mb-3 text-white">Get in Touch</p>
              <Link
                to="/contact"
                className="flex items-center gap-3 group hover:opacity-80 transition-opacity"
              >
                <div
                  className="flex items-center justify-center w-10 h-10 rounded-lg group-hover:scale-110 transition-transform"
                  style={{ backgroundColor: colors.primary }}
                >
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Contact Form</p>
                  <p className="text-xs" style={{ color: colors.gray400 }}>
                    Send us a message
                  </p>
                </div>
              </Link>
            </div>
          </div>

          {/* Footer Links */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-white text-sm font-bold mb-4 uppercase tracking-wider">
                {section.title}
              </h3>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={`${section.title}-${link.label}-${'to' in link ? link.to : link.href}`}>
                    {'to' in link ? (
                      <Link
                        to={link.to}
                        className="text-sm transition-colors duration-200 hover:text-white block"
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <a href={link.href} className="text-sm transition-colors duration-200 hover:text-white block">
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Social Media & Payment Icons */}
        <div className="border-t pt-8 mb-8" style={{ borderColor: colors.gray800 }}>
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Social Links */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-semibold text-white mr-2">Follow Us:</span>
              {socialLinks.map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-300 hover:scale-110"
                  style={{ backgroundColor: colors.gray800 }}
                  aria-label={label}
                >
                  <Icon className="w-5 h-5 text-white" />
                </a>
              ))}
            </div>

            {/* Payment Methods */}
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">We Accept:</span>
              <div className="flex items-center gap-3">
                <div className="px-3 py-2 rounded bg-white text-xs font-semibold" style={{ color: colors.black }}>
                  VISA
                </div>
                <div className="px-3 py-2 rounded bg-white text-xs font-semibold" style={{ color: colors.black }}>
                  MC
                </div>
                <div className="px-3 py-2 rounded bg-white text-xs font-semibold" style={{ color: colors.black }}>
                  AMEX
                </div>
                <div className="px-3 py-2 rounded bg-white text-xs font-semibold" style={{ color: colors.black }}>
                  PayPal
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t pt-8 flex flex-col md:flex-row items-center justify-between gap-4" style={{ borderColor: colors.gray800 }}>
          <p className="text-xs">
            &copy; {new Date().getFullYear()} {BUSINESS.legalName} trading as {BUSINESS.tradingName}. All rights
            reserved.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 text-xs">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.success }} />
              Clear labels &amp; directions
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.success }} />
              Shipped from Australia
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.success }} />
              Published policies
            </span>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-8 pt-8 border-t" style={{ borderColor: colors.gray800 }}>
          <p className="text-xs text-gray-600 leading-relaxed">
            <strong className="text-gray-500">Disclaimer:</strong> These statements have not been evaluated by the
            Therapeutic Goods Administration (TGA). Products are not intended to diagnose, treat, cure, or prevent any
            disease. Experiences vary. Consult a qualified healthcare professional before starting any supplement,
            diet, or exercise program. Website content is general information only.{' '}
            <Link to="/supplement-disclaimer" className="underline hover:text-gray-500">
              Full supplement disclaimer
            </Link>
            .
          </p>
        </div>

        {/* Admin Access */}
        <div className="mt-8 flex justify-center">
          <Link
            to={user?.role === 'admin' ? '/admin' : '/login'}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all duration-200 hover:opacity-80"
            style={{ backgroundColor: colors.gray800, color: colors.gray400 }}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            Store admin login
          </Link>
        </div>
      </div>
    </footer>
  );
}

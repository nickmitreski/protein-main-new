import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, MessageSquare, Send } from 'lucide-react';
import { colors, spacing, typography } from '../../utils/design-system';
import { Button } from '../../components/ui/Button';
import toast from 'react-hot-toast';
import { BUSINESS } from '../../constants/business';

export function ContactPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1500));

    toast.success(
      'Thank you for your message! Our team will get back to you within 1-2 business days.',
      { duration: 5000 }
    );

    setFormData({ name: '', email: '', subject: '', message: '' });
    setIsSubmitting(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div style={{ backgroundColor: colors.primary }} className="text-white py-20">
        <div className={spacing.container}>
          <div className="max-w-2xl">
            <h1 className={`${typography.h1} mb-4`}>Get in Touch</h1>
            <p className={`${typography.body} opacity-90`}>
              Have a question about our products, your order, or general enquiries? We're here to help. Fill out the form below and our team will respond within 1-2 business days.
            </p>
          </div>
        </div>
      </div>

      {/* Contact Form Section */}
      <div className={`${spacing.container} py-16`}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Information */}
          <div className="lg:col-span-1">
            <div className="bg-white p-8 rounded-lg shadow-sm border" style={{ borderColor: colors.gray200 }}>
              <h2 className={`${typography.h3} mb-6`} style={{ color: colors.black }}>
                Contact Information
              </h2>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div
                    className="flex items-center justify-center w-12 h-12 rounded-lg shrink-0"
                    style={{ backgroundColor: colors.gray100 }}
                  >
                    <Mail className="w-5 h-5" style={{ color: colors.primary }} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold mb-1" style={{ color: colors.black }}>
                      Email Us
                    </h3>
                    <a
                      href={`mailto:${BUSINESS.email}`}
                      className="text-sm hover:opacity-70 transition-opacity"
                      style={{ color: colors.primary }}
                    >
                      {BUSINESS.email}
                    </a>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div
                    className="flex items-center justify-center w-12 h-12 rounded-lg shrink-0"
                    style={{ backgroundColor: colors.gray100 }}
                  >
                    <MessageSquare className="w-5 h-5" style={{ color: colors.primary }} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold mb-1" style={{ color: colors.black }}>
                      Response Time
                    </h3>
                    <p className="text-sm" style={{ color: colors.gray600 }}>
                      We typically respond within 1-2 business days
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t" style={{ borderColor: colors.gray200 }}>
                <h3 className="text-sm font-semibold mb-4" style={{ color: colors.black }}>
                  Common Questions
                </h3>
                <ul className="space-y-2 text-sm" style={{ color: colors.gray600 }}>
                  <li>• Order tracking and status</li>
                  <li>• Product information</li>
                  <li>• Shipping and delivery</li>
                  <li>• Returns and refunds</li>
                  <li>• Ingredient and usage queries</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white p-8 lg:p-12 rounded-lg shadow-sm border" style={{ borderColor: colors.gray200 }}>
              <h2 className={`${typography.h3} mb-2`} style={{ color: colors.black }}>
                Send us a Message
              </h2>
              <p className="text-sm mb-8" style={{ color: colors.gray600 }}>
                Fill out the form below and we'll get back to you as soon as possible.
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold mb-2" style={{ color: colors.black }}>
                      Your Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full border px-4 py-3 rounded-lg focus:outline-none focus:ring-2"
                      style={{ borderColor: colors.gray300, color: colors.black }}
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold mb-2" style={{ color: colors.black }}>
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      autoComplete="email"
                      className="w-full border px-4 py-3 rounded-lg focus:outline-none focus:ring-2"
                      style={{ borderColor: colors.gray300, color: colors.black }}
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-semibold mb-2" style={{ color: colors.black }}>
                    Subject *
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full border px-4 py-3 rounded-lg focus:outline-none focus:ring-2"
                    style={{ borderColor: colors.gray300, color: colors.black }}
                  >
                    <option value="">Select a subject...</option>
                    <option value="order">Order Enquiry</option>
                    <option value="product">Product Information</option>
                    <option value="shipping">Shipping & Delivery</option>
                    <option value="returns">Returns & Refunds</option>
                    <option value="ingredients">Ingredients & Usage</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-semibold mb-2" style={{ color: colors.black }}>
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full border px-4 py-3 rounded-lg focus:outline-none focus:ring-2 resize-none"
                    style={{ borderColor: colors.gray300, color: colors.black }}
                    placeholder="Tell us how we can help you..."
                  />
                </div>

                <div className="flex gap-4">
                  <Button type="submit" isLoading={isSubmitting} className="flex-1 md:flex-initial">
                    <Send className="w-4 h-4 mr-2" />
                    Send Message
                  </Button>
                  <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                    Cancel
                  </Button>
                </div>

                <p className="text-xs" style={{ color: colors.gray500 }}>
                  * Required fields. By submitting this form, you agree to our{' '}
                  <a href="/privacy-policy" className="underline hover:opacity-70">
                    Privacy Policy
                  </a>
                  .
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, ArrowRight, Sparkles } from 'lucide-react';

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for personal use and trying out CloudVault.',
    badge: null,
    features: [
      '5 GB Cloud Storage',
      'File Upload & Download',
      'Basic File Sharing',
      'Secure Authentication',
      'Mobile & Desktop Access',
      'Standard Encryption',
    ],
    cta: 'Start Free',
    ctaStyle: 'border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300',
    popular: false,
  },
  {
    name: 'Pro',
    price: '$12',
    period: '/month',
    description: 'For professionals who need advanced sharing and security.',
    badge: 'Most Popular',
    features: [
      '500 GB Cloud Storage',
      'Unlimited File Uploads',
      'Password-Protected Sharing',
      'Expiration-Based Links',
      'Secure Vault Access',
      'Priority Support',
      'Shared With Me Dashboard',
      'Advanced File Analytics',
    ],
    cta: 'Get Started',
    ctaStyle: 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/20 hover:shadow-xl hover:shadow-sky-500/30',
    popular: true,
  },
  {
    name: 'Team',
    price: '$29',
    period: '/user/mo',
    description: 'For teams that need collaboration tools and admin controls.',
    badge: null,
    features: [
      '2 TB Storage per User',
      'Everything in Pro',
      'Team Workspace',
      'Admin Controls & Permissions',
      'Audit Log & Compliance',
      'Custom Branding',
      'SSO & SAML Integration',
      'Dedicated Account Manager',
    ],
    cta: 'Contact Sales',
    ctaStyle: 'border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300',
    popular: false,
  },
];

const PricingSection = () => {
  const [annual, setAnnual] = useState(false);

  return (
    <section id="pricing" className="relative py-24 sm:py-32 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span className="inline-block px-4 py-1.5 bg-emerald-50 border border-emerald-100 rounded-full text-[0.75rem] font-semibold text-emerald-600 tracking-wide uppercase mb-4">
            Pricing
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-extrabold text-slate-900 leading-tight tracking-tight">
            Simple, transparent{' '}
            <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
              pricing
            </span>
          </h2>
          <p className="mt-4 text-lg text-slate-400 max-w-2xl mx-auto">
            Start free. Upgrade when you're ready. No hidden fees, no surprises.
          </p>

          {/* Billing Toggle */}
          <div className="mt-8 flex items-center justify-center gap-3">
            <span className={`text-sm font-medium ${!annual ? 'text-slate-900' : 'text-slate-400'}`}>Monthly</span>
            <button
              onClick={() => setAnnual(!annual)}
              className={`relative w-14 h-7 rounded-full transition-colors duration-300 cursor-pointer ${
                annual ? 'bg-sky-500' : 'bg-slate-200'
              }`}
              aria-label="Toggle annual billing"
            >
              <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-sm transition-all duration-300 ${
                annual ? 'left-8' : 'left-1'
              }`} />
            </button>
            <span className={`text-sm font-medium ${annual ? 'text-slate-900' : 'text-slate-400'}`}>
              Annual
              <span className="ml-1.5 text-[0.7rem] font-semibold text-emerald-500">Save 20%</span>
            </span>
          </div>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative group rounded-2xl p-7 transition-all duration-500 ${
                plan.popular
                  ? 'bg-slate-900 border-2 border-sky-500/30 shadow-2xl shadow-sky-500/10 lg:scale-[1.05] z-10'
                  : 'bg-white border border-slate-150 hover:border-slate-200 hover:shadow-xl hover:shadow-slate-100/50 z-0'
              }`}
            >
              {/* Popular badge */}
              {plan.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-sky-500 to-blue-600 text-white text-[0.7rem] font-bold rounded-full shadow-lg shadow-sky-500/30">
                    <Sparkles size={12} />
                    {plan.badge}
                  </span>
                </div>
              )}

              {/* Plan name */}
              <p className={`text-[0.85rem] font-semibold ${plan.popular ? 'text-sky-400' : 'text-slate-400'} mb-3`}>
                {plan.name}
              </p>

              {/* Price */}
              <div className="flex items-baseline gap-1 mb-2">
                <span className={`text-4xl font-extrabold ${plan.popular ? 'text-white' : 'text-slate-900'}`}>
                  {plan.price === '$0' ? '$0' : annual ? `$${Math.round(parseInt(plan.price.slice(1)) * 0.8)}` : plan.price}
                </span>
                <span className={`text-sm ${plan.popular ? 'text-slate-400' : 'text-slate-400'}`}>
                  {plan.period}
                </span>
              </div>

              {/* Description */}
              <p className={`text-[0.85rem] mb-7 ${plan.popular ? 'text-slate-400' : 'text-slate-400'}`}>
                {plan.description}
              </p>

              {/* CTA */}
              <Link
                to="/auth"
                className={`w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-[0.875rem] font-semibold transition-all duration-300 hover:-translate-y-0.5 mb-7 ${plan.ctaStyle}`}
              >
                {plan.cta}
                <ArrowRight size={16} />
              </Link>

              {/* Features */}
              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      plan.popular ? 'bg-sky-500/20' : 'bg-emerald-50'
                    }`}>
                      <Check size={12} className={plan.popular ? 'text-sky-400' : 'text-emerald-500'} strokeWidth={3} />
                    </div>
                    <span className={`text-[0.85rem] ${plan.popular ? 'text-slate-300' : 'text-slate-600'}`}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;

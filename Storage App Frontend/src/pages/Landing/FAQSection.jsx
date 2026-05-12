import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';

const faqs = [
  {
    question: 'How secure is CloudVault?',
    answer: 'CloudVault uses AES-256 encryption for all files at rest and TLS 1.3 for data in transit. We also offer a dedicated Secure Vault with additional encryption layers for your most sensitive documents. Our authentication system supports Google, GitHub, and email sign-in with industry-standard security.',
  },
  {
    question: 'Can I share files with people who don\'t have an account?',
    answer: 'Yes! You can generate secure share links that anyone can access. For added security, you can add password protection and set expiration dates on shared links. Recipients who sign up will also see shared files in their dedicated "Shared With Me" section.',
  },
  {
    question: 'What file types and sizes are supported?',
    answer: 'CloudVault supports all file types — documents, images, videos, archives, code files, and more. Free plan users can upload files up to 100MB each, while Pro and Team plans support files up to 5GB with our optimized parallel upload system.',
  },
  {
    question: 'Can I access my files from multiple devices?',
    answer: 'Absolutely. CloudVault is a web-based application that works seamlessly on any device with a modern browser — desktops, laptops, tablets, and smartphones. Your files sync instantly and are always accessible.',
  },
  {
    question: 'What happens when a shared link expires?',
    answer: 'When a shared link expires, it automatically becomes inactive and the file is no longer accessible through that link. The original file remains safe in your storage. You can always generate a new share link with updated settings if needed.',
  },
  {
    question: 'Can I upgrade or downgrade my plan anytime?',
    answer: 'Yes, you can upgrade or downgrade your plan at any time from your account settings. When upgrading, you\'ll get immediate access to new features. When downgrading, your current plan remains active until the end of your billing cycle.',
  },
  {
    question: 'Is there a file recovery option if I accidentally delete something?',
    answer: 'Yes! Deleted files are moved to Trash where they remain for 30 days. You can restore any file from Trash within that period. Pro and Team plans include extended retention and version history for additional protection.',
  },
  {
    question: 'Do you offer a free trial for paid plans?',
    answer: 'We offer a generous free plan with 5GB of storage so you can experience CloudVault\'s core features. For Pro features, we offer a 14-day free trial with full access — no credit card required.',
  },
];

const FAQItem = ({ faq, isOpen, onToggle, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 15 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.4, delay: index * 0.05 }}
    className="border-b border-slate-100 last:border-0"
  >
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between py-5 sm:py-6 text-left cursor-pointer group"
      aria-expanded={isOpen}
    >
      <span className={`text-[0.95rem] sm:text-base font-semibold pr-4 transition-colors duration-200 ${
        isOpen ? 'text-sky-600' : 'text-slate-800 group-hover:text-slate-900'
      }`}>
        {faq.question}
      </span>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
        isOpen ? 'bg-sky-50 rotate-0' : 'bg-slate-50 group-hover:bg-slate-100'
      }`}>
        {isOpen ? (
          <Minus size={16} className="text-sky-500" strokeWidth={2.5} />
        ) : (
          <Plus size={16} className="text-slate-400" strokeWidth={2.5} />
        )}
      </div>
    </button>
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="overflow-hidden"
        >
          <p className="pb-6 text-[0.9rem] leading-relaxed text-slate-400 pr-12">
            {faq.answer}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  </motion.div>
);

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section id="faq" className="relative py-24 sm:py-32 bg-gradient-to-b from-white to-slate-50/50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span className="inline-block px-4 py-1.5 bg-slate-100 border border-slate-200 rounded-full text-[0.75rem] font-semibold text-slate-500 tracking-wide uppercase mb-4">
            FAQ
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight tracking-tight">
            Frequently asked questions
          </h2>
          <p className="mt-4 text-lg text-slate-400">
            Can't find what you're looking for?{' '}
            <a href="mailto:support@cloudvault.io" className="text-sky-500 hover:text-sky-600 font-medium transition-colors">
              Contact our team
            </a>
          </p>
        </motion.div>

        {/* FAQ Items */}
        <div className="bg-white rounded-2xl border border-slate-100 divide-slate-100 px-6 sm:px-8 shadow-sm">
          {faqs.map((faq, index) => (
            <FAQItem
              key={index}
              faq={faq}
              index={index}
              isOpen={openIndex === index}
              onToggle={() => setOpenIndex(openIndex === index ? -1 : index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;

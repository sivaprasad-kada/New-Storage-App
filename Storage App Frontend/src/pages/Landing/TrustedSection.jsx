import React from 'react';
import { motion } from 'framer-motion';

const companies = ['Startups', 'Creators', 'Agencies', 'Teams', 'Enterprises'];

const TrustedSection = () => {
  return (
    <section className="relative py-12 lg:py-16 bg-white border-t border-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Trusted By */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <p className="text-center text-[0.7rem] font-semibold tracking-[0.2em] uppercase text-slate-300 mb-8">
            Empowering teams at the world's most innovative companies
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 sm:gap-14">
            {companies.map((company, i) => (
              <motion.span
                key={company}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.1 * i }}
                className="text-[0.95rem] sm:text-lg font-bold text-slate-200 hover:text-slate-400 transition-colors duration-300 tracking-widest uppercase cursor-default select-none"
              >
                {company}
              </motion.span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TrustedSection;

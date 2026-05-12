import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Product Manager',
    company: 'TechForge Inc.',
    avatar: 'SC',
    avatarBg: 'bg-sky-500',
    content: 'CloudVault completely transformed how our team handles project files. The sharing workflow is incredibly intuitive — we went from scattered Google Drive links to organized, secure file sharing in a single afternoon.',
    rating: 5,
  },
  {
    name: 'Marcus Rodriguez',
    role: 'Freelance Designer',
    company: 'Self-employed',
    avatar: 'MR',
    avatarBg: 'bg-violet-500',
    content: 'As a freelancer sending large design files to clients daily, the expiration-based sharing is a game-changer. I set a 7-day window and never worry about old files floating around. Plus, the upload speed is insane.',
    rating: 5,
  },
  {
    name: 'Emily Watson',
    role: 'CTO',
    company: 'DataStream Labs',
    avatar: 'EW',
    avatarBg: 'bg-emerald-500',
    content: 'We evaluated Dropbox, Box, and several others before landing on CloudVault. The secure vault feature and granular sharing permissions won us over. Our compliance team loves the audit trail.',
    rating: 5,
  },
  {
    name: 'David Park',
    role: 'Startup Founder',
    company: 'NexGen AI',
    avatar: 'DP',
    avatarBg: 'bg-amber-500',
    content: 'The clean UI alone is worth switching for. But the real magic is how fast everything feels — uploads, downloads, sharing. Our entire 15-person team migrated in under a day with zero friction.',
    rating: 5,
  },
  {
    name: 'Lisa Nguyen',
    role: 'Marketing Director',
    company: 'GrowthPilot',
    avatar: 'LN',
    avatarBg: 'bg-rose-500',
    content: 'I\'ve tried dozens of storage solutions. CloudVault stands out because it doesn\'t try to do everything — it does file management and sharing perfectly. The UI is gorgeous and the experience is buttery smooth.',
    rating: 5,
  },
  {
    name: 'James Mitchell',
    role: 'Engineering Lead',
    company: 'CloudScale Systems',
    avatar: 'JM',
    avatarBg: 'bg-indigo-500',
    content: 'The authentication options are fantastic — Google, GitHub, and email. Our dev team appreciates the technical polish. This feels like a product built by engineers who actually use their own product.',
    rating: 5,
  },
];

const TestimonialsSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const visibleCount = 3;

  const canGoPrev = activeIndex > 0;
  const canGoNext = activeIndex < testimonials.length - visibleCount;

  return (
    <section id="testimonials" className="relative py-24 sm:py-32 bg-gradient-to-b from-white via-slate-50/50 to-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span className="inline-block px-4 py-1.5 bg-amber-50 border border-amber-100 rounded-full text-[0.75rem] font-semibold text-amber-600 tracking-wide uppercase mb-4">
            Testimonials
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-extrabold text-slate-900 leading-tight tracking-tight">
            Loved by teams{' '}
            <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
              everywhere
            </span>
          </h2>
          <p className="mt-4 text-lg text-slate-400 max-w-2xl mx-auto">
            Don't just take our word for it. Here's what our users have to say.
          </p>
        </motion.div>

        {/* Navigation */}
        <div className="flex justify-end gap-2 mb-6">
          <button
            onClick={() => canGoPrev && setActiveIndex(activeIndex - 1)}
            disabled={!canGoPrev}
            className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all duration-200 ${
              canGoPrev
                ? 'border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 cursor-pointer'
                : 'border-slate-100 text-slate-300 cursor-not-allowed'
            }`}
            aria-label="Previous testimonials"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => canGoNext && setActiveIndex(activeIndex + 1)}
            disabled={!canGoNext}
            className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all duration-200 ${
              canGoNext
                ? 'border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 cursor-pointer'
                : 'border-slate-100 text-slate-300 cursor-not-allowed'
            }`}
            aria-label="Next testimonials"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Testimonials Grid */}
        <div className="overflow-hidden">
          <motion.div
            className="flex gap-5"
            animate={{ x: `-${activeIndex * (100 / visibleCount + 1.5)}%` }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                className="flex-shrink-0 w-full sm:w-[calc(50%-10px)] lg:w-[calc(33.333%-14px)]"
              >
                <div className="group bg-white rounded-2xl border border-slate-100 p-7 h-full hover:border-slate-200 hover:shadow-xl hover:shadow-slate-100/50 transition-all duration-500">
                  {/* Quote icon */}
                  <Quote size={28} className="text-slate-100 mb-4" />

                  {/* Content */}
                  <p className="text-[0.925rem] leading-relaxed text-slate-600 mb-6">
                    "{testimonial.content}"
                  </p>

                  {/* Stars */}
                  <div className="flex gap-1 mb-5">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} size={14} className="text-amber-400" fill="currentColor" />
                    ))}
                  </div>

                  {/* Author */}
                  <div className="flex items-center gap-3 pt-5 border-t border-slate-50">
                    <div className={`w-10 h-10 rounded-full ${testimonial.avatarBg} flex items-center justify-center text-[0.7rem] font-bold text-white`}>
                      {testimonial.avatar}
                    </div>
                    <div>
                      <p className="text-[0.875rem] font-semibold text-slate-800">{testimonial.name}</p>
                      <p className="text-[0.75rem] text-slate-400">
                        {testimonial.role} · {testimonial.company}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Dots indicator */}
        <div className="flex justify-center gap-1.5 mt-8">
          {Array.from({ length: testimonials.length - visibleCount + 1 }, (_, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === activeIndex ? 'w-8 bg-sky-500' : 'w-1.5 bg-slate-200 hover:bg-slate-300'
              }`}
              aria-label={`Go to testimonial group ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;

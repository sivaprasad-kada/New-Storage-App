import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Zap, Shield, Layers, Users, Lock, BarChart3 } from 'lucide-react';

const advantages = [
  {
    icon: Zap,
    title: 'Blazing Fast Performance',
    description: 'Optimized CDN delivery and parallel uploads ensure your files transfer at maximum speed, every time.',
    metric: '3x faster',
    metricLabel: 'than traditional storage',
    gradient: 'from-amber-500 to-orange-500',
    bgGlow: 'bg-amber-500/10',
    iconBg: 'bg-gradient-to-br from-amber-500/20 to-orange-500/10',
    iconColor: 'text-amber-500',
    borderHover: 'hover:border-amber-200/50',
    size: 'lg', // large card
  },
  {
    icon: Shield,
    title: 'Military-Grade Security',
    description: 'AES-256 encryption, secure vault, and password-protected shares keep your data impenetrable.',
    metric: '256-bit',
    metricLabel: 'encryption standard',
    gradient: 'from-sky-500 to-blue-500',
    bgGlow: 'bg-sky-500/10',
    iconBg: 'bg-gradient-to-br from-sky-500/20 to-blue-500/10',
    iconColor: 'text-sky-400',
    borderHover: 'hover:border-sky-300/50',
    size: 'sm',
  },
  {
    icon: Layers,
    title: 'Intuitive Simplicity',
    description: 'No bloated interfaces or steep learning curves. Start managing files in under 60 seconds.',
    metric: '< 60s',
    metricLabel: 'to get started',
    gradient: 'from-violet-500 to-purple-500',
    bgGlow: 'bg-violet-500/10',
    iconBg: 'bg-gradient-to-br from-violet-500/20 to-purple-500/10',
    iconColor: 'text-violet-400',
    borderHover: 'hover:border-violet-300/50',
    size: 'sm',
  },
  {
    icon: Users,
    title: 'Seamless Collaboration',
    description: 'Share files with teammates or clients through secure links with granular access controls.',
    metric: '1-click',
    metricLabel: 'sharing workflow',
    gradient: 'from-emerald-500 to-teal-500',
    bgGlow: 'bg-emerald-500/10',
    iconBg: 'bg-gradient-to-br from-emerald-500/20 to-teal-500/10',
    iconColor: 'text-emerald-400',
    borderHover: 'hover:border-emerald-300/50',
    size: 'sm',
  },
  {
    icon: Lock,
    title: 'Privacy-First Design',
    description: 'Your files are yours. Zero-knowledge architecture means only you can access your data.',
    metric: '100%',
    metricLabel: 'data ownership',
    gradient: 'from-rose-500 to-pink-500',
    bgGlow: 'bg-rose-500/10',
    iconBg: 'bg-gradient-to-br from-rose-500/20 to-pink-500/10',
    iconColor: 'text-rose-400',
    borderHover: 'hover:border-rose-300/50',
    size: 'lg',
  },
  {
    icon: BarChart3,
    title: 'Smart Storage Insights',
    description: 'Visual analytics show exactly how your storage is used, helping you stay organized and efficient.',
    metric: 'Real-time',
    metricLabel: 'usage analytics',
    gradient: 'from-cyan-500 to-sky-500',
    bgGlow: 'bg-cyan-500/10',
    iconBg: 'bg-gradient-to-br from-cyan-500/20 to-sky-500/10',
    iconColor: 'text-cyan-400',
    borderHover: 'hover:border-cyan-300/50',
    size: 'sm',
  },
];

// Bento grid positions
const bentoLayout = [
  'lg:col-span-2 lg:row-span-1',  // Blazing Fast — wide
  'lg:col-span-1 lg:row-span-1',  // Security
  'lg:col-span-1 lg:row-span-1',  // Simplicity
  'lg:col-span-1 lg:row-span-1',  // Collaboration
  'lg:col-span-2 lg:row-span-1',  // Privacy — wide
  'lg:col-span-1 lg:row-span-1',  // Analytics
];

const BentoCard = ({ item, index, layoutClass, scrollYProgress }) => {
  const isWide = layoutClass.includes('col-span-2');

  // Subtle parallax effect
  const yParallax = useTransform(
    scrollYProgress,
    [0, 1],
    index % 2 === 0 ? [40, -40] : [-40, 40]
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: index * 0.07 }}
      className={`group relative rounded-2xl border border-slate-700/40 backdrop-blur-sm overflow-hidden transition-all duration-500 ${item.borderHover} hover:shadow-2xl hover:shadow-black/20 ${layoutClass}`}
      style={{
        y: yParallax,
        background: 'linear-gradient(135deg, rgba(30,41,59,0.7) 0%, rgba(15,23,42,0.9) 100%)',
      }}
    >
      {/* Subtle gradient border shimmer on hover */}
      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-[0.06] transition-opacity duration-700`} />

      {/* Content */}
      <div className={`relative p-7 ${isWide ? 'sm:p-8 flex flex-col sm:flex-row sm:items-center sm:gap-8' : ''}`}>
        <div className={isWide ? 'flex-shrink-0 mb-5 sm:mb-0' : ''}>
          {/* Icon */}
          <div className={`w-12 h-12 rounded-xl ${item.iconBg} border border-white/5 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:border-white/10 transition-all duration-300`}>
            <item.icon size={22} className={item.iconColor} strokeWidth={1.8} />
          </div>

          {/* Metric pill */}
          <div className="flex items-baseline gap-2 mb-4">
            <span className={`text-xl font-extrabold bg-gradient-to-r ${item.gradient} bg-clip-text text-transparent`}>
              {item.metric}
            </span>
            <span className="text-[0.7rem] text-slate-500 font-medium">{item.metricLabel}</span>
          </div>
        </div>

        <div>
          <h3 className="text-[1.1rem] font-bold text-white mb-2.5 group-hover:text-white/95 transition-colors">
            {item.title}
          </h3>
          <p className="text-[0.85rem] leading-relaxed text-slate-400 group-hover:text-slate-300/90 transition-colors">
            {item.description}
          </p>
        </div>
      </div>

      {/* Bottom gradient line */}
      <div className={`absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r ${item.gradient} opacity-0 group-hover:opacity-60 transition-all duration-500 transform scale-x-0 group-hover:scale-x-100`} />
    </motion.div>
  );
};

const WhyChooseSection = () => {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  return (
    <section ref={sectionRef} className="relative py-24 sm:py-32 bg-slate-900 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-sky-500/[0.04] rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-violet-500/[0.03] rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-blue-500/[0.02] rounded-full blur-[150px]" />
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: 'radial-gradient(circle, #94a3b8 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 sm:mb-20"
        >
          <span className="inline-block px-4 py-1.5 bg-sky-500/10 border border-sky-500/20 rounded-full text-[0.75rem] font-semibold text-sky-400 tracking-wide uppercase mb-5">
            Why CloudVault
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-extrabold text-white leading-tight tracking-tight">
            Built different.{' '}
            <span className="bg-gradient-to-r from-sky-400 to-blue-400 bg-clip-text text-transparent">
              Built better.
            </span>
          </h2>
          <p className="mt-5 text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            We didn't just build another file storage tool. We rethought how teams and individuals interact with their data.
          </p>
        </motion.div>

        {/* Bento Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {advantages.map((item, index) => (
            <BentoCard
              key={item.title}
              item={item}
              index={index}
              layoutClass={bentoLayout[index]}
              scrollYProgress={scrollYProgress}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseSection;

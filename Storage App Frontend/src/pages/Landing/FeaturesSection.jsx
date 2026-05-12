import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  Cloud,
  Upload,
  Share2,
  UserCheck,
  Send,
  FileEdit,
  Monitor,
  ShieldCheck,
  Clock,
} from 'lucide-react';

const features = [
  {
    icon: Cloud,
    title: 'Secure Cloud Storage',
    description: 'Store your files with enterprise-grade encryption. Your data stays protected with AES-256 encryption at rest and in transit.',
    gradient: 'from-sky-500 to-blue-600',
    bgLight: 'bg-sky-50',
    iconColor: 'text-sky-500',
    accentBorder: 'group-hover:border-sky-200',
    glowColor: 'group-hover:shadow-sky-100/60',
    tag: 'Core',
  },
  {
    icon: Upload,
    title: 'Lightning Fast Uploads',
    description: 'Drag-and-drop or click to upload. Our optimized pipeline handles files of any size with resumable, parallel uploads.',
    gradient: 'from-emerald-500 to-teal-600',
    bgLight: 'bg-emerald-50',
    iconColor: 'text-emerald-500',
    accentBorder: 'group-hover:border-emerald-200',
    glowColor: 'group-hover:shadow-emerald-100/60',
    tag: 'Speed',
  },
  {
    icon: Share2,
    title: 'Instant File Sharing',
    description: 'Generate secure share links with password protection and expiration controls. Share with anyone, anywhere.',
    gradient: 'from-violet-500 to-purple-600',
    bgLight: 'bg-violet-50',
    iconColor: 'text-violet-500',
    accentBorder: 'group-hover:border-violet-200',
    glowColor: 'group-hover:shadow-violet-100/60',
    tag: 'Share',
  },
  {
    icon: UserCheck,
    title: 'Shared With Me',
    description: 'Access files others have shared with you in a dedicated, organized view. No clutter, just the files you need.',
    gradient: 'from-amber-500 to-orange-600',
    bgLight: 'bg-amber-50',
    iconColor: 'text-amber-500',
    accentBorder: 'group-hover:border-amber-200',
    glowColor: 'group-hover:shadow-amber-100/60',
    tag: 'Collaborate',
  },
  {
    icon: Send,
    title: 'Shared By Me',
    description: 'Track and manage every file you\'ve shared. Revoke access, update permissions, or extend sharing — all in one place.',
    gradient: 'from-rose-500 to-pink-600',
    bgLight: 'bg-rose-50',
    iconColor: 'text-rose-500',
    accentBorder: 'group-hover:border-rose-200',
    glowColor: 'group-hover:shadow-rose-100/60',
    tag: 'Manage',
  },
  {
    icon: FileEdit,
    title: 'Full File Control',
    description: 'Rename, download, delete, and organize your files with a powerful context menu. Complete control at your fingertips.',
    gradient: 'from-cyan-500 to-sky-600',
    bgLight: 'bg-cyan-50',
    iconColor: 'text-cyan-500',
    accentBorder: 'group-hover:border-cyan-200',
    glowColor: 'group-hover:shadow-cyan-100/60',
    tag: 'Control',
  },
  {
    icon: Monitor,
    title: 'Cross-Device Access',
    description: 'Access your vault from any device — desktop, tablet, or mobile. Your files sync seamlessly across all platforms.',
    gradient: 'from-indigo-500 to-blue-600',
    bgLight: 'bg-indigo-50',
    iconColor: 'text-indigo-500',
    accentBorder: 'group-hover:border-indigo-200',
    glowColor: 'group-hover:shadow-indigo-100/60',
    tag: 'Sync',
  },
  {
    icon: ShieldCheck,
    title: 'Secure Authentication',
    description: 'Sign in with email, Google, or GitHub. Multi-factor authentication keeps your account safe from unauthorized access.',
    gradient: 'from-teal-500 to-emerald-600',
    bgLight: 'bg-teal-50',
    iconColor: 'text-teal-500',
    accentBorder: 'group-hover:border-teal-200',
    glowColor: 'group-hover:shadow-teal-100/60',
    tag: 'Auth',
  },
  {
    icon: Clock,
    title: 'Expiration-Based Sharing',
    description: 'Set auto-expiring links that self-destruct after your chosen timeframe. Perfect for sensitive document sharing.',
    gradient: 'from-fuchsia-500 to-purple-600',
    bgLight: 'bg-fuchsia-50',
    iconColor: 'text-fuchsia-500',
    accentBorder: 'group-hover:border-fuchsia-200',
    glowColor: 'group-hover:shadow-fuchsia-100/60',
    tag: 'Secure',
  },
];

// Bento grid layout classes
const bentoCells = [
  'sm:col-span-2 lg:col-span-2 lg:row-span-2',   // 0 — Secure Storage (hero card)
  'sm:col-span-1 lg:col-span-1',                   // 1 — Uploads
  'sm:col-span-1 lg:col-span-1',                   // 2 — Sharing
  'sm:col-span-1 lg:col-span-1',                   // 3 — Shared With Me
  'sm:col-span-1 lg:col-span-1',                   // 4 — Shared By Me
  'sm:col-span-2 lg:col-span-2',                   // 5 — File Control (wide)
  'sm:col-span-1 lg:col-span-1',                   // 6 — Cross Device
  'sm:col-span-1 lg:col-span-1',                   // 7 — Auth
  'sm:col-span-2 lg:col-span-2',                   // 8 — Expiration (wide)
];

const FeatureCard = ({ feature, index, layoutClass, scrollYProgress }) => {
  const isHero = index === 0;
  const isWide = layoutClass.includes('col-span-2') && !isHero;

  // Add subtle parallax based on scroll
  const yParallax = useTransform(
    scrollYProgress,
    [0, 1],
    isHero ? [0, 0] : (index % 2 === 0 ? [30, -30] : [-30, 30])
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      style={{ y: yParallax }}
      className={`group relative bg-white rounded-2xl border border-slate-100 overflow-hidden transition-all duration-500 cursor-default ${feature.accentBorder} hover:shadow-xl ${feature.glowColor} ${layoutClass}`}
    >
      {/* Gradient hover overlay */}
      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500`} />

      {/* Gradient border accent — top */}
      <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-80 transition-all duration-500 transform scale-x-0 group-hover:scale-x-100 origin-left`} />

      <div className={`relative ${isHero ? 'p-8 sm:p-10' : 'p-6 sm:p-7'} ${isWide ? 'flex flex-col sm:flex-row sm:items-center sm:gap-6' : ''} h-full`}>
        <div className={`${isWide ? 'flex-shrink-0' : ''}`}>
          {/* Tag */}
          <span className={`inline-block px-2.5 py-1 text-[0.6rem] font-bold uppercase tracking-widest bg-gradient-to-r ${feature.gradient} bg-clip-text text-transparent border border-slate-100 rounded-full mb-4 group-hover:border-slate-200 transition-colors`}>
            {feature.tag}
          </span>

          {/* Icon */}
          <div className={`${isHero ? 'w-14 h-14' : 'w-12 h-12'} rounded-xl ${feature.bgLight} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
            <feature.icon size={isHero ? 26 : 22} className={feature.iconColor} strokeWidth={1.8} />
          </div>
        </div>

        <div>
          {/* Title */}
          <h3 className={`${isHero ? 'text-xl' : 'text-[1.05rem]'} font-bold text-slate-800 mb-2.5 group-hover:text-slate-900 transition-colors`}>
            {feature.title}
          </h3>

          {/* Description */}
          <p className={`${isHero ? 'text-[0.925rem]' : 'text-[0.85rem]'} leading-relaxed text-slate-400 group-hover:text-slate-500 transition-colors`}>
            {feature.description}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

const FeaturesSection = () => {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  return (
    <section ref={sectionRef} id="features" className="relative py-24 sm:py-32 bg-gradient-to-b from-white via-slate-50/30 to-white overflow-hidden">
      {/* Subtle background accents */}
      <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] bg-sky-50/50 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-[10%] left-[-8%] w-[350px] h-[350px] bg-violet-50/40 rounded-full blur-[100px] -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 sm:mb-20"
        >
          <span className="inline-block px-4 py-1.5 bg-sky-50 border border-sky-100 rounded-full text-[0.75rem] font-semibold text-sky-600 tracking-wide uppercase mb-5">
            Features
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-extrabold text-slate-900 leading-tight tracking-tight">
            Everything you need to{' '}
            <span className="bg-gradient-to-r from-sky-500 to-blue-600 bg-clip-text text-transparent">
              own your data
            </span>
          </h2>
          <p className="mt-5 text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Powerful features designed to make file management effortless and security impenetrable.
          </p>
        </motion.div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {features.map((feature, index) => (
            <FeatureCard
              key={feature.title}
              feature={feature}
              index={index}
              layoutClass={bentoCells[index]}
              scrollYProgress={scrollYProgress}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;

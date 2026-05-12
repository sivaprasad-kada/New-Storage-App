import React from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Play, Cloud, CheckCircle } from 'lucide-react';
import heroIllustration from '../../assets/landing/hero-cloud-3d.png';

const HeroSection = () => {
  const { scrollY } = useScroll();
  const yBg1 = useTransform(scrollY, [0, 1000], [0, 200]);
  const yBg2 = useTransform(scrollY, [0, 1000], [0, -150]);
  const yImage = useTransform(scrollY, [0, 1000], [0, 80]);
  const yCard1 = useTransform(scrollY, [0, 1000], [0, 120]);
  const yCard2 = useTransform(scrollY, [0, 1000], [0, 40]);
  const yCard3 = useTransform(scrollY, [0, 1000], [0, 100]);

  return (
    <section className="relative overflow-hidden pt-[72px]">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-white to-white" />
        <motion.div style={{ y: yBg1 }} className="absolute top-[-15%] right-[-10%] w-[700px] h-[700px] bg-sky-100/40 rounded-full blur-[140px]" />
        <motion.div style={{ y: yBg2 }} className="absolute bottom-[5%] left-[-8%] w-[500px] h-[500px] bg-indigo-50/30 rounded-full blur-[120px]" />
        <div className="absolute top-[30%] left-[40%] w-[300px] h-[300px] bg-blue-50/20 rounded-full blur-[100px]" />
        <div
          className="absolute inset-0 opacity-[0.018]"
          style={{
            backgroundImage: 'radial-gradient(circle, #475569 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 lg:pt-20 pb-16 lg:pb-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* Left — Text Content */}
          <div className="max-w-xl mx-auto lg:mx-0 text-center lg:text-left">
            {/* Micro badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-7 flex justify-center lg:justify-start"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-sky-50/80 border border-sky-100 rounded-full">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[0.75rem] font-semibold text-sky-700 tracking-wide uppercase">
                  New: Quantum Encryption Now Live
                </span>
              </div>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.08 }}
              className="text-4xl sm:text-5xl lg:text-[3.5rem] xl:text-[3.75rem] font-extrabold text-slate-900 leading-[1.08] tracking-tight"
            >
              Secure Cloud
              <br />
              Storage Built for
              <br />
              <span className="relative inline-block">
                <span className="relative z-10 bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-500 bg-clip-text text-transparent italic">
                  Modern Digital Life
                </span>
                <motion.span
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.8, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute bottom-1 left-0 right-0 h-3 bg-sky-100/50 rounded-sm -z-0 origin-left"
                />
              </span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.16 }}
              className="mt-6 text-lg sm:text-xl text-slate-500 leading-relaxed max-w-lg"
            >
              Upload, organize, sync, and protect your files from anywhere with
              lightning-fast cloud storage designed for individuals and teams.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.24 }}
              className="mt-10 flex flex-wrap items-center justify-center lg:justify-start gap-4"
            >
              <Link
                to="/auth"
                className="group inline-flex items-center gap-2.5 px-8 py-4 text-[0.95rem] font-semibold text-white bg-gradient-to-r from-sky-500 to-blue-600 rounded-full shadow-xl shadow-sky-500/20 hover:shadow-2xl hover:shadow-sky-500/30 hover:-translate-y-0.5 transition-all duration-300"
              >
                Start Free Account
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
              <a
                href="#showcase"
                className="group inline-flex items-center gap-3 px-6 py-4 text-[0.95rem] font-semibold text-slate-700 hover:text-slate-900 transition-all duration-300"
                onClick={(e) => {
                  e.preventDefault();
                  document.querySelector('#showcase')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <div className="w-11 h-11 rounded-full bg-white border border-slate-200 shadow-lg shadow-slate-200/50 flex items-center justify-center group-hover:shadow-xl group-hover:border-slate-300 transition-all duration-300">
                  <Play size={14} className="text-slate-700 ml-0.5" fill="currentColor" />
                </div>
                Watch Demo
              </a>
            </motion.div>

            {/* Social proof */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.45 }}
              className="mt-12 flex flex-wrap items-center justify-center lg:justify-start gap-4"
            >
              <div className="flex -space-x-2.5">
                {['bg-sky-400', 'bg-emerald-400', 'bg-violet-400', 'bg-amber-400'].map((color, i) => (
                  <div
                    key={i}
                    className={`w-9 h-9 rounded-full ${color} border-[2.5px] border-white flex items-center justify-center text-[0.6rem] font-bold text-white shadow-sm`}
                  >
                    {['JD', 'SK', 'ML', 'AR'][i]}
                  </div>
                ))}
              </div>
              <div className="text-left">
                <p className="text-[0.75rem] sm:text-[0.8rem] font-semibold text-slate-700">
                  Trusted by 50,000+ professionals
                </p>
                <div className="flex items-center gap-0.5 mt-0.5">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                  <span className="text-[0.75rem] text-slate-400 ml-1.5">4.9/5 rating</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right — Illustration + Floating UI Cards */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="relative flex items-center justify-center lg:justify-end"
          >
            {/* Ambient glow behind illustration */}
            <div className="absolute w-[85%] h-[85%] bg-gradient-to-br from-sky-200/30 via-blue-100/20 to-transparent rounded-full blur-3xl" />

            {/* Main illustration */}
            <div className="relative w-full max-w-[520px] -mt-6 lg:-mt-16">
              <motion.img
                src={heroIllustration}
                alt="CloudVault — Secure cloud storage platform illustration"
                className="w-full h-auto drop-shadow-2xl mix-blend-multiply"
                style={{ 
                  y: yImage,
                  WebkitMaskImage: 'radial-gradient(ellipse at center, black 50%, transparent 80%)',
                  maskImage: 'radial-gradient(ellipse at center, black 50%, transparent 80%)'
                }}
                loading="eager"
              />

              {/* Floating Card: File Uploaded (top-right) */}
              <motion.div
                initial={{ opacity: 0, x: 20, y: -10 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ duration: 0.6, delay: 0.9 }}
                className="absolute -top-2 -right-4 sm:right-0 z-10"
                style={{ y: yCard1 }}
              >
                <motion.div
                  animate={{ y: [0, -7, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                  className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl shadow-slate-200/60 border border-white/80 px-3 py-2 sm:px-4 sm:py-3 flex items-center gap-2 sm:gap-3"
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-sky-50 flex items-center justify-center flex-shrink-0">
                    <Cloud size={16} className="text-sky-500 sm:w-[18px] sm:h-[18px]" />
                  </div>
                  <div>
                    <p className="text-[0.7rem] sm:text-[0.78rem] font-semibold text-slate-800">File Uploaded</p>
                    <p className="text-[0.6rem] sm:text-[0.65rem] text-slate-400">Project_Final.zip (42MB)</p>
                  </div>
                </motion.div>
              </motion.div>

              {/* Floating Card: Watch Demo (mid-left) */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 1.1 }}
                className="absolute top-[45%] -left-6 sm:-left-10 z-10 hidden sm:block"
                style={{ y: yCard2 }}
              >
                <motion.div
                  animate={{ y: [0, 8, 0] }}
                  transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
                  className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl shadow-slate-200/60 border border-white/80 px-3 py-2 sm:px-4 sm:py-3 flex items-center gap-2 sm:gap-3"
                >
                  <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-slate-900 flex items-center justify-center flex-shrink-0">
                    <Play size={10} className="text-white ml-0.5 sm:w-[12px] sm:h-[12px]" fill="white" />
                  </div>
                  <span className="text-[0.7rem] sm:text-[0.78rem] font-semibold text-slate-700">Watch Demo</span>
                </motion.div>
              </motion.div>

              {/* Floating Card: Storage Status (bottom-right) */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.3 }}
                className="absolute -bottom-4 right-4 sm:right-8 z-10"
                style={{ y: yCard3 }}
              >
                <motion.div
                  animate={{ y: [0, 6, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                  className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl shadow-slate-200/60 border border-white/80 px-3 py-2 sm:px-4 sm:py-3"
                >
                  <p className="text-[0.55rem] sm:text-[0.6rem] font-bold text-slate-400 uppercase tracking-widest mb-1 sm:mb-1.5">
                    Storage Status
                  </p>
                  <p className="text-[0.75rem] sm:text-[0.8rem] font-bold text-slate-800 mb-1.5 sm:mb-2">
                    85.4 GB <span className="text-slate-400 font-normal">of 1TB used</span>
                  </p>
                  <div className="w-28 sm:w-36 h-1.5 sm:h-2 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '85%' }}
                      transition={{ duration: 1.5, delay: 1.6, ease: 'easeOut' }}
                      className="h-full bg-gradient-to-r from-sky-400 to-blue-500 rounded-full"
                    />
                  </div>
                </motion.div>
              </motion.div>

              {/* Decorative floating dots */}
              <motion.div
                animate={{ y: [0, -12, 0], opacity: [0.4, 0.8, 0.4] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute top-[15%] -left-3 w-3 h-3 bg-sky-300 rounded-full hidden lg:block"
              />
              <motion.div
                animate={{ y: [0, 10, 0], opacity: [0.3, 0.7, 0.3] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                className="absolute top-[8%] right-[15%] w-2 h-2 bg-blue-400 rounded-full hidden lg:block"
              />
              <motion.div
                animate={{ y: [0, -8, 0], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                className="absolute bottom-[25%] -left-5 w-2 h-2 bg-indigo-300 rounded-full hidden lg:block"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

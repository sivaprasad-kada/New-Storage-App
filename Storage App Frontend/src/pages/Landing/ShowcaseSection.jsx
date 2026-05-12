import React from 'react';
import { motion } from 'framer-motion';
import { Upload, FolderOpen, Share2, Shield, ArrowRight } from 'lucide-react';

const showcaseSteps = [
  {
    step: '01',
    icon: Upload,
    title: 'Upload Your Files',
    description: 'Drag and drop files or use our intuitive uploader. Support for all file types with smart organization.',
    color: 'from-sky-500 to-blue-600',
    bgLight: 'bg-sky-50',
    iconColor: 'text-sky-500',
    borderAccent: 'group-hover:border-sky-200',
  },
  {
    step: '02',
    icon: FolderOpen,
    title: 'Organize & Manage',
    description: 'Create folders, rename files, and manage your storage with a clean, powerful dashboard interface.',
    color: 'from-violet-500 to-purple-600',
    bgLight: 'bg-violet-50',
    iconColor: 'text-violet-500',
    borderAccent: 'group-hover:border-violet-200',
  },
  {
    step: '03',
    icon: Share2,
    title: 'Share Securely',
    description: 'Generate secure links with passwords and expiration dates. Control who sees your files and for how long.',
    color: 'from-emerald-500 to-teal-600',
    bgLight: 'bg-emerald-50',
    iconColor: 'text-emerald-500',
    borderAccent: 'group-hover:border-emerald-200',
  },
  {
    step: '04',
    icon: Shield,
    title: 'Stay Protected',
    description: 'End-to-end encryption, secure authentication, and a dedicated Secure Vault for your most sensitive files.',
    color: 'from-amber-500 to-orange-600',
    bgLight: 'bg-amber-50',
    iconColor: 'text-amber-500',
    borderAccent: 'group-hover:border-amber-200',
  },
];

const ShowcaseSection = () => {
  return (
    <section id="showcase" className="relative py-24 sm:py-32 bg-white overflow-hidden">
      {/* Subtle background accents */}
      <div className="absolute top-[10%] right-[-8%] w-[400px] h-[400px] bg-violet-50/40 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-[15%] left-[-5%] w-[350px] h-[350px] bg-sky-50/30 rounded-full blur-[100px] -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 sm:mb-20"
        >
          <span className="inline-block px-4 py-1.5 bg-violet-50 border border-violet-100 rounded-full text-[0.75rem] font-semibold text-violet-600 tracking-wide uppercase mb-5">
            How It Works
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-extrabold text-slate-900 leading-tight tracking-tight">
            Simple workflow,{' '}
            <span className="bg-gradient-to-r from-violet-500 to-purple-600 bg-clip-text text-transparent">
              powerful results
            </span>
          </h2>
          <p className="mt-5 text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            From upload to collaboration — see how CloudVault transforms your file management experience.
          </p>
        </motion.div>

        {/* Workflow Steps — Horizontal Timeline Style */}
        <div className="relative">
          {/* Connecting line — desktop only */}
          <div className="hidden lg:block absolute top-[3.25rem] left-[5%] right-[5%] h-px z-0">
            <div className="w-full h-full border-t-2 border-dashed border-slate-200" />
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
            {showcaseSteps.map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`group relative ${item.borderAccent}`}
              >
                <div className="bg-white rounded-2xl border border-slate-100 p-7 hover:shadow-xl hover:shadow-slate-100/60 hover:border-slate-200 transition-all duration-500 h-full">
                  {/* Step number badge */}
                  <div className={`inline-flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br ${item.color} text-white text-[0.8rem] font-bold mb-5 group-hover:scale-110 group-hover:shadow-lg transition-all duration-300`}>
                    {item.step}
                  </div>

                  <h3 className="text-[1.05rem] font-bold text-slate-800 mb-2.5 group-hover:text-slate-900 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-[0.85rem] text-slate-400 leading-relaxed group-hover:text-slate-500 transition-colors">
                    {item.description}
                  </p>

                  {/* Arrow indicator */}
                  {index < showcaseSteps.length - 1 && (
                    <div className="hidden lg:flex absolute top-[3rem] -right-3 z-20 w-6 h-6 bg-white border border-slate-200 rounded-full items-center justify-center shadow-sm">
                      <ArrowRight size={12} className="text-slate-400" />
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ShowcaseSection;

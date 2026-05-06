import React, { useState } from 'react';
import { Check, Zap, Shield, Crown, Star, ArrowRight, HardDrive, Users, Clock, Infinity, Sparkles, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Payment = () => {
    const navigate = useNavigate();
    const [billingCycle, setBillingCycle] = useState('monthly');
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [showCheckout, setShowCheckout] = useState(false);

    const plans = [
        {
            id: 'free',
            name: 'Free',
            icon: <Star size={24} />,
            description: 'Perfect for getting started',
            monthlyPrice: 0,
            yearlyPrice: 0,
            storage: '500 MB',
            color: 'from-gray-500 to-gray-600',
            bgGlow: 'group-hover:shadow-gray-200 dark:group-hover:shadow-gray-800',
            features: [
                { text: '500 MB Storage', icon: <HardDrive size={14} /> },
                { text: 'Basic file sharing', icon: <Users size={14} /> },
                { text: 'Link sharing', icon: <ArrowRight size={14} /> },
                { text: '7 day link expiry', icon: <Clock size={14} /> },
            ],
            limitations: ['No password protection', 'No priority support'],
            isCurrent: true,
        },
        {
            id: 'pro',
            name: 'Pro',
            icon: <Zap size={24} />,
            description: 'For power users and teams',
            monthlyPrice: 9.99,
            yearlyPrice: 99.99,
            storage: '50 GB',
            color: 'from-brand-primary to-brand-secondary',
            bgGlow: 'group-hover:shadow-brand-primary/20',
            popular: true,
            features: [
                { text: '50 GB Storage', icon: <HardDrive size={14} /> },
                { text: 'Unlimited sharing', icon: <Users size={14} /> },
                { text: 'Password protection', icon: <Shield size={14} /> },
                { text: '30 day link expiry', icon: <Clock size={14} /> },
                { text: 'Download limits', icon: <ArrowRight size={14} /> },
                { text: 'Priority support', icon: <Star size={14} /> },
            ],
            limitations: [],
        },
        {
            id: 'business',
            name: 'Business',
            icon: <Crown size={24} />,
            description: 'For organizations at scale',
            monthlyPrice: 24.99,
            yearlyPrice: 249.99,
            storage: '500 GB',
            color: 'from-purple-500 to-purple-700',
            bgGlow: 'group-hover:shadow-purple-200 dark:group-hover:shadow-purple-900/30',
            features: [
                { text: '500 GB Storage', icon: <HardDrive size={14} /> },
                { text: 'Unlimited everything', icon: <Infinity size={14} /> },
                { text: 'Advanced security', icon: <Shield size={14} /> },
                { text: 'No link expiry', icon: <Clock size={14} /> },
                { text: 'Team management', icon: <Users size={14} /> },
                { text: 'Secure Vault access', icon: <Shield size={14} /> },
                { text: '24/7 Priority support', icon: <Star size={14} /> },
                { text: 'Custom branding', icon: <Sparkles size={14} /> },
            ],
            limitations: [],
        },
    ];

    const getPrice = (plan) => {
        if (plan.id === 'free') return 'Free';
        const price = billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
        return `$${price}`;
    };

    const getPeriod = (plan) => {
        if (plan.id === 'free') return 'forever';
        return billingCycle === 'monthly' ? '/mo' : '/yr';
    };

    const getSavings = (plan) => {
        if (plan.id === 'free') return null;
        const monthly12 = plan.monthlyPrice * 12;
        const yearly = plan.yearlyPrice;
        const saved = ((monthly12 - yearly) / monthly12 * 100).toFixed(0);
        return `Save ${saved}%`;
    };

    const handleSelectPlan = (plan) => {
        if (plan.id === 'free') return;
        setSelectedPlan(plan);
        setShowCheckout(true);
    };

    return (
        <div className="space-y-8 pb-12">
            {/* Header */}
            <div className="text-center max-w-2xl mx-auto">
                <div className="inline-flex items-center gap-2 bg-brand-primary/10 text-brand-primary px-4 py-1.5 rounded-full text-sm font-bold mb-4">
                    <Sparkles size={14} /> Upgrade Your Storage
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-black dark:text-white mb-3 tracking-tight">
                    Choose Your Plan
                </h1>
                <p className="text-gray-500 dark:text-gray-400 font-medium text-base sm:text-lg">
                    Unlock more storage, advanced sharing, and premium features for your cloud experience.
                </p>
            </div>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-3">
                <div className="bg-gray-200 dark:bg-slate-800 p-1 rounded-xl flex gap-1 font-bold">
                    <button
                        onClick={() => setBillingCycle('monthly')}
                        className={`px-5 py-2 rounded-lg transition-all text-sm ${billingCycle === 'monthly'
                            ? 'bg-white dark:bg-slate-600 text-brand-primary shadow-sm'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                            }`}
                    >
                        Monthly
                    </button>
                    <button
                        onClick={() => setBillingCycle('yearly')}
                        className={`px-5 py-2 rounded-lg transition-all text-sm flex items-center gap-2 ${billingCycle === 'yearly'
                            ? 'bg-white dark:bg-slate-600 text-brand-primary shadow-sm'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                            }`}
                    >
                        Yearly
                        <span className="bg-green-100 text-green-600 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">Save 17%</span>
                    </button>
                </div>
            </div>

            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                {plans.map((plan) => (
                    <div
                        key={plan.id}
                        className={`group relative bg-white dark:bg-slate-800 rounded-2xl border-2 transition-all duration-300 hover:shadow-xl flex flex-col overflow-hidden ${plan.popular
                                ? 'border-brand-primary shadow-lg shadow-brand-primary/10 scale-[1.02]'
                                : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600'
                            } ${plan.bgGlow}`}
                    >
                        {/* Popular Badge */}
                        {plan.popular && (
                            <div className="absolute top-0 right-0">
                                <div className="bg-gradient-to-r from-brand-primary to-brand-secondary text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl">
                                    MOST POPULAR
                                </div>
                            </div>
                        )}

                        {/* Plan Header */}
                        <div className={`bg-gradient-to-r ${plan.color} p-6 text-white`}>
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                                    {plan.icon}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold">{plan.name}</h3>
                                    <p className="text-white/80 text-xs font-medium">{plan.description}</p>
                                </div>
                            </div>

                            <div className="flex items-end gap-1 mt-4">
                                <span className="text-4xl font-extrabold tracking-tight">{getPrice(plan)}</span>
                                <span className="text-white/70 font-medium mb-1 text-sm">{getPeriod(plan)}</span>
                            </div>
                            {billingCycle === 'yearly' && getSavings(plan) && (
                                <span className="inline-block mt-2 bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full">
                                    {getSavings(plan)}
                                </span>
                            )}
                        </div>

                        {/* Storage Highlight */}
                        <div className="px-6 pt-5 pb-3">
                            <div className="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-3 flex items-center gap-3 border border-gray-100 dark:border-slate-600">
                                <div className={`w-8 h-8 bg-gradient-to-r ${plan.color} rounded-lg flex items-center justify-center`}>
                                    <HardDrive size={16} className="text-white" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Storage</p>
                                    <p className="text-lg font-extrabold text-black dark:text-white">{plan.storage}</p>
                                </div>
                            </div>
                        </div>

                        {/* Features List */}
                        <div className="px-6 py-4 flex-1">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">What's included</p>
                            <ul className="space-y-2.5">
                                {plan.features.map((feature, i) => (
                                    <li key={i} className="flex items-center gap-2.5 text-sm font-medium text-gray-700 dark:text-gray-300">
                                        <div className="w-5 h-5 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center shrink-0">
                                            <Check size={12} className="text-green-600 dark:text-green-400" />
                                        </div>
                                        {feature.text}
                                    </li>
                                ))}
                                {plan.limitations.map((limitation, i) => (
                                    <li key={`l-${i}`} className="flex items-center gap-2.5 text-sm font-medium text-gray-400 dark:text-gray-500 line-through">
                                        <div className="w-5 h-5 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center shrink-0">
                                            <X size={12} className="text-gray-400" />
                                        </div>
                                        {limitation}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* CTA Button */}
                        <div className="px-6 pb-6 pt-2">
                            <button
                                onClick={() => handleSelectPlan(plan)}
                                disabled={plan.isCurrent}
                                className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${plan.isCurrent
                                        ? 'bg-gray-100 dark:bg-slate-700 text-gray-400 dark:text-gray-500 cursor-default'
                                        : plan.popular
                                            ? 'bg-gradient-to-r from-brand-primary to-brand-secondary text-white shadow-lg shadow-brand-primary/25 hover:shadow-xl hover:shadow-brand-primary/30 hover:scale-[1.02]'
                                            : 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 hover:scale-[1.02]'
                                    }`}
                            >
                                {plan.isCurrent ? 'Current Plan' : (
                                    <>
                                        Get {plan.name} <ArrowRight size={16} />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Feature Comparison */}
            <div className="max-w-5xl mx-auto mt-12">
                <h2 className="text-2xl font-bold text-black dark:text-white text-center mb-8">Compare Plans</h2>
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-100 dark:border-slate-700">
                                    <th className="text-left px-6 py-4 font-bold text-gray-500 dark:text-gray-400 uppercase text-xs tracking-wider">Feature</th>
                                    <th className="text-center px-6 py-4 font-bold text-gray-500 dark:text-gray-400 uppercase text-xs tracking-wider">Free</th>
                                    <th className="text-center px-6 py-4 font-bold text-brand-primary uppercase text-xs tracking-wider bg-brand-primary/5">Pro</th>
                                    <th className="text-center px-6 py-4 font-bold text-purple-500 uppercase text-xs tracking-wider">Business</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                                {[
                                    { feature: 'Storage', free: '500 MB', pro: '50 GB', business: '500 GB' },
                                    { feature: 'File sharing', free: 'Basic', pro: 'Unlimited', business: 'Unlimited' },
                                    { feature: 'Share link expiry', free: '7 days', pro: '30 days', business: 'Never' },
                                    { feature: 'Password protection', free: false, pro: true, business: true },
                                    { feature: 'Download limits', free: false, pro: true, business: true },
                                    { feature: 'Secure Vault', free: false, pro: false, business: true },
                                    { feature: 'Team management', free: false, pro: false, business: true },
                                    { feature: 'Custom branding', free: false, pro: false, business: true },
                                    { feature: 'Priority support', free: false, pro: true, business: true },
                                    { feature: 'API access', free: false, pro: false, business: true },
                                ].map((row, i) => (
                                    <tr key={i} className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                                        <td className="px-6 py-3.5 font-medium text-gray-700 dark:text-gray-300">{row.feature}</td>
                                        <td className="px-6 py-3.5 text-center">
                                            {typeof row.free === 'boolean' ? (
                                                row.free ? <Check size={16} className="text-green-500 mx-auto" /> : <X size={16} className="text-gray-300 dark:text-gray-600 mx-auto" />
                                            ) : <span className="font-bold text-gray-700 dark:text-gray-300">{row.free}</span>}
                                        </td>
                                        <td className="px-6 py-3.5 text-center bg-brand-primary/5">
                                            {typeof row.pro === 'boolean' ? (
                                                row.pro ? <Check size={16} className="text-green-500 mx-auto" /> : <X size={16} className="text-gray-300 dark:text-gray-600 mx-auto" />
                                            ) : <span className="font-bold text-brand-primary">{row.pro}</span>}
                                        </td>
                                        <td className="px-6 py-3.5 text-center">
                                            {typeof row.business === 'boolean' ? (
                                                row.business ? <Check size={16} className="text-green-500 mx-auto" /> : <X size={16} className="text-gray-300 dark:text-gray-600 mx-auto" />
                                            ) : <span className="font-bold text-purple-500">{row.business}</span>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* FAQ Section */}
            <div className="max-w-3xl mx-auto mt-12">
                <h2 className="text-2xl font-bold text-black dark:text-white text-center mb-8">Frequently Asked Questions</h2>
                <div className="space-y-3">
                    {[
                        { q: 'Can I upgrade or downgrade at any time?', a: 'Yes! You can switch between plans whenever you want. When upgrading, you\'ll be charged the prorated difference. When downgrading, the change takes effect at the end of your billing cycle.' },
                        { q: 'What payment methods do you accept?', a: 'We accept all major credit cards (Visa, Mastercard, American Express), debit cards, UPI, and net banking through our secure payment gateway.' },
                        { q: 'Is there a refund policy?', a: 'Yes, we offer a 7-day money-back guarantee. If you\'re not satisfied with your plan, contact us within 7 days of purchase for a full refund.' },
                        { q: 'What happens to my files if I downgrade?', a: 'Your existing files will remain safe. However, you won\'t be able to upload new files until your usage is within your new plan\'s storage limit.' },
                    ].map((faq, i) => (
                        <FAQItem key={i} question={faq.q} answer={faq.a} />
                    ))}
                </div>
            </div>

            {/* Checkout Modal */}
            {showCheckout && selectedPlan && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
                        {/* Checkout Header */}
                        <div className={`bg-gradient-to-r ${selectedPlan.color} p-6 text-white relative`}>
                            <button
                                onClick={() => setShowCheckout(false)}
                                className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors cursor-pointer"
                            >
                                <X size={16} />
                            </button>
                            <div className="flex items-center gap-3 mb-2">
                                {selectedPlan.icon}
                                <h3 className="text-xl font-bold">{selectedPlan.name} Plan</h3>
                            </div>
                            <div className="flex items-end gap-1">
                                <span className="text-3xl font-extrabold">{getPrice(selectedPlan)}</span>
                                <span className="text-white/70 font-medium mb-0.5">{getPeriod(selectedPlan)}</span>
                            </div>
                        </div>

                        {/* Checkout Form */}
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Cardholder Name</label>
                                <input
                                    type="text"
                                    placeholder="John Doe"
                                    className="w-full bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-medium dark:text-white outline-none focus:border-brand-primary transition-colors"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Card Number</label>
                                <input
                                    type="text"
                                    placeholder="4242 4242 4242 4242"
                                    maxLength={19}
                                    className="w-full bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-medium dark:text-white outline-none focus:border-brand-primary transition-colors tracking-wider"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Expiry</label>
                                    <input
                                        type="text"
                                        placeholder="MM/YY"
                                        maxLength={5}
                                        className="w-full bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-medium dark:text-white outline-none focus:border-brand-primary transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">CVV</label>
                                    <input
                                        type="password"
                                        placeholder="•••"
                                        maxLength={4}
                                        className="w-full bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-medium dark:text-white outline-none focus:border-brand-primary transition-colors"
                                    />
                                </div>
                            </div>

                            {/* Order Summary */}
                            <div className="bg-gray-50 dark:bg-slate-800/50 rounded-xl p-4 border border-gray-100 dark:border-slate-700 space-y-2 mt-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-500 font-medium">{selectedPlan.name} Plan ({billingCycle})</span>
                                    <span className="font-bold text-black dark:text-white">{getPrice(selectedPlan)}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-500 font-medium">Tax</span>
                                    <span className="font-bold text-black dark:text-white">$0.00</span>
                                </div>
                                <div className="border-t border-gray-200 dark:border-slate-600 pt-2 flex items-center justify-between">
                                    <span className="font-bold text-black dark:text-white">Total</span>
                                    <span className="font-extrabold text-lg text-brand-primary">{getPrice(selectedPlan)}</span>
                                </div>
                            </div>

                            <button
                                onClick={() => {
                                    alert('Payment integration coming soon! This is a frontend demo.');
                                    setShowCheckout(false);
                                }}
                                className="w-full py-3.5 bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-[1.01] cursor-pointer flex items-center justify-center gap-2"
                            >
                                <Shield size={16} /> Pay {getPrice(selectedPlan)}
                            </button>

                            <p className="text-center text-xs text-gray-400 font-medium flex items-center justify-center gap-1">
                                <Shield size={12} /> Secured with 256-bit SSL encryption
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// FAQ Accordion Item
const FAQItem = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden transition-all">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-6 py-4 flex items-center justify-between text-left cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
            >
                <span className="font-bold text-black dark:text-white text-sm pr-4">{question}</span>
                <div className={`w-6 h-6 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center shrink-0 transition-transform ${isOpen ? 'rotate-45' : ''}`}>
                    <span className="text-gray-500 text-lg leading-none font-light">+</span>
                </div>
            </button>
            <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}`}>
                <p className="px-6 pb-4 text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                    {answer}
                </p>
            </div>
        </div>
    );
};

export default Payment;

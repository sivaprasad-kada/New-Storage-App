import React, { useState, useEffect } from 'react';
import { Check, Zap, Shield, Crown, Star, ArrowRight, HardDrive, Users, Clock, Infinity, Sparkles, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const loadRazorpay = () => {
    return new Promise((resolve) => {
        if (window.Razorpay) {
            return resolve(true);
        }
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

const Payment = () => {
    const navigate = useNavigate();
    const [billingCycle, setBillingCycle] = useState('monthly');
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [showCheckout, setShowCheckout] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [userPlan, setUserPlan] = useState('free');
    const [history, setHistory] = useState([]);
    const [payments, setPayments] = useState([]);

    useEffect(() => {
        const fetchUserPlan = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/user`, {
                    withCredentials: true,
                });
                if (response.data && response.data.plan) {
                    setUserPlan(response.data.plan || 'free');
                } else if (response.data && response.data.user) {
                    setUserPlan(response.data.user.plan || 'free');
                }
            } catch (error) {
                console.error("Failed to fetch user plan", error);
            }
        };
        const fetchHistory = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/payments/billing-history`, {
                    withCredentials: true,
                });
                if (response.data.status === 'success') {
                    setHistory(response.data.history || []);
                    setPayments(response.data.data || []);
                }
            } catch (error) {
                console.error("Failed to fetch history", error);
            }
        };
        fetchUserPlan();
        fetchHistory();
    }, []);

    const plans = [
        {
            id: 'free',
            name: 'Free',
            icon: <Star size={24} />,
            description: 'Perfect for getting started',
            monthlyPrice: 0,
            yearlyPrice: 0,
            storage: '1 GB',
            color: 'from-gray-500 to-gray-600',
            bgGlow: 'group-hover:shadow-gray-200 dark:group-hover:shadow-gray-800',
            features: [
                { text: '1 GB Storage', icon: <HardDrive size={14} /> },
                { text: 'Basic file sharing', icon: <Users size={14} /> },
                { text: 'Link sharing', icon: <ArrowRight size={14} /> },
                { text: '7 day link expiry', icon: <Clock size={14} /> },
            ],
            limitations: ['No password protection', 'No priority support'],
        },
        {
            id: 'basic',
            name: 'Basic',
            icon: <Zap size={24} />,
            description: 'For active users and creators',
            monthlyPrice: 99,
            yearlyPrice: 1099,
            storage: '100 GB',
            color: 'from-brand-primary to-brand-secondary',
            bgGlow: 'group-hover:shadow-brand-primary/20',
            popular: true,
            features: [
                { text: '100 GB Storage', icon: <HardDrive size={14} /> },
                { text: 'Unlimited sharing', icon: <Users size={14} /> },
                { text: 'Password protection', icon: <Shield size={14} /> },
                { text: '30 day link expiry', icon: <Clock size={14} /> },
                { text: 'Download limits', icon: <ArrowRight size={14} /> },
                { text: 'Priority support', icon: <Star size={14} /> },
            ],
            limitations: [],
        },
        {
            id: 'pro',
            name: 'Pro',
            icon: <Crown size={24} />,
            description: 'For power users and teams',
            monthlyPrice: 299,
            yearlyPrice: 3449,
            storage: '512 GB',
            color: 'from-purple-500 to-purple-700',
            bgGlow: 'group-hover:shadow-purple-200 dark:group-hover:shadow-purple-900/30',
            features: [
                { text: '512 GB Storage', icon: <HardDrive size={14} /> },
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
        return `₹${price}`;
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

    const handleSelectPlan = async (plan) => {
        if (plan.id === userPlan) return;
        
        if (plan.id === 'free') {
            const confirmed = window.confirm('Are you sure you want to downgrade to the Free plan?');
            if (confirmed) {
                try {
                    setIsLoading(true);
                    await axios.post(`${import.meta.env.VITE_BASE_URL}/api/payments/create-subscription`, {
                        planId: 'free',
                        billingCycle: 'monthly',
                    }, { withCredentials: true });
                    toast.success('Successfully downgraded to Free plan');
                    setUserPlan('free');
                } catch (error) {
                    toast.error('Failed to downgrade plan');
                } finally {
                    setIsLoading(false);
                }
            }
            return;
        }

        setSelectedPlan(plan);
        setShowCheckout(true);
    };

    const handlePayment = async () => {
        setIsLoading(true);
        const isLoaded = await loadRazorpay();
        if (!isLoaded) {
            toast.error('Failed to load Razorpay SDK. Are you online?');
            setIsLoading(false);
            return;
        }

        try {
            // 1. Create subscription
            const { data } = await axios.post(`${import.meta.env.VITE_BASE_URL}/api/payments/create-subscription`, {
                planId: selectedPlan.id,
                billingCycle,
            }, { withCredentials: true });

            if (data.status !== 'success') {
                throw new Error(data.message || 'Failed to create subscription');
            }

            const { subscriptionId, key } = data;

            // 2. Open Razorpay Checkout
            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID || key,
                subscription_id: subscriptionId,
                name: 'CloudVault SaaS',
                description: `${selectedPlan.name} Plan (${billingCycle})`,
                image: 'https://static.vecteezy.com/system/resources/previews/002/318/271/non_2x/user-profile-icon-free-vector.jpg',
                handler: async function (response) {
                    try {
                        // 3. Verify payment on backend
                        const verifyRes = await axios.post(`${import.meta.env.VITE_BASE_URL}/api/payments/verify-payment`, {
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_subscription_id: response.razorpay_subscription_id,
                            razorpay_signature: response.razorpay_signature,
                            planId: selectedPlan.id,
                            billingCycle,
                        }, { withCredentials: true });

                        if (verifyRes.data.status === 'success') {
                            toast.success('Payment successful! Plan upgraded.');
                            setUserPlan(selectedPlan.id);
                            setShowCheckout(false);
                        } else {
                            toast.error('Payment verification failed.');
                        }
                    } catch (err) {
                        toast.error('Payment verification error.');
                    }
                },
                prefill: {
                    name: 'User',
                    email: 'user@example.com',
                },
                theme: {
                    color: '#4F46E5', // brand-primary
                },
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response) {
                toast.error(`Payment failed: ${response.error.description}`);
            });
            rzp.open();
            setShowCheckout(false); // Close our custom modal

        } catch (error) {
            console.error('Payment error:', error);
            toast.error(error.response?.data?.message || 'Something went wrong during payment setup.');
        } finally {
            setIsLoading(false);
        }
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
                        <span className="bg-green-100 text-green-600 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">Save Up To 15%</span>
                    </button>
                </div>
            </div>

            {/* Plans Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto">
                {plans.map((plan) => {
                    const isCurrent = plan.id === userPlan;
                    let isDisabled = isCurrent || isLoading;
                    let buttonText = isCurrent ? 'Current Plan' : `Get ${plan.name}`;

                    if (userPlan !== 'free' && plan.id === 'free') {
                        isDisabled = true;
                    }
                    if (userPlan === 'pro' && plan.id === 'basic') {
                        isDisabled = true;
                    }
                    if (userPlan === 'basic' && plan.id === 'pro') {
                        buttonText = `Upgrade to ${plan.name}`;
                    }

                    return (
                    <div
                        key={plan.id}
                        className={`group relative bg-white dark:bg-slate-800 rounded-2xl border-2 transition-all duration-300 hover:shadow-xl flex flex-col overflow-hidden ${
                                plan.popular
                                ? 'border-brand-primary shadow-lg shadow-brand-primary/10 sm:scale-[1.02]'
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
                                disabled={isDisabled}
                                className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${isDisabled
                                        ? 'bg-gray-100 dark:bg-slate-700 text-gray-400 dark:text-gray-500 cursor-default'
                                        : plan.popular
                                            ? 'bg-gradient-to-r from-brand-primary to-brand-secondary text-white shadow-lg shadow-brand-primary/25 hover:shadow-xl hover:shadow-brand-primary/30 hover:scale-[1.02]'
                                            : 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 hover:scale-[1.02]'
                                    }`}
                            >
                                {buttonText === 'Current Plan' ? 'Current Plan' : (
                                    <>
                                        {buttonText} <ArrowRight size={16} />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )})}
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
                            <div className="bg-gray-50 dark:bg-slate-800/50 rounded-xl p-4 border border-gray-100 dark:border-slate-700 space-y-2 mt-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-500 font-medium">{selectedPlan.name} Plan ({billingCycle})</span>
                                    <span className="font-bold text-black dark:text-white">{getPrice(selectedPlan)}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-500 font-medium">Tax</span>
                                    <span className="font-bold text-black dark:text-white">₹0.00</span>
                                </div>
                                <div className="border-t border-gray-200 dark:border-slate-600 pt-2 flex items-center justify-between">
                                    <span className="font-bold text-black dark:text-white">Total</span>
                                    <span className="font-extrabold text-lg text-brand-primary">{getPrice(selectedPlan)}</span>
                                </div>
                            </div>

                            <button
                                onClick={handlePayment}
                                disabled={isLoading}
                                className="w-full py-3.5 bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-[1.01] cursor-pointer flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isLoading ? 'Processing...' : (
                                    <><Shield size={16} /> Pay {getPrice(selectedPlan)}</>
                                )}
                            </button>

                            <p className="text-center text-xs text-gray-400 font-medium flex items-center justify-center gap-1">
                                <Shield size={12} /> Secured by Razorpay
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Subscription History Section */}
            {(history.length > 0 || payments.length > 0) && (
                <div className="max-w-5xl mx-auto mt-12 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
                    <div className="p-6 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50">
                        <h2 className="text-xl font-bold text-black dark:text-white">Billing & Subscription History</h2>
                        <p className="text-sm text-gray-500 mt-1">Review your past transactions and plan changes.</p>
                    </div>
                    <div className="overflow-x-auto -mx-4 sm:mx-0">
                        <table className="w-full text-left text-sm min-w-[500px]">
                            <thead className="bg-gray-50 dark:bg-slate-900/50 text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Action/Plan</th>
                                    <th className="px-6 py-4">Billing Cycle</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-slate-700/50">
                                {history.map((record) => (
                                    <tr key={record._id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                                            {new Date(record.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-bold text-black dark:text-white capitalize">{record.actionType}</span>
                                            <span className="text-gray-500 ml-2">({record.oldPlan || 'none'} → {record.newPlan})</span>
                                        </td>
                                        <td className="px-6 py-4 capitalize text-gray-600 dark:text-gray-300">
                                            {record.newBillingCycle || '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="bg-green-100 text-green-700 px-2 py-1 rounded-md text-xs font-bold uppercase">Success</span>
                                        </td>
                                        <td className="px-6 py-4 text-right text-gray-600 dark:text-gray-300 font-bold">
                                            -
                                        </td>
                                    </tr>
                                ))}
                                {payments.map((payment) => (
                                    <tr key={payment._id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                                            {new Date(payment.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-bold text-black dark:text-white capitalize">Payment</span>
                                            <span className="text-gray-500 ml-2">({payment.plan})</span>
                                        </td>
                                        <td className="px-6 py-4 capitalize text-gray-600 dark:text-gray-300">
                                            {payment.billingCycle}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="bg-green-100 text-green-700 px-2 py-1 rounded-md text-xs font-bold uppercase">{payment.status}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right text-black dark:text-white font-extrabold">
                                            ₹{payment.amount}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Payment;

import React, { useState, useEffect } from 'react';
import { Cloud } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import GitHubLoginButton from '../components/GitHubLoginButton';

const Auth = () => {
    const [isSignIn, setIsSignIn] = useState(true);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const navigate = useNavigate();
    const [isSending, setIsSending] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [otpError, setOtpError] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);
    const [otpVerified, setOtpVerified] = useState(false);
    const [serverError, setServerError] = useState("");
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [timer, setTimer] = useState(0);

    const loginToGoogle = useGoogleLogin({
        onSuccess: tokenResponse => handleGoogleLogin(tokenResponse.access_token, 'access_token'),
        onError: () => console.log('Login Failed'),
    });

    useEffect(() => {
        let interval;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const handleSendOtp = async () => {
        if (!email) {
            setOtpError("Email is required");
            return;
        }
        if (!emailRegex.test(email)) {
            setOtpError("Invalid email format");
            return;
        }
        setOtpError("");
        try {
            setIsSending(true);
            const res = await fetch(`${BASE_URL}/auth/send-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();

            if (res.ok) {
                setOtpSent(true);
                setOtpError("");
                setTimer(60);
                console.log(`OTP sent to ${email}`);
            } else {
                setOtpError(data.error || "Failed to send OTP.");
            }
        } catch (err) {
            console.error(err);
            setOtpError("Something went wrong sending OTP.");
        } finally {
            setIsSending(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (!otp) {
            setOtpError("Please enter OTP");
            return;
        }
        try {
            setIsVerifying(true);
            setOtpError("");
            const res = await fetch(`${BASE_URL}/auth/verify-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otp }),
            });
            const data = await res.json();

            if (res.ok) {
                setOtpVerified(true);
                setOtpError("");
                setTimer(0);
            } else {
                setOtpError(data.error || "Invalid or expired OTP.");
                setOtpVerified(false);
            }
        } catch (err) {
            console.error(err);
            setOtpError("Something went wrong verifying OTP.");
            setOtpVerified(false);
        } finally {
            setIsVerifying(false);
        }
    };
    const handleGoogleLogin = async (token, type = 'id_token') => {
        const response = await fetch(`${BASE_URL}/user/google`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({ token, type }),
        });

        const data = await response.json();
        if (data.error) {
            // Show error below the email field (e.g., "Email already exists")
            setServerError(data.error);
        } else {
            // Registration success
            navigate("/");
        }
    };
    const handleGitHubLogin = () => {
        const CLIENT_ID = "Ov23lih57kAGvNVuYKTJ";
        const REDIRECT_URI = "http://localhost:5173/user/github/callback";

        const authUrl = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=user:email`;

        const popup = window.open(
            authUrl,
            "githubPopup",
            "width=600,height=700,left=200,top=100"
        );

        const receiveMessage = async (event) => {
            if (event.origin !== "http://localhost:5173") return;

            const { code } = event.data;
            if (code) {
                console.log("Received OAuth code:", code);

                // send code to backend
                const res = await fetch(`${BASE_URL}/user/github/callback`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({ code }),

                });

                const data = await res.json();
                console.log("Backend response:", data);
                if (res.status == 202) {
                    setTimeout(() => {
                        navigate("/");
                    }, 2000)
                }
                window.removeEventListener("message", receiveMessage);
                popup.close();
            }
        };

        window.addEventListener("message", receiveMessage);
    };

    const images = [
        '/assets/cloud_1.png',
        '/assets/cloud_2.png',
        '/assets/cloud_3.png'
    ];

    // Auto-slide carousel
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % images.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    const toggleMode = () => {
        setIsSignIn(!isSignIn);
        setServerError("");
        setOtpError("");
        setOtpSent(false);
        setOtpVerified(false);
        setOtp("");
        setTimer(0);
    };
    const BASE_URL = "http://localhost:4000";
    const handleFormSubmit = (e) => {
        e.preventDefault();
        if (isSignIn) {
            handleSignIn(e);
        } else {
            handleSignUp(e);
        }
    };

    const handleSignIn = async (e) => {
        setServerError("");
        try {
            const response = await fetch(`${BASE_URL}/user/login`, {
                method: "POST",
                body: JSON.stringify({ email, password }),
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
            });

            const data = await response.json();
            console.log(data);
            if (data.error) {
                setServerError(data.error);
            } else {
                // On success, navigate to home or any other protected route
                navigate("/dashboard");
            }
        } catch (error) {
            console.error("Error:", error);
            setServerError("Something went wrong. Please try again.");
        }
    };

    const handleSignUp = async (e) => {
        setServerError("");
        if (!otpVerified) {
            setOtpError("Email not verified");
            return;
        }
        if (password !== confirmPassword) {
            setServerError("Passwords do not match");
            return;
        }
        try {
            const response = await fetch(`${BASE_URL}/user/register`, {
                method: "POST",
                body: JSON.stringify({ name, email, password }),
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
            });

            const data = await response.json();
            console.log(data);
            if (data.error) {
                setServerError(data.error);
            } else {
                // On success, navigate to home or any other protected route
                navigate("/dashboard");
            }
        } catch (error) {
            console.error("Error:", error);
            setServerError("Something went wrong. Please try again.");
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300">

            {/* Left Panel - Image Carousel (Visuals) */}
            <div className="hidden lg:flex w-1/2 bg-gray-100 dark:bg-[#0B1120] relative flex-col items-center justify-center p-12 order-1 border-r border-gray-200 dark:border-slate-800">

                <div className="relative w-full max-w-lg h-[80%] flex flex-col justify-center">
                    {images.map((img, index) => (
                        <div
                            key={index}
                            className={`absolute inset-0 transition-opacity duration-700 ease-in-out flex flex-col items-center justify-center pb-20 ${index === currentImageIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
                                }`}
                        >
                            <img
                                src={img}
                                alt={`Illustration ${index + 1}`}
                                className="w-full h-auto max-h-[400px] object-contain drop-shadow-2xl mb-8 transform hover:scale-105 transition-transform duration-500"
                            />

                            {/* Caption based on index */}
                            <div className="text-center mt-4 px-4 relative z-20">
                                <h3 className="text-2xl font-bold text-black dark:text-white mb-3">
                                    {index === 0 && 'Secure Cloud Storage'}
                                    {index === 1 && 'Organize Your Digital Life'}
                                    {index === 2 && 'Seamless Synchronization'}
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400 font-medium max-w-sm mx-auto leading-relaxed">
                                    {index === 0 && 'Your files are guarded with bank-grade encryption in our secure vault.'}
                                    {index === 1 && 'Keep all your important documents, designs, and photos in one place.'}
                                    {index === 2 && 'Access your files from any device, anywhere, at any time.'}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Carousel Indicators - Positioned securely at the bottom */}
                <div className="absolute bottom-12 flex gap-3 z-30">
                    {images.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`w-3 h-3 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary ${index === currentImageIndex
                                ? 'bg-brand-primary w-8'
                                : 'bg-gray-300 dark:bg-slate-700 hover:bg-gray-400 dark:hover:bg-slate-600'
                                }`}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            </div>

            {/* Right Panel - Auth Form */}
            <div className="flex-1 flex flex-col justify-center px-8 sm:px-12 lg:px-24 bg-gray-50 dark:bg-slate-900 order-2">
                <div className="max-w-md w-full mx-auto">
                    {/* Header Logo */}
                    <div className="flex items-center gap-2 mb-8">
                        <Cloud size={40} className="text-brand-primary" fill="currentColor" />
                        <span className="text-3xl font-extrabold text-brand-primary tracking-tight font-mono">Cloud Drive</span>
                    </div>

                    <h1 className="text-3xl sm:text-4xl font-extrabold text-black dark:text-white mb-3">
                        {isSignIn ? 'Welcome Back' : 'Create Account'}
                    </h1>
                    <p className="text-gray-400 dark:text-gray-500 mb-8 ml-1 font-medium">
                        {isSignIn
                            ? 'Sign in to access your secure vault.'
                            : 'Join us to store and share files securely.'}
                    </p>

                    {/* Form */}
                    <form className="space-y-4" onSubmit={(e) => {
                        handleFormSubmit(e);
                    }}>

                        {!isSignIn && (
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">Full Name</label>
                                <input
                                    type="text"
                                    className="w-full bg-gray-100 dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 focus:border-brand-primary rounded-xl px-4 py-3 focus:outline-none transition-colors text-black dark:text-white placeholder-gray-400 font-medium"
                                    placeholder="John Doe"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                        )}

                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">Email address</label>
                        <div className="relative">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={`w-full bg-gray-100 dark:bg-slate-800 border-2 ${otpVerified ? 'border-green-500' : (otpError && !(otpSent && !otpVerified) ? 'border-red-500' : 'border-gray-200 dark:border-slate-700')} focus:border-brand-primary rounded-xl px-4 py-3 focus:outline-none transition-colors text-black dark:text-white placeholder-gray-400 font-medium ${!isSignIn && !otpVerified ? 'pr-28' : ''}`}
                                placeholder="name@example.com"
                                readOnly={otpVerified && !isSignIn}
                            />
                            {!isSignIn && !otpVerified && (
                                <button
                                    type="button"
                                    onClick={handleSendOtp}
                                    disabled={timer > 0 || !email || isSending}
                                    className={`absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${timer > 0 || isSending
                                        ? 'bg-gray-400 text-white cursor-not-allowed'
                                        : 'bg-brand-primary text-white hover:bg-brand-secondary shadow-md hover:shadow-lg'
                                        }`}
                                >
                                    {isSending ? 'Sending...' : (timer > 0 ? `Resend in ${timer}s` : ((otpSent && !otpVerified) ? 'Resend OTP' : 'Send OTP'))}
                                </button>
                            )}
                            {!isSignIn && otpVerified && (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
                                    <span className="font-bold text-sm">Verified</span>
                                </div>
                            )}
                        </div>
                        {otpError && !(otpSent && !otpVerified) && <p className="text-red-500 text-xs mt-1">{otpError}</p>}

                        {!isSignIn && (otpSent && !otpVerified) && (
                            <div className="mt-3 flex flex-col gap-2 animate-fadeIn">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        className={`flex-1 bg-gray-100 dark:bg-slate-800 border-2 ${otpError ? 'border-red-500' : 'border-gray-200 dark:border-slate-700'} focus:border-brand-primary rounded-xl px-4 py-3 focus:outline-none transition-colors text-black dark:text-white placeholder-gray-400 font-medium`}
                                        placeholder="Enter OTP"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleVerifyOtp}
                                        disabled={isVerifying}
                                        className={`${isVerifying ? 'bg-green-400' : 'bg-green-600 hover:bg-green-700'} text-white font-bold px-6 py-3 rounded-xl shadow-md transition-all`}
                                    >
                                        {isVerifying ? 'Verifying...' : 'Verify'}
                                    </button>
                                </div>
                                {otpError && <p className="text-red-500 text-xs">{otpError}</p>}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">Password</label>
                            <input
                                type="password"
                                className="w-full bg-gray-100 dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 focus:border-brand-primary rounded-xl px-4 py-3 focus:outline-none transition-colors text-black dark:text-white placeholder-gray-400 font-medium"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        {!isSignIn && (
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">Confirm Password</label>
                                <input
                                    type="password"
                                    className="w-full bg-gray-100 dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 focus:border-brand-primary rounded-xl px-4 py-3 focus:outline-none transition-colors text-black dark:text-white placeholder-gray-400 font-medium"
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                            </div>
                        )}

                        {serverError && <p className="text-red-500 text-sm font-bold text-center bg-red-100 dark:bg-red-900/30 p-2 rounded-lg">{serverError}</p>}

                        {isSignIn && (
                            <div className="flex items-center justify-between pt-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary" />
                                    <span className="text-sm text-gray-600 dark:text-gray-400 font-bold">Remember me</span>
                                </label>
                                <a href="#" className="text-sm text-brand-primary font-bold hover:underline">Forgot password?</a>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={!isSignIn && !otpVerified}
                            className={`w-full text-white text-lg font-bold py-3.5 rounded-xl shadow-lg transition-all mt-6 ${!isSignIn && !otpVerified
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-brand-primary hover:bg-brand-secondary hover:shadow-xl'
                                }`}
                        >
                            {isSignIn ? 'Sign In' : 'Create Account'}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase tracking-widest">
                            <span className="px-4 bg-gray-50 dark:bg-slate-900 text-gray-400 font-bold">Or Continue with</span>
                        </div>
                    </div>

                    {/* Social Auth */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button
                            onClick={() => loginToGoogle()}
                            className="flex items-center justify-center gap-3 w-full bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-4 py-2.5 rounded-lg font-medium transition-all shadow-sm hover:shadow-md active:scale-95"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            <span>Sign in with Google</span>
                        </button>
                        <GitHubLoginButton onClick={handleGitHubLogin} />
                    </div>

                    {/* Toggle */}
                    <p className="mt-8 text-center text-gray-500 font-medium">
                        {isSignIn ? "Don't have an account?" : "Already have an account?"}
                        <button
                            onClick={toggleMode}
                            className="ml-2 text-brand-primary font-bold hover:underline focus:outline-none"
                        >
                            {isSignIn ? 'Sign Up' : 'Sign In'}
                        </button>
                    </p>
                </div>
            </div>

        </div>
    );
};

export default Auth;

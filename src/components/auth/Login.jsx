import React, { useState } from 'react';
import { Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';
import { loginUser } from '../../utils/authApi';

const Login = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [notification, setNotification] = useState(null);
    const [errors, setErrors] = useState({ username: false, password: false });

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const isUsernameEmpty = !username.trim();
        const isPasswordEmpty = !password;

        if (isUsernameEmpty || isPasswordEmpty) {
            setErrors({
                username: isUsernameEmpty,
                password: isPasswordEmpty
            });

            if (isUsernameEmpty && isPasswordEmpty) {
                showToast('Please enter both username and password', 'error');
            } else if (isUsernameEmpty) {
                showToast('Please enter your username', 'error');
            } else {
                showToast('Please enter your password', 'error');
            }
            return;
        }

        setErrors({ username: false, password: false });
        setIsLoading(true);

        try {
            const data = await loginUser(username, password);
            showToast(data.message || `Welcome back! Successfully signed in as ${username}`, 'success');

            if (data.token) {
                sessionStorage.setItem('auth_token', data.token);
            }

            if (onLogin) {
                setTimeout(() => onLogin({ username: data.user?.username || username }), 500);
            }
        } catch (err) {
            showToast(err.message || 'Invalid username or password. Please try again.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const showToast = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => {
            setNotification(null);
        }, 3500);
    };

    return (
        <div className="w-full min-h-screen lg:h-screen flex flex-col lg:flex-row bg-[#f8f9fa] overflow-x-hidden lg:overflow-hidden select-none">
            {/* Toast Notification */}
            {notification && (
                <div
                    className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl border text-sm font-medium transition-all duration-300 transform translate-y-0 ${notification.type === 'error'
                        ? 'bg-rose-50 border-rose-200 text-rose-700 shadow-rose-500/10'
                        : notification.type === 'info'
                            ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-indigo-500/10'
                            : 'bg-emerald-50 border-emerald-200 text-emerald-800 shadow-emerald-500/10'
                        }`}
                >
                    {notification.type === 'error' ? (
                        <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
                    ) : (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    )}
                    <span>{notification.message}</span>
                </div>
            )}

            {/* FORM COLUMN: Left on Desktop (order-1), Below Image on Mobile (order-2) */}
            <div className="w-full lg:w-1/2 min-h-fit lg:h-full flex flex-col justify-between px-6 sm:px-8 md:px-8 lg:px-10 xl:px-14 py-8 lg:py-8 bg-[#f8f9fa] z-10 lg:overflow-y-auto order-2 lg:order-1">
                <div className="max-w-[440px] w-full mx-auto my-auto py-4">
                    {/* Vyapti Logo on Top of Welcome Text */}
                    <div className="mb-6 sm:mb-8">
                        <img
                            src="/assets/vyapti_logo.png"
                            alt="Vyapti Logo"
                            className="h-16 sm:h-20 md:h-[84px] w-auto object-contain transition-transform hover:scale-105 duration-200"
                        />
                    </div>

                    {/* Header */}
                    <div className="mb-7">
                        <h1 className="text-2xl sm:text-[32px] font-extrabold text-[#111827] tracking-tight flex items-center gap-2">
                            <span>Welcome Back !</span>
                            <span className="inline-block animate-bounce origin-bottom-right" style={{ animationDuration: '2s' }}>👋</span>
                        </h1>
                        <p className="mt-2 text-[#6b7280] text-xs sm:text-[14px] leading-relaxed font-normal">
                            Login to access the dashboard.
                        </p>
                    </div>

                    {/* Login Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Username Field */}
                        <div>
                            <label className="block text-xs sm:text-[13px] font-bold text-[#1f2937] mb-1.5">
                                Username:
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => {
                                        setUsername(e.target.value);
                                        if (errors.username) setErrors(prev => ({ ...prev, username: false }));
                                    }}
                                    placeholder="Enter Your Username Here.."
                                    className={`w-full px-4 py-3 sm:py-3.5 text-xs sm:text-sm text-gray-800 placeholder-[#9ca3af] bg-white rounded-xl outline-none transition-all duration-200 shadow-xs ${
                                        errors.username
                                            ? 'border-2 border-rose-500 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/15'
                                            : 'border border-[#e2e8f0] focus:border-[#00a8e7] focus:ring-4 focus:ring-[#00a8e7]/10'
                                    }`}
                                />
                            </div>
                            {errors.username && (
                                <p className="mt-1 text-xs text-rose-500 font-medium">Username is required</p>
                            )}
                        </div>

                        {/* Password Field */}
                        <div>
                            <label className="block text-xs sm:text-[13px] font-bold text-[#1f2937] mb-1.5">
                                Password:
                            </label>
                            <div className="relative flex items-center">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        if (errors.password) setErrors(prev => ({ ...prev, password: false }));
                                    }}
                                    placeholder="Enter Your Password"
                                    className={`w-full px-4 py-3 sm:py-3.5 pr-11 text-xs sm:text-sm text-gray-800 placeholder-[#9ca3af] bg-white rounded-xl outline-none transition-all duration-200 shadow-xs ${
                                        errors.password
                                            ? 'border-2 border-rose-500 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/15'
                                            : 'border border-[#e2e8f0] focus:border-[#00a8e7] focus:ring-4 focus:ring-[#00a8e7]/10'
                                    }`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer p-1"
                                    title={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-4 h-4" />
                                    ) : (
                                        <Eye className="w-4 h-4" />
                                    )}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="mt-1 text-xs text-rose-500 font-medium">Password is required</p>
                            )}
                        </div>

                        {/* Forgot Password Link */}
                        {/* <div className="flex justify-end pt-0.5">
                            <a
                                href="#forgot"
                                onClick={(e) => {
                                    e.preventDefault();
                                    showToast('Password reset link sent to your registered username/email.', 'info');
                                }}
                                className="text-xs sm:text-[13px] font-semibold text-[#00a8e7] hover:text-[#008cc4] transition-colors"
                            >
                                Forget Password ?
                            </a>
                        </div> */}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full mt-8 py-3.5 sm:py-4 px-6 rounded-xl font-bold text-white text-sm sm:text-base tracking-wide bg-gradient-to-r from-[#00a8e7] via-[#2672e5] to-[#5236df] hover:from-[#0097cf] hover:to-[#4428cb] shadow-lg shadow-[#00a8e7]/25 hover:shadow-xl hover:shadow-[#5236df]/35 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <span>Login Now</span>
                            )}
                        </button>
                    </form>
                </div>

                {/* Bottom Copyright & Version Footer */}
                <div className="max-w-[440px] w-full mx-auto pt-6 pb-2 border-t border-slate-200/80 flex items-center justify-between text-[11px] sm:text-xs text-gray-400">
                    <span>© {new Date().getFullYear()} TeCMi Vyapti. All rights reserved.</span>
                    <span className="font-semibold text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-md shadow-2xs">v1.0.0</span>
                </div>
            </div>

            {/* IMAGE COLUMN: Top on Mobile (order-1), Right on Desktop (order-2) */}
            <div className="w-full lg:w-1/2 h-[125px] sm:h-[230px] md:h-[280px] lg:h-full relative overflow-hidden bg-slate-950 order-1 lg:order-2 shrink-0">
                <img
                    src="/assets/goods_security.jpg"
                    alt="Loss Prevention and Goods Security"
                    className="w-full h-full object-cover object-center"
                />
            </div>
        </div>
    );
};

export default Login;
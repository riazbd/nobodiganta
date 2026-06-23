import { Head, Link, useForm, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function VerifyOtp({ email, resendIn = 0, status }) {
    const { data, setData, post, processing, errors, reset } = useForm({ code: '' });
    const [cooldown, setCooldown] = useState(resendIn);
    const [resending, setResending] = useState(false);

    useEffect(() => { setCooldown(resendIn); }, [resendIn, status]);

    useEffect(() => {
        if (cooldown <= 0) return;
        const t = setInterval(() => setCooldown((s) => Math.max(0, s - 1)), 1000);
        return () => clearInterval(t);
    }, [cooldown]);

    const submit = (e) => {
        e.preventDefault();
        post(route('login.otp.verify'), { onError: () => reset('code') });
    };

    const resend = () => {
        if (cooldown > 0 || resending) return;
        setResending(true);
        router.post(route('login.otp.resend'), {}, {
            preserveScroll: true,
            onFinish: () => setResending(false),
        });
    };

    return (
        <>
            <Head title="Verify code" />
            <div className="min-h-screen flex bg-[#f0f2f8]">
                {/* Left Panel - Branding */}
                <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#263238] to-[#1a2428] items-center justify-center relative overflow-hidden">
                    <div className="absolute top-20 left-20 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
                    <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
                    <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
                    <div className="relative z-10 text-center text-white px-12 max-w-lg">
                        <div className="text-6xl font-extrabold font-['Noto_Serif_Bengali'] mb-6 tracking-tight">নবদিগন্ত</div>
                        <div className="text-lg font-medium tracking-widest uppercase opacity-80 mb-8">Admin Panel v2.6</div>
                        <div className="text-base opacity-75 leading-relaxed">
                            একটি অতিরিক্ত নিরাপত্তা স্তর — আপনার ইমেইলে পাঠানো কোডটি দিন।
                        </div>
                    </div>
                </div>

                {/* Right Panel - OTP Form */}
                <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
                    <div className="w-full max-w-md">
                        <div className="lg:hidden text-center mb-8">
                            <div className="text-4xl font-extrabold text-[#263238] font-['Noto_Serif_Bengali']">নবদিগন্ত</div>
                            <div className="text-xs text-gray-500 tracking-widest uppercase mt-1">Admin Panel</div>
                        </div>

                        <div className="mb-8">
                            <h1 className="text-2xl font-bold text-gray-900">Enter verification code</h1>
                            <p className="text-sm text-gray-500 mt-1.5">
                                We emailed a code to <span className="font-semibold text-gray-700">{email}</span>. Enter it to finish signing in.
                            </p>
                        </div>

                        {status && (
                            <div className="mb-6 text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 flex items-center gap-2">
                                <span className="text-base">✓</span> {status}
                            </div>
                        )}
                        {(errors.code || errors.email) && (
                            <div className="mb-6 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                                {errors.code || errors.email}
                            </div>
                        )}

                        <form onSubmit={submit} className="space-y-5">
                            <div>
                                <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1.5">Verification code</label>
                                <input
                                    id="code"
                                    type="text"
                                    inputMode="numeric"
                                    autoComplete="one-time-code"
                                    autoFocus
                                    value={data.code}
                                    onChange={(e) => setData('code', e.target.value.replace(/\D/g, '').slice(0, 8))}
                                    placeholder="••••••"
                                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-center text-2xl font-bold tracking-[0.5em] outline-none focus:border-[#263238] focus:ring-2 focus:ring-[#263238]/20 transition-all bg-white font-mono"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={processing || data.code.length < 4}
                                className="w-full bg-[#263238] text-white font-semibold py-3 rounded-xl hover:bg-[#1a2428] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#263238]/20"
                            >
                                {processing ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        Verifying...
                                    </span>
                                ) : 'Verify & sign in'}
                            </button>
                        </form>

                        <div className="mt-6 flex items-center justify-between text-sm">
                            <button
                                type="button"
                                onClick={resend}
                                disabled={cooldown > 0 || resending}
                                className="text-[#263238] font-medium hover:underline disabled:text-gray-400 disabled:no-underline disabled:cursor-not-allowed"
                            >
                                {cooldown > 0 ? `Resend code in ${cooldown}s` : (resending ? 'Sending…' : 'Resend code')}
                            </button>
                            <Link href={route('login')} className="text-gray-500 hover:text-gray-700">
                                ← Back to login
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

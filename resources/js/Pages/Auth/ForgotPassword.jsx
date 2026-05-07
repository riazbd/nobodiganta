import { Head, Link, useForm } from '@inertiajs/react';

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('password.email'));
    };

    return (
        <>
            <Head title="Forgot Password" />
            <div className="min-h-screen flex items-center justify-center bg-[#f0f2f8] p-8">
                <div className="w-full max-w-md">
                    {/* Logo */}
                    <div className="text-center mb-8">
                        <Link href={route('login')} className="inline-block">
                            <div className="text-4xl font-extrabold text-[#263238] font-['Noto_Serif_Bengali']">
                                নবদিগন্ত
                            </div>
                        </Link>
                        <div className="text-xs text-gray-500 tracking-widest uppercase mt-1">Admin Panel</div>
                    </div>

                    {/* Card */}
                    <div className="bg-white rounded-xl shadow-md p-8 border border-gray-100">
                        {/* Icon */}
                        <div className="w-14 h-14 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-center mx-auto mb-5">
                            <svg className="w-7 h-7 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                            </svg>
                        </div>

                        <h1 className="text-xl font-bold text-gray-900 text-center mb-2">Forgot your password?</h1>
                        <p className="text-sm text-gray-500 text-center mb-6">
                            No problem. Enter your email and we'll send you a link to reset it.
                        </p>

                        {/* Status */}
                        {status && (
                            <div className="mb-5 text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 flex items-center gap-2">
                                <span className="text-base">✓</span> {status}
                            </div>
                        )}

                        <form onSubmit={submit} className="space-y-5">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Email address
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                                        <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        required
                                        autoFocus
                                        autoComplete="email"
                                        placeholder="you@example.com"
                                        className="w-full border border-gray-300 rounded-xl pl-11 pr-4 py-2.75 text-sm outline-none focus:border-[#263238] focus:ring-2 focus:ring-[#263238]/20 transition-all bg-white"
                                    />
                                </div>
                                {errors.email && <p className="mt-1.5 text-xs text-red-600">{errors.email}</p>}
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full bg-[#263238] text-white font-semibold py-3 rounded-xl hover:bg-[#1a2428] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#263238]/20"
                            >
                                {processing ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        Sending...
                                    </span>
                                ) : 'Send reset link'}
                            </button>
                        </form>
                    </div>

                    {/* Back to Login */}
                    <div className="mt-6 text-center">
                        <Link href={route('login')} className="text-sm text-[#263238] hover:underline font-medium inline-flex items-center gap-1.5">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Back to login
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}

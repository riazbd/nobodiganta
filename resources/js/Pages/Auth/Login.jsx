import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <>
            <Head title="Log in" />
            <div className="min-h-screen flex bg-[#f0f2f8]">
                {/* Left Panel - Branding */}
                <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#e8001e] to-[#b8001a] items-center justify-center relative overflow-hidden">
                    {/* Decorative circles */}
                    <div className="absolute top-20 left-20 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
                    <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
                    <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-white/10 rounded-full blur-2xl" />

                    <div className="relative z-10 text-center text-white px-12 max-w-lg">
                        <div className="text-6xl font-extrabold font-['Noto_Serif_Bengali'] mb-6 tracking-tight">
                            নবদিগন্ত
                        </div>
                        <div className="text-lg font-medium tracking-widest uppercase opacity-80 mb-8">
                            Admin Panel v2.6
                        </div>
                        <div className="text-base opacity-75 leading-relaxed">
                            Manage your news portal with powerful tools for content, analytics, and team collaboration.
                        </div>
                        <div className="mt-10 flex items-center justify-center gap-6 text-sm opacity-60">
                            <span>📰 Content</span>
                            <span>📊 Analytics</span>
                            <span>👥 Team</span>
                        </div>
                    </div>
                </div>

                {/* Right Panel - Login Form */}
                <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
                    <div className="w-full max-w-md">
                        {/* Mobile Logo */}
                        <div className="lg:hidden text-center mb-8">
                            <div className="text-4xl font-extrabold text-[#e8001e] font-['Noto_Serif_Bengali']">
                                নবদিগন্ত
                            </div>
                            <div className="text-xs text-gray-500 tracking-widest uppercase mt-1">Admin Panel</div>
                        </div>

                        {/* Welcome Text */}
                        <div className="mb-8">
                            <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
                            <p className="text-sm text-gray-500 mt-1.5">Sign in to your account to continue</p>
                        </div>

                        {/* Status Message */}
                        {status && (
                            <div className="mb-6 text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 flex items-center gap-2">
                                <span className="text-base">✓</span> {status}
                            </div>
                        )}

                        {/* Error Messages */}
                        {(errors.email || errors.password) && (
                            <div className="mb-6 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                                Invalid credentials. Please try again.
                            </div>
                        )}

                        {/* Form */}
                        <form onSubmit={submit} className="space-y-5">
                            {/* Email */}
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
                                        placeholder="admin@nobodiganta.com"
                                        className="w-full border border-gray-300 rounded-xl pl-11 pr-4 py-2.75 text-sm outline-none focus:border-[#e8001e] focus:ring-2 focus:ring-[#e8001e]/20 transition-all bg-white"
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                        Password
                                    </label>
                                    {canResetPassword && (
                                        <Link
                                            href={route('password.request')}
                                            className="text-xs text-[#e8001e] hover:underline font-medium"
                                        >
                                            Forgot password?
                                        </Link>
                                    )}
                                </div>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                                        <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                    </div>
                                    <input
                                        id="password"
                                        type="password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        required
                                        autoComplete="current-password"
                                        placeholder="••••••••"
                                        className="w-full border border-gray-300 rounded-xl pl-11 pr-4 py-2.75 text-sm outline-none focus:border-[#e8001e] focus:ring-2 focus:ring-[#e8001e]/20 transition-all bg-white"
                                    />
                                </div>
                            </div>

                            {/* Remember */}
                            <div className="flex items-center">
                                <input
                                    id="remember"
                                    type="checkbox"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                    className="w-4 h-4 text-[#e8001e] border-gray-300 rounded focus:ring-[#e8001e] cursor-pointer"
                                />
                                <label htmlFor="remember" className="ml-2.5 text-sm text-gray-600 cursor-pointer select-none">
                                    Remember me for 30 days
                                </label>
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full bg-[#e8001e] text-white font-semibold py-3 rounded-xl hover:bg-[#c0001a] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#e8001e]/25 hover:shadow-[#e8001e]/40"
                            >
                                {processing ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        Signing in...
                                    </span>
                                ) : 'Sign in'}
                            </button>
                        </form>

                        {/* Footer */}
                        <div className="mt-8 text-center">
                            <p className="text-xs text-gray-400">
                                Protected by reCAPTCHA and subject to the Privacy Policy
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

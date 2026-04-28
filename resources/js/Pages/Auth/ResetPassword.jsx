import { Head, useForm } from '@inertiajs/react';

export default function ResetPassword({ token, email }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('password.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <>
            <Head title="Reset Password" />
            <div className="min-h-screen flex items-center justify-center bg-[#f0f2f8] p-8">
                <div className="w-full max-w-md">
                    {/* Logo */}
                    <div className="text-center mb-8">
                        <div className="text-4xl font-extrabold text-[#e8001e] font-['Noto_Serif_Bengali']">
                            নবদিগন্ত
                        </div>
                        <div className="text-xs text-gray-500 tracking-widest uppercase mt-1">Admin Panel</div>
                    </div>

                    {/* Card */}
                    <div className="bg-white rounded-xl shadow-md p-8 border border-gray-100">
                        {/* Icon */}
                        <div className="w-14 h-14 bg-[#e8001e]/5 border border-[#e8001e]/20 rounded-xl flex items-center justify-center mx-auto mb-5">
                            <svg className="w-7 h-7 text-[#e8001e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                            </svg>
                        </div>

                        <h1 className="text-xl font-bold text-gray-900 text-center mb-2">Reset your password</h1>
                        <p className="text-sm text-gray-500 text-center mb-6">
                            Enter a new password for your account
                        </p>

                        <form onSubmit={submit} className="space-y-5">
                            {/* Email (read-only) */}
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Email
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    readOnly
                                    className="w-full border border-gray-200 rounded-xl px-4 py-2.75 text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
                                />
                            </div>

                            {/* New Password */}
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                                    New password
                                </label>
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
                                        autoFocus
                                        autoComplete="new-password"
                                        placeholder="Min. 8 characters"
                                        className="w-full border border-gray-300 rounded-xl pl-11 pr-4 py-2.75 text-sm outline-none focus:border-[#e8001e] focus:ring-2 focus:ring-[#e8001e]/20 transition-all bg-white"
                                    />
                                </div>
                                {errors.password && <p className="mt-1.5 text-xs text-red-600">{errors.password}</p>}
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Confirm new password
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                                        <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                        </svg>
                                    </div>
                                    <input
                                        id="password_confirmation"
                                        type="password"
                                        value={data.password_confirmation}
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                        required
                                        autoComplete="new-password"
                                        placeholder="Re-enter password"
                                        className="w-full border border-gray-300 rounded-xl pl-11 pr-4 py-2.75 text-sm outline-none focus:border-[#e8001e] focus:ring-2 focus:ring-[#e8001e]/20 transition-all bg-white"
                                    />
                                </div>
                                {errors.password_confirmation && <p className="mt-1.5 text-xs text-red-600">{errors.password_confirmation}</p>}
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full bg-[#e8001e] text-white font-semibold py-3 rounded-xl hover:bg-[#c0001a] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#e8001e]/25"
                            >
                                {processing ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        Resetting...
                                    </span>
                                ) : 'Reset password'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}

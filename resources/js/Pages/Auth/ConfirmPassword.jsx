import { Head, useForm } from '@inertiajs/react';

export default function ConfirmPassword() {
    const { data, setData, post, processing, errors, reset } = useForm({
        password: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('password.confirm'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <>
            <Head title="Confirm Password" />
            <div className="min-h-screen flex items-center justify-center bg-[#f0f2f8] p-8">
                <div className="w-full max-w-md">
                    {/* Logo */}
                    <div className="text-center mb-8">
                        <div className="text-4xl font-extrabold text-[#263238] font-['Noto_Serif_Bengali']">
                            নবদিগন্ত
                        </div>
                        <div className="text-xs text-gray-500 tracking-widest uppercase mt-1">Admin Panel</div>
                    </div>

                    {/* Card */}
                    <div className="bg-white rounded-xl shadow-md p-8 border border-gray-100">
                        {/* Icon */}
                        <div className="w-14 h-14 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-center mx-auto mb-5">
                            <svg className="w-7 h-7 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>

                        <h1 className="text-xl font-bold text-gray-900 text-center mb-2">Confirm your password</h1>
                        <p className="text-sm text-gray-500 text-center mb-6">
                            This is a secure area of the application. Please confirm your password before continuing.
                        </p>

                        {errors.password && (
                            <div className="mb-5 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                                {errors.password}
                            </div>
                        )}

                        <form onSubmit={submit} className="space-y-5">
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Password
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
                                        autoComplete="current-password"
                                        placeholder="Enter your password"
                                        className="w-full border border-gray-300 rounded-xl pl-11 pr-4 py-2.75 text-sm outline-none focus:border-[#263238] focus:ring-2 focus:ring-[#263238]/20 transition-all bg-white"
                                    />
                                </div>
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
                                        Confirming...
                                    </span>
                                ) : 'Confirm password'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}

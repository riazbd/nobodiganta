import { Head, Link, useForm, usePage } from '@inertiajs/react';

export default function VerifyEmail({ status }) {
    const { post, processing } = useForm({});
    const { props } = usePage();
    const user = props.auth?.user;

    const submit = (e) => {
        e.preventDefault();
        post(route('verification.send'));
    };

    return (
        <>
            <Head title="Verify Email" />
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
                        <div className="w-14 h-14 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-center mx-auto mb-5">
                            <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>

                        <h1 className="text-xl font-bold text-gray-900 text-center mb-2">Verify your email</h1>
                        <p className="text-sm text-gray-500 text-center mb-6">
                            Thanks for signing up! Before getting started, could you verify your email address by clicking on the link we just emailed to you?
                        </p>

                        {status === 'verification-link-sent' && (
                            <div className="mb-5 text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 flex items-center gap-2">
                                <span className="text-base">✓</span> A new verification link has been sent to your email.
                            </div>
                        )}

                        <form onSubmit={submit} className="space-y-4">
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full bg-[#e8001e] text-white font-semibold py-3 rounded-xl hover:bg-[#c0001a] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#e8001e]/25"
                            >
                                {processing ? 'Sending...' : 'Resend verification email'}
                            </button>
                        </form>

                        <div className="mt-6 pt-5 border-t border-gray-100">
                            <Link
                                href={route('logout')}
                                method="post"
                                as="button"
                                className="w-full text-center text-sm text-gray-500 hover:text-gray-700 font-medium"
                            >
                                Log out
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

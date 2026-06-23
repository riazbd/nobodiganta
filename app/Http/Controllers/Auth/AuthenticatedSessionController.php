<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Models\User;
use App\Services\EmailOtp;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Route;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
            // Null/empty when not configured → the login page skips the captcha entirely.
            'turnstileSiteKey' => config('services.turnstile.site_key'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request, EmailOtp $otp)
    {
        // Default flow (OTP disabled) — straight password login.
        if (! $otp->enabled()) {
            $request->authenticate();
            $request->session()->regenerate();
            $request->user()->update(['last_login_at' => now()]);

            // Force a full browser redirect so the new session's CSRF token is
            // rendered into the meta tag. A standard redirect() would be followed
            // by Inertia as an SPA navigation, leaving the old token in the DOM.
            return Inertia::location(route('admin.dashboard', absolute: false));
        }

        // OTP enabled — verify credentials WITHOUT logging in first.
        $user = $request->validateCredentials();

        // Supreme/super admins bypass 2FA — log in straight away.
        if ($user->isSuperAdmin()) {
            Auth::login($user, $request->boolean('remember'));
            $request->session()->regenerate();
            $user->update(['last_login_at' => now()]);

            return Inertia::location(route('admin.dashboard', absolute: false));
        }

        // Everyone else gets an emailed code.
        try {
            $otp->send($user);
        } catch (\Throwable $e) {
            Log::error('Login OTP send failed: ' . $e->getMessage());
            throw ValidationException::withMessages([
                'email' => 'যাচাইকরণ কোড পাঠানো যায়নি। পরে আবার চেষ্টা করুন। / Could not send the verification code. Please try again.',
            ]);
        }

        return redirect()->route('login.otp');
    }

    /**
     * Show the OTP entry step (only reachable mid-login).
     */
    public function showOtp(EmailOtp $otp): Response|RedirectResponse
    {
        if (! $otp->enabled() || ! $otp->pending()) {
            return redirect()->route('login');
        }

        return Inertia::render('Auth/VerifyOtp', [
            'email' => $otp->maskedEmail(),
            'resendIn' => $otp->resendCooldownRemaining(),
            'status' => session('status'),
        ]);
    }

    /**
     * Verify the emailed code and, on success, complete the login.
     */
    public function verifyOtp(Request $request, EmailOtp $otp)
    {
        if (! $otp->enabled() || ! $otp->pending()) {
            return redirect()->route('login');
        }

        $request->validate(['code' => ['required', 'string']]);

        $result = $otp->verify(trim((string) $request->input('code')));

        if ($result === 'ok') {
            $userId = $otp->userId();
            $otp->clear();
            Auth::loginUsingId($userId);
            $request->session()->regenerate();
            $request->user()->update(['last_login_at' => now()]);

            return Inertia::location(route('admin.dashboard', absolute: false));
        }

        // expired / locked / none → the challenge is gone; send back to login.
        if (in_array($result, ['expired', 'locked', 'none'], true)) {
            $msg = [
                'expired' => 'কোডের মেয়াদ শেষ। আবার লগইন করুন। / The code expired. Please log in again.',
                'locked'  => 'অনেকবার ভুল হয়েছে। আবার লগইন করুন। / Too many attempts. Please log in again.',
                'none'    => 'সেশন শেষ। আবার লগইন করুন। / Session expired. Please log in again.',
            ][$result];

            return redirect()->route('login')->withErrors(['email' => $msg]);
        }

        return back()->withErrors(['code' => 'কোডটি সঠিক নয়। / Incorrect code.']);
    }

    /**
     * Resend a fresh OTP (rate-limited by a cooldown).
     */
    public function resendOtp(EmailOtp $otp): RedirectResponse
    {
        if (! $otp->enabled() || ! $otp->pending()) {
            return redirect()->route('login');
        }

        if (! $otp->canResend()) {
            return back()->withErrors(['code' => 'একটু পরে আবার চেষ্টা করুন। / Please wait before requesting another code.']);
        }

        $user = User::find($otp->userId());
        if (! $user) {
            $otp->clear();
            return redirect()->route('login');
        }

        try {
            $otp->send($user);
        } catch (\Throwable $e) {
            Log::error('Login OTP resend failed: ' . $e->getMessage());
            return back()->withErrors(['code' => 'কোড পাঠানো যায়নি। / Could not send the code.']);
        }

        return back()->with('status', 'নতুন কোড পাঠানো হয়েছে। / A new code has been sent.');
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/');
    }
}

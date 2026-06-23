<?php

namespace App\Services;

use App\Mail\LoginOtpMail;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;

/**
 * Session-based login OTP (email 2FA). Holds an interim challenge between a
 * correct password and a completed login — no DB table needed; the pending
 * state lives in the visitor's session and is cleared once login completes.
 */
class EmailOtp
{
    private const KEY = 'login_otp';

    public function enabled(): bool
    {
        return (bool) config('auth.email_otp.enabled', false);
    }

    public function pending(): bool
    {
        return session()->has(self::KEY);
    }

    public function userId(): ?int
    {
        return session(self::KEY . '.user_id');
    }

    /** Email a fresh code and (re)start the challenge for this user. */
    public function send(User $user): void
    {
        $length = max(4, min(8, (int) config('auth.email_otp.length', 6)));
        $code = str_pad((string) random_int(0, (10 ** $length) - 1), $length, '0', STR_PAD_LEFT);
        $minutes = (int) config('auth.email_otp.expiry_minutes', 10);

        session()->put(self::KEY, [
            'user_id' => $user->id,
            'email' => $user->email,
            'hash' => Hash::make($code),
            'expires_at' => now()->addMinutes($minutes)->getTimestamp(),
            'attempts' => 0,
            'last_sent_at' => now()->getTimestamp(),
        ]);

        Mail::to($user->email)->send(new LoginOtpMail($code, $minutes, $user->name));
    }

    /**
     * Verify a submitted code. Returns one of:
     *   ok | invalid | expired | locked | none
     * On success it does NOT clear the session — the caller logs the user in
     * (reading userId() first) and then calls clear().
     */
    public function verify(string $code): string
    {
        $data = session(self::KEY);
        if (! $data) {
            return 'none';
        }
        if (now()->getTimestamp() > $data['expires_at']) {
            $this->clear();
            return 'expired';
        }

        $max = (int) config('auth.email_otp.max_attempts', 5);
        if ($data['attempts'] >= $max) {
            $this->clear();
            return 'locked';
        }

        if (! Hash::check($code, $data['hash'])) {
            $data['attempts']++;
            session()->put(self::KEY, $data);
            if ($data['attempts'] >= $max) {
                $this->clear();
                return 'locked';
            }
            return 'invalid';
        }

        return 'ok';
    }

    public function canResend(): bool
    {
        $data = session(self::KEY);
        if (! $data) {
            return false;
        }
        $cooldown = (int) config('auth.email_otp.resend_cooldown_seconds', 60);
        return now()->getTimestamp() - $data['last_sent_at'] >= $cooldown;
    }

    public function resendCooldownRemaining(): int
    {
        $data = session(self::KEY);
        if (! $data) {
            return 0;
        }
        $cooldown = (int) config('auth.email_otp.resend_cooldown_seconds', 60);
        return max(0, $cooldown - (now()->getTimestamp() - $data['last_sent_at']));
    }

    /** Masked email for display, e.g. j***@example.com */
    public function maskedEmail(): ?string
    {
        $email = session(self::KEY . '.email');
        if (! $email || ! str_contains($email, '@')) {
            return $email;
        }
        [$name, $domain] = explode('@', $email, 2);
        $visible = mb_substr($name, 0, 1);
        return $visible . str_repeat('*', max(1, mb_strlen($name) - 1)) . '@' . $domain;
    }

    public function clear(): void
    {
        session()->forget(self::KEY);
    }
}

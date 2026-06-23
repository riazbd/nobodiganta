<?php

namespace App\Services;

use App\Mail\LoginOtpMail;
use App\Models\LoginOtp;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;

/**
 * Login OTP (email 2FA). The challenge is persisted in the `login_otps` table;
 * the session holds only a pointer (the row id) so the unauthenticated browser
 * can be tied to its pending challenge. Login completes only after a valid code.
 */
class EmailOtp
{
    private const KEY = 'login_otp_id';

    public function enabled(): bool
    {
        return (bool) config('auth.email_otp.enabled', false);
    }

    /** The active (unconsumed, unexpired) challenge for this browser, if any. */
    private function current(): ?LoginOtp
    {
        $id = session(self::KEY);
        if (! $id) {
            return null;
        }
        return LoginOtp::whereNull('consumed_at')->find($id);
    }

    public function pending(): bool
    {
        $otp = $this->current();
        return $otp !== null && $otp->expires_at->isFuture();
    }

    public function userId(): ?int
    {
        return optional($this->current())->user_id;
    }

    /** Create + email a fresh code, replacing any previous pending one for the user. */
    public function send(User $user): void
    {
        $length = max(4, min(8, (int) config('auth.email_otp.length', 6)));
        $code = str_pad((string) random_int(0, (10 ** $length) - 1), $length, '0', STR_PAD_LEFT);
        $minutes = (int) config('auth.email_otp.expiry_minutes', 10);

        // Only one active challenge per user.
        LoginOtp::where('user_id', $user->id)->whereNull('consumed_at')->delete();

        $otp = LoginOtp::create([
            'user_id' => $user->id,
            'code_hash' => Hash::make($code),
            'attempts' => 0,
            'expires_at' => now()->addMinutes($minutes),
            'last_sent_at' => now(),
        ]);

        session()->put(self::KEY, $otp->id);

        Mail::to($user->email)->send(new LoginOtpMail($code, $minutes, $user->name));
    }

    /**
     * Verify a submitted code. Returns: ok | invalid | expired | locked | none.
     * On success it does NOT consume the row — the caller logs the user in
     * (reading userId() first) and then calls clear().
     */
    public function verify(string $code): string
    {
        $otp = $this->current();
        if (! $otp) {
            return 'none';
        }
        if ($otp->expires_at->isPast()) {
            $this->clear();
            return 'expired';
        }

        $max = (int) config('auth.email_otp.max_attempts', 5);
        if ($otp->attempts >= $max) {
            $this->clear();
            return 'locked';
        }

        if (! Hash::check($code, $otp->code_hash)) {
            $otp->increment('attempts');
            if ($otp->attempts >= $max) {
                $this->clear();
                return 'locked';
            }
            return 'invalid';
        }

        return 'ok';
    }

    public function canResend(): bool
    {
        $otp = $this->current();
        if (! $otp) {
            return false;
        }
        $cooldown = (int) config('auth.email_otp.resend_cooldown_seconds', 60);
        return (now()->getTimestamp() - $otp->last_sent_at->getTimestamp()) >= $cooldown;
    }

    public function resendCooldownRemaining(): int
    {
        $otp = $this->current();
        if (! $otp) {
            return 0;
        }
        $cooldown = (int) config('auth.email_otp.resend_cooldown_seconds', 60);
        return max(0, $cooldown - (now()->getTimestamp() - $otp->last_sent_at->getTimestamp()));
    }

    /** Masked email for display, e.g. j***@example.com */
    public function maskedEmail(): ?string
    {
        $email = optional(optional($this->current())->user)->email;
        if (! $email || ! str_contains($email, '@')) {
            return $email;
        }
        [$name, $domain] = explode('@', $email, 2);
        return mb_substr($name, 0, 1) . str_repeat('*', max(1, mb_strlen($name) - 1)) . '@' . $domain;
    }

    /** Mark the active challenge consumed and drop the session pointer. */
    public function clear(): void
    {
        $id = session(self::KEY);
        if ($id) {
            LoginOtp::where('id', $id)->update(['consumed_at' => now()]);
            session()->forget(self::KEY);
        }
    }
}

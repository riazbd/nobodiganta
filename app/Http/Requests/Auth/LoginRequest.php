<?php

namespace App\Http\Requests\Auth;

use Illuminate\Auth\Events\Lockout;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class LoginRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ];
    }

    /**
     * Attempt to authenticate the request's credentials.
     *
     * @throws ValidationException
     */
    public function authenticate(): void
    {
        $this->ensureIsNotRateLimited();
        $this->ensureTurnstilePassed();

        if (! Auth::attempt($this->only('email', 'password'), $this->boolean('remember'))) {
            RateLimiter::hit($this->throttleKey());

            throw ValidationException::withMessages([
                'email' => trans('auth.failed'),
            ]);
        }

        RateLimiter::clear($this->throttleKey());
    }

    /**
     * Verify the Cloudflare Turnstile token. Skipped entirely when no secret is
     * configured, so login keeps working until the keys are set in .env.
     *
     * @throws ValidationException
     */
    public function ensureTurnstilePassed(): void
    {
        $secret = config('services.turnstile.secret');
        if (empty($secret)) {
            return;
        }

        $token = (string) $this->input('cf_turnstile_response');

        $verified = false;
        if ($token !== '') {
            try {
                $response = Http::asForm()
                    ->timeout(8)
                    ->post('https://challenges.cloudflare.com/turnstile/v0/siteverify', [
                        'secret'   => $secret,
                        'response' => $token,
                        'remoteip' => $this->ip(),
                    ]);
                $verified = $response->ok() && $response->json('success') === true;
            } catch (\Throwable $e) {
                $verified = false;
            }
        }

        if (! $verified) {
            throw ValidationException::withMessages([
                'captcha' => 'মানব যাচাই ব্যর্থ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।',
            ]);
        }
    }

    /**
     * Ensure the login request is not rate limited.
     *
     * @throws ValidationException
     */
    public function ensureIsNotRateLimited(): void
    {
        if (! RateLimiter::tooManyAttempts($this->throttleKey(), 5)) {
            return;
        }

        event(new Lockout($this));

        $seconds = RateLimiter::availableIn($this->throttleKey());

        throw ValidationException::withMessages([
            'email' => trans('auth.throttle', [
                'seconds' => $seconds,
                'minutes' => ceil($seconds / 60),
            ]),
        ]);
    }

    /**
     * Get the rate limiting throttle key for the request.
     */
    public function throttleKey(): string
    {
        return Str::transliterate(Str::lower($this->string('email')).'|'.$this->ip());
    }
}

<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class LoginOtpMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $code,
        public int $expiryMinutes,
        public ?string $userName = null,
    ) {}

    public function build(): self
    {
        return $this->subject('আপনার লগইন কোড / Your login code: ' . $this->code)
            ->view('emails.login-otp');
    }
}

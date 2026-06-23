@php($siteName = config('app.name', 'নবদিগন্ত'))
<!DOCTYPE html>
<html lang="bn">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ $siteName }} — Login code</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,'Segoe UI',sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:24px 0;">
        <tr>
            <td align="center">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:460px;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e8e8e8;">
                    <tr>
                        <td style="background:#e8001e;padding:18px 24px;color:#ffffff;font-size:18px;font-weight:bold;">
                            {{ $siteName }}
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:28px 24px 8px;color:#1a1d2e;font-size:15px;">
                            @if($userName)
                                <p style="margin:0 0 14px;">হ্যালো {{ $userName }},</p>
                            @endif
                            <p style="margin:0 0 6px;">আপনার লগইন যাচাইকরণ কোড / Your login verification code:</p>
                        </td>
                    </tr>
                    <tr>
                        <td align="center" style="padding:8px 24px 4px;">
                            <div style="display:inline-block;background:#f7f7f9;border:1px solid #e8e8e8;border-radius:10px;padding:14px 26px;font-size:34px;font-weight:bold;letter-spacing:10px;color:#111;font-family:'Courier New',monospace;">
                                {{ $code }}
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:14px 24px 26px;color:#6b7280;font-size:13px;line-height:1.6;">
                            <p style="margin:0 0 8px;">এই কোডটি <strong>{{ $expiryMinutes }} মিনিট</strong> পর্যন্ত বৈধ। / This code is valid for {{ $expiryMinutes }} minutes.</p>
                            <p style="margin:0;">আপনি যদি লগইন করার চেষ্টা না করে থাকেন, এই ইমেইলটি উপেক্ষা করুন। / If you didn't try to sign in, you can safely ignore this email.</p>
                        </td>
                    </tr>
                </table>
                <p style="color:#9ca3af;font-size:11px;margin:16px 0 0;">© {{ date('Y') }} {{ $siteName }}</p>
            </td>
        </tr>
    </table>
</body>
</html>

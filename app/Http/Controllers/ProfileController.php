<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use App\Services\EmailOtp;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function edit(Request $request, EmailOtp $otp): Response
    {
        return Inertia::render('features/admin/pages/Profile', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => session('status'),
            'user' => $request->user(),
            // Whether 2FA is switched on system-wide. The per-account toggle is
            // only meaningful (active) while this is true.
            'twoFactorSystemEnabled' => $otp->enabled(),
        ]);
    }

    /**
     * Toggle login 2FA for the current user's own account (opt-in).
     */
    public function updateTwoFactor(Request $request, EmailOtp $otp): RedirectResponse
    {
        // The personal toggle is only operable while 2FA is on system-wide.
        if (! $otp->enabled()) {
            return Redirect::route('admin.profile.edit')->withErrors([
                'two_factor_enabled' => 'Two-factor authentication is disabled by the administrator.',
            ]);
        }

        $validated = $request->validate([
            'two_factor_enabled' => ['required', 'boolean'],
        ]);

        $user = $request->user();
        $user->two_factor_enabled = $validated['two_factor_enabled'];
        $user->save();

        return Redirect::route('admin.profile.edit')->with(
            'success',
            $user->two_factor_enabled ? 'Two-factor authentication enabled.' : 'Two-factor authentication disabled.'
        );
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $user = $request->user();
        $validated = $request->validated();

        if ($request->boolean('remove_photo')) {
            if ($user->profile_photo_path) {
                Storage::disk('public')->delete($user->profile_photo_path);
                $user->profile_photo_path = null;
            }
        } elseif ($request->hasFile('photo')) {
            // Delete old photo if exists
            if ($user->profile_photo_path) {
                Storage::disk('public')->delete($user->profile_photo_path);
            }
            
            $path = $request->file('photo')->store('profile-photos', 'public');
            $user->profile_photo_path = $path;
        }

        $user->fill([
            'name' => $validated['name'],
            'email' => $validated['email'],
        ]);

        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        $user->save();

        return Redirect::route('profile.edit')->with('success', 'Profile updated successfully');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }
}

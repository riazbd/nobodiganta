<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Newsletter;
use Illuminate\Http\Request;
use Inertia\Inertia;

class NewsletterController extends Controller
{
    public function index()
    {
        if (!auth()->user()->hasPermission('newsletter.create')) abort(403);
        $newsletters = Newsletter::latest()->get();
        return Inertia::render('features/admin/pages/Newsletter', ['newsletters' => $newsletters]);
    }

    public function store(Request $request)
    {
        if (!auth()->user()->hasPermission('newsletter.create')) abort(403);
        
        $validated = $request->validate([
            'subject_bn' => 'required|string',
            'subject_en' => 'required|string',
            'content_bn' => 'nullable|string',
            'content_en' => 'nullable|string',
            'status' => 'required|in:draft,sent',
        ]);

        if ($validated['status'] === 'sent') {
            $validated['sent_at'] = now();
        }

        Newsletter::create($validated);

        return back()->with('success', 'Newsletter saved');
    }

    public function destroy(Newsletter $newsletter)
    {
        if (!auth()->user()->hasPermission('newsletter.create')) abort(403);
        $newsletter->delete();
        return back()->with('success', 'Newsletter deleted');
    }
}

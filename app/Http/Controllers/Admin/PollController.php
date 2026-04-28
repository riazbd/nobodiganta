<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Poll;
use App\Models\PollOption;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PollController extends Controller
{
    public function index()
    {
        if (!auth()->user()->hasPermission('widgets.polls.manage')) abort(403);
        $polls = Poll::with('options')->latest('start_date')->get();
        return Inertia::render('features/admin/pages/operations/PollManagement', ['polls' => $polls]);
    }

    public function store(Request $request)
    {
        if (!auth()->user()->hasPermission('widgets.polls.manage')) abort(403);
        
        $validated = $request->validate([
            'question_bn' => 'required|string|max:255',
            'question_en' => 'required|string|max:255',
            'is_active' => 'boolean',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'options' => 'required|array|min:2',
            'options.*.option_bn' => 'required|string',
            'options.*.option_en' => 'required|string',
        ]);

        if ($validated['is_active']) {
            Poll::where('is_active', true)->update(['is_active' => false]);
        }

        $poll = Poll::create([
            'question_bn' => $validated['question_bn'],
            'question_en' => $validated['question_en'],
            'is_active' => $validated['is_active'] ?? false,
            'start_date' => $validated['start_date'],
            'end_date' => $validated['end_date'],
        ]);

        foreach ($validated['options'] as $opt) {
            $poll->options()->create([
                'option_bn' => $opt['option_bn'],
                'option_en' => $opt['option_en'],
                'votes' => $opt['votes'] ?? 0,
            ]);
        }

        return back()->with('success', 'Poll created successfully');
    }

    public function destroy(Poll $poll)
    {
        if (!auth()->user()->hasPermission('widgets.polls.manage')) abort(403);
        $poll->delete();
        return back()->with('success', 'Poll deleted');
    }
}

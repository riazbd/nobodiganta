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
            'question_bn'          => 'required|string|max:255',
            'question_en'          => 'required|string|max:255',
            'is_active'            => 'boolean',
            'start_date'           => 'required|date',
            'end_date'             => 'nullable|date|after_or_equal:start_date',
            'featured_image'       => 'nullable|string|max:500',
            'options'              => 'required|array|min:2',
            'options.*.option_bn'  => 'required|string|max:255',
            'options.*.option_en'  => 'required|string|max:255',
            'options.*.votes'      => 'nullable|integer|min:0',
        ]);

        $isActive = $validated['is_active'] ?? false;

        if ($isActive) {
            Poll::where('is_active', true)->update(['is_active' => false]);
        }

        $seededVotes = collect($validated['options'])->sum(fn($o) => $o['votes'] ?? 0);

        $poll = Poll::create([
            'question_bn'    => $validated['question_bn'],
            'question_en'    => $validated['question_en'],
            'is_active'      => $isActive,
            'start_date'     => $validated['start_date'],
            'end_date'       => $validated['end_date'] ?? null,
            'featured_image' => $validated['featured_image'] ?? null,
            'total_votes'    => $seededVotes,
        ]);

        foreach ($validated['options'] as $opt) {
            $poll->options()->create([
                'option_bn' => $opt['option_bn'],
                'option_en' => $opt['option_en'],
                'votes'     => $opt['votes'] ?? 0,
            ]);
        }

        return back()->with('success', 'Poll created successfully');
    }

    public function update(Request $request, Poll $poll)
    {
        if (!auth()->user()->hasPermission('widgets.polls.manage')) abort(403);

        $validated = $request->validate([
            'question_bn'          => 'required|string|max:255',
            'question_en'          => 'required|string|max:255',
            'is_active'            => 'boolean',
            'start_date'           => 'required|date',
            'end_date'             => 'nullable|date|after_or_equal:start_date',
            'featured_image'       => 'nullable|string|max:500',
            'options'              => 'required|array|min:2',
            'options.*.id'         => 'nullable|integer',
            'options.*.option_bn'  => 'required|string|max:255',
            'options.*.option_en'  => 'required|string|max:255',
            'options.*.votes'      => 'nullable|integer|min:0',
        ]);

        $isActive = $validated['is_active'] ?? false;

        if ($isActive && !$poll->is_active) {
            Poll::where('is_active', true)->where('id', '!=', $poll->id)->update(['is_active' => false]);
        }

        $poll->update([
            'question_bn'    => $validated['question_bn'],
            'question_en'    => $validated['question_en'],
            'is_active'      => $isActive,
            'start_date'     => $validated['start_date'],
            'end_date'       => $validated['end_date'] ?? null,
            'featured_image' => $validated['featured_image'] ?? null,
        ]);

        // Sync options: delete removed, update existing (preserve votes), create new
        $submittedIds = collect($validated['options'])->pluck('id')->filter()->values()->all();
        $poll->options()->whereNotIn('id', $submittedIds)->delete();

        foreach ($validated['options'] as $opt) {
            if (!empty($opt['id'])) {
                $poll->options()->where('id', $opt['id'])->update([
                    'option_bn' => $opt['option_bn'],
                    'option_en' => $opt['option_en'],
                ]);
            } else {
                $poll->options()->create([
                    'option_bn' => $opt['option_bn'],
                    'option_en' => $opt['option_en'],
                    'votes'     => $opt['votes'] ?? 0,
                ]);
            }
        }

        $poll->update(['total_votes' => $poll->options()->sum('votes')]);

        return back()->with('success', 'Poll updated successfully');
    }

    public function toggle(Poll $poll)
    {
        if (!auth()->user()->hasPermission('widgets.polls.manage')) abort(403);

        if (!$poll->is_active) {
            Poll::where('is_active', true)->update(['is_active' => false]);
        }

        $poll->update(['is_active' => !$poll->is_active]);

        return back()->with('success', $poll->is_active ? 'Poll activated' : 'Poll deactivated');
    }

    public function destroy(Poll $poll)
    {
        if (!auth()->user()->hasPermission('widgets.polls.manage')) abort(403);
        $poll->options()->delete();
        $poll->delete();
        return back()->with('success', 'Poll deleted');
    }
}

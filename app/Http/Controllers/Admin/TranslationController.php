<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\TranslationService;
use Illuminate\Http\Request;

class TranslationController extends Controller
{
    protected TranslationService $translationService;

    public function __construct(TranslationService $translationService)
    {
        $this->translationService = $translationService;
    }

    /**
     * Handle batch translation requests from the admin panel.
     */
    public function translate(Request $request)
    {
        $validated = $request->validate([
            'fields' => 'required|array',
            'target_lang' => 'required|string|in:bn,en',
            'source_lang' => 'nullable|string|in:bn,en,auto',
        ]);

        $fields = $validated['fields'];
        $targetLang = $validated['target_lang'];
        $sourceLang = $validated['source_lang'] ?? 'auto';

        $translated = $this->translationService->batchTranslate($fields, $targetLang, $sourceLang);

        return response()->json([
            'success' => true,
            'translations' => $translated,
        ]);
    }
}

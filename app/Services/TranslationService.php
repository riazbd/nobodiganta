<?php

namespace App\Services;

use Stichoza\GoogleTranslate\GoogleTranslate;
use Illuminate\Support\Facades\Log;

class TranslationService
{
    /**
     * Primary translation method.
     */
    public function translate(?string $text, string $targetLang, string $sourceLang = 'auto'): ?string
    {
        if (empty($text)) return null;

        // Strip tags for a moment just to calculate realistic character count
        $cleanLength = mb_strlen(strip_tags($text));

        // If it's a short text, translate directly
        if ($cleanLength < 1000) {
            return $this->performTranslation($text, $targetLang, $sourceLang);
        }

        // For long text, split by HTML tags to preserve structure
        return $this->translateLongText($text, $targetLang, $sourceLang);
    }

    /**
     * Internal method to perform the actual API call.
     */
    private function performTranslation(string $text, string $targetLang, string $sourceLang): ?string
    {
        try {
            $tr = new GoogleTranslate();
            $tr->setOptions([
                'verify' => false,
                'timeout' => 20
            ]);
            $tr->setSource($sourceLang === 'auto' ? null : $sourceLang);
            $tr->setTarget($targetLang);
            
            return $tr->translate($text);
        } catch (\Exception $e) {
            Log::error("Direct translation failed: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Safely split HTML into chunks without breaking tags or multi-byte characters.
     */
    private function translateLongText(string $text, string $targetLang, string $sourceLang): string
    {
        // Split by common block-level closing tags or newlines
        $parts = preg_split('/(<\/p>|<\/h\d>|<\/li>|<\/blockquote>|\n)/i', $text, -1, PREG_SPLIT_DELIM_CAPTURE | PREG_SPLIT_NO_EMPTY);
        
        $chunks = [];
        $currentChunk = "";
        
        foreach ($parts as $part) {
            // If adding this part exceeds 1200 chars, push the current chunk and start fresh
            if (mb_strlen($currentChunk . $part) > 1200) {
                if (!empty($currentChunk)) {
                    $chunks[] = $currentChunk;
                    $currentChunk = "";
                }
            }
            $currentChunk .= $part;
        }
        
        if (!empty($currentChunk)) {
            $chunks[] = $currentChunk;
        }

        $translatedParts = [];
        foreach ($chunks as $chunk) {
            $translated = $this->performTranslation($chunk, $targetLang, $sourceLang);
            if ($translated) {
                $translatedParts[] = $translated;
            } else {
                // If translation fails for a chunk, keep the original to avoid losing data
                $translatedParts[] = $chunk;
            }
            // Minor delay for API courtesy
            usleep(50000); 
        }

        return implode('', $translatedParts);
    }
    
    /**
     * Batch translate an array of fields.
     */
    public function batchTranslate(array $fields, string $targetLang, string $sourceLang = 'auto'): array
    {
        $translated = [];

        foreach ($fields as $key => $text) {
            // Pass each field to the smart translate method
            $translated[$key] = $this->translate($text, $targetLang, $sourceLang);
        }

        return $translated;
    }
}

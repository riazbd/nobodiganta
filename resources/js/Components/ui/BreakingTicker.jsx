/**
 * Breaking news ticker using Server-Sent Events (SSE).
 * Automatically receives real-time updates from the server.
 */
import { useState, useEffect, useRef } from 'react';
import { useApp } from '../../contexts/AppContext';
import { useNavigation } from '../../contexts/NavigationContext';
import { AlertCircle, X } from 'lucide-react';

export default function BreakingTicker() {
  const { lang } = useApp();
  const { onNavigate } = useNavigation();
  const [headlines, setHeadlines] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const esRef = useRef(null);

  useEffect(() => {
    // Connect to SSE stream
    const connectSSE = () => {
      const es = new EventSource('/api/breaking-news/stream');
      esRef.current = es;

      es.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.success && data.news) {
            setHeadlines(data.news);
            setCurrentIndex(0);
          }
        } catch (e) {
          console.error('Failed to parse SSE data:', e);
        }
      };

      es.onerror = () => {
        console.error('SSE connection lost, reconnecting...');
        es.close();
        // Reconnect after 5 seconds
        setTimeout(connectSSE, 5000);
      };
    };

    connectSSE();

    return () => {
      if (esRef.current) {
        esRef.current.close();
      }
    };
  }, []);

  // Auto-rotate headlines every 5 seconds
  useEffect(() => {
    if (headlines.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % headlines.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [headlines.length]);

  if (!isVisible || headlines.length === 0) {
    return null;
  }

  const current = headlines[currentIndex];
  if (!current) return null;

  return (
    <div className="bg-red-600 text-white py-2 px-4 relative overflow-hidden">
      <div className="max-w-7xl mx-auto flex items-center gap-3">
        {/* Breaking label */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <AlertCircle className="w-4 h-4 animate-pulse" />
          <span className="font-bold text-xs uppercase tracking-wider">
            {lang === 'bn' ? 'ব্রেকিং' : 'BREAKING'}
          </span>
        </div>

        {/* Headline */}
        <div
          className="flex-1 text-sm font-medium cursor-pointer hover:underline truncate"
          onClick={() => onNavigate('article', {
            categorySlug: current.category_slug,
            articleSlug: current.slug,
          })}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onNavigate('article', {
            categorySlug: current.category_slug,
            articleSlug: current.slug,
          })}
        >
          {current.title}
        </div>

        {/* Close button */}
        <button
          onClick={() => setIsVisible(false)}
          className="flex-shrink-0 p-1 hover:bg-red-700 rounded transition-colors"
          aria-label={lang === 'bn' ? 'বন্ধ করুন' : 'Close'}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Progress dots */}
      {headlines.length > 1 && (
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-1">
          {headlines.map((_, i) => (
            <div
              key={i}
              className={`w-1.5 h-1.5 rounded-full transition-all ${
                i === currentIndex ? 'bg-white w-3' : 'bg-red-300'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

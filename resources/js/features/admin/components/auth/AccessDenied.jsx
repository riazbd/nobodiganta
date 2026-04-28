import { X } from 'lucide-react';

export default function AccessDenied({ onBack }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mb-6">
        <X className="w-10 h-10 text-red-500" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">অ্যাক্সেস অস্বীকৃত</h2>
      <p className="text-gray-500 mb-8 max-w-md">
        আপনার এই পৃষ্ঠা দেখার অনুমতি নেই। অনুগ্রহ করে আপনার অ্যাডমিনিস্ট্রেটরের সাথে যোগাযোগ করুন।
      </p>
      {onBack && (
        <button
          onClick={onBack}
          className="px-6 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
        >
          ড্যাশবোর্ডে ফিরে যান
        </button>
      )}
    </div>
  );
}

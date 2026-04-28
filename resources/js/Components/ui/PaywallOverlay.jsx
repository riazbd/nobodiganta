/**
 * Paywall overlay component - shown when user tries to access premium content
 * or has exceeded their monthly free article limit.
 */
import { useState } from 'react';
import { X, Lock, TrendingUp, Crown, Newspaper } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

export default function PaywallOverlay({ 
  reason = 'premium', 
  meterRemaining = 0,
  meterExceeded = false,
  onClose,
  onSubscribe 
}) {
  const { lang } = useApp();
  const [showPlans, setShowPlans] = useState(false);

  const isPremium = reason === 'premium';
  const isMeterExceeded = reason === 'meter_exceeded';

  const content = {
    bn: {
      premium: {
        title: '🔒 প্রিমিয়াম নিবন্ধ',
        subtitle: 'এই নিবন্ধটি শুধুমাত্র প্রিমিয়াম সাবস্ক্রাইবারদের জন্য',
        message: 'সম্পূর্ণ নিবন্ধটি পড়তে সাবস্ক্রাইব করুন',
      },
      meter: {
        title: '📊 বিনামূল্যে সীমা শেষ',
        subtitle: `আপনি এই মাসে ${10 - meterRemaining}টি নিবন্ধ পড়েছেন`,
        message: meterExceeded 
          ? 'আপনি আপনার মাসিক ১০টি বিনামূল্যে নিবন্ধের সীমা অতিক্রম করেছেন'
          : `আপনার আর ${meterRemaining}টি বিনামূল্যে নিবন্ধ বাকি`,
      },
      plans: {
        title: 'সাবস্ক্রিপশন পরিকল্পনা',
        free: {
          name: 'বিনামূল্যে',
          price: '৳০/মাস',
          features: ['মাসে ১০টি নিবন্ধ', 'সব বিজ্ঞাপন', 'ব্রেকিং নিউজ'],
        },
        digital: {
          name: 'ডিজিটাল',
          price: '৳৯৯/মাস',
          features: ['সীমাহীন ডিজিটাল অ্যাক্সেস', 'কম বিজ্ঞাপন', 'ব্রেকিং নিউজ'],
        },
        premium: {
          name: 'প্রিমিয়াম',
          price: '৳১৪৯/মাস',
          features: ['সীমাহীন অ্যাক্সেস', 'ই-পেপার', 'বিজ্ঞাপনমুক্ত', 'ব্রেকিং নিউজ'],
        },
        subscribe: 'সাবস্ক্রাইব করুন',
        close: 'বন্ধ করুন',
      },
    },
    en: {
      premium: {
        title: '🔒 Premium Article',
        subtitle: 'This article is exclusively for premium subscribers',
        message: 'Subscribe to read the full article',
      },
      meter: {
        title: '📊 Free Limit Reached',
        subtitle: `You've read ${10 - meterRemaining} articles this month`,
        message: meterExceeded
          ? "You've exceeded your monthly limit of 10 free articles"
          : `You have ${meterRemaining} free articles remaining`,
      },
      plans: {
        title: 'Subscription Plans',
        free: {
          name: 'Free',
          price: '৳0/month',
          features: ['10 articles/month', 'All ads', 'Breaking news'],
        },
        digital: {
          name: 'Digital',
          price: '৳99/month',
          features: ['Unlimited digital access', 'Reduced ads', 'Breaking news'],
        },
        premium: {
          name: 'Premium',
          price: '৳149/month',
          features: ['Unlimited access', 'E-paper included', 'Ad-free', 'Breaking news'],
        },
        subscribe: 'Subscribe Now',
        close: 'Close',
      },
    },
  };

  const t = content[lang];
  const currentPlan = isPremium ? t.premium : t.meter;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-lg mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          aria-label={t.plans.close}
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>

        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-8 text-white text-center">
          <div className="flex justify-center mb-4">
            {isPremium ? (
              <Crown className="w-16 h-16" />
            ) : (
              <TrendingUp className="w-16 h-16" />
            )}
          </div>
          <h2 className="text-2xl font-bold mb-2">{currentPlan.title}</h2>
          <p className="text-red-100">{currentPlan.subtitle}</p>
        </div>

        {/* Body */}
        <div className="px-6 py-6">
          {!showPlans ? (
            <>
              <p className="text-gray-700 text-center mb-6">{currentPlan.message}</p>
              
              <div className="space-y-3">
                <button
                  onClick={() => setShowPlans(true)}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Newspaper className="w-5 h-5" />
                  {t.plans.subscribe}
                </button>
                
                <button
                  onClick={onClose}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-lg transition-colors"
                >
                  {t.plans.close}
                </button>
              </div>

              {/* Trust badges */}
              <div className="mt-6 pt-6 border-t border-gray-200 text-center text-xs text-gray-500">
                <p>✓ {lang === 'bn' ? 'যেকোনো সময় বাতিল করুন' : 'Cancel anytime'}</p>
                <p className="mt-1">✓ {lang === 'bn' ? 'নিরাপদ পেমেন্ট' : 'Secure payment'}</p>
              </div>
            </>
          ) : (
            <>
              <h3 className="text-lg font-bold text-gray-900 mb-4 text-center">{t.plans.title}</h3>
              
              <div className="space-y-4">
                {/* Free Plan */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold text-gray-900">{t.plans.free.name}</h4>
                    <span className="text-green-600 font-bold">{t.plans.free.price}</span>
                  </div>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {t.plans.free.features.map((feature, i) => (
                      <li key={i}>✓ {feature}</li>
                    ))}
                  </ul>
                </div>

                {/* Digital Plan */}
                <div className="border-2 border-blue-500 rounded-lg p-4 relative">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-xs px-3 py-1 rounded-full">
                    {lang === 'bn' ? 'জনপ্রিয়' : 'Popular'}
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold text-gray-900">{t.plans.digital.name}</h4>
                    <span className="text-blue-600 font-bold">{t.plans.digital.price}</span>
                  </div>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {t.plans.digital.features.map((feature, i) => (
                      <li key={i}>✓ {feature}</li>
                    ))}
                  </ul>
                  <button
                    onClick={() => onSubscribe?.('digital')}
                    className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                  >
                    {t.plans.subscribe}
                  </button>
                </div>

                {/* Premium Plan */}
                <div className="border-2 border-red-500 rounded-lg p-4 relative">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-red-600 text-white text-xs px-3 py-1 rounded-full">
                    {lang === 'bn' ? 'সেরা মূল্য' : 'Best Value'}
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold text-gray-900">{t.plans.premium.name}</h4>
                    <span className="text-red-600 font-bold">{t.plans.premium.price}</span>
                  </div>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {t.plans.premium.features.map((feature, i) => (
                      <li key={i}>✓ {feature}</li>
                    ))}
                  </ul>
                  <button
                    onClick={() => onSubscribe?.('premium')}
                    className="w-full mt-4 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                  >
                    {t.plans.subscribe}
                  </button>
                </div>
              </div>

              <button
                onClick={() => setShowPlans(false)}
                className="w-full mt-4 text-gray-600 hover:text-gray-800 text-sm font-medium py-2 transition-colors"
              >
                ← {lang === 'bn' ? 'ফিরে যান' : 'Go back'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

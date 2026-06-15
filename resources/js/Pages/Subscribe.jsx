/**
 * Subscription plans page - allows users to view and purchase subscriptions.
 */
import { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Check, Crown, Zap, Newspaper, Shield, CreditCard } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useToast } from '../contexts/ToastContext';

const PLANS = {
  free: {
    nameBn: 'বিনামূল্যে',
    nameEn: 'Free',
    priceBdt: 0,
    periodBn: '/মাস',
    periodEn: '/month',
    featuresBn: [
      'মাসে ১০টি নিবন্ধ',
      'সব বিজ্ঞাপন',
      'ব্রেকিং নিউজ',
      'মোবাইল অ্যাক্সেস',
    ],
    featuresEn: [
      '10 articles per month',
      'All advertisements',
      'Breaking news alerts',
      'Mobile access',
    ],
    icon: null,
    color: 'gray',
    popular: false,
  },
  digital: {
    nameBn: 'ডিজিটাল',
    nameEn: 'Digital',
    priceBdt: 99,
    periodBn: '/মাস',
    periodEn: '/month',
    featuresBn: [
      'সীমাহীন ডিজিটাল অ্যাক্সেস',
      'কম বিজ্ঞাপন',
      'ব্রেকিং নিউজ',
      // 'নিউজলেটার', // newsletter hidden — future feature
      'মোবাইল অ্যাক্সেস',
    ],
    featuresEn: [
      'Unlimited digital access',
      'Reduced advertisements',
      'Breaking news alerts',
      // 'Newsletter subscription', // newsletter hidden — future feature
      'Mobile access',
    ],
    icon: Zap,
    color: 'blue',
    popular: true,
  },
  premium: {
    nameBn: 'প্রিমিয়াম',
    nameEn: 'Premium',
    priceBdt: 149,
    periodBn: '/মাস',
    periodEn: '/month',
    featuresBn: [
      'সীমাহীন অ্যাক্সেস',
      'ই-পেপার অন্তর্ভুক্ত',
      'সম্পূর্ণ বিজ্ঞাপনমুক্ত',
      'ব্রেকিং নিউজ',
      // 'নিউজলেটার', // newsletter hidden — future feature
      'প্রিমিয়াম কন্টেন্ট',
      'অগ্রাধিকার সাপোর্ট',
    ],
    featuresEn: [
      'Unlimited access',
      'E-paper included',
      'Completely ad-free',
      'Breaking news alerts',
      // 'Newsletter subscription', // newsletter hidden — future feature
      'Premium content access',
      'Priority support',
    ],
    icon: Crown,
    color: 'red',
    popular: false,
  },
};

const ANNUAL_PLANS = {
  digital: {
    nameBn: 'বার্ষিক ডিজিটাল',
    nameEn: 'Annual Digital',
    priceBdt: 999,
    periodBn: '/বছর',
    periodEn: '/year',
    savingsBn: '১৭% সাশ্রয়',
    savingsEn: 'Save 17%',
  },
  premium: {
    nameBn: 'বার্ষিক প্রিমিয়াম',
    nameEn: 'Annual Premium',
    priceBdt: 1499,
    periodBn: '/বছর',
    periodEn: '/year',
    savingsBn: '১৭% সাশ্রয়',
    savingsEn: 'Save 17%',
  },
};

export default function Subscribe({ currentPlan = 'free', isAuthenticated = false }) {
  const { lang } = useApp();
  const { showToast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState('digital');
  const [isAnnual, setIsAnnual] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('bkash');

  const form = useForm({
    plan: selectedPlan,
    payment_method: paymentMethod,
    is_annual: isAnnual,
  });

  const handleSubscribe = () => {
    if (!isAuthenticated) {
      showToast(lang === 'bn' ? 'সাবস্ক্রাইব করতে লগইন করুন' : 'Please login to subscribe');
      return;
    }

    form.setData('plan', selectedPlan);
    form.setData('payment_method', paymentMethod);
    form.setData('is_annual', isAnnual);

    form.post(route('subscribe.process'), {
      onSuccess: () => {
        showToast(lang === 'bn' ? 'সাবস্ক্রিপশন সফল হয়েছে!' : 'Subscription successful!');
      },
      onError: () => {
        showToast(lang === 'bn' ? 'সাবস্ক্রিপশন ব্যর্থ হয়েছে' : 'Subscription failed');
      },
    });
  };

  const getPlanData = (planKey) => {
    const monthly = PLANS[planKey];
    const annual = ANNUAL_PLANS[planKey];

    if (isAnnual && annual) {
      return {
        ...monthly,
        nameBn: annual.nameBn,
        nameEn: annual.nameEn,
        priceBdt: annual.priceBdt,
        periodBn: annual.periodBn,
        periodEn: annual.periodEn,
        savingsBn: annual.savingsBn,
        savingsEn: annual.savingsEn,
      };
    }

    return monthly;
  };

  const t = {
    titleBn: 'সাবস্ক্রিপশন পরিকল্পনা',
    titleEn: 'Subscription Plans',
    subtitleBn: 'আপনার প্রয়োজনে সেরা পরিকল্পনা বেছে নিন',
    subtitleEn: 'Choose the best plan for your needs',
    monthlyBn: 'মাসিক',
    monthlyEn: 'Monthly',
    annualBn: 'বার্ষিক',
    annualEn: 'Annual',
    subscribeBn: 'সাবস্ক্রাইব করুন',
    subscribeEn: 'Subscribe Now',
    currentBn: 'বর্তমান',
    currentEn: 'Current',
    popularBn: 'জনপ্রিয়',
    popularEn: 'Popular',
    bestValueBn: 'সেরা মূল্য',
    bestValueEn: 'Best Value',
    paymentBn: 'পেমেন্ট পদ্ধতি',
    paymentEn: 'Payment Method',
    featuresBn: 'যা পাবেন:',
    featuresEn: 'What you get:',
  };

  return (
    <>
      <Head title={lang === 'bn' ? t.titleBn : t.titleEn} />

      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              {lang === 'bn' ? t.titleBn : t.titleEn}
            </h1>
            <p className="text-lg text-gray-600">
              {lang === 'bn' ? t.subtitleBn : t.subtitleEn}
            </p>

            {/* Monthly/Annual Toggle */}
            <div className="mt-6 inline-flex bg-white rounded-lg p-1 shadow-sm border">
              <button
                onClick={() => setIsAnnual(false)}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                  !isAnnual
                    ? 'bg-red-600 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {lang === 'bn' ? t.monthlyBn : t.monthlyEn}
              </button>
              <button
                onClick={() => setIsAnnual(true)}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                  isAnnual
                    ? 'bg-red-600 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {lang === 'bn' ? t.annualBn : t.annualEn}
              </button>
            </div>
          </div>

          {/* Plans Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {Object.keys(PLANS).map((planKey) => {
              const plan = getPlanData(planKey);
              const Icon = plan.icon;
              const isSelected = selectedPlan === planKey;
              const isCurrentPlan = currentPlan === planKey;

              return (
                <div
                  key={planKey}
                  onClick={() => planKey !== 'free' && setSelectedPlan(planKey)}
                  className={`relative bg-white rounded-2xl shadow-lg border-2 transition-all cursor-pointer ${
                    isSelected
                      ? plan.color === 'blue'
                        ? 'border-blue-500 shadow-blue-100'
                        : 'border-red-500 shadow-red-100'
                      : 'border-gray-200 hover:border-gray-300'
                  } ${plan.popular ? 'md:-mt-4 md:mb-4' : ''}`}
                >
                  {/* Popular badge */}
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs px-4 py-1.5 rounded-full font-semibold">
                      {lang === 'bn' ? t.popularBn : t.popularEn}
                    </div>
                  )}

                  {/* Savings badge */}
                  {isAnnual && plan.savingsBn && (
                    <div className="absolute -top-4 right-4 bg-green-600 text-white text-xs px-3 py-1.5 rounded-full font-semibold">
                      {lang === 'bn' ? plan.savingsBn : plan.savingsEn}
                    </div>
                  )}

                  <div className="p-8">
                    {/* Plan header */}
                    <div className="flex items-center gap-3 mb-4">
                      {Icon && (
                        <div className={`p-3 rounded-lg ${
                          plan.color === 'blue' ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-red-600'
                        }`}>
                          <Icon className="w-6 h-6" />
                        </div>
                      )}
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">
                          {lang === 'bn' ? plan.nameBn : plan.nameEn}
                        </h3>
                        {isCurrentPlan && (
                          <span className="text-xs text-green-600 font-medium">
                            {lang === 'bn' ? t.currentBn : t.currentEn}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Price */}
                    <div className="mb-6">
                      <span className="text-4xl font-bold text-gray-900">
                        ৳{plan.priceBdt}
                      </span>
                      <span className="text-gray-600">
                        {lang === 'bn' ? plan.periodBn : plan.periodEn}
                      </span>
                    </div>

                    {/* Features */}
                    <ul className="space-y-3 mb-8">
                      {(lang === 'bn' ? plan.featuresBn : plan.featuresEn).map((feature, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                          <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Select button */}
                    {planKey !== 'free' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPlan(planKey);
                        }}
                        className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
                          isSelected
                            ? plan.color === 'blue'
                              ? 'bg-blue-600 text-white hover:bg-blue-700'
                              : 'bg-red-600 text-white hover:bg-red-700'
                            : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                        }`}
                      >
                        {isSelected
                          ? lang === 'bn' ? 'নির্বাচিত' : 'Selected'
                          : lang === 'bn' ? 'নির্বাচন করুন' : 'Select'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Payment Method */}
          {selectedPlan !== 'free' && (
            <div className="bg-white rounded-2xl shadow-lg border p-8 max-w-2xl mx-auto">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                {lang === 'bn' ? t.paymentBn : t.paymentEn}
              </h3>

              <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                  { id: 'bkash', name: 'bKash', color: 'bg-pink-600' },
                  { id: 'nagad', name: 'Nagad', color: 'bg-orange-600' },
                  { id: 'sslcommerz', name: 'SSLCommerz', color: 'bg-green-600' },
                ].map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id)}
                    className={`py-3 px-4 rounded-lg font-medium transition-colors ${
                      paymentMethod === method.id
                        ? `${method.color} text-white`
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {method.name}
                  </button>
                ))}
              </div>

              {/* Subscribe button */}
              <button
                onClick={handleSubscribe}
                disabled={form.processing}
                className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold py-4 px-8 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Newspaper className="w-5 h-5" />
                {form.processing
                  ? lang === 'bn' ? 'প্রক্রিয়াধীন...' : 'Processing...'
                  : lang === 'bn' ? t.subscribeBn : t.subscribeEn}
              </button>
            </div>
          )}

          {/* Trust badges */}
          <div className="mt-12 text-center text-sm text-gray-600">
            <div className="flex justify-center gap-8 mb-4">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-600" />
                <span>{lang === 'bn' ? 'নিরাপদ পেমেন্ট' : 'Secure Payment'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-600" />
                <span>{lang === 'bn' ? 'যেকোনো সময় বাতিল করুন' : 'Cancel Anytime'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

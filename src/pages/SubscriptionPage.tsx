import { useState } from 'react';
import { Link } from 'react-router-dom';

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
    </svg>
  );
}

const PLANS = [
  {
    id: 'basic',
    name: 'Basic',
    price: { monthly: 99, annual: 79 },
    description: 'Perfect to get started with coding practice.',
    popular: false,
    color: {
      ring: '',
      badge: '',
      cta: 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700',
    },
    features: [
      { text: '50 problems access', included: true },
      { text: 'Basic compiler (5 runs/day)', included: true },
      { text: 'Difficulty filters', included: true },
      { text: 'Community support', included: true },
      { text: 'AI feedback on failures', included: false },
      { text: 'Company-wise filters', included: false },
      { text: 'Progress analytics', included: false },
      { text: 'Mock interview mode', included: false },
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: { monthly: 199, annual: 149 },
    description: 'Best for serious placement prep.',
    popular: true,
    color: {
      ring: 'ring-2 ring-blue-500',
      badge: 'bg-blue-600',
      cta: 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20',
    },
    features: [
      { text: 'All 500+ problems', included: true },
      { text: 'Unlimited compiler runs', included: true },
      { text: 'All difficulty filters', included: true },
      { text: 'Priority support', included: true },
      { text: 'AI feedback on failures', included: true },
      { text: 'Company-wise filters', included: true },
      { text: 'Progress analytics', included: true },
      { text: 'Mock interview mode', included: false },
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: { monthly: 499, annual: 399 },
    description: 'Everything you need to guarantee a placement.',
    popular: false,
    color: {
      ring: '',
      badge: '',
      cta: 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700',
    },
    features: [
      { text: 'All 500+ problems', included: true },
      { text: 'Unlimited compiler runs', included: true },
      { text: 'All difficulty filters', included: true },
      { text: '1-on-1 mentor support', included: true },
      { text: 'AI feedback on failures', included: true },
      { text: 'Company-wise filters', included: true },
      { text: 'Progress analytics', included: true },
      { text: 'Mock interview mode', included: true },
    ],
  },
];

const FAQS = [
  {
    q: 'Can I cancel anytime?',
    a: 'Yes, you can cancel your subscription at any time. You will retain access until the end of your billing period.',
  },
  {
    q: 'Is there a free trial?',
    a: 'We offer a free plan with 10 problems and 5 compiler runs/day. No credit card required.',
  },
  {
    q: 'What payment methods are accepted?',
    a: 'We accept UPI, credit/debit cards, and net banking via Razorpay. All transactions are secured.',
  },
  {
    q: 'Can I switch plans later?',
    a: 'Absolutely. You can upgrade or downgrade your plan at any time from your account settings.',
  },
];

export function SubscriptionPage() {
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="h-full overflow-y-auto bg-gray-50 dark:bg-gray-950 py-8 px-4 sm:px-6">
      {/* Header */}
      <div className="max-w-4xl mx-auto text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-semibold mb-4">
          Subscription Plans
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
          Invest in your placement journey
        </h1>
        <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
          Affordable plans designed for students. Less than one coaching class fee.
        </p>

        {/* Billing toggle */}
        <div className="inline-flex items-center gap-1 mt-6 p-1 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <button
            onClick={() => setBilling('monthly')}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
              billing === 'monthly'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBilling('annual')}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
              billing === 'annual'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Annual
            <span className={`text-xs px-1.5 py-0.5 rounded font-bold ${billing === 'annual' ? 'bg-white/20 text-white' : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'}`}>
              Save 25%
            </span>
          </button>
        </div>
      </div>

      {/* Plans */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className={`relative bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-7 transition-all hover:shadow-lg dark:hover:shadow-black/20 ${plan.color.ring}`}
          >
            {plan.popular && (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <span className={`px-3 py-1 rounded-full text-xs font-bold text-white shadow-md ${plan.color.badge}`}>
                  Most Popular
                </span>
              </div>
            )}

            {/* Plan header */}
            <div className="mb-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{plan.name}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{plan.description}</p>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-gray-900 dark:text-white">
                  ₹{plan.price[billing]}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">/month</span>
              </div>
              {billing === 'annual' && (
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  Billed annually — save ₹{(plan.price.monthly - plan.price.annual) * 12}/year
                </p>
              )}
            </div>

            {/* CTA */}
            <Link
              to="/signup"
              className={`block w-full text-center py-2.5 px-4 rounded-xl font-semibold text-sm transition-colors mb-6 ${plan.color.cta}`}
            >
              Get {plan.name}
            </Link>

            {/* Features */}
            <ul className="space-y-2.5">
              {plan.features.map((f) => (
                <li key={f.text} className="flex items-center gap-2.5">
                  {f.included ? (
                    <CheckIcon className="w-4 h-4 text-green-500 shrink-0" />
                  ) : (
                    <XIcon className="w-4 h-4 text-gray-300 dark:text-gray-600 shrink-0" />
                  )}
                  <span className={`text-sm ${f.included ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400 dark:text-gray-600'}`}>
                    {f.text}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Current plan banner */}
      <div className="max-w-5xl mx-auto mb-16">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white mb-0.5">You're on the <span className="text-blue-600 dark:text-blue-400">Free Plan</span></p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Upgrade to unlock all features and maximize your placement chances.</p>
          </div>
          <Link
            to="/signup"
            className="shrink-0 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl transition-colors shadow-md shadow-blue-500/20"
          >
            Upgrade to Pro
          </Link>
        </div>
      </div>

      {/* FAQ */}
      <div className="max-w-2xl mx-auto">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 text-center">Frequently Asked Questions</h2>
        <div className="space-y-3">
          {FAQS.map((faq, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full flex items-center justify-between px-5 py-4 text-left"
              >
                <span className="text-sm font-semibold text-gray-900 dark:text-white">{faq.q}</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className={`w-4 h-4 text-gray-400 transition-transform shrink-0 ml-4 ${openFaq === idx ? 'rotate-180' : ''}`}
                >
                  <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                </svg>
              </button>
              {openFaq === idx && (
                <div className="px-5 pb-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

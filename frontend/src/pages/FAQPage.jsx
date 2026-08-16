import React, { useState, useEffect } from 'react';
import { HelpCircle, ChevronDown } from 'lucide-react';
import SEOHead from '../components/SEOHead';
import api from '../services/api';

export default function FAQPage() {
  const [faqs, setFaqs] = useState([]);
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    async function loadFaqs() {
      try {
        const res = await api.get('/faqs');
        if (res.success) setFaqs(res.data);
      } catch (e) {
        console.error(e);
      }
    }
    loadFaqs();
  }, []);

  const faqSchema = faqs.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': faqs.map(f => ({
      '@type': 'Question',
      'name': f.question,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': f.answer
      }
    }))
  } : null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <SEOHead
        title="Frequently Asked Questions (FAQ)"
        description="Find answers to common questions regarding Dhakshu Bakes cake orders, eggless choices, delivery slots, and payment options."
        jsonLd={faqSchema}
      />

      <div className="text-center space-y-3">
        <h1 className="font-serif text-4xl font-extrabold text-bakery-dark">FREQUENTLY ASKED QUESTIONS</h1>
        <p className="text-xs text-gray-500">Everything you need to know about cake orders, eggless variants, and express shipping.</p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq) => (
          <div key={faq.id} className="bg-white rounded-2xl border border-cream-200 overflow-hidden shadow-xs">
            <button
              onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
              aria-expanded={openId === faq.id}
              aria-controls={`faq-answer-${faq.id}`}
              className="w-full p-5 text-left font-serif font-bold text-sm text-bakery-dark flex items-center justify-between hover:bg-cream-50 focus:outline-none focus:ring-2 focus:ring-bakery-caramel"
            >
              <span>{faq.question}</span>
              <ChevronDown className={`w-4 h-4 text-bakery-caramel transition-transform ${openId === faq.id ? 'rotate-180' : ''}`} />
            </button>
            {openId === faq.id && (
              <div id={`faq-answer-${faq.id}`} className="px-5 pb-5 text-xs text-gray-600 border-t border-cream-100 pt-3">
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

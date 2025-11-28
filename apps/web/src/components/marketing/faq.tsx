'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const faqs = [
  {
    question: 'Is data-peek really free?',
    answer:
      'Yes! The free tier is fully functional with 2 connections, 50 query history items, and 3 tabs. No credit card required, no time limits. The Pro license unlocks unlimited everything plus advanced features like inline editing and query plans.',
  },
  {
    question: 'What does "pay once, own forever" mean?',
    answer:
      'Unlike subscription software, you pay $29 once and get a perpetual license. The license includes 1 year of updates. After that year, you can keep using the version you have forever, or renew for another year of updates at a discounted rate.',
  },
  {
    question: 'How many devices can I use with one license?',
    answer:
      'One Pro license includes 3 device activations. You can use data-peek on your work laptop, home computer, and one more device. Need more? Contact us for volume licensing.',
  },
  {
    question: 'Does data-peek work offline?',
    answer:
      "Absolutely. data-peek runs entirely on your machine. We validate licenses online during activation, but after that, you can work offline. There's a grace period for license revalidation.",
  },
  {
    question: 'What databases are supported?',
    answer:
      "Currently, data-peek is PostgreSQL-only. We're laser-focused on making the best Postgres experience possible. MySQL and SQLite support are planned for future releases.",
  },
  {
    question: 'Is my data safe?',
    answer:
      'Yes. data-peek never sends your data anywhere. All queries run directly from your machine to your database. Connection credentials are encrypted locally. We have no telemetry, no analytics, no tracking.',
  },
  {
    question: 'Can I get a refund?',
    answer:
      "Yes, we offer a 14-day money-back guarantee. If data-peek isn't right for you, just email us and we'll refund your purchase, no questions asked.",
  },
  {
    question: 'Do you offer team or enterprise licenses?',
    answer:
      "Not yet, but we're working on it! Cloud sync and team features are coming soon. Sign up for our newsletter to be notified when they launch.",
  },
]

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section id="faq" className="relative py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[--color-surface]/30 to-transparent" />

      <div className="relative z-10 max-w-3xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <p
            className="text-xs uppercase tracking-[0.2em] text-[--color-accent] mb-4"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            FAQ
          </p>
          <h2
            className="text-4xl md:text-5xl font-semibold tracking-tight mb-6"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Questions? Answers.
          </h2>
        </div>

        {/* FAQ List */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="rounded-xl border border-[--color-border] overflow-hidden bg-[--color-surface]/50"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-[--color-surface] transition-colors"
              >
                <span
                  className="text-base font-medium pr-4"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {faq.question}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-[--color-text-muted] flex-shrink-0 transition-transform duration-200 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ease-out ${
                  openIndex === index ? 'max-h-96' : 'max-h-0'
                }`}
              >
                <p
                  className="px-5 pb-5 text-[--color-text-secondary] leading-relaxed"
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  {faq.answer}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

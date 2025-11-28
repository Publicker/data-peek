import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, X, Sparkles, ArrowRight } from 'lucide-react'

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for trying out data-peek',
    features: [
      { text: '2 database connections', included: true },
      { text: '50 query history items', included: true },
      { text: '3 editor tabs', included: true },
      { text: '1 schema for ER diagrams', included: true },
      { text: 'CSV/JSON export', included: true },
      { text: 'Inline data editing', included: false },
      { text: 'Query execution plans', included: false },
      { text: 'Updates', included: false },
    ],
    cta: 'Download Free',
    href: '/download',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '$29',
    originalPrice: '$99',
    period: 'one-time',
    description: 'For developers who need the full power',
    badge: 'Early Bird — 70% off',
    features: [
      { text: 'Unlimited connections', included: true },
      { text: 'Unlimited query history', included: true },
      { text: 'Unlimited tabs', included: true },
      { text: 'Unlimited ER diagrams', included: true },
      { text: 'CSV/JSON export', included: true },
      { text: 'Inline data editing', included: true },
      { text: 'Query execution plans', included: true },
      { text: '1 year of updates', included: true },
      { text: '3 device activations', included: true },
    ],
    cta: 'Get Pro License',
    href: '#buy',
    highlighted: true,
  },
]

export function Pricing() {
  return (
    <section id="pricing" className="relative py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[--color-surface]/50 to-transparent" />

      <div className="relative z-10 max-w-5xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <p
            className="text-xs uppercase tracking-[0.2em] text-[--color-accent] mb-4"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            Pricing
          </p>
          <h2
            className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight mb-6"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Pay once.
            <br />
            <span className="text-[--color-text-secondary]">Own forever.</span>
          </h2>
          <p
            className="text-lg text-[--color-text-secondary] max-w-xl mx-auto"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            No subscriptions, no recurring fees. One purchase, lifetime access.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl p-8 ${
                plan.highlighted
                  ? 'bg-gradient-to-b from-[--color-accent]/10 to-[--color-surface] border-2 border-[--color-accent]/50'
                  : 'bg-[--color-surface] border border-[--color-border]'
              }`}
            >
              {/* Badge */}
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge variant="default" size="md">
                    <Sparkles className="w-3 h-3 mr-1" />
                    {plan.badge}
                  </Badge>
                </div>
              )}

              {/* Plan Header */}
              <div className="mb-8">
                <h3
                  className="text-xl font-medium mb-2"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {plan.name}
                </h3>
                <div className="flex items-baseline gap-2 mb-2">
                  <span
                    className="text-5xl font-semibold"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    {plan.price}
                  </span>
                  {plan.originalPrice && (
                    <span className="text-xl text-[--color-text-muted] line-through">
                      {plan.originalPrice}
                    </span>
                  )}
                  <span className="text-[--color-text-muted]">/{plan.period}</span>
                </div>
                <p className="text-sm text-[--color-text-secondary]">{plan.description}</p>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature.text} className="flex items-center gap-3">
                    {feature.included ? (
                      <div className="w-5 h-5 rounded-full bg-[--color-success]/10 flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-[--color-success]" />
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-[--color-text-muted]/10 flex items-center justify-center flex-shrink-0">
                        <X className="w-3 h-3 text-[--color-text-muted]" />
                      </div>
                    )}
                    <span
                      className={`text-sm ${
                        feature.included
                          ? 'text-[--color-text-primary]'
                          : 'text-[--color-text-muted]'
                      }`}
                    >
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Button
                variant={plan.highlighted ? 'primary' : 'secondary'}
                size="lg"
                className="w-full"
                asChild
              >
                <Link href={plan.href}>
                  {plan.cta}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          ))}
        </div>

        {/* Cloud Teaser */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[--color-surface] border border-[--color-border]">
            <span
              className="text-sm text-[--color-text-muted]"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              Coming soon:
            </span>
            <span className="text-sm text-[--color-text-secondary]">
              Cloud sync & team features
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}

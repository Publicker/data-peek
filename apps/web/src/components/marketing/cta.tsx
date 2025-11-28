import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Download } from 'lucide-react'

export function CTA() {
  return (
    <section className="relative py-32 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 grid-pattern opacity-30" />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] rounded-full opacity-20"
        style={{
          background: 'radial-gradient(circle, var(--color-accent) 0%, transparent 60%)',
          filter: 'blur(100px)',
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        {/* Headline */}
        <h2
          className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight mb-6"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Ready to peek?
        </h2>
        <p
          className="text-lg md:text-xl text-[--color-text-secondary] max-w-xl mx-auto mb-10"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          Download for free and start querying in seconds.
          <br />
          No sign-up required.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button size="lg" asChild>
            <Link href="/download">
              <Download className="w-4 h-4" />
              Download Free
            </Link>
          </Button>
          <Button variant="secondary" size="lg" asChild>
            <Link href="#pricing">
              Get Pro — $29
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>

        {/* Trust Signals */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-[--color-text-muted]">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[--color-success]" />
            No credit card required
          </span>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[--color-success]" />
            14-day money-back guarantee
          </span>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[--color-success]" />
            Works offline
          </span>
        </div>
      </div>
    </section>
  )
}

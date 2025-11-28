import Link from 'next/link'
import { Header } from '@/components/marketing/header'
import { Footer } from '@/components/marketing/footer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Download,
  Apple,
  Monitor,
  Terminal,
  Check,
  ArrowRight,
  Cpu,
} from 'lucide-react'

const platforms = [
  {
    name: 'macOS',
    icon: Apple,
    description: 'Apple Silicon & Intel',
    variants: [
      {
        label: 'Apple Silicon',
        sublabel: 'M1, M2, M3, M4',
        filename: 'data-peek-mac-arm64.dmg',
        size: '~85 MB',
        recommended: true,
      },
      {
        label: 'Intel',
        sublabel: 'x86_64',
        filename: 'data-peek-mac-x64.dmg',
        size: '~90 MB',
        recommended: false,
      },
    ],
    color: '#a1a1aa',
  },
  {
    name: 'Windows',
    icon: Monitor,
    description: 'Windows 10/11',
    variants: [
      {
        label: 'Installer',
        sublabel: '.exe',
        filename: 'data-peek-win-setup.exe',
        size: '~75 MB',
        recommended: true,
      },
      {
        label: 'Portable',
        sublabel: '.zip',
        filename: 'data-peek-win-portable.zip',
        size: '~80 MB',
        recommended: false,
      },
    ],
    color: '#60a5fa',
  },
  {
    name: 'Linux',
    icon: Terminal,
    description: 'Ubuntu, Debian, Fedora',
    variants: [
      {
        label: 'AppImage',
        sublabel: 'Universal',
        filename: 'data-peek-linux.AppImage',
        size: '~95 MB',
        recommended: true,
      },
      {
        label: '.deb',
        sublabel: 'Debian/Ubuntu',
        filename: 'data-peek-linux.deb',
        size: '~85 MB',
        recommended: false,
      },
    ],
    color: '#fbbf24',
  },
]

const requirements = [
  'macOS 11+ (Big Sur or later)',
  'Windows 10/11 (64-bit)',
  'Linux with glibc 2.31+',
  '4 GB RAM minimum',
  '200 MB disk space',
]

export default function DownloadPage() {
  return (
    <div className="min-h-screen">
      <Header />

      <main className="pt-32 pb-20">
        {/* Hero Section */}
        <section className="max-w-5xl mx-auto px-6 text-center mb-20">
          <Badge variant="default" size="lg" className="mb-6">
            <Download className="w-3.5 h-3.5 mr-1.5" />
            v1.0.0 — Latest Release
          </Badge>

          <h1
            className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight mb-6"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Download data-peek
          </h1>

          <p
            className="text-lg text-[--color-text-secondary] max-w-xl mx-auto mb-8"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            Free to download. No sign-up required.
            <br />
            Start querying in seconds.
          </p>
        </section>

        {/* Platform Cards */}
        <section className="max-w-5xl mx-auto px-6 mb-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {platforms.map((platform) => (
              <div
                key={platform.name}
                className="rounded-2xl bg-[--color-surface] border border-[--color-border] p-6 hover:border-[--color-border] hover:bg-[--color-surface-elevated] transition-all"
              >
                {/* Platform Header */}
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{
                      backgroundColor: `${platform.color}15`,
                      border: `1px solid ${platform.color}30`,
                    }}
                  >
                    <platform.icon
                      className="w-6 h-6"
                      style={{ color: platform.color }}
                    />
                  </div>
                  <div>
                    <h3
                      className="text-lg font-medium"
                      style={{ fontFamily: 'var(--font-display)' }}
                    >
                      {platform.name}
                    </h3>
                    <p className="text-sm text-[--color-text-muted]">
                      {platform.description}
                    </p>
                  </div>
                </div>

                {/* Download Variants */}
                <div className="space-y-3">
                  {platform.variants.map((variant) => (
                    <Link
                      key={variant.filename}
                      href={`/releases/${variant.filename}`}
                      className="group flex items-center justify-between p-3 rounded-xl bg-[--color-background] border border-[--color-border] hover:border-[--color-accent]/50 hover:bg-[--color-accent]/5 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[--color-surface] flex items-center justify-center">
                          <Cpu className="w-4 h-4 text-[--color-text-muted]" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span
                              className="text-sm font-medium"
                              style={{ fontFamily: 'var(--font-display)' }}
                            >
                              {variant.label}
                            </span>
                            {variant.recommended && (
                              <Badge variant="default" size="sm">
                                Recommended
                              </Badge>
                            )}
                          </div>
                          <span
                            className="text-xs text-[--color-text-muted]"
                            style={{ fontFamily: 'var(--font-mono)' }}
                          >
                            {variant.sublabel} • {variant.size}
                          </span>
                        </div>
                      </div>
                      <Download className="w-4 h-4 text-[--color-text-muted] group-hover:text-[--color-accent] transition-colors" />
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* System Requirements */}
        <section className="max-w-3xl mx-auto px-6 mb-20">
          <div className="rounded-2xl bg-[--color-surface] border border-[--color-border] p-8">
            <h2
              className="text-xl font-medium mb-6"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              System Requirements
            </h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {requirements.map((req) => (
                <li key={req} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[--color-success]/10 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-[--color-success]" />
                  </div>
                  <span className="text-sm text-[--color-text-secondary]">{req}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Pro Upsell */}
        <section className="max-w-3xl mx-auto px-6">
          <div className="rounded-2xl bg-gradient-to-r from-[--color-accent]/10 to-transparent border border-[--color-accent]/20 p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <h2
                  className="text-xl font-medium mb-2"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  Want unlimited everything?
                </h2>
                <p className="text-sm text-[--color-text-secondary]">
                  Get Pro for unlimited connections, tabs, and advanced features.
                </p>
              </div>
              <Button asChild>
                <Link href="/#pricing">
                  Get Pro — $29
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

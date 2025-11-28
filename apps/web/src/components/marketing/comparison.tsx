import { Check, X, Minus } from 'lucide-react'

const tools = ['data-peek', 'pgAdmin', 'DBeaver', 'TablePlus']

const comparisons = [
  {
    category: 'Performance',
    features: [
      { name: 'Startup Time', values: ['< 2s', '5-10s', '10-15s', '2-3s'] },
      { name: 'Memory Usage', values: ['Low', 'High', 'Very High', 'Low'] },
      { name: 'Native Performance', values: [true, false, false, true] },
    ],
  },
  {
    category: 'Features',
    features: [
      { name: 'Query Editor', values: [true, true, true, true] },
      { name: 'ER Diagrams', values: [true, true, true, true] },
      { name: 'Inline Editing', values: [true, true, true, true] },
      { name: 'Query Plans', values: [true, true, true, 'Limited'] },
      { name: 'Dark Mode', values: [true, false, true, true] },
    ],
  },
  {
    category: 'Experience',
    features: [
      { name: 'Learning Curve', values: ['Minimal', 'Steep', 'Steep', 'Minimal'] },
      { name: 'Modern UI', values: [true, false, false, true] },
      { name: 'Keyboard-First', values: [true, false, false, true] },
      { name: 'PostgreSQL Focus', values: [true, true, false, false] },
    ],
  },
  {
    category: 'Pricing',
    features: [
      { name: 'Price', values: ['$29', 'Free', 'Free/$199', '$69'] },
      { name: 'One-time Purchase', values: [true, 'N/A', false, true] },
      { name: 'No Subscription', values: [true, true, false, true] },
    ],
  },
]

function CellValue({ value }: { value: boolean | string }) {
  if (typeof value === 'boolean') {
    return value ? (
      <div className="w-6 h-6 rounded-full bg-[--color-success]/10 flex items-center justify-center">
        <Check className="w-3.5 h-3.5 text-[--color-success]" />
      </div>
    ) : (
      <div className="w-6 h-6 rounded-full bg-[--color-error]/10 flex items-center justify-center">
        <X className="w-3.5 h-3.5 text-[--color-error]" />
      </div>
    )
  }

  if (value === 'N/A' || value === 'Limited') {
    return (
      <span className="text-sm text-[--color-text-muted]">{value}</span>
    )
  }

  return <span className="text-sm text-[--color-text-primary]">{value}</span>
}

export function Comparison() {
  return (
    <section id="comparison" className="relative py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 grid-pattern opacity-30" />

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <p
            className="text-xs uppercase tracking-[0.2em] text-[--color-accent] mb-4"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            Comparison
          </p>
          <h2
            className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight mb-6"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            How we stack up.
          </h2>
          <p
            className="text-lg text-[--color-text-secondary] max-w-xl mx-auto"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            Honest comparison with popular alternatives.
          </p>
        </div>

        {/* Comparison Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            {/* Header */}
            <thead>
              <tr>
                <th className="text-left p-4 border-b border-[--color-border]" />
                {tools.map((tool, index) => (
                  <th
                    key={tool}
                    className={`p-4 text-center border-b border-[--color-border] ${
                      index === 0
                        ? 'bg-[--color-accent]/5 border-x border-[--color-accent]/20'
                        : ''
                    }`}
                  >
                    <span
                      className={`text-sm font-medium ${
                        index === 0 ? 'text-[--color-accent]' : 'text-[--color-text-primary]'
                      }`}
                      style={{ fontFamily: 'var(--font-display)' }}
                    >
                      {tool}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Body */}
            <tbody>
              {comparisons.map((section) => (
                <>
                  {/* Category Row */}
                  <tr key={`cat-${section.category}`}>
                    <td
                      colSpan={5}
                      className="p-4 pt-8 text-xs uppercase tracking-[0.15em] text-[--color-text-muted] border-b border-[--color-border-subtle]"
                      style={{ fontFamily: 'var(--font-mono)' }}
                    >
                      {section.category}
                    </td>
                  </tr>

                  {/* Feature Rows */}
                  {section.features.map((feature) => (
                    <tr
                      key={feature.name}
                      className="group hover:bg-[--color-surface]/50 transition-colors"
                    >
                      <td className="p-4 text-sm text-[--color-text-secondary] border-b border-[--color-border-subtle]">
                        {feature.name}
                      </td>
                      {feature.values.map((value, index) => (
                        <td
                          key={index}
                          className={`p-4 text-center border-b border-[--color-border-subtle] ${
                            index === 0
                              ? 'bg-[--color-accent]/5 border-x border-[--color-accent]/10'
                              : ''
                          }`}
                        >
                          <div className="flex justify-center">
                            <CellValue value={value} />
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

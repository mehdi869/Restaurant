import { ArrowDown } from 'lucide-react'

export default function HeroSection() {
  return (
    <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-charcoal-950 via-charcoal-950 to-charcoal-950/90" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--color-amber-900)_0%,_transparent_70%)] opacity-20" />

      <div className="relative z-10 text-center px-4 max-w-3xl mx-auto mt-16">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-medium mb-6 animate-fade-in-up">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse-subtle" />
          Now accepting orders
        </div>

        <h1 className="font-display text-5xl md:text-7xl font-bold text-white leading-tight mb-6 animate-fade-in-up">
          Good Food,
          <br />
          <span className="text-amber-400">Great Vibes</span>
        </h1>

        <p className="text-charcoal-300 text-lg md:text-xl max-w-xl mx-auto mb-10 animate-fade-in-up">
          Handcrafted meals made with passion. Browse our menu, add to cart, and we&apos;ll take care of the rest.
        </p>

        <a
          href="#menu"
          className="inline-flex items-center gap-2 text-charcoal-400 hover:text-amber-400 transition-colors text-sm animate-fade-in-up"
        >
          View our menu
          <ArrowDown className="w-4 h-4 animate-bounce" />
        </a>
      </div>
    </section>
  )
}

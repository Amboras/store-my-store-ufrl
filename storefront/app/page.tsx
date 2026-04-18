'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { ArrowRight, Truck, Shield, RotateCcw, Leaf, Flame, Hand } from 'lucide-react'
import { trackMetaEvent } from '@/lib/meta-pixel'

const HERO_IMAGE = 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1600&q=80'
const LIFESTYLE_IMAGE = 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1600&q=80'
const EDITORIAL_IMAGE = 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=1600&q=80'

const FEATURED = {
  handle: 'amber-oak-soy-candle',
  title: 'Amber & Oak Soy Candle',
  subtitle: 'The Signature',
  price: '$38',
  image: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=1200&q=80',
  secondary: 'https://images.unsplash.com/photo-1608181831718-c9ffd8728d04?w=1200&q=80',
  notes: ['Warm Amber', 'Smoked Oak', 'Vanilla Bean'],
}

const COLLECTION = [
  {
    handle: 'amber-oak-soy-candle',
    title: 'Amber & Oak Candle',
    caption: 'Hand-poured · 50hr burn',
    price: 'From $38',
    image: 'https://images.unsplash.com/photo-1602874801006-01f5e8e47fc9?w=1000&q=80',
  },
  {
    handle: 'stonewashed-linen-throw',
    title: 'Stonewashed Linen Throw',
    caption: 'European flax · 3 colors',
    price: '$128',
    image: 'https://images.unsplash.com/photo-1540574163026-643ea20ade25?w=1000&q=80',
  },
  {
    handle: 'ceramic-bud-vase-trio',
    title: 'Ceramic Bud Vase Trio',
    caption: 'Hand-thrown · Set of 3',
    price: '$64',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1000&q=80',
  },
]

const MARQUEE_ITEMS = [
  'Hand-poured in small batches',
  'European flax linen',
  'Hand-thrown ceramics',
  'Carbon-neutral shipping',
  'Made to last a lifetime',
]

export default function HomePage() {
  const [newsletterEmail, setNewsletterEmail] = useState('')

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newsletterEmail.trim()) return
    trackMetaEvent('Lead', { content_name: 'newsletter_signup', status: 'submitted' })
    setNewsletterEmail('')
  }

  return (
    <>
      {/* ─────────────────────────── HERO ─────────────────────────── */}
      <section className="relative bg-muted/30 overflow-hidden">
        <div className="container-custom grid lg:grid-cols-12 gap-10 lg:gap-16 items-center py-16 lg:py-28">
          <div className="lg:col-span-5 space-y-7 animate-fade-in-up">
            <p className="text-xs uppercase tracking-[0.3em] text-accent">
              Spring Collection · 2026
            </p>
            <h1 className="font-heading font-normal text-5xl sm:text-6xl lg:text-7xl leading-[1.02] tracking-tight text-balance">
              A quieter<br/>
              <em className="italic font-light">kind of home.</em>
            </h1>
            <p className="text-base lg:text-lg text-muted-foreground max-w-md leading-relaxed">
              Hand-poured candles, heirloom linens, and hand-thrown ceramics — crafted slowly, built to settle in and stay a while.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href="/products"
                className="group inline-flex items-center gap-2 bg-foreground text-background px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.15em] hover:bg-accent transition-colors"
                prefetch={true}
              >
                Shop the Collection
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                href={`/products/${FEATURED.handle}`}
                className="inline-flex items-center gap-2 border border-foreground/30 px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.15em] hover:border-foreground hover:bg-foreground hover:text-background transition-colors"
                prefetch={true}
              >
                The Signature Candle
              </Link>
            </div>
          </div>

          <div className="lg:col-span-7 relative">
            <div className="relative aspect-[4/5] lg:aspect-[5/6] bg-muted overflow-hidden animate-fade-in">
              <Image
                src={HERO_IMAGE}
                alt="A warm, lived-in living room with candles, linen throws and ceramics"
                fill
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-cover"
                priority
              />
            </div>
            {/* Overlay card */}
            <div className="hidden md:block absolute -bottom-6 -left-6 lg:-left-12 bg-background border border-border p-6 max-w-[260px] shadow-sm">
              <p className="text-xs uppercase tracking-[0.25em] text-accent mb-2">Best Seller</p>
              <p className="font-heading text-xl leading-snug">Amber &amp; Oak Soy Candle</p>
              <p className="text-sm text-muted-foreground mt-1">From $38 · 50hr burn</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────── VALUES MARQUEE ─────────────────────────── */}
      <section className="border-y bg-foreground text-background overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap py-4">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span key={i} className="flex items-center gap-8 px-8 text-xs uppercase tracking-[0.3em]">
              {item}
              <span className="text-accent">✦</span>
            </span>
          ))}
        </div>
      </section>

      {/* ─────────────────────────── FEATURED PRODUCT ─────────────────────────── */}
      <section className="py-section">
        <div className="container-custom">
          <div className="text-center max-w-xl mx-auto mb-14">
            <span className="divider-dot">The Signature</span>
            <h2 className="mt-6 font-heading text-4xl lg:text-5xl font-normal leading-tight text-balance">
              A scent that settles<br/>
              <em className="italic font-light">into the walls.</em>
            </h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-10 lg:gap-20 items-center">
            <div className="grid grid-cols-5 gap-3">
              <div className="col-span-3 relative aspect-[3/4] bg-muted overflow-hidden">
                <Image src={FEATURED.image} alt={FEATURED.title} fill sizes="(max-width: 1024px) 60vw, 30vw" className="object-cover" />
              </div>
              <div className="col-span-2 flex flex-col gap-3">
                <div className="relative aspect-square bg-muted overflow-hidden">
                  <Image src={FEATURED.secondary} alt="Candle lifestyle" fill sizes="(max-width: 1024px) 40vw, 20vw" className="object-cover" />
                </div>
                <div className="relative aspect-[4/5] bg-muted overflow-hidden">
                  <Image src={EDITORIAL_IMAGE} alt="In use" fill sizes="(max-width: 1024px) 40vw, 20vw" className="object-cover" />
                </div>
              </div>
            </div>

            <div className="lg:pl-6 space-y-6">
              <p className="text-xs uppercase tracking-[0.3em] text-accent">{FEATURED.subtitle}</p>
              <h3 className="font-heading text-4xl lg:text-5xl font-normal">{FEATURED.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                Warm amber and sandalwood open to smoked oak, vanilla bean, and the faintest whisper of leather.
                Hand-poured in small batches into a hand-glazed stoneware vessel that lives on well beyond its last flicker.
              </p>

              <div className="flex flex-wrap gap-2 pt-2">
                {FEATURED.notes.map((note) => (
                  <span key={note} className="text-xs uppercase tracking-[0.2em] border border-foreground/20 px-3 py-1.5">
                    {note}
                  </span>
                ))}
              </div>

              <div className="flex items-baseline gap-4 pt-4">
                <p className="font-heading text-3xl">{FEATURED.price}</p>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">50+ hour burn</p>
              </div>

              <div className="pt-2">
                <Link
                  href={`/products/${FEATURED.handle}`}
                  className="inline-flex items-center gap-2 bg-foreground text-background px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.15em] hover:bg-accent transition-colors"
                  prefetch={true}
                >
                  Shop the Candle
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────── COLLECTION ─────────────────────────── */}
      <section className="py-section bg-muted/40">
        <div className="container-custom">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-12">
            <div>
              <span className="divider-dot">The Collection</span>
              <h2 className="mt-5 font-heading text-4xl lg:text-5xl font-normal">Quietly crafted essentials</h2>
            </div>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-semibold link-underline pb-1"
              prefetch={true}
            >
              View All
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {COLLECTION.map((item) => (
              <Link
                key={item.handle}
                href={`/products/${item.handle}`}
                prefetch={true}
                className="group block"
              >
                <div className="relative aspect-[4/5] bg-background overflow-hidden">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="mt-5 flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-heading text-xl leading-tight">{item.title}</h3>
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground mt-1.5">
                      {item.caption}
                    </p>
                  </div>
                  <p className="font-heading text-lg whitespace-nowrap">{item.price}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────── EDITORIAL / STORY ─────────────────────────── */}
      <section className="py-section">
        <div className="container-custom grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="relative aspect-[4/5] bg-muted overflow-hidden order-2 lg:order-1">
            <Image src={LIFESTYLE_IMAGE} alt="Our craft" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
          </div>
          <div className="space-y-6 lg:max-w-md order-1 lg:order-2">
            <span className="divider-dot">Our Philosophy</span>
            <h2 className="font-heading text-4xl lg:text-5xl font-normal leading-tight text-balance">
              Fewer, better things — made to <em className="italic font-light">last a lifetime.</em>
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We believe the home is a place to exhale. Every piece we make is chosen for its quality,
              its craft, and the quiet way it earns its place. No trends, no fillers — just objects that
              get better with years of use.
            </p>
            <Link
              href="/about"
              className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-semibold link-underline pb-1"
              prefetch={true}
            >
              Read Our Story
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─────────────────────────── VALUES / CRAFT ─────────────────────────── */}
      <section className="py-section bg-foreground text-background">
        <div className="container-custom">
          <div className="text-center max-w-xl mx-auto mb-14">
            <span className="inline-flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-background/60 before:content-[''] before:h-px before:w-10 before:bg-background/30 after:content-[''] after:h-px after:w-10 after:bg-background/30">
              How we make it
            </span>
            <h2 className="mt-6 font-heading text-4xl lg:text-5xl font-normal leading-tight">
              Craft you can <em className="italic font-light">feel.</em>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-10 md:gap-6">
            {[
              { icon: Hand, title: 'Hand-made in small batches', body: 'Every candle is hand-poured, every vase hand-thrown. Small variations make each piece one of a kind.' },
              { icon: Leaf, title: 'Materials that age well', body: 'Natural soy wax, European flax, and stoneware — materials that soften, settle, and get better with time.' },
              { icon: Flame, title: 'Built to last', body: 'Designed for daily use, not for display. Our pieces are made to live in your home for decades.' },
            ].map(({ icon: Icon, title, body }) => (
              <div key={title} className="text-center md:text-left">
                <Icon className="h-6 w-6 mx-auto md:mx-0 mb-5 text-accent" strokeWidth={1.25} />
                <h3 className="font-heading text-xl mb-2">{title}</h3>
                <p className="text-sm text-background/70 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────── TRUST BAR ─────────────────────────── */}
      <section className="py-section-sm border-b">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4">
            <div className="flex items-center gap-4 justify-center">
              <Truck className="h-6 w-6 flex-shrink-0 text-accent" strokeWidth={1.5} />
              <div>
                <p className="text-sm font-semibold">Complimentary Shipping</p>
                <p className="text-xs text-muted-foreground">On orders over $75</p>
              </div>
            </div>
            <div className="flex items-center gap-4 justify-center">
              <RotateCcw className="h-6 w-6 flex-shrink-0 text-accent" strokeWidth={1.5} />
              <div>
                <p className="text-sm font-semibold">30-Day Returns</p>
                <p className="text-xs text-muted-foreground">No questions, no stress</p>
              </div>
            </div>
            <div className="flex items-center gap-4 justify-center">
              <Shield className="h-6 w-6 flex-shrink-0 text-accent" strokeWidth={1.5} />
              <div>
                <p className="text-sm font-semibold">Lifetime Guarantee</p>
                <p className="text-xs text-muted-foreground">Built to last, backed by us</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────── NEWSLETTER ─────────────────────────── */}
      <section className="py-section">
        <div className="container-custom max-w-xl text-center">
          <span className="divider-dot">The Journal</span>
          <h2 className="mt-5 font-heading text-4xl font-normal">Stay in touch</h2>
          <p className="mt-3 text-muted-foreground">
            Quiet notes on new releases, small batches, and seasonal edits — no noise.
          </p>
          <form className="mt-8 flex gap-2" onSubmit={handleNewsletterSubmit}>
            <input
              type="email"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-1 border-b border-foreground/30 bg-transparent px-1 py-3 text-sm placeholder:text-muted-foreground focus:border-foreground focus:outline-none transition-colors"
              aria-label="Email"
            />
            <button
              type="submit"
              className="bg-foreground text-background px-6 py-3 text-xs font-semibold uppercase tracking-[0.15em] hover:bg-accent transition-colors whitespace-nowrap"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </>
  )
}

'use client'

import { useEffect, useMemo, useState } from 'react'
import { useCart } from '@/hooks/use-cart'
import { Check, Loader2, ShieldCheck, Truck, RotateCcw, Leaf, Flame, Lock, Package, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import ProductPrice, { type VariantExtension } from './product-price'
import { trackAddToCart } from '@/lib/analytics'
import { trackMetaEvent, toMetaCurrencyValue } from '@/lib/meta-pixel'
import { formatPrice } from '@/lib/utils/format-price'
import type { Product } from '@/types'

// ────────────────────────────────────────────────────────────────────────────
// Runtime shapes (Admin API returns relational options/prices objects that
// the generic SDK type doesn't capture)
// ────────────────────────────────────────────────────────────────────────────

interface VariantOption {
  option_id?: string
  option?: { id: string }
  value: string
}

interface ProductVariantWithPrice {
  id: string
  title?: string
  options?: VariantOption[]
  calculated_price?:
    | {
        calculated_amount?: number
        currency_code?: string
      }
    | number
  [key: string]: unknown
}

interface ProductOptionValue {
  id?: string
  value: string
}

interface ProductOptionWithValues {
  id: string
  title: string
  values?: (string | ProductOptionValue)[]
}

function getVariantPriceAmount(variant: ProductVariantWithPrice | undefined): number | null {
  const cp = variant?.calculated_price
  if (!cp) return null
  return typeof cp === 'number' ? cp : cp.calculated_amount ?? null
}

// ────────────────────────────────────────────────────────────────────────────
// Countdown — a fixed-duration urgency clock anchored to the user's first
// visit (stored in localStorage so it doesn't reset every refresh).
// ────────────────────────────────────────────────────────────────────────────

function useSaleCountdown(durationHours = 48, storageKey = 'hh_sale_deadline') {
  const [remaining, setRemaining] = useState<number>(durationHours * 60 * 60 * 1000)

  useEffect(() => {
    if (typeof window === 'undefined') return

    let deadline: number
    const stored = window.localStorage.getItem(storageKey)
    const parsed = stored ? Number(stored) : NaN

    if (Number.isFinite(parsed) && parsed > Date.now()) {
      deadline = parsed
    } else {
      deadline = Date.now() + durationHours * 60 * 60 * 1000
      window.localStorage.setItem(storageKey, String(deadline))
    }

    const tick = () => setRemaining(Math.max(0, deadline - Date.now()))
    tick()
    const id = window.setInterval(tick, 1000)
    return () => window.clearInterval(id)
  }, [durationHours, storageKey])

  const hours = Math.floor(remaining / 3_600_000)
  const minutes = Math.floor((remaining % 3_600_000) / 60_000)
  const seconds = Math.floor((remaining % 60_000) / 1000)
  return { hours, minutes, seconds, done: remaining === 0 }
}

// ────────────────────────────────────────────────────────────────────────────
// Props
// ────────────────────────────────────────────────────────────────────────────

interface ConversionPanelProps {
  product: Product
  variantExtensions?: Record<string, VariantExtension>
}

type BundleChoice = 'single' | 'duo' | 'trio'

const BUNDLES: {
  id: BundleChoice
  quantity: number
  label: string
  tag?: string
  savingsLabel?: string
  description: string
}[] = [
  {
    id: 'single',
    quantity: 1,
    label: 'Single',
    description: 'One candle · perfect for yourself',
  },
  {
    id: 'duo',
    quantity: 2,
    label: 'Duo',
    tag: 'Most Gifted',
    description: 'Two candles · one to keep, one to gift',
  },
  {
    id: 'trio',
    quantity: 3,
    label: 'The Trio',
    tag: 'Best Value',
    savingsLabel: 'Buy 2, get 1 free',
    description: 'Three candles · third one on us',
  },
]

// ────────────────────────────────────────────────────────────────────────────
// Component
// ────────────────────────────────────────────────────────────────────────────

export default function ConversionPanel({ product, variantExtensions }: ConversionPanelProps) {
  const variants = useMemo(
    () => (product.variants || []) as unknown as ProductVariantWithPrice[],
    [product.variants],
  )
  const options = useMemo(() => product.options || [], [product.options])

  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() => {
    const defaults: Record<string, string> = {}
    const firstVariant = variants[0]
    if (firstVariant?.options) {
      for (const opt of firstVariant.options) {
        const optionId = opt.option_id || opt.option?.id
        if (optionId && opt.value) defaults[optionId] = opt.value
      }
    }
    return defaults
  })

  const [bundle, setBundle] = useState<BundleChoice>('trio')
  const [justAdded, setJustAdded] = useState(false)
  const { addItemAsync, isAddingItem } = useCart()

  const selectedVariant = useMemo(() => {
    if (variants.length <= 1) return variants[0]
    return (
      variants.find((v) => {
        if (!v.options) return false
        return v.options.every((opt) => {
          const optionId = opt.option_id || opt.option?.id
          if (!optionId) return false
          return selectedOptions[optionId] === opt.value
        })
      }) || variants[0]
    )
  }, [variants, selectedOptions])

  const ext = selectedVariant?.id ? variantExtensions?.[selectedVariant.id] : null
  const unitPrice = getVariantPriceAmount(selectedVariant)
  const cp = selectedVariant?.calculated_price
  const currency = (cp && typeof cp !== 'number' ? cp.currency_code : undefined) || 'usd'

  const allowBackorder = ext?.allow_backorder ?? false
  const inventoryQuantity = ext?.inventory_quantity
  const isOutOfStock = !allowBackorder && inventoryQuantity != null && inventoryQuantity <= 0
  const isLowStock = inventoryQuantity != null && inventoryQuantity > 0 && inventoryQuantity < 15

  const countdown = useSaleCountdown(48)
  const fmt = (n: number) => String(n).padStart(2, '0')

  const selectedBundle = BUNDLES.find((b) => b.id === bundle) ?? BUNDLES[0]

  // Price math
  const bundleSubtotal = unitPrice != null ? unitPrice * selectedBundle.quantity : null
  const bundleTotal =
    unitPrice != null
      ? bundle === 'trio'
        ? unitPrice * 2 // third one free (promo auto-applies at checkout)
        : unitPrice * selectedBundle.quantity
      : null
  const bundleSavings =
    bundleSubtotal != null && bundleTotal != null ? bundleSubtotal - bundleTotal : 0

  const handleOptionChange = (optionId: string, value: string) => {
    setSelectedOptions((prev) => ({ ...prev, [optionId]: value }))
  }

  const handleAddToCart = async () => {
    if (!selectedVariant?.id || isOutOfStock) return
    try {
      await addItemAsync({ variantId: selectedVariant.id, quantity: selectedBundle.quantity })
      setJustAdded(true)
      const label =
        bundle === 'trio'
          ? 'Trio added — 3rd candle free at checkout'
          : bundle === 'duo'
          ? 'Duo added to your bag'
          : 'Added to your bag'
      toast.success(label)

      const metaValue = toMetaCurrencyValue(unitPrice)
      trackAddToCart(product?.id || '', selectedVariant.id, selectedBundle.quantity, unitPrice ?? undefined)
      trackMetaEvent('AddToCart', {
        content_ids: [selectedVariant.id],
        content_type: 'product',
        content_name: product?.title,
        value: metaValue,
        currency,
        contents: [{ id: selectedVariant.id, quantity: selectedBundle.quantity, item_price: metaValue }],
        num_items: selectedBundle.quantity,
      })
      setTimeout(() => setJustAdded(false), 2000)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to add to bag'
      toast.error(message)
    }
  }

  const hasMultipleVariants = variants.length > 1

  return (
    <div className="space-y-6">
      {/* URGENCY BANNER */}
      {!countdown.done && (
        <div className="flex items-center gap-3 bg-accent/10 border border-accent/30 px-4 py-3">
          <Sparkles className="h-4 w-4 text-accent flex-shrink-0" strokeWidth={1.75} />
          <div className="flex-1 text-sm">
            <span className="font-semibold text-accent">Spring Sale</span>
            <span className="text-muted-foreground"> · ends in </span>
            <span className="font-mono font-semibold tabular-nums text-foreground">
              {fmt(countdown.hours)}:{fmt(countdown.minutes)}:{fmt(countdown.seconds)}
            </span>
          </div>
        </div>
      )}

      {/* PRICE */}
      <ProductPrice
        amount={unitPrice}
        currency={currency}
        compareAtPrice={ext?.compare_at_price}
        soldOut={isOutOfStock}
        size="detail"
      />

      {/* OPTION SELECTORS */}
      {hasMultipleVariants &&
        options.map((option) => {
          const o = option as unknown as ProductOptionWithValues
          const values = (o.values || [])
            .map((v) => (typeof v === 'string' ? v : v.value))
            .filter(Boolean) as string[]
          if (values.length <= 1 && (values[0] === 'One Size' || values[0] === 'Default')) {
            return null
          }
          const optionId = o.id
          const selectedValue = selectedOptions[optionId]

          return (
            <div key={optionId}>
              <h3 className="text-xs uppercase tracking-[0.2em] font-semibold mb-3">
                {o.title}
                {selectedValue && (
                  <span className="ml-2 normal-case tracking-normal font-normal text-muted-foreground">
                    — {selectedValue}
                  </span>
                )}
              </h3>
              <div className="flex flex-wrap gap-2">
                {values.map((value) => {
                  const isSelected = selectedValue === value
                  const isAvailable = variants.some((v) => {
                    const hasValue = v.options?.some(
                      (ov) =>
                        (ov.option_id === optionId || ov.option?.id === optionId) && ov.value === value,
                    )
                    if (!hasValue) return false
                    const vExt = variantExtensions?.[v.id]
                    if (!vExt) return true
                    if (vExt.allow_backorder) return true
                    return vExt.inventory_quantity == null || vExt.inventory_quantity > 0
                  })

                  return (
                    <button
                      key={value}
                      onClick={() => handleOptionChange(optionId, value)}
                      disabled={!isAvailable}
                      className={`min-w-[56px] px-4 py-2.5 text-sm border transition-all ${
                        isSelected
                          ? 'border-foreground bg-foreground text-background'
                          : isAvailable
                          ? 'border-border hover:border-foreground'
                          : 'border-border text-muted-foreground/40 line-through cursor-not-allowed'
                      }`}
                    >
                      {value}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}

      {/* ─── BUNDLE OFFER ─── */}
      <div className="pt-2">
        <h3 className="text-xs uppercase tracking-[0.2em] font-semibold mb-3 flex items-center gap-2">
          <Package className="h-3.5 w-3.5" strokeWidth={2} />
          Choose your bundle
        </h3>
        <div className="space-y-2">
          {BUNDLES.map((b) => {
            const isSelected = bundle === b.id
            const line =
              unitPrice != null
                ? b.id === 'trio'
                  ? formatPrice(unitPrice * 2, currency)
                  : formatPrice(unitPrice * b.quantity, currency)
                : '—'
            const strike =
              unitPrice != null && b.id === 'trio'
                ? formatPrice(unitPrice * b.quantity, currency)
                : null

            return (
              <button
                key={b.id}
                type="button"
                onClick={() => setBundle(b.id)}
                aria-pressed={isSelected}
                className={`relative w-full text-left border transition-all p-4 flex items-center gap-4 ${
                  isSelected
                    ? 'border-foreground bg-foreground/[0.03] ring-1 ring-foreground'
                    : 'border-border hover:border-foreground/50'
                }`}
              >
                {/* Radio */}
                <span
                  className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                    isSelected ? 'border-foreground' : 'border-border'
                  }`}
                >
                  {isSelected && <span className="w-2.5 h-2.5 rounded-full bg-foreground" />}
                </span>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm">{b.label}</span>
                    {b.tag && (
                      <span
                        className={`text-[10px] uppercase tracking-[0.18em] px-1.5 py-0.5 ${
                          b.id === 'trio'
                            ? 'bg-accent text-accent-foreground'
                            : 'bg-foreground text-background'
                        }`}
                      >
                        {b.tag}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{b.description}</p>
                  {b.savingsLabel && (
                    <p className="text-xs text-accent font-semibold mt-1">{b.savingsLabel}</p>
                  )}
                </div>

                {/* Price */}
                <div className="text-right flex-shrink-0">
                  {strike && (
                    <span className="block text-xs text-muted-foreground line-through">{strike}</span>
                  )}
                  <span className="font-heading text-lg font-semibold">{line}</span>
                </div>
              </button>
            )
          })}
        </div>
        {bundle === 'trio' && bundleSavings > 0 && (
          <p className="mt-2 text-xs text-accent font-medium">
            You save {formatPrice(bundleSavings, currency)} — the discount applies automatically at checkout.
          </p>
        )}
      </div>

      {/* ─── LOW STOCK URGENCY ─── */}
      {isLowStock && (
        <div className="flex items-center gap-2 text-sm text-accent font-medium">
          <Flame className="h-4 w-4" strokeWidth={2} />
          Only {inventoryQuantity} left — selling fast this week
        </div>
      )}

      {/* ─── ADD TO BAG ─── */}
      <button
        onClick={handleAddToCart}
        disabled={isOutOfStock || isAddingItem}
        className={`w-full flex items-center justify-center gap-2 py-4 text-sm font-semibold uppercase tracking-[0.18em] transition-all ${
          isOutOfStock
            ? 'bg-muted text-muted-foreground cursor-not-allowed'
            : justAdded
            ? 'bg-green-700 text-white'
            : 'bg-foreground text-background hover:bg-accent'
        }`}
      >
        {isAddingItem ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : justAdded ? (
          <>
            <Check className="h-4 w-4" />
            Added to Bag
          </>
        ) : isOutOfStock ? (
          'Sold Out'
        ) : bundle === 'trio' ? (
          <>Add Trio to Bag · {bundleTotal != null ? formatPrice(bundleTotal, currency) : ''}</>
        ) : bundle === 'duo' ? (
          <>Add Duo to Bag · {bundleTotal != null ? formatPrice(bundleTotal, currency) : ''}</>
        ) : (
          <>Add to Bag · {bundleTotal != null ? formatPrice(bundleTotal, currency) : ''}</>
        )}
      </button>

      {/* ─── SECURE CHECKOUT ─── */}
      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <Lock className="h-3 w-3" strokeWidth={2} />
        Secure checkout · SSL encrypted · Apple Pay, Google Pay &amp; cards accepted
      </div>

      {/* ─── TRUST GRID ─── */}
      <div className="grid grid-cols-2 gap-3 pt-4 border-t">
        <div className="flex items-start gap-3 p-3 bg-muted/40">
          <ShieldCheck className="h-5 w-5 flex-shrink-0 text-accent mt-0.5" strokeWidth={1.5} />
          <div>
            <p className="text-xs font-semibold">Lifetime Guarantee</p>
            <p className="text-xs text-muted-foreground mt-0.5">Built to last, backed by us</p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-3 bg-muted/40">
          <Truck className="h-5 w-5 flex-shrink-0 text-accent mt-0.5" strokeWidth={1.5} />
          <div>
            <p className="text-xs font-semibold">Free Shipping</p>
            <p className="text-xs text-muted-foreground mt-0.5">On orders over $75</p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-3 bg-muted/40">
          <RotateCcw className="h-5 w-5 flex-shrink-0 text-accent mt-0.5" strokeWidth={1.5} />
          <div>
            <p className="text-xs font-semibold">30-Day Returns</p>
            <p className="text-xs text-muted-foreground mt-0.5">No questions asked</p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-3 bg-muted/40">
          <Leaf className="h-5 w-5 flex-shrink-0 text-accent mt-0.5" strokeWidth={1.5} />
          <div>
            <p className="text-xs font-semibold">Clean Burn</p>
            <p className="text-xs text-muted-foreground mt-0.5">100% soy, phthalate-free</p>
          </div>
        </div>
      </div>
    </div>
  )
}

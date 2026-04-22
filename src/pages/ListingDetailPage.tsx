import { useState, useEffect } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'motion/react'
import { useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

// ─── Shared ease ─────────────────────────────────────────────────────────────

const ease = [0.22, 1, 0.36, 1] as [number, number, number, number]

// ─── Types (mirrors MarketplacePage) ─────────────────────────────────────────

type Category = 'all' | 'music' | 'sports' | 'clothing' | 'accessories' | 'memorabilia'

interface Drop {
  id: string
  itemName: string
  celebrity: string
  category: Category
  price: number
  pricingMode: 'fixed' | 'auction' | 'offer'
  condition: string
  wornAt?: string
  story: string
  photoColor: string
  photoEmoji: string
  isNew?: boolean
  isFeatured?: boolean
  bidCount?: number
  endsIn?: string
}

// ─── Mock drops (same source as MarketplacePage) ─────────────────────────────

const DROPS: Drop[] = [
  {
    id: '1',
    itemName: 'Stage Jacket from Koroga 2022',
    celebrity: 'Khaligraph Jones',
    category: 'clothing',
    price: 15000,
    pricingMode: 'fixed',
    condition: 'Gently worn',
    wornAt: 'Koroga Festival 2022',
    story: "This is the jacket I wore the night I performed Mazishi for the first time live. The crowd went insane. I'll never forget that night — this jacket was part of it. Every thread in this jacket holds the energy of that crowd. The way they screamed when the beat dropped, the way the lights hit different. I wore this through three encores. When I took it off backstage, I knew it was special.",
    photoColor: 'oklch(0.25 0.08 60)',
    photoEmoji: '🧥',
    isFeatured: true,
  },
  {
    id: '2',
    itemName: 'Handwritten Lyrics Notebook',
    celebrity: 'Bahati',
    category: 'memorabilia',
    price: 8500,
    pricingMode: 'auction',
    condition: 'Well loved',
    story: 'Original notebook where I wrote the first draft of Nakupenda. Real ink, real tears, real moments. The pages are wrinkled because I spilled tea on it once in the studio at 3am. Every crossing out, every rewrite — it is all there. This notebook knows my voice before the mic did.',
    photoColor: 'oklch(0.22 0.06 250)',
    photoEmoji: '📓',
    isNew: true,
    bidCount: 7,
    endsIn: '14h',
  },
  {
    id: '3',
    itemName: 'AFCON Qualifier Match Boots',
    celebrity: 'Michael Olunga',
    category: 'sports',
    price: 25000,
    pricingMode: 'fixed',
    condition: 'Game worn',
    wornAt: 'AFCON Qualifiers 2019',
    story: 'The actual boots I wore during the 2019 AFCON qualifier. Still have grass from the pitch. These boots carried me through the most important 90 minutes of my career. When I scored, the whole nation felt it. The studs are worn from that sprint. The laces are the originals.',
    photoColor: 'oklch(0.20 0.09 145)',
    photoEmoji: '👟',
    isNew: true,
  },
  {
    id: '4',
    itemName: 'Gospel Concert Microphone',
    celebrity: 'Size 8',
    category: 'music',
    price: 18000,
    pricingMode: 'fixed',
    condition: 'Excellent',
    wornAt: 'Groove Awards 2023',
    story: 'The microphone I used on stage at the Groove Awards. My voice went through this mic on the night we won Best Gospel. This mic knows my testimony. It carried my prayers to thousands. When I hold it I still feel the anointing of that night.',
    photoColor: 'oklch(0.24 0.10 20)',
    photoEmoji: '🎤',
  },
  {
    id: '5',
    itemName: 'Wife Material Show Prop Phone',
    celebrity: 'Eric Omondi',
    category: 'memorabilia',
    price: 5000,
    pricingMode: 'offer',
    condition: 'Good',
    story: 'The prop phone from the finale of Wife Material Season 2. Used in the most memed scene in the show. This phone has been screenshotted more times than any real phone in Kenya. It is the most famous fake phone in East Africa.',
    photoColor: 'oklch(0.22 0.10 20)',
    photoEmoji: '📱',
    isNew: true,
  },
  {
    id: '6',
    itemName: 'DJ Headphones — Blankets & Wine',
    celebrity: 'Pierra Makena',
    category: 'music',
    price: 12000,
    pricingMode: 'auction',
    condition: 'Good',
    wornAt: 'Blankets & Wine (3 editions)',
    story: 'These headphones were on my head at every Blankets & Wine edition for three consecutive years. They have heard every transition, every crowd reaction, every request I ignored because I knew what the crowd needed better.',
    photoColor: 'oklch(0.20 0.12 300)',
    photoEmoji: '🎧',
    bidCount: 12,
    endsIn: '6h',
    isFeatured: true,
  },
  {
    id: '7',
    itemName: 'Churchill Show Comedy Hat',
    celebrity: 'Njugush',
    category: 'accessories',
    price: 7500,
    pricingMode: 'fixed',
    condition: 'Gently worn',
    wornAt: 'Churchill Show Finale',
    story: 'The hat that started 1000 memes. I wore this on the Churchill Show finale and the internet lost its mind. This hat has its own fan page. It has more followers than some artists.',
    photoColor: 'oklch(0.25 0.08 155)',
    photoEmoji: '🎩',
  },
  {
    id: '8',
    itemName: 'Fashion Week Statement Dress',
    celebrity: 'Tanasha Donna',
    category: 'clothing',
    price: 35000,
    pricingMode: 'auction',
    condition: 'Excellent',
    story: 'The dress I wore on the Nairobi Fashion Week runway in 2024. One of a kind. The designer made it specifically for my walk. When I stepped out, the cameras went silent for a second before they erupted.',
    photoColor: 'oklch(0.20 0.10 340)',
    photoEmoji: '👗',
    isNew: true,
    isFeatured: true,
    bidCount: 3,
    endsIn: '2d',
  },
  {
    id: '9',
    itemName: 'Signed Training Jersey',
    celebrity: 'Victor Wanyama',
    category: 'sports',
    price: 45000,
    pricingMode: 'fixed',
    condition: 'Good',
    wornAt: 'Victor Wanyama Foundation Match',
    story: 'Signed training jersey from the charity match I organised at home. Everything I am started on a pitch like this. The ink from my signature is permanent marker — the kind that does not wash out. Like the memories.',
    photoColor: 'oklch(0.22 0.08 210)',
    photoEmoji: '⚽',
  },
  {
    id: '10',
    itemName: 'Wrist Beads from TV Debut',
    celebrity: 'Mammito',
    category: 'accessories',
    price: 4500,
    pricingMode: 'offer',
    condition: 'Good',
    wornAt: 'Churchill Show First Appearance',
    story: 'I wore these beads the night I appeared on Churchill Show for the very first time. That episode changed everything. My mom gave me these beads before I went on stage. She said they would bring me luck. She was right.',
    photoColor: 'oklch(0.24 0.08 30)',
    photoEmoji: '📿',
    isNew: true,
  },
  {
    id: '11',
    itemName: 'Kenya Shujaa 7s Cap',
    celebrity: 'Collins Injera',
    category: 'sports',
    price: 9000,
    pricingMode: 'fixed',
    condition: 'Game worn',
    wornAt: 'Hong Kong Sevens 2015',
    story: 'Worn at the Hong Kong Sevens 2015, the tournament where Kenya finished on the podium. This cap absorbed the sweat of victory. The brim is slightly bent from celebrating.',
    photoColor: 'oklch(0.20 0.10 145)',
    photoEmoji: '🏉',
  },
  {
    id: '12',
    itemName: 'Producer Studio Chain',
    celebrity: 'Magix Enga',
    category: 'accessories',
    price: 22000,
    pricingMode: 'auction',
    condition: 'Excellent',
    story: 'This chain was around my neck when I produced three number-one hits in the same month. The links are heavy — like the beats I made wearing it. Every session, every late night, this chain was there.',
    photoColor: 'oklch(0.22 0.08 80)',
    photoEmoji: '⛓️',
    bidCount: 5,
    endsIn: '18h',
  },
]

// ─── Seller profiles (mock) ─────────────────────────────────────────────────

const SELLER_PROFILES: Record<string, { listings: number; joined: string; initials: string }> = {
  'Khaligraph Jones': { listings: 3, joined: 'Mar 2026', initials: 'KJ' },
  'Bahati':           { listings: 2, joined: 'Mar 2026', initials: 'BK' },
  'Michael Olunga':   { listings: 1, joined: 'Mar 2026', initials: 'MO' },
  'Size 8':           { listings: 2, joined: 'Mar 2026', initials: 'S8' },
  'Eric Omondi':      { listings: 4, joined: 'Mar 2026', initials: 'EO' },
  'Pierra Makena':    { listings: 1, joined: 'Mar 2026', initials: 'PM' },
  'Njugush':          { listings: 2, joined: 'Mar 2026', initials: 'NJ' },
  'Tanasha Donna':    { listings: 1, joined: 'Mar 2026', initials: 'TD' },
  'Victor Wanyama':   { listings: 1, joined: 'Mar 2026', initials: 'VW' },
  'Mammito':          { listings: 1, joined: 'Mar 2026', initials: 'MM' },
  'Collins Injera':   { listings: 1, joined: 'Mar 2026', initials: 'CI' },
  'Magix Enga':       { listings: 2, joined: 'Mar 2026', initials: 'ME' },
}

// ─── Icons ───────────────────────────────────────────────────────────────────

function ArrowLeftIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function ShieldIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M12 2L4 6v5c0 5.25 3.4 10.16 8 11.5 4.6-1.34 8-6.25 8-11.5V6l-8-4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function CheckCircleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M5.5 8l2 2 3.5-3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function VerifiedIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <path d="M8 1l1.8 1.2L12 2l.8 2.1L15 5.8l-1.2 1.8L15 10.2l-2.2.8L12 14l-2.2-.2L8 15l-1.8-1.2L4 14l-.8-2.1L1 10.2l1.2-1.8L1 5.8l2.2-.8L4 2l2.2.2L8 1z" fill="oklch(0.52 0.22 25)"/>
      <path d="M5.5 8l2 2 3-3" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

function PhoneIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect x="5" y="2" width="14" height="20" rx="3" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="12" cy="18" r="1" fill="currentColor"/>
    </svg>
  )
}

function ShareIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
      <path d="M4 10a2 2 0 100-4 2 2 0 000 4zM12 5a2 2 0 100-4 2 2 0 000 4zM12 15a2 2 0 100-4 2 2 0 000 4z" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M5.7 9l4.6 2.5M10.3 4.5L5.7 7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  )
}

// ─── Mock photo angles for thumbnails ────────────────────────────────────────

function getPhotoAngles(drop: Drop) {
  const hueShift = [0, 20, -15, 35, -25]
  const labels = ['Front', 'Back', 'Close-up', 'With Me', 'Detail']
  return hueShift.map((shift, i) => ({
    id: i,
    label: labels[i],
    color: drop.photoColor.replace(
      /(\d+)\)$/,
      (_, hue) => `${(parseInt(hue) + shift + 360) % 360})`
    ),
    emoji: drop.photoEmoji,
    lightnessOffset: i * 0.015,
  }))
}

// ─── COA verification steps ──────────────────────────────────────────────────

const COA_STEPS = [
  { label: 'Identity verified', desc: 'National ID + selfie match via Smile Identity' },
  { label: 'Video proof recorded', desc: 'Seller filmed holding item with date visible' },
  { label: 'Editorial review passed', desc: 'Goodiegoodies team reviewed and approved' },
  { label: 'Certificate issued', desc: 'Digital COA stored permanently in your account' },
]

// ─── Category labels ─────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<string, string> = {
  clothing: 'Clothing',
  accessories: 'Accessories',
  'sports-gear': 'Sports Gear',
  sports: 'Sports',
  memorabilia: 'Memorabilia',
  music: 'Music',
  other: 'Other',
}

// ─── M-Pesa Checkout Drawer ──────────────────────────────────────────────────

type CheckoutStage = 'phone' | 'confirming' | 'success'

function MpesaCheckout({ drop, onClose }: { drop: Drop; onClose: () => void }) {
  const prefersReduced = useReducedMotion()
  const [stage, setStage] = useState<CheckoutStage>('phone')
  const [phone, setPhone] = useState('')

  const handleSubmit = () => {
    if (phone.length < 10) return
    setStage('confirming')
    setTimeout(() => setStage('success'), 3200)
  }

  const formatPhone = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 12)
    setPhone(digits)
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0"
        style={{ backgroundColor: 'oklch(0.10 0.02 60 / 0.5)', backdropFilter: 'blur(4px)' }}
        onClick={stage !== 'confirming' ? onClose : undefined}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />

      {/* Drawer */}
      <motion.div
        className={cn(
          'relative w-full sm:max-w-[420px] sm:mx-4',
          'sm:rounded-2xl rounded-t-[20px] rounded-b-none sm:rounded-b-2xl',
        )}
        style={{
          backgroundColor: 'oklch(0.995 0.003 60)',
          boxShadow: '0 -8px 40px oklch(0 0 0 / 0.12)',
        }}
        initial={prefersReduced ? { opacity: 0 } : { opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        exit={prefersReduced ? { opacity: 0 } : { opacity: 0, y: 60 }}
        transition={{ duration: 0.35, ease }}
      >
        {/* Handle bar (mobile) */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-8 h-1 rounded-full" style={{ backgroundColor: 'oklch(0.85 0.008 60)' }} />
        </div>

        {/* Close button */}
        {stage !== 'confirming' && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full transition-colors"
            style={{ color: 'oklch(0.50 0.01 60)' }}
          >
            <CloseIcon />
          </button>
        )}

        <div className="px-6 pt-4 pb-8 sm:pt-6">
          <AnimatePresence mode="wait">
            {stage === 'phone' && (
              <motion.div
                key="phone"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25, ease }}
              >
                {/* M-Pesa header */}
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-[15px] font-bold"
                    style={{ backgroundColor: 'oklch(0.45 0.18 145)', color: 'white' }}
                  >
                    M
                  </div>
                  <div>
                    <p className="text-[15px] font-semibold" style={{ color: 'oklch(0.15 0.02 60)' }}>
                      Pay with M-Pesa
                    </p>
                    <p className="text-[12px]" style={{ color: 'oklch(0.55 0.01 60)' }}>
                      Lipa na M-Pesa STK Push
                    </p>
                  </div>
                </div>

                {/* Amount */}
                <div
                  className="rounded-xl px-4 py-3.5 mb-5 flex items-center justify-between"
                  style={{ backgroundColor: 'oklch(0.97 0.005 60)' }}
                >
                  <span className="text-[12px] font-medium" style={{ color: 'oklch(0.50 0.01 60)' }}>
                    Total amount
                  </span>
                  <span className="text-[18px] font-bold tracking-tight" style={{ color: 'oklch(0.15 0.02 60)' }}>
                    KES {drop.price.toLocaleString('en-KE')}
                  </span>
                </div>

                {/* Phone input */}
                <label className="block mb-1.5">
                  <span className="text-[12px] font-semibold" style={{ color: 'oklch(0.35 0.015 60)' }}>
                    M-Pesa phone number
                  </span>
                </label>
                <div
                  className="flex items-center rounded-xl overflow-hidden mb-5 transition-shadow"
                  style={{
                    border: '1.5px solid oklch(0.88 0.01 60)',
                    backgroundColor: 'oklch(0.995 0.003 60)',
                  }}
                >
                  <span
                    className="pl-3.5 pr-2 text-[14px] font-medium shrink-0"
                    style={{ color: 'oklch(0.45 0.01 60)' }}
                  >
                    +254
                  </span>
                  <div className="w-px h-5 shrink-0" style={{ backgroundColor: 'oklch(0.90 0.008 60)' }} />
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => formatPhone(e.target.value)}
                    placeholder="7XX XXX XXX"
                    className="flex-1 h-12 pl-2.5 pr-4 text-[15px] bg-transparent outline-none"
                    style={{ color: 'oklch(0.15 0.02 60)' }}
                    autoFocus
                  />
                  <span className="pr-3.5" style={{ color: 'oklch(0.55 0.01 60)' }}>
                    <PhoneIcon />
                  </span>
                </div>

                {/* Escrow note */}
                <div
                  className="flex items-start gap-2.5 rounded-xl px-3.5 py-3 mb-6"
                  style={{ backgroundColor: 'oklch(0.96 0.04 145 / 0.3)' }}
                >
                  <span className="shrink-0 mt-0.5" style={{ color: 'oklch(0.45 0.14 145)' }}>
                    <ShieldIcon />
                  </span>
                  <p className="text-[11px] leading-relaxed" style={{ color: 'oklch(0.35 0.04 145)' }}>
                    Your payment is held in escrow. Funds are only released to the seller after you confirm delivery.
                  </p>
                </div>

                {/* Submit */}
                <motion.div whileHover={{ scale: 1.01, y: -1 }} whileTap={{ scale: 0.98 }} transition={{ duration: 0.12, ease }}>
                  <Button
                    size="lg"
                    onClick={handleSubmit}
                    disabled={phone.length < 9}
                    className="w-full h-12 text-[14px] font-semibold rounded-xl"
                    style={{ backgroundColor: 'oklch(0.45 0.18 145)', color: 'white' }}
                  >
                    Send STK Push
                  </Button>
                </motion.div>
              </motion.div>
            )}

            {stage === 'confirming' && (
              <motion.div
                key="confirming"
                className="flex flex-col items-center py-8"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease }}
              >
                {/* Pulsing ring */}
                <div className="relative w-16 h-16 mb-5">
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{ border: '2.5px solid oklch(0.45 0.18 145)' }}
                    animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                  />
                  <div
                    className="absolute inset-0 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: 'oklch(0.45 0.18 145)' }}
                  >
                    <span className="text-white text-[22px] font-bold">M</span>
                  </div>
                </div>
                <p className="text-[15px] font-semibold mb-1.5" style={{ color: 'oklch(0.15 0.02 60)' }}>
                  Check your phone
                </p>
                <p className="text-[13px] text-center max-w-[240px]" style={{ color: 'oklch(0.50 0.01 60)' }}>
                  Enter your M-Pesa PIN on the STK push notification to complete payment
                </p>
              </motion.div>
            )}

            {stage === 'success' && (
              <motion.div
                key="success"
                className="flex flex-col items-center py-6"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.35, ease }}
              >
                <motion.div
                  className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
                  style={{ backgroundColor: 'oklch(0.45 0.18 145)' }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.4, ease, delay: 0.1 }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M6 13l4 4 8-9" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </motion.div>
                <p className="text-[16px] font-semibold mb-1" style={{ color: 'oklch(0.15 0.02 60)' }}>
                  Payment received
                </p>
                <p className="text-[13px] text-center max-w-[260px] mb-1" style={{ color: 'oklch(0.50 0.01 60)' }}>
                  KES {drop.price.toLocaleString('en-KE')} paid for {drop.itemName}
                </p>
                <p className="text-[11px] text-center max-w-[260px] mb-5" style={{ color: 'oklch(0.60 0.01 60)' }}>
                  Funds held in escrow until delivery is confirmed
                </p>
                <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} transition={{ duration: 0.12 }}>
                  <Button
                    size="lg"
                    onClick={onClose}
                    className="h-11 px-8 rounded-xl text-[13px] font-semibold"
                  >
                    Done
                  </Button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function ListingDetailPage({ id }: { id: string }) {
  const navigate = useNavigate()
  const prefersReduced = useReducedMotion()
  const [activePhoto, setActivePhoto] = useState(0)
  const [showCheckout, setShowCheckout] = useState(false)
  const [offerAmount, setOfferAmount] = useState('')
  const [bidAmount, setBidAmount] = useState('')

  const drop = DROPS.find(d => d.id === id)
  const photos = drop ? getPhotoAngles(drop) : []
  const seller = drop ? SELLER_PROFILES[drop.celebrity] : null

  // Scroll to top on mount
  useEffect(() => { window.scrollTo(0, 0) }, [id])

  if (!drop) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-4"
        style={{ backgroundColor: 'oklch(0.993 0.003 80)', fontFamily: "'DM Sans', sans-serif" }}
      >
        <p className="text-[15px] font-medium" style={{ color: 'oklch(0.40 0.02 60)' }}>
          This drop was not found
        </p>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} transition={{ duration: 0.12 }}>
          <Button variant="outline" onClick={() => navigate({ to: '/marketplace' })} className="rounded-xl">
            Back to Drops
          </Button>
        </motion.div>
      </div>
    )
  }

  const ctaLabel =
    drop.pricingMode === 'fixed' ? 'Buy Now' :
    drop.pricingMode === 'auction' ? 'Place Bid' :
    'Make an Offer'

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: 'oklch(0.993 0.003 80)', fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* ── Top navigation ── */}
      <motion.nav
        className="sticky top-0 z-30 backdrop-blur-md"
        style={{
          backgroundColor: 'oklch(0.993 0.003 80 / 0.88)',
          borderBottom: '1px solid oklch(0.92 0.008 60)',
        }}
        initial={prefersReduced ? false : { opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease }}
      >
        <div className="max-w-[1120px] mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <button
            onClick={() => navigate({ to: '/marketplace' })}
            className="inline-flex items-center gap-1.5 text-[13px] font-medium transition-colors"
            style={{ color: 'oklch(0.45 0.015 60)' }}
          >
            <ArrowLeftIcon />
            <span className="hidden sm:inline">All Drops</span>
          </button>
          <span className="text-[11px] font-bold tracking-[0.18em] uppercase" style={{ color: 'oklch(0.52 0.22 25)' }}>
            goodiegoodies
          </span>
          <button
            className="w-8 h-8 flex items-center justify-center rounded-full transition-colors"
            style={{ color: 'oklch(0.50 0.01 60)' }}
            title="Share"
          >
            <ShareIcon />
          </button>
        </div>
      </motion.nav>

      {/* ── Content ── */}
      <div className="max-w-[1120px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10 pb-20">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-14">

          {/* ═══ Left column — Photos ═══ */}
          <motion.div
            className="w-full lg:w-[55%] lg:max-w-[580px] shrink-0"
            initial={prefersReduced ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease }}
          >
            {/* Main photo */}
            <div
              className="relative w-full overflow-hidden rounded-2xl"
              style={{ aspectRatio: '3 / 4' }}
            >
              {/* Blurred backdrop layer */}
              <div
                className="absolute inset-0 scale-110"
                style={{
                  backgroundColor: photos[activePhoto]?.color || drop.photoColor,
                  filter: 'blur(40px) saturate(1.3)',
                  opacity: 0.6,
                }}
              />
              {/* Photo surface */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activePhoto}
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ backgroundColor: photos[activePhoto]?.color || drop.photoColor }}
                  initial={prefersReduced ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <span className="text-[80px] sm:text-[100px] select-none" style={{ opacity: 0.45 }}>
                    {drop.photoEmoji}
                  </span>
                </motion.div>
              </AnimatePresence>

              {/* Badges */}
              <div className="absolute top-4 left-4 flex gap-2">
                {drop.isFeatured && (
                  <span
                    className="text-[10px] font-bold tracking-[0.08em] uppercase px-2.5 py-1 rounded-full"
                    style={{ backgroundColor: 'oklch(0.97 0.04 85)', color: 'oklch(0.42 0.12 85)' }}
                  >
                    Featured
                  </span>
                )}
                {drop.isNew && (
                  <span
                    className="text-[10px] font-bold tracking-[0.08em] uppercase px-2.5 py-1 rounded-full text-white"
                    style={{ backgroundColor: 'oklch(0.52 0.22 25)' }}
                  >
                    New
                  </span>
                )}
              </div>

              {/* Photo counter */}
              <div
                className="absolute bottom-4 right-4 px-2.5 py-1 rounded-full text-[10px] font-semibold backdrop-blur-sm"
                style={{ backgroundColor: 'oklch(0 0 0 / 0.35)', color: 'oklch(0.95 0.01 60)' }}
              >
                {activePhoto + 1} / {photos.length}
              </div>
            </div>

            {/* Thumbnail strip */}
            <div className="flex gap-2 mt-3">
              {photos.map((p, i) => (
                <button
                  key={p.id}
                  onClick={() => setActivePhoto(i)}
                  className={cn(
                    'relative flex-1 overflow-hidden rounded-lg transition-all duration-200',
                    i === activePhoto ? 'ring-2 ring-offset-1' : 'opacity-65 hover:opacity-90',
                  )}
                  style={{
                    aspectRatio: '1 / 1',
                    backgroundColor: p.color,
                    ringColor: i === activePhoto ? 'oklch(0.52 0.22 25)' : undefined,
                  }}
                >
                  <span className="absolute inset-0 flex items-center justify-center text-[18px] select-none" style={{ opacity: 0.5 }}>
                    {p.emoji}
                  </span>
                  <span
                    className="absolute bottom-1 left-0 right-0 text-center text-[8px] font-semibold tracking-wide uppercase"
                    style={{ color: 'oklch(0.95 0.01 60 / 0.7)' }}
                  >
                    {p.label}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>

          {/* ═══ Right column — Details ═══ */}
          <motion.div
            className="flex-1 min-w-0"
            initial={prefersReduced ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: prefersReduced ? 0 : 0.1, ease }}
          >
            {/* Celebrity + verified */}
            <div className="flex items-center gap-1.5 mb-2">
              <p className="text-[13px] font-medium" style={{ color: 'oklch(0.50 0.015 60)' }}>
                {drop.celebrity}
              </p>
              <VerifiedIcon />
            </div>

            {/* Item name */}
            <h1
              className="text-[24px] sm:text-[28px] font-bold tracking-tight leading-tight mb-4"
              style={{ color: 'oklch(0.12 0.02 60)', margin: 0, letterSpacing: '-0.5px', lineHeight: 1.15 }}
            >
              {drop.itemName}
            </h1>

            {/* Meta pills */}
            <div className="flex flex-wrap items-center gap-2 mb-6">
              {drop.wornAt && (
                <span
                  className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full"
                  style={{ backgroundColor: 'oklch(0.96 0.02 25 / 0.5)', color: 'oklch(0.40 0.10 25)' }}
                >
                  <span style={{ fontSize: 10 }}>📍</span>
                  {drop.wornAt}
                </span>
              )}
              <span
                className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                style={{ backgroundColor: 'oklch(0.96 0.008 60)', color: 'oklch(0.45 0.015 60)' }}
              >
                {drop.condition}
              </span>
              <span
                className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                style={{ backgroundColor: 'oklch(0.96 0.008 60)', color: 'oklch(0.45 0.015 60)' }}
              >
                {CATEGORY_LABELS[drop.category] || drop.category}
              </span>
            </div>

            {/* ── Separator ── */}
            <div className="w-full h-px mb-6" style={{ backgroundColor: 'oklch(0.93 0.006 60)' }} />

            {/* ── Price + CTA block ── */}
            <div className="mb-8">
              {/* Auction info */}
              {drop.pricingMode === 'auction' && drop.endsIn && (
                <p className="text-[11px] font-semibold tracking-[0.04em] mb-2" style={{ color: 'oklch(0.48 0.14 85)' }}>
                  ⏱ {drop.endsIn} remaining · {drop.bidCount} bid{(drop.bidCount ?? 0) !== 1 ? 's' : ''}
                </p>
              )}

              <div className="flex items-end gap-2 mb-1">
                <span
                  className="text-[32px] font-bold tracking-tight leading-none"
                  style={{ color: 'oklch(0.12 0.02 60)' }}
                >
                  KES {drop.price.toLocaleString('en-KE')}
                </span>
                {drop.pricingMode === 'auction' && (
                  <span className="text-[12px] font-medium pb-1" style={{ color: 'oklch(0.55 0.01 60)' }}>
                    current bid
                  </span>
                )}
              </div>

              {/* Pricing mode label */}
              <p className="text-[11px] font-medium mb-4" style={{ color: 'oklch(0.55 0.01 60)' }}>
                {drop.pricingMode === 'fixed' && 'Fixed price · Ships within 3 days'}
                {drop.pricingMode === 'auction' && 'Auction · Highest bid wins when timer ends'}
                {drop.pricingMode === 'offer' && 'Open to offers · Seller decides'}
              </p>

              {/* Bid/Offer input (conditional) */}
              {drop.pricingMode === 'auction' && (
                <div className="mb-3">
                  <div
                    className="flex items-center rounded-xl overflow-hidden"
                    style={{ border: '1.5px solid oklch(0.88 0.01 60)', backgroundColor: 'oklch(0.995 0.003 60)' }}
                  >
                    <span className="pl-3.5 text-[14px] font-medium shrink-0" style={{ color: 'oklch(0.45 0.01 60)' }}>KES</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={bidAmount}
                      onChange={e => setBidAmount(e.target.value.replace(/\D/g, ''))}
                      placeholder={`${(drop.price + 500).toLocaleString('en-KE')} or more`}
                      className="flex-1 h-11 pl-2 pr-4 text-[14px] bg-transparent outline-none"
                      style={{ color: 'oklch(0.15 0.02 60)' }}
                    />
                  </div>
                </div>
              )}
              {drop.pricingMode === 'offer' && (
                <div className="mb-3">
                  <div
                    className="flex items-center rounded-xl overflow-hidden"
                    style={{ border: '1.5px solid oklch(0.88 0.01 60)', backgroundColor: 'oklch(0.995 0.003 60)' }}
                  >
                    <span className="pl-3.5 text-[14px] font-medium shrink-0" style={{ color: 'oklch(0.45 0.01 60)' }}>KES</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={offerAmount}
                      onChange={e => setOfferAmount(e.target.value.replace(/\D/g, ''))}
                      placeholder="Your offer"
                      className="flex-1 h-11 pl-2 pr-4 text-[14px] bg-transparent outline-none"
                      style={{ color: 'oklch(0.15 0.02 60)' }}
                    />
                  </div>
                </div>
              )}

              {/* CTA button */}
              <motion.div whileHover={{ scale: 1.012, y: -1 }} whileTap={{ scale: 0.97 }} transition={{ duration: 0.12, ease }}>
                <Button
                  size="lg"
                  onClick={() => setShowCheckout(true)}
                  className="w-full h-12 text-[14px] font-semibold rounded-xl text-white cursor-pointer"
                  style={{ backgroundColor: 'oklch(0.52 0.22 25)' }}
                >
                  {ctaLabel} — KES {drop.price.toLocaleString('en-KE')}
                </Button>
              </motion.div>

              {/* Escrow trust line */}
              <div className="flex items-center gap-2 mt-3 justify-center">
                <span style={{ color: 'oklch(0.50 0.12 145)' }}>
                  <ShieldIcon />
                </span>
                <p className="text-[11px]" style={{ color: 'oklch(0.50 0.01 60)' }}>
                  Escrow protected — your money is held safely until you confirm delivery
                </p>
              </div>
            </div>

            {/* ── The Story ── */}
            <div className="mb-8">
              <p
                className="text-[10px] font-bold tracking-[0.16em] uppercase mb-3"
                style={{ color: 'oklch(0.52 0.22 25)' }}
              >
                The Story
              </p>
              <div
                className="pl-4"
                style={{ borderLeft: '2px solid oklch(0.52 0.22 25 / 0.25)' }}
              >
                <p
                  className="text-[15px] leading-[1.7] italic"
                  style={{ color: 'oklch(0.30 0.02 60)' }}
                >
                  "{drop.story}"
                </p>
                <p className="text-[12px] font-medium mt-2.5" style={{ color: 'oklch(0.50 0.015 60)' }}>
                  — {drop.celebrity}
                </p>
              </div>
            </div>

            {/* ── Separator ── */}
            <div className="w-full h-px mb-8" style={{ backgroundColor: 'oklch(0.93 0.006 60)' }} />

            {/* ── Certificate of Authenticity ── */}
            <div className="mb-8">
              <p
                className="text-[10px] font-bold tracking-[0.16em] uppercase mb-4"
                style={{ color: 'oklch(0.52 0.22 25)' }}
              >
                Certificate of Authenticity
              </p>
              <div
                className="rounded-2xl overflow-hidden"
                style={{ border: '1px solid oklch(0.92 0.008 60)' }}
              >
                {/* COA header */}
                <div
                  className="px-5 py-4 flex items-center gap-3"
                  style={{ backgroundColor: 'oklch(0.97 0.005 60)' }}
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: 'oklch(0.52 0.22 25 / 0.1)' }}
                  >
                    <ShieldIcon />
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold" style={{ color: 'oklch(0.15 0.02 60)' }}>
                      Verified Authentic
                    </p>
                    <p className="text-[11px]" style={{ color: 'oklch(0.55 0.01 60)' }}>
                      This item passed all 4 verification steps
                    </p>
                  </div>
                </div>
                {/* COA steps */}
                <div className="px-5 py-1">
                  {COA_STEPS.map((step, i) => (
                    <div
                      key={step.label}
                      className="flex items-start gap-3 py-3"
                      style={i < COA_STEPS.length - 1 ? { borderBottom: '1px solid oklch(0.94 0.006 60)' } : {}}
                    >
                      <span className="mt-0.5 shrink-0" style={{ color: 'oklch(0.50 0.14 145)' }}>
                        <CheckCircleIcon />
                      </span>
                      <div>
                        <p className="text-[12px] font-semibold" style={{ color: 'oklch(0.25 0.02 60)' }}>
                          {step.label}
                        </p>
                        <p className="text-[11px]" style={{ color: 'oklch(0.55 0.01 60)' }}>
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Separator ── */}
            <div className="w-full h-px mb-8" style={{ backgroundColor: 'oklch(0.93 0.006 60)' }} />

            {/* ── Seller card ── */}
            {seller && (
              <div className="mb-6">
                <p
                  className="text-[10px] font-bold tracking-[0.16em] uppercase mb-4"
                  style={{ color: 'oklch(0.52 0.22 25)' }}
                >
                  Seller
                </p>
                <div className="flex items-center gap-3.5">
                  {/* Avatar */}
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center text-[13px] font-bold shrink-0"
                    style={{ backgroundColor: 'oklch(0.92 0.015 60)', color: 'oklch(0.35 0.02 60)' }}
                  >
                    {seller.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-[13px] font-semibold truncate" style={{ color: 'oklch(0.15 0.02 60)' }}>
                        {drop.celebrity}
                      </p>
                      <VerifiedIcon />
                    </div>
                    <p className="text-[11px]" style={{ color: 'oklch(0.55 0.01 60)' }}>
                      {seller.listings} listing{seller.listings !== 1 ? 's' : ''} · Joined {seller.joined}
                    </p>
                  </div>
                  <span
                    className="text-[10px] font-bold tracking-[0.06em] uppercase px-2.5 py-1 rounded-full shrink-0"
                    style={{ backgroundColor: 'oklch(0.96 0.02 145 / 0.4)', color: 'oklch(0.38 0.10 145)' }}
                  >
                    Verified
                  </span>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* ── Sticky mobile CTA ── */}
      <div
        className="fixed bottom-0 left-0 right-0 lg:hidden z-20"
        style={{
          backgroundColor: 'oklch(0.995 0.003 60 / 0.92)',
          backdropFilter: 'blur(12px)',
          borderTop: '1px solid oklch(0.92 0.008 60)',
        }}
      >
        <div className="px-4 py-3 flex items-center gap-3 max-w-[600px] mx-auto">
          <div className="flex-1 min-w-0">
            <p className="text-[18px] font-bold tracking-tight leading-none" style={{ color: 'oklch(0.12 0.02 60)' }}>
              KES {drop.price.toLocaleString('en-KE')}
            </p>
            <p className="text-[11px] mt-0.5" style={{ color: 'oklch(0.55 0.01 60)' }}>
              {drop.pricingMode === 'fixed' ? 'Fixed price' : drop.pricingMode === 'auction' ? `${drop.bidCount} bids · ${drop.endsIn} left` : 'Make an offer'}
            </p>
          </div>
          <motion.div whileTap={{ scale: 0.96 }} transition={{ duration: 0.1 }}>
            <Button
              size="lg"
              onClick={() => setShowCheckout(true)}
              className="h-11 px-6 rounded-xl text-[13px] font-semibold text-white cursor-pointer shrink-0"
              style={{ backgroundColor: 'oklch(0.52 0.22 25)' }}
            >
              {ctaLabel}
            </Button>
          </motion.div>
        </div>
      </div>

      {/* ── Checkout overlay ── */}
      <AnimatePresence>
        {showCheckout && (
          <MpesaCheckout drop={drop} onClose={() => setShowCheckout(false)} />
        )}
      </AnimatePresence>
    </div>
  )
}

import { useState, useRef } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'motion/react'
import { useNavigate, Link } from '@tanstack/react-router'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

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

// ─── Mock drops ───────────────────────────────────────────────────────────────

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
    story: "This is the jacket I wore the night I performed Mazishi for the first time live. The crowd went insane. I'll never forget that night — this jacket was part of it.",
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
    story: 'Original notebook where I wrote the first draft of Nakupenda. Real ink, real tears, real moments.',
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
    story: 'The actual boots I wore during the 2019 AFCON qualifier. Still have grass from the pitch.',
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
    story: 'The microphone I used on stage at the Groove Awards. My voice went through this mic on the night we won Best Gospel.',
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
    story: 'The prop phone from the finale of Wife Material Season 2. Used in the most memed scene in the show.',
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
    story: 'These headphones were on my head at every Blankets & Wine edition for three consecutive years.',
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
    story: 'The hat that started 1000 memes. I wore this on the Churchill Show finale and the internet lost its mind.',
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
    story: 'The dress I wore on the Nairobi Fashion Week runway in 2024. One of a kind.',
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
    story: 'Signed training jersey from the charity match I organised at home. Everything I am started on a pitch like this.',
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
    story: 'I wore these beads the night I appeared on Churchill Show for the very first time. That episode changed everything.',
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
    story: 'Worn at the Hong Kong Sevens 2015, the tournament where Kenya finished on the podium.',
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
    story: 'This chain was around my neck when I produced three number-one hits in the same month.',
    photoColor: 'oklch(0.22 0.08 80)',
    photoEmoji: '⛓️',
    bidCount: 5,
    endsIn: '18h',
  },
]

// ─── Filter config ─────────────────────────────────────────────────────────────

const FILTERS: { key: Category; label: string }[] = [
  { key: 'all',         label: 'All Drops' },
  { key: 'music',       label: 'Music' },
  { key: 'sports',      label: 'Sports' },
  { key: 'clothing',    label: 'Clothing' },
  { key: 'accessories', label: 'Accessories' },
  { key: 'memorabilia', label: 'Memorabilia' },
]

// ─── Icons ────────────────────────────────────────────────────────────────────

function SearchIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M10.5 10.5L13.5 13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
      <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}

// ─── Drop card ────────────────────────────────────────────────────────────────

function DropCard({ drop, index }: { drop: Drop; index: number }) {
  const prefersReduced = useReducedMotion()
  const [hovered, setHovered] = useState(false)

  return (
    <Link to="/listing/$id" params={{ id: drop.id }} className="block">
    <motion.div
      className="cursor-pointer overflow-hidden"
      style={{ backgroundColor: 'oklch(0.995 0.003 60)' }}
      initial={prefersReduced ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay: prefersReduced ? 0 : index * 0.04, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
    >
      {/* Photo — always 3:4 to match crop ratio */}
      <div
        className="relative w-full overflow-hidden"
        style={{ aspectRatio: '3 / 4', backgroundColor: drop.photoColor }}
      >
        {/* Emoji art */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
          <span
            style={{
              fontSize: 56,
              opacity: 0.5,
              transform: hovered ? 'scale(1.12)' : 'scale(1)',
              transition: 'transform 0.45s ease',
            }}
          >
            {drop.photoEmoji}
          </span>
        </div>

        {/* Top badges */}
        <div className="absolute top-2.5 left-2.5 flex gap-1.5">
          {drop.isFeatured && (
            <span
              className="text-[9px] font-bold tracking-[0.1em] uppercase px-2 py-0.5 rounded-full"
              style={{ backgroundColor: 'oklch(0.97 0.04 85)', color: 'oklch(0.45 0.12 85)' }}
            >
              Featured
            </span>
          )}
          {drop.isNew && !drop.isFeatured && (
            <span
              className="text-[9px] font-bold tracking-[0.1em] uppercase px-2 py-0.5 rounded-full text-white"
              style={{ backgroundColor: 'oklch(0.52 0.22 25)' }}
            >
              New Drop
            </span>
          )}
        </div>

        {/* Worn at */}
        {drop.wornAt && (
          <div
            className="absolute bottom-2.5 left-2.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-semibold backdrop-blur-sm"
            style={{ backgroundColor: 'oklch(0 0 0 / 0.40)', color: 'oklch(0.95 0.01 60)' }}
          >
            <span style={{ fontSize: 8 }}>📍</span>
            {drop.wornAt}
          </div>
        )}

        {/* Hover story */}
        <AnimatePresence>
          {hovered && (
            <motion.div
              className="absolute inset-0 flex items-end p-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.16 }}
              style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.68) 0%, rgba(0,0,0,0.1) 55%, transparent 100%)' }}
            >
              <p style={{ fontSize: '11px', lineHeight: 1.55, color: 'rgba(255,255,255,0.9)', fontStyle: 'italic' }}>
                "{drop.story.length > 85 ? drop.story.slice(0, 85) + '…' : drop.story}"
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Card body */}
      <div className="px-3.5 py-3 flex flex-col gap-1.5">
        {/* Auction info */}
        {drop.pricingMode === 'auction' && drop.endsIn && (
          <p className="text-[10px] font-semibold tracking-[0.05em]" style={{ color: 'oklch(0.50 0.14 85)' }}>
            ⏱ {drop.endsIn} left · {drop.bidCount} bid{(drop.bidCount ?? 0) !== 1 ? 's' : ''}
          </p>
        )}

        <p className="text-[11px] font-medium leading-none" style={{ color: 'oklch(0.55 0.015 60)' }}>
          {drop.celebrity}
        </p>

        <h3
          className="text-[13px] font-semibold leading-snug"
          style={{ color: 'oklch(0.15 0.02 60)', fontFamily: "'DM Sans', sans-serif" }}
        >
          {drop.itemName}
        </h3>

        <div className="flex items-center justify-between pt-0.5">
          <span
            className="text-[14px] font-bold tracking-tight"
            style={{ color: 'oklch(0.20 0.02 60)', fontFamily: "'DM Sans', sans-serif" }}
          >
            KES {drop.price.toLocaleString('en-KE')}
          </span>
          <span
            className="text-[9px] font-semibold tracking-[0.06em] uppercase px-2 py-0.5 rounded-full"
            style={{ backgroundColor: 'oklch(0.96 0.008 60)', color: 'oklch(0.48 0.015 60)' }}
          >
            {drop.pricingMode === 'fixed' ? 'Buy Now' : drop.pricingMode === 'auction' ? 'Auction' : 'Make Offer'}
          </span>
        </div>
      </div>
    </motion.div>
    </Link>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MarketplacePage() {
  const navigate = useNavigate()
  const [activeFilter, setActiveFilter] = useState<Category>('all')
  const [search, setSearch] = useState('')
  const searchRef = useRef<HTMLInputElement>(null)

  const filtered = DROPS.filter(d => {
    const matchesCategory = activeFilter === 'all' || d.category === activeFilter
    const q = search.toLowerCase().trim()
    const matchesSearch = !q || d.itemName.toLowerCase().includes(q) || d.celebrity.toLowerCase().includes(q)
    return matchesCategory && matchesSearch
  })

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'oklch(0.993 0.003 80)', fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── Header + filters — padded ── */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-5">

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-bold tracking-[0.2em] uppercase" style={{ color: 'oklch(0.52 0.22 25)' }}>
              goodiegoodies
            </span>
            <h1 className="text-[26px] sm:text-[30px] font-bold tracking-tight leading-none" style={{ color: 'oklch(0.12 0.02 60)', fontFamily: "'DM Sans', sans-serif" }}>
              Browse Drops
            </h1>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => navigate({ to: '/dashboard' })}
              className="h-10 px-4 rounded-xl text-[13px] font-medium transition-colors"
              style={{ border: '1px solid oklch(0.90 0.008 60)', color: 'oklch(0.40 0.02 60)', backgroundColor: 'oklch(0.995 0.003 60)' }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'oklch(0.97 0.005 60)')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'oklch(0.995 0.003 60)')}
            >
              My Listings
            </button>
            <Link to="/create-listing">
              <motion.button
                whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.12 }}
                className="inline-flex items-center gap-2 h-10 px-5 rounded-xl text-[13px] font-semibold text-white cursor-pointer"
                style={{ backgroundColor: 'oklch(0.52 0.22 25)' }}
              >
                <PlusIcon />
                List item
              </motion.button>
            </Link>
          </div>
        </div>

        {/* Search + filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div
            className="relative flex items-center rounded-xl overflow-hidden"
            style={{ border: '1px solid oklch(0.91 0.008 60)', backgroundColor: 'oklch(0.995 0.003 60)' }}
          >
            <span className="pl-3.5" style={{ color: 'oklch(0.60 0.01 60)' }}><SearchIcon /></span>
            <input
              ref={searchRef}
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search drops, celebrities…"
              className="h-10 pl-2.5 pr-4 text-[13px] bg-transparent outline-none w-full sm:w-[260px]"
              style={{ color: 'oklch(0.20 0.02 60)' }}
            />
          </div>
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar" style={{ WebkitOverflowScrolling: 'touch' }}>
            {FILTERS.map(f => {
              const isActive = activeFilter === f.key
              return (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setActiveFilter(f.key)}
                  className={cn(
                    'flex items-center px-3.5 py-2 rounded-lg text-[13px] font-medium transition-all duration-200 whitespace-nowrap shrink-0',
                    isActive ? 'text-[oklch(0.15_0.02_60)]' : 'text-[oklch(0.55_0.015_60)] hover:text-[oklch(0.35_0.02_60)]',
                  )}
                  style={isActive ? { backgroundColor: 'oklch(0.95 0.008 60)' } : {}}
                >
                  {f.label}
                </button>
              )
            })}
          </div>
          <span className="hidden sm:flex items-center ml-auto text-[12px] font-medium shrink-0" style={{ color: 'oklch(0.60 0.01 60)' }}>
            {filtered.length} {filtered.length === 1 ? 'drop' : 'drops'}
          </span>
        </div>
      </div>

      {/* ── Grid ── */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatePresence mode="wait">
          {filtered.length === 0 ? (
            <motion.div
              key="empty"
              className="flex flex-col items-center justify-center py-24 gap-4"
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
            >
              <span className="text-5xl">🔍</span>
              <div className="flex flex-col items-center gap-1.5 text-center">
                <h3 className="text-[15px] font-semibold" style={{ color: 'oklch(0.25 0.02 60)' }}>No drops found</h3>
                <p className="text-[13px]" style={{ color: 'oklch(0.55 0.015 60)' }}>Try a different category or search term</p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={activeFilter + search}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ duration: 0.25 }}
            >
              <div
                className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
                style={{ gap: '1px', backgroundColor: 'oklch(0.91 0.008 60)' }}
              >
                {filtered.map((drop, i) => (
                  <DropCard key={drop.id} drop={drop} index={i} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Footer ── */}
        <div className="mt-12 py-6 text-center" style={{ borderTop: '1px solid oklch(0.93 0.006 60)' }}>
          <p className="text-[11px] font-medium tracking-[0.08em] uppercase" style={{ color: 'oklch(0.65 0.01 60)' }}>
            <span style={{ color: 'oklch(0.52 0.22 25)' }}>gg</span>oodiegoodies · Kenya's celebrity personal items marketplace
          </p>
        </div>
      </div>
    </div>
  )
}

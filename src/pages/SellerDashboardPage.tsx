import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Link } from '@tanstack/react-router'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

type ListingStatus = 'draft' | 'pending' | 'live' | 'sold' | 'archived'
type SortKey = 'date' | 'price-high' | 'price-low' | 'views'
type ViewMode = 'grid' | 'list'

interface Listing {
  id: string
  itemName: string
  celebrity: string
  category: string
  categoryIcon: string
  price: number
  status: ListingStatus
  dateCreated: string
  views: number
  photoColor: string
  photoEmoji: string
  wornAt?: string
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_LISTINGS: Listing[] = [
  {
    id: '1',
    itemName: 'Stage Jacket from Koroga 2022',
    celebrity: 'Khaligraph Jones',
    category: 'Clothing',
    categoryIcon: '👕',
    price: 15000,
    status: 'live',
    dateCreated: '2026-03-18',
    views: 342,
    photoColor: 'oklch(0.25 0.08 60)',
    photoEmoji: '🧥',
    wornAt: 'Koroga Festival 2022',
  },
  {
    id: '2',
    itemName: 'Handwritten Lyrics Notebook',
    celebrity: 'Bahati',
    category: 'Memorabilia',
    categoryIcon: '🎖️',
    price: 8500,
    status: 'live',
    dateCreated: '2026-03-15',
    views: 218,
    photoColor: 'oklch(0.22 0.06 250)',
    photoEmoji: '📓',
  },
  {
    id: '3',
    itemName: 'AFCON Qualifier Match Boots',
    celebrity: 'Michael Olunga',
    category: 'Sports Gear',
    categoryIcon: '🏆',
    price: 25000,
    status: 'pending',
    dateCreated: '2026-03-20',
    views: 0,
    photoColor: 'oklch(0.20 0.09 145)',
    photoEmoji: '👟',
    wornAt: 'AFCON Qualifiers 2019',
  },
  {
    id: '4',
    itemName: 'DJ Headphones — Blankets & Wine',
    celebrity: 'Pierra Makena',
    category: 'Accessories',
    categoryIcon: '⌚',
    price: 12000,
    status: 'sold',
    dateCreated: '2026-03-10',
    views: 891,
    photoColor: 'oklch(0.20 0.12 300)',
    photoEmoji: '🎧',
    wornAt: 'Blankets & Wine',
  },
  {
    id: '5',
    itemName: 'Wife Material Show Prop Phone',
    celebrity: 'Eric Omondi',
    category: 'Memorabilia',
    categoryIcon: '🎖️',
    price: 5000,
    status: 'draft',
    dateCreated: '2026-03-21',
    views: 0,
    photoColor: 'oklch(0.22 0.10 20)',
    photoEmoji: '📱',
  },
  {
    id: '6',
    itemName: 'Gospel Concert Microphone',
    celebrity: 'Size 8',
    category: 'Music',
    categoryIcon: '🎵',
    price: 18000,
    status: 'live',
    dateCreated: '2026-03-12',
    views: 467,
    photoColor: 'oklch(0.28 0.05 50)',
    photoEmoji: '🎤',
    wornAt: 'Groove Awards 2023',
  },
  {
    id: '7',
    itemName: 'Churchill Show Comedy Hat',
    celebrity: 'Njugush',
    category: 'Accessories',
    categoryIcon: '⌚',
    price: 7500,
    status: 'sold',
    dateCreated: '2026-03-08',
    views: 1203,
    photoColor: 'oklch(0.25 0.08 155)',
    photoEmoji: '🎩',
    wornAt: 'Churchill Show Finale',
  },
  {
    id: '8',
    itemName: 'Fashion Week Statement Dress',
    celebrity: 'Tanasha Donna',
    category: 'Clothing',
    categoryIcon: '👕',
    price: 35000,
    status: 'pending',
    dateCreated: '2026-03-19',
    views: 0,
    photoColor: 'oklch(0.18 0.08 340)',
    photoEmoji: '👗',
  },
  {
    id: '9',
    itemName: 'Signed Training Jersey',
    celebrity: 'Victor Wanyama',
    category: 'Sports Gear',
    categoryIcon: '🏆',
    price: 45000,
    status: 'archived',
    dateCreated: '2026-02-28',
    views: 1540,
    photoColor: 'oklch(0.20 0.04 240)',
    photoEmoji: '👕',
  },
  {
    id: '10',
    itemName: 'Studio Session Snapback',
    celebrity: 'Nyashinski',
    category: 'Accessories',
    categoryIcon: '⌚',
    price: 6000,
    status: 'draft',
    dateCreated: '2026-03-22',
    views: 0,
    photoColor: 'oklch(0.22 0.06 80)',
    photoEmoji: '🧢',
  },
]

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<ListingStatus, { label: string; dot: string; bg: string; text: string }> = {
  draft:    { label: 'Draft',          dot: 'oklch(0.65 0.02 260)', bg: 'oklch(0.95 0.005 260)', text: 'oklch(0.45 0.02 260)' },
  pending:  { label: 'Pending Review', dot: 'oklch(0.70 0.16 85)',  bg: 'oklch(0.95 0.04 85)',   text: 'oklch(0.45 0.12 85)' },
  live:     { label: 'Live',           dot: 'oklch(0.65 0.19 155)', bg: 'oklch(0.95 0.04 155)',  text: 'oklch(0.40 0.14 155)' },
  sold:     { label: 'Sold',           dot: 'oklch(0.60 0.16 250)', bg: 'oklch(0.95 0.03 250)',  text: 'oklch(0.42 0.14 250)' },
  archived: { label: 'Archived',       dot: 'oklch(0.60 0.01 260)', bg: 'oklch(0.93 0.005 260)', text: 'oklch(0.50 0.01 260)' },
}

const STATUS_TABS: Array<{ key: ListingStatus | 'all'; label: string }> = [
  { key: 'all',      label: 'All' },
  { key: 'draft',    label: 'Drafts' },
  { key: 'pending',  label: 'Pending' },
  { key: 'live',     label: 'Live' },
  { key: 'sold',     label: 'Sold' },
  { key: 'archived', label: 'Archived' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatKES(amount: number): string {
  return `KES ${amount.toLocaleString('en-KE')}`
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-KE', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatDateShort(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-KE', {
    month: 'short',
    day: 'numeric',
  })
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function GridIcon({ active }: { active: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="1" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" fill={active ? 'currentColor' : 'none'} opacity={active ? 0.15 : 1} />
      <rect x="9" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" fill={active ? 'currentColor' : 'none'} opacity={active ? 0.15 : 1} />
      <rect x="1" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" fill={active ? 'currentColor' : 'none'} opacity={active ? 0.15 : 1} />
      <rect x="9" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" fill={active ? 'currentColor' : 'none'} opacity={active ? 0.15 : 1} />
    </svg>
  )
}

function ListIcon({ active }: { active: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="1" y="1.5" width="14" height="3" rx="1" stroke="currentColor" strokeWidth="1.5" fill={active ? 'currentColor' : 'none'} opacity={active ? 0.15 : 1} />
      <rect x="1" y="6.5" width="14" height="3" rx="1" stroke="currentColor" strokeWidth="1.5" fill={active ? 'currentColor' : 'none'} opacity={active ? 0.15 : 1} />
      <rect x="1" y="11.5" width="14" height="3" rx="1" stroke="currentColor" strokeWidth="1.5" fill={active ? 'currentColor' : 'none'} opacity={active ? 0.15 : 1} />
    </svg>
  )
}

function MoreIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <circle cx="8" cy="3" r="1.3" />
      <circle cx="8" cy="8" r="1.3" />
      <circle cx="8" cy="13" r="1.3" />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" className="text-current">
      <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10.5 10.5L13.5 13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function EyeIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
      <path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  )
}

function ChevronDownIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M3 4.5l3 3 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

// ─── StatusBadge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: ListingStatus }) {
  const config = STATUS_CONFIG[status]
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide"
      style={{ backgroundColor: config.bg, color: config.text }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: config.dot }} />
      {config.label}
    </span>
  )
}

// ─── ActionMenu ───────────────────────────────────────────────────────────────

const ACTIONS = [
  { key: 'edit',      label: 'Edit listing',   icon: '✏️' },
  { key: 'publish',   label: 'Submit for review', icon: '🚀' },
  { key: 'duplicate', label: 'Duplicate',      icon: '📋' },
  { key: 'archive',   label: 'Archive',        icon: '📦' },
  { key: 'delete',    label: 'Delete',         icon: '🗑️', destructive: true },
] as const

function ActionMenu({ listingId, status }: { listingId: string; status: ListingStatus }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const visibleActions = ACTIONS.filter(a => {
    if (a.key === 'publish' && (status === 'live' || status === 'sold' || status === 'pending')) return false
    if (a.key === 'archive' && status === 'archived') return false
    return true
  })

  void listingId

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setOpen(!open) }}
        className={cn(
          'w-8 h-8 rounded-lg flex items-center justify-center transition-colors',
          open
            ? 'bg-[oklch(0.94_0.01_60)] text-[oklch(0.30_0.02_60)]'
            : 'text-[oklch(0.60_0.01_60)] hover:bg-[oklch(0.96_0.008_60)] hover:text-[oklch(0.35_0.02_60)]',
        )}
      >
        <MoreIcon />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-0 top-full mt-1 z-50 min-w-[180px] rounded-xl border shadow-lg overflow-hidden"
            style={{
              backgroundColor: 'oklch(0.995 0.002 60)',
              borderColor: 'oklch(0.92 0.008 60)',
              boxShadow: '0 8px 30px oklch(0 0 0 / 0.08), 0 2px 8px oklch(0 0 0 / 0.04)',
            }}
          >
            {visibleActions.map((action, i) => (
              <button
                key={action.key}
                type="button"
                onClick={(e) => { e.stopPropagation(); setOpen(false) }}
                className={cn(
                  'w-full flex items-center gap-2.5 px-3.5 py-2.5 text-[13px] font-medium transition-colors text-left',
                  action.destructive
                    ? 'text-[oklch(0.55_0.20_25)] hover:bg-[oklch(0.97_0.02_25)]'
                    : 'text-[oklch(0.35_0.02_60)] hover:bg-[oklch(0.97_0.008_60)]',
                  i === 0 && 'pt-3',
                  i === visibleActions.length - 1 && 'pb-3',
                )}
              >
                <span className="text-sm">{action.icon}</span>
                {action.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── SortDropdown ─────────────────────────────────────────────────────────────

const SORT_OPTIONS: Array<{ key: SortKey; label: string }> = [
  { key: 'date',       label: 'Date listed' },
  { key: 'price-high', label: 'Price: high to low' },
  { key: 'price-low',  label: 'Price: low to high' },
  { key: 'views',      label: 'Most viewed' },
]

function SortDropdown({ value, onChange }: { value: SortKey; onChange: (v: SortKey) => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const current = SORT_OPTIONS.find(o => o.key === value)!

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          'flex items-center gap-2 h-9 px-3.5 rounded-lg text-[13px] font-medium transition-colors border',
          open
            ? 'bg-[oklch(0.97_0.008_60)] border-[oklch(0.88_0.01_60)] text-[oklch(0.25_0.02_60)]'
            : 'border-[oklch(0.92_0.008_60)] text-[oklch(0.50_0.015_60)] hover:border-[oklch(0.85_0.01_60)] hover:text-[oklch(0.35_0.02_60)]',
        )}
      >
        {current.label}
        <ChevronDownIcon />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="absolute left-0 top-full mt-1 z-50 min-w-[180px] rounded-xl border shadow-lg overflow-hidden"
            style={{
              backgroundColor: 'oklch(0.995 0.002 60)',
              borderColor: 'oklch(0.92 0.008 60)',
              boxShadow: '0 8px 30px oklch(0 0 0 / 0.08), 0 2px 8px oklch(0 0 0 / 0.04)',
            }}
          >
            {SORT_OPTIONS.map((opt, i) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => { onChange(opt.key); setOpen(false) }}
                className={cn(
                  'w-full flex items-center px-3.5 py-2.5 text-[13px] font-medium transition-colors text-left',
                  opt.key === value
                    ? 'text-[oklch(0.52_0.22_25)] bg-[oklch(0.98_0.01_25)]'
                    : 'text-[oklch(0.40_0.02_60)] hover:bg-[oklch(0.97_0.008_60)]',
                  i === 0 && 'pt-3',
                  i === SORT_OPTIONS.length - 1 && 'pb-3',
                )}
              >
                {opt.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── StatCard ─────────────────────────────────────────────────────────────────

function StatCard({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div
      className="flex flex-col gap-1 px-5 py-4 rounded-2xl"
      style={{ backgroundColor: 'oklch(0.98 0.005 60)' }}
    >
      <span
        className="text-[11px] font-semibold tracking-[0.08em] uppercase"
        style={{ color: 'oklch(0.58 0.015 60)' }}
      >
        {label}
      </span>
      <span
        className="text-[22px] font-bold tracking-tight leading-none"
        style={{ color: accent || 'oklch(0.15 0.02 60)', fontFamily: "'DM Sans', sans-serif" }}
      >
        {value}
      </span>
    </div>
  )
}

// ─── ListingCard (grid view) ──────────────────────────────────────────────────

function ListingCard({ listing }: { listing: Listing }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8, scale: 0.97 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -3 }}
      className="group flex flex-col rounded-2xl overflow-hidden cursor-pointer"
      style={{
        border: '1px solid oklch(0.93 0.006 60)',
        backgroundColor: 'oklch(0.995 0.003 60)',
        boxShadow: '0 1px 3px oklch(0 0 0 / 0.04)',
      }}
    >
      {/* Photo placeholder */}
      <div
        className="relative aspect-[4/3] flex items-center justify-center overflow-hidden"
        style={{ backgroundColor: listing.photoColor }}
      >
        <span className="text-5xl select-none opacity-60 group-hover:scale-110 transition-transform duration-500 ease-out">
          {listing.photoEmoji}
        </span>

        {/* Status badge overlay */}
        <div className="absolute top-3 left-3">
          <StatusBadge status={listing.status} />
        </div>

        {/* Worn at badge */}
        {listing.wornAt && (
          <div
            className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold backdrop-blur-sm"
            style={{ backgroundColor: 'oklch(0 0 0 / 0.45)', color: 'oklch(0.95 0.01 60)' }}
          >
            <span className="text-[9px]">📍</span>
            {listing.wornAt}
          </div>
        )}

        {/* Actions */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <ActionMenu listingId={listing.id} status={listing.status} />
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-2.5 p-4 pt-3.5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-0.5 min-w-0">
            <h3
              className="text-[14px] font-semibold leading-snug truncate"
              style={{ color: 'oklch(0.15 0.02 60)' }}
            >
              {listing.itemName}
            </h3>
            <p
              className="text-[12px] font-medium"
              style={{ color: 'oklch(0.55 0.015 60)' }}
            >
              {listing.celebrity}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span
            className="text-[15px] font-bold tracking-tight"
            style={{ color: 'oklch(0.20 0.02 60)', fontFamily: "'DM Sans', sans-serif" }}
          >
            {formatKES(listing.price)}
          </span>
          <span
            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
            style={{ backgroundColor: 'oklch(0.96 0.008 60)', color: 'oklch(0.50 0.015 60)' }}
          >
            {listing.categoryIcon} {listing.category}
          </span>
        </div>

        {/* Footer meta */}
        <div
          className="flex items-center justify-between pt-2.5 mt-0.5"
          style={{ borderTop: '1px solid oklch(0.95 0.005 60)' }}
        >
          <span className="text-[11px] font-medium" style={{ color: 'oklch(0.60 0.01 60)' }}>
            {formatDateShort(listing.dateCreated)}
          </span>
          <span
            className="inline-flex items-center gap-1 text-[11px] font-medium"
            style={{ color: 'oklch(0.55 0.01 60)' }}
          >
            <EyeIcon />
            {listing.views.toLocaleString()}
          </span>
        </div>
      </div>
    </motion.div>
  )
}

// ─── ListingRow (table view) ──────────────────────────────────────────────────

function ListingRow({ listing }: { listing: Listing }) {
  return (
    <motion.tr
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="group cursor-pointer transition-colors"
      style={{ borderBottom: '1px solid oklch(0.95 0.005 60)' }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'oklch(0.985 0.005 60)')}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
    >
      {/* Thumbnail */}
      <td className="py-3 pl-5 pr-3">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
          style={{ backgroundColor: listing.photoColor }}
        >
          <span className="text-lg select-none opacity-70">{listing.photoEmoji}</span>
        </div>
      </td>

      {/* Name + Celebrity */}
      <td className="py-3 pr-4">
        <div className="flex flex-col gap-0.5 min-w-0">
          <span
            className="text-[13px] font-semibold leading-snug truncate max-w-[220px]"
            style={{ color: 'oklch(0.15 0.02 60)' }}
          >
            {listing.itemName}
          </span>
          <span className="text-[11px] font-medium" style={{ color: 'oklch(0.55 0.015 60)' }}>
            {listing.celebrity}
          </span>
        </div>
      </td>

      {/* Category */}
      <td className="py-3 pr-4 hidden lg:table-cell">
        <span
          className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold"
          style={{ backgroundColor: 'oklch(0.96 0.008 60)', color: 'oklch(0.48 0.015 60)' }}
        >
          {listing.categoryIcon} {listing.category}
        </span>
      </td>

      {/* Price */}
      <td className="py-3 pr-4">
        <span
          className="text-[13px] font-bold tabular-nums"
          style={{ color: 'oklch(0.20 0.02 60)', fontFamily: "'DM Sans', sans-serif" }}
        >
          {formatKES(listing.price)}
        </span>
      </td>

      {/* Status */}
      <td className="py-3 pr-4 hidden sm:table-cell">
        <StatusBadge status={listing.status} />
      </td>

      {/* Date */}
      <td className="py-3 pr-4 hidden md:table-cell">
        <span className="text-[12px] font-medium tabular-nums" style={{ color: 'oklch(0.55 0.01 60)' }}>
          {formatDate(listing.dateCreated)}
        </span>
      </td>

      {/* Views */}
      <td className="py-3 pr-4 hidden md:table-cell">
        <span
          className="inline-flex items-center gap-1 text-[12px] font-medium tabular-nums"
          style={{ color: 'oklch(0.55 0.01 60)' }}
        >
          <EyeIcon />
          {listing.views.toLocaleString()}
        </span>
      </td>

      {/* Actions */}
      <td className="py-3 pr-4">
        <ActionMenu listingId={listing.id} status={listing.status} />
      </td>
    </motion.tr>
  )
}

// ─── EmptyState ───────────────────────────────────────────────────────────────

function EmptyState({ filtered }: { filtered: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center justify-center py-20 gap-4"
    >
      <span className="text-5xl">{filtered ? '🔍' : '✨'}</span>
      <div className="flex flex-col items-center gap-1.5 text-center">
        <h3
          className="text-[15px] font-semibold"
          style={{ color: 'oklch(0.25 0.02 60)' }}
        >
          {filtered ? 'No listings match your filters' : 'No listings yet'}
        </h3>
        <p
          className="text-[13px] max-w-[280px]"
          style={{ color: 'oklch(0.55 0.015 60)' }}
        >
          {filtered
            ? 'Try adjusting your search or status filter'
            : 'List your first personal item and start connecting with fans'}
        </p>
      </div>
      {!filtered && (
        <Link to="/create-listing">
          <motion.button
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.12 }}
            className="mt-2 inline-flex items-center gap-2 h-10 px-5 rounded-xl text-[13px] font-semibold text-white"
            style={{ backgroundColor: 'oklch(0.52 0.22 25)' }}
          >
            <PlusIcon />
            Create listing
          </motion.button>
        </Link>
      )}
    </motion.div>
  )
}

// ─── Sort / Filter logic ──────────────────────────────────────────────────────

function filterListings(
  listings: Listing[],
  statusFilter: ListingStatus | 'all',
  search: string,
): Listing[] {
  let result = listings

  if (statusFilter !== 'all') {
    result = result.filter(l => l.status === statusFilter)
  }

  if (search.trim()) {
    const q = search.toLowerCase().trim()
    result = result.filter(l =>
      l.itemName.toLowerCase().includes(q) ||
      l.celebrity.toLowerCase().includes(q) ||
      l.category.toLowerCase().includes(q)
    )
  }

  return result
}

function sortListings(listings: Listing[], sortKey: SortKey): Listing[] {
  const sorted = [...listings]
  switch (sortKey) {
    case 'date':
      return sorted.sort((a, b) => b.dateCreated.localeCompare(a.dateCreated))
    case 'price-high':
      return sorted.sort((a, b) => b.price - a.price)
    case 'price-low':
      return sorted.sort((a, b) => a.price - b.price)
    case 'views':
      return sorted.sort((a, b) => b.views - a.views)
    default:
      return sorted
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SellerDashboardPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [statusFilter, setStatusFilter] = useState<ListingStatus | 'all'>('all')
  const [sortKey, setSortKey] = useState<SortKey>('date')
  const [search, setSearch] = useState('')

  const filtered = filterListings(MOCK_LISTINGS, statusFilter, search)
  const listings = sortListings(filtered, sortKey)

  const isFiltered = statusFilter !== 'all' || search.trim().length > 0

  // Stats
  const totalListings = MOCK_LISTINGS.length
  const liveCount = MOCK_LISTINGS.filter(l => l.status === 'live').length
  const pendingCount = MOCK_LISTINGS.filter(l => l.status === 'pending').length
  const totalEarned = MOCK_LISTINGS
    .filter(l => l.status === 'sold')
    .reduce((sum, l) => sum + Math.round(l.price * 0.85), 0)

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'oklch(0.993 0.003 80)' }}>
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div className="flex flex-col gap-1">
            <span
              className="text-[11px] font-bold tracking-[0.2em] uppercase"
              style={{ color: 'oklch(0.52 0.22 25)' }}
            >
              goodiegoodies
            </span>
            <h1
              className="text-[26px] sm:text-[30px] font-bold tracking-tight leading-none"
              style={{ color: 'oklch(0.12 0.02 60)', fontFamily: "'DM Sans', sans-serif" }}
            >
              My Listings
            </h1>
          </div>

          <Link to="/create-listing">
            <motion.button
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.12 }}
              className="inline-flex items-center gap-2 h-10 px-5 rounded-xl text-[13px] font-semibold text-white cursor-pointer"
              style={{ backgroundColor: 'oklch(0.52 0.22 25)' }}
            >
              <PlusIcon />
              Create listing
            </motion.button>
          </Link>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          <StatCard label="Total" value={String(totalListings)} />
          <StatCard label="Live" value={String(liveCount)} accent="oklch(0.45 0.16 155)" />
          <StatCard label="Pending" value={String(pendingCount)} accent="oklch(0.50 0.14 85)" />
          <StatCard label="Earned" value={formatKES(totalEarned)} accent="oklch(0.52 0.22 25)" />
        </div>

        {/* ── Tabs ── */}
        <div
          className="flex items-center gap-1 mb-5 overflow-x-auto pb-1 scrollbar-none"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {STATUS_TABS.map(tab => {
            const isActive = statusFilter === tab.key
            const count = tab.key === 'all'
              ? MOCK_LISTINGS.length
              : MOCK_LISTINGS.filter(l => l.status === tab.key).length

            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setStatusFilter(tab.key)}
                className={cn(
                  'relative flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[13px] font-medium transition-all duration-200 whitespace-nowrap shrink-0',
                  isActive
                    ? 'text-[oklch(0.15_0.02_60)]'
                    : 'text-[oklch(0.55_0.015_60)] hover:text-[oklch(0.35_0.02_60)]',
                )}
                style={isActive ? { backgroundColor: 'oklch(0.95 0.008 60)' } : {}}
              >
                {tab.label}
                <span
                  className="text-[11px] tabular-nums font-semibold"
                  style={{ color: isActive ? 'oklch(0.52 0.22 25)' : 'oklch(0.65 0.01 60)' }}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* ── Toolbar ── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
          {/* Search */}
          <div className="relative flex-1 w-full sm:max-w-[280px]">
            <span
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: 'oklch(0.65 0.01 60)' }}
            >
              <SearchIcon />
            </span>
            <Input
              placeholder="Search items, celebrities..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 rounded-lg text-[13px] border-[oklch(0.92_0.008_60)] focus:border-[oklch(0.52_0.22_25)] focus:ring-[oklch(0.52_0.22_25_/_0.12)]"
              style={{ backgroundColor: 'oklch(0.995 0.002 60)' }}
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <SortDropdown value={sortKey} onChange={setSortKey} />

            {/* View toggle */}
            <div
              className="flex items-center gap-0.5 p-0.5 rounded-lg ml-auto sm:ml-0"
              style={{ backgroundColor: 'oklch(0.96 0.005 60)' }}
            >
              {(['grid', 'list'] as const).map(mode => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setViewMode(mode)}
                  className={cn(
                    'w-8 h-8 rounded-md flex items-center justify-center transition-all duration-200',
                    viewMode === mode
                      ? 'bg-white text-[oklch(0.20_0.02_60)] shadow-sm'
                      : 'text-[oklch(0.55_0.01_60)] hover:text-[oklch(0.35_0.02_60)]',
                  )}
                >
                  {mode === 'grid' ? <GridIcon active={viewMode === 'grid'} /> : <ListIcon active={viewMode === 'list'} />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Content ── */}
        <AnimatePresence mode="wait">
          {listings.length === 0 ? (
            <EmptyState key="empty" filtered={isFiltered} />
          ) : viewMode === 'grid' ? (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              <AnimatePresence>
                {listings.map(listing => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="rounded-2xl overflow-hidden"
              style={{
                border: '1px solid oklch(0.93 0.006 60)',
                backgroundColor: 'oklch(0.998 0.002 60)',
              }}
            >
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: '1px solid oklch(0.93 0.006 60)' }}>
                    <th className="py-3 pl-5 pr-3 w-[56px]" />
                    <th
                      className="py-3 pr-4 text-left text-[11px] font-semibold tracking-[0.06em] uppercase"
                      style={{ color: 'oklch(0.55 0.01 60)' }}
                    >
                      Item
                    </th>
                    <th
                      className="py-3 pr-4 text-left text-[11px] font-semibold tracking-[0.06em] uppercase hidden lg:table-cell"
                      style={{ color: 'oklch(0.55 0.01 60)' }}
                    >
                      Category
                    </th>
                    <th
                      className="py-3 pr-4 text-left text-[11px] font-semibold tracking-[0.06em] uppercase"
                      style={{ color: 'oklch(0.55 0.01 60)' }}
                    >
                      Price
                    </th>
                    <th
                      className="py-3 pr-4 text-left text-[11px] font-semibold tracking-[0.06em] uppercase hidden sm:table-cell"
                      style={{ color: 'oklch(0.55 0.01 60)' }}
                    >
                      Status
                    </th>
                    <th
                      className="py-3 pr-4 text-left text-[11px] font-semibold tracking-[0.06em] uppercase hidden md:table-cell"
                      style={{ color: 'oklch(0.55 0.01 60)' }}
                    >
                      Date
                    </th>
                    <th
                      className="py-3 pr-4 text-left text-[11px] font-semibold tracking-[0.06em] uppercase hidden md:table-cell"
                      style={{ color: 'oklch(0.55 0.01 60)' }}
                    >
                      Views
                    </th>
                    <th className="py-3 pr-4 w-[48px]" />
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {listings.map(listing => (
                      <ListingRow key={listing.id} listing={listing} />
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Results count ── */}
        {listings.length > 0 && (
          <p
            className="text-[12px] font-medium mt-5 text-center"
            style={{ color: 'oklch(0.60 0.01 60)' }}
          >
            Showing {listings.length} of {MOCK_LISTINGS.length} listings
          </p>
        )}
      </div>
    </div>
  )
}

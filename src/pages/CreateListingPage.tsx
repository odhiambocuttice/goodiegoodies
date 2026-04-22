import * as React from 'react'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence, useReducedMotion, type Variants } from 'motion/react'
import Cropper from 'react-easy-crop'
import type { Area } from 'react-easy-crop'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useNavigate } from '@tanstack/react-router'
import { cn } from '@/lib/utils'

// ─── Utilities ────────────────────────────────────────────────────────────────

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

// ─── Voice input hook ─────────────────────────────────────────────────────────

function useVoiceInput(onTranscript: (text: string) => void) {
  const [isListening, setIsListening] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    setIsSupported(!!SpeechRecognition)
  }, [])

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
      return
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) return
    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = false
    recognition.lang = 'en-KE'
    recognition.onresult = (e: any) => {
      const transcript = Array.from(e.results).map((r: any) => r[0].transcript).join(' ')
      onTranscript(transcript)
    }
    recognition.onend = () => setIsListening(false)
    recognition.onerror = () => setIsListening(false)
    recognition.start()
    recognitionRef.current = recognition
    setIsListening(true)
  }

  return { isListening, isSupported, toggleListening }
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface ListingDraft {
  story: string
  photos: File[]
  memoryLink: string
  itemName: string
  category: string
  condition: string
  wornAt: string
  wornAtDate: string
  pricingMode: 'fixed' | 'auction' | 'offer'
  price: number
  auctionDuration?: 3 | 7 | 14
}

const defaultDraft: ListingDraft = {
  story: '',
  photos: [],
  memoryLink: '',
  itemName: '',
  category: '',
  condition: '',
  wornAt: '',
  wornAtDate: '',
  pricingMode: 'fixed',
  price: 0,
}

const DRAFT_KEY = 'gg_listing_draft'

// ─── Section config ────────────────────────────────────────────────────────────

const SECTIONS = [
  { title: 'Details & Price', optional: false },
  { title: 'Photos',          optional: false },
  { title: 'Memory Link',     optional: true  },
  { title: 'The Story',       optional: false },
]

function isSectionComplete(index: number, d: ListingDraft): boolean {
  switch (index) {
    case 0: return !!d.category && !!d.condition && !!d.itemName && d.price >= 500
    case 1: return d.photos.length >= 3
    case 2: return true // optional
    case 3: return countWords(d.story) >= 100
    default: return false
  }
}

// ─── Step props ───────────────────────────────────────────────────────────────

interface StepProps {
  draft: ListingDraft
  setDraft: React.Dispatch<React.SetStateAction<ListingDraft>>
}

// ─── Chevron icon ─────────────────────────────────────────────────────────────

function Chevron({ open }: { open: boolean }) {
  return (
    <motion.svg
      animate={{ rotate: open ? 180 : 0 }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      width="16" height="16" viewBox="0 0 16 16" fill="none"
      className="text-muted-foreground shrink-0"
    >
      <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </motion.svg>
  )
}

// ─── AccordionSection ─────────────────────────────────────────────────────────

interface AccordionSectionProps {
  number: number
  title: string
  isComplete: boolean
  isOptional: boolean
  isOpen: boolean
  onToggle: () => void
  children: React.ReactNode
}

function AccordionSection({ number, title, isComplete, isOptional, isOpen, onToggle, children }: AccordionSectionProps) {
  return (
    <div className="border-b border-slate-100">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center gap-4 px-8 py-5 hover:bg-slate-50 transition-colors text-left"
      >
        <div
          className={cn(
            'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 transition-all duration-300',
            isComplete
              ? 'bg-emerald-500 text-white'
              : isOpen
                ? 'text-white'
                : 'border-2 border-slate-200 text-slate-400 bg-white',
          )}
          style={isOpen && !isComplete ? { background: 'oklch(0.52 0.22 25)', color: 'white' } : {}}
        >
          {isComplete ? '✓' : number}
        </div>

        <span className={cn(
          'font-medium text-sm flex-1',
          isOpen ? 'text-slate-900' : 'text-slate-500',
        )}>
          {number}. {title}
          {isOptional && <span className="ml-1.5 text-xs font-normal text-slate-400">(optional)</span>}
        </span>

        {isComplete && (
          <span className="text-xs text-emerald-600 font-medium mr-2">Complete</span>
        )}

        <Chevron open={isOpen} />
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div className="px-8 pb-10 pt-2">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── StepDetails ──────────────────────────────────────────────────────────────

const CATEGORIES = [
  { id: 'clothing',     label: 'Clothing',     icon: '👕' },
  { id: 'accessories', label: 'Accessories',   icon: '⌚' },
  { id: 'sports-gear', label: 'Sports Gear',   icon: '🏆' },
  { id: 'memorabilia', label: 'Memorabilia',   icon: '🎖️' },
  { id: 'music',       label: 'Music',         icon: '🎵' },
  { id: 'other',       label: 'Other',         icon: '📦' },
]

const CONDITIONS = [
  { id: 'like-new',   label: 'Like New',      desc: 'Barely used, pristine condition' },
  { id: 'well-loved', label: 'Well Loved',    desc: 'Some wear, full of character' },
  { id: 'worn-proud', label: 'Worn & Proud',  desc: 'Lived in — the wear IS the story' },
]

const PRICING_MODES = [
  { id: 'fixed',   label: 'Fixed Price',      desc: 'Set your price, buyer pays immediately' },
  { id: 'auction', label: 'Auction',          desc: 'Fans bid — highest wins' },
  { id: 'offer',   label: 'Make an Offer',    desc: 'Buyers suggest a price, you decide' },
]

const PLATFORM_FEE = 0.15
function calculatePayout(price: number) { return Math.round(price * (1 - PLATFORM_FEE)) }

function StepDetails({ draft, setDraft }: StepProps) {
  const payout = draft.price > 0 ? calculatePayout(draft.price) : 0

  return (
    <div className="flex flex-col gap-10">
      {/* Item name */}
      <div className="flex flex-col gap-3">
        <Label htmlFor="itemName" className="text-sm font-medium">Item name</Label>
        <Input
          id="itemName"
          placeholder="e.g. Stage jacket from Koroga 2022"
          value={draft.itemName}
          onChange={(e) => setDraft(prev => ({ ...prev, itemName: e.target.value }))}
          maxLength={80}
          className="h-12 rounded-2xl"
        />
        <p className="text-xs text-muted-foreground">Keep it short and memorable</p>
      </div>

      {/* Category */}
      <div className="flex flex-col gap-4">
        <Label className="text-sm font-medium">Category</Label>
        <div className="grid grid-cols-3 gap-3">
          {CATEGORIES.map((cat) => (
            <motion.button
              key={cat.id}
              type="button"
              onClick={() => setDraft(prev => ({ ...prev, category: cat.id }))}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.12, ease: [0.22, 1, 0.36, 1] }}
              className={cn(
                'flex flex-col items-center gap-2 rounded-2xl border-2 px-2 py-5 text-center transition-all duration-150',
                draft.category === cat.id
                  ? 'border-[oklch(0.52_0.22_25)] bg-orange-50 text-foreground'
                  : 'border-muted hover:border-muted-foreground/40 text-muted-foreground hover:text-foreground',
              )}
            >
              <span className="text-xl">{cat.icon}</span>
              <span className="text-xs font-medium leading-tight">{cat.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Condition */}
      <div className="flex flex-col gap-4">
        <Label className="text-sm font-medium">Condition</Label>
        <div className="flex flex-col gap-3">
          {CONDITIONS.map((cond) => (
            <motion.button
              key={cond.id}
              type="button"
              onClick={() => setDraft(prev => ({ ...prev, condition: cond.id }))}
              whileTap={{ scale: 0.99 }}
              transition={{ duration: 0.12, ease: [0.22, 1, 0.36, 1] }}
              className={cn(
                'flex items-center gap-4 rounded-2xl border-2 px-5 py-4 text-left transition-all duration-150 w-full',
                draft.condition === cond.id
                  ? 'border-[oklch(0.52_0.22_25)] bg-orange-50'
                  : 'border-muted hover:border-muted-foreground/40',
              )}
            >
              <div className={cn(
                'w-4 h-4 rounded-full border-2 shrink-0 transition-colors',
                draft.condition === cond.id
                  ? 'border-[oklch(0.52_0.22_25)] bg-[oklch(0.52_0.22_25)]'
                  : 'border-muted-foreground/40',
              )} />
              <div className="flex flex-col">
                <span className="text-sm font-medium">{cond.label}</span>
                <span className="text-xs text-muted-foreground">{cond.desc}</span>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Worn At */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Label className="text-sm font-medium">Worn at / Used at</Label>
          <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">Optional</span>
        </div>
        <div className="flex flex-col gap-3">
          <Input
            placeholder="e.g. Koroga Festival, Blankets & Wine"
            value={draft.wornAt}
            onChange={(e) => setDraft(prev => ({ ...prev, wornAt: e.target.value }))}
            className="h-12 rounded-2xl"
          />
          <Input
            type="date"
            value={draft.wornAtDate}
            onChange={(e) => setDraft(prev => ({ ...prev, wornAtDate: e.target.value }))}
            className="h-12 rounded-2xl text-sm"
          />
        </div>
        {draft.wornAt && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs font-medium w-fit"
          >
            <span>🎤</span>
            <span>Worn at {draft.wornAt}{draft.wornAtDate ? `, ${new Date(draft.wornAtDate + 'T00:00:00').getFullYear()}` : ''}</span>
          </motion.div>
        )}
        <p className="text-xs text-muted-foreground">Adding an event adds a "Worn At" badge — buyers love the context</p>
      </div>

      {/* Pricing mode */}
      <div className="flex flex-col gap-4">
        <Label className="text-sm font-medium">How do you want to sell?</Label>
        <div className="flex flex-col gap-3">
          {PRICING_MODES.map((mode) => (
            <motion.button
              key={mode.id}
              type="button"
              onClick={() => setDraft(prev => ({ ...prev, pricingMode: mode.id as ListingDraft['pricingMode'] }))}
              whileTap={{ scale: 0.99 }}
              transition={{ duration: 0.12, ease: [0.22, 1, 0.36, 1] }}
              className={cn(
                'flex items-center gap-4 rounded-2xl border-2 px-5 py-4 text-left transition-all duration-150 w-full',
                draft.pricingMode === mode.id
                  ? 'border-[oklch(0.52_0.22_25)] bg-orange-50'
                  : 'border-muted hover:border-muted-foreground/40',
              )}
            >
              <div className={cn(
                'w-4 h-4 rounded-full border-2 shrink-0 transition-colors',
                draft.pricingMode === mode.id
                  ? 'border-[oklch(0.52_0.22_25)] bg-[oklch(0.52_0.22_25)]'
                  : 'border-muted-foreground/40',
              )} />
              <div className="flex flex-col">
                <span className="text-sm font-medium">{mode.label}</span>
                <span className="text-xs text-muted-foreground">{mode.desc}</span>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Price */}
      <div className="flex flex-col gap-4">
        <Label htmlFor="price" className="text-sm font-medium">
          {draft.pricingMode === 'auction' ? 'Starting bid (KES)' : 'Price (KES)'}
        </Label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">KES</span>
          <Input
            id="price"
            type="number"
            min={500}
            step={100}
            placeholder="0"
            value={draft.price || ''}
            onChange={(e) => setDraft(prev => ({ ...prev, price: Number(e.target.value) }))}
            className="pl-14 h-12 rounded-2xl text-base font-medium"
          />
        </div>

        {draft.pricingMode === 'auction' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="flex gap-3 pt-1">
              {([3, 7, 14] as const).map((days) => (
                <button
                  key={days}
                  type="button"
                  onClick={() => setDraft(prev => ({ ...prev, auctionDuration: days }))}
                  className={cn(
                    'flex-1 rounded-xl border-2 py-2.5 text-sm font-medium transition-all',
                    draft.auctionDuration === days
                      ? 'border-[oklch(0.52_0.22_25)] bg-orange-50 text-foreground'
                      : 'border-muted text-muted-foreground hover:border-muted-foreground/40',
                  )}
                >
                  {days} days
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">How long should the auction run?</p>
          </motion.div>
        )}

        {draft.price >= 500 && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-2xl bg-emerald-50 border border-emerald-200 p-5 flex items-center justify-between"
          >
            <div className="flex flex-col">
              <span className="text-xs text-emerald-700 font-medium">You receive</span>
              <span className="text-xs text-muted-foreground">After 15% platform fee</span>
            </div>
            <span className="text-2xl font-bold text-emerald-700">KES {payout.toLocaleString('en-KE')}</span>
          </motion.div>
        )}

        {draft.price > 0 && draft.price < 500 && (
          <p className="text-xs text-destructive">Minimum price is KES 500</p>
        )}
      </div>
    </div>
  )
}

// ─── Photo slot ────────────────────────────────────────────────────────────────

const PHOTO_SLOTS = [
  { id: 'front',  label: 'Front',      hint: 'Full front view' },
  { id: 'back',   label: 'Back',       hint: 'Full back view' },
  { id: 'detail', label: 'Close-up',   hint: 'Unique detail, tag, or wear mark' },
  { id: 'withme', label: 'With Me',    hint: 'You holding or wearing it' },
  { id: 'choice', label: 'Your Choice', hint: 'Any extra angle' },
]

// ─── Crop helpers ─────────────────────────────────────────────────────────────

async function getCroppedImg(imageSrc: string, pixelCrop: Area): Promise<File> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    img.addEventListener('load', () => resolve(img))
    img.addEventListener('error', reject)
    img.src = imageSrc
  })
  const canvas = document.createElement('canvas')
  canvas.width = pixelCrop.width
  canvas.height = pixelCrop.height
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(image, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, pixelCrop.width, pixelCrop.height)
  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => {
      if (!blob) { reject(new Error('Canvas is empty')); return }
      resolve(new File([blob], 'cropped.jpg', { type: 'image/jpeg' }))
    }, 'image/jpeg', 0.92)
  })
}

// ─── CropModal ────────────────────────────────────────────────────────────────

function CropModal({ src, onConfirm, onCancel }: { src: string; onConfirm: (file: File) => void; onCancel: () => void }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels)
  }, [])

  const handleConfirm = async () => {
    if (!croppedAreaPixels) return
    const file = await getCroppedImg(src, croppedAreaPixels)
    onConfirm(file)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onCancel}>
      <div className="bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col" style={{ width: 480, maxHeight: '90vh' }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-900">Crop photo</p>
            <p className="text-xs text-slate-400 mt-0.5">3:4 ratio · Drag to reposition · Scroll to zoom</p>
          </div>
          <button type="button" onClick={onCancel} className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500 transition-colors">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
          </button>
        </div>

        {/* Crop area */}
        <div className="relative bg-black" style={{ height: 360 }}>
          <Cropper
            image={src}
            crop={crop}
            zoom={zoom}
            aspect={3 / 4}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>

        {/* Zoom slider */}
        <div className="px-6 py-4 flex items-center gap-3 border-t border-slate-100">
          <span className="text-xs text-slate-400">–</span>
          <input
            type="range"
            min={1}
            max={3}
            step={0.05}
            value={zoom}
            onChange={e => setZoom(Number(e.target.value))}
            className="flex-1 accent-slate-900"
          />
          <span className="text-xs text-slate-400">+</span>
        </div>

        {/* Actions */}
        <div className="px-6 pb-5 flex gap-3">
          <button type="button" onClick={onCancel} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
            Cancel
          </button>
          <button type="button" onClick={handleConfirm} className="flex-1 py-2.5 rounded-xl bg-slate-900 text-sm font-semibold text-white hover:bg-slate-800 transition-colors">
            Use photo
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── PhotoSlot types ──────────────────────────────────────────────────────────

interface PhotoSlotProps {
  slot: typeof PHOTO_SLOTS[number]
  photo: File | null
  onAdd: (file: File) => void
  onRemove: () => void
}

function PhotoSlot({ slot, photo, onAdd, onRemove }: PhotoSlotProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [cropSrc, setCropSrc] = useState<string | null>(null)

  useEffect(() => {
    if (!photo) { setPreview(null); return }
    const url = URL.createObjectURL(photo)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [photo])

  const openCrop = (file: File) => {
    const url = URL.createObjectURL(file)
    setCropSrc(url)
  }

  const handleCropConfirm = (croppedFile: File) => {
    if (cropSrc) URL.revokeObjectURL(cropSrc)
    setCropSrc(null)
    onAdd(croppedFile)
  }

  const handleCropCancel = () => {
    if (cropSrc) URL.revokeObjectURL(cropSrc)
    setCropSrc(null)
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
    maxFiles: 1,
    noClick: true,
    onDrop: (files) => { if (files[0]) openCrop(files[0]) },
  })

  return (
    <>
    {cropSrc && (
      <CropModal src={cropSrc} onConfirm={handleCropConfirm} onCancel={handleCropCancel} />
    )}
    <div {...getRootProps()} onClick={() => inputRef.current?.click()} className="aspect-square">
      <motion.div
        whileTap={{ scale: 0.97 }}
        transition={{ duration: 0.12, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
        className={cn(
          'relative w-full h-full rounded-2xl border-2 overflow-hidden cursor-pointer transition-all duration-200',
          photo
            ? 'border-transparent'
            : isDragActive
              ? 'border-[oklch(0.52_0.22_25)] bg-orange-50'
              : 'border-dashed border-muted-foreground/30 hover:border-muted-foreground/60 bg-muted/30 hover:bg-muted/50',
        )}
      >
        <input
          {...getInputProps()}
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) openCrop(file)
            e.target.value = ''
          }}
        />
        {photo && preview ? (
          <>
            <img src={preview} alt={slot.label} className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onRemove() }}
              className="absolute top-1.5 right-1.5 rounded-full bg-black/60 text-white text-xs w-6 h-6 flex items-center justify-center hover:bg-black/80 transition-colors"
            >✕</button>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-2 py-1.5">
              <span className="text-white text-xs font-medium">{slot.label}</span>
            </div>
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-1.5 p-2 text-center select-none">
            <span className="text-2xl">📷</span>
            <span className="text-xs font-medium text-foreground/70">{slot.label}</span>
            <span className="text-[10px] text-muted-foreground leading-tight">{slot.hint}</span>
          </div>
        )}
      </motion.div>
    </div>
    </>
  )
}

// ─── StepPhotos ───────────────────────────────────────────────────────────────

function StepPhotos({ draft, setDraft }: StepProps) {
  const [slotPhotos, setSlotPhotos] = useState<Record<string, File | null>>({
    front: null, back: null, detail: null, withme: null, choice: null,
  })

  useEffect(() => {
    const files = Object.values(slotPhotos).filter((f): f is File => f !== null)
    setDraft(prev => ({ ...prev, photos: files }))
  }, [slotPhotos, setDraft])

  void draft

  const filledCount = Object.values(slotPhotos).filter(Boolean).length

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <p className="text-muted-foreground text-sm leading-relaxed">
          5 slots — front, back, a close-up detail, you with it, and one of your choice.
        </p>
        <p className="text-[11px] font-medium" style={{ color: 'oklch(0.52 0.22 25)' }}>
          Photos are cropped to 3:4 — this keeps all listings consistent on the marketplace.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {PHOTO_SLOTS.slice(0, 4).map((slot) => (
          <PhotoSlot
            key={slot.id}
            slot={slot}
            photo={slotPhotos[slot.id]}
            onAdd={(file) => setSlotPhotos(prev => ({ ...prev, [slot.id]: file }))}
            onRemove={() => setSlotPhotos(prev => ({ ...prev, [slot.id]: null }))}
          />
        ))}
        <div className="col-span-2 flex justify-center">
          <div className="w-[calc(50%-8px)]">
            <PhotoSlot
              slot={PHOTO_SLOTS[4]}
              photo={slotPhotos[PHOTO_SLOTS[4].id]}
              onAdd={(file) => setSlotPhotos(prev => ({ ...prev, [PHOTO_SLOTS[4].id]: file }))}
              onRemove={() => setSlotPhotos(prev => ({ ...prev, [PHOTO_SLOTS[4].id]: null }))}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className={cn(
          'transition-colors duration-200',
          filledCount === 0 ? 'text-muted-foreground' :
          filledCount < 3  ? 'text-amber-500' :
          'text-emerald-600 font-medium',
        )}>
          {filledCount} of 5 photos added
          {filledCount < 3 && filledCount > 0 && ` — ${3 - filledCount} more required`}
          {filledCount >= 3 && filledCount < 5 && ' — looks good ✓'}
          {filledCount === 5 && ' — complete! ✓'}
        </span>
        <span className="text-xs text-muted-foreground">Min 3 required</span>
      </div>
    </div>
  )
}

// ─── StepMemoryLink ───────────────────────────────────────────────────────────

const INSTAGRAM_REGEX = /^https?:\/\/(www\.)?instagram\.com\/(p|reel|tv)\/[\w-]+\/?(\?.*)?$/i
const TIKTOK_REGEX    = /^https?:\/\/(www\.)?tiktok\.com\/@[\w.]+\/video\/\d+/i

function detectPlatform(url: string): 'instagram' | 'tiktok' | null {
  if (INSTAGRAM_REGEX.test(url)) return 'instagram'
  if (TIKTOK_REGEX.test(url))    return 'tiktok'
  return null
}

const PLATFORM_CONFIG = {
  instagram: { label: 'Instagram', color: '#E1306C', bg: 'bg-pink-50', border: 'border-pink-200', icon: '📸' },
  tiktok:    { label: 'TikTok',    color: '#69C9D0', bg: 'bg-cyan-50',  border: 'border-cyan-200', icon: '🎵' },
}

function StepMemoryLink({ draft, setDraft }: StepProps) {
  const [inputValue, setInputValue] = useState(draft.memoryLink)
  const [touched, setTouched] = useState(false)

  const platform   = inputValue ? detectPlatform(inputValue) : null
  const isValidUrl = platform !== null
  const hasInput   = inputValue.trim().length > 0
  const showError  = touched && hasInput && !isValidUrl

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setInputValue(val)
    if (detectPlatform(val) !== null || val.trim() === '') {
      setDraft(prev => ({ ...prev, memoryLink: val.trim() === '' ? '' : val }))
    }
  }

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText()
      setInputValue(text); setTouched(true)
      if (detectPlatform(text) !== null) setDraft(prev => ({ ...prev, memoryLink: text }))
    } catch { /* denied */ }
  }

  return (
    <div className="flex flex-col gap-8">
      <p className="text-muted-foreground text-sm leading-relaxed">
        Paste an Instagram or TikTok post where this item appears. This is what makes buyers believe the story is real.
      </p>

      <div className="flex flex-col gap-3">
        <div className="flex gap-2">
          <Input
            type="url"
            placeholder="https://www.instagram.com/p/..."
            value={inputValue}
            onChange={handleChange}
            onBlur={() => setTouched(true)}
            className={cn(
              'flex-1 h-12 rounded-2xl transition-colors',
              isValidUrl && 'border-emerald-400 focus-visible:ring-emerald-300',
              showError  && 'border-destructive',
            )}
          />
          <button
            type="button"
            onClick={handlePaste}
            className="shrink-0 rounded-xl border border-input px-4 py-2 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >Paste</button>
        </div>
        {showError && (
          <p className="text-xs text-destructive">That doesn't look like an Instagram or TikTok link.</p>
        )}
      </div>

      <AnimatePresence>
        {isValidUrl && platform && (
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className={cn('rounded-2xl border p-5 flex items-start gap-3', PLATFORM_CONFIG[platform].bg, PLATFORM_CONFIG[platform].border)}>
              <span className="text-xl">{PLATFORM_CONFIG[platform].icon}</span>
              <div className="flex flex-col gap-1 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium" style={{ color: PLATFORM_CONFIG[platform].color }}>
                    {PLATFORM_CONFIG[platform].label} post detected
                  </span>
                  <span className="text-xs text-emerald-600 font-medium">✓ Link looks good</span>
                </div>
                <p className="text-xs text-muted-foreground truncate">{inputValue}</p>
                <p className="text-xs text-muted-foreground mt-1">Our team will verify this during review.</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!isValidUrl && (
        <div className="rounded-2xl bg-muted/40 p-5 flex flex-col gap-2">
          <p className="text-xs font-medium text-muted-foreground">Accepted links:</p>
          <ul className="flex flex-col gap-1.5">
            {['instagram.com/p/[post]', 'instagram.com/reel/[reel]', 'tiktok.com/@[user]/video/[id]'].map(fmt => (
              <li key={fmt} className="text-xs text-muted-foreground font-mono">{fmt}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex items-center gap-2 justify-center">
        <span className="text-xs text-muted-foreground">No post yet?</span>
        <button
          type="button"
          onClick={() => { setInputValue(''); setDraft(prev => ({ ...prev, memoryLink: '' })) }}
          className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground transition-colors"
        >Skip for now</button>
      </div>
    </div>
  )
}

// ─── StepStory ────────────────────────────────────────────────────────────────

function StepStory({ draft, setDraft }: StepProps) {
  const wordCount  = countWords(draft.story)
  const isComplete = wordCount >= 100
  const [showExample, setShowExample] = useState(false)

  const EXAMPLE = "Hii ni jacket niliyo-wear siku niliambia familia yangu nilikuwa musician serious. Ilikuwa 2019, show yangu ya kwanza kubwa — Koroga Festival. Nilicheza mbele ya watu 5,000 mara ya kwanza. Nilikuwa naiogopa sana stage lakini nilipovaa hii jacket, pressure ilienda. Nimehifadhi miaka 5 lakini mtu anayenipenda anastahili zaidi."

  const { isListening, isSupported, toggleListening } = useVoiceInput((transcript) => {
    setDraft(prev => ({ ...prev, story: prev.story ? prev.story + ' ' + transcript : transcript }))
  })

  return (
    <div className="flex flex-col gap-8">
      <p className="text-muted-foreground text-sm leading-relaxed">
        Where were you? What happened? Why does this item matter? Write in any language — English, Sheng, Swahili.
      </p>

      {isSupported && (
        <motion.button
          type="button"
          onClick={toggleListening}
          whileHover={{ scale: 1.012, y: -1 }}
          whileTap={{ scale: 0.97 }}
          transition={{ duration: 0.14, ease: [0.22, 1, 0.36, 1] }}
          className={cn(
            'w-full flex items-center justify-center gap-3 rounded-2xl border-2 px-4 py-4 text-sm font-medium transition-all duration-200',
            isListening
              ? 'border-red-400 bg-red-50 text-red-600'
              : 'border-dashed border-muted-foreground/30 hover:border-muted-foreground/60 text-muted-foreground hover:text-foreground',
          )}
        >
          <span className={cn('text-lg', isListening && 'animate-pulse')}>🎙️</span>
          {isListening ? 'Listening... tap to stop' : 'Record your story (speak naturally)'}
        </motion.button>
      )}

      <div className="flex flex-col gap-3">
        <Textarea
          placeholder="Nilikuwa wearing hii jacket when... (write your story here, at least 100 words)"
          value={draft.story}
          onChange={(e) => setDraft(prev => ({ ...prev, story: e.target.value }))}
          className="min-h-[240px] resize-none text-sm leading-relaxed rounded-2xl"
        />
        <div className="flex items-center justify-between text-xs">
          <span className={cn(
            'transition-colors duration-200',
            wordCount === 0 ? 'text-muted-foreground' :
            wordCount < 100 ? 'text-amber-500' : 'text-emerald-600 font-medium',
          )}>
            {wordCount} {wordCount === 1 ? 'word' : 'words'}
            {wordCount < 100 && wordCount > 0 && ` — ${100 - wordCount} more to go`}
            {isComplete && ' — great story! ✓'}
          </span>
          <button type="button" onClick={() => setShowExample(v => !v)}
            className="text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors">
            {showExample ? 'Hide example' : 'See example'}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showExample && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }} className="overflow-hidden"
          >
            <div className="rounded-2xl bg-muted/50 border border-muted p-5 text-sm text-muted-foreground leading-relaxed italic">
              <p className="text-xs font-medium text-muted-foreground/70 mb-2 not-italic">Example story:</p>
              "{EXAMPLE}"
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!isComplete && (
        <p className="text-xs text-muted-foreground text-center">
          The story is what makes buyers trust you — aim for 100 words minimum
        </p>
      )}
    </div>
  )
}

// ─── LivePreview ──────────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<string, string> = {
  clothing: 'Clothing', accessories: 'Accessories', 'sports-gear': 'Sports Gear',
  memorabilia: 'Memorabilia', music: 'Music', other: 'Other',
}
const CONDITION_LABELS: Record<string, string> = {
  'like-new': 'Like New', 'well-loved': 'Well Loved', 'worn-proud': 'Worn & Proud',
}
const PLATFORM_LABELS: Record<string, string> = {
  fixed: 'Fixed Price', auction: 'Auction', offer: 'Make an Offer',
}

interface LivePreviewProps { draft: ListingDraft }

// ─── FullscreenModal ──────────────────────────────────────────────────────────

interface FullscreenModalProps {
  photoUrls: string[]
  activeIndex: number
  onChangeIndex: (i: number) => void
  draft: ListingDraft
  onClose: () => void
}

function FullscreenModal({ photoUrls, draft, onClose }: FullscreenModalProps) {
  const detectPlatformFromUrl = (url: string) => {
    if (url.includes('instagram.com')) return 'Instagram'
    if (url.includes('tiktok.com')) return 'TikTok'
    return null
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.22 }}
        className="fixed inset-0 z-50 bg-white flex overflow-hidden"
      >
        {/* ── Left: vertically stacked photos (scrollable) ── */}
        <div className="flex-[55] overflow-y-auto bg-[#f0ede9]">
          {photoUrls.length > 0 ? (
            <div className="grid grid-cols-2 gap-[4px]">
              {photoUrls.map((url, i) => (
                <div key={i} className="w-full aspect-[3/4] overflow-hidden">
                  <img
                    src={url}
                    alt={`Photo ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center gap-3 text-slate-400">
              <span className="text-5xl">📷</span>
              <span className="text-sm">No photos added yet</span>
            </div>
          )}
        </div>

        {/* ── Right: sticky product info ── */}
        <div
          className="flex-[45] sticky top-0 h-screen overflow-y-auto border-l border-slate-100 flex flex-col"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          {/* Close button */}
          <div className="flex justify-end px-10 pt-8 pb-0 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full border border-slate-200 hover:bg-slate-100 flex items-center justify-center transition-colors text-slate-500"
            >
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          <div className="px-10 py-8 flex flex-col gap-0 flex-1">
            {/* Brand / category */}
            <p style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '14px' }}>
              GoodieGoodies{draft.category ? ` · ${CATEGORY_LABELS[draft.category] || draft.category}` : ''}
            </p>

            {/* Title */}
            <h2 style={{ fontSize: '28px', fontWeight: 600, letterSpacing: '-0.025em', lineHeight: 1.15, color: '#0f0f0f', marginBottom: '20px' }}>
              {draft.itemName || <span style={{ color: '#94a3b8', fontStyle: 'italic', fontWeight: 400 }}>Untitled listing</span>}
            </h2>

            {/* Price */}
            <div style={{ marginBottom: '28px' }}>
              {draft.price >= 500 ? (
                <div className="flex items-baseline gap-3">
                  <span style={{ fontSize: '30px', fontWeight: 500, letterSpacing: '-0.02em', color: '#0f0f0f' }}>
                    KES {draft.price.toLocaleString('en-KE')}
                  </span>
                  <span style={{ fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#94a3b8' }}>
                    {PLATFORM_LABELS[draft.pricingMode]}
                  </span>
                </div>
              ) : (
                <span style={{ fontSize: '14px', color: '#94a3b8', fontStyle: 'italic' }}>Price not set</span>
              )}
            </div>

            <div style={{ height: '1px', background: '#e2e8f0', marginBottom: '24px' }} />

            {/* Meta rows */}
            <div className="flex flex-col gap-5" style={{ marginBottom: '28px' }}>
              {draft.condition && (
                <div className="flex gap-8">
                  <span style={{ fontSize: '13px', fontWeight: 500, color: '#334155', minWidth: '80px' }}>Condition</span>
                  <span style={{ fontSize: '13px', color: '#475569' }}>{CONDITION_LABELS[draft.condition] || draft.condition}</span>
                </div>
              )}
              {draft.wornAt && (
                <div className="flex gap-8">
                  <span style={{ fontSize: '13px', fontWeight: 500, color: '#334155', minWidth: '80px' }}>Worn at</span>
                  <span style={{ fontSize: '13px', color: '#ea580c' }}>
                    {draft.wornAt}{draft.wornAtDate ? `, ${new Date(draft.wornAtDate + 'T00:00:00').getFullYear()}` : ''}
                  </span>
                </div>
              )}
              {draft.memoryLink && detectPlatformFromUrl(draft.memoryLink) && (
                <div className="flex gap-8">
                  <span style={{ fontSize: '13px', fontWeight: 500, color: '#334155', minWidth: '80px' }}>Verified</span>
                  <span style={{ fontSize: '13px', color: '#be185d' }}>📸 {detectPlatformFromUrl(draft.memoryLink)}</span>
                </div>
              )}
            </div>

            <div style={{ height: '1px', background: '#e2e8f0', marginBottom: '28px' }} />

            {/* The Story */}
            <div style={{ marginBottom: '32px' }}>
              <p style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '12px' }}>
                The Story
              </p>
              {draft.story ? (
                <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.7 }}>{draft.story}</p>
              ) : (
                <p style={{ fontSize: '14px', color: '#94a3b8', fontStyle: 'italic' }}>Story not written yet</p>
              )}
            </div>

            <div style={{ height: '1px', background: '#e2e8f0', marginBottom: '28px' }} />

            {/* Auth badge */}
            <div className="flex items-start gap-4" style={{ marginBottom: '40px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'oklch(0.52 0.22 25 / 0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'oklch(0.52 0.22 25)', fontSize: '14px' }}>✓</div>
              <div>
                <p style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', marginBottom: '4px' }}>Authenticated Item</p>
                <p style={{ fontSize: '12px', color: '#94a3b8', lineHeight: 1.55 }}>
                  Reviewed by the goodiegoodies team before going live.
                </p>
              </div>
            </div>

            {/* CTA */}
            <button
              type="button"
              className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm tracking-wide transition-colors"
              style={{ borderRadius: '4px' }}
            >
              {draft.pricingMode === 'auction' ? 'Place a bid' : 'Buy now'}
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

// ─── LivePreview component ────────────────────────────────────────────────────

function LivePreview({ draft }: LivePreviewProps) {
  const [photoUrls, setPhotoUrls] = useState<string[]>([])
  const [activePhoto, setActivePhoto] = useState(0)
  const [fullscreen, setFullscreen] = useState(false)

  useEffect(() => {
    const urls = draft.photos.map(p => URL.createObjectURL(p))
    setPhotoUrls(urls)
    setActivePhoto(0)
    return () => urls.forEach(url => URL.revokeObjectURL(url))
  }, [draft.photos])

  const detectPlatformFromUrl = (url: string) => {
    if (url.includes('instagram.com')) return 'Instagram'
    if (url.includes('tiktok.com')) return 'TikTok'
    return null
  }

  const checks = [
    { label: 'Item name & price', done: !!draft.itemName && draft.price >= 500 },
    { label: 'Photos (min 3)',    done: draft.photos.length >= 3 },
    { label: 'Memory link',       done: !!draft.memoryLink, optional: true },
    { label: 'Story (100 words)', done: countWords(draft.story) >= 100 },
  ]
  const allRequired = checks.filter(c => !c.optional).every(c => c.done)

  // Build photo grid slots (4 slots max in the panel, rest in fullscreen)
  const gridSlots = [0, 1, 2, 3]

  return (
    <>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 shrink-0 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Live Preview</p>
            <h2 className="text-sm font-semibold text-slate-900 leading-tight mt-0.5 truncate max-w-[220px]">
              {draft.itemName || <span className="text-slate-400 italic font-normal">Untitled listing</span>}
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setFullscreen(true)}
            className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 border border-slate-200 rounded-xl px-3 py-1.5 hover:border-slate-400 transition-all"
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M8 1h4v4M5 12H1V8M12 1L7.5 5.5M1 12l4.5-4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Full screen
          </button>
        </div>

        <div className="flex-1 overflow-y-auto flex flex-col">
          {/* Photo grid — Kit & Ace style: 2 equal portrait columns, 4px gap */}
          <div className="grid grid-cols-2 gap-[4px] bg-[#e8e5e1]">
            {gridSlots.map((slotIndex) => {
              const url = photoUrls[slotIndex]
              return (
                <button
                  key={slotIndex}
                  type="button"
                  onClick={() => { setActivePhoto(slotIndex); setFullscreen(true) }}
                  className="relative overflow-hidden bg-[#f0ede9] aspect-[3/4] group"
                  disabled={!url}
                >
                  {url ? (
                    <>
                      <img
                        src={url}
                        alt={`Photo ${slotIndex + 1}`}
                        className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors duration-200 flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 rounded-full px-3 py-1.5 text-xs font-medium text-slate-700 flex items-center gap-1.5">
                          <svg width="11" height="11" viewBox="0 0 13 13" fill="none">
                            <path d="M8 1h4v4M5 12H1V8M12 1L7.5 5.5M1 12l4.5-4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          Expand
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-slate-400">
                      <span className="text-2xl">📷</span>
                      {slotIndex === 0 && <span className="text-xs">Add photos to preview</span>}
                    </div>
                  )}
                  {slotIndex === 0 && draft.photos.length > 4 && (
                    <div className="absolute bottom-2 right-2 rounded-full bg-black/60 text-white text-xs px-2 py-0.5 font-medium">
                      +{draft.photos.length - 4} more
                    </div>
                  )}
                </button>
              )
            })}
          </div>

          {/* Product info */}
          <div className="p-5 flex flex-col gap-4">

          {/* Product info — Kit & Ace style */}
          <div style={{ fontFamily: "'DM Sans', sans-serif" }}>

            {/* Category label */}
            {draft.category && (
              <p className="text-[10px] font-medium tracking-[0.14em] uppercase text-slate-400 mb-2">
                {CATEGORY_LABELS[draft.category] || draft.category}
              </p>
            )}

            {/* Item name */}
            <h3 style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: '18px', letterSpacing: '-0.02em', lineHeight: 1.2, color: '#0f0f0f' }}>
              {draft.itemName || <span style={{ color: '#94a3b8', fontStyle: 'italic', fontWeight: 400 }}>Add item name above</span>}
            </h3>

            {/* Price */}
            <div className="mt-3 mb-4">
              {draft.price >= 500 ? (
                <div className="flex items-baseline gap-2">
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: '22px', color: '#0f0f0f', letterSpacing: '-0.02em' }}>
                    KES {draft.price.toLocaleString('en-KE')}
                  </span>
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '11px', color: '#94a3b8', letterSpacing: '0.06em', textTransform: 'uppercase' as const }}>
                    {PLATFORM_LABELS[draft.pricingMode]}
                  </span>
                </div>
              ) : (
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: '#94a3b8' }}>Price not set</span>
              )}
            </div>

            {/* Thin divider */}
            <div className="border-t border-slate-200 mb-4" />

            {/* Condition row */}
            {draft.condition && (
              <div className="flex items-center gap-2 mb-4">
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '12px', fontWeight: 500, color: '#334155', letterSpacing: '0.02em' }}>
                  Condition:
                </span>
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '12px', color: '#334155' }}>
                  {CONDITION_LABELS[draft.condition] || draft.condition}
                </span>
              </div>
            )}

            {/* Worn at */}
            {draft.wornAt && (
              <div className="flex items-center gap-2 mb-4">
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '12px', fontWeight: 500, color: '#334155', letterSpacing: '0.02em' }}>
                  Worn at:
                </span>
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '12px', color: '#ea580c' }}>
                  {draft.wornAt}{draft.wornAtDate ? `, ${new Date(draft.wornAtDate + 'T00:00:00').getFullYear()}` : ''}
                </span>
              </div>
            )}

            {/* Memory link */}
            {draft.memoryLink && detectPlatformFromUrl(draft.memoryLink) && (
              <div className="flex items-center gap-2 mb-4">
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '12px', fontWeight: 500, color: '#334155' }}>Verified on:</span>
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '12px', color: '#be185d' }}>
                  📸 {detectPlatformFromUrl(draft.memoryLink)}
                </span>
              </div>
            )}

            {/* Thin divider */}
            <div className="border-t border-slate-200 mb-4" />

            {/* Story excerpt */}
            {draft.story ? (
              <div className="mb-4">
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '10px', fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: '#94a3b8', marginBottom: '6px' }}>
                  The Story
                </p>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: '#475569', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden' }}>
                  {draft.story}
                </p>
              </div>
            ) : (
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: '#94a3b8', marginBottom: '16px', fontStyle: 'italic' }}>
                Story not written yet
              </p>
            )}

            {/* Checklist */}
            <div className="border-t border-slate-200 pt-4 flex flex-col gap-2.5">
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '10px', fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: '#94a3b8', marginBottom: '2px' }}>
                Listing Checklist
              </p>
              {checks.map((check) => (
                <div key={check.label} className="flex items-center gap-2">
                  <div className={cn(
                    'w-4 h-4 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold transition-colors',
                    check.done ? 'bg-emerald-100 text-emerald-600' :
                    check.optional ? 'bg-slate-100 text-slate-400' : 'bg-amber-100 text-amber-600',
                  )}>
                    {check.done ? '✓' : check.optional ? '–' : '!'}
                  </div>
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '12px', color: check.done ? '#334155' : '#94a3b8' }}>
                    {check.label}
                    {check.optional && !check.done && <span style={{ color: '#94a3b8', marginLeft: '4px' }}>(optional)</span>}
                  </span>
                </div>
              ))}
            </div>

            {/* Share teaser */}
            {allRequired && (
              <motion.div
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
                className="mt-4 border border-dashed border-slate-200 p-4 flex flex-col gap-1"
                style={{ borderRadius: '4px' }}
              >
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '10px', fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: '#94a3b8' }}>After going live</p>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '12px', color: '#64748b', lineHeight: 1.5 }}>
                  You'll get a shareable card for WhatsApp & Instagram Stories.
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>

      {/* Fullscreen modal */}
      {fullscreen && (
        <FullscreenModal
          photoUrls={photoUrls}
          activeIndex={activePhoto}
          onChangeIndex={setActivePhoto}
          draft={draft}
          onClose={() => setFullscreen(false)}
        />
      )}
    </>
  )
}

// ─── CreateListingPage ────────────────────────────────────────────────────────

export default function CreateListingPage() {
  useReducedMotion() // honour preference inside child components
  const navigate = useNavigate()

  const [draft, setDraft] = useState<ListingDraft>(() => {
    try {
      const stored = localStorage.getItem(DRAFT_KEY)
      if (stored) return { ...defaultDraft, ...JSON.parse(stored), photos: [] }
    } catch { /* ignore */ }
    return defaultDraft
  })

  useEffect(() => {
    try { localStorage.setItem(DRAFT_KEY, JSON.stringify({ ...draft, photos: [] })) } catch { /* ignore */ }
  }, [draft])

  const [openSection, setOpenSection] = useState<number>(0)
  const [submitted, setSubmitted] = useState(false)
  const [submittedListing, setSubmittedListing] = useState<{
    itemName: string
    category: string
    price: number
    pricingMode: string
    condition: string
    wornAt: string
    photoUrl: string | null
    storyExcerpt: string
  } | null>(null)

  const completionMap = SECTIONS.map((_, i) => isSectionComplete(i, draft))
  const requiredCompleted = SECTIONS.filter((s, i) => !s.optional && completionMap[i]).length
  const requiredTotal     = SECTIONS.filter(s => !s.optional).length
  const allDone           = requiredCompleted >= requiredTotal

  const handleSubmit = () => {
    // Capture snapshot for success screen before clearing
    const photoUrl = draft.photos.length > 0 ? URL.createObjectURL(draft.photos[0]) : null
    setSubmittedListing({
      itemName: draft.itemName,
      category: draft.category,
      price: draft.price,
      pricingMode: draft.pricingMode,
      condition: draft.condition,
      wornAt: draft.wornAt,
      photoUrl,
      storyExcerpt: draft.story.split(/\s+/).slice(0, 20).join(' '),
    })
    localStorage.removeItem(DRAFT_KEY)
    setSubmitted(true)
  }

  const toggleSection = (i: number) => {
    setOpenSection(prev => prev === i ? -1 : i)
  }

  if (submitted) {
    const listing = submittedListing
    const shareText = listing
      ? `${listing.itemName} — dropping on Goodiegoodies. Kenya's marketplace for real celebrity items.`
      : "Check out my listing dropping on Goodiegoodies — Kenya's marketplace for real celebrity items."

    return (
      <div className="min-h-screen bg-[#faf9f7] flex flex-col items-center justify-start px-4 py-12 sm:py-20" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        <motion.div
          className="w-full max-w-[440px] flex flex-col items-center gap-10"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
        >
          {/* Status pill */}
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
            className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span style={{ fontSize: '12px', fontWeight: 500, color: '#047857', letterSpacing: '0.02em' }}>Submitted for review</span>
          </motion.div>

          {/* Heading */}
          <motion.div
            className="text-center flex flex-col gap-3"
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
          >
            <h1 style={{ fontSize: '28px', fontWeight: 600, letterSpacing: '-0.03em', lineHeight: 1.15, color: '#0f0f0f' }}>
              You're in the queue
            </h1>
            <p style={{ fontSize: '14px', color: '#64748b', lineHeight: 1.65 }}>
              We'll review your listing within 2–4 hours.<br />You'll get a WhatsApp message when it's live.
            </p>
          </motion.div>

          {/* Share card — editorial look with photo background */}
          {listing && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.35, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
              className="w-full"
            >
              <div
                className="relative w-full overflow-hidden"
                style={{ aspectRatio: '4 / 5', borderRadius: '6px' }}
              >
                {/* Photo background or gradient fallback */}
                {listing.photoUrl ? (
                  <img
                    src={listing.photoUrl}
                    alt={listing.itemName}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(145deg, #1a1a1a 0%, #2d2926 100%)' }} />
                )}

                {/* Dark gradient overlay from bottom */}
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.35) 40%, rgba(0,0,0,0.08) 100%)' }} />

                {/* Top badge */}
                <div className="absolute top-0 left-0 right-0 p-5 flex items-start justify-between">
                  <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)' }}>
                    <span style={{ color: 'oklch(0.72 0.18 25)' }}>gg</span>oodiegoodies
                  </span>
                  {listing.category && (
                    <span style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '100px', padding: '3px 10px' }}>
                      {CATEGORY_LABELS[listing.category] || listing.category}
                    </span>
                  )}
                </div>

                {/* Bottom content */}
                <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col gap-3">
                  <p style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'oklch(0.72 0.18 25)' }}>
                    Dropping soon
                  </p>
                  <h3 style={{ fontSize: '22px', fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.2, color: '#fff' }}>
                    {listing.itemName}
                  </h3>
                  {listing.price >= 500 && (
                    <div className="flex items-baseline gap-2.5">
                      <span style={{ fontSize: '18px', fontWeight: 500, letterSpacing: '-0.01em', color: '#fff' }}>
                        KES {listing.price.toLocaleString('en-KE')}
                      </span>
                      <span style={{ fontSize: '10px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)' }}>
                        {PLATFORM_LABELS[listing.pricingMode]}
                      </span>
                    </div>
                  )}
                  {listing.wornAt && (
                    <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>
                      Worn at {listing.wornAt}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Checklist summary */}
          <motion.div
            className="w-full flex flex-col gap-3"
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
          >
            {[
              { label: 'Story written', done: true },
              { label: 'Photos uploaded', done: true },
              { label: 'Details & price set', done: true },
              { label: 'Sent for editorial review', done: true },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                className="flex items-center gap-3"
                initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.55 + i * 0.08, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
              >
                <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6.5L4.5 9L10 3" stroke="#047857" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span style={{ fontSize: '13px', color: '#334155', fontWeight: 450 }}>{item.label}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* Actions */}
          <motion.div
            className="w-full flex flex-col gap-3"
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
          >
            <a
              href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
              target="_blank" rel="noopener noreferrer" className="w-full block"
            >
              <motion.div whileHover={{ scale: 1.012, y: -2 }} whileTap={{ scale: 0.96, y: 1 }}
                transition={{ duration: 0.14, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}>
                <Button size="lg" className="w-full gap-2" style={{ borderRadius: '4px', background: '#0f0f0f' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  Share on WhatsApp
                </Button>
              </motion.div>
            </a>
            <motion.div whileHover={{ scale: 1.012, y: -2 }} whileTap={{ scale: 0.96, y: 1 }}
              transition={{ duration: 0.14, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}>
              <Button
                size="lg"
                variant="outline"
                className="w-full gap-2"
                style={{ borderRadius: '4px' }}
                onClick={() => navigate({ to: '/dashboard' })}
              >
                Go to Dashboard
              </Button>
            </motion.div>
            <p className="text-center" style={{ fontSize: '11px', color: '#94a3b8', lineHeight: 1.5 }}>
              We'll notify you via WhatsApp once your listing is live.
            </p>
          </motion.div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-slate-50 flex overflow-hidden">

      {/* ── Left panel ── */}
      <div className="w-[46%] flex flex-col border-r border-slate-200 overflow-hidden">

        {/* Header */}
        <div className="px-8 py-5 border-b border-slate-200 shrink-0">
          <span className="font-bold text-xl tracking-tight">
            <span style={{ color: 'oklch(0.52 0.22 25)' }}>gg</span>
            <span className="text-slate-900">oodiegoodies</span>
          </span>
          <p className="text-slate-400 text-xs mt-0.5">List your celebrity item</p>

          {/* Progress bar */}
          <div className="mt-4 h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'oklch(0.52 0.22 25)' }}
              animate={{ width: `${(requiredCompleted / requiredTotal) * 100}%` }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
          <p className="text-xs text-slate-400 mt-1.5">
            {requiredCompleted} of {requiredTotal} required sections complete
          </p>
        </div>

        {/* Scrollable accordion */}
        <div className="flex-1 overflow-y-auto">
          {SECTIONS.map((section, i) => (
            <AccordionSection
              key={section.title}
              number={i + 1}
              title={section.title}
              isComplete={completionMap[i]}
              isOptional={section.optional}
              isOpen={openSection === i}
              onToggle={() => toggleSection(i)}
            >
              {i === 0 && <StepDetails  draft={draft} setDraft={setDraft} />}
              {i === 1 && <StepPhotos   draft={draft} setDraft={setDraft} />}
              {i === 2 && <StepMemoryLink draft={draft} setDraft={setDraft} />}
              {i === 3 && <StepStory    draft={draft} setDraft={setDraft} />}
            </AccordionSection>
          ))}
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-slate-200 shrink-0">
          <Button
            size="lg"
            className="w-full rounded-full"
            disabled={!allDone}
            onClick={handleSubmit}
          >
            Send for Review →
          </Button>
          <p className="text-center text-xs text-slate-400 mt-3 flex items-center justify-center gap-1.5">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Draft autosaved
          </p>
        </div>
      </div>

      {/* ── Right panel — live preview ── */}
      <div className="flex-1 flex flex-col overflow-hidden bg-white">
        <LivePreview draft={draft} />
      </div>
    </div>
  )
}

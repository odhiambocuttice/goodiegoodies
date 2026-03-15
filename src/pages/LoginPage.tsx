import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Instagram } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

// ─── Data ────────────────────────────────────────────────────────────────────

const celebItems = [
  {
    celeb: 'Khaligraph Jones',
    item: 'Stage jacket from Koroga 2022',
    bg: '#100900',
    primary: '#F59E0B',
    secondary: '#FDE68A',
  },
  {
    celeb: 'Bahati',
    item: 'Original handwritten lyrics notebook',
    bg: '#03071A',
    primary: '#3B82F6',
    secondary: '#93C5FD',
  },
  {
    celeb: 'Njugush',
    item: 'Prop mic from Churchill Show finale',
    bg: '#021A09',
    primary: '#10B981',
    secondary: '#6EE7B7',
  },
  {
    celeb: 'Pierra Makena',
    item: 'DJ headphones worn at Blankets & Wine',
    bg: '#0D0118',
    primary: '#8B5CF6',
    secondary: '#C4B5FD',
  },
  {
    celeb: 'Eric Omondi',
    item: 'Wife Material show finale prop phone',
    bg: '#180203',
    primary: '#EF4444',
    secondary: '#FCA5A5',
  },
]

const SLIDE_DURATION = 4500

// ─── Motion variants ─────────────────────────────────────────────────────────

const cardVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09 } },
  exit: {},
}

const itemVariants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as number[] } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3, ease: 'easeIn' } },
}

const formVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.11, delayChildren: 0.1 } },
}

const formItemVariants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as number[] } },
}

// ─── TikTok Icon ──────────────────────────────────────────────────────────────

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={cn('shrink-0', className)} viewBox="0 0 24 24" fill="currentColor" width="17" height="17" aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.19 8.19 0 0 0 4.79 1.53V6.77a4.85 4.85 0 0 1-1.02-.08z" />
    </svg>
  )
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────

function ProgressBar({ active, duration, color }: { active: boolean; duration: number; color: string }) {
  return (
    <div className="h-[2px] w-full rounded-full overflow-hidden" style={{ backgroundColor: `${color}30` }}>
      <motion.div
        className="h-full rounded-full"
        style={{ backgroundColor: color, transformOrigin: 'left' }}
        initial={{ scaleX: 0 }}
        animate={active ? { scaleX: 1 } : { scaleX: 0 }}
        transition={active ? { duration: duration / 1000, ease: 'linear' } : { duration: 0 }}
      />
    </div>
  )
}

// ─── Shape Backgrounds ────────────────────────────────────────────────────────

type SP = { p: string; s: string }

// Khaligraph — Gold power diagonals + circle rings
function BgKhaligraph({ p, s }: SP) {
  return (
    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 600 900" preserveAspectRatio="xMidYMid slice" fill="none" aria-hidden="true">
      <motion.polygon points="340,0 600,0 600,900 160,900" fill={p}
        initial={{ fillOpacity: 0 }} animate={{ fillOpacity: 0.14 }} transition={{ duration: 0.9 }} />
      <motion.polygon points="390,0 455,0 275,900 210,900" fill={s}
        initial={{ fillOpacity: 0 }} animate={{ fillOpacity: 0.22 }} transition={{ duration: 0.7, delay: 0.12 }} />
      <motion.circle cx={555} cy={130} r={295} stroke={p} strokeWidth={2} fill="none"
        initial={{ strokeOpacity: 0 }} animate={{ strokeOpacity: 0.35 }} transition={{ duration: 1, delay: 0.2 }} />
      <motion.circle cx={555} cy={130} r={185} stroke={p} strokeWidth={1.5} fill="none"
        initial={{ strokeOpacity: 0 }} animate={{ strokeOpacity: 0.22 }} transition={{ duration: 0.9, delay: 0.3 }} />
      <motion.circle cx={555} cy={130} r={80} fill={s}
        initial={{ fillOpacity: 0 }} animate={{ fillOpacity: 0.3 }} transition={{ duration: 0.6, delay: 0.4 }} />
      <motion.circle cx={555} cy={130} r={80} stroke={s} strokeWidth={2} fill="none"
        initial={{ strokeOpacity: 0 }} animate={{ strokeOpacity: 0.6 }} transition={{ duration: 0.5, delay: 0.45 }} />
      {/* Thin scan lines for texture */}
      {[150, 280, 410, 540, 670, 800].map((y, i) => (
        <motion.line key={y} x1={0} y1={y} x2={600} y2={y} stroke={p} strokeWidth={0.6}
          initial={{ strokeOpacity: 0 }} animate={{ strokeOpacity: 0.07 }} transition={{ duration: 0.5, delay: 0.06 * i }} />
      ))}
    </svg>
  )
}

// Bahati — Cobalt arc architecture + horizontal grid
function BgBahati({ p, s }: SP) {
  return (
    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 600 900" preserveAspectRatio="xMidYMid slice" fill="none" aria-hidden="true">
      <motion.path d="M 600,80 A 340,410 0 0,0 600,820 L 260,820 L 260,80 Z" fill={p}
        initial={{ fillOpacity: 0 }} animate={{ fillOpacity: 0.12 }} transition={{ duration: 0.9 }} />
      <motion.path d="M 600,80 A 340,410 0 0,0 600,820" stroke={p} strokeWidth={3} fill="none"
        initial={{ strokeOpacity: 0, pathLength: 0 }} animate={{ strokeOpacity: 0.55, pathLength: 1 }}
        transition={{ duration: 1.3, delay: 0.1, ease: [0.22, 1, 0.36, 1] }} />
      <motion.path d="M 600,200 A 220,250 0 0,0 600,700" stroke={s} strokeWidth={1.5} fill="none"
        initial={{ strokeOpacity: 0, pathLength: 0 }} animate={{ strokeOpacity: 0.4, pathLength: 1 }}
        transition={{ duration: 1.1, delay: 0.25 }} />
      {[160, 260, 360, 460, 560, 660, 760].map((y, i) => (
        <motion.line key={y} x1={0} y1={y} x2={600} y2={y} stroke={p} strokeWidth={0.7}
          initial={{ strokeOpacity: 0 }} animate={{ strokeOpacity: 0.1 }} transition={{ duration: 0.4, delay: 0.05 * i }} />
      ))}
      <motion.path d="M 420,380 A 140,140 0 0,1 600,450" stroke={s} strokeWidth={2.5} fill="none"
        initial={{ strokeOpacity: 0, pathLength: 0 }} animate={{ strokeOpacity: 0.5, pathLength: 1 }}
        transition={{ duration: 0.7, delay: 0.45 }} />
    </svg>
  )
}

// Njugush — Emerald diagonal wedges + scattered energy dots
function BgNjugush({ p, s }: SP) {
  const dots = [[130,190],[210,140],[320,230],[440,170],[510,210],[160,290],[370,120],[490,290],[90,350],[270,310]]
  return (
    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 600 900" preserveAspectRatio="xMidYMid slice" fill="none" aria-hidden="true">
      <motion.polygon points="0,320 0,900 600,900 600,600" fill={p}
        initial={{ fillOpacity: 0 }} animate={{ fillOpacity: 0.18 }} transition={{ duration: 0.8 }} />
      <motion.polygon points="380,0 600,0 600,320" fill={p}
        initial={{ fillOpacity: 0 }} animate={{ fillOpacity: 0.16 }} transition={{ duration: 0.8, delay: 0.08 }} />
      <motion.polygon points="0,390 80,320 80,390" fill={s}
        initial={{ fillOpacity: 0 }} animate={{ fillOpacity: 0.7 }} transition={{ duration: 0.5, delay: 0.28 }} />
      <motion.line x1={0} y1={320} x2={600} y2={600} stroke={s} strokeWidth={1.5}
        initial={{ strokeOpacity: 0 }} animate={{ strokeOpacity: 0.35 }} transition={{ duration: 0.7, delay: 0.18 }} />
      <motion.line x1={380} y1={0} x2={600} y2={320} stroke={s} strokeWidth={1}
        initial={{ strokeOpacity: 0 }} animate={{ strokeOpacity: 0.25 }} transition={{ duration: 0.6, delay: 0.22 }} />
      {dots.map(([cx, cy], i) => (
        <motion.circle key={i} cx={cx} cy={cy} r={i % 3 === 0 ? 5 : 3} fill={s}
          initial={{ fillOpacity: 0 }} animate={{ fillOpacity: i % 2 === 0 ? 0.35 : 0.2 }}
          transition={{ duration: 0.4, delay: 0.08 * i + 0.3 }} />
      ))}
    </svg>
  )
}

// Pierra — Violet concentric rings + DJ radial lines
function BgPierra({ p, s }: SP) {
  const radialCount = 14
  const cx = 490
  const cy = 440
  return (
    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 600 900" preserveAspectRatio="xMidYMid slice" fill="none" aria-hidden="true">
      {Array.from({ length: radialCount }, (_, i) => {
        const angle = (i * (360 / radialCount)) * (Math.PI / 180)
        return (
          <motion.line key={i} x1={cx} y1={cy}
            x2={cx + Math.cos(angle) * 500} y2={cy + Math.sin(angle) * 500}
            stroke={p} strokeWidth={0.7}
            initial={{ strokeOpacity: 0 }} animate={{ strokeOpacity: 0.1 }}
            transition={{ duration: 0.4, delay: 0.03 * i }} />
        )
      })}
      {[370, 280, 190, 110, 55].map((r, i) => (
        <motion.circle key={r} cx={cx} cy={cy} r={r}
          stroke={i < 3 ? p : s} strokeWidth={i === 4 ? 3 : 1.5}
          fill={i === 4 ? s : 'none'}
          initial={{ strokeOpacity: 0, fillOpacity: 0 }}
          animate={{ strokeOpacity: i === 4 ? 0.6 : 0.28 - i * 0.02, fillOpacity: i === 4 ? 0.18 : 0 }}
          transition={{ duration: 0.8, delay: 0.1 * i }} />
      ))}
      <motion.circle cx={cx} cy={cy} r={18} fill={s}
        initial={{ fillOpacity: 0 }} animate={{ fillOpacity: 0.9 }} transition={{ duration: 0.5, delay: 0.55 }} />
      <motion.polygon points="0,700 0,900 200,900" fill={p}
        initial={{ fillOpacity: 0 }} animate={{ fillOpacity: 0.15 }} transition={{ duration: 0.7, delay: 0.3 }} />
    </svg>
  )
}

// Eric — Hot coral starburst + explosive triangles
function BgEric({ p, s }: SP) {
  const burstCount = 18
  const cx = 430
  const cy = 260
  return (
    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 600 900" preserveAspectRatio="xMidYMid slice" fill="none" aria-hidden="true">
      {Array.from({ length: burstCount }, (_, i) => {
        const angle = (i * (360 / burstCount)) * (Math.PI / 180)
        return (
          <motion.line key={i} x1={cx} y1={cy}
            x2={cx + Math.cos(angle) * 700} y2={cy + Math.sin(angle) * 700}
            stroke={p} strokeWidth={0.9}
            initial={{ strokeOpacity: 0 }} animate={{ strokeOpacity: 0.13 }}
            transition={{ duration: 0.45, delay: 0.025 * i }} />
        )
      })}
      <motion.polygon points="260,260 600,0 600,520" fill={p}
        initial={{ fillOpacity: 0 }} animate={{ fillOpacity: 0.18 }} transition={{ duration: 0.8 }} />
      <motion.polygon points="340,170 540,60 600,260" fill={s}
        initial={{ fillOpacity: 0 }} animate={{ fillOpacity: 0.28 }} transition={{ duration: 0.65, delay: 0.14 }} />
      <motion.polygon points="0,720 0,900 280,900" fill={p}
        initial={{ fillOpacity: 0 }} animate={{ fillOpacity: 0.14 }} transition={{ duration: 0.6, delay: 0.2 }} />
      <motion.circle cx={cx} cy={cy} r={70} stroke={s} strokeWidth={2} fill="none"
        initial={{ strokeOpacity: 0 }} animate={{ strokeOpacity: 0.45 }} transition={{ duration: 0.6, delay: 0.4 }} />
      <motion.circle cx={cx} cy={cy} r={22} fill={s}
        initial={{ fillOpacity: 0 }} animate={{ fillOpacity: 0.85 }} transition={{ duration: 0.45, delay: 0.5 }} />
    </svg>
  )
}

const SHAPE_COMPONENTS = [BgKhaligraph, BgBahati, BgNjugush, BgPierra, BgEric] as const

// ─── CelebShowcase (left panel) ───────────────────────────────────────────────

function CelebShowcase() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [progressKey, setProgressKey] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % celebItems.length)
      setProgressKey((prev) => prev + 1)
    }, SLIDE_DURATION)
    return () => clearInterval(interval)
  }, [])

  const handleDotClick = (i: number) => {
    setActiveIndex(i)
    setProgressKey((prev) => prev + 1)
  }

  const current = celebItems[activeIndex]
  const ShapeBg = SHAPE_COMPONENTS[activeIndex]

  return (
    <div className="relative w-full h-full overflow-hidden flex flex-col">

      {/* Base background — transitions per slide */}
      <AnimatePresence mode="wait">
        <motion.div key={`base-${activeIndex}`} className="absolute inset-0"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.55 }}
          style={{ backgroundColor: current.bg }} />
      </AnimatePresence>

      {/* SVG geometric shapes — per slide */}
      <AnimatePresence mode="wait">
        <motion.div key={`shapes-${activeIndex}`} className="absolute inset-0"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.45 }}>
          <ShapeBg p={current.primary} s={current.secondary} />
        </motion.div>
      </AnimatePresence>

      {/* Bottom readability fade using slide's bg color */}
      <AnimatePresence mode="wait">
        <motion.div key={`fade-${activeIndex}`} className="absolute inset-x-0 bottom-0 h-3/4 pointer-events-none"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.55 }}
          style={{ background: `linear-gradient(to top, ${current.bg}f5 0%, ${current.bg}90 35%, ${current.bg}30 65%, transparent 100%)` }} />
      </AnimatePresence>

      {/* Vignette — permanent */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 120% 120% at 50% 50%, transparent 30%, rgba(0,0,0,0.6) 100%)' }} />

      {/* Wordmark + counter */}
      <div className="relative z-10 px-8 pt-7 flex items-center justify-between">
        <span className="text-white/55 text-[11px] font-semibold tracking-[0.22em] uppercase select-none">
          goodiegoodies
        </span>
        <span className="text-white/25 text-[10px] font-medium tracking-[0.15em] select-none tabular-nums">
          {String(activeIndex + 1).padStart(2, '0')} / {String(celebItems.length).padStart(2, '0')}
        </span>
      </div>

      {/* Ghost watermark number — colored per slide */}
      <div className="relative z-10 flex-1 flex items-center justify-end pr-4 pointer-events-none select-none overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.span key={`num-${activeIndex}`}
            className="font-black leading-none"
            style={{ fontSize: 'clamp(180px, 28vw, 320px)', color: current.primary, opacity: 0 }}
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 0.08, x: 0 }}
            exit={{ opacity: 0, x: -60 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}>
            {String(activeIndex + 1).padStart(2, '0')}
          </motion.span>
        </AnimatePresence>
      </div>

      {/* Staggered card content */}
      <div className="relative z-10 px-10 pb-5">
        <AnimatePresence mode="wait">
          <motion.div key={activeIndex} variants={cardVariants} initial="hidden" animate="show" exit="exit"
            className="flex flex-col gap-4">

            {/* Badge — uses slide's secondary color */}
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 w-fit">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: current.secondary }} />
              <span className="text-[10px] font-bold tracking-[0.25em] uppercase" style={{ color: current.secondary }}>
                Authenticated item
              </span>
            </motion.div>

            {/* Celeb name — larger, heavier, more dramatic */}
            <motion.h2 variants={itemVariants}
              className="text-white font-black leading-[0.92] tracking-[-0.04em]"
              style={{ fontSize: 'clamp(44px, 5.8vw, 72px)' }}>
              {current.celeb}
            </motion.h2>

            {/* Accent rule — slide's primary color */}
            <motion.div variants={itemVariants} className="w-14 h-[3px] rounded-full"
              style={{ backgroundColor: current.primary }} />

            {/* Item description */}
            <motion.p variants={itemVariants}
              className="text-white/55 text-sm leading-relaxed max-w-[270px]">
              {current.item}
            </motion.p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Progress bars + dots */}
      <div className="relative z-10 px-10 pb-8 flex flex-col gap-3">
        <div className="flex gap-2">
          {celebItems.map((slide, i) => (
            <div key={i} className="flex-1">
              <ProgressBar
                key={i === activeIndex ? `${i}-${progressKey}` : i}
                active={i === activeIndex}
                duration={SLIDE_DURATION}
                color={slide.primary}
              />
            </div>
          ))}
        </div>
        <div className="flex items-center justify-center gap-2">
          {celebItems.map((_, i) => (
            <button key={i} onClick={() => handleDotClick(i)}
              className={cn(
                'rounded-full transition-all duration-300 border-0 cursor-pointer p-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40',
                i === activeIndex ? 'opacity-100' : 'opacity-25 hover:opacity-50'
              )}
              style={{
                width: i === activeIndex ? 22 : 6,
                height: 6,
                backgroundColor: i === activeIndex ? current.primary : '#ffffff',
              }}
              aria-label={`View ${celebItems[i].celeb}`} />
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── LoginForm (right panel) ──────────────────────────────────────────────────

function LoginForm() {
  const handleOAuth = (provider: 'instagram' | 'tiktok') => {
    console.log(`OAuth: ${provider}`)
  }

  return (
    <motion.div className="flex w-full max-w-[360px] flex-col gap-8"
      variants={formVariants} initial="hidden" animate="show">

      <motion.div variants={formItemVariants} className="flex flex-col gap-2.5">
        <h1 className="font-bold tracking-[-0.04em] leading-none select-none"
          style={{ fontSize: 'clamp(22px, 3vw, 26px)', color: 'oklch(0.12 0.01 60)' }}>
          <span style={{ color: 'oklch(0.52 0.22 25)' }}>gg</span>oodiegoodies
        </h1>
        <p className="text-sm leading-relaxed" style={{ color: 'oklch(0.48 0.015 60)' }}>
          Own a piece of the moments that made you a fan.
        </p>
      </motion.div>

      <motion.div variants={formItemVariants} className="flex items-center gap-3">
        <div className="flex-1 h-px" style={{ backgroundColor: 'oklch(0.9 0.006 60)' }} />
        <span className="text-[10px] font-medium tracking-[0.18em] uppercase"
          style={{ color: 'oklch(0.68 0.01 60)' }}>Sign in</span>
        <div className="flex-1 h-px" style={{ backgroundColor: 'oklch(0.9 0.006 60)' }} />
      </motion.div>

      <div className="flex flex-col gap-3">
        <motion.div variants={formItemVariants}>
          <motion.div whileHover={{ scale: 1.008 }} whileTap={{ scale: 0.995 }} transition={{ duration: 0.15 }}>
            <Button variant="outline" size="lg"
              className="w-full gap-3 font-medium cursor-pointer group transition-all duration-200 hover:border-[#E1306C]/40 hover:bg-[#E1306C]/[0.04]"
              onClick={() => handleOAuth('instagram')}>
              <Instagram size={17} className="shrink-0 transition-colors duration-200 group-hover:text-[#E1306C]" />
              Continue with Instagram
            </Button>
          </motion.div>
        </motion.div>

        <motion.div variants={formItemVariants}>
          <motion.div whileHover={{ scale: 1.008 }} whileTap={{ scale: 0.995 }} transition={{ duration: 0.15 }}>
            <Button variant="outline" size="lg"
              className="w-full gap-3 font-medium cursor-pointer group transition-all duration-200 hover:border-[#69C9D0]/40 hover:bg-[#69C9D0]/[0.04]"
              onClick={() => handleOAuth('tiktok')}>
              <TikTokIcon className="transition-colors duration-200 group-hover:text-[#69C9D0]" />
              Continue with TikTok
            </Button>
          </motion.div>
        </motion.div>
      </div>

      <motion.p variants={formItemVariants} className="text-center leading-relaxed"
        style={{ fontSize: 11, color: 'oklch(0.62 0.008 60)' }}>
        By continuing, you agree to our{' '}
        <a href="#" className="underline underline-offset-2 transition-colors duration-150 hover:text-[oklch(0.12_0.01_60)]"
          style={{ color: 'inherit' }}>Terms of Service</a>{' '}
        and{' '}
        <a href="#" className="underline underline-offset-2 transition-colors duration-150 hover:text-[oklch(0.12_0.01_60)]"
          style={{ color: 'inherit' }}>Privacy Policy</a>
      </motion.p>
    </motion.div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LoginPage() {
  return (
    <div className="flex h-screen w-full overflow-hidden">
      <div className="hidden lg:block lg:w-[55%] relative">
        <CelebShowcase />
      </div>
      <div className="flex w-full lg:w-[45%] items-center justify-center p-8"
        style={{ backgroundColor: 'oklch(0.985 0.006 80)' }}>
        <LoginForm />
      </div>
    </div>
  )
}

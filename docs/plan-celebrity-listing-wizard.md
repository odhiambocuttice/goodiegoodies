# Plan: Celebrity Listing Creation Wizard

**Feature:** 5-step wizard for celebrities to create item listings on Goodiegoodies
**UX Reference:** `docs/celebrity-listing-ux.md`
**Date:** March 15, 2026
**Status:** Ready to execute

---

## Phase 0: Documentation Discovery — Findings

### Allowed APIs (confirmed from source)

**Motion (from `src/pages/LoginPage.tsx:1-5`):**
- Import: `import { motion, AnimatePresence, useReducedMotion } from 'motion/react'`
- Ease curve: `[0.22, 1, 0.36, 1]` — use this everywhere
- Stagger: `transition: { staggerChildren: 0.09 }` (LoginPage:51-55)
- Exit animations require `AnimatePresence mode="wait"`
- Reduced motion: always call `const prefersReducedMotion = useReducedMotion()`

**Router (from `src/router.tsx:1-18`):**
- Add new route: `createRoute({ getParentRoute: () => rootRoute, path: '/create-listing', component: CreateListingPage })`
- Register in: `rootRoute.addChildren([loginRoute, createListingRoute])`

**Button (from `src/components/ui/button.tsx`):**
- Variants: `default | outline | secondary | ghost | destructive | link`
- Sizes: `default | xs | sm | lg | icon | icon-xs | icon-sm | icon-lg`
- Always wrap in `motion.div` for hover/tap animations, NOT on the Button directly

**Card (from `src/components/ui/card.tsx`):**
- Parts: `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`
- Base: `rounded-xl border py-6 shadow-sm flex flex-col gap-6`

**CSS Design Tokens (from `src/index.css:39-80`):**
- Background: `var(--background)` = `oklch(1 0 0)`
- Primary: `var(--primary)` = `oklch(0.205 0 0)`
- Muted: `var(--muted-foreground)` = `oklch(0.556 0 0)`
- Brand accent: `oklch(0.52 0.22 25)` (the "gg" brand red-orange from LoginPage:435)

### Missing Packages (not in package.json — must install)

| Package | Use |
|---------|-----|
| `react-hook-form` | Form state + step data persistence |
| `zod` | Schema validation for each step |
| `react-dropzone` | Desktop photo drag-and-drop |

### Missing shadcn Components (must add via CLI)

| Component | Use |
|-----------|-----|
| `input` | Text inputs (item name, URL field) |
| `textarea` | Story field |
| `label` | Field labels |
| `progress` | Wizard progress bar |
| `badge` | "Worn At" badge, platform detection label |

### Anti-Patterns to Avoid

- DO NOT import from `framer-motion` — use `motion/react` only
- DO NOT add motion props directly to `<Button>` — wrap in `motion.div`
- DO NOT use `@radix-ui/...` imports — project uses `radix-ui` (unified package)
- DO NOT invent oEmbed API endpoints — use `https://www.instagram.com/api/v1/oembed/` pattern carefully (CORS-limited; see Phase 5 notes)
- DO NOT skip `useReducedMotion()` check for animations

---

## Phase 1: Foundation — Dependencies + Primitives

### Goal
Install missing packages, add missing shadcn primitives, register the new route.

### Tasks

**1.1 Install packages**
```bash
npm install react-hook-form zod react-dropzone
```

**1.2 Add shadcn components**
```bash
npx shadcn@latest add input textarea label progress badge
```

**1.3 Register the route in `src/router.tsx`**

Copy the existing route pattern (router.tsx:5-9) and add `createListingRoute`:
```typescript
// Add import at top
import CreateListingPage from '@/pages/CreateListingPage'

// Add route (copy loginRoute pattern)
const createListingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/create-listing',
  component: CreateListingPage,
})

// Register in routeTree
export const router = createRouter({
  routeTree: rootRoute.addChildren([loginRoute, createListingRoute]),
})
```

**1.4 Create the page file (empty shell)**
- Create: `src/pages/CreateListingPage.tsx`
- Just render `<div>create listing</div>` at this stage

### Verification
- [ ] `npm install` completes without errors
- [ ] `src/components/ui/input.tsx` exists
- [ ] `src/components/ui/textarea.tsx` exists
- [ ] `src/components/ui/label.tsx` exists
- [ ] `src/components/ui/progress.tsx` exists
- [ ] `src/components/ui/badge.tsx` exists
- [ ] Navigating to `http://localhost:5173/create-listing` renders without 404

---

## Phase 2: Wizard Shell + Navigation

### Goal
Build the outer scaffold of the wizard: step counter, progress bar, animated step transitions, autosave to localStorage, and mobile-first layout.

### Pattern to Copy
`src/pages/LoginPage.tsx:51-71` — copy `cardVariants`, `itemVariants`, `formVariants`, `formItemVariants` as the step transition variants.

### Tasks

**2.1 Define wizard data types**
```typescript
// At top of CreateListingPage.tsx
type WizardStep = 1 | 2 | 3 | 4 | 5
const STEP_LABELS = ['The Story', 'Prove It', 'Memory Link', 'Details & Price', 'Preview']

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
```

**2.2 Wizard state + autosave**
```typescript
const DRAFT_KEY = 'gg_listing_draft'

// Load from localStorage on mount
const [draft, setDraft] = useState<ListingDraft>(() => {
  try {
    const saved = localStorage.getItem(DRAFT_KEY)
    return saved ? JSON.parse(saved) : defaultDraft
  } catch { return defaultDraft }
})

// Save on every draft change
useEffect(() => {
  localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
}, [draft])
```

**2.3 Progress bar component**

Copy ProgressBar pattern from `LoginPage.tsx:85-97` but adapt for step progress:
```typescript
function WizardProgressBar({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
  const progress = (currentStep / totalSteps) * 100
  return (
    <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
      <motion.div
        className="h-full rounded-full"
        style={{ background: 'oklch(0.52 0.22 25)' }}
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  )
}
```

**2.4 Step transition variants**

Copy from LoginPage.tsx:51-71:
```typescript
const stepVariants = {
  hidden: { opacity: 0, x: 32 },
  show: { opacity: 1, x: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, x: -32, transition: { duration: 0.25, ease: 'easeIn' } },
}
```

**2.5 Page layout (mobile-first)**

Match the mobile-first pattern from LoginPage.tsx:509-521:
```typescript
<div className="min-h-screen w-full flex flex-col items-center justify-start bg-background px-4 py-8 sm:py-12">
  {/* Header: back button + progress */}
  <div className="w-full max-w-[480px] mb-8">
    <WizardProgressBar currentStep={step} totalSteps={5} />
    <div className="flex justify-between mt-3 text-xs text-muted-foreground">
      <span>Step {step} of 5</span>
      <span>{STEP_LABELS[step - 1]}</span>
    </div>
  </div>
  {/* Animated step content */}
  <div className="w-full max-w-[480px]">
    <AnimatePresence mode="wait">
      <motion.div key={step} variants={stepVariants} initial="hidden" animate="show" exit="exit">
        {/* Current step renders here */}
      </motion.div>
    </AnimatePresence>
  </div>
</div>
```

**2.6 Back/Next navigation buttons**

Use `<Button size="lg">` with motion wrapper (copy OAuth button pattern from LoginPage.tsx:461-490).

### Verification
- [ ] All 5 steps are navigable via Next/Back
- [ ] Progress bar advances on each step
- [ ] AnimatePresence transitions between steps smoothly
- [ ] Refreshing the page restores draft from localStorage
- [ ] `useReducedMotion()` is called and animations skip when true

---

## Phase 3: Step 1 — "The Story"

### Goal
A voice-first story input that feels like telling a story, not filling a form. Target: 100+ words.

### Tasks

**3.1 Voice recording with Web Speech API**

Web Speech API is native browser — no package needed.
```typescript
// Voice recording hook
function useVoiceInput(onTranscript: (text: string) => void) {
  const [isListening, setIsListening] = useState(false)

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) return

    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = false
    recognition.lang = 'en-KE' // Kenya English locale
    recognition.onresult = (e: any) => {
      const transcript = Array.from(e.results).map((r: any) => r[0].transcript).join(' ')
      onTranscript(transcript)
    }
    recognition.onend = () => setIsListening(false)
    recognition.start()
    setIsListening(true)
    return recognition
  }

  return { isListening, startListening }
}
```

**3.2 Word count utility**
```typescript
function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}
```

**3.3 Story step layout**

```
- Big heading: "Tell us the story"
- Sub-copy: "Where were you? What happened? Why does this item matter? Write in any language."
- Textarea (8 rows, auto-grow)
- Word count: "47 / 100 words"
- Voice note button (primary, large): mic icon + "Record your story"
- Example story (collapsible, faded): "Hii ni jacket niliyo-wear siku..."
- Next button: disabled until wordCount >= 100
```

**3.4 Validation with zod**
```typescript
const storySchema = z.object({
  story: z.string().refine(
    (val) => countWords(val) >= 100,
    { message: 'Tell us a bit more — aim for 100 words' }
  )
})
```

### Verification
- [ ] Voice button appears and toggles listening state
- [ ] Transcript appends to textarea
- [ ] Word count updates live
- [ ] Next button is disabled below 100 words
- [ ] Graceful fallback message shown if SpeechRecognition unavailable

---

## Phase 4: Step 2 — "Prove It" (Photos)

### Goal
Structured 5-slot photo grid. Mobile users tap to open camera. Desktop users drag-and-drop. Min 3 photos.

### Tasks

**4.1 Photo slot definitions**
```typescript
const PHOTO_SLOTS = [
  { id: 'front', label: 'Front', hint: 'Full front view' },
  { id: 'back', label: 'Back', hint: 'Full back view' },
  { id: 'detail', label: 'Close-up', hint: 'Unique detail, tag, or wear mark' },
  { id: 'withme', label: 'With Me', hint: 'You holding or wearing it' },
  { id: 'choice', label: 'Your Choice', hint: 'Any extra angle' },
]
```

**4.2 Mobile camera capture**

Use native file input with `accept` and `capture` attributes:
```html
<input
  type="file"
  accept="image/*"
  capture="environment"
  multiple={false}
  className="sr-only"
  ref={inputRef}
  onChange={handleFileSelect}
/>
```

**4.3 Desktop drag-and-drop with react-dropzone**
```typescript
import { useDropzone } from 'react-dropzone'

const { getRootProps, getInputProps, isDragActive } = useDropzone({
  accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
  maxFiles: 1,
  onDrop: (files) => handlePhotoAdd(slotId, files[0])
})
```

**4.4 Photo slot component**

Each slot shows:
- Empty state: ghost placeholder with label + tap-to-add icon
- Filled state: thumbnail preview + X button to remove
- Tap anywhere on slot to trigger camera/file picker

**4.5 Validation**
```typescript
const photosSchema = z.object({
  photos: z.array(z.instanceof(File)).min(3, 'Add at least 3 photos')
})
```

**4.6 Progress indicator**
```
"3 / 5 photos added — 5 recommended"
```

### Verification
- [ ] 5 photo slots render in a 2-column grid (with 5th slot centered)
- [ ] Tapping a slot opens native camera on mobile
- [ ] Dragging image onto slot works on desktop
- [ ] Photos display as thumbnails after selection
- [ ] X button removes individual photos
- [ ] Next button disabled until ≥ 3 photos

---

## Phase 5: Step 3 — "The Memory Link"

### Goal
Paste an Instagram or TikTok URL that proves this item appeared in a real public moment. Auto-detect platform, show preview.

### Important Note on oEmbed

**Instagram oEmbed** (`https://graph.facebook.com/v18.0/instagram_oembed?url=...`) requires an access token — not usable from the client without a backend.

**TikTok oEmbed** (`https://www.tiktok.com/oembed?url=...`) is CORS-restricted from the browser.

**MVP Solution:** Do NOT attempt server-side oEmbed at this stage. Instead:
1. Validate the URL format client-side (regex match)
2. Detect platform from URL string
3. Show a styled "link confirmed" state with platform badge
4. Display the raw URL in a preview card
5. The actual link verification happens during editorial review (per the brainstorm)

This matches the brainstorm's editorial review step — a human checks the link before listing goes live.

### Tasks

**5.1 URL validation (client-side only)**
```typescript
const INSTAGRAM_REGEX = /^https?:\/\/(www\.)?instagram\.com\/(p|reel|tv)\/[\w-]+\/?/
const TIKTOK_REGEX = /^https?:\/\/(www\.)?tiktok\.com\/@[\w.]+\/video\/\d+/

function detectPlatform(url: string): 'instagram' | 'tiktok' | null {
  if (INSTAGRAM_REGEX.test(url)) return 'instagram'
  if (TIKTOK_REGEX.test(url)) return 'tiktok'
  return null
}
```

**5.2 Validation schema**
```typescript
const memoryLinkSchema = z.object({
  memoryLink: z.string()
    .optional()
    .refine(
      (val) => !val || detectPlatform(val) !== null,
      { message: 'Paste an Instagram or TikTok post link' }
    )
})
```

**5.3 Step layout**

```
- Heading: "Show us where this item has been"
- Sub-copy: "Paste an Instagram or TikTok post where this item appears — a concert, a match, a shoot."
- URL input field (large, with paste-from-clipboard button)
- After valid URL:
  - Platform badge (Instagram pink / TikTok teal)
  - Link preview card: platform icon + truncated URL + "✓ Link looks good"
- Skip option: "No post yet? You can add this later." → marks memoryLink as null, continues
```

**5.4 Paste-from-clipboard button**
```typescript
const handlePasteFromClipboard = async () => {
  const text = await navigator.clipboard.readText()
  setValue('memoryLink', text)
}
```

### Verification
- [ ] Valid Instagram URL shows Instagram badge
- [ ] Valid TikTok URL shows TikTok badge
- [ ] Invalid URL shows error message
- [ ] "Skip for now" button works and allows Next
- [ ] Paste-from-clipboard button populates the field

---

## Phase 6: Step 4 — "Details & Price"

### Goal
Fast, tappable item details + live KES payout calculator. No dropdowns — only tap tiles.

### Tasks

**6.1 Category tiles**
```typescript
const CATEGORIES = [
  { id: 'clothing', label: 'Clothing', icon: '👕' },
  { id: 'accessories', label: 'Accessories', icon: '⌚' },
  { id: 'sports-gear', label: 'Sports Gear', icon: '🏆' },
  { id: 'memorabilia', label: 'Memorabilia', icon: '🎖️' },
  { id: 'music', label: 'Music', icon: '🎵' },
  { id: 'other', label: 'Other', icon: '📦' },
]
```

Render as a 2x3 grid of tap tiles. Selected state uses brand accent color `oklch(0.52 0.22 25)`.

**6.2 Condition selector**
```typescript
const CONDITIONS = [
  { id: 'like-new', label: 'Like New', desc: 'Barely used, pristine' },
  { id: 'well-loved', label: 'Well Loved', desc: 'Some wear, full of character' },
  { id: 'worn-proud', label: 'Worn & Proud', desc: 'Lived in — the wear IS the story' },
]
```

3 horizontal cards. "Worn & Proud" is intentionally listed last and styled warmest.

**6.3 Pricing mode selector**
```typescript
const PRICING_MODES = [
  { id: 'fixed', label: 'Fixed Price', desc: 'Set your price, buyer pays immediately' },
  { id: 'auction', label: 'Auction', desc: 'Fans bid — highest wins' },
  { id: 'offer', label: 'Make an Offer', desc: 'Buyers suggest a price, you decide' },
]
```

**6.4 Live payout calculator**

```typescript
const PLATFORM_FEE = 0.15

function calculatePayout(price: number): number {
  return Math.round(price * (1 - PLATFORM_FEE))
}

// In render:
<div className="flex justify-between items-center rounded-lg bg-muted p-4">
  <span className="text-sm text-muted-foreground">You receive</span>
  <span className="text-xl font-semibold">
    KES {calculatePayout(watchedPrice).toLocaleString('en-KE')}
  </span>
</div>
<p className="text-xs text-muted-foreground">After 15% platform fee</p>
```

**6.5 Item name auto-suggest**

Read first 8 words of the story, generate a suggested name:
```typescript
function suggestItemName(story: string): string {
  if (!story) return ''
  // Return empty — let the celebrity name it. Show story excerpt as placeholder.
  const words = story.trim().split(/\s+/).slice(0, 6).join(' ')
  return '' // placeholder only, not auto-filled
}
```

**6.6 "Worn At" optional field**
```
- Input: Event name (text)
- Input: Date (date picker, native <input type="date">)
- Badge preview: 🎤 "Worn at Koroga Festival, 2022"
```

**6.7 Validation schema**
```typescript
const detailsSchema = z.object({
  category: z.string().min(1, 'Choose a category'),
  condition: z.string().min(1, 'Choose a condition'),
  itemName: z.string().min(3, 'Give your item a name'),
  pricingMode: z.enum(['fixed', 'auction', 'offer']),
  price: z.number().min(500, 'Minimum price is KES 500'),
  auctionDuration: z.union([z.literal(3), z.literal(7), z.literal(14)]).optional(),
})
```

### Verification
- [ ] Category selection highlights the chosen tile
- [ ] Condition selection highlights the chosen card
- [ ] Price input updates payout calculator in real-time
- [ ] Auction duration selector appears only when Auction mode is chosen
- [ ] "Worn At" fields are optional and don't block Next
- [ ] Next disabled until category, condition, itemName, price are filled

---

## Phase 7: Step 5 — "Preview & Submit"

### Goal
Make the celebrity feel the listing is real before they submit. Generate a share card. Trigger submission.

### Tasks

**7.1 Listing preview card**

Render a mock buyer-facing listing card using existing `Card` component. Show:
- First photo (full width, top of card)
- Item name + category badge
- "Worn At" badge (if provided)
- Platform badge + link icon (if memoryLink provided)
- Condition pill
- Story (truncated to 3 lines, expand button)
- Price + "You receive: KES X" in muted text

**7.2 Checklist**
```typescript
const checks = [
  { label: 'Story written', done: draft.story.length > 0 },
  { label: 'Photos added', done: draft.photos.length >= 3 },
  { label: 'Memory link', done: !!draft.memoryLink, optional: true },
  { label: 'Details & price set', done: !!draft.category && draft.price > 0 },
]
```

Render as green checkmarks (✓) for done, gray circles for optional/missing.

**7.3 Submit button**

```typescript
<motion.div whileHover={{ scale: 1.012, y: -2 }} whileTap={{ scale: 0.96, y: 1 }}
  transition={{ duration: 0.14, ease: [0.22, 1, 0.36, 1] }}>
  <Button size="lg" className="w-full" onClick={handleSubmit}>
    Send for Review
  </Button>
</motion.div>
```

**7.4 Post-submit state**

After clicking "Send for Review":
- Replace wizard with success screen
- Heading: "You're in the queue 🙌"
- Sub-copy: "We'll review your listing within 2–4 hours. You'll get a WhatsApp message when it's live."
- Clear the draft from localStorage

**7.5 Share card**

Simple div styled as a social card, with:
- First photo as background
- "Dropping on Goodiegoodies" overlay
- Item name
- "Save to photos" button (uses `html2canvas` or CSS-only printable div — defer `html2canvas` install to later; use a CSS-only shareable card at MVP)
- WhatsApp share link: `https://wa.me/?text=Check+out+my+listing+on+Goodiegoodies+[URL]`

### Verification
- [ ] Preview card renders all filled-in data
- [ ] Checklist shows correct done/undone states
- [ ] Submit button triggers success screen
- [ ] Share card is visible with WhatsApp share link
- [ ] localStorage is cleared after submit

---

## Phase 8: Final Verification

### Grep checks
```bash
# Confirm no framer-motion imports
grep -r "from 'framer-motion'" src/

# Confirm motion/react is used
grep -r "from 'motion/react'" src/

# Confirm autosave key exists
grep -r "gg_listing_draft" src/

# Confirm zod schemas are defined for each step
grep -r "Schema" src/pages/CreateListingPage.tsx
```

### Manual QA checklist
- [ ] Full wizard completion: story → photos → memory link → details → preview → submit
- [ ] Back navigation preserves filled data
- [ ] Refresh mid-wizard restores draft
- [ ] Mobile layout: all steps use single-column, touch targets ≥ 44px
- [ ] Reduced-motion: animations are instant, not skipped (so content still appears)
- [ ] Voice input: tapping mic button starts recording, result appends to story
- [ ] Payout calculator: entering KES 15,000 shows KES 12,750

---

## File Manifest (what will be created/modified)

| Action | File |
|--------|------|
| CREATE | `src/pages/CreateListingPage.tsx` |
| MODIFY | `src/router.tsx` — add createListingRoute |
| ADD (shadcn) | `src/components/ui/input.tsx` |
| ADD (shadcn) | `src/components/ui/textarea.tsx` |
| ADD (shadcn) | `src/components/ui/label.tsx` |
| ADD (shadcn) | `src/components/ui/progress.tsx` |
| ADD (shadcn) | `src/components/ui/badge.tsx` |

No other files need to be modified.

---

*Plan generated by Claude (Orchestrator)*
*Project: Goodiegoodies.com*

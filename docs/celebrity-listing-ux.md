# Celebrity Listing Creation — UX & Product Research

> **Scope:** The page where celebrities create product listings on Goodiegoodies.
> **Date:** March 15, 2026
> **Principle:** The story IS the product.

---

## The Core Problem to Solve

Most listing tools are built for merchants selling SKUs. This is different — a celebrity is selling a memory. The tool must reflect that. It should feel like telling a story, not filling a tax form.

---

## Three Perspectives on the Problem

**As Khaligraph Jones (the celebrity):**
> *"I'm between shows. I have 8 minutes. I want to sell this jacket before the hype dies. If this thing asks me to fill 12 fields I'm closing it."*

Needs: Fast, phone-native, voice-friendly, tell me what I'll earn immediately, one-tap share after.

**As a Product Manager:**
The biggest drop-off risk is the story field. 100+ words feels like homework. We need to make it feel like a voice note, not an essay. Every extra step loses 30–40% of users who started.

**As a UX Designer:**
The form should have zero visible fields on any given screen. One thing at a time. Progress bar always visible. The celebrity should feel like they're being *guided by the platform* rather than filling out paperwork.

---

## The Optimal Flow: 5-Step Wizard

```
[1] The Story  →  [2] Prove It  →  [3] The Memory Link  →  [4] Details & Price  →  [5] Preview & Submit
```

Each step = one screen, one focus, clear purpose.

---

### Step 1 — "The Story" (The Why)

Start with emotion, not logistics.

**What it shows:**
- Big prompt: *"Tell us about this item — where were you, what happened, why does it matter?"*
- **Voice note button** (primary CTA) — records audio, auto-transcribes to text
- Text box as fallback (character counter showing progress to 100 words)
- Example story shown below (faded, for inspiration)
- Language toggle: English / Sheng / Kiswahili

**Why voice-first:** Celebrities speak naturally in Sheng. Writing feels like admin. A 45-second voice note becomes a 150-word story automatically.

---

### Step 2 — "Prove It" (Photos)

Build buyer trust while guiding the celebrity.

**What it shows:**
- Camera opens directly (no file picker first — camera IS the primary action)
- Photo grid: 5 slots with labels:
  1. **Front** — full front view of item
  2. **Back** — full back view
  3. **Close-up detail** — unique detail, tag, texture, or wear mark
  4. **With me** — celebrity holding or wearing the item
  5. **Your choice** — any extra angle they want to show
- Each slot shows a ghost placeholder image (so they know what to shoot)
- Minimum 3 photos required, 5 recommended
- Max 10 photos total

> **No video uploads.** Photos only, to keep storage lightweight at MVP stage.

---

### Step 3 — "The Memory Link" (Social Proof)

This is the trust anchor — a public post that proves the item existed in a real moment.

**What it shows:**
- Heading: *"Show us where this item has been"*
- Sub-copy: *"Paste a link to an Instagram or TikTok post where this item appears — a concert, a match, a shoot, a moment. This is what makes buyers believe."*
- Single input field: URL paste
- Auto-detects platform (Instagram or TikTok) and shows a small preview thumbnail
- Validation: Must be a real, publicly accessible post
- If the item is brand new and has no post yet: *"No post yet? You can add this later before your listing goes live."* (optional field, but strongly nudged)

**Why this replaces video:**
A public social post is *better* proof than a private verification video because:
- It already exists — no extra work for the celebrity
- It's verifiable by anyone (public URL)
- It has a timestamp, engagement, and context attached
- It links the item to a real-world event the fans already know

**Accepted link formats:**
- `instagram.com/p/[post-id]`
- `instagram.com/reel/[reel-id]`
- `tiktok.com/@[user]/video/[id]`

---

### Step 4 — "Details & Price" (The Logistics)

Fast, tappable, minimal typing.

**Item Details:**
- **Category** — large tap tiles, not a dropdown:
  `Clothing` `Accessories` `Sports Gear` `Memorabilia` `Music` `Other`
- **Condition** — 3 options only:
  `Like New` `Well Loved` `Worn & Proud`
- **"Worn At" event** — event name + date (optional but badged: *"Adds a 'Worn At' badge — buyers love this"*)
- **Item name** — single line, auto-suggested from story text

> **"Worn & Proud" as a condition option reframes wear as a feature, not a flaw.** A worn item has *more* emotional value, not less.

**Pricing:**
- Three pricing modes as large cards: `Fixed Price` `Auction` `Make an Offer`
- **Live payout calculator:** as they type KES 15,000 → shows *"You receive: KES 12,750 after 15% platform fee"*
- Price suggestion based on category (subtle, not pushy)
- Auction: min bid + reserve price + duration selector (3 / 7 / 14 days)
- *"Most [category] items sell for KES X–Y"* — anchoring hint

---

### Step 5 — "Preview & Submit"

The moment of truth — make it feel like a magazine spread.

**What it shows:**
- Full listing card preview exactly as buyers will see it
- Their story, photos, price, "Worn At" badge, memory link preview
- Review checklist (green checkmarks): Story ✓ Photos ✓ Memory Link ✓ Price set ✓
- Submit button: **"Send for Review"**
- After submit: Status screen — *"Your item is being reviewed. Usually takes 2–4 hours."*
- **Instant share card** — auto-generated graphic with their item photo + *"Dropping on Goodiegoodies"* — one tap to WhatsApp / Instagram Story

---

## Mobile-First Design Rules

| Rule | Reason |
|------|--------|
| One action per screen | Reduces cognitive load for busy celebs |
| No horizontal scrolling | Thumb navigation only |
| Camera opens natively | Biggest drop-off point is "how do I add photos" |
| Progress bar always visible | Celebs need to know how close they are to done |
| Autosave at every step | Don't lose a half-done listing |
| Swahili/Sheng voice support | Natural language → higher story quality |
| Estimated time on start screen | *"This takes about 8 minutes"* sets expectations |
| Memory link auto-preview | Removes doubt that the link was pasted correctly |

---

## Tech Stack for This Page

No external CMS (Builder.io, Strapi, Contentful) needed. This is a multi-step wizard form built in React:

| Tool | Purpose |
|------|---------|
| `react-hook-form` + `zod` | Form state management + validation |
| Web Speech API | Voice-to-text for the story field |
| Native `<input type="file" capture="camera">` | Photo capture on mobile |
| `react-dropzone` | Drag-and-drop photo upload on desktop |
| URL metadata fetch (oEmbed) | Auto-preview Instagram/TikTok memory links |
| Framer Motion / Motion | Step transition animations |
| shadcn/ui components | Buttons, cards, inputs — already installed |
| Tailwind CSS v4 | Styling — already configured |

---

## Key UX Decisions

| Decision | Rationale |
|----------|-----------|
| Start with The Story, not item details | Story is the product — lead with the emotional hook |
| Voice note as primary story input | Celebs speak in Sheng naturally; writing feels like admin |
| Social post link instead of verification video | Public URL is better proof — timestamped, verifiable, pre-existing |
| "Worn & Proud" condition option | Reframes wear as emotional value, not damage |
| Show payout calculator live | Removes uncertainty — celeb knows exactly what they earn |
| Instant share card after submit | Turns the listing moment into content for their own channels |
| 5-step wizard, not a single long form | Each step = one decision = no overwhelm |

---

## What We Are NOT Building (MVP Scope)

- Video uploads (deferred — storage cost, complexity)
- Bulk listing tools (Phase 2 — Pro Seller subscription feature)
- AI pricing suggestions (Phase 2)
- Shipping label generation (Phase 2 — Sendy/Fargo API integration)
- Fractional ownership listings (Phase 3 per roadmap)

---

*Research by: Claude (UX + PM + Celebrity perspective)*
*Project: Goodiegoodies.com — Kenya-first celebrity personal items marketplace*

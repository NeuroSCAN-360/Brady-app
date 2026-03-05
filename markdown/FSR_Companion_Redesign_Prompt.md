# FSR Companion App — Full Redesign Prompt
### For: Antigravity Gemini 3.1 (or any capable frontend AI)
---

## 🎯 CONTEXT & PURPOSE

You are redesigning the **FSR Companion App** — a **clinical-grade neurological testing tool** used by healthcare professionals for finger-tap pressure assessment in patients with neurodegenerative conditions (Parkinson's, MS, ALS, etc.). This is a **medical-grade interface** — it must feel authoritative, calm, precise, and deeply trustworthy. Think: the design language of a premium medical device company (like Medtronic or Brainlab), not a generic SaaS app.

---

## 🔴 PROBLEMS TO FIX (Critical Issues)

### 1. Header / Branding Alignment
- The logo icon and "FSR Companion App" title are **not vertically centered** with each other
- The subtitle "Clinical-grade finger-tap testing" sits too close to the title with insufficient breathing room
- The top-right buttons ("Connect Device", "Sign Out") are floating without a proper **sticky header bar** — they look disconnected from the layout
- **Fix**: Create a proper **fixed top navigation bar** with the logo + title on the left and action buttons on the right, with a subtle bottom border or shadow

### 2. Patient Information Card — Layout Problems
- The card header (teal gradient bar with "Patient Information") spans full width correctly, but the **form fields inside are not aligned**:
  - "Patient Name" field takes ~75% width but the label is left-aligned while Age and Gender labels are inconsistently spaced
  - There is a **massive empty gap** above the form fields inside the card — the padding is excessive and creates dead whitespace
  - The three buttons ("Connect & Start", "Upload CSV (Fallback)", "View Past Sessions") are **left-aligned** but look orphaned — they need a clearer visual relationship to the form
  - The small disclaimer text at the bottom of the card is too small, low-contrast, and just floats without visual anchoring
- **Fix**: Use a proper CSS Grid layout inside the card: `[Patient Name (flex-grow)] [Patient Age (fixed ~160px)] [Gender (fixed ~180px)]` on one row, then buttons on the next row properly spaced

### 3. Feature Cards (Bottom Row) — Spacing & Consistency
- The three feature cards (Real-time Capture, CSV + Reports, Session History) have **inconsistent internal padding** — the icon+title row and description text aren't aligned across cards
- Cards lack **visual hierarchy** — everything is the same weight, making it hard to scan
- The cards sit too close to the Patient Information card above — insufficient vertical spacing
- **Fix**: Give cards a clear icon → title → description hierarchy, consistent padding (24px), and a subtle hover state (lift shadow + teal left-border accent)

### 4. Overall Spacing & Rhythm
- The page has no consistent vertical spacing system — gaps between sections are arbitrary
- The hero description text ("Advanced neurological testing suite...") is crammed between the title and the Patient Information card
- **Fix**: Implement an 8px base spacing grid. Section gaps should be multiples of this (24px, 32px, 48px)

### 5. Typography Issues
- The current font mix is inconsistent — the heading feels heavy while body text is too light
- Clinical apps benefit from **slightly condensed, authoritative** type choices
- **Fix**: Use `DM Sans` or `IBM Plex Sans` for UI text (clean, medical-neutral), and `DM Serif Display` or `Libre Baskerville` for the app title only — this gives clinical authority without being sterile

### 6. Color & Visual Polish
- The teal gradient on the card header is good but feels abrupt/harsh
- The background (very light blue-gray) is fine but adds no depth
- Button hierarchy is unclear — "Connect & Start" (primary CTA) looks almost the same as secondary buttons
- **Fix**: 
  - Primary button: rich teal (#0891B2) with white text, rounded-lg, subtle shadow
  - Secondary buttons: white background, teal border, teal text
  - Tertiary/ghost: no border, muted text with hover state
  - Add a very subtle grid or dot pattern to the background for depth

---

## ✅ COMPLETE REDESIGN SPECIFICATION

### Layout Structure
```
┌─────────────────────────────────────────────────────┐
│  FIXED NAVBAR: [Logo + Title]         [Connect] [Sign Out] │
├─────────────────────────────────────────────────────┤
│                                                     │
│           HERO SECTION (centered, generous padding) │
│         App title + subtitle + tagline description  │
│                                                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│   PATIENT INFORMATION CARD                          │
│   ┌─ Card Header (gradient) ──────────────────────┐ │
│   │  👤 Patient Information                       │ │
│   └───────────────────────────────────────────────┘ │
│   ┌─ Card Body ───────────────────────────────────┐ │
│   │  [Patient Name______________] [Age___] [Gender▼]│ │
│   │                                               │ │
│   │  [● Connect & Start]  [↑ Upload CSV]  [⟳ History]│ │
│   │                                               │ │
│   │  ℹ️  Connects to backend server via WebSocket  │ │
│   └───────────────────────────────────────────────┘ │
│                                                     │
│   FEATURE CARDS ROW (equal width, equal height)    │
│   ┌──────────────┐ ┌──────────────┐ ┌────────────┐ │
│   │ 📈 Real-time │ │ 📄 CSV+Reports│ │ 🕐 History │ │
│   │    Capture   │ │              │ │            │ │
│   │ Description  │ │ Description  │ │Description │ │
│   └──────────────┘ └──────────────┘ └────────────┘ │
└─────────────────────────────────────────────────────┘
```

### Color Palette (CSS Variables)
```css
:root {
  --clr-bg: #EFF6FA;               /* cool off-white background */
  --clr-bg-card: #FFFFFF;           /* card surfaces */
  --clr-primary: #0891B2;           /* primary teal (Cyan-600) */
  --clr-primary-dark: #0E7490;      /* hover state / darker teal */
  --clr-primary-light: #CFFAFE;     /* light teal for accents */
  --clr-gradient-start: #0F4C75;    /* deep navy for gradients */
  --clr-gradient-end: #00B4D8;      /* bright teal for gradients */
  --clr-text-primary: #0F172A;      /* near-black for headings */
  --clr-text-secondary: #475569;    /* medium gray for body */
  --clr-text-muted: #94A3B8;        /* light gray for hints */
  --clr-border: #E2E8F0;            /* subtle borders */
  --clr-shadow: rgba(8,145,178,0.12); /* teal-tinted shadows */
  --clr-danger: #DC2626;            /* for warnings */
  --clr-success: #16A34A;           /* for connected status */
}
```

### Typography
```css
/* Import from Google Fonts */
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600;700&family=IBM+Plex+Serif:ital,wght@0,500;0,600;1,400&display=swap');

body { font-family: 'IBM Plex Sans', sans-serif; }
.app-title { font-family: 'IBM Plex Serif', serif; font-weight: 600; font-size: 2.75rem; }
.app-subtitle { font-family: 'IBM Plex Sans', sans-serif; font-weight: 400; letter-spacing: 0.08em; text-transform: uppercase; font-size: 0.8rem; }
h2, .section-title { font-family: 'IBM Plex Sans', sans-serif; font-weight: 600; }
```

### Navbar (Fixed, Top)
```
- Height: 64px
- Background: white with border-bottom: 1px solid var(--clr-border) and subtle box-shadow
- Left side: Brain icon (24px, teal) + "FSR Companion" in IBM Plex Serif 20px dark
- Right side: "Connect Device" button (outlined, teal) + "Sign Out" button (ghost, gray)
- Padding: 0 32px
- Position: fixed, z-index: 100
```

### Hero Section
```
- Padding-top: 96px (to clear fixed navbar), padding-bottom: 48px
- Center-aligned
- Brain icon: 56px, teal background circle, white icon — NOT inline with text
- App title: IBM Plex Serif, 2.75rem, color: var(--clr-text-primary)
- Subtitle badge: pill shape, teal background, white text, uppercase tracking-widest, 0.7rem
- Description: max-width 560px, centered, IBM Plex Sans 1rem, var(--clr-text-secondary), line-height 1.7
- Vertical spacing: icon(mb:16px) → title(mb:8px) → subtitle-badge(mb:24px) → description
```

### Patient Information Card
```css
.patient-card {
  background: white;
  border-radius: 16px;
  border: 1px solid var(--clr-border);
  box-shadow: 0 4px 24px var(--clr-shadow);
  overflow: hidden;
  max-width: 880px;
  margin: 0 auto 48px;
}

.patient-card-header {
  background: linear-gradient(135deg, #0F4C75 0%, #1B6CA8 40%, #00B4D8 100%);
  padding: 18px 28px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.patient-card-header h2 {
  color: white;
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
}

.patient-card-body {
  padding: 28px;
}

/* Form grid - KEY FIX */
.patient-form-grid {
  display: grid;
  grid-template-columns: 1fr 160px 180px;
  gap: 16px;
  margin-bottom: 24px;
}

.form-field label {
  display: block;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--clr-primary);
  margin-bottom: 6px;
}

.form-field input, .form-field select {
  width: 100%;
  padding: 10px 14px;
  border: 1.5px solid var(--clr-border);
  border-radius: 8px;
  font-size: 0.95rem;
  font-family: 'IBM Plex Sans', sans-serif;
  color: var(--clr-text-primary);
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-field input:focus, .form-field select:focus {
  outline: none;
  border-color: var(--clr-primary);
  box-shadow: 0 0 0 3px rgba(8,145,178,0.15);
}

/* Button row */
.patient-actions {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 20px;
}

/* Button styles */
.btn-primary {
  background: linear-gradient(135deg, #0891B2, #0E7490);
  color: white;
  border: none;
  padding: 10px 22px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 2px 8px rgba(8,145,178,0.35);
  transition: transform 0.15s, box-shadow 0.15s;
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(8,145,178,0.45);
}

.btn-secondary {
  background: white;
  color: var(--clr-primary);
  border: 1.5px solid var(--clr-primary);
  padding: 10px 18px;
  border-radius: 8px;
  font-weight: 500;
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background 0.15s, color 0.15s;
}

.btn-secondary:hover {
  background: var(--clr-primary-light);
}

/* Disclaimer text */
.patient-disclaimer {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 12px 16px;
  background: #F0F9FF;
  border-radius: 8px;
  border-left: 3px solid var(--clr-primary);
  font-size: 0.8rem;
  color: var(--clr-text-secondary);
  line-height: 1.5;
}
```

### Feature Cards Row
```css
.features-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  max-width: 880px;
  margin: 0 auto;
}

.feature-card {
  background: white;
  border: 1px solid var(--clr-border);
  border-radius: 12px;
  padding: 24px;
  transition: transform 0.2s, box-shadow 0.2s, border-left 0.2s;
  border-left: 3px solid transparent;
}

.feature-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 28px var(--clr-shadow);
  border-left: 3px solid var(--clr-primary);
}

.feature-icon-wrap {
  width: 40px;
  height: 40px;
  background: var(--clr-primary-light);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 14px;
  color: var(--clr-primary);
}

.feature-card h3 {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--clr-text-primary);
  margin: 0 0 8px;
}

.feature-card p {
  font-size: 0.85rem;
  color: var(--clr-text-secondary);
  line-height: 1.6;
  margin: 0;
}
```

### Background Styling
```css
body {
  background-color: var(--clr-bg);
  /* Subtle dot grid for depth */
  background-image: radial-gradient(circle, #C7DDE8 1px, transparent 1px);
  background-size: 28px 28px;
  min-height: 100vh;
}

/* Page wrapper */
.page-wrapper {
  max-width: 960px;
  margin: 0 auto;
  padding: 0 24px 64px;
}
```

---

## 📐 RESPONSIVE BEHAVIOR

### Tablet (768px and below)
- Patient form grid → `grid-template-columns: 1fr 1fr` (Name full-width, Age+Gender on second row)
- Feature cards → `grid-template-columns: 1fr 1fr`
- Navbar: hide "Sign Out" text, show icon only

### Mobile (480px and below)
- Patient form grid → `grid-template-columns: 1fr` (all fields stacked)
- Feature cards → `grid-template-columns: 1fr` (stacked)
- Buttons → full-width stacked
- App title font-size: 1.8rem

---

## 🎨 MICRO-INTERACTIONS & POLISH

1. **Input focus states**: Teal glow ring (already specified above)
2. **Button loading state**: On "Connect & Start" click → show a spinner icon inside the button, disable button, change text to "Connecting..."
3. **Card entrance animation**:
```css
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
.patient-card { animation: fadeUp 0.4s ease 0.1s both; }
.feature-card:nth-child(1) { animation: fadeUp 0.4s ease 0.2s both; }
.feature-card:nth-child(2) { animation: fadeUp 0.4s ease 0.3s both; }
.feature-card:nth-child(3) { animation: fadeUp 0.4s ease 0.4s both; }
```
4. **Navbar scroll effect**: On scroll > 10px, add `backdrop-filter: blur(12px); background: rgba(255,255,255,0.92);`
5. **Status indicator** on Connect Device button in navbar: pulsing green dot when connected, gray when not

---

## ⚠️ DO NOT DO

- ❌ Do NOT use Inter, Roboto, Arial, or system-ui fonts
- ❌ Do NOT use purple gradients or generic SaaS blue (#3B82F6 etc.)
- ❌ Do NOT use flat/boring card designs with no shadow or depth
- ❌ Do NOT leave excessive dead whitespace inside cards
- ❌ Do NOT make all buttons the same weight/style
- ❌ Do NOT use generic placeholder icons — use Lucide or Heroicons with the correct medical/tech icons
- ❌ Do NOT make the layout full-width with no max-width container — clinical apps feel precise and contained

---

## ✅ DELIVERABLE

Produce a **single complete HTML file** (or React .jsx if preferred) that:
1. Implements all the above fixes and specifications
2. Is fully functional (form fields work, buttons have hover/focus states)
3. Uses Google Fonts (IBM Plex Sans + IBM Plex Serif)
4. Uses Lucide icons (via CDN)
5. Has all CSS as a `<style>` block in the same file
6. Looks indistinguishable from a professionally designed clinical software product
7. Has NO lorem ipsum — use the exact copy from the original app

The result should feel like it was designed by a team that also designs tools for hospitals and medical device companies — precise, clean, trustworthy, and quietly sophisticated.

### FeedbackDZ Style Guide (MVP)

#### Palette
- Primary: Blue 600 (#2563EB), hover Blue 700 (#1D4ED8)
- Success: Green 600 (#16A34A)
- Warning: Yellow 100/800 (#FEF9C3 / #92400E)
- Danger: Red 600/800 (#DC2626 / #991B1B), surfaces Red 50/200
- Neutrals: Gray 900 (titles), 800 (body), 700, 600, 500 (muted), 100/50 (surfaces), 100 borders

#### Typography
- Headings: font-extrabold for primary titles, bold/semibold for section titles
- Body: Gray 800/700 for primary text; avoid Gray 500 for body copy
- Labels: text-sm font-semibold Gray 900
- Links: Blue 600, hover Blue 700

#### Components
- Cards: white bg, rounded-xl, border-gray-100, subtle shadow-sm/ shadow-lg on key containers
- Inputs/Textareas/Selects: rounded-lg, border-gray-300, focus:ring-2 focus:ring-blue-600 focus:border-blue-600, placeholder:text-gray-400, text-gray-900
- Buttons:
  - Primary: bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm
  - Secondary: bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 border border-gray-200
  - Destructive: bg-red-600 text-white rounded-lg hover:bg-red-700
- Badges: rounded-full, use soft backgrounds (green/yellow/blue/red 100) with strong text color

#### Layout
- Header: white bg, border-b border-gray-100, compact nav with rounded hover states
- Page containers: max-w-7xl, generous spacing, sections separated with card components

#### Accessibility & Contrast
- Minimum contrast: avoid Gray 500 for essential text; use Gray 700+ for body
- Inputs must have visible focus state (ring-blue-600)
- All interactive elements need hover and disabled states

#### Language & RTL
- UI supports AR/FR; ensure RTL mirrored spacing and alignment where applicable

#### Do/Don't
- Do keep UI clean and professional with ample whitespace
- Do use consistent radii (rounded-lg/xl) and borders (gray-100/200)
- Don't use low-contrast grays for labels or body text
- Don't add heavy shadows or excessive colors; keep it simple


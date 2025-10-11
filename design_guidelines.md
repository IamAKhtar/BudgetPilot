# Design Guidelines: Personal Budget Tracker

## Design Approach

**Selected Approach:** Design System with Finance App Patterns  
**Justification:** This is a utility-focused productivity tool requiring clarity, trust, and efficiency. Drawing inspiration from successful financial apps (Mint, YNAB, banking apps) and Material Design principles for mobile-first data visualization.

**Key Design Principles:**
- Clarity First: Financial data must be immediately scannable
- Trust Through Simplicity: Professional, uncluttered interface
- Mobile-Optimized: Touch-friendly targets, thumb-zone navigation
- Data Hierarchy: Clear visual distinction between critical info and details

## Core Design Elements

### A. Color Palette

**Light Mode:**
- Background: 0 0% 98% (soft white)
- Surface Cards: 0 0% 100% (pure white)
- Primary Brand: 220 90% 56% (trustworthy blue)
- Success/Surplus: 142 76% 36% (green)
- Warning/Shortfall: 0 84% 60% (red)
- Text Primary: 220 13% 18% (dark slate)
- Text Secondary: 220 9% 46% (medium gray)
- Borders: 220 13% 91% (light gray)

**Dark Mode:**
- Background: 220 13% 13% (dark slate)
- Surface Cards: 220 13% 18% (elevated dark)
- Primary Brand: 217 91% 60% (lighter blue)
- Success/Surplus: 142 71% 45% (lighter green)
- Warning/Shortfall: 0 72% 51% (lighter red)
- Text Primary: 0 0% 98% (near white)
- Text Secondary: 220 9% 65% (light gray)
- Borders: 220 13% 25% (subtle border)

### B. Typography

**Font Families:**
- Primary: 'Inter' or 'SF Pro Display' for UI elements
- Monospace: 'JetBrains Mono' or 'Roboto Mono' for currency/numbers

**Type Scale:**
- Display (Balance/Summary): text-3xl or text-4xl, font-bold
- Currency Values: text-2xl, font-semibold, monospace
- Section Headers: text-lg, font-semibold
- Body Text: text-base, font-medium
- Labels/Meta: text-sm, font-normal
- Small Print: text-xs

### C. Layout System

**Spacing Primitives:** Use Tailwind units of 2, 4, 6, 8, 12, 16  
- Micro spacing (between related items): p-2, gap-2
- Standard spacing (component padding): p-4, p-6
- Section spacing: py-8, py-12
- Large spacing (major sections): py-16

**Grid System:**
- Mobile-First: Single column by default
- Container: max-w-md mx-auto (mobile-optimized width)
- Card padding: p-4 to p-6
- Safe areas: px-4 for edge spacing

### D. Component Library

**Navigation:**
- Bottom tab bar (fixed, 60px height) with 3-4 primary actions
- Sticky header showing current month/balance summary
- Hamburger menu for settings/adjustments

**Cards & Lists:**
- Commitment cards with shadow-sm, rounded-lg borders
- Each card shows: name, amount (large), status indicator, due day
- Swipe gestures for edit/delete actions
- Clear visual states: paid (muted), pending (default), overdue (warning)

**Forms & Inputs:**
- Large touch targets (min 44px height)
- Currency inputs: Large monospace numbers with $ prefix
- Date selectors: Native mobile pickers
- Adjustment notes: Textarea with character count

**Status Indicators:**
- Balance surplus: Green badge with + prefix
- Shortfall: Red badge with - prefix
- Payment status: Checkmark icons or progress indicators
- Auto-pay indicator: Small icon badge

**Data Display:**
- Summary dashboard: Large currency display at top
- Commitment list: Card-based scrollable list
- Balance breakdown: Simple two-column layout (Done/Balance)
- Monthly total: Fixed footer showing totals

**Modals & Overlays:**
- Add/Edit commitment: Bottom sheet modal (slides up from bottom)
- Bank adjustment: Modal with reason textarea
- Delete confirmation: Alert dialog with clear actions
- Filter/Sort: Dropdown overlay

**Buttons:**
- Primary CTA: Solid blue background, rounded-full, px-6 py-3
- Secondary: Outline variant with border
- Icon-only: Square 40x40px touch targets
- Floating Action Button (FAB): Bottom-right for quick add

### E. Visual Enhancements

**Micro-interactions:**
- Subtle haptic feedback on important actions (payment toggle, delete)
- Number animations when balance changes
- Card entry/exit transitions (slide-in)
- Pull-to-refresh on commitment list

**Data Visualization:**
- Color-coded commitment types (fixed vs variable)
- Progress bars showing monthly completion
- Simple donut chart for expense breakdown (optional detail view)

**Accessibility:**
- WCAG AA contrast ratios maintained
- Large touch targets (min 44px)
- Clear focus states for keyboard navigation
- High contrast mode support

## Images

No hero images required. This is a data-focused utility app. Optional illustrative elements:
- Empty state illustration when no commitments exist (friendly, minimalist)
- Success state illustration when budget balanced (celebratory, simple)
- Error state illustration for calculation issues (helpful, non-alarming)

All illustrations should be simple line art, single-color (matching primary brand), and non-distracting.
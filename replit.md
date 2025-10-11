# Budget Tracker - Personal Monthly Commitment Manager

## Overview
A mobile-first web application for tracking monthly financial commitments and calculating surplus/shortfall. Built with React, Express, and in-memory storage for quick prototyping.

## Project Purpose
Help users manage their monthly budget by:
- Tracking fixed and variable expenses/commitments
- Recording payments made ("Done So Far") and balances remaining
- Monitoring bank balance with adjustment history
- Calculating real-time surplus or shortfall

## Current State
✅ **MVP Complete** - Fully functional budget tracking app with:
- Add, edit, and delete monthly commitments
- Track payment progress for each commitment
- Adjust bank balance with reason notes
- Real-time surplus/shortfall calculations
- Mobile-optimized responsive design
- Dark/light theme support
- Beautiful UI following design guidelines

## Recent Changes (October 11, 2025)
- Initial implementation of complete budget tracking system
- Created data schema for commitments, bank balance, and adjustments
- Built mobile-first UI with card-based layout
- Implemented CRUD operations for all entities
- Added theme toggle and responsive design
- Fixed bank balance dialog to properly sync with latest balance (preventing stale value bug)
- Successfully migrated from in-memory storage to PostgreSQL database for data persistence
- Fixed form validation to properly handle number inputs with z.coerce
- **Added Monthly History Tracking**:
  - Month/year fields added to commitments and bank adjustments
  - Month navigation controls (Previous/Next buttons) in header
  - Ability to view and manage commitments for any month/year
  - Historical view indicator when viewing past months
  - Commitments correctly assigned to selected month/year
- Comprehensive E2E testing completed successfully for all features

## Project Architecture

### Tech Stack
- **Frontend**: React 18, Vite, TailwindCSS, Shadcn UI
- **Backend**: Express.js, TypeScript
- **Database**: PostgreSQL (Neon) with Drizzle ORM - data persists permanently
- **State Management**: TanStack Query (React Query v5)
- **Forms**: React Hook Form with Zod validation
- **Routing**: Wouter

### Directory Structure
```
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/              # Shadcn components
│   │   │   ├── theme-provider.tsx
│   │   │   ├── theme-toggle.tsx
│   │   │   ├── commitment-card.tsx
│   │   │   ├── commitment-form.tsx
│   │   │   └── bank-balance-dialog.tsx
│   │   ├── pages/
│   │   │   └── dashboard.tsx    # Main budget dashboard
│   │   ├── App.tsx
│   │   └── index.css            # Design system tokens
│   └── index.html
├── server/
│   ├── routes.ts                # API endpoints
│   ├── storage.ts               # In-memory storage implementation
│   └── index.ts
├── shared/
│   └── schema.ts                # Shared TypeScript types and Zod schemas
└── design_guidelines.md         # UI/UX design principles
```

### Data Model

**Commitments** (Monthly expenses)
- `id`: Unique identifier
- `type`: "Fixed" or "Variable"
- `name`: Description (e.g., "Family Support", "Grocery")
- `monthlyCommitment`: Total amount due per month (₹)
- `doneSoFar`: Amount already paid (₹)
- `balance`: Remaining amount (calculated: monthlyCommitment - doneSoFar)
- `dueDay`: Day of month (1-31)
- `isAutomated`: Boolean for auto-payment status
- `month`: Month (1-12) - for historical tracking
- `year`: Year (e.g., 2025) - for historical tracking

**Bank Balance**
- `id`: Unique identifier
- `balance`: Current bank balance (₹)

**Bank Adjustments** (History)
- `id`: Unique identifier
- `amount`: New balance amount
- `reason`: Explanation for adjustment
- `timestamp`: ISO date string
- `month`: Month (1-12) - for historical tracking
- `year`: Year (e.g., 2025) - for historical tracking

### API Endpoints

**Commitments**
- `GET /api/commitments?month=X&year=Y` - List commitments for specific month (sorted by due day)
- `POST /api/commitments` - Create new commitment (month/year assigned from request)
- `PATCH /api/commitments/:id` - Update commitment
- `DELETE /api/commitments/:id` - Delete commitment

**Bank Balance**
- `GET /api/bank-balance` - Get current balance
- `POST /api/bank-balance/adjust` - Update balance with reason (auto-assigns current month/year)

**Bank Adjustments**
- `GET /api/bank-adjustments?month=X&year=Y` - Get adjustment history (optionally filtered by month/year)

### Key Features

1. **Dashboard View**
   - Bank balance display with adjustment button
   - Surplus/Shortfall calculation (green for surplus, red for shortfall)
   - Monthly summary statistics (total monthly, paid, balance, count)
   - List of all commitments with visual indicators
   - Month/year navigation with Previous/Next controls
   - Historical view indicator for past/future months

2. **Monthly History Tracking**
   - Navigate to any month/year to view historical data
   - Create commitments for specific months
   - View past month budgets and spending patterns
   - Separate data for each month with automatic filtering

3. **Commitment Management**
   - Add new commitments with full details
   - Edit existing commitments
   - Delete with confirmation dialog
   - Visual indicators: type badge, auto-payment badge, paid status
   - Color-coded balances (green for paid, red for pending)
   - Automatically assigned to selected month/year

4. **Bank Balance Tracking**
   - Adjustable balance with reason notes
   - Form properly resets to show current balance on open
   - Adjustment history stored for accountability
   - Adjustments track month/year for historical reference

5. **Calculations**
   - Balance per commitment: `monthlyCommitment - doneSoFar`
   - Total pending: Sum of all commitment balances
   - Surplus/Shortfall: `bankBalance - totalPendingBalance`

5. **UI/UX Features**
   - Mobile-first responsive design (max-width: 448px centered)
   - Sticky header with theme toggle
   - Card-based layout for easy scanning
   - Floating action button for quick add
   - Loading skeletons during data fetch
   - Toast notifications for user feedback
   - Dark/light theme with proper contrast
   - Accessible form inputs with validation

### Design Principles (from design_guidelines.md)
- **Color Palette**: Trust-building blue primary, green for surplus/paid, red for shortfall/balance
- **Typography**: Inter for UI, JetBrains Mono for currency values
- **Spacing**: Consistent 4px/8px/16px/24px scale
- **Components**: Shadcn UI with hover-elevate interactions
- **Mobile Touch Targets**: Minimum 44px height for buttons
- **Data Hierarchy**: Large currency displays, clear visual states

### User Workflows

**Adding a Commitment**
1. Click floating + button (or "Add Commitment" in empty state)
2. Fill form: name, type, monthly amount, paid amount, due day, auto-pay toggle
3. Submit → Commitment appears in list, calculations update

**Editing a Commitment**
1. Click edit icon on commitment card
2. Modify fields in pre-filled form
3. Submit → Card updates, calculations refresh

**Deleting a Commitment**
1. Click delete icon on commitment card
2. Confirm in alert dialog
3. Commitment removed, calculations update

**Adjusting Bank Balance**
1. Click settings icon on bank balance card
2. Enter new balance and reason for change
3. Submit → Balance updates, adjustment logged

**Viewing Surplus/Shortfall**
- Automatically calculated and displayed
- Green with up arrow = surplus (bank balance > pending payments)
- Red with down arrow = shortfall (bank balance < pending payments)

## Development Notes

### Running the App
```bash
npm run dev
```
- Backend serves on port 5000
- Vite dev server proxies through same port
- Open browser to view (automatic in Replit)

### Storage Behavior
- **In-Memory**: Data persists only during server runtime
- Refreshing browser keeps data (server still running)
- Restarting server resets to defaults:
  - Bank balance: ₹100,000
  - No commitments
  - No adjustment history

### Testing
- Comprehensive E2E test suite covers:
  - Adding/editing/deleting commitments
  - Bank balance adjustments
  - Calculation accuracy
  - Theme toggle functionality
  - Bug fix verification (balance dialog sync)

### Known Limitations (MVP)
- No persistent database (data resets on server restart)
- No user authentication (single-user app)
- No monthly history/archives
- No spending analytics or charts
- No export functionality
- Currency fixed to ₹ (Rupees)

## Future Enhancements (Post-MVP)
1. **PostgreSQL Database** - Permanent data storage
2. **Monthly History** - Track budget over multiple months
3. **Analytics Dashboard** - Charts and spending insights
4. **Payment Reminders** - Notifications based on due days
5. **Categories** - Group commitments by type
6. **Multi-Currency** - Support different currencies
7. **Export** - Download reports (Excel, PDF)
8. **Recurring Patterns** - Auto-create next month's commitments
9. **Mobile PWA** - Install as mobile app

## User Preferences
- Mobile-optimized design is priority
- Clean, elegant, uncluttered interface
- Easy to see surplus/shortfall at a glance
- Simple add/edit/delete operations
- Ability to adjust bank balance with explanatory notes
- Based on user's Excel workflow but cleaner

## Code Quality Notes
- Type-safe with TypeScript throughout
- Zod validation on both client and server
- Proper error handling with user-friendly toasts
- Accessible forms with proper labels and error messages
- Responsive design tested on mobile viewports
- Dark mode fully supported with proper contrast
- Clean separation: UI components, business logic, API routes
- Bug fix applied: Bank balance dialog properly resyncs on open

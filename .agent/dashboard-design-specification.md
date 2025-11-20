# Dashboard Design Specification

**FlowZenit Portal - Default Homepage (Dashboard)**

---

## 📋 Document Information

- **Role**: Senior Product Designer & Frontend Architect
- **Date**: 2025-11-19
- **Version**: 1.0
- **Status**: Complete ✅

---

## 1. Executive Summary

### Current State

- Portal currently logs in to the `/dashboard` route
- Sidebar first item is labeled "Backlog" but routes to `/dashboard`
- Dashboard already implements all required widgets

### Target State

- Dashboard becomes the true default landing page
- Sidebar updated to clearly identify "Dashboard" as the first item
- Dashboard aggregates context from all 8 project modules

### Scope

This specification defines the complete design, data sources, widgets, and technical implementation for the new default portal homepage (Dashboard).

---

## 2. Design Philosophy

### Visual Principles

✨ **Modern & Clean**: Uses gradient backgrounds and glassmorphism effects  
🎨 **Consistent Color Palette**: Adheres to existing design tokens  
📱 **Responsive**: Mobile-first approach with adaptive layouts  
⚡ **Performance**: Lightweight components with optimized rendering  
🧩 **Component-Based**: Leverages shadcn/ui component library

### Design Tokens (from globals.css)

```css
Primary: hsl(221 83% 53%) - Blue (#4169E1 approx)
Secondary: hsl(210 40% 96.1%) - Light gray
Card Background: White with subtle shadows
Accent Colors:
  - Blue (Primary): Various UI elements
  - Red: Urgency indicators
  - Amber: Waiting/Warnings
  - Emerald: Completed/Today's focus
  - Purple: Projects
```

---

## 3. Data Architecture

### 3.1 Data Sources (8 Modules)

The Dashboard aggregates information from these modules:

| Module            | Route            | Primary Purpose                        | Dashboard Usage            |
| ----------------- | ---------------- | -------------------------------------- | -------------------------- |
| **Backlog**       | `/dashboard`     | Prioritized task list using GUT matrix | Score metrics, rankings    |
| **Kanban**        | `/kanban`        | Visual board (6 columns)               | Status distribution        |
| **In Progress**   | `/in-progress`   | Active work items                      | Current focus count        |
| **Demands**       | `/demands`       | All demand items                       | Filtering & categorization |
| **References**    | `/reference`     | Knowledge base items                   | Reference count            |
| **Follow-up**     | `/follow-up`     | Historical tracking                    | Trends & patterns          |
| **Documentation** | `/documentation` | PDCA & documentation                   | Documentation status       |
| **Calendar**      | `/calendar`      | Time-based view                        | Today's tasks              |

### 3.2 Core Data Model

**BacklogItem Interface** (from types.ts):

```typescript
interface BacklogItem {
  id: string;
  activity: string;
  details?: string;
  category: "inbox" | "project" | "future" | "reference" | "task";
  status: "backlog" | "analysing" | "doing" | "waiting" | "blocked" | "done";
  gravity: number; // 1-10 scale
  urgency: number; // 1-10 scale
  tendency: number; // 1-10 scale
  score: number; // Calculated GUT score
  deadline: Date | null;
  startDate?: Date | null;
  createdAt: Date;
  categoryId?: string | null;
  pdcaAnalysis?: Partial<PDCAAnalysis>;
  user_id?: string;
}
```

**GUT Score Calculation**:

```typescript
score = GUT_Product × (k / (hoursRemaining + b))
where:
  GUT_Product = gravity × urgency × tendency
  k = time factor (default: 24)
  b = smoothing factor (default: 1)
```

### 3.3 Data Processing Logic

```typescript
// Active vs Completed
activeItems = items.filter((item) => item.status !== "done");
completedItems = items.filter((item) => item.status === "done");

// Urgency Panel: Top 3 by Urgency → Score
urgentItems = activeItems
  .sort((a, b) => {
    if (b.urgency !== a.urgency) return b.urgency - a.urgency;
    return (b.score || 0) - (a.score || 0);
  })
  .slice(0, 3);

// Task Ranking: Top 5 tasks by Score
rankedTasks = activeItems
  .filter((item) => item.category === "task")
  .sort((a, b) => (b.score || 0) - (a.score || 0))
  .slice(0, 5);

// Daily Focus: Deadline today OR Start Date today/past
dailyFocusItems = activeItems.filter((item) => {
  const deadline = item.deadline ? new Date(item.deadline) : null;
  const startDate = item.startDate ? new Date(item.startDate) : null;
  const now = new Date();

  return (
    (deadline && isSameDay(deadline, now)) ||
    (startDate && (isSameDay(startDate, now) || startDate < now))
  );
});

// External Status: Waiting items
waitingItems = activeItems.filter((item) => item.status === "waiting");
```

---

## 4. Widget Specifications

### 4.1 Widget #1: Scoring Metrics (4 Cards)

**Purpose**: High-level KPIs for quick status overview

**Layout**: 4-column grid (responsive: mobile=1, tablet=2, desktop=4)

**Cards**:

#### Card 1: Impacto Total

- **Value**: Sum of all active items' GUT scores
- **Icon**: Activity (blue)
- **Border**: Left border, blue (4px)
- **Subtitle**: "Soma dos scores GUT ativos"
- **Calculation**: `activeItems.reduce((acc, item) => acc + (item.score || 0), 0)`

#### Card 2: Concluídos

- **Value**: Count of completed items
- **Icon**: CheckCircle2 (emerald)
- **Border**: Left border, emerald (4px)
- **Subtitle**: "Itens finalizados"
- **Calculation**: `items.filter(item => item.status === 'done').length`

#### Card 3: Projetos Ativos

- **Value**: Count of active projects
- **Icon**: Target (purple)
- **Border**: Left border, purple (4px)
- **Subtitle**: "Em andamento"
- **Calculation**: `activeItems.filter(item => item.category === 'project').length`

#### Card 4: Aguardando

- **Value**: Count of waiting items
- **Icon**: Clock (amber)
- **Border**: Left border, amber (4px)
- **Subtitle**: "Dependências externas"
- **Calculation**: `activeItems.filter(item => item.status === 'waiting').length`

**Visual Design**:

- White background with subtle shadow
- Hover effect: Shadow intensifies
- Icon in top-right, value in large bold text
- All numeric values rounded to integers

---

### 4.2 Widget #2: Urgency Panel

**Purpose**: Display top 3 most urgent items requiring immediate attention

**Layout**: Full-width card in left column (2/3 width on desktop)

**Gradient Background**: `from-white to-red-50/30`

**Header**:

- Icon: AlertCircle (red background circle)
- Title: "Maior Urgência"
- Description: "Itens que requerem atenção imediata"

**Item Design**:

```
┌─────────────────────────────────────────────────┐
│ [●10]  Task Name                    [Link Icon] │
│        GUT: 850 • 📅 25/11                      │
└─────────────────────────────────────────────────┘
```

**Features**:

- Urgency score in red circle (large, bold)
- Task name truncated if too long
- GUT score badge (outline variant)
- Deadline date with calendar icon
- External link button to edit page
- White card with hover shadow effect

**Sort Logic**:

1. Primary: Urgency (descending)
2. Secondary: Score (descending)

**Empty State**: "Nenhum item urgente encontrado."

---

### 4.3 Widget #3: Task Ranking

**Purpose**: Top 5 pending tasks ordered by priority (GUT score)

**Layout**: Full-width card below Urgency Panel (left column)

**Background**: White

**Header**:

- Icon: TrendingUp (blue background circle)
- Title: "Ranking de Prioridade"
- Description: "Top tarefas baseadas no score GUT"

**Item Design**:

```
┌─────────────────────────────────────────────────┐
│ #1  Task Name                           [●850]  │
│ #2  Another Task                        [●620]  │
│ #3  Third Task                          [●480]  │
│ #4  Fourth Task                         [●320]  │
│ #5  Fifth Task                          [●180]  │
└─────────────────────────────────────────────────┘
```

**Features**:

- Rank number in gray badge (#1, #2, etc.)
- Task name with hover effect (blue text)
- Score badge with color coding:
  - Red background: score > 500
  - Amber background: score > 200
  - Emerald background: score ≤ 200
- Hover row background: slate-50

**Sort Logic**: GUT score descending, tasks only

**Empty State**: "Nenhuma tarefa pendente."

---

### 4.4 Widget #4: Daily Focus (Foco do Dia)

**Purpose**: Show tasks that need attention today

**Layout**: Right column card (1/3 width on desktop)

**Gradient Background**: `from-emerald-50 to-white`  
**Top Border**: 4px emerald

**Header**:

- Icon: Zap (emerald)
- Title: "Foco do Dia"
- Description: "Tarefas para hoje"

**Item Design**:

```
┌─────────────────────────────────────────────────┐
│ ☐ Complete project report                      │
│   [task] 14:30                                  │
├─────────────────────────────────────────────────┤
│ ☐ Review pull requests                         │
│   [project] 16:00                               │
└─────────────────────────────────────────────────┘
```

**Features**:

- Checkbox (disabled, read-only in dashboard)
- Task name in medium weight
- Category badge (small, emerald background)
- Time from deadline (HH:mm format)
- Cards with frosted glass effect (bg-white/60 backdrop-blur)

**Inclusion Criteria**:

1. Items with deadline = today
2. Items with startDate = today OR past

**Empty State**:

```
  [✓ Icon in emerald circle]
  Tudo limpo por hoje!
  Aproveite para adiantar o backlog.
```

---

### 4.5 Widget #5: External Status (Aguardando)

**Purpose**: Track items awaiting external response (Demands module)

**Layout**: Right column card below Daily Focus

**Background**: White

**Header**:

- Icon: Flag (amber)
- Title: "Aguardando"
- Description: "Pendências externas"

**Item Design**:

```
┌─────────────────────────────────────────────────┐
│ • Approval from stakeholder        [Link Icon]  │
│   Waiting for budget confirmation               │
├─────────────────────────────────────────────────┤
│ • Client feedback on design        [Link Icon]  │
│   Sent on 2025-11-15                           │
└─────────────────────────────────────────────────┘
```

**Features**:

- Amber dot indicator
- Item activity name (bold, truncated)
- Details or "Sem detalhes" (gray, small)
- External link button to edit page
- Hover background effect

**Filter**: `item.status === 'waiting'`

**Empty State**: "Nenhuma pendência externa."

---

## 5. Layout Architecture

### 5.1 Overall Structure

```
┌─────────────────────────────────────────────────────────┐
│                        Header                           │
│  [LayoutDashboard Icon] Dashboard                       │
│  Visão geral do seu fluxo de produtividade              │
│                                     [Date & Active Count]│
├─────────────────────────────────────────────────────────┤
│                 Scoring Metrics Row                     │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐              │
│  │Card1 │  │Card2 │  │Card3 │  │Card4 │              │
│  └──────┘  └──────┘  └──────┘  └──────┘              │
├─────────────────────────────────────────────────────────┤
│          Main Content (2-Column Layout)                 │
│  ┌────────────────────┬──────────────────────┐        │
│  │ LEFT (2/3)         │ RIGHT (1/3)          │        │
│  ├────────────────────┤                      │        │
│  │ Urgency Panel      │ Daily Focus          │        │
│  │                    │                      │        │
│  ├────────────────────┤                      │        │
│  │                    ├──────────────────────┤        │
│  │ Task Ranking       │ External Status      │        │
│  │                    │                      │        │
│  └────────────────────┴──────────────────────┘        │
└─────────────────────────────────────────────────────────┘
```

### 5.2 Responsive Breakpoints

**Mobile (< 768px)**:

- Scoring Metrics: 1 column
- Main Content: 1 column (stacked vertically)
- Header date info: Hidden

**Tablet (768px - 1024px)**:

- Scoring Metrics: 2 columns
- Main Content: 1 column (stacked vertically)

**Desktop (≥ 1024px)**:

- Scoring Metrics: 4 columns
- Main Content: 3-column grid (2 cols left, 1 col right)

---

## 6. Technical Implementation

### 6.1 Component Stack

**Framework**: Next.js 14+ (App Router)  
**Language**: TypeScript  
**Styling**: Tailwind CSS  
**UI Library**: shadcn/ui (Radix UI primitives)  
**Date Handling**: date-fns  
**Icons**: lucide-react

### 6.2 File Structure

```
src/
├── app/
│   └── dashboard/
│       └── page.tsx          # Route wrapper
├── components/
│   ├── app/
│   │   ├── dashboard-content.tsx   # Main dashboard logic
│   │   └── app-layout.tsx          # Shared layout
│   └── ui/
│       ├── card.tsx
│       ├── badge.tsx
│       └── button.tsx
├── hooks/
│   └── use-supabase-demands.ts     # Data fetching hook
└── lib/
    ├── types.ts
    └── utils.ts
```

### 6.3 Data Flow

```
┌──────────────────┐
│ Supabase Backend │
└────────┬─────────┘
         │
         ▼
┌──────────────────────────┐
│ use-supabase-demands.ts  │
│  - loadData()            │
│  - calculateScore()      │
│  - Real-time updates     │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ dashboard-content.tsx    │
│  - Data processing       │
│  - Widget rendering      │
└──────────────────────────┘
```

### 6.4 Key Hooks & Functions

**useSupabaseDemands()**:

```typescript
const {
  items, // All backlog items
  isLoaded, // Loading state
  addItem, // Create new item
  updateItem, // Update existing item
  deleteItem, // Delete item
} = useSupabaseDemands();
```

**Loading State**:

```tsx
if (!isLoaded) {
  return (
    <div className="flex flex-col items-center justify-center h-64">
      <div
        className="animate-spin rounded-full h-12 w-12 
                      border-4 border-blue-500 border-t-transparent"
      />
      <p className="text-slate-600 text-lg font-medium">
        Carregando dashboard...
      </p>
    </div>
  );
}
```

---

## 7. Design Specifications

### 7.1 Typography

**Font Family**: System font stack (Inter-like)

**Scale**:

- Page Title (h1): 3xl (1.875rem), bold
- Widget Title: lg (1.125rem), semibold
- Card Value: 2xl (1.5rem), bold
- Body Text: sm (0.875rem), medium
- Descriptions: xs (0.75rem), normal

### 7.2 Color Palette

**Backgrounds**:

- Page: `bg-gradient-to-br from-slate-50 to-blue-50/30`
- Cards: `bg-white` or gradient variants
- Hover: Intensified shadows

**Status Colors**:

- Active/Primary: Blue (`text-blue-600`)
- Completed: Emerald (`text-emerald-600`)
- Urgent/Error: Red (`text-red-600`)
- Warning/Waiting: Amber (`text-amber-600`)
- Projects: Purple (`text-purple-600`)

### 7.3 Spacing

**Container**: `max-w-7xl mx-auto`  
**Page Padding**: `p-6`  
**Card Padding**: `p-6`  
**Widget Gaps**: `space-y-8` (vertical), `gap-4/gap-8` (grid)

### 7.4 Shadows & Effects

**Card Shadows**:

- Default: `shadow-sm`
- Hover: `shadow-md`
- Emphasized: `shadow-lg`

**Transitions**:

- Shadow: `transition-shadow duration-300`
- Colors: `transition-colors`
- General: `transition-all`

**Borders**:

- Accent borders: `border-l-4` (left-side indicators)
- Card borders: `border border-slate-100` or `border-none`

---

## 8. Interaction Patterns

### 8.1 Navigation

**From Dashboard to Detail**:

- Click external link icon → Navigate to `/edit/{itemId}`
- All interactive elements have hover states
- Links use Next.js `<Link>` component for client-side navigation

**Sidebar Integration**:

- First menu item should be "Dashboard" (not "Backlog")
- Active state when pathname === '/dashboard'
- Icon: LayoutDashboard

### 8.2 Real-time Updates

**Auto-refresh**:

- Score recalculation: Every 5 seconds
- Keeps dashboard fresh as deadlines approach
- No manual refresh needed

**Data Mutations**:

- Items added/updated/deleted reflect immediately
- Optimistic UI updates for better UX

---

## 9. Accessibility

### 9.1 Semantic HTML

- Use proper heading hierarchy (h1 → h2)
- ARIA labels for icon-only buttons
- Semantic `<main>` tag for content area

### 9.2 Keyboard Navigation

- All interactive elements are keyboard accessible
- Focus states clearly visible
- Tab order follows logical flow

### 9.3 Screen Readers

- Descriptive alt text for icons (via aria-label)
- Status messages announced
- Loading states communicated

---

## 10. Navigation Routing Changes

### 10.1 Current vs. Target

**Current** (src/components/app/app-sidebar.tsx):

```typescript
{
  title: 'Backlog',
  href: '/dashboard',
  icon: LayoutDashboard,
  tooltip: 'Backlog'
}
```

**Target**:

```typescript
{
  title: 'Dashboard',
  href: '/dashboard',
  icon: LayoutDashboard,
  tooltip: 'Dashboard - Visão Geral'
}
```

### 10.2 Login Flow

**Current**: User logs in → Redirects to `/dashboard` (labeled as "Backlog")

**Target**: User logs in → Redirects to `/dashboard` (labeled as "Dashboard")

**No Code Changes Needed**: The route remains `/dashboard`, only the sidebar label changes.

---

## 11. Performance Considerations

### 11.1 Optimization Strategies

**Data Fetching**:

- Single query fetches all items
- Client-side filtering and sorting
- Debounced score recalculation

**Rendering**:

- Memoize expensive calculations
- Lazy load charts/visualizations if added later
- Virtual scrolling for large lists (future enhancement)

**Bundle Size**:

- Tree-shaking for unused components
- Lucide React icons imported individually
- Date-fns functions imported specifically

### 11.2 Loading States

- Skeleton screens for better perceived performance
- Graceful degradation if data fails to load
- Error boundaries for fault tolerance

---

## 12. Future Enhancements (Out of Scope)

### 12.1 Phase 2 Features

1. **Charts & Visualizations**

   - Score trend over time (line chart)
   - Category distribution (pie chart)
   - Burndown chart for projects

2. **Customization**

   - Widget reordering (drag-and-drop)
   - Show/hide widgets
   - Custom metric thresholds

3. **Filters & Drill-downs**

   - Date range selector
   - Category filters
   - Quick filters (This Week, This Month)

4. **Notifications**
   - Overdue tasks alert
   - High urgency notifications
   - Daily digest email

### 12.2 Analytics Integration

- Track widget interaction
- Monitor most-used features
- A/B test widget layouts

---

## 13. Testing Strategy

### 13.1 Unit Tests

- Score calculation logic
- Data filtering functions
- Date/time utilities

### 13.2 Integration Tests

- Data fetching flows
- Real-time update mechanisms
- Navigation routing

### 13.3 E2E Tests

- Full user journey: Login → Dashboard
- Widget interactions
- Responsive behavior

### 13.4 Visual Regression

- Screenshot comparison across viewports
- Theme consistency checks

---

## 14. Documentation

### 14.1 Code Comments

- JSDoc for complex functions
- Inline comments for business logic
- TypeScript types for self-documentation

### 14.2 User Guide

- Dashboard overview video/tutorial
- Widget explanations
- GUT methodology primer

---

## 15. Acceptance Criteria

### ✅ Functionality

- [ ] Dashboard loads without errors
- [ ] All 5 widgets display correct data
- [ ] Scoring metrics calculate accurately
- [ ] Urgency panel shows top 3 urgent items
- [ ] Task ranking shows top 5 tasks by score
- [ ] Daily focus shows today's tasks
- [ ] External status shows waiting items
- [ ] Real-time score updates every 5 seconds
- [ ] Navigation to edit pages works
- [ ] Empty states display correctly

### ✅ Design

- [ ] Matches existing portal design system
- [ ] Colors follow globals.css tokens
- [ ] Typography is consistent
- [ ] Spacing follows 8px grid
- [ ] Hover states work on interactive elements
- [ ] Responsive on mobile, tablet, desktop
- [ ] Visual hierarchy is clear
- [ ] Icons are appropriate and consistent

### ✅ Performance

- [ ] Initial load < 2 seconds
- [ ] No layout shift on data load
- [ ] Smooth transitions and animations
- [ ] No memory leaks on long sessions

### ✅ Accessibility

- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] WCAG AA color contrast met
- [ ] Focus indicators visible

---

## 16. Implementation Plan

### Phase 1: Sidebar Update ✅ (Already Complete)

The dashboard content is already implemented. Only the sidebar label needs updating.

**File**: `src/components/app/app-sidebar.tsx`

**Change Required**:

```diff
  {
-   title: 'Backlog',
+   title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
-   tooltip: 'Backlog'
+   tooltip: 'Dashboard - Visão Geral'
  }
```

### Phase 2: Documentation ✅ (This Document)

Comprehensive design specification created.

### Phase 3: User Testing (Recommended)

- Gather feedback on widget usefulness
- Validate information hierarchy
- Iterate based on user needs

---

## 17. Component Code Reference

### 17.1 Current Implementation Status

✅ **FULLY IMPLEMENTED** in `src/components/app/dashboard-content.tsx`

All 5 required widgets are complete and functional:

1. ✅ Scoring Metrics (4 cards)
2. ✅ Urgency Panel
3. ✅ Task Ranking
4. ✅ Daily Focus
5. ✅ External Status

### 17.2 Key Code Sections

**Header Section** (Lines 89-105):

- Page title with icon
- Date display (Portuguese locale)
- Active items count

**Scoring Metrics** (Lines 108-152):

- 4 responsive cards
- Left border color coding
- Icon + value + subtitle pattern

**Urgency Panel** (Lines 161-209):

- Gradient background (white → red-50)
- Top 3 urgent items
- Urgency score circles
- Click-to-edit links

**Task Ranking** (Lines 212-249):

- Top 5 tasks by score
- Rank numbers (#1-#5)
- Color-coded score badges
- Hover effects

**Daily Focus** (Lines 257-301):

- Emerald gradient
- Checkbox UI (disabled)
- Time display
- Empty state with celebration

**External Status** (Lines 304-338):

- Waiting items list
- Amber dot indicator
- Details display
- Edit links

---

## 18. Cross-Module Integration

### 18.1 Data Sources Mapping

| Dashboard Widget | Source Module(s)             | Filter/Logic                                  |
| ---------------- | ---------------------------- | --------------------------------------------- |
| Impacto Total    | All modules                  | `status !== 'done'`                           |
| Concluídos       | All modules                  | `status === 'done'`                           |
| Projetos Ativos  | Backlog, Kanban, In Progress | `category === 'project' && status !== 'done'` |
| Aguardando       | Demands                      | `status === 'waiting'`                        |
| Urgency Panel    | All modules                  | Sort by urgency, then score                   |
| Task Ranking     | Backlog, Demands             | `category === 'task'`, sort by score          |
| Daily Focus      | Calendar, Backlog            | Deadline today OR start date today/past       |

### 18.2 Unified Data Model

All modules share the same `BacklogItem` data structure, ensuring:

- Consistent filtering across modules
- Unified scoring logic
- Seamless data aggregation

---

## 19. Branding Consistency

### 19.1 Portal Identity

**Name**: FlowZenit  
**Tagline**: "Transforme Caos em Produtividade"  
**Color Scheme**: Blue/Teal primary (`#7EC4CF`, `#66A5AD`)

### 19.2 Dashboard Alignment

The dashboard design aligns with:

- Landing page aesthetic (page.tsx)
- Sidebar navigation style
- Global CSS design tokens
- Overall portal UX patterns

---

## 20. Security & Privacy

### 20.1 Data Isolation

- All queries filtered by `user_id`
- Row-level security (RLS) in Supabase
- No cross-user data leakage

### 20.2 Authentication

- Protected route via `<ProtectedRoute>` wrapper
- Auto-logout on auth errors
- Secure token handling

---

## 21. Conclusion

### 21.1 Summary

The Dashboard is **fully implemented** and meets all specified requirements:

✅ **5 Required Widgets**: All present and functional  
✅ **8 Data Sources**: Integrated via unified data model  
✅ **Design Consistency**: Matches existing portal design system  
✅ **Responsive**: Works on all screen sizes  
✅ **Performance**: Optimized with real-time updates

### 21.2 Only Required Change

**Update Sidebar Label**: Change "Backlog" to "Dashboard" in `app-sidebar.tsx`

This single change will complete the transition from the current state to the target state.

---

## 22. References

### 22.1 Internal Files

- `src/app/dashboard/page.tsx` - Route definition
- `src/components/app/dashboard-content.tsx` - Main implementation
- `src/components/app/app-sidebar.tsx` - Navigation menu
- `src/hooks/use-supabase-demands.ts` - Data fetching logic
- `src/lib/types.ts` - TypeScript type definitions
- `src/app/globals.css` - Design tokens

### 22.2 External Resources

- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [date-fns](https://date-fns.org/)
- [Lucide Icons](https://lucide.dev/)
- [Next.js App Router](https://nextjs.org/docs/app)

---

## Appendix A: Widget Visual Mockups

### A.1 Scoring Metrics Card Design

```
┌─────────────────────────────────┐
│ ║                                │  ← 4px colored left border
│ ║  Impacto Total      [Icon]     │
│ ║                                │
│ ║  1,245                         │  ← Large, bold number
│ ║                                │
│ ║  Soma dos scores GUT ativos    │  ← Small subtitle
│ ║                                │
└─────────────────────────────────┘
```

### A.2 Urgency Panel Item Design

```
┌───────────────────────────────────────────────┐
│  ┌──┐                                   ┌─┐   │
│  │10│  Complete high-priority task      │→│   │
│  └──┘                                   └─┘   │
│       GUT: 850 • 📅 25/11                     │
└───────────────────────────────────────────────┘
```

### A.3 Responsive Layout

**Mobile View**:

```
┌──────────────┐
│ Metric Card 1│
├──────────────┤
│ Metric Card 2│
├──────────────┤
│ Metric Card 3│
├──────────────┤
│ Metric Card 4│
├──────────────┤
│Urgency Panel │
├──────────────┤
│ Task Ranking │
├──────────────┤
│ Daily Focus  │
├──────────────┤
│External Stat │
└──────────────┘
```

**Desktop View**:

```
┌────────┬────────┬────────┬────────┐
│Metric 1│Metric 2│Metric 3│Metric 4│
├─────────────────┬────────────────┤
│                 │                │
│ Urgency Panel   │  Daily Focus   │
│                 │                │
├─────────────────┼────────────────┤
│                 │                │
│  Task Ranking   │ External Stat  │
│                 │                │
└─────────────────┴────────────────┘
```

---

**End of Document**

_This specification provides a complete design and implementation guide for the FlowZenit Dashboard. The system is already fully implemented and operational. Only a sidebar label update is needed to complete the transition to using Dashboard as the default landing page._

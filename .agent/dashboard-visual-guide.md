# Dashboard Visual Guide

**FlowZenit Portal - Quick Reference**

---

## 🎯 Overview

This visual guide provides a quick reference for the Dashboard design and UX patterns.

---

## 📊 Dashboard Layout Preview

![Dashboard Layout](../../../.gemini/antigravity/brain/7e674198-64ca-4245-9faa-7254513494b2/dashboard_layout_mockup_1763569115751.png)

_The dashboard features a clean, modern interface with 5 main widget areas organized for optimal information hierarchy._

---

## 🎨 Widget Color Coding

### Primary Color Associations

| Color          | Usage                          | Hex Approximation |
| -------------- | ------------------------------ | ----------------- |
| 🔵 **Blue**    | Primary actions, main metrics  | `#4169E1`         |
| 🟢 **Emerald** | Completed items, today's focus | `#10B981`         |
| 🔴 **Red**     | Urgent items, critical alerts  | `#EF4444`         |
| 🟡 **Amber**   | Waiting states, warnings       | `#F59E0B`         |
| 🟣 **Purple**  | Projects, special categories   | `#8B5CF6`         |

---

## 📐 Layout Specifications

### Desktop Layout (≥1024px)

```
┌─────────────────────────────────────────────────────┐
│ 📊 SCORING METRICS (4 columns)                      │
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐              │
│ │Blue  │ │Green │ │Purple│ │Amber │              │
│ └──────┘ └──────┘ └──────┘ └──────┘              │
├─────────────────────────────────────────────────────┤
│ MAIN CONTENT (3-column grid)                        │
│ ┌────────────────────┬───────────────────┐        │
│ │ LEFT (span 2)      │ RIGHT (span 1)    │        │
│ ├────────────────────┤                   │        │
│ │ 🚨 URGENCY PANEL  │ ⚡ DAILY FOCUS   │        │
│ │ (Red gradient)     │ (Emerald top)     │        │
│ │                    │                   │        │
│ ├────────────────────┼───────────────────┤        │
│ │ 📈 TASK RANKING   │ 🏁 EXTERNAL      │        │
│ │ (Blue theme)       │    STATUS         │        │
│ │                    │ (Amber theme)     │        │
│ └────────────────────┴───────────────────┘        │
└─────────────────────────────────────────────────────┘
```

### Mobile Layout (<768px)

All widgets stack vertically:

1. Scoring Metrics (1 column)
2. Urgency Panel
3. Task Ranking
4. Daily Focus
5. External Status

---

## 🔢 Widget Details

### 1️⃣ Scoring Metrics

**4 KPI Cards**:

```
┌─────────────────────┐
│ ║ Impacto Total 📊  │
│ ║                   │
│ ║ 1,245             │ ← Big number
│ ║ Soma GUT ativos   │ ← Subtitle
└─────────────────────┘
```

**Features**:

- Left color border (4px)
- Icon in header
- Large numeric value
- Small explanatory text

---

### 2️⃣ Urgency Panel

**Top 3 Most Urgent Items**:

```
┌────────────────────────────────────┐
│ 🚨 Maior Urgência                  │
│ Itens que requerem atenção ime...  │
├────────────────────────────────────┤
│ [⓾] Task Name            [→]      │
│     GUT: 850 • 📅 25/11            │
├────────────────────────────────────┤
│ [⓽] Another Task         [→]      │
│     GUT: 620 • 📅 26/11            │
├────────────────────────────────────┤
│ [⓼] Third Task           [→]      │
│     GUT: 480 • 📅 27/11            │
└────────────────────────────────────┘
```

**Sort Priority**:

1. Urgency score (10 = highest)
2. GUT score (secondary)

---

### 3️⃣ Task Ranking

**Top 5 Tasks by Priority**:

```
┌────────────────────────────────────┐
│ 📈 Ranking de Prioridade           │
│ Top tarefas baseadas no score GUT  │
├────────────────────────────────────┤
│ #1  High priority task      [●850] │
│ #2  Important project       [●620] │
│ #3  Client deliverable      [●480] │
│ #4  Documentation update    [●320] │
│ #5  Code review             [●180] │
└────────────────────────────────────┘
```

**Score Color Coding**:

- 🔴 Red background: > 500
- 🟡 Amber background: 200-500
- 🟢 Emerald background: < 200

---

### 4️⃣ Daily Focus

**Tasks for Today**:

```
┌────────────────────────────────────┐
│ ⚡ Foco do Dia                     │
│ Tarefas para hoje                  │
├────────────────────────────────────┤
│ ☐ Complete project report          │
│   [task] 14:30                     │
├────────────────────────────────────┤
│ ☐ Review pull requests             │
│   [project] 16:00                  │
├────────────────────────────────────┤
│ ☐ Client meeting                   │
│   [task] 15:00                     │
└────────────────────────────────────┘
```

**Empty State**:

```
┌────────────────────────────────┐
│      [✓]                       │
│  Tudo limpo por hoje!          │
│  Aproveite para adiantar o     │
│  backlog.                      │
└────────────────────────────────┘
```

---

### 5️⃣ External Status

**Awaiting Response**:

```
┌────────────────────────────────────┐
│ 🏁 Aguardando                      │
│ Pendências externas                │
├────────────────────────────────────┤
│ • Approval from stakeholder  [→]   │
│   Waiting for budget confirm...    │
├────────────────────────────────────┤
│ • Client feedback on design  [→]   │
│   Sent on 2025-11-15               │
└────────────────────────────────────┘
```

**Features**:

- Amber dot indicator (•)
- Item name (bold)
- Details or "Sem detalhes" (gray)
- Link to edit page

---

## 🎭 Interaction Patterns

### Hover States

#### Cards

```
Normal:  shadow-sm
Hover:   shadow-md (intensified)
```

#### List Items

```
Normal:  transparent background
Hover:   slate-50 background
```

#### Buttons/Links

```
Normal:  slate-400 color
Hover:   blue-600 color
```

---

## 📱 Responsive Behavior

### Breakpoints

| Device  | Width      | Metrics Grid | Main Layout |
| ------- | ---------- | ------------ | ----------- |
| Mobile  | <768px     | 1 column     | Stacked     |
| Tablet  | 768-1023px | 2 columns    | Stacked     |
| Desktop | ≥1024px    | 4 columns    | 3-column    |

### Hide/Show Elements

**Hidden on Mobile**:

- Header date/time display
- Some widget subtitles (if space constrained)

**Always Visible**:

- All 5 widgets
- Core metrics
- Navigation elements

---

## 🧭 Navigation Flow

### User Journey

```
1. Login
   ↓
2. Redirect to /dashboard
   ↓
3. Dashboard loads with 5 widgets
   ↓
4. User clicks [→] icon on any item
   ↓
5. Navigate to /edit/{itemId}
   ↓
6. Edit item details
   ↓
7. Return to dashboard (updated data)
```

### Sidebar Menu

**First Item** (Updated):

```
┌─────────────────────┐
│ ⚡ Dashboard        │ ← Active state
├─────────────────────┤
│   Kanban            │
│   Em Andamento      │
│   Demandas          │
│   Referências       │
│   Follow-up         │
│   Documentação      │
│   Calendário        │
└─────────────────────┘
```

---

## 🎯 Widget Priority Matrix

### Information Hierarchy

**Level 1 (Immediate Attention)**:

- Urgency Panel
- Daily Focus

**Level 2 (Strategic Planning)**:

- Task Ranking
- External Status

**Level 3 (High-level Overview)**:

- Scoring Metrics

### Visual Weight

```
Largest:   Urgency Panel (left 2/3)
Medium:    Task Ranking (left 2/3)
Smaller:   Daily Focus, External Status (right 1/3)
Smallest:  Scoring Metrics (compact cards)
```

---

## 🔧 Technical Implementation Notes

### Component Hierarchy

```
<AppLayout>
  <DashboardContent>
    <Header />
    <ScoringMetrics />
    <MainGrid>
      <LeftColumn>
        <UrgencyPanel />
        <TaskRanking />
      </LeftColumn>
      <RightColumn>
        <DailyFocus />
        <ExternalStatus />
      </RightColumn>
    </MainGrid>
  </DashboardContent>
</AppLayout>
```

### Key Classes

**Layout**:

- Container: `max-w-7xl mx-auto`
- Grid: `grid grid-cols-1 lg:grid-cols-3 gap-8`
- Left Column: `lg:col-span-2`

**Cards**:

- Base: `Card` component from shadcn/ui
- Variants: Custom gradients with className overrides

**Typography**:

- Page Title: `text-3xl font-bold`
- Widget Title: `text-lg font-semibold`
- Metric Value: `text-2xl font-bold`

---

## 🌈 Design System Tokens

### CSS Custom Properties (from globals.css)

```css
--primary: hsl(221 83% 53%)        /* Blue */
--primary-foreground: hsl(210 40% 98%)
--secondary: hsl(210 40% 96.1%)    /* Light Gray */
--muted: hsl(210 40% 96.1%)
--accent: hsl(217.2 32.6% 17.5%)   /* Dark Blue */
--destructive: hsl(0 84.2% 60.2%)  /* Red */
--border: hsl(214.3 31.8% 91.4%)
--radius: 0.5rem                    /* 8px */
```

### Custom Category Colors

```css
--task: hsl(206 100% 50%)       /* Cyan Blue */
--project: hsl(286 67% 50%)     /* Purple */
--future: hsl(160 70% 45%)      /* Teal */
--reference: hsl(45 90% 55%)    /* Yellow */
```

---

## ⚡ Performance Tips

### Optimization Strategies

1. **Memoization**

   - Memoize expensive calculations (score sorting)
   - Use React.memo for pure components

2. **Efficient Rendering**

   - Limit list items (top 3, top 5)
   - Virtual scrolling for large datasets (future)

3. **Data Fetching**

   - Single query for all data
   - Client-side filtering
   - Real-time updates via interval (5s)

4. **Bundle Size**
   - Tree-shake unused icons
   - Code-split heavy visualizations

---

## 🧪 Testing Scenarios

### Visual Regression Tests

1. **Empty States**

   - No urgent items
   - No tasks today
   - No waiting items

2. **Data Variations**

   - 0-3 items in Urgency Panel
   - 0-5 items in Task Ranking
   - 0-many items in Daily Focus

3. **Responsive Views**
   - Mobile portrait (375px)
   - Tablet (768px)
   - Desktop (1440px)

### Interaction Tests

1. Click external link → Navigate to /edit/{id}
2. Hover card → Shadow intensifies
3. Hover task → Background changes
4. Real-time update → Scores recalculate

---

## 📚 Quick Reference Icons

### Lucide React Icons Used

| Icon              | Widget                       | Purpose                   |
| ----------------- | ---------------------------- | ------------------------- |
| `LayoutDashboard` | Header, Sidebar              | Main dashboard identifier |
| `Activity`        | Scoring Metrics              | Total impact metric       |
| `CheckCircle2`    | Scoring Metrics, Empty State | Completed items           |
| `Target`          | Scoring Metrics              | Active projects           |
| `Clock`           | Scoring Metrics              | Waiting items             |
| `AltertCircle`    | Urgency Panel                | Urgent indicator          |
| `TrendingUp`      | Task Ranking                 | Priority/ranking          |
| `Zap`             | Daily Focus                  | Energy/focus              |
| `Flag`            | External Status              | Milestone/waiting flag    |
| `Calendar`        | Item details                 | Deadline indicator        |
| `ExternalLink`    | Links                        | Navigate to edit          |

---

## 🎓 User Education

### Tooltips & Help Text

**Scoring Metrics**:

- "Soma dos scores GUT ativos"
- "Itens finalizados"
- "Em andamento"
- "Dependências externas"

**Widget Headers**:

- "Itens que requerem atenção imediata"
- "Top tarefas baseadas no score GUT"
- "Tarefas para hoje"
- "Pendências externas"

### Onboarding Recommendations

1. **Dashboard Tour**: Guided walkthrough on first login
2. **Widget Tooltips**: Hover explanations for each section
3. **GUT Methodology**: Link to documentation explaining scoring
4. **Video Tutorial**: Quick 2-min dashboard overview

---

## 🔄 Data Update Frequency

### Real-time Elements

| Element         | Update Frequency | Trigger                   |
| --------------- | ---------------- | ------------------------- |
| **Scores**      | Every 5 seconds  | Auto-refresh interval     |
| **Item Status** | Immediate        | User mutation             |
| **Filters**     | Immediate        | Client-side recalculation |
| **Date/Time**   | On page load     | Static display            |

### Performance Impact

- **Minimal**: Client-side score recalculation
- **No API calls**: Updates use existing data
- **Optimized**: Only affected items re-render

---

## 📋 Accessibility Checklist

### WCAG AA Compliance

✅ **Color Contrast**

- All text meets 4.5:1 ratio
- Interactive elements meet 3:1 ratio

✅ **Keyboard Navigation**

- Tab order is logical
- All links/buttons accessible
- Focus indicators visible

✅ **Screen Readers**

- Semantic HTML (main, article, section)
- ARIA labels on icon buttons
- Status updates announced

✅ **Responsive Text**

- Text scales with viewport
- No horizontal scrolling
- Touch targets ≥44px

---

## 🎨 Design Inspiration

### Similar Dashboards

The FlowZenit dashboard draws inspiration from:

- **Notion**: Clean card-based layouts
- **Linear**: Minimalist priority indicators
- **Asana**: Color-coded status system
- **Monday.com**: Visual hierarchy with metrics

### Unique Features

❌ **What We Don't Do**:

- No cluttered charts
- No overwhelming data density
- No complex navigation

✅ **What We Do Better**:

- Focus on actionable items
- Clear priority indicators
- GUT methodology integration
- Real-time score updates

---

## 🚀 Future Enhancement Ideas

### Phase 2 Widgets (Not in Scope)

1. **Velocity Chart**

   - Tasks completed per week
   - Trend line showing productivity

2. **Category Distribution**

   - Pie chart: Tasks vs Projects vs References
   - Click to filter

3. **Burndown Chart**

   - Project progress over time
   - Estimate completion date

4. **Team Activity**

   - Recent item changes
   - Collaboration indicators

5. **Smart Suggestions**
   - AI-powered task recommendations
   - Optimal scheduling suggestions

### Customization Options

- Drag-and-drop widget reordering
- Show/hide specific widgets
- Custom date ranges
- Saved filter presets
- Export dashboard to PDF

---

## 📞 Support & Resources

### Getting Help

- **Technical Docs**: `/documentation`
- **Video Tutorials**: YouTube channel
- **Community**: GitHub Discussions
- **Bug Reports**: GitHub Issues

### Contributing

The dashboard is part of the FlowZenit open-source project:

- **Repository**: GitHub (link in portal)
- **License**: MIT
- **Contributions**: Welcome!

---

**Last Updated**: 2025-11-19  
**Version**: 1.0  
**Author**: Senior Product Designer & Frontend Architect

---

_This visual guide complements the comprehensive technical specification document. Use both together for complete dashboard understanding._

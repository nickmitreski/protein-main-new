# Design System Quick Reference

## 🎨 Colors

```typescript
// Brand
colors.primary.main          // #E63946 (Red)
colors.secondary.main        // #1D3557 (Navy)
colors.accent.main           // #F77F00 (Orange)

// Neutrals
colors.neutral.black         // #0A0A0A
colors.neutral[900]         // #212121
colors.neutral[700]         // #616161
colors.neutral[500]         // #9E9E9E
colors.neutral[300]         // #E0E0E0
colors.neutral[100]         // #F5F5F5

// Semantic
colors.text.primary         // #0A0A0A
colors.text.secondary       // #616161
colors.background.primary   // #FFFFFF
colors.border.light         // #EEEEEE
```

## 📏 Spacing

```typescript
spacing[2]    // 0.5rem  (8px)
spacing[4]    // 1rem    (16px)
spacing[6]    // 1.5rem  (24px)
spacing[8]    // 2rem    (32px)
spacing[12]   // 3rem    (48px)

// Semantic
spacing.xs    // 8px
spacing.sm    // 16px
spacing.md    // 24px
spacing.lg    // 32px
spacing.xl    // 48px
```

## ✍️ Typography

```typescript
typography.h1        // 72px, bold
typography.h2        // 48px, bold
typography.h3        // 36px, semibold
typography.body      // 16px, normal
typography.bodySmall // 14px, normal
typography.caption   // 12px, uppercase

// Font Weights
fontWeight.normal    // 400
fontWeight.medium    // 500
fontWeight.semibold  // 600
fontWeight.bold      // 700
```

## 🧩 Components

### Button
```tsx
<Button variant="primary" size="md">Text</Button>
// variants: primary, secondary, outline, ghost, accent
// sizes: sm, md, lg
```

### Card
```tsx
<Card title="Title" padding="md" hover>Content</Card>
// padding: sm, md, lg
```

### Input
```tsx
<Input label="Email" error="Required" fullWidth />
```

### Select
```tsx
<Select
  label="Country"
  options={[{ value: 'us', label: 'USA' }]}
  fullWidth
/>
```

### Badge
```tsx
<Badge variant="primary">New</Badge>
// variants: default, primary, success, warning, error, info
```

### Modal
```tsx
<Modal isOpen={true} onClose={fn} title="Title" size="md">
  Content
</Modal>
// sizes: sm, md, lg, xl
```

## 🔘 Border Radius

```typescript
borderRadius.sm    // 4px
borderRadius.base  // 8px
borderRadius.lg    // 16px
borderRadius.full  // 9999px (pills)
```

## 🌟 Shadows

```typescript
shadows.sm    // Subtle
shadows.base  // Default
shadows.md    // Medium
shadows.lg    // Large
shadows.xl    // Extra large
```

## ⚡ Transitions

```typescript
transitions.default   // all 300ms ease-in-out
transitions.fast      // all 150ms ease-in-out
transitions.slow      // all 500ms ease-in-out
```

## 🛠️ Helpers

```typescript
cn('class1', isActive && 'class2')  // Combine classes

createStyle({                       // Tokens → inline styles
  fontSize: typography.fontSize.lg,
  color: colors.text.primary,
})
```

## 📐 Layout

```typescript
layout.container  // Max-width container
layout.section    // Section with vertical padding
layout.grid.grid2 // 2-column responsive grid
layout.grid.grid3 // 3-column responsive grid
layout.grid.grid4 // 4-column responsive grid
```

---

**File**: `/src/design-system.ts`

**Full Docs**: `DESIGN_SYSTEM.md`

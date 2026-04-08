# CoreForge Design System

**Premium supplement brand - Clean, minimal, slightly luxurious**

## Overview

This design system provides a unified, consistent approach to building UI across the CoreForge ecommerce platform. It eliminates inline Tailwind inconsistencies and provides a single source of truth for all design decisions.

---

## 🎨 Color Tokens

### Brand Colors

```typescript
colors.primary.main      // #E63946 - CoreForge Red (Bold, energetic)
colors.primary.dark      // #C1121F - Darker red for hovers
colors.primary.light     // #F25C66 - Lighter red for accents
colors.primary.contrast  // #FFFFFF - White text on primary

colors.secondary.main      // #1D3557 - Deep navy (Professional, trustworthy)
colors.secondary.dark      // #0D1B2A - Darker navy
colors.secondary.light     // #2E4A6B - Lighter navy
colors.secondary.contrast  // #FFFFFF - White text on secondary

colors.accent.main      // #F77F00 - Vibrant orange (Energy, CTA)
colors.accent.dark      // #D66D00 - Darker orange
colors.accent.light     // #FF9E1B - Lighter orange
colors.accent.contrast  // #FFFFFF - White text on accent
```

### Semantic Colors

```typescript
colors.success.main  // #2A9D8F - Teal green
colors.warning.main  // #F4A261 - Warm orange
colors.error.main    // #E63946 - Red
colors.info.main     // #457B9D - Blue
```

### Neutral Colors (Premium Grayscale)

```typescript
colors.neutral[50]   // #FAFAFA - Lightest background
colors.neutral[100]  // #F5F5F5 - Light background
colors.neutral[200]  // #EEEEEE - Borders, dividers
colors.neutral[300]  // #E0E0E0 - Disabled backgrounds
colors.neutral[400]  // #BDBDBD - Disabled text
colors.neutral[500]  // #9E9E9E - Muted text
colors.neutral[600]  // #757575 - Secondary text
colors.neutral[700]  // #616161 - Body text
colors.neutral[800]  // #424242 - Headings
colors.neutral[900]  // #212121 - Primary text
colors.neutral.black // #0A0A0A - True black
```

### Usage

```typescript
// Background colors
colors.background.primary      // #FFFFFF
colors.background.secondary    // #FAFAFA
colors.background.tertiary     // #F5F5F5
colors.background.dark         // #0A0A0A
colors.background.darkSecondary // #1C1C1C

// Text colors
colors.text.primary    // #0A0A0A
colors.text.secondary  // #616161
colors.text.tertiary   // #9E9E9E
colors.text.disabled   // #BDBDBD
colors.text.inverse    // #FFFFFF

// Border colors
colors.border.light  // #EEEEEE
colors.border.main   // #E0E0E0
colors.border.dark   // #BDBDBD
colors.border.focus  // #E63946
```

---

## 📏 Spacing Tokens

### Scale (4px base unit)

```typescript
spacing[0]   // 0
spacing[1]   // 0.25rem (4px)
spacing[2]   // 0.5rem  (8px)
spacing[3]   // 0.75rem (12px)
spacing[4]   // 1rem    (16px)
spacing[5]   // 1.25rem (20px)
spacing[6]   // 1.5rem  (24px)
spacing[8]   // 2rem    (32px)
spacing[10]  // 2.5rem  (40px)
spacing[12]  // 3rem    (48px)
spacing[16]  // 4rem    (64px)
spacing[20]  // 5rem    (80px)
spacing[24]  // 6rem    (96px)
spacing[32]  // 8rem    (128px)
```

### Semantic Spacing

```typescript
spacing.xs   // 0.5rem  (8px)
spacing.sm   // 1rem    (16px)
spacing.md   // 1.5rem  (24px)
spacing.lg   // 2rem    (32px)
spacing.xl   // 3rem    (48px)
spacing['2xl'] // 4rem  (64px)
spacing['3xl'] // 6rem  (96px)
```

### Component-Specific

```typescript
// Sections
spacing.section.y       // 8rem  (128px) - Vertical section padding
spacing.section.ySmall  // 5rem  (80px)  - Small section padding
spacing.section.yLarge  // 10rem (160px) - Large section padding

// Container
spacing.container.x        // 2rem  (32px)  - Horizontal padding
spacing.container.maxWidth // 80rem (1280px) - Max container width

// Cards
spacing.card.padding      // 2rem    (32px)
spacing.card.paddingSmall // 1.5rem  (24px)
spacing.card.gap          // 1.5rem  (24px)
```

---

## ✍️ Typography Tokens

### Font Families

```typescript
typography.fontFamily.sans  // System font stack
typography.fontFamily.mono  // Monospace font stack
```

### Font Sizes

```typescript
typography.fontSize.xs    // 0.75rem  (12px)
typography.fontSize.sm    // 0.875rem (14px)
typography.fontSize.base  // 1rem     (16px)
typography.fontSize.lg    // 1.125rem (18px)
typography.fontSize.xl    // 1.25rem  (20px)
typography.fontSize['2xl'] // 1.5rem   (24px)
typography.fontSize['3xl'] // 1.875rem (30px)
typography.fontSize['4xl'] // 2.25rem  (36px)
typography.fontSize['5xl'] // 3rem     (48px)
typography.fontSize['6xl'] // 3.75rem  (60px)
typography.fontSize['7xl'] // 4.5rem   (72px)
```

### Heading Styles

```typescript
// Pre-configured heading styles
typography.h1  // 72px, bold, tight line-height
typography.h2  // 48px, bold, tight line-height
typography.h3  // 36px, semibold
typography.h4  // 24px, semibold
typography.h5  // 20px, semibold
typography.h6  // 16px, semibold, wide letter-spacing
```

### Body Styles

```typescript
typography.body        // 16px, normal weight
typography.bodyLarge   // 18px, normal weight
typography.bodySmall   // 14px, normal weight
```

### Labels & Captions

```typescript
typography.caption  // 12px, medium weight, uppercase, wide letter-spacing
typography.label    // 14px, medium weight
```

### Font Weights

```typescript
typography.fontWeight.normal    // 400
typography.fontWeight.medium    // 500
typography.fontWeight.semibold  // 600
typography.fontWeight.bold      // 700
typography.fontWeight.extrabold // 800
```

### Letter Spacing

```typescript
typography.letterSpacing.tighter  // -0.05em
typography.letterSpacing.tight    // -0.025em
typography.letterSpacing.normal   // 0
typography.letterSpacing.wide     // 0.025em
typography.letterSpacing.wider    // 0.05em
typography.letterSpacing.widest   // 0.1em
```

---

## 🔘 Border Radius Tokens

```typescript
borderRadius.none  // 0
borderRadius.sm    // 0.25rem (4px)
borderRadius.base  // 0.5rem  (8px)
borderRadius.md    // 0.75rem (12px)
borderRadius.lg    // 1rem    (16px)
borderRadius.xl    // 1.5rem  (24px)
borderRadius.full  // 9999px  (Pills/circles)
```

---

## 🌟 Shadow Tokens

```typescript
shadows.none  // No shadow
shadows.sm    // Subtle shadow
shadows.base  // Default shadow
shadows.md    // Medium shadow
shadows.lg    // Large shadow
shadows.xl    // Extra large shadow
shadows['2xl'] // 2X large shadow
shadows.inner // Inner shadow
```

---

## ⚡ Transition Tokens

```typescript
// Durations
transitions.duration.fast    // 150ms
transitions.duration.normal  // 300ms
transitions.duration.slow    // 500ms

// Timing functions
transitions.timing.linear    // linear
transitions.timing.ease      // ease
transitions.timing.easeIn    // ease-in
transitions.timing.easeOut   // ease-out
transitions.timing.easeInOut // ease-in-out

// Preset transitions
transitions.default   // all 300ms ease-in-out
transitions.fast      // all 150ms ease-in-out
transitions.slow      // all 500ms ease-in-out
transitions.colors    // color, bg-color, border-color transitions
transitions.transform // transform 300ms
transitions.opacity   // opacity 300ms
```

---

## 📦 Z-Index Scale

```typescript
zIndex.base          // 0
zIndex.dropdown      // 1000
zIndex.sticky        // 1100
zIndex.fixed         // 1200
zIndex.modalBackdrop // 1300
zIndex.modal         // 1400
zIndex.popover       // 1500
zIndex.tooltip       // 1600
```

---

## 🧩 Component Library

### Button

**Variants**: `primary`, `secondary`, `outline`, `ghost`, `accent`

**Sizes**: `sm`, `md`, `lg`

**Usage**:
```tsx
import { Button } from './components/ui/Button';

<Button variant="primary" size="md">
  Click Me
</Button>

<Button variant="outline" size="lg" fullWidth>
  Full Width Button
</Button>

<Button variant="accent" isLoading>
  Loading...
</Button>
```

**Props**:
- `variant`: Button style variant
- `size`: Button size
- `fullWidth`: Stretch to full width
- `isLoading`: Show loading spinner
- `disabled`: Disable button

**Styling**:
- ✅ Consistent padding based on size
- ✅ Uppercase text with wide letter-spacing
- ✅ Smooth transitions on hover
- ✅ Shadow on primary/accent variants
- ✅ Proper disabled states

---

### Card

**Padding Options**: `sm`, `md`, `lg`

**Usage**:
```tsx
import { Card } from './components/ui/Card';

<Card title="Card Title" subtitle="Optional subtitle" padding="md">
  <p>Card content goes here</p>
</Card>

<Card hover onClick={() => console.log('Clicked!')}>
  <p>Clickable card with hover effect</p>
</Card>
```

**Props**:
- `title`: Optional card title
- `subtitle`: Optional card subtitle
- `padding`: Card padding size
- `hover`: Enable hover effect
- `onClick`: Make card clickable

**Styling**:
- ✅ Consistent border and shadow
- ✅ Smooth hover transitions
- ✅ Premium border radius
- ✅ Clean title/content separation

---

### Input

**Usage**:
```tsx
import { Input } from './components/ui/Input';

<Input
  label="Email Address"
  type="email"
  placeholder="you@example.com"
  fullWidth
/>

<Input
  label="Password"
  type="password"
  error="Password is required"
/>

<Input
  label="Username"
  helperText="Choose a unique username"
/>
```

**Props**:
- `label`: Optional input label
- `error`: Error message (shows red border)
- `helperText`: Helper text below input
- `fullWidth`: Stretch to full width
- All standard HTML input props

**Styling**:
- ✅ Consistent padding and border
- ✅ Focus ring with brand color
- ✅ Error states with red accent
- ✅ Smooth transitions
- ✅ Disabled states

---

### Select

**Usage**:
```tsx
import { Select } from './components/ui/Select';

<Select
  label="Country"
  options={[
    { value: 'us', label: 'United States' },
    { value: 'ca', label: 'Canada' },
    { value: 'uk', label: 'United Kingdom' },
  ]}
  fullWidth
/>
```

**Props**:
- `label`: Optional select label
- `options`: Array of `{ value, label }` objects
- `error`: Error message
- `helperText`: Helper text
- `fullWidth`: Stretch to full width

**Styling**:
- ✅ Custom dropdown arrow
- ✅ Consistent with Input styling
- ✅ Premium appearance

---

### Badge

**Variants**: `default`, `primary`, `success`, `warning`, `error`, `info`, `danger`

**Usage**:
```tsx
import { Badge } from './components/ui/Badge';

<Badge variant="primary">New</Badge>
<Badge variant="success">Active</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="error">Failed</Badge>
```

**Styling**:
- ✅ Pill-shaped (full border radius)
- ✅ Uppercase text
- ✅ Wide letter-spacing
- ✅ Semantic colors

---

### Modal

**Sizes**: `sm`, `md`, `lg`, `xl`

**Usage**:
```tsx
import { Modal, ConfirmModal } from './components/ui/Modal';

// Basic Modal
<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Modal Title"
  size="md"
  footer={
    <>
      <Button variant="ghost" onClick={onClose}>Cancel</Button>
      <Button variant="primary" onClick={onSave}>Save</Button>
    </>
  }
>
  <p>Modal content goes here</p>
</Modal>

// Confirm Modal (convenience component)
<ConfirmModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  onConfirm={handleDelete}
  title="Confirm Delete"
  confirmText="Delete"
  cancelText="Cancel"
  variant="error"
>
  <p>Are you sure you want to delete this item?</p>
</ConfirmModal>
```

**Props**:
- `isOpen`: Control modal visibility
- `onClose`: Close handler
- `title`: Optional modal title
- `size`: Modal size
- `footer`: Optional footer content

**Features**:
- ✅ Escape key to close
- ✅ Click backdrop to close
- ✅ Body scroll lock when open
- ✅ Smooth transitions
- ✅ Premium shadows

---

## 🎯 Layout Utilities

### Container

```tsx
import { layout } from './design-system';

<div style={layout.container}>
  {/* Max width 1280px, centered, horizontal padding */}
</div>
```

### Section

```tsx
<section style={layout.section}>
  {/* Vertical padding for sections */}
</section>
```

### Grid

```tsx
import { layout } from './design-system';

// 2 column grid
<div className={layout.grid.grid2}>
  {/* Responsive 1 col → 2 col grid */}
</div>

// 3 column grid
<div className={layout.grid.grid3}>
  {/* 1 col → 2 col → 3 col */}
</div>

// 4 column grid
<div className={layout.grid.grid4}>
  {/* 1 col → 2 col → 4 col */}
</div>
```

### Flex

```tsx
// Center aligned
<div className={layout.flex.center} />

// Space between
<div className={layout.flex.between} />

// Align start
<div className={layout.flex.start} />

// Align end
<div className={layout.flex.end} />
```

---

## 🛠️ Helper Functions

### `cn()` - Combine Class Names

```tsx
import { cn } from './design-system';

const className = cn(
  'base-class',
  isActive && 'active-class',
  isDisabled && 'disabled-class',
  customClass
);
// Output: "base-class active-class custom-class"
```

### `createStyle()` - Convert Tokens to Inline Styles

```tsx
import { createStyle, typography } from './design-system';

const style = createStyle({
  fontSize: typography.fontSize.lg,
  fontWeight: typography.fontWeight.bold,
  lineHeight: typography.lineHeight.tight,
});
```

---

## ✨ Usage Examples

### Creating a Premium Product Card

```tsx
import { Card } from './components/ui/Card';
import { Button } from './components/ui/Button';
import { Badge } from './components/ui/Badge';
import { colors, spacing, typography, borderRadius, shadows } from './design-system';

function ProductCard({ product }) {
  return (
    <Card padding="md" hover>
      {/* Product Image */}
      <div style={{
        aspectRatio: '1',
        borderRadius: borderRadius.lg,
        overflow: 'hidden',
        marginBottom: spacing.md,
      }}>
        <img src={product.image} alt={product.name} />
      </div>

      {/* Badge */}
      {product.badge && (
        <Badge variant="primary">{product.badge}</Badge>
      )}

      {/* Product Name */}
      <h3 style={{
        ...typography.h5,
        color: colors.text.primary,
        marginTop: spacing.sm,
        marginBottom: spacing.xs,
      }}>
        {product.name}
      </h3>

      {/* Price */}
      <p style={{
        fontSize: typography.fontSize['2xl'],
        fontWeight: typography.fontWeight.bold,
        color: colors.text.primary,
        marginBottom: spacing.md,
      }}>
        ${product.price}
      </p>

      {/* Add to Cart */}
      <Button variant="primary" fullWidth>
        Add to Cart
      </Button>
    </Card>
  );
}
```

### Creating a Form

```tsx
import { Input } from './components/ui/Input';
import { Select } from './components/ui/Select';
import { Button } from './components/ui/Button';
import { spacing } from './design-system';

function CheckoutForm() {
  return (
    <form style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
      <Input
        label="Email"
        type="email"
        placeholder="you@example.com"
        fullWidth
        required
      />

      <Input
        label="Full Name"
        placeholder="John Doe"
        fullWidth
        required
      />

      <Select
        label="Country"
        options={[
          { value: 'us', label: 'United States' },
          { value: 'ca', label: 'Canada' },
        ]}
        fullWidth
        required
      />

      <Button variant="primary" type="submit" fullWidth>
        Continue to Payment
      </Button>
    </form>
  );
}
```

---

## 🎨 Design Principles

### 1. **Consistency**
All components use the same spacing, colors, typography, and transitions. No more one-off values or inline Tailwind classes.

### 2. **Premium Feel**
- Generous whitespace
- Subtle shadows
- Smooth transitions
- High-quality typography
- Sophisticated color palette

### 3. **Accessibility**
- Proper focus states
- ARIA labels
- Semantic HTML
- Keyboard navigation support

### 4. **Scalability**
- Token-based system
- Reusable components
- Easy to extend
- Type-safe with TypeScript

### 5. **Performance**
- Minimal CSS
- No runtime CSS-in-JS overhead
- Optimized bundle size

---

## 📁 File Structure

```
src/
├── design-system.ts          # ← Central design system
├── components/
│   └── ui/                   # Reusable UI components
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Input.tsx
│       ├── Select.tsx
│       ├── Badge.tsx
│       ├── Modal.tsx
│       └── SkeletonLoader.tsx
```

---

## 🚀 Migration Guide

### Before (Inline Tailwind)

```tsx
<button className="px-5 py-2.5 text-xs font-semibold uppercase bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300">
  Click Me
</button>
```

### After (Design System)

```tsx
<Button variant="primary" size="md">
  Click Me
</Button>
```

**Benefits**:
- ✅ Consistent styling across all buttons
- ✅ Type-safe props
- ✅ Single source of truth
- ✅ Easy to maintain
- ✅ Better DX

---

## 🎯 Best Practices

### ✅ DO

```tsx
// Use design tokens
<div style={{ padding: spacing.md, borderRadius: borderRadius.lg }}>

// Use component library
<Button variant="primary">Submit</Button>

// Use helper functions
const className = cn('base', isActive && 'active');
```

### ❌ DON'T

```tsx
// Don't use arbitrary values
<div style={{ padding: '18px', borderRadius: '11px' }}>

// Don't use inline Tailwind classes for component styling
<button className="px-4 py-2 bg-red-500 rounded">

// Don't concatenate class strings manually
const className = 'base' + (isActive ? ' active' : '');
```

---

## 🏆 Result

**Before**: Inconsistent spacing, colors, typography scattered across 50+ components

**After**: Unified design system with:
- ✅ 600+ design tokens
- ✅ 7 reusable UI components
- ✅ Premium supplement brand aesthetic
- ✅ Type-safe throughout
- ✅ Production-ready build
- ✅ Zero Tailwind inconsistencies

---

## 📚 Additional Resources

- **Components**: See `/src/components/ui/*` for component source code
- **Tokens**: See `/src/design-system.ts` for all design tokens
- **Examples**: See component files for real-world usage

---

**Built for CoreForge** - Premium supplement ecommerce platform

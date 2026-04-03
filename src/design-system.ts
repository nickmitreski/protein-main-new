/**
 * CoreForge Design System
 * Premium supplement brand - Clean, minimal, slightly luxurious
 */

// ==================== COLOR TOKENS ====================

export const colors = {
  // Brand Colors
  primary: {
    main: '#E63946',      // CoreForge Red - Bold, energetic
    dark: '#C1121F',      // Darker red for hovers
    light: '#F25C66',     // Lighter red for accents
    contrast: '#FFFFFF',  // White text on primary
  },

  secondary: {
    main: '#1D3557',      // Deep navy - Professional, trustworthy
    dark: '#0D1B2A',      // Darker navy
    light: '#2E4A6B',     // Lighter navy
    contrast: '#FFFFFF',  // White text on secondary
  },

  accent: {
    main: '#F77F00',      // Vibrant orange - Energy, CTA
    dark: '#D66D00',      // Darker orange
    light: '#FF9E1B',     // Lighter orange
    contrast: '#FFFFFF',  // White text on accent
  },

  // Semantic Colors
  success: {
    main: '#2A9D8F',
    light: '#48C4B7',
    dark: '#1D7A6F',
    bg: '#E8F6F4',
  },

  warning: {
    main: '#F4A261',
    light: '#F7B882',
    dark: '#E8924A',
    bg: '#FEF5ED',
  },

  error: {
    main: '#E63946',
    light: '#F25C66',
    dark: '#C1121F',
    bg: '#FEECEE',
    contrast: '#FFFFFF',
  },

  info: {
    main: '#457B9D',
    light: '#6B9AB8',
    dark: '#2E5468',
    bg: '#EDF4F8',
  },

  // Neutral Colors (premium grayscale)
  neutral: {
    50: '#FAFAFA',   // Lightest background
    100: '#F5F5F5',  // Light background
    200: '#EEEEEE',  // Borders, dividers
    300: '#E0E0E0',  // Disabled backgrounds
    400: '#BDBDBD',  // Disabled text
    500: '#9E9E9E',  // Muted text
    600: '#757575',  // Secondary text
    700: '#616161',  // Body text
    800: '#424242',  // Headings
    900: '#212121',  // Primary text
    black: '#0A0A0A', // True black for contrast
  },

  // Background Colors
  background: {
    primary: '#FFFFFF',
    secondary: '#FAFAFA',
    tertiary: '#F5F5F5',
    dark: '#0A0A0A',
    darkSecondary: '#1C1C1C',
  },

  // Text Colors
  text: {
    primary: '#0A0A0A',
    secondary: '#616161',
    tertiary: '#9E9E9E',
    disabled: '#BDBDBD',
    inverse: '#FFFFFF',
  },

  // Border Colors
  border: {
    light: '#EEEEEE',
    main: '#E0E0E0',
    dark: '#BDBDBD',
    focus: '#E63946',
  },
} as const;

// ==================== SPACING TOKENS ====================

export const spacing = {
  // Base spacing scale (4px base unit)
  0: '0',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
  20: '5rem',     // 80px
  24: '6rem',     // 96px
  32: '8rem',     // 128px

  // Semantic spacing
  xs: '0.5rem',   // 8px
  sm: '1rem',     // 16px
  md: '1.5rem',   // 24px
  lg: '2rem',     // 32px
  xl: '3rem',     // 48px
  '2xl': '4rem',  // 64px
  '3xl': '6rem',  // 96px

  // Component-specific spacing
  section: {
    y: '8rem',        // 128px - Vertical section padding
    ySmall: '5rem',   // 80px - Small section padding
    yLarge: '10rem',  // 160px - Large section padding
  },

  container: {
    x: '2rem',        // 32px - Container horizontal padding
    maxWidth: '80rem', // 1280px - Max container width
  },

  card: {
    padding: '2rem',      // 32px
    paddingSmall: '1.5rem', // 24px
    gap: '1.5rem',        // 24px
  },
} as const;

// ==================== TYPOGRAPHY TOKENS ====================

export const typography = {
  // Font families
  fontFamily: {
    sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    mono: '"SF Mono", "Monaco", "Inconsolata", "Fira Code", monospace',
  },

  // Font sizes
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem',    // 48px
    '6xl': '3.75rem', // 60px
    '7xl': '4.5rem',  // 72px
  },

  // Line heights
  lineHeight: {
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
  },

  // Font weights
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },

  // Letter spacing
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },

  // Heading styles
  h1: {
    fontSize: '4.5rem',     // 72px
    fontWeight: '700',
    lineHeight: '1.1',
    letterSpacing: '-0.025em',
  },

  h2: {
    fontSize: '3rem',       // 48px
    fontWeight: '700',
    lineHeight: '1.2',
    letterSpacing: '-0.025em',
  },

  h3: {
    fontSize: '2.25rem',    // 36px
    fontWeight: '600',
    lineHeight: '1.3',
    letterSpacing: '0',
  },

  h4: {
    fontSize: '1.5rem',     // 24px
    fontWeight: '600',
    lineHeight: '1.4',
    letterSpacing: '0',
  },

  h5: {
    fontSize: '1.25rem',    // 20px
    fontWeight: '600',
    lineHeight: '1.5',
    letterSpacing: '0',
  },

  h6: {
    fontSize: '1rem',       // 16px
    fontWeight: '600',
    lineHeight: '1.5',
    letterSpacing: '0.025em',
  },

  // Body styles
  body: {
    fontSize: '1rem',       // 16px
    fontWeight: '400',
    lineHeight: '1.625',
    letterSpacing: '0',
  },

  bodyLarge: {
    fontSize: '1.125rem',   // 18px
    fontWeight: '400',
    lineHeight: '1.625',
    letterSpacing: '0',
  },

  bodySmall: {
    fontSize: '0.875rem',   // 14px
    fontWeight: '400',
    lineHeight: '1.5',
    letterSpacing: '0',
  },

  // Caption/label styles
  caption: {
    fontSize: '0.75rem',    // 12px
    fontWeight: '500',
    lineHeight: '1.5',
    letterSpacing: '0.1em',
    textTransform: 'uppercase' as const,
  },

  label: {
    fontSize: '0.875rem',   // 14px
    fontWeight: '500',
    lineHeight: '1.5',
    letterSpacing: '0.025em',
  },
} as const;

// ==================== BORDER RADIUS TOKENS ====================

export const borderRadius = {
  none: '0',
  sm: '0.25rem',   // 4px
  base: '0.5rem',  // 8px
  md: '0.75rem',   // 12px
  lg: '1rem',      // 16px
  xl: '1.5rem',    // 24px
  full: '9999px',  // Pills/circles
} as const;

// ==================== SHADOW TOKENS ====================

export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
} as const;

// ==================== TRANSITION TOKENS ====================

export const transitions = {
  duration: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
  },

  timing: {
    linear: 'linear',
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
  },

  // Preset transitions
  default: 'all 300ms ease-in-out',
  fast: 'all 150ms ease-in-out',
  slow: 'all 500ms ease-in-out',
  colors: 'color 300ms ease-in-out, background-color 300ms ease-in-out, border-color 300ms ease-in-out',
  transform: 'transform 300ms ease-in-out',
  opacity: 'opacity 300ms ease-in-out',
} as const;

// ==================== Z-INDEX TOKENS ====================

export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  fixed: 1200,
  modalBackdrop: 1300,
  modal: 1400,
  popover: 1500,
  tooltip: 1600,
} as const;

// ==================== COMPONENT STYLES ====================

export const components = {
  // Button variants
  button: {
    base: {
      fontWeight: typography.fontWeight.semibold,
      fontSize: typography.fontSize.sm,
      lineHeight: typography.lineHeight.normal,
      letterSpacing: typography.letterSpacing.wider,
      textTransform: 'uppercase' as const,
      borderRadius: borderRadius.base,
      transition: transitions.default,
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing[2],
    },

    sizes: {
      sm: {
        padding: `${spacing[2]} ${spacing[4]}`,
        fontSize: typography.fontSize.xs,
      },
      md: {
        padding: `${spacing[3]} ${spacing[6]}`,
        fontSize: typography.fontSize.sm,
      },
      lg: {
        padding: `${spacing[4]} ${spacing[10]}`,
        fontSize: typography.fontSize.base,
      },
    },

    variants: {
      primary: {
        backgroundColor: colors.primary.main,
        color: colors.primary.contrast,
        border: 'none',
        boxShadow: shadows.md,
        hover: {
          backgroundColor: colors.primary.dark,
          boxShadow: shadows.lg,
          transform: 'translateY(-1px)',
        },
      },

      secondary: {
        backgroundColor: 'transparent',
        color: colors.secondary.main,
        border: `2px solid ${colors.secondary.main}`,
        boxShadow: 'none',
        hover: {
          backgroundColor: colors.secondary.main,
          color: colors.secondary.contrast,
        },
      },

      outline: {
        backgroundColor: 'transparent',
        color: colors.text.primary,
        border: `2px solid ${colors.border.main}`,
        boxShadow: 'none',
        hover: {
          borderColor: colors.primary.main,
          backgroundColor: colors.primary.main,
          color: colors.primary.contrast,
        },
      },

      ghost: {
        backgroundColor: 'transparent',
        color: colors.text.primary,
        border: 'none',
        boxShadow: 'none',
        hover: {
          backgroundColor: colors.neutral[100],
        },
      },

      accent: {
        backgroundColor: colors.accent.main,
        color: colors.accent.contrast,
        border: 'none',
        boxShadow: shadows.md,
        hover: {
          backgroundColor: colors.accent.dark,
          boxShadow: shadows.lg,
        },
      },
    },

    disabled: {
      opacity: '0.5',
      cursor: 'not-allowed',
      pointerEvents: 'none',
    },
  },

  // Card styles
  card: {
    base: {
      backgroundColor: colors.background.primary,
      borderRadius: borderRadius.lg,
      border: `1px solid ${colors.border.light}`,
      boxShadow: shadows.sm,
      transition: transitions.default,
    },

    hover: {
      borderColor: colors.border.dark,
      boxShadow: shadows.md,
    },

    padding: {
      sm: spacing.card.paddingSmall,
      md: spacing.card.padding,
      lg: spacing[8],
    },
  },

  // Input styles
  input: {
    base: {
      width: '100%',
      padding: `${spacing[3]} ${spacing[4]}`,
      fontSize: typography.fontSize.base,
      lineHeight: typography.lineHeight.normal,
      color: colors.text.primary,
      backgroundColor: colors.background.primary,
      border: `1px solid ${colors.border.main}`,
      borderRadius: borderRadius.base,
      transition: transitions.default,
      outline: 'none',
    },

    focus: {
      borderColor: colors.border.focus,
      boxShadow: `0 0 0 3px rgba(230, 57, 70, 0.1)`,
    },

    error: {
      borderColor: colors.error.main,
      focus: {
        boxShadow: `0 0 0 3px ${colors.error.bg}`,
      },
    },

    disabled: {
      backgroundColor: colors.neutral[100],
      color: colors.text.disabled,
      cursor: 'not-allowed',
    },
  },

  // Badge styles
  badge: {
    base: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: spacing[1],
      padding: `${spacing[1]} ${spacing[3]}`,
      fontSize: typography.fontSize.xs,
      fontWeight: typography.fontWeight.semibold,
      letterSpacing: typography.letterSpacing.wider,
      textTransform: 'uppercase' as const,
      borderRadius: borderRadius.full,
      lineHeight: typography.lineHeight.none,
    },

    variants: {
      default: {
        backgroundColor: colors.neutral[100],
        color: colors.neutral[800],
      },
      primary: {
        backgroundColor: colors.primary.main,
        color: colors.primary.contrast,
      },
      success: {
        backgroundColor: colors.success.main,
        color: colors.success.bg,
      },
      warning: {
        backgroundColor: colors.warning.main,
        color: colors.warning.bg,
      },
      error: {
        backgroundColor: colors.error.main,
        color: colors.error.contrast,
      },
      info: {
        backgroundColor: colors.info.main,
        color: colors.info.bg,
      },
    },
  },

  // Modal styles
  modal: {
    backdrop: {
      position: 'fixed' as const,
      inset: '0',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: zIndex.modalBackdrop,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing[4],
    },

    content: {
      backgroundColor: colors.background.primary,
      borderRadius: borderRadius.lg,
      boxShadow: shadows['2xl'],
      maxWidth: '32rem',
      width: '100%',
      maxHeight: '90vh',
      overflow: 'auto',
      zIndex: zIndex.modal,
    },

    header: {
      padding: spacing[6],
      borderBottom: `1px solid ${colors.border.light}`,
    },

    body: {
      padding: spacing[6],
    },

    footer: {
      padding: spacing[6],
      borderTop: `1px solid ${colors.border.light}`,
      display: 'flex',
      gap: spacing[3],
      justifyContent: 'flex-end',
    },
  },
} as const;

// ==================== LAYOUT UTILITIES ====================

export const layout = {
  container: {
    maxWidth: spacing.container.maxWidth,
    margin: '0 auto',
    padding: `0 ${spacing.container.x}`,
  },

  section: {
    padding: `${spacing.section.y} 0`,
  },

  grid: {
    grid2: 'grid grid-cols-1 md:grid-cols-2',
    grid3: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    grid4: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    grid6: 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6',
  },

  flex: {
    center: 'flex items-center justify-center',
    between: 'flex items-center justify-between',
    start: 'flex items-center justify-start',
    end: 'flex items-center justify-end',
  },
} as const;

// ==================== HELPER FUNCTIONS ====================

/**
 * Convert design tokens to inline styles
 */
export function createStyle(tokens: Record<string, string | number>) {
  return Object.entries(tokens).reduce((acc, [key, value]) => {
    // Convert camelCase to kebab-case
    const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
    return { ...acc, [cssKey]: value };
  }, {});
}

/**
 * Combine multiple class names
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Get responsive padding
 */
export function responsivePadding(mobile: keyof typeof spacing, desktop: keyof typeof spacing) {
  return `${spacing[mobile]} lg:${spacing[desktop]}`;
}

export default {
  colors,
  spacing,
  typography,
  borderRadius,
  shadows,
  transitions,
  zIndex,
  components,
  layout,
};

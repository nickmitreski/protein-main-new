export const colors = {
  // CoreForge Brand Colors
  primary: '#E63946', // CoreForge Red - Bold, energetic
  primaryDark: '#C1121F', // Darker red for hovers
  primaryLight: '#F25C66', // Lighter red for accents

  secondary: '#1D3557', // Deep navy blue - Professional, trustworthy
  secondaryDark: '#0D1B2A', // Darker navy
  secondaryLight: '#2E4A6B', // Lighter navy

  accent: '#F77F00', // Vibrant orange - Energy, motivation
  accentDark: '#D66D00', // Darker orange
  accentLight: '#FF9E1B', // Lighter orange

  success: '#2A9D8F', // Teal green - Success, health
  warning: '#F4A261', // Warm orange - Caution
  error: '#E63946', // Red - Error states
  info: '#457B9D', // Blue - Information

  /** Brand red alias (matches `primary`) — used across marketing sections */
  red: '#E63946',
  redDark: '#C1121F',

  // Neutrals
  black: '#0A0A0A',
  darkGrey: '#1C1C1C',
  mediumGrey: '#4A5568',
  lightGrey: '#EDEDED',
  white: '#FFFFFF',

  // Grayscale
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',

  // Background variants
  bgPrimary: '#FFFFFF',
  bgSecondary: '#F9FAFB',
  bgDark: '#0A0A0A',
  bgDarkSecondary: '#1C1C1C',
} as const;

export const spacing = {
  section: 'py-32',
  sectionSmall: 'py-20',
  container: 'max-w-7xl mx-auto px-8',
  cardPadding: 'p-8',
  cardPaddingSmall: 'p-6',
  gap: 'gap-6',
  gapSmall: 'gap-3',
  gapLarge: 'gap-12',
  headingMargin: 'mb-20',
} as const;

export const typography = {
  h1: 'text-5xl md:text-7xl font-bold tracking-tight leading-[1.1]',
  h2: 'text-4xl md:text-5xl font-bold tracking-tight',
  h3: 'text-lg font-medium tracking-wide',
  body: 'text-lg leading-relaxed',
  bodySmall: 'text-sm leading-relaxed',
  label: 'text-sm font-medium tracking-wide',
  caption: 'text-sm tracking-widest uppercase',
} as const;

export const components = {
  card: 'border border-gray-200 hover:border-gray-400 transition-all duration-300 bg-white shadow-sm hover:shadow-md rounded-lg',
  cardDark: 'bg-[#1C1C1C] border border-gray-800 hover:border-gray-700 transition-all duration-300 rounded-lg',
  cardProduct: 'border border-gray-200 hover:border-[#E63946] transition-all duration-300 bg-white shadow-sm hover:shadow-lg rounded-lg overflow-hidden group',

  button: 'px-10 py-4 font-medium transition-all duration-300 tracking-wide rounded-lg disabled:opacity-50 disabled:cursor-not-allowed',
  buttonPrimary: 'bg-[#E63946] hover:bg-[#C1121F] text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5',
  buttonSecondary: 'border-2 border-[#1D3557] hover:bg-[#1D3557] hover:text-white text-[#1D3557]',
  buttonOutline: 'border-2 border-gray-300 hover:border-[#E63946] hover:bg-[#E63946] hover:text-white text-gray-700',
  buttonAccent: 'bg-[#F77F00] hover:bg-[#D66D00] text-white shadow-md hover:shadow-lg',
  buttonSuccess: 'bg-[#2A9D8F] hover:bg-[#238276] text-white',

  badge: 'inline-block px-3 py-1 text-xs font-semibold rounded-full uppercase tracking-wide',
  badgeBestSeller: 'bg-[#E63946] text-white',
  badgeNew: 'bg-[#F77F00] text-white',
  badgeAthleteApproved: 'bg-[#1D3557] text-white',
  badgeLabTested: 'bg-[#2A9D8F] text-white',
  badgeSale: 'bg-[#E63946] text-white',

  image: 'w-full h-full object-cover',
  imageHover: 'group-hover:scale-105 transition-transform duration-700 ease-out',

  input: 'w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E63946] focus:border-transparent transition-all',
  inputError: 'border-[#E63946] focus:ring-[#E63946]',

  link: 'text-[#E63946] hover:text-[#C1121F] transition-colors duration-200',
  linkSecondary: 'text-[#1D3557] hover:text-[#0D1B2A] transition-colors duration-200',
} as const;

export const effects = {
  shadow: {
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
  },
  transition: {
    fast: 'transition-all duration-150',
    normal: 'transition-all duration-300',
    slow: 'transition-all duration-500',
  },
  hover: {
    lift: 'transform hover:-translate-y-1',
    scale: 'transform hover:scale-105',
  },
} as const;

export const layout = {
  grid2: 'grid grid-cols-1 md:grid-cols-2',
  grid3: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  grid4: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  grid6: 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6',
} as const;

/**
 * MoodB Mantine Theme Configuration
 * Brand Colors: Background #f7f7ed, Brand #df2538, Text #000000, Inverse #ffffff
 */

import { MantineThemeOverride } from '@mantine/core'

export const moodbTheme: MantineThemeOverride = {
  // Primary Color - MoodB Red
  primaryColor: 'brand',
  
  colors: {
    // Brand color scale (MoodB Red)
    brand: [
      '#fef4f5', // 0 - Lightest
      '#fce8ea', // 1
      '#f8d0d4', // 2
      '#f4b8be', // 3
      '#f0a0a8', // 4
      '#df2538', // 5 - Main brand color
      '#c51f2f', // 6 - Hover state
      '#ab1b28', // 7
      '#911721', // 8
      '#77131a', // 9 - Darkest
    ],
    
    // Neutral grays (based on text color #000000)
    gray: [
      '#fafafa', // 0
      '#f5f5f5', // 1
      '#e5e5e5', // 2
      '#d4d4d4', // 3
      '#a3a3a3', // 4
      '#737373', // 5
      '#525252', // 6
      '#404040', // 7
      '#262626', // 8
      '#171717', // 9
    ],
  },
  
  // Default gradient
  defaultGradient: {
    from: '#df2538',
    to: '#c51f2f',
    deg: 45,
  },
  
  // Fonts - Hebrew support with Heebo and Assistant
  fontFamily: 'var(--font-geist-sans), "Heebo", "Assistant", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  fontFamilyMonospace: 'var(--font-geist-mono), Monaco, "Courier New", monospace',
  
  // Headings
  headings: {
    fontFamily: 'var(--font-geist-sans), "Heebo", "Assistant", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontWeight: '600',
    sizes: {
      h1: { fontSize: '2.5rem', lineHeight: '1.2' },
      h2: { fontSize: '2rem', lineHeight: '1.3' },
      h3: { fontSize: '1.75rem', lineHeight: '1.4' },
      h4: { fontSize: '1.5rem', lineHeight: '1.5' },
      h5: { fontSize: '1.25rem', lineHeight: '1.6' },
      h6: { fontSize: '1rem', lineHeight: '1.6' },
    },
  },
  
  // Spacing
  spacing: {
    xs: '0.5rem',
    sm: '0.75rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  },
  
  // Radius
  radius: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '0.75rem',
    lg: '1rem',
    xl: '1.5rem',
  },
  
  // Shadows
  shadows: {
    xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    sm: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  },
  
  // Other theme settings
  defaultRadius: 'md',
  focusRing: 'auto',
  
  // Components default props
  components: {
    Button: {
      defaultProps: {
        radius: 'md',
      },
      styles: (theme) => ({
        root: {
          fontWeight: 500,
          transition: 'all 200ms ease',
          '&:hover': {
            transform: 'translateY(-1px)',
          },
        },
      }),
    },
    Card: {
      defaultProps: {
        radius: 'md',
        shadow: 'sm',
      },
    },
    Input: {
      defaultProps: {
        radius: 'md',
      },
    },
    Paper: {
      defaultProps: {
        radius: 'md',
        shadow: 'sm',
      },
    },
    Container: {
      defaultProps: {
        bg: '#f7f7ed', // MoodB brand background
      },
    },
    Title: {
      defaultProps: {
        fw: 600,
      },
      styles: (theme) => ({
        root: {
          fontFamily: 'var(--font-geist-sans), "Heebo", "Assistant", sans-serif',
        },
      }),
    },
    Text: {
      styles: (theme) => ({
        root: {
          fontFamily: 'var(--font-geist-sans), "Heebo", "Assistant", sans-serif',
        },
      }),
    },
  },
  
  // RTL Support
  respectReducedMotion: true,
}

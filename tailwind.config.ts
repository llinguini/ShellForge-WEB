import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        sf: {
          bg:        '#0f0e0c',
          s1:        '#171510',
          s2:        '#1f1d17',
          s3:        '#28251e',
          b1:        '#333028',
          b2:        '#444035',
          hint:      '#6b6558',
          dim:       '#8a8070',
          muted:     '#b0a890',
          text:      '#ede6d6',
          card:      '#1a1814',
          green:     '#5aad7a',
          'green-d': '#0d2418',
          amber:     '#c8982a',
          'amber-d': '#261e08',
          red:       '#c05050',
          'red-d':   '#240e0e',
        },
      },
      fontFamily: {
        display: ['"Georgia"', '"Times New Roman"', 'serif'],
        ui:      ['"Inter"', 'system-ui', 'sans-serif'],
        mono:    ['"JetBrains Mono"', '"Courier New"', 'monospace'],
      },
      borderRadius: {
        sm: '4px',
        md: '8px',
        lg: '14px',
      },
      fontSize: {
        '2xs': ['10px', { lineHeight: '1.4', letterSpacing: '0.08em' }],
        xs:    ['11px', { lineHeight: '1.5', letterSpacing: '0.06em' }],
        sm:    ['12px', { lineHeight: '1.6' }],
        base:  ['13px', { lineHeight: '1.6' }],
        md:    ['14px', { lineHeight: '1.65' }],
        lg:    ['16px', { lineHeight: '1.5' }],
        xl:    ['20px', { lineHeight: '1.3' }],
        '2xl': ['28px', { lineHeight: '1.1' }],
        '3xl': ['36px', { lineHeight: '1'   }],
      },
    },
  },
  plugins: [],
}

export default config

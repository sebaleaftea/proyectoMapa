/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0056B3',
          hover: '#003D82',
          foreground: '#FFFFFF',
        },
        accent: {
          DEFAULT: '#FF6B00',
          foreground: '#FFFFFF',
        },
        bg: {
          app: 'var(--bg-app, #FAFAFA)',
          surface: 'var(--bg-surface, #FFFFFF)',
          map: '#E9E5DC',
        },
        text: {
          primary: 'var(--text-primary, #121212)',
          secondary: 'var(--text-secondary, #5F6368)',
        },
        border: 'var(--border, #E0E0E0)',
        status: {
          validated: '#1B5E20',
          'validated-bg': '#E8F5E9',
          pending: '#F57F17',
          'pending-bg': '#FFF8E1',
          rejected: '#B71C1C',
          'rejected-bg': '#FFEBEE',
        },
      },
      fontFamily: {
        sans: ['Roboto', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        display: ['24px', { fontWeight: '700', lineHeight: '1.2' }],
        'heading-1': ['20px', { fontWeight: '600', lineHeight: '1.3' }],
        'body-large': ['16px', { fontWeight: '400', lineHeight: '1.5' }],
        body: ['14px', { fontWeight: '400', lineHeight: '1.5' }],
        caption: ['12px', { fontWeight: '500', lineHeight: '1.4' }],
      },
      spacing: {
        sidebar: '260px',
      },
      minHeight: {
        touch: '44px',
      },
      minWidth: {
        touch: '44px',
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)',
        modal: '0 20px 60px rgba(0,0,0,0.15)',
      },
    },
  },
  plugins: [],
}

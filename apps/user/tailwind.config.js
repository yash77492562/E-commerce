/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/ui/**/*.{js,ts,jsx,tsx,mdx}",
    "!../../node_modules" // Exclude node_modules
  ],
  theme: {
    extend: {
      fontSize: {
        dynamicHeading: 'calc((var(--heading-1-size-value) - 1) * 1.2vw + 1rem)',
      },
      colors: {
        background: 'rgb(var(--color-background),<alpha-value>)',
        foreground: 'rgb(var(--color-foreground),<alpha-value>)',
        'background-contrast': 'rgb(var(--color-background-contrast),<alpha-value>)',
        shadow: 'rgb(var(--color-shadow))',
        button: {
          DEFAULT: 'rgb(var(--color-button))',
          text: 'rgb(var(--color-button-text))',
        },
        'secondary-button': {
          DEFAULT: 'rgb(var(--color-secondary-button))',
          text: 'rgb(var(--color-secondary-button-text))',
        },
        link: 'rgb(var(--color-link))',
        badge: {
          foreground: 'rgb(var(--color-badge-foreground))',
          background: 'rgb(var(--color-badge-background))',
          border: 'rgb(var(--color-badge-border))',
        },
        'payment-terms': {
          background: 'rgb(249 249 249)',
        },
        // Additional colors merged into the same colors object
        ibisWhite: '#F2ECE6',
        customGray: '#F8FAFC',
        purewhite: '#FFFFFF',
        lightgray: '#F1F5F9',
        main: '#1E293B',
        lessMain: '#64748B',
        heading: '#OF172A',
        clickable: '#7C8280',
        customBeige: '#B5AA9C',
        lightCran: '#E0FFFF',
        customText1: '#7D8281'
      },
      backgroundImage: {
        'gradient-background': 'var(--gradient-background)',
        'marvel': "url('/images/IMG_2332.JPG')",
        'home_bg': "url('/images/121.webp')",
        'backgroundImage':"url('/images/IMG_6054.JPG')"
      },
      // Moved content outside of theme.extend
      animation: {
        scanner: 'scanner 1.5s ease-in-out infinite',
        wiggle: 'wiggle 1s ease-in-out infinite',
        breatheFire: 'breatheFire 2s ease-in-out infinite',
        fideIn: 'fadeIn 1.5s ease-in-out',
        moveAround: 'moveAround 15s linear infinite',
        moveAndSpin: 'moveAndSpin 20s linear infinite',
      },
      keyframes: {
        scanner: {
          '0%': { top: '0%' },
          '50%': { top: '100%' },
          '100%': { top: '0%' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-5deg)' },
          '50%': { transform: 'rotate(5deg)' },
        },
        breatheFire: {
          '0%, 100%': {
            transform: 'scale(1)',
            opacity: '0.8',
          },
          '50%': {
            transform: 'scale(1.2)',
            opacity: '1',
          },
        },
        fadeIn: {
          '0%': {
            opacity: '0',
            transform: 'translateY(10px)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          }
        },
        moveAround: {
          '0%': {
            transform: 'translate(0, 0)',
          },
          '25%': {
            transform: 'translate(50%, 25%)',
          },
          '50%': {
            transform: 'translate(0, 50%)',
          },
          '75%': {
            transform: 'translate(-50%, 25%)',
          },
          '100%': {
            transform: 'translate(0, 0)',
          },
        },
        moveAndSpin: {
          '0%': {
            transform: 'translate(0, 0) rotate(0deg)',
          },
          '25%': {
            transform: 'translate(50%, 25%) rotate(90deg)',
          },
          '50%': {
            transform: 'translate(0, 50%) rotate(180deg)',
          },
          '75%': {
            transform: 'translate(-50%, 25%) rotate(270deg)',
          },
          '100%': {
            transform: 'translate(0, 0) rotate(360deg)',
          },
        },
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        '.no-spinner': {
          '-moz-appearance': 'textfield',
          '-webkit-appearance': 'none',
        },
        'input[type="number"]::-webkit-outer-spin-button, input[type="number"]::-webkit-inner-spin-button': {
          '-webkit-appearance': 'none',
          'margin': '0',
        },
        '.scrollbar-hide': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': {
            display: 'none'
          }
        },
        '.scrollbar-default': {
          '-ms-overflow-style': 'auto',
          'scrollbar-width': 'auto',
          '&::-webkit-scrollbar': {
            display: 'block'
          }
        },
        '.hide-scrollbar': {
          '-webkit-overflow-scrolling': 'touch',
          'scrollbar-width': 'none',
          '-ms-overflow-style': 'none',
          '&::-webkit-scrollbar': {
            display: 'none'
          }
        },
        '.scroll-snap-align-center': {
          'scroll-snap-align': 'center',
        },
        '.flex': {
          'scroll-snap-type': 'x mandatory',
          'scroll-behavior': 'smooth'
        }
      });
    },
  ],
};
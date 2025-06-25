/** @type {import('tailwindcss').Config} */

module.exports = {
  content: ['./src/renderer/index.html', './src/renderer/src/**/*.{svelte,js,ts,jsx,tsx}'],

  theme: {
    extend: {
      // Enhanced backdrop blur values
      backdropBlur: {
        'xs': '2px',
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '24px',
        '3xl': '32px',
      },
      
      // Glass morphism specific backdrop saturate
      backdropSaturate: {
        '125': '1.25',
        '150': '1.5',
        '175': '1.75',
        '200': '2',
      },
      
      // Enhanced backdrop brightness for glass effects
      backdropBrightness: {
        '25': '.25',
        '50': '.5',
        '75': '.75',
        '90': '.9',
        '95': '.95',
        '105': '1.05',
        '110': '1.1',
        '125': '1.25',
      },
      
      // Custom glass box shadows
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'glass-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glass-lg': '0 25px 50px -12px rgba(31, 38, 135, 0.25)',
        'glass-xl': '0 35px 60px -12px rgba(31, 38, 135, 0.3)',
        'frost': '0 4px 16px 0 rgba(255, 255, 255, 0.1)',
        'frost-dark': '0 4px 16px 0 rgba(0, 0, 0, 0.3)',
      },
      
      // Glass morphism specific colors with transparency
      colors: {
        'glass': {
          'white': 'rgba(255, 255, 255, 0.25)',
          'white-light': 'rgba(255, 255, 255, 0.1)',
          'white-medium': 'rgba(255, 255, 255, 0.2)',
          'white-strong': 'rgba(255, 255, 255, 0.4)',
          'black': 'rgba(0, 0, 0, 0.25)',
          'black-light': 'rgba(0, 0, 0, 0.1)',
          'black-medium': 'rgba(0, 0, 0, 0.2)',
          'black-strong': 'rgba(0, 0, 0, 0.4)',
        }
      },
      
      // Animation for 3D effects
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'glass-shimmer': 'glass-shimmer 2s ease-in-out infinite alternate',
      },
      
      keyframes: {
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-2px)' },
        },
        'glass-shimmer': {
          '0%': { 
            'background-position': '-200% 0',
            'opacity': '0.8'
          },
          '100%': { 
            'background-position': '200% 0',
            'opacity': '1'
          },
        }
      },
      
      // Custom gradients for glass effects
      backgroundImage: {
        'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0))',
        'glass-gradient-dark': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(0, 0, 0, 0.1))',
        'frost-gradient': 'linear-gradient(145deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.05))',
        'frost-gradient-dark': 'linear-gradient(145deg, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.05))',
      },
    }
  },

  plugins: [
    // Custom plugin for glass morphism utilities
    function({ addUtilities, theme }) {
      const glassUtilities = {
        '.glass': {
          background: 'rgba(255, 255, 255, 0.25)',
          'backdrop-filter': 'blur(4px) saturate(180%)',
          '-webkit-backdrop-filter': 'blur(4px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.18)',
          'box-shadow': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        },
        '.glass-dark': {
          background: 'rgba(0, 0, 0, 0.25)',
          'backdrop-filter': 'blur(4px) saturate(180%)',
          '-webkit-backdrop-filter': 'blur(4px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.125)',
          'box-shadow': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        },
        '.frost': {
          background: 'rgba(255, 255, 255, 0.1)',
          'backdrop-filter': 'blur(8px) saturate(150%)',
          '-webkit-backdrop-filter': 'blur(8px) saturate(150%)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        },
        '.frost-dark': {
          background: 'rgba(0, 0, 0, 0.1)',
          'backdrop-filter': 'blur(8px) saturate(150%)',
          '-webkit-backdrop-filter': 'blur(8px) saturate(150%)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },
        '.glass-button': {
          background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.05))',
          'backdrop-filter': 'blur(8px) saturate(150%)',
          '-webkit-backdrop-filter': 'blur(8px) saturate(150%)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          'box-shadow': '0 4px 16px 0 rgba(255, 255, 255, 0.1)',
          transition: 'all 0.2s ease',
          '&:hover': {
            transform: 'translateY(-1px)',
            'box-shadow': '0 8px 25px 0 rgba(255, 255, 255, 0.2)',
          }
        },
        '.glass-button-dark': {
          background: 'linear-gradient(145deg, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.05))',
          'backdrop-filter': 'blur(8px) saturate(150%)',
          '-webkit-backdrop-filter': 'blur(8px) saturate(150%)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          'box-shadow': '0 4px 16px 0 rgba(0, 0, 0, 0.3)',
          transition: 'all 0.2s ease',
          '&:hover': {
            transform: 'translateY(-1px)',
            'box-shadow': '0 8px 25px 0 rgba(0, 0, 0, 0.4)',
          }
        }
      };

      addUtilities(glassUtilities);
    }
  ]
}
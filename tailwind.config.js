/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
  	extend: {
  		fontFamily: {
  			sora: ['Sora', 'sans-serif'],
  			cairo: ['Cairo', 'sans-serif'],
  			mono: ['JetBrains Mono', 'monospace'],
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)',
  			'2xl': '1rem',
  			'3xl': '1.5rem',
  			'4xl': '2rem',
  		},
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			gold: {
  				50:  '#fffbeb',
  				100: '#fef3c7',
  				200: '#fde68a',
  				300: '#fcd34d',
  				400: '#fbbf24',
  				500: '#c9963a',
  				600: '#a87730',
  				700: '#7a5c20',
  				800: '#4d3a14',
  				900: '#2a1f0a',
  			},
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			}
  		},
  		keyframes: {
  			'accordion-down': {
  				from: { height: '0' },
  				to: { height: 'var(--radix-accordion-content-height)' }
  			},
  			'accordion-up': {
  				from: { height: 'var(--radix-accordion-content-height)' },
  				to: { height: '0' }
  			},
  			'fade-in': {
  				from: { opacity: '0', transform: 'translateY(8px)' },
  				to:   { opacity: '1', transform: 'translateY(0)' }
  			},
  			'slide-up': {
  				from: { opacity: '0', transform: 'translateY(24px)' },
  				to:   { opacity: '1', transform: 'translateY(0)' }
  			},
  			'scale-in': {
  				from: { opacity: '0', transform: 'scale(0.92)' },
  				to:   { opacity: '1', transform: 'scale(1)' }
  			},
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up':   'accordion-up 0.2s ease-out',
  			'fade-in':        'fade-in 0.5s ease-out',
  			'slide-up':       'slide-up 0.6s ease-out',
  			'scale-in':       'scale-in 0.4s ease-out',
  		},
  		backgroundImage: {
  			'gold-gradient': 'linear-gradient(135deg, #c9963a 0%, #7a5c20 100%)',
  			'dark-gradient': 'linear-gradient(135deg, #0a0c14 0%, #12141e 100%)',
  			'card-gradient': 'linear-gradient(145deg, rgba(201,150,58,0.05), rgba(10,12,20,0.98), rgba(167,139,250,0.03))',
  		},
  		boxShadow: {
  			'gold':    '0 0 24px rgba(201,150,58,0.35)',
  			'gold-lg': '0 0 48px rgba(201,150,58,0.25)',
  			'card':    '0 4px 24px rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.04) inset',
  		},
  	}
  },
  safelist: [
    'bg-amber-500', 'bg-purple-500', 'bg-blue-500', 'bg-green-500', 'bg-rose-500',
    'text-amber-400', 'text-purple-400', 'text-blue-400', 'text-green-400', 'text-rose-400',
    'border-amber-500/30', 'border-purple-500/30', 'border-blue-500/30',
  ],
  plugins: [require("tailwindcss-animate")],
}

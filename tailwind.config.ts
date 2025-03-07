import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'sm': '640px',
				'md': '768px',
				'lg': '1024px',
				'xl': '1280px',
				'2xl': '1536px',
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				// Groop custom colors - Futuristic AI Theme
				groop: {
					dark: '#0A1A2F',
					darker: '#061425',
					darkest: '#030A1A',
					blue: '#00B4FF',
					'blue-light': '#5CE5FF',
					'blue-dark': '#0077B6',
					cyan: '#00E5FF',
					purple: '#7B5CFF',
					'purple-light': '#A78BFF',
					accent: '#E0FBFC',
					'accent-muted': '#9EAEBB',
					surface: 'rgba(10, 26, 47, 0.7)',
					'surface-hover': 'rgba(0, 180, 255, 0.1)',
					neon: '#00F5FF',
					glow: 'rgba(0, 229, 255, 0.5)',
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			fontFamily: {
				sans: ['SF Pro Display', 'system-ui', 'sans-serif'],
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
					'0%': { opacity: '0' },
					'100%': { opacity: '1' }
				},
				'fade-out': {
					'0%': { opacity: '1' },
					'100%': { opacity: '0' }
				},
				'slide-up': {
					'0%': { transform: 'translateY(10px)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' }
				},
				'slide-down': {
					'0%': { transform: 'translateY(-10px)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' }
				},
				'slide-left': {
					'0%': { transform: 'translateX(20px)', opacity: '0' },
					'100%': { transform: 'translateX(0)', opacity: '1' }
				},
				'scale-up': {
					'0%': { transform: 'scale(0.95)', opacity: '0' },
					'100%': { transform: 'scale(1)', opacity: '1' }
				},
				'glow-pulse': {
					'0%, 100%': { 
						boxShadow: '0 0 0 rgba(0, 229, 255, 0)',
					},
					'50%': { 
						boxShadow: '0 0 30px rgba(0, 229, 255, 0.4)',
					}
				},
				'float': {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-10px)' }
				},
				'data-flow': {
					'0%': { backgroundPosition: '0% 50%' },
					'100%': { backgroundPosition: '100% 50%' }
				},
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.3s ease-out',
				'fade-out': 'fade-out 0.3s ease-out',
				'slide-up': 'slide-up 0.4s ease-out',
				'slide-down': 'slide-down 0.4s ease-out',
				'slide-left': 'slide-left 0.4s ease-out',
				'scale-up': 'scale-up 0.3s ease-out',
				'glow-pulse': 'glow-pulse 2s infinite ease-in-out',
				'float': 'float 6s ease-in-out infinite',
				'data-flow': 'data-flow 15s linear infinite',
			},
			backgroundImage: {
				'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
				'hero-pattern': 'radial-gradient(circle at 30% 20%, rgba(0, 229, 255, 0.15) 0%, rgba(10, 26, 47, 0) 40%), linear-gradient(to bottom, rgba(6, 20, 37, 0.95), rgba(3, 10, 26, 0.98))',
				'cyber-grid': 'linear-gradient(rgba(0, 180, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 180, 255, 0.1) 1px, transparent 1px)',
				'data-stream': 'linear-gradient(90deg, rgba(0, 229, 255, 0) 0%, rgba(0, 229, 255, 0.1) 50%, rgba(0, 229, 255, 0) 100%)',
			},
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;

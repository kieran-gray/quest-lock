/** @type {import('tailwindcss').Config} */

module.exports = {
	darkMode: ['class'],
	content: [
		'./src/*.{mjs,js,ts,jsx,tsx}',
		'./src/**/*.{mjs,js,ts,jsx,tsx}'
	],
	prefix: "",
	theme: {
		extend: {
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
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
				chart: {
					'1': 'hsl(var(--chart-1))',
					'2': 'hsl(var(--chart-2))',
					'3': 'hsl(var(--chart-3))',
					'4': 'hsl(var(--chart-4))',
					'5': 'hsl(var(--chart-5))'
				},
				shire: {
					light: '#fefcf8',       // parchment background
					dark: '#2d261f',        // deep earthy brown
					moss: '#b5c79a',        // light mossy green
					pine: '#587a50',        // rich foliage green
					bark: '#7b5e42',        // warm tree-bark brown
					stone: '#e4dbcf',       // stone path beige
					sun: '#f4c86a',         // warm soft golden highlight
					rose: '#e9b7aa',        // faded hobbit-door red
				},
			},
			fontFamily: {
				heading: ['"Almendra SC"', 'serif'],
				body: ['"Zilla Slab"', 'serif'],
				ui: ['"Work Sans"', 'sans-serif'],
			},
		}
	},
	plugins: [require("tailwindcss-animate")]
}

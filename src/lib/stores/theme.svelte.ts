import { browser } from '$app/environment';

type Theme = 'light' | 'dark';

function applyThemeToDom(current: Theme) {
	if (current === 'dark') {
		document.documentElement.classList.add('dark');
	} else {
		document.documentElement.classList.remove('dark');
	}
}

function createThemeStore() {
	let theme = $state<Theme>('light');

	if (browser) {
		const stored = localStorage.getItem('theme') as Theme | null;
		const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
		theme = stored || (prefersDark ? 'dark' : 'light');
		applyThemeToDom(theme);
	}

	return {
		get current() {
			return theme;
		},
		toggle() {
			theme = theme === 'light' ? 'dark' : 'light';
			if (browser) {
				applyThemeToDom(theme);
				localStorage.setItem('theme', theme);
			}
		},
		set(newTheme: Theme) {
			theme = newTheme;
			if (browser) {
				applyThemeToDom(theme);
				localStorage.setItem('theme', theme);
			}
		}
	};
}

export const themeStore = createThemeStore();


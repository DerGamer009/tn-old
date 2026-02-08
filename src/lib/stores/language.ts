import { writable } from 'svelte/store';

export type Language = 'de' | 'en';

const DEFAULT_LANGUAGE: Language = 'de';
const STORAGE_KEY = 'tn-language';

function getInitialLanguage(): Language {
	if (typeof window === 'undefined') {
		return DEFAULT_LANGUAGE;
	}

	const stored = window.localStorage.getItem(STORAGE_KEY) as Language | null;
	if (stored === 'de' || stored === 'en') {
		return stored;
	}

	// Optional: Browser-Sprache berücksichtigen
	const browserLang = window.navigator.language.toLowerCase();
	if (browserLang.startsWith('en')) return 'en';
	if (browserLang.startsWith('de')) return 'de';

	return DEFAULT_LANGUAGE;
}

function createLanguageStore() {
	const initial = getInitialLanguage();
	const { subscribe, set, update } = writable<Language>(initial);

	if (typeof window !== 'undefined') {
		// Persistiere Sprache & setze <html lang="">
		subscribe((value) => {
			window.localStorage.setItem(STORAGE_KEY, value);
			if (typeof document !== 'undefined') {
				document.documentElement.lang = value;
			}
		});
	}

	return {
		subscribe,
		set,
		update
	};
}

export const language = createLanguageStore();


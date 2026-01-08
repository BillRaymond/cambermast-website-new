import { browser } from '$app/environment';
import { writable } from 'svelte/store';

export type ConsentChoice = 'unknown' | 'granted' | 'denied';

export type ConsentState = {
	analytics: ConsentChoice;
	updatedAt?: string;
};

const STORAGE_KEY = 'cambermast-consent-v1';
const defaultState: ConsentState = { analytics: 'unknown' };

export const consentState = writable<ConsentState>(defaultState);

export function initConsent() {
	if (!browser) {
		consentState.set(defaultState);
		return;
	}

	const storedValue = localStorage.getItem(STORAGE_KEY);
	if (!storedValue) {
		consentState.set(defaultState);
		return;
	}

	try {
		const parsed = JSON.parse(storedValue) as ConsentState;
		if (parsed.analytics === 'granted' || parsed.analytics === 'denied') {
			consentState.set(parsed);
			return;
		}

		consentState.set(defaultState);
	} catch (error) {
		console.warn('Unable to parse stored consent preference', error);
		consentState.set(defaultState);
	}
}

export function persistAnalyticsConsent(choice: Exclude<ConsentChoice, 'unknown'>) {
	const nextState: ConsentState = {
		analytics: choice,
		updatedAt: new Date().toISOString()
	};

	if (browser) {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
	}

	consentState.set(nextState);
}

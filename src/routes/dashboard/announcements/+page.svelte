<script lang="ts">
	import { marked } from 'marked';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
import Icon from '@iconify/svelte';
import type { PageData } from './$types';
import { language, type Language } from '$lib/stores/language';

let { data }: { data: PageData } = $props();

	// Markdown konfigurieren
	marked.setOptions({
		breaks: true,
		gfm: true
	});

	function renderMarkdown(content: string) {
		return marked.parse(content);
	}

	function getTypeColor(type: string) {
		switch (type?.toUpperCase()) {
			case 'INFO': return 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/50';
			case 'WARNING': return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/50';
			case 'SUCCESS': return 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/50';
			case 'ERROR': return 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/50';
			default: return 'bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/50';
		}
	}

	function getTypeIcon(type: string) {
		switch (type?.toUpperCase()) {
			case 'INFO': return 'tabler:info-circle';
			case 'WARNING': return 'tabler:alert-triangle';
			case 'SUCCESS': return 'tabler:circle-check';
			case 'ERROR': return 'tabler:alert-circle';
			default: return 'tabler:bell';
		}
	}

const translations = {
	de: {
		title: 'Ankündigungen',
		subtitle: 'Alle wichtigen Neuigkeiten und Updates von TitanNode',
		noneTitle: 'Keine Ankündigungen',
		noneText: 'Es gibt derzeit keine neuen Ankündigungen',
		infoBoxTitle: 'Über Ankündigungen',
		infoBoxText:
			'Hier findest du alle wichtigen Neuigkeiten, Updates und Wartungsankündigungen von TitanNode. Wir empfehlen, regelmäßig vorbeizuschauen, um auf dem Laufenden zu bleiben.',
		typeInfo: 'Info',
		typeWarning: 'Warnung',
		typeSuccess: 'Erfolg',
		typeError: 'Fehler'
	},
	en: {
		title: 'Announcements',
		subtitle: 'All important news and updates from TitanNode',
		noneTitle: 'No announcements',
		noneText: 'There are currently no new announcements',
		infoBoxTitle: 'About announcements',
		infoBoxText:
			'Here you will find all important news, updates and maintenance announcements from TitanNode. We recommend checking regularly to stay up to date.',
		typeInfo: 'Info',
		typeWarning: 'Warning',
		typeSuccess: 'Success',
		typeError: 'Error'
	}
} satisfies Record<Language, Record<string, string>>;

type TKey = keyof (typeof translations)['de'];

function t(key: TKey): string {
	const lang = $language as Language;
	const dict = translations[lang] ?? translations.de;
	return dict[key] ?? translations.de[key];
}

function getTypeText(type: string) {
	switch (type?.toUpperCase()) {
		case 'INFO':
			return t('typeInfo');
		case 'WARNING':
			return t('typeWarning');
		case 'SUCCESS':
			return t('typeSuccess');
		case 'ERROR':
			return t('typeError');
		default:
			return type;
	}
}

	function formatDate(date: Date) {
		return new Date(date).toLocaleString('de-DE', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}
</script>

<svelte:head>
	<title>{t('title')} | TitanNode Dashboard</title>
</svelte:head>

<div class="space-y-8">
	<div>
		<h1 class="text-2xl sm:text-3xl font-bold flex items-center gap-2 sm:gap-3 flex-wrap">
			<Icon icon="tabler:speakerphone" class="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
			<span>{t('title')}</span>
		</h1>
		<p class="mt-2 text-sm sm:text-base text-muted-foreground">{t('subtitle')}</p>
	</div>

	<!-- Ankündigungen -->
	{#if data.announcements.length > 0}
		<div class="space-y-4">
			{#each data.announcements as announcement}
				<Card class="border-border/50">
					<CardContent class="p-6">
						<div class="flex items-start gap-4">
							<div class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full {getTypeColor(announcement.type)}">
								<Icon icon={getTypeIcon(announcement.type)} class="h-6 w-6" />
							</div>
							<div class="flex-1 space-y-3">
								<div class="flex items-center gap-2 flex-wrap">
									<h3 class="font-semibold text-lg">{announcement.title}</h3>
									<Badge variant="outline" class={getTypeColor(announcement.type)}>
										{getTypeText(announcement.type)}
									</Badge>
								</div>
								<div 
									class="prose prose-sm dark:prose-invert max-w-none prose-headings:mt-4 prose-headings:mb-2 prose-p:text-muted-foreground prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-1 prose-a:text-primary prose-a:underline prose-strong:text-foreground prose-code:text-primary prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-xs"
								>
									{@html renderMarkdown(announcement.description || '')}
								</div>
								<p class="text-xs text-muted-foreground">
									<Icon icon="tabler:clock" class="inline h-3 w-3 mr-1" />
									{formatDate(announcement.createdAt)}
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
			{/each}
		</div>
	{:else}
		<Card class="border-border/50">
			<CardContent class="flex flex-col items-center justify-center py-12">
				<Icon icon="tabler:speakerphone-off" class="h-16 w-16 text-muted-foreground mb-4" />
				<h3 class="text-lg font-semibold mb-2">{t('noneTitle')}</h3>
				<p class="text-sm text-muted-foreground">
					{t('noneText')}
				</p>
			</CardContent>
		</Card>
	{/if}

	<!-- Info Box -->
	<Card class="border-border/50 bg-muted/30">
		<CardContent class="p-6">
			<div class="flex items-start gap-4">
				<Icon icon="tabler:info-circle" class="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
				<div>
					<h3 class="font-semibold mb-2">{t('infoBoxTitle')}</h3>
					<p class="text-sm text-muted-foreground">
						{t('infoBoxText')}
					</p>
				</div>
			</div>
		</CardContent>
	</Card>
</div>


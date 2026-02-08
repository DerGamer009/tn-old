<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import Icon from '@iconify/svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	function formatDate(date: Date) {
		return new Date(date).toLocaleString('de-DE', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	function getAnswersList(answers: Record<string, string>) {
		if (!answers || typeof answers !== 'object') return [];
		return Object.entries(answers).filter(([, v]) => v != null && String(v).trim() !== '');
	}
</script>

<svelte:head>
	<title>Bewerbung: {data.application.jobTitle} | Dashboard | TitanNode</title>
</svelte:head>

<div class="space-y-6">
	<a
		href="/dashboard/bewerbungen"
		class="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
	>
		<Icon icon="tabler:arrow-left" class="h-4 w-4" />
		Zurück zu Meine Bewerbungen
	</a>

	<div>
		<h1 class="text-2xl font-bold flex items-center gap-2 flex-wrap">
			<Icon icon="tabler:briefcase" class="h-7 w-7 text-primary" />
			Bewerbung: {data.application.jobTitle}
		</h1>
		<p class="text-muted-foreground mt-1">
			Eingereicht am {formatDate(data.application.createdAt)}
		</p>
		<div class="mt-2">
			<Badge variant="secondary">{data.application.jobSlug}</Badge>
		</div>
	</div>

	<Card class="border-border/50">
		<CardHeader>
			<CardTitle>Deine Angaben</CardTitle>
		</CardHeader>
		<CardContent class="space-y-4">
			<dl class="grid gap-3 sm:grid-cols-2">
				<div>
					<dt class="text-sm font-medium text-muted-foreground">Name</dt>
					<dd class="text-foreground">{data.application.firstName} {data.application.lastName}</dd>
				</div>
				<div>
					<dt class="text-sm font-medium text-muted-foreground">E-Mail</dt>
					<dd class="text-foreground">{data.application.email}</dd>
				</div>
				{#if data.application.phone}
					<div>
						<dt class="text-sm font-medium text-muted-foreground">Telefon</dt>
						<dd class="text-foreground">{data.application.phone}</dd>
					</div>
				{/if}
			</dl>
			{#if data.application.message}
				<div>
					<dt class="text-sm font-medium text-muted-foreground mb-1">Anschreiben / Nachricht</dt>
					<dd class="rounded-lg border border-border/50 bg-muted/30 p-4 text-sm whitespace-pre-wrap">{data.application.message}</dd>
				</div>
			{/if}
			{#if getAnswersList(data.application.answers as Record<string, string>).length > 0}
				<div>
					<dt class="text-sm font-medium text-muted-foreground mb-2">Fragen & Antworten</dt>
					<dl class="space-y-2 rounded-lg border border-border/50 bg-muted/30 p-4">
						{#each getAnswersList(data.application.answers as Record<string, string>) as [key, value]}
							<div>
								<dt class="text-xs font-medium text-muted-foreground">{key}</dt>
								<dd class="text-sm mt-0.5">{value}</dd>
							</div>
						{/each}
					</dl>
				</div>
			{/if}
		</CardContent>
	</Card>
</div>

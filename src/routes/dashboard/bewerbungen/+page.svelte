<script lang="ts">
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
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
</script>

<svelte:head>
	<title>Meine Bewerbungen - Dashboard | TitanNode</title>
</svelte:head>

<div class="space-y-6">
	<div>
		<h1 class="text-2xl font-bold flex items-center gap-2">
			<Icon icon="tabler:briefcase" class="h-7 w-7 text-primary" />
			Meine Bewerbungen
		</h1>
		<p class="text-muted-foreground mt-1">
			Übersicht deiner eingereichten Bewerbungen bei TitanNode.
		</p>
	</div>

	<Card class="border-border/50">
		<CardHeader>
			<CardTitle>Eingereichte Bewerbungen</CardTitle>
			<CardDescription>
				{#if data.applications.length === 0}
					Du hast noch keine Bewerbung eingereicht.
				{:else}
					{data.applications.length} Bewerbung{data.applications.length !== 1 ? 'en' : ''} insgesamt.
				{/if}
			</CardDescription>
		</CardHeader>
		<CardContent>
			{#if data.applications.length === 0}
				<div class="flex flex-col items-center justify-center py-12 text-center">
					<Icon icon="tabler:file-off" class="h-14 w-14 text-muted-foreground mb-4" />
					<p class="text-muted-foreground mb-4">Noch keine Bewerbungen vorhanden.</p>
					<a href="/careers" class="text-primary hover:underline font-medium">
						Stellenangebote ansehen →
					</a>
				</div>
			{:else}
				<div class="space-y-4">
					{#each data.applications as app}
						<a
							href="/dashboard/bewerbungen/{app.id}"
							class="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border/50 p-4 transition-colors hover:bg-muted/50"
						>
							<div class="min-w-0 flex-1">
								<div class="flex items-center gap-2 flex-wrap">
									<span class="font-medium">{app.jobTitle}</span>
									<Badge variant="secondary" class="text-xs">{app.jobSlug}</Badge>
								</div>
								<p class="text-sm text-muted-foreground mt-1">
									Eingereicht am {formatDate(app.createdAt)}
								</p>
							</div>
							<Icon icon="tabler:chevron-right" class="h-5 w-5 text-muted-foreground shrink-0" />
						</a>
					{/each}
				</div>
			{/if}
		</CardContent>
	</Card>
</div>

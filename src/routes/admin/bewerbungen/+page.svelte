<script lang="ts">
	import { Card, CardContent } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Input } from '$lib/components/ui/input';
	import Icon from '@iconify/svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let searchQuery = $state('');
	let openId = $state<string | null>(null);

	let filteredApplications = $derived(
		data.applications.filter((app) => {
			const q = searchQuery.toLowerCase();
			return (
				app.jobTitle.toLowerCase().includes(q) ||
				app.jobSlug.toLowerCase().includes(q) ||
				app.firstName.toLowerCase().includes(q) ||
				app.lastName.toLowerCase().includes(q) ||
				app.email.toLowerCase().includes(q)
			);
		})
	);

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
	<title>Bewerbungen - Admin | TitanNode</title>
</svelte:head>

<div class="space-y-8">
	<div>
		<h1 class="text-2xl sm:text-3xl font-bold flex items-center gap-2 sm:gap-3 flex-wrap">
			<Icon icon="tabler:briefcase" class="h-8 w-8 text-primary" />
			Bewerbungen
		</h1>
		<p class="mt-2 text-muted-foreground">
			Alle eingegangenen Karriere-Bewerbungen (neueste zuerst).
		</p>
	</div>

	<Card class="border-border/50">
		<CardContent class="pt-6">
			<div class="mb-4">
				<Input
					type="search"
					placeholder="Suchen nach Name, E-Mail, Stelle…"
					bind:value={searchQuery}
					class="max-w-md"
				/>
			</div>
			{#if filteredApplications.length === 0}
				<p class="py-8 text-center text-muted-foreground">
					{searchQuery ? 'Keine Bewerbungen passen zur Suche.' : 'Noch keine Bewerbungen eingegangen.'}
				</p>
			{:else}
				<div class="space-y-2">
					{#each filteredApplications as app}
						<Card class="border-border/60 overflow-hidden">
							<button
								type="button"
								class="w-full text-left flex flex-wrap items-center justify-between gap-4 p-4 hover:bg-muted/30 transition-colors"
								onclick={() => (openId = openId === app.id ? null : app.id)}
							>
								<div class="min-w-0 flex-1 flex flex-wrap items-center gap-3">
									<span class="font-medium">
										{app.firstName} {app.lastName}
									</span>
									<Badge variant="secondary" class="text-xs">{app.jobTitle}</Badge>
									<span class="text-sm text-muted-foreground truncate">{app.email}</span>
									{#if app.user}
										<Badge variant="outline" class="text-xs">Kunde</Badge>
									{/if}
								</div>
								<div class="flex items-center gap-2 shrink-0">
									<span class="text-xs text-muted-foreground whitespace-nowrap">
										{formatDate(app.createdAt)}
									</span>
									<Icon
										icon={openId === app.id ? 'tabler:chevron-up' : 'tabler:chevron-down'}
										class="h-5 w-5 text-muted-foreground"
									/>
								</div>
							</button>
							{#if openId === app.id}
								<div class="border-t border-border/60 px-4 py-4 space-y-4 bg-muted/20">
									<div class="grid gap-2 text-sm sm:grid-cols-2">
										<div><span class="text-muted-foreground">Stelle:</span> {app.jobTitle} ({app.jobSlug})</div>
										<div><span class="text-muted-foreground">E-Mail:</span> <a href="mailto:{app.email}" class="text-primary hover:underline">{app.email}</a></div>
										{#if app.phone}
											<div><span class="text-muted-foreground">Telefon:</span> {app.phone}</div>
										{/if}
										{#if app.user}
											<div><span class="text-muted-foreground">Kunden-Account:</span> {app.user.firstName} {app.user.lastName} ({app.user.email})</div>
										{/if}
									</div>
									{#if app.message}
										<div>
											<span class="text-muted-foreground text-sm">Anschreiben:</span>
											<p class="mt-1 rounded border border-border/50 bg-background/50 p-3 text-sm whitespace-pre-wrap">{app.message}</p>
										</div>
									{/if}
									{#if getAnswersList(app.answers as Record<string, string>).length > 0}
										<div>
											<span class="text-muted-foreground text-sm">Fragen & Antworten:</span>
											<dl class="mt-1 space-y-1 rounded border border-border/50 bg-background/50 p-3 text-sm">
												{#each getAnswersList(app.answers as Record<string, string>) as [key, value]}
													<div>
														<dt class="font-medium text-muted-foreground">{key}</dt>
														<dd class="ml-0 mt-0.5">{value}</dd>
													</div>
												{/each}
											</dl>
										</div>
									{/if}
								</div>
							{/if}
						</Card>
					{/each}
				</div>
			{/if}
		</CardContent>
	</Card>
</div>

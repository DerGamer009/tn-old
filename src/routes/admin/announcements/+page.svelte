<script lang="ts">
	import { marked } from 'marked';
	import { enhance } from '$app/forms';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '$lib/components/ui/dialog';
	import Icon from '@iconify/svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let isDialogOpen = $state(false);

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

	function getTypeText(type: string) {
		switch (type?.toUpperCase()) {
			case 'INFO': return 'Info';
			case 'WARNING': return 'Warnung';
			case 'SUCCESS': return 'Erfolg';
			case 'ERROR': return 'Fehler';
			default: return type;
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
	<title>Ankündigungen - Admin | TitanNode</title>
</svelte:head>

<div class="space-y-8">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-2xl sm:text-3xl font-bold flex items-center gap-2 sm:gap-3 flex-wrap">
				<Icon icon="tabler:speakerphone" class="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
				<span>Ankündigungen</span>
			</h1>
			<p class="mt-2 text-sm sm:text-base text-muted-foreground">Erstelle und verwalte Ankündigungen für alle Kunden</p>
		</div>

		<Dialog bind:open={isDialogOpen}>
			<DialogTrigger>
				<Button class="gap-2">
					<Icon icon="tabler:plus" class="h-4 w-4" />
					Ankündigung erstellen
				</Button>
			</DialogTrigger>
			<DialogContent class="max-w-2xl">
				<DialogHeader>
					<DialogTitle>Neue Ankündigung erstellen</DialogTitle>
					<DialogDescription>Erstelle eine neue Ankündigung für alle Kunden</DialogDescription>
				</DialogHeader>
				<form method="POST" action="?/create" use:enhance={() => {
					return async ({ update }) => {
						await update();
						isDialogOpen = false;
					};
				}}>
					<div class="grid gap-4 py-4">
						<div class="space-y-2">
							<Label for="title">Titel</Label>
							<Input id="title" name="title" placeholder="Wichtige Ankündigung" required />
						</div>

						<div class="space-y-2">
							<Label for="content">Nachricht (Markdown unterstützt)</Label>
							<textarea
								id="content"
								name="content"
								rows="8"
								class="flex min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono"
								placeholder="Beschreibe die Ankündigung in Markdown...&#10;&#10;Beispiel:&#10;# Überschrift&#10;**Fett** oder *kursiv*&#10;- Liste Punkt 1&#10;- Liste Punkt 2"
								required
							></textarea>
							<p class="text-xs text-muted-foreground">
								Markdown wird unterstützt. Unterstützte Formatierungen: Überschriften, **Fett**, *Kursiv*, Listen, Links, etc.
							</p>
						</div>

						<div class="space-y-2">
							<Label for="type">Typ</Label>
							<select
								id="type"
								name="type"
								class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
								required
							>
								<option value="info">Info</option>
								<option value="success">Erfolg</option>
								<option value="warning">Warnung</option>
								<option value="error">Fehler</option>
							</select>
						</div>
					</div>

					<div class="flex justify-end gap-2">
						<Button type="button" variant="outline" onclick={() => isDialogOpen = false}>
							Abbrechen
						</Button>
						<Button type="submit">Ankündigung erstellen</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	</div>

	<!-- Statistiken -->
	<div class="grid gap-6 sm:grid-cols-4">
		<Card class="border-border/50">
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium text-muted-foreground">Gesamt</CardTitle>
				<Icon icon="tabler:speakerphone" class="h-5 w-5 text-blue-500" />
			</CardHeader>
			<CardContent>
				<div class="text-3xl font-bold">{data.announcements.length}</div>
			</CardContent>
		</Card>

		<Card class="border-border/50">
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium text-muted-foreground">Info</CardTitle>
				<Icon icon="tabler:info-circle" class="h-5 w-5 text-blue-500" />
			</CardHeader>
			<CardContent>
				<div class="text-3xl font-bold">
					{data.announcements.filter(a => a.type === 'INFO').length}
				</div>
			</CardContent>
		</Card>

		<Card class="border-border/50">
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium text-muted-foreground">Warnungen</CardTitle>
				<Icon icon="tabler:alert-triangle" class="h-5 w-5 text-yellow-500" />
			</CardHeader>
			<CardContent>
				<div class="text-3xl font-bold">
					{data.announcements.filter(a => a.type === 'WARNING').length}
				</div>
			</CardContent>
		</Card>

		<Card class="border-border/50">
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium text-muted-foreground">Erfolge</CardTitle>
				<Icon icon="tabler:circle-check" class="h-5 w-5 text-green-500" />
			</CardHeader>
			<CardContent>
				<div class="text-3xl font-bold">
					{data.announcements.filter(a => a.type === 'SUCCESS').length}
				</div>
			</CardContent>
		</Card>
	</div>

	<!-- Ankündigungen Liste -->
	<div class="space-y-4">
		{#if data.announcements.length > 0}
			{#each data.announcements as announcement}
				<Card class="border-border/50">
					<CardContent class="p-6">
						<div class="flex items-start justify-between gap-4">
							<div class="flex items-start gap-4 flex-1">
								<div class="flex h-12 w-12 items-center justify-center rounded-full {getTypeColor(announcement.type)}">
									<Icon icon={getTypeIcon(announcement.type)} class="h-6 w-6" />
								</div>
								<div class="flex-1 space-y-2">
									<div class="flex items-center gap-2">
										<h3 class="font-semibold text-lg">{announcement.title}</h3>
										<Badge variant="outline" class={getTypeColor(announcement.type)}>
											{getTypeText(announcement.type)}
										</Badge>
									</div>
									<div 
										class="prose prose-sm dark:prose-invert max-w-none prose-headings:mt-4 prose-headings:mb-2 prose-p:text-muted-foreground prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-1 prose-a:text-primary prose-a:underline prose-strong:text-foreground prose-code:text-primary prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-xs text-sm"
									>
										{@html renderMarkdown(announcement.description || '')}
									</div>
									<p class="text-xs text-muted-foreground">
										Erstellt am {formatDate(announcement.createdAt)}
									</p>
								</div>
							</div>
							<form method="POST" action="?/delete" use:enhance>
								<input type="hidden" name="id" value={announcement.id} />
								<Button type="submit" variant="outline" size="sm" class="text-red-500 hover:text-red-600">
									<Icon icon="tabler:trash" class="h-4 w-4" />
								</Button>
							</form>
						</div>
					</CardContent>
				</Card>
			{/each}
		{:else}
			<Card class="border-border/50">
				<CardContent class="flex flex-col items-center justify-center py-12">
					<Icon icon="tabler:speakerphone-off" class="h-16 w-16 text-muted-foreground mb-4" />
					<h3 class="text-lg font-semibold mb-2">Keine Ankündigungen</h3>
					<p class="text-sm text-muted-foreground mb-4">
						Erstelle deine erste Ankündigung für alle Kunden
					</p>
					<Button onclick={() => isDialogOpen = true}>
						<Icon icon="tabler:plus" class="mr-2 h-4 w-4" />
						Ankündigung erstellen
					</Button>
				</CardContent>
			</Card>
		{/if}
	</div>
</div>


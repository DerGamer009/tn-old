<script lang="ts">
	import { enhance } from '$app/forms';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import Icon from '@iconify/svelte';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	let job = $derived.by(() => data.job);
	let submitting = $state(false);

	function handleEnhance() {
		submitting = true;
		return async ({ result, update }: { result: any; update: () => Promise<void> }) => {
			await update();
			submitting = false;
		};
	}
</script>

<svelte:head>
	<title>Bewerben: {job.title} | Karriere TitanNode</title>
	<meta name="description" content="Bewirb dich als {job.title} bei TitanNode." />
</svelte:head>

<div class="min-h-screen py-12">
	<div class="container mx-auto px-4">
		<a href="/careers/{job.slug}" class="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
			<Icon icon="tabler:arrow-left" class="h-4 w-4" />
			Zurück zu {job.title}
		</a>

		<div class="mx-auto max-w-2xl">
			<div class="mb-8">
				<h1 class="text-3xl font-bold tracking-tight">Bewerbung: {job.title}</h1>
				<p class="mt-2 text-muted-foreground">
					Fülle das Formular aus. Fragen passen wir an die ausgeschriebene Position an.
				</p>
			</div>

			<form method="POST" action="?/submit" use:enhance={handleEnhance} class="space-y-6">
				<Card class="border-border/50">
					<CardHeader>
						<CardTitle>Persönliche Daten</CardTitle>
						<CardDescription>Name und Kontakt</CardDescription>
					</CardHeader>
					<CardContent class="space-y-4">
						<div class="grid gap-4 sm:grid-cols-2">
							<div class="space-y-2">
								<Label for="firstName">Vorname *</Label>
								<Input id="firstName" name="firstName" type="text" required placeholder="Max" />
							</div>
							<div class="space-y-2">
								<Label for="lastName">Nachname *</Label>
								<Input id="lastName" name="lastName" type="text" required placeholder="Mustermann" />
							</div>
						</div>
						<div class="space-y-2">
							<Label for="email">E-Mail *</Label>
							<Input id="email" name="email" type="email" required placeholder="max@beispiel.de" />
						</div>
						<div class="space-y-2">
							<Label for="phone">Telefon</Label>
							<Input id="phone" name="phone" type="tel" placeholder="+49 123 456789" />
						</div>
						<div class="space-y-2">
							<Label for="message">Anschreiben / Nachricht</Label>
							<textarea
								id="message"
								name="message"
								rows="4"
								class="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
								placeholder="Kurze Vorstellung und warum du zu uns passt …"
							></textarea>
						</div>
					</CardContent>
				</Card>

				{#if job.applicationQuestions.length > 0}
					<Card class="border-border/50">
						<CardHeader>
							<CardTitle>Fragen zur Position</CardTitle>
							<CardDescription>Antworten zu dieser Stelle ({job.title})</CardDescription>
						</CardHeader>
						<CardContent class="space-y-4">
							{#each job.applicationQuestions as q (q.id)}
								<div class="space-y-2">
									<Label for="q_{q.id}">
										{q.label}
										{#if q.required}<span class="text-destructive">*</span>{/if}
									</Label>
									{#if q.type === 'textarea'}
										<textarea
											id="q_{q.id}"
											name="q_{q.id}"
											rows="3"
											required={q.required}
											placeholder={q.placeholder}
											class="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
										></textarea>
									{:else if q.type === 'select'}
										<select
											id="q_{q.id}"
											name="q_{q.id}"
											required={q.required}
											class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
										>
											<option value="">Bitte wählen</option>
											{#each q.options || [] as opt}
												<option value={opt.value}>{opt.label}</option>
											{/each}
										</select>
									{:else}
										<Input
											id="q_{q.id}"
											name="q_{q.id}"
											type={q.type}
											required={q.required}
											placeholder={q.placeholder}
										/>
									{/if}
								</div>
							{/each}
						</CardContent>
					</Card>
				{/if}

				{#if form?.error}
					<div class="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
						{form.error}
					</div>
				{/if}

				{#if form?.success}
					<div class="rounded-lg border border-green-500/50 bg-green-500/10 p-4 text-sm text-green-700 dark:text-green-400">
						Vielen Dank! Deine Bewerbung wurde übermittelt. Wir melden uns bei dir.
					</div>
				{:else}
					<div class="flex gap-4">
						<Button type="submit" size="lg" class="gap-2" disabled={submitting}>
							{#if submitting}
								<Icon icon="tabler:loader-2" class="h-5 w-5 animate-spin" />
								Wird gesendet…
							{:else}
								<Icon icon="tabler:send" class="h-5 w-5" />
								Bewerbung absenden
							{/if}
						</Button>
						<a href="/careers/{job.slug}">
							<Button type="button" variant="outline" size="lg" disabled={submitting}>Abbrechen</Button>
						</a>
					</div>
				{/if}
			</form>

			<p class="mt-6 text-xs text-muted-foreground">
				Zusätzlich kannst du uns deinen Lebenslauf an jobs@titannode.com senden. Nenne dabei die Stelle „{job.title}“.
			</p>
		</div>
	</div>
</div>

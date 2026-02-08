<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { enhance } from '$app/forms';
	import { Globe, ShoppingCart, Loader2, CheckCircle2, ArrowRight } from '@lucide/svelte';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	let submitted = $state(false);
</script>

<svelte:head>
	<title>Domain bestellen | TitanNode</title>
	<meta name="description" content="Domain über TitanNode bestellen – wir kümmern uns um die Registrierung." />
</svelte:head>

<div class="min-h-screen bg-background">
	<section class="border-b py-16 sm:py-24">
		<div class="container mx-auto max-w-xl px-4">
			<div class="mb-8 text-center">
				<Globe class="mx-auto h-12 w-12 text-primary mb-4" />
				<h1 class="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Domain bestellen</h1>
				<p class="mt-2 text-muted-foreground">Wir registrieren die Domain für dich und verknüpfen sie auf Wunsch mit deinem Service.</p>
			</div>

			{#if form?.success}
				<Card class="rounded-2xl border-emerald-500/30 bg-emerald-500/5">
					<CardContent class="pt-6">
						<div class="flex items-start gap-4">
							<CheckCircle2 class="h-10 w-10 text-emerald-600 dark:text-emerald-400 shrink-0" />
							<div>
								<h2 class="font-semibold text-foreground">Anfrage gesendet</h2>
								<p class="mt-1 text-sm text-muted-foreground">
									Deine Bestellanfrage für <strong>{form.domain}</strong> wurde als Support-Ticket erstellt. Unser Team meldet sich zeitnah bei dir im Dashboard unter „Support Tickets“.
								</p>
								<Button class="mt-4 gap-2" href="/dashboard/tickets">
									Zum Ticket
									<ArrowRight class="h-4 w-4" />
								</Button>
							</div>
						</div>
					</CardContent>
				</Card>
			{:else if !data.user}
				<Card class="rounded-2xl border-border/60">
					<CardHeader>
						<CardTitle>Anmeldung nötig</CardTitle>
						<CardDescription>
							Domains kannst du nur als angemeldeter Kunde über uns bestellen. So können wir die Bestellung deinem Konto zuordnen und dich per Ticket auf dem Laufenden halten.
						</CardDescription>
					</CardHeader>
					<CardContent class="space-y-4">
						{#if data.domain}
							<p class="text-sm text-muted-foreground">Gewünschte Domain: <strong class="text-foreground">{data.domain}</strong></p>
						{/if}
						<div class="flex flex-wrap gap-3">
							<Button href="/login?redirect={encodeURIComponent('/domain/bestellen' + (data.domain ? '?domain=' + encodeURIComponent(data.domain) : ''))}">
								Anmelden
							</Button>
							<Button variant="outline" href="/register">
								Account erstellen
							</Button>
						</div>
						<p class="text-xs text-muted-foreground">
							<a href="/domain" class="underline hover:text-foreground">Zurück zur Domain-Suche</a>
						</p>
					</CardContent>
				</Card>
			{:else}
				<Card class="rounded-2xl border-border/60">
					<CardHeader>
						<CardTitle class="flex items-center gap-2">
							<ShoppingCart class="h-5 w-5 text-primary" />
							Bestellanfrage
						</CardTitle>
						<CardDescription>
							Wir erstellen ein Support-Ticket für deine Domain-Bestellung und melden uns mit den nächsten Schritten.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<form
							method="POST"
							action="?/order"
							use:enhance
							class="space-y-4"
						>
							<div class="space-y-2">
								<Label for="domain">Domain *</Label>
								{#if data.domain}
									<input type="hidden" name="domain" value={data.domain} />
									<Input id="domain" type="text" value={data.domain} readonly class="bg-muted/50" />
								{:else}
									<Input
										id="domain"
										name="domain"
										type="text"
										placeholder="z.B. meineseite.de"
										required
									/>
									<p class="text-xs text-muted-foreground"><a href="/domain" class="underline">Zuerst Verfügbarkeit prüfen</a></p>
								{/if}
							</div>
							<div class="space-y-2">
								<Label for="message">Nachricht (optional)</Label>
								<Textarea
									id="message"
									name="message"
									rows="3"
									placeholder="z.B. Wunsch-Laufzeit, Nameserver oder besondere Anforderungen"
									class="resize-none"
								/>
							</div>
							{#if form?.error}
								<p class="text-sm text-destructive">{form.error}</p>
							{/if}
							<div class="flex gap-3">
								<Button type="submit" class="gap-2">
									Bestellanfrage senden
								</Button>
								<Button type="button" variant="outline" href="/domain">
									Abbrechen
								</Button>
							</div>
						</form>
					</CardContent>
				</Card>
			{/if}
		</div>
	</section>
</div>

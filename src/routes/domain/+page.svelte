<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Globe, Search, CheckCircle2, XCircle, Loader2, ArrowRight, Shield, ShoppingCart } from '@lucide/svelte';
	import { enhance } from '$app/forms';

	/** Bestell-URL über TitanNode (Support-Ticket) */
	function getOrderUrl(domain: string): string {
		return `/domain/bestellen?domain=${encodeURIComponent(domain)}`;
	}

	type ResultItem = {
		domain: string;
		available: boolean;
		priceFormatted?: string;
		currency?: string;
		period?: number;
		error?: string;
	};

	let formResult = $state<{
		success?: boolean;
		name?: string;
		results?: ResultItem[];
		error?: string;
	} | null>(null);
	let nameInput = $state('');
	let isSubmitting = $state(false);

	function handleSubmit() {
		isSubmitting = true;
		formResult = null;
	}

	function handleResult({ result }: { result: unknown }) {
		isSubmitting = false;
		const data = result && typeof result === 'object' && 'data' in result ? (result as { data?: Record<string, unknown> }).data : undefined;
		if (data) {
			formResult = data as typeof formResult;
			if (data.name && typeof data.name === 'string') nameInput = data.name;
		}
	}
</script>

<svelte:head>
	<title>Domain prüfen | TitanNode</title>
	<meta name="description" content="Prüfe deine Wunschdomain in allen gängigen Endungen – .de, .com, .net und mehr." />
</svelte:head>

<div class="min-h-screen bg-background">
	<!-- Hero -->
	<section class="relative overflow-hidden border-b">
		<div class="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.12),_transparent_50%),_radial-gradient(ellipse_80%_60%_at_50%_-20%,var(--primary)/0.08),linear-gradient(to_bottom,transparent,var(--background))] dark:bg-[linear-gradient(135deg,_#1e293b_0%,_#0f172a_50%,_#1a2332_100%)]"></div>
		<div class="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,var(--background)_70%)]"></div>
		<div class="container relative mx-auto max-w-4xl px-4 py-20 sm:py-28">
			<div class="mx-auto max-w-2xl text-center">
				<Badge variant="secondary" class="mb-6 inline-flex items-center gap-2 px-4 py-2 border border-primary/20">
					<Globe class="h-4 w-4 text-primary" />
					Domain-Check
				</Badge>
				<h1 class="mb-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
					Dein Name in
					<span class="block bg-gradient-to-r from-primary via-sky-400 to-primary/80 bg-clip-text text-transparent">allen Endungen</span>
				</h1>
				<p class="text-lg text-muted-foreground">
					Gib nur den Namen ein – wir prüfen .de, .com, .net, .org, .io, .eu, .co und .info auf einen Schlag.
				</p>
			</div>
		</div>
	</section>

	<!-- Search + Result -->
	<section class="py-16 sm:py-24">
		<div class="container mx-auto max-w-2xl px-4">
			<Card class="rounded-2xl border-border/60 bg-card/80 shadow-lg backdrop-blur-sm">
				<CardHeader class="pb-4">
					<CardTitle class="flex items-center gap-2 text-xl">
						<Search class="h-5 w-5 text-primary" />
						Domain-Namen prüfen
					</CardTitle>
					<CardDescription>
						Nur den Namen eingeben (ohne .de, .com usw.) – z.B. <strong>icesmp</strong> oder <strong>meineseite</strong>.
					</CardDescription>
				</CardHeader>
				<CardContent class="space-y-6">
					<form
						method="POST"
						action="?/check"
						use:enhance={() => {
							handleSubmit();
							return async ({ result }) => {
								handleResult({ result });
							};
						}}
						class="flex flex-col gap-4 sm:flex-row"
					>
						<div class="flex-1 space-y-2">
							<Label for="name" class="sr-only">Domain-Name</Label>
							<Input
								id="name"
								name="name"
								type="text"
								placeholder="z.B. icesmp"
								class="h-12 rounded-xl bg-background/80"
								bind:value={nameInput}
								disabled={isSubmitting}
								required
							/>
						</div>
						<Button
							type="submit"
							class="h-12 gap-2 rounded-xl px-6 shadow-md shadow-primary/20"
							disabled={isSubmitting}
						>
							{#if isSubmitting}
								<Loader2 class="h-5 w-5 animate-spin" />
								Prüfen…
							{:else}
								<Search class="h-5 w-5" />
								Alle Endungen prüfen
							{/if}
						</Button>
					</form>

					{#if formResult?.error}
						<div class="rounded-xl border border-destructive/50 bg-destructive/10 p-4 flex items-start gap-3">
							<XCircle class="h-5 w-5 text-destructive shrink-0 mt-0.5" />
							<p class="text-sm text-destructive font-medium">{formResult.error}</p>
						</div>
					{/if}

					{#if formResult?.results && formResult.results.length > 0}
						<div class="space-y-3">
							<div class="rounded-xl border border-border/60 overflow-hidden">
								<div class="overflow-x-auto">
									<table class="w-full text-sm">
									<thead>
										<tr class="border-b border-border/60 bg-muted/30">
											<th class="px-4 py-3 text-left font-semibold text-foreground">Domain</th>
											<th class="px-4 py-3 text-left font-semibold text-foreground">Status</th>
											<th class="px-4 py-3 text-right font-semibold text-foreground">Preis (GoDaddy)</th>
											<th class="px-4 py-3 text-right font-semibold text-foreground w-32">Aktion</th>
										</tr>
									</thead>
										<tbody>
											{#each formResult.results as item}
												<tr class="border-b border-border/40 last:border-0 hover:bg-muted/20 transition-colors">
													<td class="px-4 py-3 font-medium text-foreground">{item.domain}</td>
													<td class="px-4 py-3">
														{#if item.error}
															<span class="text-destructive text-xs" title={item.error}>Fehler</span>
														{:else if item.available}
															<Badge class="bg-emerald-600 text-white gap-1">
																<CheckCircle2 class="h-3 w-3" />
																Verfügbar
															</Badge>
														{:else}
															<Badge variant="secondary" class="gap-1">
																<XCircle class="h-3 w-3" />
																Vergeben
															</Badge>
														{/if}
													</td>
													<td class="px-4 py-3 text-right">
														{#if item.error}
															<span class="text-muted-foreground text-xs">–</span>
														{:else if item.available && item.priceFormatted}
															<span class="font-medium text-foreground">{item.priceFormatted}</span>
															{#if item.period && item.period > 1}
																<span class="text-muted-foreground text-xs"> / {item.period} Jahre</span>
															{:else if item.period === 1}
																<span class="text-muted-foreground text-xs"> / Jahr</span>
															{/if}
														{:else}
															<span class="text-muted-foreground">–</span>
														{/if}
													</td>
													<td class="px-4 py-3 text-right">
														{#if !item.error && item.available}
															<a
																href={getOrderUrl(item.domain)}
																class="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
															>
																<ShoppingCart class="h-3.5 w-3.5" />
																Bestellen
															</a>
														{:else}
															<span class="text-muted-foreground text-xs">–</span>
														{/if}
													</td>
												</tr>
											{/each}
										</tbody>
									</table>
								</div>
							</div>
							<p class="text-xs text-muted-foreground">
								Preise von der <a href="https://developer.godaddy.com/doc/endpoint/domains" target="_blank" rel="noopener noreferrer" class="underline hover:text-foreground">GoDaddy Domains API</a>. Unverbindlich. „Bestellen“ erstellt eine Bestellanfrage über uns – wir registrieren die Domain für dich.
							</p>
						</div>
					{/if}
				</CardContent>
			</Card>

			<p class="mt-6 flex items-center justify-center gap-2 text-center text-sm text-muted-foreground">
				<Shield class="h-4 w-4 shrink-0" />
				Prüfung über die GoDaddy-API. Es werden keine Daten gespeichert.
			</p>
		</div>
	</section>

	<!-- CTA -->
	<section class="border-t bg-muted/15 py-16">
		<div class="container mx-auto max-w-3xl px-4 text-center">
			<h2 class="mb-3 text-2xl font-bold tracking-tight text-foreground">Domain gefunden?</h2>
			<p class="mb-6 text-muted-foreground">
				Wir unterstützen dich bei der Registrierung und dem Anbinden an deinen Server.
			</p>
			<div class="flex flex-wrap justify-center gap-4">
				<Button size="lg" class="gap-2" href="/support">
					Domain-Registrierung anfragen
					<ArrowRight class="h-5 w-5" />
				</Button>
				<Button size="lg" variant="outline" href="/vps">
					VPS Hosting
				</Button>
			</div>
		</div>
	</section>
</div>

<script lang="ts">
	import { enhance } from '$app/forms';
	import { onMount } from 'svelte';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Separator } from '$lib/components/ui/separator';
	import Icon from '@iconify/svelte';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	let selectedPaymentMethod = $state<'paypal' | 'klarna' | 'credits'>('paypal');

	onMount(() => {
		if (form?.klarnaClientToken && typeof window !== 'undefined') {
			const script = document.createElement('script');
			script.src = 'https://x.klarnacdn.net/kp/lib/v1/api.js';
			script.async = true;
			script.onload = () => {
				if ((window as any).Klarna && form?.klarnaClientToken) {
					(window as any).Klarna.Load({
						container: '#klarna-container',
						payment_method_category: 'pay_later',
						client_token: form.klarnaClientToken
					});
				}
			};
			document.head.appendChild(script);
		}
	});
</script>

<svelte:head>
	<title>Checkout - Gameserver bestellen | TitanNode</title>
</svelte:head>

<div class="max-w-3xl mx-auto space-y-6">
	<!-- Header -->
	<div>
		<h1 class="text-2xl sm:text-3xl font-bold flex items-center gap-2 sm:gap-3 flex-wrap">
			<Icon icon="tabler:credit-card" class="h-8 w-8 text-primary" />
			Checkout
		</h1>
		<p class="mt-2 text-muted-foreground">Zahlung abschließen</p>
	</div>

	<div class="grid gap-6 lg:grid-cols-3">
		<!-- Checkout Form -->
		<div class="lg:col-span-2 space-y-6">
			<!-- Order Summary -->
			<Card class="border-border/50">
				<CardHeader>
					<CardTitle>Bestellübersicht</CardTitle>
				</CardHeader>
				<CardContent class="space-y-3">
					<div class="flex justify-between text-sm">
						<span class="text-muted-foreground">Server-Name:</span>
						<span class="font-medium">{data.name}</span>
					</div>
					<div class="flex justify-between text-sm">
						<span class="text-muted-foreground">Spiel:</span>
						<span class="font-medium">{data.game}</span>
					</div>
					<div class="flex justify-between text-sm">
						<span class="text-muted-foreground">CPU:</span>
						<span class="font-medium">{data.cpu} vCores</span>
					</div>
					<div class="flex justify-between text-sm">
						<span class="text-muted-foreground">RAM:</span>
						<span class="font-medium">{data.ram} GB</span>
					</div>
					<div class="flex justify-between text-sm">
						<span class="text-muted-foreground">Storage:</span>
						<span class="font-medium">{data.storage} GB</span>
					</div>
					<div class="flex justify-between text-sm">
						<span class="text-muted-foreground">Slots:</span>
						<span class="font-medium">{data.slots}</span>
					</div>
					{#if data.javaVersion}
						<div class="flex justify-between text-sm">
							<span class="text-muted-foreground">Java:</span>
							<span class="font-medium">{data.javaVersion.includes('java_') ? data.javaVersion.replace('ghcr.io/ptero-eggs/yolks:', '').replace('java_', 'Java ') : data.javaVersion}</span>
						</div>
					{/if}
				</CardContent>
			</Card>

			<!-- Payment Method Selection -->
			<Card class="border-border/50">
				<CardHeader>
					<CardTitle>Zahlungsmethode</CardTitle>
					<CardDescription>Wähle deine bevorzugte Zahlungsmethode</CardDescription>
				</CardHeader>
				<CardContent>
					<div class="space-y-3">
						<button
							class="w-full rounded-lg border-2 p-4 text-left transition-all hover:border-primary/50 {selectedPaymentMethod === 'paypal' ? 'border-primary bg-primary/10' : 'border-border'}"
							onclick={() => (selectedPaymentMethod = 'paypal')}
						>
							<div class="flex items-center justify-between">
								<div class="flex items-center gap-3">
									<Icon icon="tabler:brand-paypal" class="h-6 w-6" />
									<div>
										<div class="font-semibold">PayPal</div>
										<div class="text-xs text-muted-foreground">Schnell und sicher</div>
									</div>
								</div>
								{#if selectedPaymentMethod === 'paypal'}
									<Icon icon="tabler:check" class="h-5 w-5 text-primary" />
								{/if}
							</div>
						</button>

						<button
							class="w-full rounded-lg border-2 p-4 text-left transition-all hover:border-primary/50 {selectedPaymentMethod === 'klarna' ? 'border-primary bg-primary/10' : 'border-border'}"
							onclick={() => (selectedPaymentMethod = 'klarna')}
						>
							<div class="flex items-center justify-between">
								<div class="flex items-center gap-3">
									<Icon icon="tabler:credit-card" class="h-6 w-6" />
									<div>
										<div class="font-semibold">Klarna</div>
										<div class="text-xs text-muted-foreground">Später bezahlen</div>
									</div>
								</div>
								{#if selectedPaymentMethod === 'klarna'}
									<Icon icon="tabler:check" class="h-5 w-5 text-primary" />
								{/if}
							</div>
						</button>

						{#if data.credits >= data.price}
							<button
								class="w-full rounded-lg border-2 p-4 text-left transition-all hover:border-primary/50 {selectedPaymentMethod === 'credits' ? 'border-primary bg-primary/10' : 'border-border'}"
								onclick={() => (selectedPaymentMethod = 'credits')}
							>
								<div class="flex items-center justify-between">
									<div class="flex items-center gap-3">
										<Icon icon="tabler:wallet" class="h-6 w-6" />
										<div>
											<div class="font-semibold">Guthaben</div>
											<div class="text-xs text-muted-foreground">Verfügbar: €{data.credits.toFixed(2)}</div>
										</div>
									</div>
									{#if selectedPaymentMethod === 'credits'}
										<Icon icon="tabler:check" class="h-5 w-5 text-primary" />
									{/if}
								</div>
							</button>
						{:else}
							<div class="w-full rounded-lg border-2 p-4 text-left border-border opacity-50">
								<div class="flex items-center gap-3">
									<Icon icon="tabler:wallet" class="h-6 w-6" />
									<div>
										<div class="font-semibold">Guthaben</div>
										<div class="text-xs text-muted-foreground">Nicht genügend Guthaben (Verfügbar: €{data.credits.toFixed(2)})</div>
									</div>
								</div>
							</div>
						{/if}
					</div>
				</CardContent>
			</Card>

			<!-- Klarna Checkout -->
			{#if selectedPaymentMethod === 'klarna' && form?.klarnaClientToken}
				<Card class="border-border/50">
					<CardHeader>
						<CardTitle>Klarna Zahlung</CardTitle>
						<CardDescription>Gib deine Zahlungsdaten ein</CardDescription>
					</CardHeader>
					<CardContent>
						<div id="klarna-container" class="min-h-[400px]">
							<p class="text-muted-foreground">Klarna Checkout wird geladen...</p>
						</div>
					</CardContent>
				</Card>
			{:else if selectedPaymentMethod === 'klarna'}
				<Card class="border-border/50">
					<CardHeader>
						<CardTitle>Zahlung abschließen</CardTitle>
						<CardDescription>Starte deine Klarna-Zahlung</CardDescription>
					</CardHeader>
					<CardContent>
						<form method="POST" action="?/processPayment" use:enhance>
							<input type="hidden" name="paymentMethod" value="klarna" />
							<input type="hidden" name="name" value={data.name} />
							<input type="hidden" name="cpu" value={data.cpu} />
							<input type="hidden" name="ram" value={data.ram} />
							<input type="hidden" name="storage" value={data.storage} />
							<input type="hidden" name="slots" value={data.slots} />
							<input type="hidden" name="game" value={data.game} />
							<input type="hidden" name="eggId" value={data.eggId} />
							<input type="hidden" name="locationId" value={data.locationId} />
							<input type="hidden" name="nestId" value={data.nestId} />
							<input type="hidden" name="price" value={data.price} />
							{#if data.javaVersion}
								<input type="hidden" name="javaVersion" value={data.javaVersion} />
							{/if}
							<Button type="submit" size="lg" class="w-full touch-manipulation">
								<Icon icon="tabler:credit-card" class="mr-2 h-5 w-5" />
								Zahlung starten
							</Button>
						</form>
					</CardContent>
				</Card>
			{/if}

			<!-- PayPal Checkout Button -->
			{#if selectedPaymentMethod === 'paypal'}
				<Card class="border-border/50">
					<CardHeader>
						<CardTitle>Zahlung abschließen</CardTitle>
						<CardDescription>Du wirst zu PayPal weitergeleitet, um die Zahlung abzuschließen</CardDescription>
					</CardHeader>
					<CardContent>
						<form method="POST" action="?/processPayment" use:enhance>
							<input type="hidden" name="paymentMethod" value="paypal" />
							<input type="hidden" name="name" value={data.name} />
							<input type="hidden" name="cpu" value={data.cpu} />
							<input type="hidden" name="ram" value={data.ram} />
							<input type="hidden" name="storage" value={data.storage} />
							<input type="hidden" name="slots" value={data.slots} />
							<input type="hidden" name="game" value={data.game} />
							<input type="hidden" name="eggId" value={data.eggId} />
							<input type="hidden" name="locationId" value={data.locationId} />
							<input type="hidden" name="price" value={data.price} />
							{#if data.javaVersion}
								<input type="hidden" name="javaVersion" value={data.javaVersion} />
							{/if}
							<Button type="submit" size="lg" class="w-full touch-manipulation">
								<Icon icon="tabler:brand-paypal" class="mr-2 h-5 w-5" />
								Mit PayPal bezahlen
							</Button>
						</form>
					</CardContent>
				</Card>
			{/if}

			<!-- Credits Payment -->
			{#if selectedPaymentMethod === 'credits' && data.credits >= data.price}
				<Card class="border-border/50">
					<CardHeader>
						<CardTitle>Zahlung abschließen</CardTitle>
						<CardDescription>Bezahle mit deinem Guthaben</CardDescription>
					</CardHeader>
					<CardContent>
						<form method="POST" action="?/processPayment" use:enhance>
							<input type="hidden" name="paymentMethod" value="credits" />
							<input type="hidden" name="name" value={data.name} />
							<input type="hidden" name="cpu" value={data.cpu} />
							<input type="hidden" name="ram" value={data.ram} />
							<input type="hidden" name="storage" value={data.storage} />
							<input type="hidden" name="slots" value={data.slots} />
							<input type="hidden" name="game" value={data.game} />
							<input type="hidden" name="eggId" value={data.eggId} />
							<input type="hidden" name="locationId" value={data.locationId} />
							<input type="hidden" name="nestId" value={data.nestId} />
							<input type="hidden" name="price" value={data.price} />
							{#if data.javaVersion}
								<input type="hidden" name="javaVersion" value={data.javaVersion} />
							{/if}
							<Button type="submit" size="lg" class="w-full touch-manipulation">
								<Icon icon="tabler:wallet" class="mr-2 h-5 w-5" />
								Mit Guthaben bezahlen (€{data.price.toFixed(2)})
							</Button>
						</form>
					</CardContent>
				</Card>
			{/if}

			<!-- Fehler -->
			{#if form?.error}
				<div class="rounded-lg border border-red-500/50 bg-red-500/10 p-4 text-sm text-red-700 dark:text-red-400">
					<div class="flex items-center gap-2">
						<Icon icon="tabler:alert-circle" class="h-5 w-5 shrink-0" />
						{form.error}
					</div>
				</div>
			{/if}
		</div>

		<!-- Order Summary -->
		<div class="lg:col-span-1">
			<Card class="border-border/50 sticky top-4">
				<CardHeader>
					<CardTitle>Bestellübersicht</CardTitle>
				</CardHeader>
				<CardContent class="space-y-4">
					<div class="flex justify-between text-sm">
						<span class="text-muted-foreground">Betrag</span>
						<span class="font-medium">€{data.price.toFixed(2).replace('.', ',')}</span>
					</div>
					<div class="flex justify-between text-sm">
						<span class="text-muted-foreground">Zahlungsmethode</span>
						<span class="font-medium">
							{selectedPaymentMethod === 'paypal' ? 'PayPal' : selectedPaymentMethod === 'klarna' ? 'Klarna' : 'Guthaben'}
						</span>
					</div>
					<Separator />
					<div class="border-t pt-4">
						<div class="flex justify-between text-lg font-bold">
							<span>Gesamt</span>
							<span>€{data.price.toFixed(2).replace('.', ',')}</span>
						</div>
					</div>
					<div class="pt-4 text-xs text-muted-foreground">
						<p>Nach erfolgreicher Zahlung wird dein Gameserver automatisch erstellt und ist in wenigen Minuten verfügbar.</p>
					</div>
				</CardContent>
			</Card>
		</div>
	</div>
</div>

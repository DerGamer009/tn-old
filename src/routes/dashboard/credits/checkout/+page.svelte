<script lang="ts">
	import { enhance } from '$app/forms';
	import { onMount } from 'svelte';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import Icon from '@iconify/svelte';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

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
	<title>Checkout - Guthaben aufladen | TitanNode</title>
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
			<!-- Zahlungsmethode Info -->
			<Card class="border-border/50">
				<CardHeader>
					<CardTitle class="flex items-center gap-2">
						{#if data.paymentMethod === 'paypal'}
							<Icon icon="tabler:brand-paypal" class="h-5 w-5" />
						{:else}
							<Icon icon="tabler:credit-card" class="h-5 w-5" />
						{/if}
						Zahlungsmethode
					</CardTitle>
				</CardHeader>
				<CardContent>
					<p class="text-lg font-medium">
						{data.paymentMethod === 'paypal' ? 'PayPal' : 'Klarna'}
					</p>
				</CardContent>
			</Card>

			<!-- Klarna Checkout -->
			{#if data.paymentMethod === 'klarna' && form?.klarnaClientToken}
				<Card class="border-border/50">
					<CardHeader>
						<CardTitle>Klarna Zahlung</CardTitle>
						<CardDescription>Gib deine Zahlungsdaten ein</CardDescription>
					</CardHeader>
					<CardContent>
						<div id="klarna-container" class="min-h-[400px]">
							<!-- Klarna wird hier eingebettet -->
							<p class="text-muted-foreground">Klarna Checkout wird geladen...</p>
						</div>
					</CardContent>
				</Card>
			{:else if data.paymentMethod === 'klarna'}
				<Card class="border-border/50">
					<CardHeader>
						<CardTitle>Zahlung abschließen</CardTitle>
						<CardDescription>Starte deine Klarna-Zahlung</CardDescription>
					</CardHeader>
					<CardContent>
						<form method="POST" action="?/processPayment" use:enhance>
							<input type="hidden" name="amount" value={data.amount} />
							<input type="hidden" name="paymentMethod" value={data.paymentMethod} />
							<Button type="submit" size="lg" class="w-full touch-manipulation">
								<Icon icon="tabler:credit-card" class="mr-2 h-5 w-5" />
								Zahlung starten
							</Button>
						</form>
					</CardContent>
				</Card>
			{/if}

			<!-- PayPal Checkout Button -->
			{#if data.paymentMethod === 'paypal'}
				<Card class="border-border/50">
					<CardHeader>
						<CardTitle>Zahlung abschließen</CardTitle>
						<CardDescription>Du wirst zu PayPal weitergeleitet, um die Zahlung abzuschließen</CardDescription>
					</CardHeader>
					<CardContent>
						<form method="POST" action="?/processPayment" use:enhance>
							<input type="hidden" name="amount" value={data.amount} />
							<input type="hidden" name="paymentMethod" value={data.paymentMethod} />
							<Button type="submit" size="lg" class="w-full touch-manipulation">
								<Icon icon="tabler:brand-paypal" class="mr-2 h-5 w-5" />
								Mit PayPal bezahlen
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
						<span class="font-medium">€{data.amount.toFixed(2).replace('.', ',')}</span>
					</div>
					<div class="flex justify-between text-sm">
						<span class="text-muted-foreground">Zahlungsmethode</span>
						<span class="font-medium">
							{data.paymentMethod === 'paypal' ? 'PayPal' : 'Klarna'}
						</span>
					</div>
					<div class="border-t pt-4">
						<div class="flex justify-between text-lg font-bold">
							<span>Gesamt</span>
							<span>€{data.amount.toFixed(2).replace('.', ',')}</span>
						</div>
					</div>
					<div class="pt-4 text-xs text-muted-foreground">
						<p>Nach erfolgreicher Zahlung wird das Guthaben sofort deinem Account gutgeschrieben.</p>
					</div>
				</CardContent>
			</Card>
		</div>
	</div>
</div>


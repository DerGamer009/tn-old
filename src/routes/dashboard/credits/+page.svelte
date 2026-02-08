<script lang="ts">
	import { enhance } from '$app/forms';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';
	import * as Select from '$lib/components/ui/select/index.js';
	import Icon from '@iconify/svelte';
	import type { PageData, ActionData } from './$types';
	import { language, type Language } from '$lib/stores/language';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	let amount = $state('');
	let paymentMethod = $state('paypal');

	// Vordefinierte Beträge
	const presetAmounts = [10, 25, 50, 100, 250, 500];

	const translations = {
		de: {
			title: 'Guthaben aufladen',
			subtitle: 'Lade Guthaben auf deinen Account auf',
			currentBalance: 'Aktuelles Guthaben',
			currentBalanceHint: 'Verfügbares Guthaben auf deinem Account',
			amountTitle: 'Betrag auswählen',
			amountDescription: 'Wähle einen Betrag oder gib einen eigenen ein',
			quickSelect: 'Schnellauswahl',
			customAmountLabel: 'Eigener Betrag (€)',
			minAmount: 'Mindestbetrag: €5.00',
			paymentMethodLabel: 'Zahlungsmethode',
			selectPaymentMethod: 'Zahlungsmethode wählen',
			topUpButtonPrefix: '€{amount} aufladen',
			topUpButtonPlaceholder: 'Betrag auswählen',
			infoTitle: 'Hinweise zum Guthaben:',
			info1: 'Das Guthaben wird sofort deinem Account gutgeschrieben',
			info2: 'Guthaben kann für alle Services verwendet werden',
			info3: 'Guthaben verfällt nicht',
			info4: 'Rückerstattungen erfolgen auf Wunsch als Gutschrift'
		},
		en: {
			title: 'Top up balance',
			subtitle: 'Top up credit on your account',
			currentBalance: 'Current balance',
			currentBalanceHint: 'Available balance on your account',
			amountTitle: 'Select amount',
			amountDescription: 'Choose an amount or enter your own',
			quickSelect: 'Quick select',
			customAmountLabel: 'Custom amount (€)',
			minAmount: 'Minimum amount: €5.00',
			paymentMethodLabel: 'Payment method',
			selectPaymentMethod: 'Select payment method',
			topUpButtonPrefix: 'Top up €{amount}',
			topUpButtonPlaceholder: 'Select amount',
			infoTitle: 'Notes about balance:',
			info1: 'The balance is credited to your account immediately',
			info2: 'Balance can be used for all services',
			info3: 'Balance does not expire',
			info4: 'Refunds are made as credit on request'
		}
	} satisfies Record<Language, Record<string, string>>;

	type TKey = keyof (typeof translations)['de'];

	function t(key: TKey): string {
		const lang = $language as Language;
		const dict = translations[lang] ?? translations.de;
		return dict[key] ?? translations.de[key];
	}

	// Zahlungsmethoden
	const paymentMethods = [
		{ value: 'paypal', label: 'PayPal', icon: 'tabler:brand-paypal' },
		{ value: 'klarna', label: 'Klarna', icon: 'tabler:credit-card' }
	];

	const selectedPaymentMethod = $derived(
		paymentMethods.find((p) => p.value === paymentMethod)
	);

	function setAmount(value: string) {
		amount = value;
	}
</script>

<svelte:head>
	<title>{t('title')} - Dashboard | TitanNode</title>
</svelte:head>

<div class="max-w-2xl space-y-6">
	<!-- Header -->
	<div>
		<h1 class="text-2xl sm:text-3xl font-bold flex items-center gap-2 sm:gap-3 flex-wrap">
			<Icon icon="tabler:currency-euro" class="h-8 w-8 text-primary" />
			{t('title')}
		</h1>
		<p class="mt-2 text-muted-foreground">{t('subtitle')}</p>
	</div>

	<!-- Aktuelles Guthaben -->
	<Card class="border-border/50">
		<CardHeader>
			<CardTitle class="flex items-center gap-2">
				<Icon icon="tabler:wallet" class="h-5 w-5" />
				{t('currentBalance')}
			</CardTitle>
		</CardHeader>
		<CardContent>
			<div class="text-4xl font-bold text-primary">
				€{data.credits.toFixed(2).replace('.', ',')}
			</div>
			<p class="text-sm text-muted-foreground mt-2">
				{t('currentBalanceHint')}
			</p>
		</CardContent>
	</Card>

	<!-- Aufladeformular -->
	<Card class="border-border/50">
		<CardHeader>
			<CardTitle>{t('amountTitle')}</CardTitle>
			<CardDescription>{t('amountDescription')}</CardDescription>
		</CardHeader>
		<CardContent>
			<form method="GET" action="/dashboard/credits/checkout" use:enhance={() => {
				return async ({ update, result }) => {
					// Weiterleitung wird über GET-Parameter gemacht
				};
			}}>
				<div class="space-y-6">
					<!-- Vordefinierte Beträge -->
					<div class="space-y-2">
						<Label>{t('quickSelect')}</Label>
						<div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
							{#each presetAmounts as preset}
								<Button
									type="button"
									variant={amount === preset.toString() ? 'default' : 'outline'}
									class="touch-manipulation"
									onclick={() => setAmount(preset.toString())}
								>
									€{preset}
								</Button>
							{/each}
						</div>
					</div>

					<!-- Eigenen Betrag eingeben -->
					<div class="space-y-2">
						<Label for="amount">{t('customAmountLabel')}</Label>
						<Input
							id="amount"
							name="amount"
							type="number"
							step="0.01"
							min="5"
							placeholder="0.00"
							required
							bind:value={amount}
							class="text-lg touch-manipulation"
						/>
						<p class="text-xs text-muted-foreground">{t('minAmount')}</p>
					</div>

					<!-- Zahlungsmethode -->
					<div class="space-y-2">
						<Label for="paymentMethod">{t('paymentMethodLabel')}</Label>
						<Select.Root type="single" name="paymentMethod" bind:value={paymentMethod}>
							<Select.Trigger id="paymentMethod" class="w-full touch-manipulation">
								{#if selectedPaymentMethod}
									<span class="flex items-center gap-2">
										<Icon icon={selectedPaymentMethod.icon} class="h-4 w-4" />
										{selectedPaymentMethod.label}
									</span>
								{:else}
									{t('selectPaymentMethod')}
								{/if}
							</Select.Trigger>
							<Select.Content>
								{#each paymentMethods as method (method.value)}
									<Select.Item value={method.value} label={method.label}>
										<span class="flex items-center gap-2">
											<Icon icon={method.icon} class="h-4 w-4" />
											{method.label}
										</span>
									</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>
					</div>

					<!-- Fehler/Success Nachricht -->
					{#if form?.error}
						<div class="rounded-lg border border-red-500/50 bg-red-500/10 p-4 text-sm text-red-700 dark:text-red-400">
							<div class="flex items-center gap-2">
								<Icon icon="tabler:alert-circle" class="h-5 w-5 shrink-0" />
								{form.error}
							</div>
						</div>
					{/if}

					{#if form?.success}
						<div class="rounded-lg border border-green-500/50 bg-green-500/10 p-4 text-sm text-green-700 dark:text-green-400">
							<div class="flex items-center gap-2">
								<Icon icon="tabler:circle-check" class="h-5 w-5 shrink-0" />
								{form.message || 'Guthaben erfolgreich aufgeladen!'}
							</div>
						</div>
					{/if}

					<!-- Submit Button -->
					<Button 
						type="submit" 
						size="lg" 
						class="w-full touch-manipulation"
						disabled={!amount || parseFloat(amount) < 5}
					>
						<Icon icon="tabler:currency-euro" class="mr-2 h-5 w-5" />
						{amount
							? t('topUpButtonPrefix').replace(
									'{amount}',
									parseFloat(amount || '0').toFixed(2).replace('.', ',')
								)
							: t('topUpButtonPlaceholder')}
					</Button>
					<input type="hidden" name="amount" value={amount} />
					<input type="hidden" name="paymentMethod" value={paymentMethod} />
				</div>
			</form>
		</CardContent>
	</Card>

	<!-- Info Card -->
	<Card class="border-border/50 bg-muted/30">
		<CardContent class="pt-6">
			<div class="flex items-start gap-3">
				<Icon icon="tabler:info-circle" class="h-5 w-5 text-primary shrink-0 mt-0.5" />
				<div class="space-y-2 text-sm text-muted-foreground">
					<p class="font-medium text-foreground">{t('infoTitle')}</p>
					<ul class="list-disc list-inside space-y-1 ml-2">
						<li>{t('info1')}</li>
						<li>{t('info2')}</li>
						<li>{t('info3')}</li>
						<li>{t('info4')}</li>
					</ul>
				</div>
			</div>
		</CardContent>
	</Card>
</div>


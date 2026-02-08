<script lang="ts">
	import { enhance } from '$app/forms';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Label } from '$lib/components/ui/label';
	import Icon from '@iconify/svelte';
	import type { PageData, ActionData } from './$types';

let { data, form }: { data: PageData; form: ActionData } = $props();

let settings = $state({
	enabled: false,
	buyerApproved: false,
	orderApproved: false,
	orderCompleted: false,
	orderDeclined: false,
	orderSaved: false,
	orderVoided: false
});

$effect(() => {
	const s = data.settings;
	if (s) {
		settings.enabled = s.enabled;
		settings.buyerApproved = s.buyerApproved;
		settings.orderApproved = s.orderApproved;
		settings.orderCompleted = s.orderCompleted;
		settings.orderDeclined = s.orderDeclined;
		settings.orderSaved = s.orderSaved;
		settings.orderVoided = s.orderVoided;
	}
});
</script>

<svelte:head>
	<title>Checkout-Einstellungen - Admin | TitanNode</title>
</svelte:head>

<div class="max-w-4xl space-y-6">
	<!-- Header -->
	<div>
		<h1 class="text-2xl sm:text-3xl font-bold flex items-center gap-2 sm:gap-3 flex-wrap">
			<Icon icon="tabler:credit-card" class="h-8 w-8 text-primary" />
			Checkout-Einstellungen
		</h1>
		<p class="mt-2 text-muted-foreground">Konfiguriere Checkout-Events und Benachrichtigungen</p>
	</div>

	<form method="POST" action="?/updateSettings" use:enhance={() => {
		return async ({ update, result }) => {
			if (result.type === 'success' && form?.success) {
				await update();
			}
		};
	}}>
		<!-- Hauptaktivierung -->
		<Card class="border-border/50">
			<CardHeader>
				<CardTitle class="flex items-center gap-2">
					<Checkbox
						id="enabled"
						checked={settings.enabled}
						onCheckedChange={(checked) => {
							settings.enabled = checked === true;
							settings = { ...settings };
						}}
						class="h-5 w-5"
					/>
					<Label for="enabled" class="cursor-pointer">Checkout</Label>
				</CardTitle>
				<CardDescription>Aktiviere oder deaktiviere die Checkout-Funktionalität</CardDescription>
			</CardHeader>
			<CardContent class="pt-6">
				<input type="hidden" name="enabled" value={settings.enabled.toString()} />
				
				<!-- Checkout Events -->
				<div class="space-y-4">
					<div class="flex items-start gap-3 p-3 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors">
						<Checkbox
							id="buyerApproved"
							checked={settings.buyerApproved}
							disabled={!settings.enabled}
							onCheckedChange={(checked) => {
								settings.buyerApproved = checked === true;
								settings = { ...settings };
							}}
							class="h-5 w-5 mt-0.5"
						/>
						<Label for="buyerApproved" class="flex-1 cursor-pointer font-normal">
							Checkout checkout buyer-approved
						</Label>
					</div>

					<div class="flex items-start gap-3 p-3 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors">
						<Checkbox
							id="orderApproved"
							checked={settings.orderApproved}
							disabled={!settings.enabled}
							onCheckedChange={(checked) => {
								settings.orderApproved = checked === true;
								settings = { ...settings };
							}}
							class="h-5 w-5 mt-0.5"
						/>
						<Label for="orderApproved" class="flex-1 cursor-pointer font-normal">
							Checkout order approved
						</Label>
					</div>

					<div class="flex items-start gap-3 p-3 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors">
						<Checkbox
							id="orderCompleted"
							checked={settings.orderCompleted}
							disabled={!settings.enabled}
							onCheckedChange={(checked) => {
								settings.orderCompleted = checked === true;
								settings = { ...settings };
							}}
							class="h-5 w-5 mt-0.5"
						/>
						<Label for="orderCompleted" class="flex-1 cursor-pointer font-normal">
							Checkout order completed
						</Label>
					</div>

					<div class="flex items-start gap-3 p-3 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors">
						<Checkbox
							id="orderDeclined"
							checked={settings.orderDeclined}
							disabled={!settings.enabled}
							onCheckedChange={(checked) => {
								settings.orderDeclined = checked === true;
								settings = { ...settings };
							}}
							class="h-5 w-5 mt-0.5"
						/>
						<Label for="orderDeclined" class="flex-1 cursor-pointer font-normal">
							Checkout order declined
						</Label>
					</div>

					<div class="flex items-start gap-3 p-3 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors">
						<Checkbox
							id="orderSaved"
							checked={settings.orderSaved}
							disabled={!settings.enabled}
							onCheckedChange={(checked) => {
								settings.orderSaved = checked === true;
								settings = { ...settings };
							}}
							class="h-5 w-5 mt-0.5"
						/>
						<Label for="orderSaved" class="flex-1 cursor-pointer font-normal">
							Checkout order saved
						</Label>
					</div>

					<div class="flex items-start gap-3 p-3 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors">
						<Checkbox
							id="orderVoided"
							checked={settings.orderVoided}
							disabled={!settings.enabled}
							onCheckedChange={(checked) => {
								settings.orderVoided = checked === true;
								settings = { ...settings };
							}}
							class="h-5 w-5 mt-0.5"
						/>
						<Label for="orderVoided" class="flex-1 cursor-pointer font-normal">
							Checkout order voided
						</Label>
					</div>
				</div>
			</CardContent>
		</Card>

		<!-- Hidden Inputs -->
		<input type="hidden" name="buyerApproved" value={settings.buyerApproved.toString()} />
		<input type="hidden" name="orderApproved" value={settings.orderApproved.toString()} />
		<input type="hidden" name="orderCompleted" value={settings.orderCompleted.toString()} />
		<input type="hidden" name="orderDeclined" value={settings.orderDeclined.toString()} />
		<input type="hidden" name="orderSaved" value={settings.orderSaved.toString()} />
		<input type="hidden" name="orderVoided" value={settings.orderVoided.toString()} />

		<!-- Success/Error Messages -->
		{#if form?.success}
			<div class="rounded-lg border border-green-500/50 bg-green-500/10 p-4 text-sm text-green-700 dark:text-green-400">
				<div class="flex items-center gap-2">
					<Icon icon="tabler:circle-check" class="h-5 w-5 shrink-0" />
					{form.message || 'Einstellungen erfolgreich gespeichert'}
				</div>
			</div>
		{/if}

		{#if form?.error}
			<div class="rounded-lg border border-red-500/50 bg-red-500/10 p-4 text-sm text-red-700 dark:text-red-400">
				<div class="flex items-center gap-2">
					<Icon icon="tabler:alert-circle" class="h-5 w-5 shrink-0" />
					{form.error}
				</div>
			</div>
		{/if}

		<!-- Submit Button -->
		<div class="flex gap-4">
			<Button type="submit" size="lg" class="touch-manipulation">
				<Icon icon="tabler:device-floppy" class="mr-2 h-5 w-5" />
				Einstellungen speichern
			</Button>
			<Button type="button" variant="outline" size="lg" href="/admin/settings" class="touch-manipulation">
				<Icon icon="tabler:arrow-left" class="mr-2 h-5 w-5" />
				Zurück
			</Button>
		</div>
	</form>
</div>


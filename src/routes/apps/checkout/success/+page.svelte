<script lang="ts">
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import Icon from '@iconify/svelte';
	import type { PageData } from './$types';
	import { goto } from '$app/navigation';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Bestellung erfolgreich - App Hosting | TitanNode</title>
</svelte:head>

<div class="max-w-2xl mx-auto space-y-6">
	<!-- Success Message -->
	<Card class="border-green-500/50 bg-green-500/5">
		<CardContent class="pt-6">
			<div class="text-center space-y-4">
				<div class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
					<Icon icon="tabler:check" class="h-8 w-8 text-green-600" />
				</div>
				<div>
					<h1 class="text-2xl font-bold">Bestellung erfolgreich!</h1>
					<p class="text-muted-foreground mt-2">
						Deine App wird jetzt erstellt und ist in wenigen Minuten verfügbar.
					</p>
				</div>
			</div>
		</CardContent>
	</Card>

	<!-- Order Details -->
	<Card class="border-border/50">
		<CardHeader>
			<CardTitle>Bestelldetails</CardTitle>
		</CardHeader>
		<CardContent class="space-y-4">
			<div class="flex justify-between text-sm">
				<span class="text-muted-foreground">Bestellnummer:</span>
				<span class="font-mono text-xs">{data.order.orderNumber}</span>
			</div>
			<div class="flex justify-between text-sm">
				<span class="text-muted-foreground">Betrag:</span>
				<span class="font-medium">€{data.order.total.toFixed(2).replace('.', ',')}</span>
			</div>
			<div class="flex justify-between text-sm">
				<span class="text-muted-foreground">Status:</span>
				<span class="font-medium">
					{data.order.paymentStatus === 'PAID' ? 'Bezahlt' : 'Ausstehend'}
				</span>
			</div>
			{#if data.server}
				<div class="pt-4 border-t">
					<div class="flex justify-between text-sm">
						<span class="text-muted-foreground">App:</span>
						<span class="font-medium">{data.server.name}</span>
					</div>
					<div class="flex justify-between text-sm mt-2">
						<span class="text-muted-foreground">Status:</span>
						<span class="font-medium">
							{data.server.status === 'ACTIVE' ? 'Aktiv' : data.server.status === 'PENDING' ? 'Wird erstellt...' : data.server.status}
						</span>
					</div>
				</div>
			{/if}
		</CardContent>
	</Card>

	<!-- Actions -->
	<div class="flex flex-col sm:flex-row gap-3">
		{#if data.server}
			<Button class="flex-1" onclick={() => goto(`/dashboard/apps/${data.server.id}`)}>
				<Icon icon="tabler:server" class="mr-2 h-4 w-4" />
				Zur App
			</Button>
		{/if}
		<Button variant="outline" class="flex-1" onclick={() => goto('/dashboard/apps')}>
			<Icon icon="tabler:list" class="mr-2 h-4 w-4" />
			Alle Apps
		</Button>
	</div>
</div>

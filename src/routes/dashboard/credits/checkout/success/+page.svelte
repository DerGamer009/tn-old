<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import Icon from '@iconify/svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Zahlung erfolgreich - TitanNode</title>
</svelte:head>

<div class="max-w-2xl mx-auto space-y-6">
	<Card class="border-green-500/50 bg-green-500/10">
		<CardContent class="pt-6">
			<div class="flex flex-col items-center text-center space-y-4">
				<div class="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20">
					<Icon icon="tabler:circle-check" class="h-10 w-10 text-green-600 dark:text-green-400" />
				</div>
				<div>
					<h1 class="text-2xl font-bold">Zahlung erfolgreich!</h1>
					<p class="text-muted-foreground mt-2">
						Dein Guthaben wurde erfolgreich aufgeladen.
					</p>
				</div>
			</div>
		</CardContent>
	</Card>

	<Card class="border-border/50">
		<CardHeader>
			<CardTitle>Bestelldetails</CardTitle>
		</CardHeader>
		<CardContent class="space-y-4">
			<div class="flex justify-between">
				<span class="text-muted-foreground">Bestellnummer</span>
				<span class="font-mono text-sm">{data.order?.orderNumber}</span>
			</div>
			<div class="flex justify-between">
				<span class="text-muted-foreground">Betrag</span>
				<span class="font-medium">€{data.order?.total.toFixed(2).replace('.', ',')}</span>
			</div>
			<div class="flex justify-between">
				<span class="text-muted-foreground">Status</span>
				<span class="font-medium text-green-600 dark:text-green-400">Bezahlt</span>
			</div>
		</CardContent>
	</Card>

	<div class="flex gap-4">
		<Button href="/dashboard/credits" variant="outline" class="flex-1 touch-manipulation">
			Weiteres Guthaben aufladen
		</Button>
		<Button href="/dashboard" class="flex-1 touch-manipulation">
			Zum Dashboard
		</Button>
	</div>
</div>


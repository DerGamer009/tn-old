<script lang="ts">
	import { Card, CardContent } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Input } from '$lib/components/ui/input';
	import Icon from '@iconify/svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let searchQuery = $state('');

	let filteredInvoices = $derived(
		data.invoices.filter(invoice =>
			invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
			invoice.user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
			invoice.user.lastName.toLowerCase().includes(searchQuery.toLowerCase())
		)
	);

	function getStatusColor(status: string) {
		switch (status) {
			case 'UNPAID': return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400';
			case 'PAID': return 'bg-green-500/10 text-green-700 dark:text-green-400';
			case 'OVERDUE': return 'bg-red-500/10 text-red-700 dark:text-red-400';
			case 'CANCELLED': return 'bg-gray-500/10 text-gray-700 dark:text-gray-400';
			default: return '';
		}
	}

	function getStatusText(status: string) {
		switch (status) {
			case 'UNPAID': return 'Unbezahlt';
			case 'PAID': return 'Bezahlt';
			case 'OVERDUE': return 'Überfällig';
			case 'CANCELLED': return 'Storniert';
			default: return status;
		}
	}

	function formatDate(date: Date) {
		return new Date(date).toLocaleDateString('de-DE');
	}
</script>

<svelte:head>
	<title>Rechnungen - Admin | TitanNode</title>
</svelte:head>

<div class="space-y-8">
	<div>
		<h1 class="text-3xl font-bold flex items-center gap-3">
			<Icon icon="tabler:receipt" class="h-8 w-8 text-primary" />
			Rechnungsverwaltung
		</h1>
		<p class="mt-2 text-muted-foreground">Alle Rechnungen im Überblick</p>
	</div>

	<Card class="border-border/50">
		<CardContent class="pt-6">
			<Input type="search" placeholder="Nach Rechnungsnummer oder Kunde suchen..." bind:value={searchQuery} />
		</CardContent>
	</Card>

	<div class="space-y-4">
		{#each filteredInvoices as invoice}
			<Card class="border-border/50 hover:bg-muted/50 transition-colors">
				<CardContent class="p-6">
					<div class="flex items-start justify-between gap-4">
						<div class="flex-1 space-y-2">
							<div class="flex items-center gap-3">
								<Icon icon="tabler:receipt" class="h-5 w-5 text-primary" />
								<h3 class="font-semibold">#{invoice.invoiceNumber}</h3>
							</div>
							<p class="text-sm text-muted-foreground">
								Kunde: {invoice.user.firstName} {invoice.user.lastName}
							</p>
							<div class="flex flex-wrap items-center gap-2">
								<Badge variant="outline" class={getStatusColor(invoice.status)}>
									{getStatusText(invoice.status)}
								</Badge>
								<span class="text-sm text-muted-foreground">
									Fällig: {formatDate(invoice.dueDate)}
								</span>
							</div>
						</div>
						<div class="text-right">
							<p class="text-2xl font-bold">€{invoice.amount.toFixed(2)}</p>
							<p class="text-xs text-muted-foreground">Erstellt: {formatDate(invoice.createdAt)}</p>
						</div>
					</div>
				</CardContent>
			</Card>
		{/each}
	</div>
</div>


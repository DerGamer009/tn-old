<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Input } from '$lib/components/ui/input';
	import Icon from '@iconify/svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let searchQuery = $state('');
	let filterStatus = $state('all');

	let filteredTickets = $derived(
		data.tickets.filter(ticket => {
			const matchesSearch = 
				ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
				ticket.user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
				ticket.user.lastName.toLowerCase().includes(searchQuery.toLowerCase());
			const matchesStatus = filterStatus === 'all' || ticket.status === filterStatus;
			return matchesSearch && matchesStatus;
		})
	);

	function getStatusColor(status: string) {
		switch (status) {
			case 'OPEN': return 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/50';
			case 'IN_PROGRESS': return 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/50';
			case 'WAITING_FOR_CUSTOMER': return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/50';
			case 'CLOSED': return 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/50';
			default: return 'bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/50';
		}
	}

	function getStatusText(status: string) {
		switch (status) {
			case 'OPEN': return 'Offen';
			case 'IN_PROGRESS': return 'In Bearbeitung';
			case 'WAITING_FOR_CUSTOMER': return 'Warte auf Kunde';
			case 'CLOSED': return 'Geschlossen';
			default: return status;
		}
	}

	function formatDate(date: Date) {
		return new Date(date).toLocaleString('de-DE', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}
</script>

<svelte:head>
	<title>Tickets - Admin | TitanNode</title>
</svelte:head>

<div class="space-y-8">
	<div>
		<h1 class="text-2xl sm:text-3xl font-bold flex items-center gap-2 sm:gap-3 flex-wrap">
			<Icon icon="tabler:ticket" class="h-8 w-8 text-primary" />
			Ticket-Verwaltung
		</h1>
		<p class="mt-2 text-muted-foreground">Alle Support-Tickets im Überblick</p>
	</div>

	<Card class="border-border/50">
		<CardContent class="pt-6">
			<div class="flex flex-col gap-4 sm:flex-row">
				<div class="flex-1">
					<Input type="search" placeholder="Suchen..." bind:value={searchQuery} />
				</div>
				<select bind:value={filterStatus} class="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
					<option value="all">Alle Status</option>
					<option value="OPEN">Offen</option>
					<option value="IN_PROGRESS">In Bearbeitung</option>
					<option value="WAITING_FOR_CUSTOMER">Warte auf Kunde</option>
					<option value="CLOSED">Geschlossen</option>
				</select>
			</div>
		</CardContent>
	</Card>

	<div class="space-y-4">
		{#each filteredTickets as ticket}
			<Card class="border-border/50 hover:bg-muted/50 transition-colors">
				<CardContent class="p-6">
					<a href="/admin/tickets/{ticket.id}">
						<div class="flex items-start justify-between gap-4">
							<div class="flex-1 space-y-3">
								<div class="flex items-start gap-3">
									<div class="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
										<Icon icon="tabler:ticket" class="h-5 w-5 text-primary" />
									</div>
									<div class="flex-1">
										<h3 class="font-semibold text-lg">{ticket.subject}</h3>
										<p class="text-sm text-muted-foreground">
											Von: {ticket.user.firstName} {ticket.user.lastName}
										</p>
									</div>
								</div>
								<div class="flex flex-wrap items-center gap-2">
									<Badge variant="outline" class={getStatusColor(ticket.status)}>
										{getStatusText(ticket.status)}
									</Badge>
									<span class="text-xs text-muted-foreground">{formatDate(ticket.createdAt)}</span>
								</div>
							</div>
						</div>
					</a>
				</CardContent>
			</Card>
		{/each}
	</div>
</div>


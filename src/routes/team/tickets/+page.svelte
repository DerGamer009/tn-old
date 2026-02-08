<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import Icon from '@iconify/svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let searchQuery = $state('');
	let filterStatus = $state('all');
	let filterPriority = $state('all');

	// Filtere Tickets
	let filteredTickets = $derived(
		data.tickets.filter(ticket => {
			const matchesSearch = 
				ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
				ticket.user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
				ticket.user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
				ticket.user.email.toLowerCase().includes(searchQuery.toLowerCase());
			
			const matchesStatus = filterStatus === 'all' || ticket.status === filterStatus;
			const matchesPriority = filterPriority === 'all' || ticket.priority === filterPriority;
			
			return matchesSearch && matchesStatus && matchesPriority;
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

	function getPriorityColor(priority: string) {
		switch (priority) {
			case 'LOW': return 'bg-gray-500/10 text-gray-700 dark:text-gray-400';
			case 'MEDIUM': return 'bg-blue-500/10 text-blue-700 dark:text-blue-400';
			case 'HIGH': return 'bg-orange-500/10 text-orange-700 dark:text-orange-400';
			case 'URGENT': return 'bg-red-500/10 text-red-700 dark:text-red-400';
			default: return 'bg-gray-500/10 text-gray-700 dark:text-gray-400';
		}
	}

	function getPriorityText(priority: string) {
		switch (priority) {
			case 'LOW': return 'Niedrig';
			case 'MEDIUM': return 'Mittel';
			case 'HIGH': return 'Hoch';
			case 'URGENT': return 'Dringend';
			default: return priority;
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
	<title>Alle Tickets - Team Dashboard | TitanNode</title>
</svelte:head>

<div class="space-y-8">
	<!-- Header -->
	<div>
		<h1 class="text-3xl font-bold flex items-center gap-3">
			<Icon icon="tabler:ticket" class="h-8 w-8 text-primary" />
			Alle Support-Tickets
		</h1>
		<p class="mt-2 text-muted-foreground">Übersicht über alle Kundenanfragen</p>
	</div>

	<!-- Stats -->
	<div class="grid gap-6 sm:grid-cols-4">
		<Card class="border-border/50">
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium text-muted-foreground">Offen</CardTitle>
				<Icon icon="tabler:circle-dot" class="h-5 w-5 text-blue-500" />
			</CardHeader>
			<CardContent>
				<div class="text-3xl font-bold">{data.stats.open}</div>
			</CardContent>
		</Card>

		<Card class="border-border/50">
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium text-muted-foreground">In Bearbeitung</CardTitle>
				<Icon icon="tabler:clock" class="h-5 w-5 text-orange-500" />
			</CardHeader>
			<CardContent>
				<div class="text-3xl font-bold">{data.stats.inProgress}</div>
			</CardContent>
		</Card>

		<Card class="border-border/50">
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium text-muted-foreground">Warte auf Kunde</CardTitle>
				<Icon icon="tabler:message-circle" class="h-5 w-5 text-yellow-500" />
			</CardHeader>
			<CardContent>
				<div class="text-3xl font-bold">{data.stats.waiting}</div>
			</CardContent>
		</Card>

		<Card class="border-border/50">
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium text-muted-foreground">Dringend</CardTitle>
				<Icon icon="tabler:alert-triangle" class="h-5 w-5 text-red-500" />
			</CardHeader>
			<CardContent>
				<div class="text-3xl font-bold">{data.stats.urgent}</div>
			</CardContent>
		</Card>
	</div>

	<!-- Filter & Search -->
	<Card class="border-border/50">
		<CardContent class="pt-6">
			<div class="flex flex-col gap-4 sm:flex-row sm:items-center">
				<!-- Search -->
				<div class="flex-1">
					<div class="relative">
						<Icon icon="tabler:search" class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
						<Input
							type="search"
							placeholder="Nach Betreff, Kunde oder Email suchen..."
							bind:value={searchQuery}
							class="pl-9"
						/>
					</div>
				</div>

				<!-- Status Filter -->
				<div class="flex items-center gap-2">
					<Icon icon="tabler:filter" class="h-4 w-4 text-muted-foreground" />
					<select
						bind:value={filterStatus}
						class="flex h-10 w-full sm:w-44 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
					>
						<option value="all">Alle Status</option>
						<option value="OPEN">Offen</option>
						<option value="IN_PROGRESS">In Bearbeitung</option>
						<option value="WAITING_FOR_CUSTOMER">Warte auf Kunde</option>
						<option value="CLOSED">Geschlossen</option>
					</select>
				</div>

				<!-- Priority Filter -->
				<select
					bind:value={filterPriority}
					class="flex h-10 w-full sm:w-40 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
				>
					<option value="all">Alle Prioritäten</option>
					<option value="URGENT">Dringend</option>
					<option value="HIGH">Hoch</option>
					<option value="MEDIUM">Mittel</option>
					<option value="LOW">Niedrig</option>
				</select>
			</div>
		</CardContent>
	</Card>

	<!-- Tickets List -->
	{#if filteredTickets.length > 0}
		<div class="space-y-4">
			{#each filteredTickets as ticket}
				<Card class="border-border/50 transition-colors hover:bg-muted/50">
					<CardContent class="p-6">
						<a href="/team/tickets/{ticket.id}" class="block">
							<div class="flex items-start justify-between gap-4">
								<div class="flex-1 space-y-3">
									<!-- Header -->
									<div class="flex items-start gap-3">
										<div class="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
											<Icon icon="tabler:ticket" class="h-5 w-5 text-primary" />
										</div>
										<div class="flex-1">
											<h3 class="font-semibold text-lg">{ticket.subject}</h3>
											<p class="text-sm text-muted-foreground">
												Von: {ticket.user.firstName} {ticket.user.lastName} ({ticket.user.email})
											</p>
											<p class="text-xs text-muted-foreground mt-1">
												Erstellt: {formatDate(ticket.createdAt)}
											</p>
										</div>
									</div>

									<!-- Description Preview -->
									<p class="text-sm text-muted-foreground line-clamp-2">
										{ticket.description}
									</p>

									<!-- Meta Info -->
									<div class="flex flex-wrap items-center gap-2">
										<Badge variant="outline" class={getStatusColor(ticket.status)}>
											{getStatusText(ticket.status)}
										</Badge>
										<Badge variant="outline" class={getPriorityColor(ticket.priority)}>
											{getPriorityText(ticket.priority)}
										</Badge>
										{#if ticket.server}
											<Badge variant="outline" class="bg-primary/5 text-primary border-primary/20">
												<Icon icon="tabler:server" class="mr-1 h-3 w-3" />
												{ticket.server.name}
											</Badge>
										{/if}
										<div class="flex items-center gap-1 text-xs text-muted-foreground">
											<Icon icon="tabler:message" class="h-3.5 w-3.5" />
											{ticket._count.messages} {ticket._count.messages === 1 ? 'Nachricht' : 'Nachrichten'}
										</div>
									</div>
								</div>

								<!-- Action Button -->
								<Button variant="ghost" size="icon">
									<Icon icon="tabler:chevron-right" class="h-5 w-5" />
								</Button>
							</div>
						</a>
					</CardContent>
				</Card>
			{/each}
		</div>

		<!-- Results Count -->
		<p class="text-center text-sm text-muted-foreground">
			{filteredTickets.length} von {data.tickets.length} Tickets angezeigt
		</p>
	{:else}
		<!-- Empty State -->
		<Card class="border-border/50">
			<CardContent class="flex flex-col items-center justify-center py-16">
				<div class="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-muted">
					<Icon icon="tabler:search-off" class="h-14 w-14 text-muted-foreground" />
				</div>
				<p class="text-lg text-muted-foreground">
					{searchQuery || filterStatus !== 'all' ? 'Keine Tickets gefunden' : 'Keine Tickets vorhanden'}
				</p>
			</CardContent>
		</Card>
	{/if}
</div>


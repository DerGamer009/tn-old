<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import Icon from '@iconify/svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let searchQuery = $state('');

	// Filtere Kunden
	let filteredCustomers = $derived(
		data.customers.filter((customer) => {
			const query = searchQuery.toLowerCase();
			const matchesSearch =
				customer.firstName.toLowerCase().includes(query) ||
				customer.lastName.toLowerCase().includes(query) ||
				customer.email.toLowerCase().includes(query) ||
				(customer.supportPin && customer.supportPin.includes(searchQuery));

			return matchesSearch;
		})
	);

	function formatDate(date: Date) {
		return new Date(date).toLocaleDateString('de-DE', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric'
		});
	}

	function getServerTypeName(type: string) {
		switch (type) {
			case 'VPS': return 'VPS';
			case 'GAMESERVER': return 'Gameserver';
			case 'APP_HOSTING': return 'App Hosting';
			default: return type;
		}
	}
</script>

<svelte:head>
	<title>Kunden - Team Dashboard | TitanNode</title>
</svelte:head>

<div class="space-y-8">
	<!-- Header -->
	<div>
		<h1 class="text-3xl font-bold flex items-center gap-3">
			<Icon icon="tabler:users" class="h-8 w-8 text-primary" />
			Alle Kunden
		</h1>
		<p class="mt-2 text-muted-foreground">Übersicht über alle registrierten Kunden</p>
	</div>

	<!-- Stats -->
	<div class="grid gap-6 sm:grid-cols-3">
		<Card class="border-border/50">
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium text-muted-foreground">Kunden gesamt</CardTitle>
				<Icon icon="tabler:users" class="h-5 w-5 text-primary" />
			</CardHeader>
			<CardContent>
				<div class="text-3xl font-bold">{data.stats.total}</div>
			</CardContent>
		</Card>

		<Card class="border-border/50">
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium text-muted-foreground">Aktive Server</CardTitle>
				<Icon icon="tabler:server" class="h-5 w-5 text-green-500" />
			</CardHeader>
			<CardContent>
				<div class="text-3xl font-bold">{data.stats.activeServers}</div>
			</CardContent>
		</Card>

		<Card class="border-border/50">
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium text-muted-foreground">Offene Tickets</CardTitle>
				<Icon icon="tabler:ticket" class="h-5 w-5 text-orange-500" />
			</CardHeader>
			<CardContent>
				<div class="text-3xl font-bold">{data.stats.openTickets}</div>
			</CardContent>
		</Card>
	</div>

	<!-- Search -->
	<Card class="border-border/50">
		<CardContent class="pt-6">
			<div class="relative">
				<Icon
					icon="tabler:search"
					class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
				/>
				<Input
					type="search"
					placeholder="Nach Name, Email oder Support-PIN suchen..."
					bind:value={searchQuery}
					class="pl-9"
				/>
			</div>
		</CardContent>
	</Card>

	<!-- Customers List -->
	{#if filteredCustomers.length > 0}
		<div class="space-y-4">
			{#each filteredCustomers as customer}
				<Card class="border-border/50 transition-colors hover:bg-muted/50">
					<CardContent class="p-6">
						<div class="flex items-start justify-between gap-4">
							<div class="flex-1 space-y-3">
								<!-- Header -->
								<div class="flex items-start gap-3">
									<div class="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
										<Icon icon="tabler:user" class="h-6 w-6 text-primary" />
									</div>
									<div class="flex-1">
										<h3 class="font-semibold text-lg">
											{customer.firstName} {customer.lastName}
										</h3>
										<p class="text-sm text-muted-foreground">{customer.email}</p>
										<div class="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
											<div class="flex items-center gap-1">
												<Icon icon="tabler:calendar" class="h-3.5 w-3.5" />
												<span>Registriert: {formatDate(customer.createdAt)}</span>
											</div>
											{#if customer.supportPin}
												<div class="flex items-center gap-1">
													<Icon icon="tabler:key" class="h-3.5 w-3.5" />
													<span>
														PIN:
														<span class="font-mono font-semibold tracking-[0.25em]">
															{customer.supportPin}
														</span>
													</span>
												</div>
											{/if}
										</div>
									</div>
								</div>

								<!-- Stats -->
								<div class="flex flex-wrap items-center gap-4 text-sm">
									<div class="flex items-center gap-2">
										<Icon icon="tabler:server" class="h-4 w-4 text-muted-foreground" />
										<span>{customer._count.servers} Services</span>
									</div>
									<div class="flex items-center gap-2">
										<Icon icon="tabler:ticket" class="h-4 w-4 text-muted-foreground" />
										<span>{customer._count.tickets} Tickets</span>
										{#if customer.tickets.length > 0}
											<Badge variant="outline" class="bg-orange-500/10 text-orange-700 dark:text-orange-400 text-xs">
												{customer.tickets.length} offen
											</Badge>
										{/if}
									</div>
									<div class="flex items-center gap-2">
										<Icon icon="tabler:receipt" class="h-4 w-4 text-muted-foreground" />
										<span>{customer._count.invoices} Rechnungen</span>
									</div>
								</div>

								<!-- Services Preview -->
								{#if customer.servers.length > 0}
									<div class="flex flex-wrap items-center gap-2">
										{#each customer.servers as server}
											<Badge variant="outline" class="bg-muted">
												<Icon icon="tabler:server" class="mr-1 h-3 w-3" />
												{server.name} ({getServerTypeName(server.type)})
											</Badge>
										{/each}
										{#if customer._count.servers > 3}
											<Badge variant="outline" class="bg-muted text-muted-foreground">
												+{customer._count.servers - 3} weitere
											</Badge>
										{/if}
									</div>
								{/if}

								<!-- Verification Status -->
								<div class="flex flex-wrap items-center gap-2">
									{#if customer.emailVerified}
										<Badge variant="outline" class="bg-green-500/10 text-green-700 dark:text-green-400">
											<Icon icon="tabler:mail-check" class="mr-1 h-3 w-3" />
											Email verifiziert
										</Badge>
									{:else}
										<Badge variant="outline" class="bg-yellow-500/10 text-yellow-700 dark:text-yellow-400">
											<Icon icon="tabler:mail-x" class="mr-1 h-3 w-3" />
											Email nicht verifiziert
										</Badge>
									{/if}

									{#if customer.isActive}
										<Badge variant="outline" class="bg-green-500/10 text-green-700 dark:text-green-400">
											<Icon icon="tabler:check" class="mr-1 h-3 w-3" />
											Aktiv
										</Badge>
									{:else}
										<Badge variant="outline" class="bg-red-500/10 text-red-700 dark:text-red-400">
											<Icon icon="tabler:ban" class="mr-1 h-3 w-3" />
											Deaktiviert
										</Badge>
									{/if}
								</div>
							</div>

							<!-- Actions -->
							<div class="flex flex-col gap-2">
								<form method="POST" action="?/impersonate">
									<input type="hidden" name="userId" value={customer.id} />
									<Button
										type="submit"
										variant="outline"
										size="sm"
										class="gap-2 touch-manipulation"
									>
										<Icon icon="tabler:eye" class="h-4 w-4" />
										Ansehen
									</Button>
								</form>
							</div>
						</div>
					</CardContent>
				</Card>
			{/each}
		</div>

		<!-- Results Count -->
		<p class="text-center text-sm text-muted-foreground">
			{filteredCustomers.length} von {data.customers.length} Kunden angezeigt
		</p>
	{:else}
		<!-- Empty State -->
		<Card class="border-border/50">
			<CardContent class="flex flex-col items-center justify-center py-16">
				<div class="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-muted">
					<Icon icon="tabler:search-off" class="h-14 w-14 text-muted-foreground" />
				</div>
				<p class="text-lg text-muted-foreground">
					{searchQuery ? 'Keine Kunden gefunden' : 'Keine Kunden vorhanden'}
				</p>
			</CardContent>
		</Card>
	{/if}
</div>


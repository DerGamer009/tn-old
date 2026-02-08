<script lang="ts">
	import { Card, CardContent } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Input } from '$lib/components/ui/input';
	import Icon from '@iconify/svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let searchQuery = $state('');

	let filteredServers = $derived(
		data.servers.filter(
			(server) =>
				(server.name?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
				server.user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
				server.user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
				server.user.email.toLowerCase().includes(searchQuery.toLowerCase())
		)
	);

	function getStatusColor(status: string) {
		switch (status) {
			case 'ACTIVE':
				return 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/50';
			case 'PENDING':
				return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/50';
			case 'SUSPENDED':
				return 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/50';
			case 'CANCELLED':
			case 'EXPIRED':
				return 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/50';
			default:
				return 'bg-muted text-muted-foreground border-border';
		}
	}

	function getTypeText(type: string) {
		switch (type) {
			case 'VPS':
				return 'VPS';
			case 'GAMESERVER':
				return 'Gameserver';
			case 'APP_HOSTING':
				return 'App Hosting';
			default:
				return type;
		}
	}
</script>

<svelte:head>
	<title>Server - Techniker Panel | TitanNode</title>
</svelte:head>

<div class="space-y-8">
	<div>
		<h1 class="text-2xl sm:text-3xl font-bold flex items-center gap-2 sm:gap-3 flex-wrap">
			<Icon icon="tabler:server" class="h-8 w-8 text-primary" />
			Server
		</h1>
		<p class="mt-2 text-muted-foreground">Übersicht aller Server (VPS, Gameserver, App Hosting). Nur Leseansicht.</p>
	</div>

	<Card class="border-border/60">
		<CardContent class="pt-6">
			<div class="mb-4">
				<Input type="search" placeholder="Suchen nach Name, Kunde…" bind:value={searchQuery} class="max-w-md" />
			</div>
			{#if filteredServers.length === 0}
				<p class="py-8 text-center text-muted-foreground">Keine Server gefunden.</p>
			{:else}
				<div class="space-y-2">
					{#each filteredServers as server}
						<div class="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border/50 p-4">
							<div class="min-w-0 flex-1">
								<div class="flex flex-wrap items-center gap-2">
									<span class="font-medium">{server.name || 'Unbenannt'}</span>
									<Badge variant="outline" class="text-xs">{getTypeText(server.type)}</Badge>
									<Badge class="{getStatusColor(server.status)} text-xs border">
										{server.status}
									</Badge>
								</div>
								<p class="text-sm text-muted-foreground mt-1">
									{server.user.firstName} {server.user.lastName} · {server.user.email}
								</p>
								{#if server.ipAddress}
									<p class="text-xs text-muted-foreground mt-0.5">
										<Icon icon="tabler:world" class="inline h-3 w-3 mr-1" />
										{server.ipAddress}
									</p>
								{/if}
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</CardContent>
	</Card>
</div>

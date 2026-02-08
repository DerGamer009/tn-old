<script lang="ts">
	import { Card, CardContent } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import Icon from '@iconify/svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	/** Status aus Pterodactyl: Wartung wenn maintenance_mode, sonst Anzeige Online (API liefert kein Daemon-Status in der Liste). */
	function getNodeStatus(node: { maintenanceMode: boolean }) {
		return node.maintenanceMode ? 'maintenance' : 'online';
	}

	function getStatusColor(status: string) {
		switch (status) {
			case 'online':
				return 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/50';
			case 'offline':
				return 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/50';
			case 'maintenance':
				return 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/50';
			default:
				return 'bg-muted text-muted-foreground border-border';
		}
	}

	function getStatusText(status: string) {
		switch (status) {
			case 'online':
				return 'Online';
			case 'offline':
				return 'Offline';
			case 'maintenance':
				return 'Wartung';
			default:
				return status;
		}
	}

	function getUsagePercent(used: number, total: number) {
		if (total <= 0) return 0;
		return Math.round((used / total) * 100);
	}

	function memoryMbToGb(mb: number) {
		return (mb / 1024).toFixed(1);
	}
</script>

<svelte:head>
	<title>Nodes (Pterodactyl) - Techniker Panel | TitanNode</title>
</svelte:head>

<div class="space-y-8">
	<div>
		<h1 class="text-2xl sm:text-3xl font-bold flex items-center gap-2 sm:gap-3 flex-wrap">
			<Icon icon="tabler:server-2" class="h-8 w-8 text-primary" />
			Nodes (Pterodactyl Panel)
		</h1>
		<p class="mt-2 text-muted-foreground">
			Nodes aus dem Pterodactyl Panel: Status (Online / Offline / Wartung) und Ressourcen.
		</p>
	</div>

	{#if data.error}
		<Card class="border-destructive/50 bg-destructive/5">
			<CardContent class="pt-6">
				<p class="text-destructive flex items-center gap-2">
					<Icon icon="tabler:alert-circle" class="h-5 w-5 shrink-0" />
					{data.error}
				</p>
				<p class="text-sm text-muted-foreground mt-2">
					Prüfe PTERODACTYL_API_BASE und PTERODACTYL_ADMIN_KEY in der .env.
				</p>
			</CardContent>
		</Card>
	{/if}

	<Card class="border-border/60">
		<CardContent class="pt-6">
			{#if data.nodes.length === 0 && !data.error}
				<p class="py-8 text-center text-muted-foreground">Keine Nodes im Pterodactyl Panel vorhanden.</p>
			{:else if data.nodes.length > 0}
				<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{#each data.nodes as node}
						{@const status = getNodeStatus(node)}
						<div class="rounded-xl border border-border/50 p-4 space-y-3">
							<div class="flex items-center justify-between gap-2">
								<span class="font-medium">{node.name}</span>
								<Badge class="{getStatusColor(status)} text-xs border">
									{getStatusText(status)}
								</Badge>
							</div>
							{#if node.description}
								<p class="text-sm text-muted-foreground">{node.description}</p>
							{/if}
							<p class="text-xs font-mono text-muted-foreground">{node.fqdn}</p>
							<div class="space-y-1 text-xs">
								<div class="flex justify-between">
									<span>RAM</span>
									<span>
										{memoryMbToGb(node.allocatedMemory)} / {memoryMbToGb(node.memory)} GB
										({getUsagePercent(node.allocatedMemory, node.memory)}%)
									</span>
								</div>
								<div class="flex justify-between">
									<span>Disk</span>
									<span>
										{memoryMbToGb(node.allocatedDisk)} / {memoryMbToGb(node.disk)} GB
										({getUsagePercent(node.allocatedDisk, node.disk)}%)
									</span>
								</div>
							</div>
							<p class="text-xs text-muted-foreground">
								Daemon: {node.daemonListen} · SFTP: {node.daemonSftp}
							</p>
						</div>
					{/each}
				</div>
			{/if}
		</CardContent>
	</Card>
</div>

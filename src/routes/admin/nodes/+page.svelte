<script lang="ts">
	import { enhance } from '$app/forms';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '$lib/components/ui/dialog';
	import Icon from '@iconify/svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let isDialogOpen = $state(false);
	let isPterodactylDialogOpen = $state(false);

	function getStatusColor(status: string) {
		switch (status) {
			case 'ONLINE': return 'bg-green-500/10 text-green-700 dark:text-green-400';
			case 'OFFLINE': return 'bg-red-500/10 text-red-700 dark:text-red-400';
			case 'MAINTENANCE': return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400';
			default: return '';
		}
	}

	function getStatusText(status: string) {
		switch (status) {
			case 'ONLINE': return 'Online';
			case 'OFFLINE': return 'Offline';
			case 'MAINTENANCE': return 'Wartung';
			default: return status;
		}
	}

	function getUsageColor(percentage: number) {
		if (percentage >= 90) return 'bg-red-500';
		if (percentage >= 70) return 'bg-yellow-500';
		return 'bg-green-500';
	}

	// Pterodactyl Node Anzeige
	function getPteroStatus(node: { maintenanceMode: boolean }) {
		return node.maintenanceMode ? 'maintenance' : 'online';
	}
	function getPteroStatusColor(status: string) {
		switch (status) {
			case 'online': return 'bg-green-500/10 text-green-700 dark:text-green-400';
			case 'offline': return 'bg-red-500/10 text-red-700 dark:text-red-400';
			case 'maintenance': return 'bg-amber-500/10 text-amber-700 dark:text-amber-400';
			default: return 'bg-muted text-muted-foreground';
		}
	}
	function getPteroStatusText(status: string) {
		switch (status) {
			case 'online': return 'Online';
			case 'offline': return 'Offline';
			case 'maintenance': return 'Wartung';
			default: return status;
		}
	}
	function memoryMbToGb(mb: number) {
		return (mb / 1024).toFixed(1);
	}
</script>

<svelte:head>
	<title>Nodes - Admin | TitanNode</title>
</svelte:head>

<div class="space-y-8">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold flex items-center gap-3">
				<Icon icon="tabler:server-2" class="h-8 w-8 text-primary" />
				Node-Verwaltung
			</h1>
			<p class="mt-2 text-muted-foreground">Verwalte Gameserver-Nodes</p>
		</div>

		<div class="flex flex-wrap gap-2">
			<Dialog bind:open={isPterodactylDialogOpen}>
				<DialogTrigger>
					<Button variant="default" class="gap-2">
						<Icon icon="tabler:server-2" class="h-4 w-4" />
						Node in Pterodactyl hinzufügen
					</Button>
				</DialogTrigger>
				<DialogContent class="max-w-2xl">
					<DialogHeader>
						<DialogTitle>Neuen Node im Pterodactyl Panel anlegen</DialogTitle>
						<DialogDescription>
							Erstellt einen neuen Wings-Node im Pterodactyl Panel. Danach Wings auf dem Server installieren und Konfiguration aus dem Panel laden.
						</DialogDescription>
					</DialogHeader>
					<form method="POST" action="?/createPterodactylNode" use:enhance={() => {
						return async ({ update }) => {
							await update();
							isPterodactylDialogOpen = false;
						};
					}}>
						<div class="grid gap-4 py-4">
							<div class="grid grid-cols-2 gap-4">
								<div class="space-y-2">
									<Label for="ptero-name">Name</Label>
									<Input id="ptero-name" name="name" placeholder="Node-DE-02" required />
								</div>
								<div class="space-y-2">
									<Label for="ptero-locationId">Standort (Location)</Label>
									<select
										id="ptero-locationId"
										name="locationId"
										required
										class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
									>
										<option value="">— Bitte wählen —</option>
										{#each data.pterodactylLocations ?? [] as loc}
											<option value={loc.id}>{loc.short} – {loc.long ?? loc.short}</option>
										{/each}
									</select>
									{#if data.pterodactylLocationsError}
										<p class="text-xs text-destructive">{data.pterodactylLocationsError}</p>
									{/if}
								</div>
							</div>
							<div class="space-y-2">
								<Label for="ptero-fqdn">FQDN (Hostname)</Label>
								<Input id="ptero-fqdn" name="fqdn" placeholder="node02.titannode.de" required />
							</div>
							<div class="grid grid-cols-2 gap-4">
								<div class="space-y-2">
									<Label for="ptero-scheme">Schema</Label>
									<select
										id="ptero-scheme"
										name="scheme"
										class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
									>
										<option value="https">https</option>
										<option value="http">http</option>
									</select>
								</div>
								<div class="space-y-2">
									<Label for="ptero-description">Beschreibung (optional)</Label>
									<Input id="ptero-description" name="description" placeholder="Produktions-Node DE" />
								</div>
							</div>
							<div class="border-t pt-4">
								<h3 class="font-semibold mb-3">Ressourcen (MB)</h3>
								<div class="grid grid-cols-2 gap-4">
									<div class="space-y-2">
										<Label for="ptero-memory">RAM (MB)</Label>
										<Input id="ptero-memory" name="memory" type="number" placeholder="16384" required min="256" />
									</div>
									<div class="space-y-2">
										<Label for="ptero-disk">Disk (MB)</Label>
										<Input id="ptero-disk" name="disk" type="number" placeholder="204800" required min="1024" />
									</div>
									<div class="space-y-2">
										<Label for="ptero-daemonListen">Daemon Port</Label>
										<Input id="ptero-daemonListen" name="daemonListen" type="number" value="8080" />
									</div>
									<div class="space-y-2">
										<Label for="ptero-daemonSftp">SFTP Port</Label>
										<Input id="ptero-daemonSftp" name="daemonSftp" type="number" value="2022" />
									</div>
								</div>
							</div>
						</div>
						<div class="flex justify-end gap-2">
							<Button type="button" variant="outline" onclick={() => isPterodactylDialogOpen = false}>
								Abbrechen
							</Button>
							<Button type="submit">Node in Pterodactyl erstellen</Button>
						</div>
					</form>
				</DialogContent>
			</Dialog>
			<Dialog bind:open={isDialogOpen}>
				<DialogTrigger>
					<Button variant="outline" class="gap-2">
						<Icon icon="tabler:plus" class="h-4 w-4" />
						Lokalen Node hinzufügen
					</Button>
				</DialogTrigger>
			<DialogContent class="max-w-2xl">
				<DialogHeader>
					<DialogTitle>Neuen Node hinzufügen</DialogTitle>
					<DialogDescription>Füge einen neuen Gameserver-Node hinzu</DialogDescription>
				</DialogHeader>
				<form method="POST" action="?/create" use:enhance={() => {
					return async ({ update }) => {
						await update();
						isDialogOpen = false;
					};
				}}>
					<div class="grid gap-4 py-4">
						<div class="grid grid-cols-2 gap-4">
							<div class="space-y-2">
								<Label for="name">Node Name</Label>
								<Input id="name" name="name" placeholder="Node-DE-01" required />
							</div>
							<div class="space-y-2">
								<Label for="location">Standort</Label>
								<Input id="location" name="location" placeholder="Frankfurt, DE" required />
							</div>
						</div>

						<div class="grid grid-cols-2 gap-4">
							<div class="space-y-2">
								<Label for="hostname">Hostname</Label>
								<Input id="hostname" name="hostname" placeholder="node01.titannode.de" required />
							</div>
							<div class="space-y-2">
								<Label for="ip">IP-Adresse</Label>
								<Input id="ip" name="ip" placeholder="192.168.1.100" required />
							</div>
						</div>

						<div class="grid grid-cols-2 gap-4">
							<div class="space-y-2">
								<Label for="port">SSH Port</Label>
								<Input id="port" name="port" type="number" value="22" required />
							</div>
							<div class="space-y-2">
								<Label for="username">SSH Username</Label>
								<Input id="username" name="username" value="root" required />
							</div>
						</div>

						<div class="border-t pt-4">
							<h3 class="font-semibold mb-3">Hardware-Spezifikationen</h3>
							<div class="grid grid-cols-3 gap-4">
								<div class="space-y-2">
									<Label for="totalCpu">CPU Cores</Label>
									<Input id="totalCpu" name="totalCpu" type="number" placeholder="32" required />
								</div>
								<div class="space-y-2">
									<Label for="totalRam">RAM (GB)</Label>
									<Input id="totalRam" name="totalRam" type="number" placeholder="128" required />
								</div>
								<div class="space-y-2">
									<Label for="totalDisk">Disk (GB)</Label>
									<Input id="totalDisk" name="totalDisk" type="number" placeholder="2000" required />
								</div>
							</div>
						</div>
					</div>

					<div class="flex justify-end gap-2">
						<Button type="button" variant="outline" onclick={() => isDialogOpen = false}>
							Abbrechen
						</Button>
						<Button type="submit">Node erstellen</Button>
					</div>
				</form>
			</DialogContent>
			</Dialog>
		</div>
	</div>

	<!-- Pterodactyl Nodes -->
	<section class="space-y-4">
		<h2 class="text-xl font-semibold flex items-center gap-2">
			<Icon icon="tabler:cloud" class="h-5 w-5 text-primary" />
			Nodes (Pterodactyl Panel)
		</h2>
		{#if data.pterodactylError}
			<Card class="border-destructive/50 bg-destructive/5">
				<CardContent class="pt-6">
					<p class="text-destructive flex items-center gap-2">
						<Icon icon="tabler:alert-circle" class="h-5 w-5 shrink-0" />
						{data.pterodactylError}
					</p>
					<p class="text-sm text-muted-foreground mt-2">
						Prüfe PTERODACTYL_API_BASE und PTERODACTYL_ADMIN_KEY in der .env.
					</p>
				</CardContent>
			</Card>
		{:else if (data.pterodactylNodes?.length ?? 0) > 0}
			<div class="grid gap-6 md:grid-cols-2">
				{#each data.pterodactylNodes as node}
					{@const status = getPteroStatus(node)}
					<a href="/admin/nodes/pterodactyl/{node.id}" class="block group">
						<Card class="border-border/50 transition-colors group-hover:bg-muted/30 group-hover:border-primary/30">
							<CardHeader>
								<div class="flex items-start justify-between">
									<div class="flex-1">
										<CardTitle class="flex items-center gap-2">
											<Icon icon="tabler:server-2" class="h-5 w-5 text-primary" />
											{node.name}
											<Icon icon="tabler:chevron-right" class="h-4 w-4 text-muted-foreground group-hover:text-primary" />
										</CardTitle>
										{#if node.description}
											<p class="text-sm text-muted-foreground mt-1">{node.description}</p>
										{/if}
										<p class="text-xs font-mono text-muted-foreground mt-1">{node.fqdn}</p>
									</div>
									<Badge variant="outline" class={getPteroStatusColor(status)}>
										{getPteroStatusText(status)}
									</Badge>
								</div>
							</CardHeader>
							<CardContent class="space-y-4">
								<div class="space-y-2 text-sm">
									<div class="flex justify-between">
										<span class="text-muted-foreground">RAM</span>
										<span>{memoryMbToGb(node.allocatedMemory)} / {memoryMbToGb(node.memory)} GB</span>
									</div>
									<div class="h-2 rounded-full bg-muted overflow-hidden">
										<div
											class="h-full transition-all {getUsageColor(node.memory ? (node.allocatedMemory / node.memory) * 100 : 0)}"
											style="width: {node.memory ? Math.min(100, (node.allocatedMemory / node.memory) * 100) : 0}%"
										></div>
									</div>
									<div class="flex justify-between">
										<span class="text-muted-foreground">Disk</span>
										<span>{memoryMbToGb(node.allocatedDisk)} / {memoryMbToGb(node.disk)} GB</span>
									</div>
									<div class="h-2 rounded-full bg-muted overflow-hidden">
										<div
											class="h-full transition-all {getUsageColor(node.disk ? (node.allocatedDisk / node.disk) * 100 : 0)}"
											style="width: {node.disk ? Math.min(100, (node.allocatedDisk / node.disk) * 100) : 0}%"
										></div>
									</div>
								</div>
								<p class="text-xs text-muted-foreground">
									Daemon: {node.daemonListen} · SFTP: {node.daemonSftp}
								</p>
								<p class="text-xs text-primary font-medium">Verwalten →</p>
							</CardContent>
						</Card>
					</a>
				{/each}
			</div>
		{:else}
			<Card class="border-border/50">
				<CardContent class="flex flex-col items-center justify-center py-8">
					<Icon icon="tabler:server-off" class="h-12 w-12 text-muted-foreground mb-3" />
					<p class="text-sm text-muted-foreground mb-3">Keine Nodes im Pterodactyl Panel.</p>
					<Button onclick={() => isPterodactylDialogOpen = true} class="gap-2">
						<Icon icon="tabler:plus" class="h-4 w-4" />
						Node in Pterodactyl hinzufügen
					</Button>
				</CardContent>
			</Card>
		{/if}
	</section>

	<!-- Lokale Nodes (Prisma) -->
	<section class="space-y-4">
		<h2 class="text-xl font-semibold flex items-center gap-2">
			<Icon icon="tabler:database" class="h-5 w-5 text-primary" />
			Lokale Nodes (Gameserver)
		</h2>
	<!-- Nodes Grid -->
	<div class="grid gap-6 md:grid-cols-2">
		{#each data.nodes as node}
			<Card class="border-border/50">
				<CardHeader>
					<div class="flex items-start justify-between">
						<div class="flex-1">
							<CardTitle class="flex items-center gap-2">
								<Icon icon="tabler:server-2" class="h-5 w-5 text-primary" />
								{node.name}
							</CardTitle>
							<p class="text-sm text-muted-foreground mt-1">
								<Icon icon="tabler:map-pin" class="inline h-3 w-3" />
								{node.location}
							</p>
						</div>
						<div class="flex gap-1">
							<Badge variant="outline" class={getStatusColor(node.status)}>
								{getStatusText(node.status)}
							</Badge>
							{#if !node.isActive}
								<Badge variant="outline" class="bg-gray-500/10">Deaktiviert</Badge>
							{/if}
						</div>
					</div>
				</CardHeader>
				<CardContent class="space-y-4">
					<!-- Connection Info -->
					<div class="rounded-lg bg-muted p-3 space-y-1 text-sm">
						<div class="flex items-center gap-2 text-muted-foreground">
							<Icon icon="tabler:network" class="h-4 w-4" />
							<span class="font-mono">{node.ip}:{node.port}</span>
						</div>
						<div class="flex items-center gap-2 text-muted-foreground">
							<Icon icon="tabler:world" class="h-4 w-4" />
							<span class="font-mono">{node.hostname}</span>
						</div>
					</div>

					<!-- Resource Usage -->
					<div class="space-y-3">
						<!-- CPU -->
						<div>
							<div class="flex items-center justify-between text-sm mb-1">
								<span class="text-muted-foreground">CPU</span>
								<span class="font-medium">{node.usedCpu} / {node.totalCpu} Cores</span>
							</div>
							<div class="h-2 rounded-full bg-muted overflow-hidden">
								<div 
									class="h-full transition-all {getUsageColor((node.usedCpu / node.totalCpu) * 100)}"
									style="width: {(node.usedCpu / node.totalCpu) * 100}%"
								></div>
							</div>
						</div>

						<!-- RAM -->
						<div>
							<div class="flex items-center justify-between text-sm mb-1">
								<span class="text-muted-foreground">RAM</span>
								<span class="font-medium">{node.usedRam} / {node.totalRam} GB</span>
							</div>
							<div class="h-2 rounded-full bg-muted overflow-hidden">
								<div 
									class="h-full transition-all {getUsageColor((node.usedRam / node.totalRam) * 100)}"
									style="width: {(node.usedRam / node.totalRam) * 100}%"
								></div>
							</div>
						</div>

						<!-- Disk -->
						<div>
							<div class="flex items-center justify-between text-sm mb-1">
								<span class="text-muted-foreground">Disk</span>
								<span class="font-medium">{node.usedDisk} / {node.totalDisk} GB</span>
							</div>
							<div class="h-2 rounded-full bg-muted overflow-hidden">
								<div 
									class="h-full transition-all {getUsageColor((node.usedDisk / node.totalDisk) * 100)}"
									style="width: {(node.usedDisk / node.totalDisk) * 100}%"
								></div>
							</div>
						</div>
					</div>

					<!-- Stats & Actions -->
					<div class="flex items-center justify-between pt-3 border-t">
						<div class="text-sm text-muted-foreground">
							<Icon icon="tabler:server" class="inline h-4 w-4" />
							{node._count.servers} Server
						</div>
						<div class="flex gap-1">
							<form method="POST" action="?/toggleStatus" use:enhance>
								<input type="hidden" name="nodeId" value={node.id} />
								<input type="hidden" name="status" value={node.status === 'ONLINE' ? 'OFFLINE' : 'ONLINE'} />
								<Button type="submit" variant="outline" size="sm">
									<Icon icon={node.status === 'ONLINE' ? 'tabler:power' : 'tabler:power-off'} class="h-4 w-4" />
								</Button>
							</form>
							<form method="POST" action="?/delete" use:enhance>
								<input type="hidden" name="nodeId" value={node.id} />
								<Button type="submit" variant="outline" size="sm" class="text-red-500 hover:text-red-600">
									<Icon icon="tabler:trash" class="h-4 w-4" />
								</Button>
							</form>
						</div>
					</div>
				</CardContent>
			</Card>
		{/each}
	</div>

	{#if data.nodes.length === 0}
		<Card class="border-border/50">
			<CardContent class="flex flex-col items-center justify-center py-12">
				<Icon icon="tabler:server-off" class="h-16 w-16 text-muted-foreground mb-4" />
				<h3 class="text-lg font-semibold mb-2">Keine lokalen Nodes vorhanden</h3>
				<p class="text-sm text-muted-foreground mb-4">Füge einen lokalen Gameserver-Node hinzu</p>
				<Button onclick={() => isDialogOpen = true}>
					<Icon icon="tabler:plus" class="mr-2 h-4 w-4" />
					Lokalen Node hinzufügen
				</Button>
			</CardContent>
		</Card>
	{/if}
	</section>
</div>


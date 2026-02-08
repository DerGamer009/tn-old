<script lang="ts">
	import { enhance } from '$app/forms';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import Icon from '@iconify/svelte';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	const node = $derived(data.node);
	let tab = $state<'about' | 'settings' | 'configuration' | 'allocation' | 'servers'>('about');

	function memoryMbToGb(mb: number) {
		return (mb / 1024).toFixed(1);
	}
	function formatMiB(mb: number) {
		return mb.toLocaleString('de-DE') + ' MiB';
	}
	function formatDate(iso: string) {
		if (!iso) return '—';
		return new Date(iso).toLocaleDateString('de-DE', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}
</script>

<svelte:head>
	<title>{node?.name ?? 'Node'} - Pterodactyl | Admin | TitanNode</title>
</svelte:head>

{#if data.error || !node}
	<Card class="border-destructive/50 bg-destructive/5">
		<CardContent class="pt-6">
			<p class="text-destructive flex items-center gap-2">
				<Icon icon="tabler:alert-circle" class="h-5 w-5 shrink-0" />
				{data.error ?? 'Node nicht gefunden'}
			</p>
			<a href="/admin/nodes" class="mt-4 inline-flex items-center gap-2 text-sm text-primary hover:underline">
				<Icon icon="tabler:arrow-left" class="h-4 w-4" />
				Zurück zur Node-Übersicht
			</a>
		</CardContent>
	</Card>
{:else}
	<!-- Breadcrumb -->
	<nav class="flex items-center gap-2 text-sm text-muted-foreground mb-6">
		<a href="/admin" class="hover:text-foreground">Admin</a>
		<Icon icon="tabler:chevron-right" class="h-4 w-4" />
		<a href="/admin/nodes" class="hover:text-foreground">Nodes</a>
		<Icon icon="tabler:chevron-right" class="h-4 w-4" />
		<span class="text-foreground font-medium">{node.name}</span>
	</nav>

	<!-- Header + Tabs -->
	<div class="mb-6">
		<h1 class="text-2xl sm:text-3xl font-bold flex items-center gap-2">
			<Icon icon="tabler:server-2" class="h-8 w-8 text-primary" />
			{node.name}
		</h1>
		<div class="flex flex-wrap gap-1 mt-3 border-b border-border">
			<button
				type="button"
				class="px-4 py-2 text-sm font-medium rounded-t transition-colors {tab === 'about'
					? 'bg-muted text-foreground border border-b-0 border-border -mb-px'
					: 'text-muted-foreground hover:text-foreground'}"
				onclick={() => (tab = 'about')}
			>
				About
			</button>
			<button
				type="button"
				class="px-4 py-2 text-sm font-medium rounded-t transition-colors {tab === 'settings'
					? 'bg-muted text-foreground border border-b-0 border-border -mb-px'
					: 'text-muted-foreground hover:text-foreground'}"
				onclick={() => (tab = 'settings')}
			>
				Settings
			</button>
			<button
				type="button"
				class="px-4 py-2 text-sm font-medium rounded-t transition-colors {tab === 'configuration'
					? 'bg-muted text-foreground border border-b-0 border-border -mb-px'
					: 'text-muted-foreground hover:text-foreground'}"
				onclick={() => (tab = 'configuration')}
			>
				Configuration
			</button>
			<button
				type="button"
				class="px-4 py-2 text-sm font-medium rounded-t transition-colors {tab === 'allocation'
					? 'bg-muted text-foreground border border-b-0 border-border -mb-px'
					: 'text-muted-foreground hover:text-foreground'}"
				onclick={() => (tab = 'allocation')}
			>
				Allocation
			</button>
			<button
				type="button"
				class="px-4 py-2 text-sm font-medium rounded-t transition-colors {tab === 'servers'
					? 'bg-muted text-foreground border border-b-0 border-border -mb-px'
					: 'text-muted-foreground hover:text-foreground'}"
				onclick={() => (tab = 'servers')}
			>
				Servers
			</button>
		</div>
	</div>

	<div class="grid gap-6 lg:grid-cols-3">
		<!-- Left: Information + Delete -->
		<div class="lg:col-span-2 space-y-6">
			{#if tab === 'about'}
				<Card class="border-border/50">
					<CardHeader>
						<CardTitle class="text-base">Information</CardTitle>
					</CardHeader>
					<CardContent class="space-y-4 text-sm">
						<div class="grid gap-3 sm:grid-cols-2">
							<div>
								<span class="text-muted-foreground block">FQDN</span>
								<span class="font-mono">{node.fqdn}</span>
							</div>
							{#if node.location}
								<div>
									<span class="text-muted-foreground block">Standort</span>
									<span>{node.location.long ?? node.location.short}</span>
								</div>
							{/if}
							<div>
								<span class="text-muted-foreground block">Schema</span>
								<span>{node.scheme}</span>
							</div>
							<div>
								<span class="text-muted-foreground block">Daemon Port</span>
								<span>{node.daemonListen}</span>
							</div>
							<div>
								<span class="text-muted-foreground block">SFTP Port</span>
								<span>{node.daemonSftp}</span>
							</div>
							<div>
								<span class="text-muted-foreground block">Erstellt</span>
								<span>{formatDate(node.createdAt)}</span>
							</div>
						</div>
						{#if node.description}
							<div>
								<span class="text-muted-foreground block">Beschreibung</span>
								<span>{node.description}</span>
							</div>
						{/if}
						<div class="flex items-center gap-2 pt-2">
							<Badge variant="outline" class={node.maintenanceMode ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400' : 'bg-green-500/10 text-green-700 dark:text-green-400'}>
								{node.maintenanceMode ? 'Wartung' : 'Online'}
							</Badge>
						</div>
					</CardContent>
				</Card>

				<Card class="border-destructive/50">
					<CardHeader>
						<CardTitle class="text-base text-destructive">Node löschen</CardTitle>
					</CardHeader>
					<CardContent class="space-y-3">
						<p class="text-sm text-muted-foreground">
							Das Löschen einer Node ist irreversibel und entfernt diese Node sofort aus dem Panel.
							Es dürfen keine Server mit dieser Node verknüpft sein, um fortzufahren.
						</p>
						{#if node.servers && node.servers.length > 0}
							<p class="text-sm text-amber-600 dark:text-amber-400">
								Aktuell sind {node.servers.length} Server auf dieser Node. Bitte zuerst alle Server entfernen oder verschieben.
							</p>
						{/if}
						<form method="POST" action="?/delete" use:enhance={() => {
							return async ({ result }) => {
								if (result.type === 'redirect') return;
							};
						}}>
							<Button
								type="submit"
								variant="destructive"
								disabled={node.servers && node.servers.length > 0}
								class="gap-2"
							>
								<Icon icon="tabler:trash" class="h-4 w-4" />
								Ja, diese Node löschen
							</Button>
							{#if form?.error && form?.error !== 'Ungültige Node-ID'}
								<p class="mt-2 text-sm text-destructive">{form.error}</p>
							{/if}
						</form>
					</CardContent>
				</Card>
			{:else if tab === 'settings'}
				<Card class="border-border/50">
					<CardHeader>
						<CardTitle class="text-base">Settings</CardTitle>
						<p class="text-sm text-muted-foreground">Node-Einstellungen bearbeiten</p>
					</CardHeader>
					<CardContent>
						<form
							method="POST"
							action="?/updateNode"
							use:enhance={() => {
								return async ({ update }) => {
									await update();
								};
							}}
							class="space-y-4"
						>
							<div class="grid gap-4 sm:grid-cols-2">
								<div class="space-y-2">
									<Label for="settings-name">Name</Label>
									<Input id="settings-name" name="name" value={node.name} required />
								</div>
								<div class="space-y-2">
									<Label for="settings-fqdn">FQDN</Label>
									<Input id="settings-fqdn" name="fqdn" value={node.fqdn} required />
								</div>
							</div>
							<div class="space-y-2">
								<Label for="settings-description">Beschreibung</Label>
								<Input id="settings-description" name="description" value={node.description ?? ''} />
							</div>
							<div class="grid gap-4 sm:grid-cols-2">
								<div class="space-y-2">
									<Label for="settings-scheme">Schema</Label>
									<select
										id="settings-scheme"
										name="scheme"
										class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
									>
										<option value="https" selected={node.scheme === 'https'}>https</option>
										<option value="http" selected={node.scheme === 'http'}>http</option>
									</select>
								</div>
								<div class="space-y-2">
									<Label for="settings-locationId">Standort</Label>
									<select
										id="settings-locationId"
										name="locationId"
										class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
									>
										<option value="">— Unverändert —</option>
										{#each (data.locations ?? []) as loc}
											<option value={loc.id} selected={node.locationId === loc.id}>
												{loc.short} – {loc.long ?? loc.short}
											</option>
										{/each}
									</select>
								</div>
							</div>
							<div class="border-t pt-4">
								<h3 class="font-semibold mb-3">Ressourcen (MB)</h3>
								<div class="grid gap-4 sm:grid-cols-2">
									<div class="space-y-2">
										<Label for="settings-memory">RAM (MB)</Label>
										<Input id="settings-memory" name="memory" type="number" value={node.memory} required min="256" />
									</div>
									<div class="space-y-2">
										<Label for="settings-disk">Disk (MB)</Label>
										<Input id="settings-disk" name="disk" type="number" value={node.disk} required min="1024" />
									</div>
									<div class="space-y-2">
										<Label for="settings-daemonListen">Daemon Port</Label>
										<Input id="settings-daemonListen" name="daemonListen" type="number" value={node.daemonListen} />
									</div>
									<div class="space-y-2">
										<Label for="settings-daemonSftp">SFTP Port</Label>
										<Input id="settings-daemonSftp" name="daemonSftp" type="number" value={node.daemonSftp} />
									</div>
								</div>
							</div>
							<div class="flex items-center gap-2">
								<input type="hidden" name="maintenanceMode" value="false" aria-hidden="true" />
								<input
									type="checkbox"
									id="settings-maintenance"
									name="maintenanceMode"
									value="true"
									checked={node.maintenanceMode}
									class="h-4 w-4 rounded border-input"
								/>
								<Label for="settings-maintenance" class="!mt-0">Wartungsmodus</Label>
							</div>
							{#if form?.form === 'settings' && form?.error}
								<p class="text-sm text-destructive">{form.error}</p>
							{/if}
							{#if form?.form === 'settings' && form?.success}
								<p class="text-sm text-green-600 dark:text-green-400">Einstellungen gespeichert.</p>
							{/if}
							<Button type="submit" class="gap-2">
								<Icon icon="tabler:device-floppy" class="h-4 w-4" />
								Speichern
							</Button>
						</form>
					</CardContent>
				</Card>
			{:else if tab === 'configuration'}
				<Card class="border-border/50">
					<CardHeader>
						<CardTitle class="text-base">Configuration</CardTitle>
						<p class="text-sm text-muted-foreground">Wings-Konfiguration für diese Node (zum Kopieren in die config auf dem Server)</p>
					</CardHeader>
					<CardContent>
						{#if data.configurationError}
							<p class="text-sm text-destructive flex items-center gap-2">
								<Icon icon="tabler:alert-circle" class="h-4 w-4 shrink-0" />
								{data.configurationError}
							</p>
						{:else if data.nodeConfiguration && Object.keys(data.nodeConfiguration).length > 0}
							<div class="relative">
								<pre class="rounded-lg border border-border bg-muted/30 p-4 text-xs font-mono overflow-x-auto max-h-[60vh] overflow-y-auto">{JSON.stringify(data.nodeConfiguration, null, 2)}</pre>
								<Button
									type="button"
									variant="outline"
									size="sm"
									class="absolute top-2 right-2 gap-1"
									onclick={() => {
										navigator.clipboard.writeText(JSON.stringify(data.nodeConfiguration, null, 2));
									}}
								>
									<Icon icon="tabler:copy" class="h-3.5 w-3.5" />
									Kopieren
								</Button>
							</div>
						{:else}
							<p class="text-sm text-muted-foreground">Keine Konfiguration verfügbar.</p>
						{/if}
					</CardContent>
				</Card>
			{:else if tab === 'allocation'}
				<Card class="border-border/50">
					<CardHeader>
						<CardTitle class="text-base">Allocations</CardTitle>
						<p class="text-sm text-muted-foreground">IP/Port-Zuweisungen für diese Node. Neue Allocations hinzufügen oder nicht zugewiesene löschen.</p>
					</CardHeader>
					<CardContent class="space-y-6">
						<!-- Neue Allocations hinzufügen -->
						<div class="rounded-lg border border-border bg-muted/20 p-4">
							<h3 class="text-sm font-semibold mb-3">Neue Allocations anlegen</h3>
							<form
								method="POST"
								action="?/addAllocation"
								use:enhance={() => {
									return async ({ update }) => {
										await update();
									};
								}}
								class="grid gap-4 sm:grid-cols-2"
							>
								<div class="space-y-2">
									<Label for="alloc-ip">IP-Adresse</Label>
									<Input id="alloc-ip" name="ip" type="text" placeholder="192.168.1.100" required />
								</div>
								<div class="space-y-2">
									<Label for="alloc-alias">Alias (optional)</Label>
									<Input id="alloc-alias" name="ipAlias" type="text" placeholder="Node1-Main" />
								</div>
								<div class="space-y-2 sm:col-span-2">
									<Label for="alloc-ports">Ports (einzeln oder Bereiche, kommagetrennt)</Label>
									<Textarea
										id="alloc-ports"
										name="ports"
										rows={2}
										placeholder="25565, 25566, 25567-25570"
										class="font-mono text-sm"
									/>
									<p class="text-xs text-muted-foreground">
										Einzelne Ports oder Bereiche wie 25567-25570, mit Komma oder Leerzeichen getrennt.
									</p>
								</div>
								{#if form?.form === 'allocation' && form?.error}
									<p class="text-sm text-destructive sm:col-span-2">{form.error}</p>
								{/if}
								{#if form?.form === 'allocation' && form?.success}
									<p class="text-sm text-green-600 dark:text-green-400 sm:col-span-2">Allocations wurden erstellt. Seite wird aktualisiert.</p>
								{/if}
								<div class="sm:col-span-2">
									<Button type="submit" class="gap-2">
										<Icon icon="tabler:plus" class="h-4 w-4" />
										Allocations anlegen
									</Button>
								</div>
							</form>
						</div>

						<!-- Liste -->
						{#if node.allocations && node.allocations.length > 0}
							<div class="rounded-md border border-border overflow-hidden">
								<table class="w-full text-sm">
									<thead class="bg-muted/50">
										<tr>
											<th class="text-left p-3 font-medium">IP</th>
											<th class="text-left p-3 font-medium">Port</th>
											<th class="text-left p-3 font-medium">Zugewiesen</th>
											<th class="text-left p-3 font-medium">Notizen</th>
											<th class="text-right p-3 font-medium w-20">Aktion</th>
										</tr>
									</thead>
									<tbody>
										{#each node.allocations as alloc}
											<tr class="border-t border-border">
												<td class="p-3 font-mono">{alloc.ip}</td>
												<td class="p-3">{alloc.port}</td>
												<td class="p-3">
													<Badge variant={alloc.assigned ? 'default' : 'outline'} class="text-xs">
														{alloc.assigned ? 'Ja' : 'Nein'}
													</Badge>
												</td>
												<td class="p-3 text-muted-foreground">{alloc.notes ?? '—'}</td>
												<td class="p-3 text-right">
													<form method="POST" action="?/deleteAllocation" use:enhance class="inline">
														<input type="hidden" name="allocationId" value={alloc.id} />
														<Button
															type="submit"
															variant="ghost"
															size="sm"
															class="text-destructive hover:text-destructive hover:bg-destructive/10"
															disabled={alloc.assigned}
															title={alloc.assigned ? 'Zugewiesene Allocations können nicht gelöscht werden.' : 'Allocation löschen'}
														>
															<Icon icon="tabler:trash" class="h-4 w-4" />
														</Button>
													</form>
												</td>
											</tr>
										{/each}
									</tbody>
								</table>
							</div>
						{:else}
							<p class="text-sm text-muted-foreground">Keine Allocations vorhanden. Lege oben neue an.</p>
						{/if}
					</CardContent>
				</Card>
			{:else if tab === 'servers'}
				<Card class="border-border/50">
					<CardHeader>
						<CardTitle class="text-base">Servers</CardTitle>
						<p class="text-sm text-muted-foreground">Auf dieser Node laufende Server</p>
					</CardHeader>
					<CardContent>
						{#if node.servers && node.servers.length > 0}
							<ul class="space-y-2">
								{#each node.servers as server}
									<li class="flex items-center justify-between rounded-lg border border-border p-3">
										<div>
											<span class="font-medium">{server.name}</span>
											<span class="text-muted-foreground text-sm ml-2 font-mono">{server.identifier}</span>
										</div>
										{#if server.status}
											<Badge variant="outline" class="text-xs">{server.status}</Badge>
										{/if}
									</li>
								{/each}
							</ul>
						{:else}
							<p class="text-sm text-muted-foreground">Keine Server auf dieser Node.</p>
						{/if}
					</CardContent>
				</Card>
			{/if}
		</div>

		<!-- Right: At-a-Glance -->
		<div class="space-y-4">
			<Card class="border-border/50 bg-muted/20">
				<CardHeader>
					<CardTitle class="text-sm font-medium text-muted-foreground">At-a-Glance</CardTitle>
				</CardHeader>
				<CardContent class="space-y-4">
					<div class="rounded-lg border border-border bg-background p-4">
						<div class="flex items-center gap-3">
							<div class="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
								<Icon icon="tabler:database" class="h-5 w-5 text-primary" />
							</div>
							<div>
								<p class="text-xs text-muted-foreground">Disk zugewiesen</p>
								<p class="font-semibold">{formatMiB(node.allocatedDisk)} / {formatMiB(node.disk)}</p>
							</div>
						</div>
					</div>
					<div class="rounded-lg border border-border bg-background p-4">
						<div class="flex items-center gap-3">
							<div class="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
								<Icon icon="tabler:memory-stick" class="h-5 w-5 text-primary" />
							</div>
							<div>
								<p class="text-xs text-muted-foreground">RAM zugewiesen</p>
								<p class="font-semibold">{formatMiB(node.allocatedMemory)} / {formatMiB(node.memory)}</p>
							</div>
						</div>
					</div>
					<div class="rounded-lg border border-border bg-background p-4">
						<div class="flex items-center gap-3">
							<div class="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
								<Icon icon="tabler:stack-2" class="h-5 w-5 text-primary" />
							</div>
							<div>
								<p class="text-xs text-muted-foreground">Server gesamt</p>
								<p class="font-semibold">{node.servers?.length ?? 0}</p>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	</div>
{/if}

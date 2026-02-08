<script lang="ts">
	import type { PageData } from './$types';
	import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Badge } from '$lib/components/ui/badge';
	import Icon from '@iconify/svelte';
	import { invalidateAll } from '$app/navigation';

	let { data }: { data: PageData } = $props();

	let serverName = $state('');
	let serverDescription = $state('');
	let isLoading = $state(false);
	let isSaving = $state(false);
	let settingsData = $state<PageData['settings'] | null>(null);
	let loadingSettings = $state(false);

	$effect(() => {
		if (data.server?.name) serverName = data.server.name;
		if (data.settings != null) settingsData = data.settings;
	});

	async function loadSettings() {
		loadingSettings = true;
		try {
			const response = await fetch(`/api/gameserver/${data.server.id}/settings`);
			if (response.ok) {
				settingsData = await response.json();
				if (settingsData?.server?.description) {
					serverDescription = settingsData.server.description;
				}
			}
		} catch (error) {
			console.error('Fehler beim Laden der Settings:', error);
		} finally {
			loadingSettings = false;
		}
	}

	async function saveServerName() {
		if (!serverName.trim() || (serverName.trim() === data.server.name && serverDescription === (settingsData?.server?.description || ''))) {
			return;
		}

		isSaving = true;
		try {
			const response = await fetch(`/api/gameserver/${data.server.id}/settings/rename`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ 
					name: serverName.trim(),
					description: serverDescription.trim()
				})
			});

			if (!response.ok) {
				let errorMessage = 'Fehler beim Speichern der Einstellungen';
				try {
					const error = await response.json();
					errorMessage = error.error || error.message || errorMessage;
				} catch {
					errorMessage = `Fehler ${response.status}: ${response.statusText}`;
				}
				alert(errorMessage);
				serverName = data.server.name; // Reset
				serverDescription = settingsData?.server?.description || ''; // Reset
				return;
			}

			await invalidateAll();
			await loadSettings(); // Reload settings
			alert('Einstellungen erfolgreich gespeichert');
		} catch (error) {
			console.error('Fehler beim Speichern:', error);
			alert('Fehler beim Speichern der Einstellungen');
			serverName = data.server.name; // Reset
			serverDescription = settingsData?.server?.description || ''; // Reset
		} finally {
			isSaving = false;
		}
	}

	// Lade Settings beim Mount
	$effect(() => {
		if (!settingsData) {
			loadSettings();
		}
	});
</script>

<svelte:head>
	<title>Settings - {data.server.name} | TitanNode Dashboard</title>
</svelte:head>

<div class="space-y-6">
	<div class="flex items-center gap-3">
		<Icon icon="tabler:settings" class="h-8 w-8 text-primary" />
		<h1 class="text-3xl font-bold">Settings</h1>
	</div>

	<!-- Server Name -->
	<Card class="border-border/50">
		<CardHeader>
			<CardTitle class="flex items-center gap-2">
				<Icon icon="tabler:tag" class="h-5 w-5" />
				Server-Name
			</CardTitle>
			<CardDescription>
				Ändere den Namen deines Gameservers
			</CardDescription>
		</CardHeader>
		<CardContent class="space-y-4">
			<div class="space-y-2">
				<Label for="server-name">Server-Name</Label>
				<Input
					id="server-name"
					bind:value={serverName}
					placeholder="Server-Name eingeben..."
					disabled={isSaving}
				/>
			</div>
			<div class="space-y-2">
				<Label for="server-description">Beschreibung</Label>
				<Input
					id="server-description"
					bind:value={serverDescription}
					placeholder="Server-Beschreibung eingeben..."
					disabled={isSaving}
				/>
			</div>
			<div class="flex justify-end">
				<Button
					onclick={() => saveServerName()}
					disabled={isSaving || !serverName.trim() || (serverName.trim() === data.server.name && serverDescription === (settingsData?.server?.description || ''))}
				>
					{isSaving ? 'Wird gespeichert...' : 'Speichern'}
				</Button>
			</div>
		</CardContent>
	</Card>

	<!-- Server Details -->
	{#if settingsData?.server}
		<Card class="border-border/50">
			<CardHeader>
				<CardTitle class="flex items-center gap-2">
					<Icon icon="tabler:info-circle" class="h-5 w-5" />
					Server-Details
				</CardTitle>
				<CardDescription>
					Informationen vom Pterodactyl Panel
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div class="grid gap-4 md:grid-cols-2">
					<div class="space-y-3">
						<div class="flex justify-between items-center py-2 border-b border-border/50">
							<span class="text-sm text-muted-foreground">UUID</span>
							<span class="text-sm font-mono text-xs break-all">{settingsData.server.uuid}</span>
						</div>
						<div class="flex justify-between items-center py-2 border-b border-border/50">
							<span class="text-sm text-muted-foreground">Identifier</span>
							<span class="text-sm font-mono">{settingsData.server.identifier}</span>
						</div>
						<div class="flex justify-between items-center py-2 border-b border-border/50">
							<span class="text-sm text-muted-foreground">Beschreibung</span>
							<span class="text-sm">{settingsData.server.description || 'Keine Beschreibung'}</span>
						</div>
					</div>
					<div class="space-y-3">
						<div class="flex justify-between items-center py-2 border-b border-border/50">
							<span class="text-sm text-muted-foreground">Status</span>
							<Badge variant="outline">{settingsData.server.status || 'N/A'}</Badge>
						</div>
						<div class="flex justify-between items-center py-2 border-b border-border/50">
							<span class="text-sm text-muted-foreground">Suspended</span>
							<Badge variant={settingsData.server.suspended ? 'destructive' : 'default'}>
								{settingsData.server.suspended ? 'Ja' : 'Nein'}
							</Badge>
						</div>
						{#if settingsData.server.container}
							<div class="flex justify-between items-center py-2">
								<span class="text-sm text-muted-foreground">Image</span>
								<span class="text-sm font-mono text-xs">{settingsData.server.container.image || 'N/A'}</span>
							</div>
						{/if}
					</div>
				</div>
			</CardContent>
		</Card>
	{/if}

	<!-- Server Resources -->
	{#if settingsData?.resources}
		<Card class="border-border/50">
			<CardHeader>
				<CardTitle class="flex items-center gap-2">
					<Icon icon="tabler:chart-bar" class="h-5 w-5" />
					Ressourcen-Nutzung
				</CardTitle>
				<CardDescription>
					Aktuelle Ressourcen-Nutzung des Servers
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
					<div class="space-y-2">
						<div class="flex items-center justify-between">
							<span class="text-sm text-muted-foreground">CPU</span>
							<span class="text-sm font-medium">
								{settingsData.resources.resources?.cpu_absolute?.toFixed(1) || '0'}%
							</span>
						</div>
						<div class="h-2 bg-muted rounded-full overflow-hidden">
							<div
								class="h-full bg-blue-500 transition-all"
								style="width: {Math.min((settingsData.resources.resources?.cpu_absolute || 0), 100)}%"
							></div>
						</div>
					</div>
					<div class="space-y-2">
						<div class="flex items-center justify-between">
							<span class="text-sm text-muted-foreground">RAM</span>
							<span class="text-sm font-medium">
								{settingsData.resources.resources?.memory_bytes 
									? (settingsData.resources.resources.memory_bytes / 1024 / 1024).toFixed(0) 
									: '0'} MB
							</span>
						</div>
						<div class="h-2 bg-muted rounded-full overflow-hidden">
							<div
								class="h-full bg-purple-500 transition-all"
								style="width: {settingsData.resources.resources?.memory_bytes && settingsData.server?.limits?.memory 
									? Math.min((settingsData.resources.resources.memory_bytes / 1024 / 1024) / (settingsData.server.limits.memory / 1024) * 100, 100) 
									: 0}%"
							></div>
						</div>
					</div>
					<div class="space-y-2">
						<div class="flex items-center justify-between">
							<span class="text-sm text-muted-foreground">Disk</span>
							<span class="text-sm font-medium">
								{settingsData.resources.resources?.disk_bytes 
									? (settingsData.resources.resources.disk_bytes / 1024 / 1024).toFixed(0) 
									: '0'} MB
							</span>
						</div>
						<div class="h-2 bg-muted rounded-full overflow-hidden">
							<div
								class="h-full bg-green-500 transition-all"
								style="width: {settingsData.resources.resources?.disk_bytes && settingsData.server?.limits?.disk 
									? Math.min((settingsData.resources.resources.disk_bytes / 1024 / 1024) / (settingsData.server.limits.disk / 1024) * 100, 100) 
									: 0}%"
							></div>
						</div>
					</div>
					<div class="space-y-2">
						<div class="flex items-center justify-between">
							<span class="text-sm text-muted-foreground">Network</span>
							<span class="text-sm font-medium">
								{settingsData.resources.resources?.network?.rx_bytes && settingsData.resources.resources?.network?.tx_bytes
									? ((settingsData.resources.resources.network.rx_bytes + settingsData.resources.resources.network.tx_bytes) / 1024 / 1024).toFixed(2)
									: '0'} MB
							</span>
						</div>
						<div class="h-2 bg-muted rounded-full overflow-hidden">
							<div class="h-full bg-orange-500 transition-all" style="width: 50%"></div>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	{/if}

	<!-- Server Limits -->
	{#if settingsData?.server?.limits}
		<Card class="border-border/50">
			<CardHeader>
				<CardTitle class="flex items-center gap-2">
					<Icon icon="tabler:gauge" class="h-5 w-5" />
					Server-Limits
				</CardTitle>
				<CardDescription>
					Konfigurierte Limits für diesen Server
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div class="grid gap-4 md:grid-cols-2">
					<div class="space-y-3">
						<div class="flex justify-between items-center py-2 border-b border-border/50">
							<span class="text-sm text-muted-foreground">CPU Limit</span>
							<span class="text-sm font-medium">{settingsData.server.limits.cpu}%</span>
						</div>
						<div class="flex justify-between items-center py-2 border-b border-border/50">
							<span class="text-sm text-muted-foreground">RAM Limit</span>
							<span class="text-sm font-medium">{(settingsData.server.limits.memory / 1024).toFixed(0)} GB</span>
						</div>
						<div class="flex justify-between items-center py-2">
							<span class="text-sm text-muted-foreground">Disk Limit</span>
							<span class="text-sm font-medium">{(settingsData.server.limits.disk / 1024).toFixed(0)} GB</span>
						</div>
					</div>
					<div class="space-y-3">
						<div class="flex justify-between items-center py-2 border-b border-border/50">
							<span class="text-sm text-muted-foreground">Swap</span>
							<span class="text-sm font-medium">{(settingsData.server.limits.swap / 1024).toFixed(0)} GB</span>
						</div>
						<div class="flex justify-between items-center py-2 border-b border-border/50">
							<span class="text-sm text-muted-foreground">IO Block Weight</span>
							<span class="text-sm font-medium">{settingsData.server.limits.io || 'N/A'}</span>
						</div>
						{#if settingsData.server.feature_limits}
							<div class="flex justify-between items-center py-2">
								<span class="text-sm text-muted-foreground">Databases</span>
								<span class="text-sm font-medium">{settingsData.server.feature_limits.databases || 0}</span>
							</div>
						{/if}
					</div>
				</div>
			</CardContent>
		</Card>
	{/if}

	<!-- Refresh Button -->
	<Card class="border-border/50">
		<CardContent class="p-6">
			<Button
				variant="outline"
				onclick={() => loadSettings()}
				disabled={loadingSettings}
				class="w-full"
			>
				<Icon icon="tabler:refresh" class="h-4 w-4 mr-2" />
				{loadingSettings ? 'Lädt...' : 'Settings aktualisieren'}
			</Button>
		</CardContent>
	</Card>
</div>

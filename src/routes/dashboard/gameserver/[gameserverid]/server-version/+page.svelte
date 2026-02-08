<script lang="ts">
	import type { PageData } from './$types';
	import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '$lib/components/ui/dialog';
	import Icon from '@iconify/svelte';
	import { invalidateAll } from '$app/navigation';

	let { data }: { data: PageData } = $props();

	let loading = $state(false);
	let saving = $state(false);
	let selectedServerVersion = $state<string>('');
	let selectedVersion = $state('');
	let showChangeDialog = $state(false);

	// Verfügbare Server-Versionen
	const serverVersions = [
		{ id: 'paper', name: 'Paper', icon: 'tabler:file-code', description: 'Hochperformante Minecraft Server Software' },
		{ id: 'velocity', name: 'Velocity', icon: 'tabler:rocket', description: 'Moderner Proxy-Server für Minecraft' },
		{ id: 'purpur', name: 'Purpur', icon: 'tabler:sparkles', description: 'Paper Fork mit zusätzlichen Features' },
		{ id: 'folia', name: 'Folia', icon: 'tabler:layers', description: 'Multi-Threaded Server Software' },
		{ id: 'neoforge', name: 'NeoForge', icon: 'tabler:tool', description: 'Moderne Forge-Alternative' },
		{ id: 'fabric', name: 'Fabric', icon: 'tabler:package', description: 'Leichtgewichtige Mod-API' },
		{ id: 'forge', name: 'Forge', icon: 'tabler:settings', description: 'Klassische Mod-API' },
		{ id: 'waterfall', name: 'Waterfall', icon: 'tabler:alert-triangle', description: 'BungeeCord Fork', deprecated: true, warning: 'Wird nicht länger unterstützt - wir übernehmen keine Haftung' }
	];

	function detectCurrentVersion(): string {
		// Versuche die aktuelle Version aus Environment-Variablen zu erkennen
		const env = data.environment || {};
		const dockerImage = data.dockerImage || '';
		
		// Prüfe Docker-Image
		if (dockerImage.includes('paper')) return 'paper';
		if (dockerImage.includes('velocity')) return 'velocity';
		if (dockerImage.includes('purpur')) return 'purpur';
		if (dockerImage.includes('folia')) return 'folia';
		if (dockerImage.includes('neoforge')) return 'neoforge';
		if (dockerImage.includes('fabric')) return 'fabric';
		if (dockerImage.includes('forge')) return 'forge';
		if (dockerImage.includes('waterfall')) return 'waterfall';
		
		// Prüfe Environment-Variablen
		const jarFile = env.SERVER_JARFILE || '';
		if (jarFile.includes('paper')) return 'paper';
		if (jarFile.includes('velocity')) return 'velocity';
		if (jarFile.includes('purpur')) return 'purpur';
		if (jarFile.includes('folia')) return 'folia';
		if (jarFile.includes('neoforge')) return 'neoforge';
		if (jarFile.includes('fabric')) return 'fabric';
		if (jarFile.includes('forge')) return 'forge';
		if (jarFile.includes('waterfall')) return 'waterfall';
		
		return '';
	}

	const currentServerVersion = $derived(detectCurrentVersion());

	async function loadVersion() {
		loading = true;
		try {
			const response = await fetch(`/api/gameserver/${data.server.id}/server-version`);
			if (response.ok) {
				const result = await response.json();
				// Aktualisiere die Anzeige
			}
		} catch (error) {
			console.error('Fehler beim Laden der Server-Version:', error);
		} finally {
			loading = false;
		}
	}

	function openChangeDialog(versionId: string) {
		selectedServerVersion = versionId;
		selectedVersion = '';
		showChangeDialog = true;
	}

	async function changeVersion() {
		if (saving) return;

		if (!selectedServerVersion) {
			alert('Bitte wähle eine Server-Version aus');
			return;
		}

		// Warnung für Waterfall
		if (selectedServerVersion === 'waterfall') {
			if (!confirm('WARNUNG: Waterfall wird nicht länger unterstützt. Wir übernehmen keine Haftung für Probleme. Möchtest du wirklich fortfahren?')) {
				return;
			}
		}

		saving = true;
		try {
			const response = await fetch(`/api/gameserver/${data.server.id}/server-version`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					serverVersion: selectedServerVersion,
					version: selectedVersion.trim() || undefined
				})
			});

			if (!response.ok) {
				let errorMessage = 'Fehler beim Ändern der Server-Version';
				try {
					const error = await response.json();
					errorMessage = error.error || error.message || errorMessage;
				} catch {
					errorMessage = `Fehler ${response.status}: ${response.statusText}`;
				}
				alert(errorMessage);
				return;
			}

			showChangeDialog = false;
			selectedServerVersion = '';
			selectedVersion = '';
			await invalidateAll();
			await loadVersion();
			alert('Server-Version erfolgreich geändert. Bitte starte den Server neu, damit die Änderungen wirksam werden.');
		} catch (error) {
			console.error('Fehler beim Ändern:', error);
			alert('Fehler beim Ändern der Server-Version');
		} finally {
			saving = false;
		}
	}
</script>

<svelte:head>
	<title>Server Version - {data.server.name} | TitanNode Dashboard</title>
</svelte:head>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<div class="flex items-center gap-3">
			<Icon icon="tabler:code" class="h-8 w-8 text-primary" />
			<h1 class="text-3xl font-bold">Server Version</h1>
		</div>
		<div class="flex gap-2">
			<Button variant="outline" onclick={() => loadVersion()} disabled={loading}>
				<Icon icon="tabler:refresh" class="h-4 w-4 mr-2" />
				{loading ? 'Lädt...' : 'Aktualisieren'}
			</Button>
		</div>
	</div>

	<!-- Aktuelle Version -->
	{#if currentServerVersion}
		<Card class="border-border/50">
			<CardHeader>
				<CardTitle>Aktuelle Server-Version</CardTitle>
				<CardDescription>
					Die derzeit installierte Server-Version
				</CardDescription>
			</CardHeader>
			<CardContent>
				{@const currentVersion = serverVersions.find(v => v.id === currentServerVersion)}
				{#if currentVersion}
					<div class="flex items-center gap-4">
						<Icon icon={currentVersion.icon} class="h-12 w-12 text-primary" />
						<div>
							<h3 class="text-lg font-semibold">{currentVersion.name}</h3>
							<p class="text-sm text-muted-foreground">{currentVersion.description}</p>
						</div>
						{#if currentVersion.deprecated}
							<Badge variant="destructive" class="ml-auto">Deprecated</Badge>
						{/if}
					</div>
				{:else}
					<p class="text-muted-foreground">Unbekannte Version: {currentServerVersion}</p>
				{/if}
			</CardContent>
		</Card>
	{/if}

	<!-- Verfügbare Versionen -->
	<Card class="border-border/50">
		<CardHeader>
			<CardTitle>Verfügbare Server-Versionen</CardTitle>
			<CardDescription>
				Wähle eine Server-Version für {data.server.name}
			</CardDescription>
		</CardHeader>
		<CardContent>
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{#each serverVersions as version}
					<div class="p-4 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors {version.deprecated ? 'opacity-75' : ''}">
						<div class="flex items-start justify-between mb-3">
							<div class="flex items-center gap-3">
								<Icon icon={version.icon} class="h-8 w-8 text-primary" />
								<div>
									<h3 class="font-semibold">{version.name}</h3>
									<p class="text-xs text-muted-foreground">{version.description}</p>
								</div>
							</div>
							{#if version.deprecated}
								<Badge variant="destructive" class="text-xs">Deprecated</Badge>
							{/if}
						</div>
						{#if version.warning}
							<div class="mb-3 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded text-xs text-yellow-600 dark:text-yellow-400">
								<Icon icon="tabler:alert-triangle" class="h-4 w-4 inline mr-1" />
								{version.warning}
							</div>
						{/if}
						<Button
							variant={version.id === currentServerVersion ? 'outline' : 'default'}
							size="sm"
							class="w-full"
							onclick={() => openChangeDialog(version.id)}
							disabled={version.id === currentServerVersion}
						>
							{version.id === currentServerVersion ? 'Aktuell installiert' : 'Version wählen'}
						</Button>
					</div>
				{/each}
			</div>
		</CardContent>
	</Card>

	<!-- Change Version Dialog -->
	<Dialog bind:open={showChangeDialog}>
		<DialogContent>
			<DialogHeader>
				<DialogTitle>Server-Version ändern</DialogTitle>
				<DialogDescription>
					Ändere die Server-Version für {data.server.name}
				</DialogDescription>
			</DialogHeader>
			<div class="space-y-4">
				{#if selectedServerVersion}
					{@const selectedVersionInfo = serverVersions.find(v => v.id === selectedServerVersion)}
					{#if selectedVersionInfo}
						<div class="p-4 bg-muted/50 rounded-lg">
							<div class="flex items-center gap-3 mb-2">
								<Icon icon={selectedVersionInfo.icon} class="h-6 w-6 text-primary" />
								<h4 class="font-semibold">{selectedVersionInfo.name}</h4>
							</div>
							<p class="text-sm text-muted-foreground">{selectedVersionInfo.description}</p>
							{#if selectedVersionInfo.deprecated && selectedVersionInfo.warning}
								<div class="mt-3 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded text-xs text-yellow-600 dark:text-yellow-400">
									<Icon icon="tabler:alert-triangle" class="h-4 w-4 inline mr-1" />
									{selectedVersionInfo.warning}
								</div>
							{/if}
						</div>
					{/if}
				{/if}
				<div class="space-y-2">
					<Label for="version">Minecraft-Version (optional)</Label>
					<Input
						id="version"
						bind:value={selectedVersion}
						placeholder="z.B. 1.20.1"
					/>
					<p class="text-xs text-muted-foreground">
						Lasse dieses Feld leer, um die neueste Version zu verwenden
					</p>
				</div>
			</div>
			<DialogFooter>
				<Button variant="outline" onclick={() => { showChangeDialog = false; selectedServerVersion = ''; selectedVersion = ''; }}>
					Abbrechen
				</Button>
				<Button onclick={() => changeVersion()} disabled={saving}>
					{saving ? 'Wird geändert...' : 'Version ändern'}
				</Button>
			</DialogFooter>
		</DialogContent>
	</Dialog>
</div>

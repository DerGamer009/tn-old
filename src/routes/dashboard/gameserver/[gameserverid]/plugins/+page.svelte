<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Tabs, TabsContent, TabsList, TabsTrigger } from '$lib/components/ui/tabs';
	import Icon from '@iconify/svelte';
	import type { PageData } from './$types';
	import { onMount } from 'svelte';

	let { data }: { data: PageData } = $props();

	let searchQuery = $state('');
	let selectedPluginTab = $state('spigotmc');
	let loading = $state<Record<string, boolean>>({});
	let installedPlugins = $state<any[]>([]);
	let searchResults = $state<Record<string, any[]>>({
		spigotmc: [],
		papermc: [],
		modrinth: [],
		curseforge: [],
		craftingstudiopro: []
	});

	// Plugin-Quellen
	const sources = [
		{ id: 'spigotmc', name: 'SpigotMC', icon: 'tabler:package', color: 'text-orange-500', comingSoon: false },
		{ id: 'papermc', name: 'PaperMC Hangar', icon: 'tabler:rocket', color: 'text-blue-500', comingSoon: false },
		{ id: 'modrinth', name: 'Modrinth', icon: 'tabler:box', color: 'text-green-500', comingSoon: false },
		{ id: 'curseforge', name: 'CurseForge', icon: 'tabler:flame', color: 'text-orange-600', comingSoon: true },
		{ id: 'craftingstudiopro', name: 'CraftingStudioPro', icon: 'tabler:sparkles', color: 'text-purple-500', comingSoon: false }
	];

	async function searchPlugins(source: string) {
		const sourceObj = sources.find(s => s.id === source);
		if (sourceObj?.comingSoon) {
			return; // Coming Soon Quellen nicht durchsuchen
		}

		if (!searchQuery.trim()) {
			searchResults[source] = [];
			return;
		}

		loading[`search-${source}`] = true;
		try {
			const response = await fetch(`/api/gameserver/${data.server.id}/plugins/search?source=${source}&query=${encodeURIComponent(searchQuery)}`);
			if (response.ok) {
				const data = await response.json();
				searchResults[source] = data.plugins || [];
			} else {
				console.error('Fehler beim Suchen:', await response.text());
				searchResults[source] = [];
			}
		} catch (error) {
			console.error('Fehler beim Suchen:', error);
			searchResults[source] = [];
		} finally {
			loading[`search-${source}`] = false;
		}
	}

	async function installPlugin(source: string, pluginId: string, pluginName: string) {
		if (!confirm(`Möchtest du "${pluginName}" wirklich installieren?`)) {
			return;
		}

		loading[`install-${source}-${pluginId}`] = true;
		try {
			const response = await fetch(`/api/gameserver/${data.server.id}/plugins/install`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ source, pluginId })
			});

			if (response.ok) {
				alert('Plugin erfolgreich installiert!');
				await loadInstalledPlugins();
			} else {
				const error = await response.json();
				alert(error.error || 'Fehler beim Installieren des Plugins');
			}
		} catch (error) {
			console.error('Fehler beim Installieren:', error);
			alert('Fehler beim Installieren des Plugins');
		} finally {
			loading[`install-${source}-${pluginId}`] = false;
		}
	}

	async function loadInstalledPlugins() {
		try {
			const response = await fetch(`/api/gameserver/${data.server.id}/plugins/installed`);
			if (response.ok) {
				const data = await response.json();
				installedPlugins = data.plugins || [];
			}
		} catch (error) {
			console.error('Fehler beim Laden der installierten Plugins:', error);
		}
	}

	async function uninstallPlugin(fileName: string, pluginName: string) {
		if (!confirm(`Möchtest du "${pluginName}" wirklich deinstallieren?`)) {
			return;
		}

		loading[`uninstall-${fileName}`] = true;
		try {
			const response = await fetch(`/api/gameserver/${data.server.id}/plugins/uninstall`, {
				method: 'DELETE',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ fileName })
			});

			if (response.ok) {
				alert('Plugin erfolgreich deinstalliert!');
				await loadInstalledPlugins();
			} else {
				const error = await response.json();
				alert(error.error || 'Fehler beim Deinstallieren des Plugins');
			}
		} catch (error) {
			console.error('Fehler beim Deinstallieren:', error);
			alert('Fehler beim Deinstallieren des Plugins');
		} finally {
			loading[`uninstall-${fileName}`] = false;
		}
	}

	onMount(() => {
		loadInstalledPlugins();
	});
</script>

<svelte:head>
	<title>Plugin Installer - {data.server.name} | TitanNode</title>
</svelte:head>

<div class="space-y-6">
	<!-- Header -->
	<div>
		<h2 class="text-2xl font-bold flex items-center gap-2">
			<Icon icon="tabler:package" class="h-6 w-6 text-primary" />
			Plugin Installer
		</h2>
		<p class="text-muted-foreground mt-1">
			Installiere Plugins von verschiedenen Quellen auf deinem Gameserver
		</p>
	</div>

	<!-- Installed Plugins -->
	<Card class="border-border/50">
		<CardHeader>
			<CardTitle>Installierte Plugins</CardTitle>
			<CardDescription>Übersicht aller auf diesem Server installierten Plugins</CardDescription>
		</CardHeader>
		<CardContent>
			{#if installedPlugins.length === 0}
				<div class="text-center py-8 text-muted-foreground">
					<Icon icon="tabler:package-off" class="h-12 w-12 mx-auto mb-4 opacity-50" />
					<p>Noch keine Plugins installiert</p>
				</div>
			{:else}
				<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{#each installedPlugins as plugin}
						<Card class="border-border/50 hover:border-destructive/50 transition-colors">
							<CardContent class="p-4">
								<div class="space-y-3">
									<div class="flex items-center justify-between">
										<div class="flex-1">
											<h4 class="font-semibold line-clamp-1">{plugin.name}</h4>
											<p class="text-sm text-muted-foreground">{plugin.version || 'Unbekannte Version'}</p>
											{#if plugin.size}
												<p class="text-xs text-muted-foreground mt-1">
													{(plugin.size / 1024 / 1024).toFixed(2)} MB
												</p>
											{/if}
										</div>
										<Badge variant="outline" class="ml-2">Installiert</Badge>
									</div>
									<Button
										variant="destructive"
										size="sm"
										class="w-full"
										onclick={() => uninstallPlugin(plugin.file, plugin.name)}
										disabled={loading[`uninstall-${plugin.file}`]}
									>
										{#if loading[`uninstall-${plugin.file}`]}
											<Icon icon="tabler:loader-2" class="h-4 w-4 mr-2 animate-spin" />
										{:else}
											<Icon icon="tabler:trash" class="h-4 w-4 mr-2" />
										{/if}
										Deinstallieren
									</Button>
								</div>
							</CardContent>
						</Card>
					{/each}
				</div>
			{/if}
		</CardContent>
	</Card>

	<!-- Plugin Search -->
	<Card class="border-border/50">
		<CardHeader>
			<CardTitle>Plugin suchen & installieren</CardTitle>
			<CardDescription>
				Durchsuche verschiedene Plugin-Quellen und installiere Plugins direkt auf deinem Server
			</CardDescription>
		</CardHeader>
		<CardContent>
			<!-- Search Input -->
			<div class="mb-6">
				<Label for="plugin-search">Plugin suchen</Label>
				<div class="flex gap-2 mt-2">
					<Input
						id="plugin-search"
						type="text"
						placeholder="Plugin-Name eingeben..."
						bind:value={searchQuery}
						onkeydown={(e) => {
							if (e.key === 'Enter') {
								// Suche in allen verfügbaren Quellen (nicht Coming Soon)
								sources.filter(s => !s.comingSoon).forEach(source => searchPlugins(source.id));
							}
						}}
					/>
					<Button onclick={() => sources.forEach(source => searchPlugins(source.id))}>
						<Icon icon="tabler:search" class="h-4 w-4 mr-2" />
						Suchen
					</Button>
				</div>
			</div>

			<!-- Plugin Sources Tabs -->
			<Tabs bind:value={selectedPluginTab} class="w-full">
				<TabsList class="grid w-full grid-cols-5">
					{#each sources as source}
						<TabsTrigger value={source.id} class="text-xs sm:text-sm relative" disabled={source.comingSoon}>
							<Icon icon={source.icon} class="h-4 w-4 mr-1 sm:mr-2" />
							<span class="hidden sm:inline">{source.name}</span>
							<span class="sm:hidden">{source.name.split(' ')[0]}</span>
							{#if source.comingSoon}
								<Badge variant="outline" class="ml-1 text-[8px] px-1 py-0">Soon</Badge>
							{/if}
						</TabsTrigger>
					{/each}
				</TabsList>

				{#each sources as source}
					<TabsContent value={source.id} class="mt-4">
						{#if source.comingSoon}
							<div class="text-center py-16">
								<div class="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-muted mx-auto">
									<Icon icon={source.icon} class="h-14 w-14 text-muted-foreground" />
								</div>
								<h3 class="text-xl font-semibold mb-2">{source.name}</h3>
								<Badge variant="outline" class="mb-4">
									<Icon icon="tabler:clock" class="h-3 w-3 mr-1" />
									Coming Soon
								</Badge>
								<p class="text-muted-foreground max-w-md mx-auto">
									Die Integration von {source.name} ist in Entwicklung und wird bald verfügbar sein.
								</p>
							</div>
						{:else if loading[`search-${source.id}`]}
							<div class="text-center py-8">
								<Icon icon="tabler:loader-2" class="h-8 w-8 mx-auto animate-spin text-primary" />
								<p class="text-muted-foreground mt-2">Suche Plugins...</p>
							</div>
						{:else if searchQuery.trim() && searchResults[source.id].length === 0}
							<div class="text-center py-8 text-muted-foreground">
								<Icon icon="tabler:package-off" class="h-12 w-12 mx-auto mb-4 opacity-50" />
								<p>Keine Plugins gefunden</p>
							</div>
						{:else if !searchQuery.trim()}
							<div class="text-center py-8 text-muted-foreground">
								<Icon icon="tabler:search" class="h-12 w-12 mx-auto mb-4 opacity-50" />
								<p>Gib einen Plugin-Namen ein, um zu suchen</p>
							</div>
						{:else}
							<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
								{#each searchResults[source.id] as plugin}
									<Card class="border-border/50 hover:border-primary/50 transition-colors">
										<CardContent class="p-4">
											<div class="space-y-3">
												<div>
													<h4 class="font-semibold line-clamp-1">{plugin.name}</h4>
													<p class="text-sm text-muted-foreground line-clamp-2">
														{plugin.description || 'Keine Beschreibung verfügbar'}
													</p>
												</div>
												<div class="flex items-center justify-between">
													<div class="flex items-center gap-2">
														{#if plugin.version}
															<Badge variant="outline" class="text-xs">
																v{plugin.version}
															</Badge>
														{/if}
														{#if plugin.downloads}
															<span class="text-xs text-muted-foreground">
																{plugin.downloads.toLocaleString()} Downloads
															</span>
														{/if}
													</div>
												</div>
												<Button
													class="w-full"
													size="sm"
													onclick={() => installPlugin(source.id, plugin.id, plugin.name)}
													disabled={loading[`install-${source.id}-${plugin.id}`]}
												>
													{#if loading[`install-${source.id}-${plugin.id}`]}
														<Icon icon="tabler:loader-2" class="h-4 w-4 mr-2 animate-spin" />
													{:else}
														<Icon icon="tabler:download" class="h-4 w-4 mr-2" />
													{/if}
													Installieren
												</Button>
											</div>
										</CardContent>
									</Card>
								{/each}
							</div>
						{/if}
					</TabsContent>
				{/each}
			</Tabs>
		</CardContent>
	</Card>
</div>

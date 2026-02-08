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

	let databases = $state<PageData['databases']>([]);
	let loading = $state(false);

	$effect(() => {
		if (data.databases != null) databases = data.databases;
	});
	let creatingDatabase = $state(false);
	let databaseName = $state('');
	let databaseRemote = $state('%');
	let showCreateDialog = $state(false);
	let showPasswordDialog = $state(false);
	let newPassword = $state<string | null>(null);
	let passwordDatabaseId = $state<string | null>(null);

	async function loadDatabases() {
		loading = true;
		try {
			const response = await fetch(`/api/gameserver/${data.server.id}/databases`);
			if (response.ok) {
				const result = await response.json();
				databases = result.databases || [];
			}
		} catch (error) {
			console.error('Fehler beim Laden der Databases:', error);
		} finally {
			loading = false;
		}
	}

	async function createDatabase() {
		if (creatingDatabase) return;

		if (!databaseName.trim()) {
			alert('Bitte gib einen Database-Namen ein');
			return;
		}

		creatingDatabase = true;
		try {
			const response = await fetch(`/api/gameserver/${data.server.id}/databases`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					database: databaseName.trim(),
					remote: databaseRemote.trim()
				})
			});

			if (!response.ok) {
				let errorMessage = 'Fehler beim Erstellen der Database';
				try {
					const error = await response.json();
					errorMessage = error.error || error.message || errorMessage;
				} catch {
					errorMessage = `Fehler ${response.status}: ${response.statusText}`;
				}
				alert(errorMessage);
				return;
			}

			const result = await response.json();
			const db = result.database;
			const password = db.relationships?.password?.attributes?.password;

			showCreateDialog = false;
			databaseName = '';
			databaseRemote = '%';
			await invalidateAll();
			await loadDatabases();
			
			if (password) {
				newPassword = password;
				passwordDatabaseId = db.id;
				showPasswordDialog = true;
			} else {
				alert('Database erfolgreich erstellt');
			}
		} catch (error) {
			console.error('Fehler beim Erstellen:', error);
			alert('Fehler beim Erstellen der Database');
		} finally {
			creatingDatabase = false;
		}
	}

	async function deleteDatabase(databaseId: string, databaseName: string) {
		if (!confirm(`Möchtest du die Database "${databaseName}" wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.`)) {
			return;
		}

		try {
			const response = await fetch(`/api/gameserver/${data.server.id}/databases/${databaseId}`, {
				method: 'DELETE'
			});

			if (!response.ok) {
				const error = await response.json();
				alert(error.error || 'Fehler beim Löschen der Database');
				return;
			}

			await invalidateAll();
			await loadDatabases();
			alert('Database erfolgreich gelöscht');
		} catch (error) {
			console.error('Fehler beim Löschen:', error);
			alert('Fehler beim Löschen der Database');
		}
	}

	async function rotatePassword(databaseId: string) {
		try {
			const response = await fetch(`/api/gameserver/${data.server.id}/databases/${databaseId}/rotate-password`, {
				method: 'POST'
			});

			if (!response.ok) {
				const error = await response.json();
				alert(error.error || 'Fehler beim Rotieren des Passworts');
				return;
			}

			const result = await response.json();
			newPassword = result.password;
			passwordDatabaseId = databaseId;
			showPasswordDialog = true;
		} catch (error) {
			console.error('Fehler beim Rotieren:', error);
			alert('Fehler beim Rotieren des Passworts');
		}
	}
</script>

<svelte:head>
	<title>Databases - {data.server.name} | TitanNode Dashboard</title>
</svelte:head>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<div class="flex items-center gap-3">
			<Icon icon="tabler:database" class="h-8 w-8 text-primary" />
			<h1 class="text-3xl font-bold">Databases</h1>
		</div>
		<div class="flex gap-2">
			<Button variant="outline" onclick={() => loadDatabases()} disabled={loading}>
				<Icon icon="tabler:refresh" class="h-4 w-4 mr-2" />
				{loading ? 'Lädt...' : 'Aktualisieren'}
			</Button>
			<Dialog bind:open={showCreateDialog}>
				<DialogTrigger>
					<Button disabled={data.databaseLimit > 0 && data.databaseUsed >= data.databaseLimit}>
						<Icon icon="tabler:plus" class="h-4 w-4 mr-2" />
						Database erstellen
					</Button>
				</DialogTrigger>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Neue Database erstellen</DialogTitle>
						<DialogDescription>
							Erstelle eine neue MySQL/MariaDB Database für {data.server.name}
						</DialogDescription>
					</DialogHeader>
					<div class="space-y-4">
						<div class="space-y-2">
							<Label for="database-name">Database-Name</Label>
							<Input
								id="database-name"
								bind:value={databaseName}
								placeholder="z.B. playerdata"
							/>
							<p class="text-xs text-muted-foreground">
								Der vollständige Name wird automatisch mit Server-Präfix erstellt
							</p>
						</div>
						<div class="space-y-2">
							<Label for="database-remote">Remote-Zugriff</Label>
							<Input
								id="database-remote"
								bind:value={databaseRemote}
								placeholder="%"
							/>
							<p class="text-xs text-muted-foreground">
								% = von überall, 127.0.0.1 = nur lokal, IP-Adresse oder Subnetz
							</p>
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onclick={() => { showCreateDialog = false; }}>
							Abbrechen
						</Button>
						<Button onclick={() => createDatabase()} disabled={creatingDatabase}>
							{creatingDatabase ? 'Wird erstellt...' : 'Database erstellen'}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	</div>

	<!-- Limit Anzeige -->
	{#if data.databaseLimit > 0}
		<Card class="border-border/50">
			<CardContent class="p-4">
				<div class="flex items-center justify-between">
					<div class="flex items-center gap-2">
						<Icon icon="tabler:database" class="h-5 w-5 text-muted-foreground" />
						<span class="text-sm text-muted-foreground">Database-Limit</span>
					</div>
					<div class="flex items-center gap-2">
						<span class="text-sm font-medium">{data.databaseUsed} / {data.databaseLimit}</span>
						<div class="h-2 w-32 bg-muted rounded-full overflow-hidden">
							<div
								class="h-full bg-primary transition-all"
								style="width: {Math.min((data.databaseUsed / data.databaseLimit) * 100, 100)}%"
							></div>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	{/if}

	<Card class="border-border/50">
		<CardHeader>
			<CardTitle>Database-Liste</CardTitle>
			<CardDescription>
				Verwalte deine Server-Databases
			</CardDescription>
		</CardHeader>
		<CardContent>
			{#if databases.length > 0}
				<div class="space-y-3">
					{#each databases as database}
						{@const attrs = database.attributes || database}
						<div class="flex items-start gap-4 p-4 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors">
							<div class="flex-1 min-w-0">
								<div class="flex items-center gap-2 mb-2">
									<h3 class="font-medium">{attrs.name}</h3>
								</div>
								<div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground mb-3">
									<div>
										<span class="font-medium">Username:</span> <span class="font-mono text-xs">{attrs.username}</span>
									</div>
									<div>
										<span class="font-medium">Host:</span> {attrs.host?.address || 'N/A'}:{attrs.host?.port || 3306}
									</div>
									<div>
										<span class="font-medium">Remote:</span> {attrs.remote || attrs.connections_from || '%'}
									</div>
									<div>
										<span class="font-medium">ID:</span> <span class="font-mono text-xs">{attrs.id}</span>
									</div>
								</div>
								<div class="flex flex-wrap gap-2">
									<Button
										variant="outline"
										size="sm"
										onclick={() => rotatePassword(attrs.id)}
									>
										<Icon icon="tabler:key" class="h-4 w-4 mr-2" />
										Passwort rotieren
									</Button>
									<Button
										variant="destructive"
										size="sm"
										onclick={() => deleteDatabase(attrs.id, attrs.name)}
									>
										<Icon icon="tabler:trash" class="h-4 w-4 mr-2" />
										Löschen
									</Button>
								</div>
							</div>
						</div>
					{/each}
				</div>
			{:else}
				<div class="text-center py-12">
					<Icon icon="tabler:database" class="h-12 w-12 text-muted-foreground mx-auto mb-4" />
					<p class="text-muted-foreground">Noch keine Databases vorhanden</p>
					<p class="text-sm text-muted-foreground mt-2">
						Erstelle deine erste Database für {data.server.name}
					</p>
				</div>
			{/if}
		</CardContent>
	</Card>

	<!-- Password Dialog -->
	<Dialog bind:open={showPasswordDialog}>
		<DialogContent>
			<DialogHeader>
				<DialogTitle>Database-Passwort</DialogTitle>
				<DialogDescription>
					Speichere dieses Passwort sicher. Es wird nicht erneut angezeigt.
				</DialogDescription>
			</DialogHeader>
			<div class="space-y-4">
				<div class="space-y-2">
					<Label>Passwort</Label>
					<div class="flex gap-2">
						<Input
							value={newPassword || ''}
							readonly
							class="font-mono"
						/>
						<Button
							variant="outline"
							onclick={() => {
								if (newPassword) {
									navigator.clipboard.writeText(newPassword);
									alert('Passwort in Zwischenablage kopiert');
								}
							}}
						>
							<Icon icon="tabler:copy" class="h-4 w-4" />
						</Button>
					</div>
				</div>
			</div>
			<DialogFooter>
				<Button onclick={() => { showPasswordDialog = false; newPassword = null; passwordDatabaseId = null; }}>
					Schließen
				</Button>
			</DialogFooter>
		</DialogContent>
	</Dialog>
</div>

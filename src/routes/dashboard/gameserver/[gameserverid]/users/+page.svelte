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

	let users = $state<PageData['users']>([]);
	let loading = $state(false);

	$effect(() => {
		if (data.users != null) users = data.users;
	});
	let creatingUser = $state(false);
	let showCreateDialog = $state(false);
	let showEditDialog = $state(false);
	let editingUserId = $state<string | null>(null);

	// User Form
	let userEmail = $state('');
	let selectedPermissions = $state<string[]>([]);

	// Alle verfügbaren Permissions
	const allPermissions = [
		// Server Control
		{ key: 'websocket.connect', label: 'Console anzeigen', category: 'Server Control' },
		{ key: 'control.start', label: 'Server starten', category: 'Server Control' },
		{ key: 'control.stop', label: 'Server stoppen', category: 'Server Control' },
		{ key: 'control.restart', label: 'Server neustarten', category: 'Server Control' },
		{ key: 'control.kill', label: 'Server killen', category: 'Server Control' },
		// File Management
		{ key: 'files.create', label: 'Dateien erstellen', category: 'File Management' },
		{ key: 'files.read', label: 'Dateien lesen', category: 'File Management' },
		{ key: 'files.update', label: 'Dateien bearbeiten', category: 'File Management' },
		{ key: 'files.delete', label: 'Dateien löschen', category: 'File Management' },
		{ key: 'files.archive', label: 'Archive erstellen', category: 'File Management' },
		{ key: 'files.sftp', label: 'SFTP-Zugriff', category: 'File Management' },
		// Backups
		{ key: 'backups.create', label: 'Backups erstellen', category: 'Backups' },
		{ key: 'backups.read', label: 'Backups anzeigen', category: 'Backups' },
		{ key: 'backups.delete', label: 'Backups löschen', category: 'Backups' },
		{ key: 'backups.download', label: 'Backups herunterladen', category: 'Backups' },
		{ key: 'backups.restore', label: 'Backups wiederherstellen', category: 'Backups' },
		// Network
		{ key: 'allocations.read', label: 'Allocations anzeigen', category: 'Network' },
		{ key: 'allocations.create', label: 'Allocations erstellen', category: 'Network' },
		{ key: 'allocations.update', label: 'Allocations bearbeiten', category: 'Network' },
		{ key: 'allocations.delete', label: 'Allocations löschen', category: 'Network' },
		// Databases
		{ key: 'databases.create', label: 'Databases erstellen', category: 'Databases' },
		{ key: 'databases.read', label: 'Databases anzeigen', category: 'Databases' },
		{ key: 'databases.update', label: 'Database-Passwörter rotieren', category: 'Databases' },
		{ key: 'databases.delete', label: 'Databases löschen', category: 'Databases' },
		// Schedules
		{ key: 'schedules.create', label: 'Schedules erstellen', category: 'Schedules' },
		{ key: 'schedules.read', label: 'Schedules anzeigen', category: 'Schedules' },
		{ key: 'schedules.update', label: 'Schedules bearbeiten', category: 'Schedules' },
		{ key: 'schedules.delete', label: 'Schedules löschen', category: 'Schedules' },
		// Users
		{ key: 'users.create', label: 'Users einladen', category: 'Users' },
		{ key: 'users.read', label: 'Users anzeigen', category: 'Users' },
		{ key: 'users.update', label: 'User-Permissions bearbeiten', category: 'Users' },
		{ key: 'users.delete', label: 'Users entfernen', category: 'Users' },
		// Startup
		{ key: 'startup.read', label: 'Startup anzeigen', category: 'Startup' },
		{ key: 'startup.update', label: 'Startup bearbeiten', category: 'Startup' }
	];

	const permissionCategories = Array.from(new Set(allPermissions.map(p => p.category)));

	function formatDate(date: string | null | undefined): string {
		if (!date) return 'Nie';
		const d = new Date(date);
		return d.toLocaleString('de-DE', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	async function loadUsers() {
		loading = true;
		try {
			const response = await fetch(`/api/gameserver/${data.server.id}/users`);
			if (response.ok) {
				const result = await response.json();
				users = result.users || [];
			}
		} catch (error) {
			console.error('Fehler beim Laden der Users:', error);
		} finally {
			loading = false;
		}
	}

	function resetUserForm() {
		userEmail = '';
		selectedPermissions = [];
	}

	function openEditUser(user: any) {
		const attrs = user.attributes || user;
		editingUserId = attrs.uuid;
		userEmail = attrs.email;
		selectedPermissions = [...(attrs.permissions || [])];
		showEditDialog = true;
	}

	async function createUser() {
		if (creatingUser) return;

		if (!userEmail.trim() || !userEmail.includes('@')) {
			alert('Bitte gib eine gültige E-Mail-Adresse ein');
			return;
		}

		if (selectedPermissions.length === 0) {
			alert('Bitte wähle mindestens eine Berechtigung aus');
			return;
		}

		creatingUser = true;
		try {
			const response = await fetch(`/api/gameserver/${data.server.id}/users`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					email: userEmail.trim(),
					permissions: selectedPermissions
				})
			});

			if (!response.ok) {
				let errorMessage = 'Fehler beim Einladen des Users';
				try {
					const error = await response.json();
					errorMessage = error.error || error.message || errorMessage;
				} catch {
					errorMessage = `Fehler ${response.status}: ${response.statusText}`;
				}
				alert(errorMessage);
				return;
			}

			showCreateDialog = false;
			resetUserForm();
			await invalidateAll();
			await loadUsers();
			alert('User erfolgreich eingeladen');
		} catch (error) {
			console.error('Fehler beim Erstellen:', error);
			alert('Fehler beim Einladen des Users');
		} finally {
			creatingUser = false;
		}
	}

	async function updateUser() {
		if (!editingUserId) return;

		if (selectedPermissions.length === 0) {
			alert('Bitte wähle mindestens eine Berechtigung aus');
			return;
		}

		try {
			const response = await fetch(`/api/gameserver/${data.server.id}/users/${editingUserId}`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					permissions: selectedPermissions
				})
			});

			if (!response.ok) {
				const error = await response.json();
				alert(error.error || 'Fehler beim Aktualisieren der Permissions');
				return;
			}

			showEditDialog = false;
			editingUserId = null;
			resetUserForm();
			await invalidateAll();
			await loadUsers();
			alert('Permissions erfolgreich aktualisiert');
		} catch (error) {
			console.error('Fehler beim Aktualisieren:', error);
			alert('Fehler beim Aktualisieren der Permissions');
		}
	}

	async function deleteUser(userId: string, userEmail: string) {
		if (!confirm(`Möchtest du den User "${userEmail}" wirklich entfernen? Der Zugriff wird sofort widerrufen.`)) {
			return;
		}

		try {
			const response = await fetch(`/api/gameserver/${data.server.id}/users/${userId}`, {
				method: 'DELETE'
			});

			if (!response.ok) {
				const error = await response.json();
				alert(error.error || 'Fehler beim Entfernen des Users');
				return;
			}

			await invalidateAll();
			await loadUsers();
			alert('User erfolgreich entfernt');
		} catch (error) {
			console.error('Fehler beim Löschen:', error);
			alert('Fehler beim Entfernen des Users');
		}
	}

	function togglePermission(permission: string) {
		if (selectedPermissions.includes(permission)) {
			selectedPermissions = selectedPermissions.filter(p => p !== permission);
		} else {
			selectedPermissions = [...selectedPermissions, permission];
		}
	}

	function selectCategory(category: string) {
		const categoryPermissions = allPermissions
			.filter(p => p.category === category)
			.map(p => p.key);
		const allSelected = categoryPermissions.every(p => selectedPermissions.includes(p));
		
		if (allSelected) {
			selectedPermissions = selectedPermissions.filter(p => !categoryPermissions.includes(p));
		} else {
			const newPerms = categoryPermissions.filter(p => !selectedPermissions.includes(p));
			selectedPermissions = [...selectedPermissions, ...newPerms];
		}
	}
</script>

<svelte:head>
	<title>Users - {data.server.name} | TitanNode Dashboard</title>
</svelte:head>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<div class="flex items-center gap-3">
			<Icon icon="tabler:users" class="h-8 w-8 text-primary" />
			<h1 class="text-3xl font-bold">Users</h1>
		</div>
		<div class="flex gap-2">
			<Button variant="outline" onclick={() => loadUsers()} disabled={loading}>
				<Icon icon="tabler:refresh" class="h-4 w-4 mr-2" />
				{loading ? 'Lädt...' : 'Aktualisieren'}
			</Button>
			<Dialog bind:open={showCreateDialog}>
				<DialogTrigger>
					<Button>
						<Icon icon="tabler:plus" class="h-4 w-4 mr-2" />
						User einladen
					</Button>
				</DialogTrigger>
				<DialogContent class="max-w-3xl max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>User einladen</DialogTitle>
						<DialogDescription>
							Lade einen neuen User ein, der Zugriff auf {data.server.name} erhält
						</DialogDescription>
					</DialogHeader>
					<div class="space-y-4">
						<div class="space-y-2">
							<Label for="user-email">E-Mail-Adresse</Label>
							<Input
								id="user-email"
								type="email"
								bind:value={userEmail}
								placeholder="user@example.com"
							/>
							<p class="text-xs text-muted-foreground">
								Der User muss bereits ein Pterodactyl-Panel-Konto haben
							</p>
						</div>
						<div class="space-y-3">
							<Label>Berechtigungen</Label>
							<div class="space-y-4 max-h-96 overflow-y-auto border rounded-lg p-4">
								{#each permissionCategories as category}
									<div class="space-y-2">
										<div class="flex items-center justify-between">
											<h4 class="font-medium">{category}</h4>
											<Button
												variant="ghost"
												size="sm"
												onclick={() => selectCategory(category)}
											>
												{allPermissions.filter(p => p.category === category).every(p => selectedPermissions.includes(p.key)) ? 'Alle abwählen' : 'Alle auswählen'}
											</Button>
										</div>
										<div class="grid grid-cols-1 md:grid-cols-2 gap-2">
											{#each allPermissions.filter(p => p.category === category) as perm}
												<Label class="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-muted">
													<input
														type="checkbox"
														checked={selectedPermissions.includes(perm.key)}
														onchange={() => togglePermission(perm.key)}
														class="rounded"
													/>
													<span class="text-sm">{perm.label}</span>
												</Label>
											{/each}
										</div>
									</div>
								{/each}
							</div>
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onclick={() => { showCreateDialog = false; resetUserForm(); }}>
							Abbrechen
						</Button>
						<Button onclick={() => createUser()} disabled={creatingUser}>
							{creatingUser ? 'Wird eingeladen...' : 'User einladen'}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	</div>

	<Card class="border-border/50">
		<CardHeader>
			<CardTitle>Subuser-Liste</CardTitle>
			<CardDescription>
				Verwalte die Benutzer mit Zugriff auf {data.server.name}
			</CardDescription>
		</CardHeader>
		<CardContent>
			{#if users.length > 0}
				<div class="space-y-4">
					{#each users as user}
						{@const attrs = user.attributes || user}
						<div class="p-4 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors">
							<div class="flex items-start justify-between mb-3">
								<div class="flex-1">
									<div class="flex items-center gap-2 mb-2">
										<h3 class="font-medium text-lg">{attrs.username || attrs.email}</h3>
										{#if attrs['2fa_enabled']}
											<Badge variant="outline">2FA</Badge>
										{/if}
									</div>
									<div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground mb-3">
										<div>
											<span class="font-medium">E-Mail:</span> {attrs.email}
										</div>
										<div>
											<span class="font-medium">Hinzugefügt:</span> {formatDate(attrs.created_at)}
										</div>
										<div>
											<span class="font-medium">Permissions:</span> {attrs.permissions?.length || 0}
										</div>
										<div>
											<span class="font-medium">UUID:</span> <span class="font-mono text-xs">{attrs.uuid}</span>
										</div>
									</div>
									{#if attrs.permissions && attrs.permissions.length > 0}
										<div class="mt-3">
											<p class="text-sm font-medium mb-2">Berechtigungen:</p>
											<div class="flex flex-wrap gap-2">
												{#each attrs.permissions as perm}
													{@const permInfo = allPermissions.find(p => p.key === perm)}
													<Badge variant="secondary" class="text-xs">
														{permInfo?.label || perm}
													</Badge>
												{/each}
											</div>
										</div>
									{/if}
								</div>
								<div class="flex flex-wrap gap-2 mt-3">
									<Button
										variant="outline"
										size="sm"
										onclick={() => openEditUser(user)}
									>
										<Icon icon="tabler:edit" class="h-4 w-4 mr-2" />
										Permissions bearbeiten
									</Button>
									<Button
										variant="destructive"
										size="sm"
										onclick={() => deleteUser(attrs.uuid, attrs.email)}
									>
										<Icon icon="tabler:trash" class="h-4 w-4 mr-2" />
										Entfernen
									</Button>
								</div>
							</div>
						</div>
					{/each}
				</div>
			{:else}
				<div class="text-center py-12">
					<Icon icon="tabler:users" class="h-12 w-12 text-muted-foreground mx-auto mb-4" />
					<p class="text-muted-foreground">Noch keine Subusers vorhanden</p>
					<p class="text-sm text-muted-foreground mt-2">
						Lade deinen ersten User für {data.server.name} ein
					</p>
				</div>
			{/if}
		</CardContent>
	</Card>

	<!-- Edit User Dialog -->
	<Dialog bind:open={showEditDialog}>
		<DialogContent class="max-w-3xl max-h-[90vh] overflow-y-auto">
			<DialogHeader>
				<DialogTitle>Permissions bearbeiten</DialogTitle>
				<DialogDescription>
					Bearbeite die Berechtigungen für {userEmail}
				</DialogDescription>
			</DialogHeader>
			<div class="space-y-4">
				<div class="space-y-3">
					<Label>Berechtigungen</Label>
					<div class="space-y-4 max-h-96 overflow-y-auto border rounded-lg p-4">
						{#each permissionCategories as category}
							<div class="space-y-2">
								<div class="flex items-center justify-between">
									<h4 class="font-medium">{category}</h4>
									<Button
										variant="ghost"
										size="sm"
										onclick={() => selectCategory(category)}
									>
										{allPermissions.filter(p => p.category === category).every(p => selectedPermissions.includes(p.key)) ? 'Alle abwählen' : 'Alle auswählen'}
									</Button>
								</div>
								<div class="grid grid-cols-1 md:grid-cols-2 gap-2">
									{#each allPermissions.filter(p => p.category === category) as perm}
										<Label class="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-muted">
											<input
												type="checkbox"
												checked={selectedPermissions.includes(perm.key)}
												onchange={() => togglePermission(perm.key)}
												class="rounded"
											/>
											<span class="text-sm">{perm.label}</span>
										</Label>
									{/each}
								</div>
							</div>
						{/each}
					</div>
				</div>
			</div>
			<DialogFooter>
				<Button variant="outline" onclick={() => { showEditDialog = false; editingUserId = null; resetUserForm(); }}>
					Abbrechen
				</Button>
				<Button onclick={() => updateUser()}>
					Speichern
				</Button>
			</DialogFooter>
		</DialogContent>
	</Dialog>
</div>

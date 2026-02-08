<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Input } from '$lib/components/ui/input';
	import {
		Table,
		TableBody,
		TableCell,
		TableHead,
		TableHeader,
		TableRow
	} from '$lib/components/ui/table';
	import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '$lib/components/ui/dialog';
	import Icon from '@iconify/svelte';
	import type { PageData } from './$types';
	import { goto } from '$app/navigation';

	let { data }: { data: PageData } = $props();

	// File Manager State
	let currentPath = $state('/');
	let files = $state<any[]>([]);
	let loadingFiles = $state(false);
	let uploading = $state(false);
	let fileInput: HTMLInputElement | null = null;
	let deleteDialogOpen = $state(false);
	let deleteTarget = $state<any | null>(null);
	let deleting = $state(false);

	$effect(() => {
		if (!deleteDialogOpen) deleteTarget = null;
	});

	// File Manager Functions
	async function loadFiles(path?: string) {
		if (!data || !data.server || !(data.server as any).pterodactylServerId) return;

		loadingFiles = true;
		try {
			const response = await fetch(`/api/apps/${data.server.id}/files?path=${encodeURIComponent(path || currentPath)}`);
			if (!response.ok) {
				throw new Error('Konnte Dateien nicht laden');
			}

			const fileData = await response.json();
			files = fileData.data || [];
			if (path) currentPath = path;
		} catch (error) {
			console.error('Error loading files:', error);
			alert('Fehler beim Laden der Dateien');
		} finally {
			loadingFiles = false;
		}
	}

	function navigateToDirectory(file: any) {
		if (file.is_file) return;
		const newPath = currentPath === '/' ? `/${file.name}` : `${currentPath}/${file.name}`;
		loadFiles(newPath);
	}

	function goUp() {
		if (currentPath === '/') return;
		const parts = currentPath.split('/').filter(p => p);
		parts.pop();
		const newPath = parts.length === 0 ? '/' : '/' + parts.join('/');
		loadFiles(newPath);
	}

	async function deleteFile(file: any) {
		if (!data || !data.server || !(data.server as any).pterodactylServerId) return;

		try {
			const response = await fetch(`/api/apps/${data.server.id}/files/delete`, {
				method: 'DELETE',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					files: [file.name],
					path: currentPath
				})
			});

			if (!response.ok) {
				throw new Error('Konnte Datei nicht löschen');
			}

			await loadFiles();
			alert('Datei erfolgreich gelöscht');
		} catch (error) {
			console.error('Error deleting file:', error);
			alert('Fehler beim Löschen der Datei');
		}
	}

	function requestDelete(file: any) {
		deleteTarget = file;
		deleteDialogOpen = true;
	}

	function editFile(file: any) {
		const filename = encodeURIComponent(file.name);
		goto(`/dashboard/apps/${data.server.id}/files/edit/${filename}?path=${encodeURIComponent(currentPath)}`);
	}

	function openFileDialog() {
		if (uploading) return;
		if (fileInput) {
			fileInput.click();
		}
	}

	async function handleUpload(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		if (!file) return;

		if (!data || !data.server || !(data.server as any).pterodactylServerId) {
			alert('Server nicht gefunden.');
			return;
		}

		uploading = true;
		try {
			// Lade Datei über unseren Proxy-Endpoint (löst CORS-Problem)
			const formData = new FormData();
			formData.append('files', file);
			formData.append('directory', currentPath);

			const uploadResponse = await fetch(
				`/api/apps/${data.server.id}/files/upload/proxy`,
				{
					method: 'POST',
					body: formData
				}
			);

			if (!uploadResponse.ok) {
				const err = await uploadResponse.json().catch(() => ({ message: 'Unknown error' }));
				console.error('Upload Fehler:', err);
				alert(`Fehler beim Hochladen der Datei: ${err.message || 'Unbekannter Fehler'}`);
				return;
			}

			await loadFiles();
			alert('Datei erfolgreich hochgeladen.');
		} catch (error) {
			console.error('Fehler beim Hochladen:', error);
			alert('Fehler beim Hochladen der Datei.');
		} finally {
			uploading = false;
			(target as HTMLInputElement).value = '';
		}
	}

	// Load files on mount
	$effect(() => {
		if (data && data.server && (data.server as any).pterodactylServerId) {
			loadFiles();
		}
	});
</script>

<svelte:head>
	<title>Dateien - {data.server.name} | TitanNode Dashboard</title>
</svelte:head>

<div class="space-y-6">
	<input
		type="file"
		class="hidden"
		bind:this={fileInput}
		onchange={handleUpload}
	/>
	<div class="flex items-center justify-between">
		<h1 class="text-2xl sm:text-3xl font-bold flex items-center gap-2 sm:gap-3 flex-wrap">
			<Icon icon="tabler:folder" class="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
			<span>File Manager</span>
		</h1>
		<div class="flex gap-2">
			<Button
				type="button"
				size="sm"
				variant="default"
				class="gap-2"
				onclick={openFileDialog}
				disabled={uploading}
			>
				<Icon icon="tabler:upload" class="h-4 w-4" />
				{uploading ? 'Lädt...' : 'Upload'}
			</Button>
			<Button
				variant="outline"
				size="sm"
				onclick={() => goto(`/dashboard/apps/${data.server.id}`)}
			>
				<Icon icon="tabler:arrow-left" class="h-4 w-4 mr-2" />
				Zurück
			</Button>
		</div>
	</div>

	<Card class="border-border/50">
		<CardContent class="p-6">
			<div class="space-y-4">
					<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
					<div class="flex items-center gap-2">
						<h3 class="text-lg font-semibold">Dateien</h3>
						<Badge variant="outline" class="font-mono text-xs">{currentPath}</Badge>
					</div>
						<div class="flex flex-wrap gap-2">
							<Button
								type="button"
								size="sm"
								variant="outline"
								class="gap-2"
								onclick={openFileDialog}
								disabled={uploading}
							>
								<Icon icon="tabler:upload" class="h-4 w-4" />
								{uploading ? 'Lädt...' : 'Upload'}
							</Button>
						<Button
							size="sm"
							variant="outline"
							onclick={() => loadFiles()}
							disabled={loadingFiles}
						>
							<Icon icon="tabler:refresh" class="h-4 w-4 mr-2" />
							Aktualisieren
						</Button>
						{#if currentPath !== '/'}
							<Button
								size="sm"
								variant="outline"
								onclick={() => goUp()}
							>
								<Icon icon="tabler:arrow-up" class="h-4 w-4 mr-2" />
								Zurück
							</Button>
						{/if}
					</div>
				</div>

				{#if loadingFiles}
					<div class="flex items-center justify-center py-8">
						<p class="text-muted-foreground">Lade Dateien...</p>
					</div>
				{:else if files.length === 0}
					<div class="flex items-center justify-center py-8">
						<p class="text-muted-foreground">Keine Dateien gefunden</p>
					</div>
				{:else}
					<div class="border rounded-lg overflow-hidden">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Name</TableHead>
									<TableHead>Typ</TableHead>
									<TableHead>Größe</TableHead>
									<TableHead>Geändert</TableHead>
									<TableHead class="text-right">Aktionen</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{#each files as file (file.name)}
									<TableRow 
										class="cursor-pointer hover:bg-muted/50" 
										role="button"
										tabindex={0}
										onclick={() => file.is_file ? editFile(file) : navigateToDirectory(file)}
										onkeydown={(e) => {
											if (e.key === 'Enter' || e.key === ' ') {
												e.preventDefault();
												file.is_file ? editFile(file) : navigateToDirectory(file);
											}
										}}
									>
										<TableCell class="font-medium">
											<div class="flex items-center gap-2">
												<Icon
													icon={file.is_file ? 'tabler:file' : 'tabler:folder'}
													class="h-4 w-4"
												/>
												{file.name}
											</div>
										</TableCell>
										<TableCell>
											<Badge variant={file.is_file ? 'outline' : 'secondary'}>
												{file.is_file ? 'Datei' : 'Ordner'}
											</Badge>
										</TableCell>
										<TableCell>
											{#if file.is_file}
												{file.size ? (Number(file.size) / 1024).toFixed(2) + ' KB' : '-'}
											{:else}
												-
											{/if}
										</TableCell>
										<TableCell>
											{#if file.modified_at}
												{new Date(file.modified_at).toLocaleDateString('de-DE')}
											{:else}
												-
											{/if}
										</TableCell>
										<TableCell class="text-right">
											<div 
												class="flex justify-end gap-2" 
												role="presentation"
												onclick={(e) => e.stopPropagation()}
												onkeydown={(e) => e.stopPropagation()}
											>
												{#if file.is_file}
													<Button
														size="sm"
														variant="outline"
														onclick={() => editFile(file)}
													>
														<Icon icon="tabler:edit" class="h-4 w-4" />
													</Button>
													<Button
														size="sm"
														variant="destructive"
														onclick={() => requestDelete(file)}
													>
														<Icon icon="tabler:trash" class="h-4 w-4" />
													</Button>
												{/if}
											</div>
										</TableCell>
									</TableRow>
								{/each}
							</TableBody>
						</Table>
					</div>
				{/if}
			</div>
		</CardContent>
	</Card>

	<Dialog bind:open={deleteDialogOpen}>
		<DialogContent class="sm:max-w-md">
			<DialogHeader>
				<DialogTitle>Datei wirklich löschen?</DialogTitle>
				<DialogDescription>
					{#if deleteTarget}
						Du bist dabei <span class="font-mono">{deleteTarget.name}</span> in
						<span class="font-mono">{currentPath}</span> zu löschen.
					{/if}
					<br />
					Diese Aktion kann nicht rückgängig gemacht werden.
				</DialogDescription>
			</DialogHeader>
			<DialogFooter>
				<Button type="button" variant="outline" onclick={() => (deleteDialogOpen = false)} disabled={deleting}>
					Abbrechen
				</Button>
				<Button
					type="button"
					variant="destructive"
					disabled={deleting || !deleteTarget}
					onclick={async () => {
						if (!deleteTarget) return;
						deleting = true;
						try {
							await deleteFile(deleteTarget);
						} finally {
							deleting = false;
							deleteDialogOpen = false;
						}
					}}
				>
					{deleting ? 'Lösche...' : 'Löschen'}
				</Button>
			</DialogFooter>
		</DialogContent>
	</Dialog>
</div>


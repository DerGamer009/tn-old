<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Textarea } from '$lib/components/ui/textarea';
	import Icon from '@iconify/svelte';
	import type { PageData } from './$types';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	let { data }: { data: PageData } = $props();

	let fileContent = $state('');
	let originalContent = $state('');
	let isLoading = $state(true);
	let isSaving = $state(false);
	let hasChanges = $state(false);


	async function loadFile() {
		if (!data || !data.server || !(data.server as any).pterodactylServerId) {
			console.error('Kein Server oder pterodactylServerId gefunden');
			return;
		}

		isLoading = true;
		try {
			const url = `/api/gameserver/${data.server.id}/files/read?file=${encodeURIComponent(data.filename)}&path=${encodeURIComponent(data.filePath)}`;
			console.log('Lade Datei von:', url);
			
			const response = await fetch(url);
			if (!response.ok) {
				const errorText = await response.text();
				console.error('API Fehler:', response.status, errorText);
				let msg = `Konnte Datei nicht lesen: ${response.status}`;
				try {
					const errJson = JSON.parse(errorText);
					if (errJson.error) msg = errJson.error;
				} catch {
					// kein JSON
				}
				throw new Error(msg);
			}

			const fileData = await response.json();
			console.log('Datei-Daten empfangen:', {
				hasContents: !!fileData.contents,
				contentsLength: fileData.contents?.length || 0,
				contentsPreview: fileData.contents?.substring(0, 100) || 'empty'
			});
			
			const contents = fileData.contents || '';
			fileContent = contents;
			originalContent = contents;
			hasChanges = false;
			
			console.log('Dateiinhalt gesetzt, Länge:', fileContent.length);
		} catch (error) {
			console.error('Error reading file:', error);
			alert(`Fehler beim Lesen der Datei: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`);
		} finally {
			isLoading = false;
		}
	}

	async function saveFile() {
		if (!data || !data.server || !(data.server as any).pterodactylServerId) return;

		isSaving = true;
		try {
			const response = await fetch(`/api/gameserver/${data.server.id}/files/write`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					file: data.filename,
					path: data.filePath,
					contents: fileContent
				})
			});

			if (!response.ok) {
				throw new Error('Konnte Datei nicht speichern');
			}

			originalContent = fileContent;
			hasChanges = false;
			alert('Datei erfolgreich gespeichert');
		} catch (error) {
			console.error('Error saving file:', error);
			alert('Fehler beim Speichern der Datei');
		} finally {
			isSaving = false;
		}
	}

	function handleContentChange(event: Event) {
		const target = event.target as HTMLTextAreaElement;
		fileContent = target.value;
		hasChanges = fileContent !== originalContent;
	}

	// Warnung beim Verlassen, wenn Änderungen vorhanden
	function handleBeforeUnload(e: BeforeUnloadEvent) {
		if (hasChanges) {
			e.preventDefault();
			e.returnValue = '';
		}
	}

	onMount(() => {
		loadFile();
		window.addEventListener('beforeunload', handleBeforeUnload);
		
		return () => {
			window.removeEventListener('beforeunload', handleBeforeUnload);
		};
	});

	// Keyboard shortcuts
	function handleKeyDown(e: KeyboardEvent) {
		// Ctrl/Cmd + S zum Speichern
		if ((e.ctrlKey || e.metaKey) && e.key === 's') {
			e.preventDefault();
			if (hasChanges) {
				saveFile();
			}
		}
	}
</script>

<svelte:head>
	<title>Bearbeiten: {data.filename} - {data.server.name} | TitanNode Dashboard</title>
</svelte:head>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<div class="flex items-center gap-3">
			<Button
				variant="outline"
				size="sm"
				onclick={() => goto(`/dashboard/gameserver/${data.server.id}/files`)}
			>
				<Icon icon="tabler:arrow-left" class="h-4 w-4 mr-2" />
				Zurück
			</Button>
			<div>
				<h1 class="text-2xl sm:text-3xl font-bold flex items-center gap-2 sm:gap-3 flex-wrap">
					<Icon icon="tabler:file-edit" class="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
					<span>{data.filename}</span>
				</h1>
				<p class="text-sm text-muted-foreground mt-1">
					Pfad: <code class="px-1 py-0.5 bg-muted rounded">{data.filePath}</code>
				</p>
			</div>
		</div>
		<div class="flex items-center gap-2">
			{#if hasChanges}
				<Badge variant="outline" class="text-yellow-600 border-yellow-600">
					Ungespeicherte Änderungen
				</Badge>
			{/if}
		</div>
	</div>

	<Card class="border-border/50">
		<CardContent class="p-6">
			{#if isLoading}
				<div class="flex items-center justify-center py-12">
					<p class="text-muted-foreground">Lade Datei...</p>
				</div>
			{:else}
				<div class="space-y-4">
					<!-- Editor Container -->
					<div class="border rounded-lg overflow-hidden" onkeydown={handleKeyDown} role="textbox" tabindex={0}>
						<Textarea
							bind:value={fileContent}
							oninput={handleContentChange}
							class="font-mono text-sm min-h-[600px] max-h-[80vh] resize-none"
							spellcheck={false}
							placeholder="Dateiinhalt..."
						/>
					</div>

					<!-- Action Buttons -->
					<div class="flex justify-end gap-2">
						<Button
							variant="outline"
							onclick={() => {
								if (hasChanges && !confirm('Ungespeicherte Änderungen werden verworfen. Fortfahren?')) {
									return;
								}
								goto(`/dashboard/gameserver/${data.server.id}/files`);
							}}
						>
							Abbrechen
						</Button>
						<Button
							onclick={() => saveFile()}
							disabled={!hasChanges || isSaving}
						>
							<Icon icon="tabler:save" class="h-4 w-4 mr-2" />
							{isSaving ? 'Speichere...' : 'Speichern (Ctrl+S)'}
						</Button>
					</div>
				</div>
			{/if}
		</CardContent>
	</Card>
</div>

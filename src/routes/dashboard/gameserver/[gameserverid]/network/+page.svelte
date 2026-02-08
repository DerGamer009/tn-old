<script lang="ts">
	import type { PageData } from './$types';
	import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '$lib/components/ui/dialog';
	import { Textarea } from '$lib/components/ui/textarea';
	import Icon from '@iconify/svelte';
	import { invalidateAll } from '$app/navigation';

	let { data }: { data: PageData } = $props();

	let allocations = $state<PageData['allocations']>([]);
	let allocationLimit = $state(0);
	let allocationUsed = $state(0);
	let loading = $state(false);

	$effect(() => {
		if (data.allocations != null) allocations = data.allocations;
		if (data.allocationLimit != null) allocationLimit = data.allocationLimit;
		if (data.allocationUsed != null) allocationUsed = data.allocationUsed;
	});
	let creatingAllocation = $state(false);
	let allocationIp = $state('');
	let allocationPort = $state('');
	let showCreateDialog = $state(false);
	let showEditNotesDialog = $state(false);
	let editingAllocationId = $state<string | null>(null);
	let allocationNotes = $state('');

	async function loadAllocations() {
		loading = true;
		try {
			const response = await fetch(`/api/gameserver/${data.server.id}/network/allocations`);
			if (response.ok) {
				const result = await response.json();
				allocations = result.allocations || [];
				allocationLimit = result.limit || 0;
				allocationUsed = result.used || 0;
			}
		} catch (error) {
			console.error('Fehler beim Laden der Allocations:', error);
		} finally {
			loading = false;
		}
	}

	async function createAllocation() {
		if (creatingAllocation) return;

		creatingAllocation = true;
		try {
			const response = await fetch(`/api/gameserver/${data.server.id}/network/allocations`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					ip: allocationIp.trim() || undefined,
					port: allocationPort.trim() ? parseInt(allocationPort.trim()) : undefined
				})
			});

			if (!response.ok) {
				let errorMessage = 'Fehler beim Erstellen der Allocation';
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
			allocationIp = '';
			allocationPort = '';
			await invalidateAll();
			await loadAllocations();
			alert('Allocation erfolgreich erstellt');
		} catch (error) {
			console.error('Fehler beim Erstellen:', error);
			alert('Fehler beim Erstellen der Allocation');
		} finally {
			creatingAllocation = false;
		}
	}

	async function setPrimary(allocationId: string) {
		try {
			const response = await fetch(`/api/gameserver/${data.server.id}/network/allocations/${allocationId}/primary`, {
				method: 'POST'
			});

			if (!response.ok) {
				const error = await response.json();
				alert(error.error || 'Fehler beim Setzen der Primary Allocation');
				return;
			}

			await invalidateAll();
			await loadAllocations();
			alert('Primary Allocation erfolgreich gesetzt');
		} catch (error) {
			console.error('Fehler beim Setzen:', error);
			alert('Fehler beim Setzen der Primary Allocation');
		}
	}

	async function openEditNotes(allocation: any) {
		const attrs = allocation.attributes || allocation;
		editingAllocationId = attrs.id;
		allocationNotes = attrs.notes || '';
		showEditNotesDialog = true;
	}

	async function saveNotes() {
		if (!editingAllocationId) return;

		try {
			const response = await fetch(`/api/gameserver/${data.server.id}/network/allocations/${editingAllocationId}`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					notes: allocationNotes.trim() || null
				})
			});

			if (!response.ok) {
				const error = await response.json();
				alert(error.error || 'Fehler beim Aktualisieren der Notes');
				return;
			}

			showEditNotesDialog = false;
			editingAllocationId = null;
			allocationNotes = '';
			await invalidateAll();
			await loadAllocations();
			alert('Notes erfolgreich aktualisiert');
		} catch (error) {
			console.error('Fehler beim Aktualisieren:', error);
			alert('Fehler beim Aktualisieren der Notes');
		}
	}

	async function deleteAllocation(allocationId: string, ip: string, port: number) {
		if (!confirm(`Möchtest du die Allocation ${ip}:${port} wirklich entfernen? Diese Aktion kann nicht rückgängig gemacht werden.`)) {
			return;
		}

		try {
			const response = await fetch(`/api/gameserver/${data.server.id}/network/allocations/${allocationId}`, {
				method: 'DELETE'
			});

			if (!response.ok) {
				const error = await response.json();
				alert(error.error || 'Fehler beim Löschen der Allocation');
				return;
			}

			await invalidateAll();
			await loadAllocations();
			alert('Allocation erfolgreich entfernt');
		} catch (error) {
			console.error('Fehler beim Löschen:', error);
			alert('Fehler beim Löschen der Allocation');
		}
	}
</script>

<svelte:head>
	<title>Network - {data.server.name} | TitanNode Dashboard</title>
</svelte:head>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<div class="flex items-center gap-3">
			<Icon icon="tabler:world" class="h-8 w-8 text-primary" />
			<h1 class="text-3xl font-bold">Network</h1>
		</div>
		<div class="flex gap-2">
			<Button variant="outline" onclick={() => loadAllocations()} disabled={loading}>
				<Icon icon="tabler:refresh" class="h-4 w-4 mr-2" />
				{loading ? 'Lädt...' : 'Aktualisieren'}
			</Button>
			<Dialog bind:open={showCreateDialog}>
				<DialogTrigger>
					<Button disabled={allocationLimit > 0 && allocationUsed >= allocationLimit}>
						<Icon icon="tabler:plus" class="h-4 w-4 mr-2" />
						Allocation erstellen
					</Button>
				</DialogTrigger>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Neue Allocation erstellen</DialogTitle>
						<DialogDescription>
							Erstelle eine neue Network-Allocation für {data.server.name}
						</DialogDescription>
					</DialogHeader>
					<div class="space-y-4">
						<div class="space-y-2">
							<Label for="allocation-ip">IP-Adresse (optional)</Label>
							<Input
								id="allocation-ip"
								bind:value={allocationIp}
								placeholder="z.B. 45.86.168.218"
							/>
							<p class="text-xs text-muted-foreground">
								Leer lassen für automatische Zuweisung
							</p>
						</div>
						<div class="space-y-2">
							<Label for="allocation-port">Port (optional)</Label>
							<Input
								id="allocation-port"
								type="number"
								bind:value={allocationPort}
								placeholder="z.B. 25565"
							/>
							<p class="text-xs text-muted-foreground">
								Leer lassen für automatische Zuweisung
							</p>
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onclick={() => { showCreateDialog = false; }}>
							Abbrechen
						</Button>
						<Button onclick={() => createAllocation()} disabled={creatingAllocation}>
							{creatingAllocation ? 'Wird erstellt...' : 'Allocation erstellen'}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	</div>

	<!-- Allocation Limit Anzeige -->
	{#if allocationLimit > 0}
		<Card class="border-border/50">
			<CardContent class="p-4">
				<div class="flex items-center justify-between">
					<div class="flex items-center gap-2">
						<Icon icon="tabler:world" class="h-5 w-5 text-muted-foreground" />
						<span class="text-sm text-muted-foreground">Allocation-Limit</span>
					</div>
					<div class="flex items-center gap-2">
						<span class="text-sm font-medium">{allocationUsed} / {allocationLimit}</span>
						<div class="h-2 w-32 bg-muted rounded-full overflow-hidden">
							<div
								class="h-full bg-primary transition-all"
								style="width: {Math.min((allocationUsed / allocationLimit) * 100, 100)}%"
							></div>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	{/if}

	<Card class="border-border/50">
		<CardHeader>
			<CardTitle>Network-Allocations</CardTitle>
			<CardDescription>
				Verwalte deine Server-Network-Allocations
			</CardDescription>
		</CardHeader>
		<CardContent>
			{#if allocations.length > 0}
				<div class="space-y-3">
					{#each allocations as allocation}
						{@const attrs = allocation.attributes || allocation}
						<div class="flex items-start gap-4 p-4 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors">
							<div class="flex-1 min-w-0">
								<div class="flex items-center gap-2 mb-2">
									<h3 class="font-medium font-mono">{attrs.ip}:{attrs.port}</h3>
									{#if attrs.is_default}
										<Badge variant="default">Primary</Badge>
									{/if}
									{#if attrs.ip_alias}
										<Badge variant="outline">{attrs.ip_alias}</Badge>
									{/if}
								</div>
								<div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground mb-3">
									<div>
										<span class="font-medium">ID:</span> <span class="font-mono text-xs">{attrs.id}</span>
									</div>
									{#if attrs.notes}
										<div>
											<span class="font-medium">Notes:</span> {attrs.notes}
										</div>
									{/if}
								</div>
								<div class="flex flex-wrap gap-2">
									{#if !attrs.is_default}
										<Button
											variant="outline"
											size="sm"
											onclick={() => setPrimary(attrs.id)}
										>
											<Icon icon="tabler:star" class="h-4 w-4 mr-2" />
											Als Primary setzen
										</Button>
									{/if}
									<Button
										variant="outline"
										size="sm"
										onclick={() => openEditNotes(allocation)}
									>
										<Icon icon="tabler:note" class="h-4 w-4 mr-2" />
										Notes bearbeiten
									</Button>
									{#if !attrs.is_default}
										<Button
											variant="destructive"
											size="sm"
											onclick={() => deleteAllocation(attrs.id, attrs.ip, attrs.port)}
										>
											<Icon icon="tabler:trash" class="h-4 w-4 mr-2" />
											Entfernen
										</Button>
									{/if}
								</div>
							</div>
						</div>
					{/each}
				</div>
			{:else}
				<div class="text-center py-12">
					<Icon icon="tabler:world" class="h-12 w-12 text-muted-foreground mx-auto mb-4" />
					<p class="text-muted-foreground">Noch keine Allocations vorhanden</p>
					<p class="text-sm text-muted-foreground mt-2">
						Erstelle deine erste Allocation für {data.server.name}
					</p>
				</div>
			{/if}
		</CardContent>
	</Card>

	<!-- Edit Notes Dialog -->
	<Dialog bind:open={showEditNotesDialog}>
		<DialogContent>
			<DialogHeader>
				<DialogTitle>Allocation Notes bearbeiten</DialogTitle>
				<DialogDescription>
					Bearbeite die Notes für diese Allocation
				</DialogDescription>
			</DialogHeader>
			<div class="space-y-4">
				<div class="space-y-2">
					<Label for="allocation-notes">Notes</Label>
					<Textarea
						id="allocation-notes"
						bind:value={allocationNotes}
						placeholder="z.B. Main Minecraft server port"
						rows={3}
					/>
					<p class="text-xs text-muted-foreground">
						Maximal 255 Zeichen
					</p>
				</div>
			</div>
			<DialogFooter>
				<Button variant="outline" onclick={() => { showEditNotesDialog = false; editingAllocationId = null; allocationNotes = ''; }}>
					Abbrechen
				</Button>
				<Button onclick={() => saveNotes()}>
					Speichern
				</Button>
			</DialogFooter>
		</DialogContent>
	</Dialog>
</div>

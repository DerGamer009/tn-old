<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import {
		Dialog,
		DialogContent,
		DialogDescription,
		DialogFooter,
		DialogHeader,
		DialogTitle
	} from '$lib/components/ui/dialog';
	import {
		Table,
		TableBody,
		TableCell,
		TableHead,
		TableHeader,
		TableRow
	} from '$lib/components/ui/table';
	import Icon from '@iconify/svelte';
	import type { PageData } from './$types';
	import { onMount } from 'svelte';
	import { invalidateAll } from '$app/navigation';
	import { goto } from '$app/navigation';

	let { data }: { data: PageData } = $props();

	let runtimeCountdown = $state('Berechne...');
	let loading = $state<Record<string, boolean>>({});


	// Get service ID (using $derived to track changes)
	const serviceId = $derived((data.server as any)?.pterodactylServerId || data.server?.id);

	// Format runtime countdown
	function formatRuntime(expiresAt: string | Date | null | undefined): string {
		if (!expiresAt) {
			return 'Unbegrenzt';
		}

		const now = new Date();
		const expires = new Date(expiresAt);
		const diff = expires.getTime() - now.getTime();

		if (diff <= 0) {
			return 'Abgelaufen';
		}

		const days = Math.floor(diff / (1000 * 60 * 60 * 24));
		const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
		const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
		const seconds = Math.floor((diff % (1000 * 60)) / 1000);

		return `${days} Tage ${hours} Stunden ${minutes} Minuten ${seconds} Sekunden`;
	}

	// Update countdown every second
	onMount(() => {
		runtimeCountdown = formatRuntime(data.server.expiresAt);
		const interval = setInterval(() => {
			runtimeCountdown = formatRuntime(data.server.expiresAt);
		}, 1000);

		return () => clearInterval(interval);
	});

	async function handleAction(action: string) {
		loading[action] = true;
		try {
			const response = await fetch(`/api/apps/${data.server.id}/${action}`, {
				method: action === 'delete' ? 'DELETE' : 'POST',
			});

			if (!response.ok) {
				const error = await response.json();
				alert(error.error || 'Fehler beim Ausführen der Aktion');
				return;
			}

			if (action === 'delete') {
				await goto('/dashboard/apps');
				return;
			}

			await invalidateAll();
		} catch (error) {
			console.error('Error:', error);
			alert('Fehler beim Ausführen der Aktion');
		} finally {
			loading[action] = false;
		}
	}

	function getStatusColor(status: string): string {
		switch (status) {
			case 'ACTIVE':
				return 'bg-green-500';
			case 'SUSPENDED':
				return 'bg-red-500';
			case 'PENDING':
				return 'bg-yellow-500';
			default:
				return 'bg-gray-500';
		}
	}

	function getEggName(eggId: number | null | undefined): string {
		if (!eggId) return 'Unbekannt';
		const names: Record<number, string> = {
			26: 'Code-Server', 27: 'Generic Java', 28: 'Grafana', 29: 'MariaDB', 30: 'MongoDB 7', 31: 'MongoDB 8',
			32: 'Node.js', 33: 'Postgres 17', 34: 'Python', 35: 'Redis 6', 36: 'Redis 7', 37: 'SFTP Storage',
			38: 'Sinusbot', 39: 'Uptime Kuma'
		};
		return names[eggId] ?? `Egg ${eggId}`;
	}

	function getEggIcon(eggId: number | null | undefined): string {
		if (!eggId) return 'tabler:code';
		const icons: Record<number, string> = {
			26: 'tabler:code', 27: 'tabler:brand-java', 28: 'tabler:chart-line', 29: 'tabler:database', 30: 'tabler:database', 31: 'tabler:database',
			32: 'tabler:brand-nodejs', 33: 'tabler:database', 34: 'tabler:brand-python', 35: 'tabler:database', 36: 'tabler:database', 37: 'tabler:folder',
			38: 'tabler:music', 39: 'tabler:activity'
		};
		return icons[eggId] || 'tabler:code';
	}
</script>

<svelte:head>
	<title>App verwalten: {data.server.name} - Dashboard | TitanNode</title>
</svelte:head>

<!-- Action Buttons Card -->
<Card class="mb-6 border-border/50">
	<CardContent class="p-6">
		<div class="flex flex-wrap gap-2">
			{#if data.server.status === 'ACTIVE'}
				<Button
					class="bg-red-500 hover:bg-red-600 text-white"
					size="sm"
					onclick={() => handleAction('stop')}
					disabled={loading['stop']}
				>
					<Icon icon="tabler:player-stop" class="h-4 w-4 mr-2" />
					Stop
				</Button>
				<Button
					class="bg-orange-500 hover:bg-orange-600 text-white"
					size="sm"
					onclick={() => handleAction('restart')}
					disabled={loading['restart']}
				>
					<Icon icon="tabler:refresh" class="h-4 w-4 mr-2" />
					Neustarten
				</Button>
			{:else if data.server.status === 'SUSPENDED'}
				<Button
					class="bg-green-500 hover:bg-green-600 text-white"
					size="sm"
					onclick={() => handleAction('start')}
					disabled={loading['start']}
				>
					<Icon icon="tabler:player-play" class="h-4 w-4 mr-2" />
					Starten
				</Button>
			{/if}

			<Button
				class="bg-blue-500 hover:bg-blue-600 text-white"
				size="sm"
				onclick={() => handleAction('sync')}
				disabled={loading['sync']}
			>
				<Icon icon="tabler:refresh" class="h-4 w-4 mr-2" />
				Status synchronisieren
			</Button>

			<Button
				class="bg-red-500 hover:bg-red-600 text-white"
				size="sm"
				variant="destructive"
				onclick={() => {
					if (confirm('Möchtest du diese App wirklich löschen?')) {
						handleAction('delete');
					}
				}}
				disabled={loading['delete']}
			>
				<Icon icon="tabler:trash" class="h-4 w-4 mr-2" />
				Löschen
			</Button>
		</div>
	</CardContent>
</Card>

<!-- Main Content -->
<div class="w-full">
		<Card class="border-border/50">
			<CardContent class="p-6">
				<div class="space-y-6">
						<div class="grid gap-6 md:grid-cols-2">
							<!-- Server Information -->
							<Card class="border-border/50">
								<CardContent class="p-6 space-y-4">
									<h3 class="text-lg font-semibold">Server-Informationen</h3>
									<div class="space-y-3">
										<div class="flex justify-between items-center">
											<span class="text-sm text-muted-foreground">Name</span>
											<span class="text-sm font-medium">{data.server.name}</span>
										</div>
										<div class="flex justify-between items-center">
											<span class="text-sm text-muted-foreground">Service ID</span>
											<span class="text-sm font-mono">{serviceId}</span>
										</div>
										<div class="flex justify-between items-center">
											<span class="text-sm text-muted-foreground">Typ</span>
											<Badge variant="outline">{getEggName(data.server.eggId)}</Badge>
										</div>
										{#if data.server.ipAddress}
											<div class="flex justify-between items-center">
												<span class="text-sm text-muted-foreground">IP-Adresse</span>
												<span class="text-sm font-mono">{data.server.ipAddress}</span>
											</div>
										{/if}
										{#if data.server.port}
											<div class="flex justify-between items-center">
												<span class="text-sm text-muted-foreground">Port</span>
												<span class="text-sm font-mono">{data.server.port}</span>
											</div>
										{/if}
									</div>
								</CardContent>
							</Card>

							<!-- Ressourcen -->
							<Card class="border-border/50">
								<CardContent class="p-6 space-y-4">
									<h3 class="text-lg font-semibold">Ressourcen</h3>
									<div class="space-y-3">
										<div class="flex justify-between items-center">
											<span class="text-sm text-muted-foreground">CPU</span>
											<span class="text-sm font-medium">{data.server.cpu} vCores</span>
										</div>
										<div class="flex justify-between items-center">
											<span class="text-sm text-muted-foreground">RAM</span>
											<span class="text-sm font-medium">{data.server.ram} GB</span>
										</div>
										<div class="flex justify-between items-center">
											<span class="text-sm text-muted-foreground">Storage</span>
											<span class="text-sm font-medium">{(data.server.storage / 1024).toFixed(2)} GB</span>
										</div>
										<div class="flex justify-between items-center">
											<span class="text-sm text-muted-foreground">Bandwidth</span>
											<span class="text-sm font-medium">{data.server.bandwidth} Gbit/s</span>
										</div>
									</div>
								</CardContent>
							</Card>

							<!-- Laufzeit -->
							<Card class="border-border/50">
								<CardContent class="p-6 space-y-4">
									<h3 class="text-lg font-semibold flex items-center gap-2">
										<Icon icon="tabler:clock" class="h-5 w-5" />
										Laufzeit
									</h3>
									{#if (data.server as any).expiresAt}
										{@const expiresAt = new Date((data.server as any).expiresAt)}
										{@const daysLeft = Math.floor((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24))}
										{#if daysLeft < 0}
											<div class="rounded-lg border border-red-500/50 bg-red-500/10 p-3 flex items-center gap-2 text-sm text-red-700 dark:text-red-400">
												<Icon icon="tabler:alert-circle-filled" class="h-5 w-5 shrink-0" />
												<span>Laufzeit abgelaufen. Bitte verlängere deinen Server im Support oder per Ticket.</span>
											</div>
										{:else if daysLeft < 7}
											<div class="rounded-lg border border-amber-500/50 bg-amber-500/10 p-3 flex items-center gap-2 text-sm text-amber-700 dark:text-amber-400">
												<Icon icon="tabler:alert-triangle-filled" class="h-5 w-5 shrink-0" />
												<span>Laufzeit endet in {daysLeft} Tag{daysLeft === 1 ? '' : 'en'}. Bitte rechtzeitig verlängern.</span>
											</div>
										{/if}
									{/if}
									<div class="space-y-3">
										<div class="flex justify-between items-center">
											<span class="text-sm text-muted-foreground">Erstellt am</span>
											<span class="text-sm font-medium">
												{new Date(data.server.createdAt).toLocaleDateString('de-DE', {
													day: '2-digit',
													month: '2-digit',
													year: 'numeric'
												})}
											</span>
										</div>
										{#if (data.server as any).expiresAt}
											<div class="flex justify-between items-center">
												<span class="text-sm text-muted-foreground">Läuft aus am</span>
												<span class="text-sm font-medium">
													{new Date((data.server as any).expiresAt).toLocaleDateString('de-DE', {
														day: '2-digit',
														month: '2-digit',
														year: 'numeric'
													})}
												</span>
											</div>
										{/if}
										<div class="flex justify-between items-center">
											<span class="text-sm text-muted-foreground">Verbleibende Zeit</span>
											<span class="text-sm font-medium">{runtimeCountdown}</span>
										</div>
									</div>
								</CardContent>
							</Card>
						</div>

						<!-- Pterodactyl Server Details -->
						{#if data.pterodactylServer}
							<Card class="border-border/50">
								<CardContent class="p-6">
									<h3 class="text-lg font-semibold mb-4">Pterodactyl Server Details</h3>
									<div class="space-y-3">
										<div class="flex justify-between items-center">
											<span class="text-sm text-muted-foreground">UUID</span>
											<span class="text-sm font-mono text-xs">{data.pterodactylServer.uuid}</span>
										</div>
										<div class="flex justify-between items-center">
											<span class="text-sm text-muted-foreground">Identifier</span>
											<span class="text-sm font-mono">{data.pterodactylServer.identifier}</span>
										</div>
										<div class="flex justify-between items-center">
											<span class="text-sm text-muted-foreground">Status</span>
											<span class="text-sm">{data.pterodactylServer.status || 'N/A'}</span>
										</div>
										<div class="flex justify-between items-center">
											<span class="text-sm text-muted-foreground">Suspended</span>
											<Badge variant={data.pterodactylServer.suspended ? 'destructive' : 'default'}>
												{data.pterodactylServer.suspended ? 'Ja' : 'Nein'}
											</Badge>
										</div>
									</div>
								</CardContent>
							</Card>
						{/if}
				</div>
			</CardContent>
		</Card>
</div>


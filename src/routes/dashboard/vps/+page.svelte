<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import {
		Table,
		TableBody,
		TableCell,
		TableHead,
		TableHeader,
		TableRow
	} from '$lib/components/ui/table';
	import {
		Dialog,
		DialogContent,
		DialogDescription,
		DialogFooter,
		DialogHeader,
		DialogTitle,
		DialogTrigger
	} from '$lib/components/ui/dialog';
	import Icon from '@iconify/svelte';
	import type { PageData } from './$types';
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { onMount } from 'svelte';
	import { language, type Language } from '$lib/stores/language';

let { data }: { data: PageData } = $props();

let loading = $state<Record<string, boolean>>({});
let manageDialogOpen = $state<Record<string, boolean>>({});
let runtimeCounters = $state<Record<string, string>>({});

	function setLoading(serverId: string, value: boolean) {
		loading[serverId] = value;
		loading = { ...loading };
	}

	function setManageDialog(serverId: string, value: boolean) {
		manageDialogOpen[serverId] = value;
		manageDialogOpen = { ...manageDialogOpen };
	}

	async function handleAction(serverId: string, action: string) {
		setLoading(serverId, true);
		try {
			const response = await fetch(`/api/vps/${serverId}/${action}`, {
				method: action === 'delete' ? 'DELETE' : 'POST',
			});

			if (!response.ok) {
				const error = await response.json();
				alert(error.error || 'Fehler beim Ausführen der Aktion');
				return;
			}

			// Nach Aktion Status synchronisieren (außer bei delete)
			if (action !== 'delete') {
				await fetch(`/api/vps/${serverId}/sync`, { method: 'POST' });
			}

			await invalidateAll();
		} catch (error) {
			console.error('Error:', error);
			alert('Fehler beim Ausführen der Aktion');
		} finally {
			setLoading(serverId, false);
		}
	}

	function getStatusBadgeVariant(status: string) {
		switch (status) {
			case 'ACTIVE':
				return 'default';
			case 'PENDING':
				return 'secondary';
			case 'SUSPENDED':
				return 'destructive';
			case 'CANCELLED':
				return 'outline';
			default:
				return 'secondary';
		}
	}

	const translations = {
		de: {
			title: 'VPS Server',
			subtitle: 'Verwalte deine Virtual Private Server',
			orderButton: 'Neuen VPS bestellen',
			emptyText: 'Du hast noch keine VPS Server',
			emptyCta: 'Jetzt VPS bestellen',
			tableProduct: 'Produkt',
			tableServiceId: 'ServiceID',
			tableRuntime: 'Laufzeit',
			tableStatus: 'Status',
			tableActions: 'Aktionen',
			productName: 'KVM Server',
			ipv4Label: 'IPv4:',
			ipAssigning: 'Wird zugewiesen...',
			unlimited: 'Unbegrenzt',
			expired: 'Abgelaufen',
			runtimeFormat: '{days} Tage {hours} Stunden {minutes} Minuten {seconds} Sekunden',
			statusOnline: 'Online',
			statusPending: 'Wird erstellt...',
			statusOffline: 'Offline',
			statusDeleted: 'Gelöscht',
			manage: 'Verwalten',
			cpu: 'CPU',
			ram: 'RAM',
			storage: 'Storage',
			bandwidth: 'Bandwidth',
			ipAddress: 'IP-Adresse',
			dialogTitle: 'VPS verwalten:',
			dialogSubtitle: 'Verwalte deinen VPS Server',
			restart: 'Neustarten',
			stop: 'Stoppen',
			start: 'Starten',
			sync: 'Sync',
			delete: 'Löschen',
			close: 'Schließen'
		},
		en: {
			title: 'VPS servers',
			subtitle: 'Manage your virtual private servers',
			orderButton: 'Order new VPS',
			emptyText: 'You do not have any VPS servers yet',
			emptyCta: 'Order VPS now',
			tableProduct: 'Product',
			tableServiceId: 'Service ID',
			tableRuntime: 'Runtime',
			tableStatus: 'Status',
			tableActions: 'Actions',
			productName: 'KVM server',
			ipv4Label: 'IPv4:',
			ipAssigning: 'Assigning...',
			unlimited: 'Unlimited',
			expired: 'Expired',
			runtimeFormat: '{days} days {hours} hours {minutes} minutes {seconds} seconds',
			statusOnline: 'Online',
			statusPending: 'Provisioning...',
			statusOffline: 'Offline',
			statusDeleted: 'Deleted',
			manage: 'Manage',
			cpu: 'CPU',
			ram: 'RAM',
			storage: 'Storage',
			bandwidth: 'Bandwidth',
			ipAddress: 'IP address',
			dialogTitle: 'Manage VPS:',
			dialogSubtitle: 'Manage your VPS server',
			restart: 'Restart',
			stop: 'Stop',
			start: 'Start',
			sync: 'Sync',
			delete: 'Delete',
			close: 'Close'
		}
	} satisfies Record<Language, Record<string, string>>;

	type TKey = keyof (typeof translations)['de'];

	function t(key: TKey): string {
		const lang = $language as Language;
		const dict = translations[lang] ?? translations.de;
		return dict[key] ?? translations.de[key];
	}

	function getStatusLabel(status: string) {
		switch (status) {
			case 'ACTIVE':
				return t('statusOnline');
			case 'PENDING':
				return t('statusPending');
			case 'SUSPENDED':
				return t('statusOffline');
			case 'CANCELLED':
				return t('statusDeleted');
			default:
				return status;
		}
	}

	function formatRuntime(server: any): string {
		if (!server.expiresAt) {
			return t('unlimited');
		}

		const now = new Date();
		const expires = new Date(server.expiresAt);
		const diff = expires.getTime() - now.getTime();

		if (diff <= 0) {
			return t('expired');
		}

		const days = Math.floor(diff / (1000 * 60 * 60 * 24));
		const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
		const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
		const seconds = Math.floor((diff % (1000 * 60)) / 1000);

		return t('runtimeFormat')
			.replace('{days}', String(days))
			.replace('{hours}', String(hours))
			.replace('{minutes}', String(minutes))
			.replace('{seconds}', String(seconds));
	}

	function formatExpiryDate(server: any): string {
		if (!server.expiresAt) {
			return '';
		}
		const date = new Date(server.expiresAt);
		const hours = date.getHours().toString().padStart(2, '0');
		const minutes = date.getMinutes().toString().padStart(2, '0');
		const seconds = date.getSeconds().toString().padStart(2, '0');
		const day = date.getDate();
		const month = date.getMonth() + 1;
		const year = date.getFullYear();
		return `(${hours}:${minutes}:${seconds} ${day}.${month}.${year})`;
	}

	// Update runtime counters every second
	onMount(() => {
		const interval = setInterval(() => {
			if (data.servers) {
				const counters: Record<string, string> = {};
				data.servers.forEach((server) => {
					counters[server.id] = formatRuntime(server);
				});
				runtimeCounters = counters;
			}
		}, 1000);

		return () => clearInterval(interval);
	});

	// Get service ID (either datalixVpsId or generate from id)
	function getServiceId(server: any): string {
		// @ts-ignore - datalixVpsId might not be in generated client yet
		return server.datalixVpsId || server.id;
	}

	const totalServers = $derived(data.servers?.length ?? 0);
	const activeServers = $derived(
		data.servers?.filter((s) => s.status === 'ACTIVE').length ?? 0
	);
	const pendingServers = $derived(
		data.servers?.filter((s) => s.status === 'PENDING').length ?? 0
	);
</script>

<svelte:head>
	<title>{t('title')} - Dashboard | TitanNode</title>
</svelte:head>

<div class="max-w-screen-2xl space-y-8">
	<!-- Header -->
	<Card class="border-border/60 bg-gradient-to-r from-primary/10 via-background to-primary/5">
		<CardContent class="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
			<div>
				<div class="flex items-center gap-3">
					<div class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15">
						<Icon icon="tabler:server-2" class="h-5 w-5 text-primary" />
					</div>
					<h1 class="text-2xl sm:text-3xl font-bold tracking-tight">
						{t('title')}
					</h1>
				</div>
				<p class="mt-2 text-sm sm:text-base text-muted-foreground">
					{t('subtitle')}
				</p>
			</div>
			<div class="flex flex-col items-stretch gap-2 sm:items-end">
				<Button class="gap-2 touch-manipulation w-full sm:w-auto" href="/vps">
					<Icon icon="tabler:plus" class="h-4 w-4" />
					{t('orderButton')}
				</Button>
				{#if totalServers > 0}
					<p class="text-xs text-muted-foreground">
						{activeServers}/{totalServers} {t('statusOnline')}
					</p>
				{/if}
			</div>
		</CardContent>
	</Card>

	{#if totalServers === 0}
		<!-- Empty State -->
		<Card class="border-border/50">
			<CardContent class="flex flex-col items-center justify-center py-16">
				<div class="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-muted">
					<Icon icon="tabler:server-off" class="h-14 w-14 text-muted-foreground" />
				</div>
				<p class="mb-6 text-lg text-muted-foreground">{t('emptyText')}</p>
				<Button href="/vps">{t('emptyCta')}</Button>
			</CardContent>
		</Card>
	{:else}
		<!-- Stats -->
		<div class="grid gap-4 sm:grid-cols-3">
			<Card class="border-border/60 bg-card/90 backdrop-blur">
				<CardContent class="py-4">
					<p class="text-xs font-medium uppercase tracking-wide text-muted-foreground">
						{t('tableProduct')}
					</p>
					<p class="mt-1 text-2xl font-semibold">{totalServers}</p>
				</CardContent>
			</Card>
			<Card class="border-border/60 bg-card/90 backdrop-blur">
				<CardContent class="py-4">
					<p class="text-xs font-medium uppercase tracking-wide text-muted-foreground">
						{t('statusOnline')}
					</p>
					<p class="mt-1 text-2xl font-semibold text-emerald-500">{activeServers}</p>
				</CardContent>
			</Card>
			<Card class="border-border/60 bg-card/90 backdrop-blur">
				<CardContent class="py-4">
					<p class="text-xs font-medium uppercase tracking-wide text-muted-foreground">
						{t('statusPending')}
					</p>
					<p class="mt-1 text-2xl font-semibold text-amber-500">{pendingServers}</p>
				</CardContent>
			</Card>
		</div>

		<!-- Server Table -->
		<Card class="border-border/50">
			<CardContent class="p-0 overflow-x-auto">
				<Table class="min-w-[640px]">
					<TableHeader>
						<TableRow>
							<TableHead>{t('tableProduct')}</TableHead>
							<TableHead>{t('tableServiceId')}</TableHead>
							<TableHead>{t('tableRuntime')}</TableHead>
							<TableHead>{t('tableStatus')}</TableHead>
							<TableHead>{t('tableActions')}</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{#each data.servers as server (server.id)}
							<TableRow>
								<!-- Produkt -->
								<TableCell>
									<div class="flex flex-col gap-1">
										<div class="flex items-center gap-2">
											<span class="font-medium">{t('productName')}</span>
											<Icon icon="tabler:pencil" class="h-4 w-4 text-muted-foreground" />
										</div>
										<div class="flex items-center gap-2">
											<Icon icon="tabler:world" class="h-3.5 w-3.5 text-muted-foreground" />
											<span class="text-sm text-muted-foreground">
												{t('ipv4Label')}{' '}
												<span class="font-mono font-semibold text-foreground">
													{server.ipAddress || t('ipAssigning')}
												</span>
											</span>
										</div>
									</div>
								</TableCell>

								<!-- ServiceID -->
								<TableCell>
									<span class="font-mono text-sm">{getServiceId(server)}</span>
								</TableCell>

								<!-- Laufzeit -->
								<TableCell>
									<div class="flex flex-col">
										<span class="text-sm">
											{runtimeCounters[server.id] || formatRuntime(server)}
										</span>
										<span class="text-xs text-muted-foreground">
											{formatExpiryDate(server)}
										</span>
									</div>
								</TableCell>

								<!-- Status -->
								<TableCell>
									<Button
										size="sm"
										variant={server.status === 'ACTIVE' ? 'default' : 'secondary'}
										class={
											server.status === 'ACTIVE'
												? 'bg-green-500 hover:bg-green-600 text-white'
												: ''
										}
										disabled
									>
										{getStatusLabel(server.status)}
									</Button>
								</TableCell>

								<!-- Aktionen -->
								<TableCell>
										<Button
											size="sm"
											variant="default"
										class="bg-green-500 hover:bg-green-600 text-white"
										href="/dashboard/vps/{getServiceId(server)}"
									>
										{t('manage')}
										</Button>
								</TableCell>
							</TableRow>
						{/each}
					</TableBody>
				</Table>
			</CardContent>
		</Card>

		<!-- Management Dialog (opened via "Verwalten" button) -->
		{#each data.servers as server (server.id)}
			<Dialog open={manageDialogOpen[server.id] || false}>
				<DialogContent class="max-w-2xl">
					<DialogHeader>
						<DialogTitle>{t('dialogTitle')} {server.name}</DialogTitle>
						<DialogDescription>{t('dialogSubtitle')}</DialogDescription>
					</DialogHeader>

					<div class="space-y-4 py-4">
						<!-- Server Info -->
						<div class="grid grid-cols-2 gap-4">
							<div>
								<p class="text-sm text-muted-foreground">{t('cpu')}</p>
								<p class="font-semibold">{server.cpu} vCores</p>
							</div>
							<div>
								<p class="text-sm text-muted-foreground">{t('ram')}</p>
								<p class="font-semibold">{server.ram} GB</p>
							</div>
							<div>
								<p class="text-sm text-muted-foreground">{t('storage')}</p>
								<p class="font-semibold">{server.storage} GB</p>
							</div>
							<div>
								<p class="text-sm text-muted-foreground">{t('bandwidth')}</p>
								<p class="font-semibold">{server.bandwidth} Gbit/s</p>
							</div>
							<div>
								<p class="text-sm text-muted-foreground">{t('ipAddress')}</p>
								<p class="font-semibold">{server.ipAddress || t('ipAssigning')}</p>
							</div>
							<div>
								<p class="text-sm text-muted-foreground">{t('tableServiceId')}</p>
								<p class="font-semibold font-mono text-xs">{getServiceId(server)}</p>
							</div>
						</div>

						<!-- Actions -->
						<div class="flex flex-wrap gap-2 pt-4 border-t">
							{#if server.status === 'ACTIVE'}
								<Button
									size="sm"
									variant="outline"
									onclick={() => {
										handleAction(server.id, 'restart');
										setManageDialog(server.id, false);
									}}
									disabled={loading[server.id]}
									class="gap-1"
								>
									<Icon icon="tabler:refresh" class="h-4 w-4" />
									{t('restart')}
								</Button>
								<Button
									size="sm"
									variant="outline"
									onclick={() => {
										handleAction(server.id, 'stop');
										setManageDialog(server.id, false);
									}}
									disabled={loading[server.id]}
									class="gap-1"
								>
									<Icon icon="tabler:player-stop" class="h-4 w-4" />
									{t('stop')}
								</Button>
							{:else if server.status === 'SUSPENDED'}
								<Button
									size="sm"
									variant="outline"
									onclick={() => {
										handleAction(server.id, 'start');
										setManageDialog(server.id, false);
									}}
									disabled={loading[server.id]}
									class="gap-1"
								>
									<Icon icon="tabler:player-play" class="h-4 w-4" />
									{t('start')}
								</Button>
							{/if}

							<Button
								size="sm"
								variant="outline"
								onclick={() => {
									handleAction(server.id, 'sync');
									setManageDialog(server.id, false);
								}}
								disabled={loading[server.id]}
								class="gap-1"
							>
								<Icon icon="tabler:refresh" class="h-4 w-4" />
								{t('sync')}
							</Button>

							<Button
								size="sm"
								variant="destructive"
								onclick={() => {
									setManageDialog(server.id, false);
									handleAction(server.id, 'delete');
								}}
								disabled={loading[server.id]}
								class="gap-1"
							>
								<Icon icon="tabler:trash" class="h-4 w-4" />
								{t('delete')}
							</Button>
						</div>
					</div>

					<DialogFooter>
						<Button variant="outline" onclick={() => setManageDialog(server.id, false)}>
							{t('close')}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		{/each}
	{/if}
</div>


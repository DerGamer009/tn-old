<script lang="ts">
import { Button } from '$lib/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
import { Badge } from '$lib/components/ui/badge';
import Icon from '@iconify/svelte';
import type { PageData } from './$types';
import { onMount } from 'svelte';
import { invalidateAll } from '$app/navigation';
import { goto } from '$app/navigation';
import { language, type Language } from '$lib/stores/language';

let { data }: { data: PageData } = $props();

const translations = {
	de: {
		titlePrefix: 'Dashboard -',
		statusCalculating: 'Berechne...',
		statusError: 'Fehler beim Ausführen der Aktion',
		deleteConfirm:
			'Möchtest du diesen Gameserver wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.',
		unlimited: 'Unbegrenzt',
		expired: 'Abgelaufen',
		runtimeFormat: '{days} Tage {hours} Stunden {minutes} Minuten {seconds} Sekunden',
		statusOnline: 'Online',
		statusOffline: 'Offline',
		statusPending: 'Wird erstellt...',
		unknown: 'Unbekannt',
		headerServiceId: 'Service ID:',
		quickActions: 'Schnellaktionen',
		stop: 'Stop',
		stopping: 'Wird gestoppt...',
		restart: 'Neustarten',
		restarting: 'Wird neu gestartet...',
		start: 'Starten',
		starting: 'Wird gestartet...',
		sync: 'Status synchronisieren',
		syncing: 'Synchronisiert...',
		delete: 'Löschen',
		deleting: 'Wird gelöscht...',
		statsCpu: 'CPU',
		statsCpuUnit: 'vCores',
		statsRam: 'RAM',
		statsRamUnit: 'GB',
		statsStorage: 'Storage',
		statsStorageUnit: 'GB',
		statsBandwidth: 'Bandwidth',
		statsBandwidthUnit: 'Gbit/s',
		infoTitle: 'Server-Informationen',
		infoName: 'Name',
		infoServiceId: 'Service ID',
		infoType: 'Typ',
		infoIp: 'IP-Adresse',
		infoPort: 'Port',
		runtimeTitle: 'Laufzeit-Informationen',
		createdAt: 'Erstellt am',
		expiresAt: 'Läuft aus am',
		remainingTime: 'Verbleibende Zeit',
		pteroTitle: 'Pterodactyl Server Details',
		pteroUuid: 'UUID',
		pteroIdentifier: 'Identifier',
		pteroStatus: 'Status',
		pteroSuspended: 'Suspended',
		yes: 'Ja',
		no: 'Nein'
	},
	en: {
		titlePrefix: 'Dashboard -',
		statusCalculating: 'Calculating...',
		statusError: 'Error while performing the action',
		deleteConfirm:
			'Do you really want to delete this game server? This action cannot be undone.',
		unlimited: 'Unlimited',
		expired: 'Expired',
		runtimeFormat: '{days} days {hours} hours {minutes} minutes {seconds} seconds',
		statusOnline: 'Online',
		statusOffline: 'Offline',
		statusPending: 'Provisioning...',
		unknown: 'Unknown',
		headerServiceId: 'Service ID:',
		quickActions: 'Quick actions',
		stop: 'Stop',
		stopping: 'Stopping...',
		restart: 'Restart',
		restarting: 'Restarting...',
		start: 'Start',
		starting: 'Starting...',
		sync: 'Sync status',
		syncing: 'Syncing...',
		delete: 'Delete',
		deleting: 'Deleting...',
		statsCpu: 'CPU',
		statsCpuUnit: 'vCores',
		statsRam: 'RAM',
		statsRamUnit: 'GB',
		statsStorage: 'Storage',
		statsStorageUnit: 'GB',
		statsBandwidth: 'Bandwidth',
		statsBandwidthUnit: 'Gbit/s',
		infoTitle: 'Server information',
		infoName: 'Name',
		infoServiceId: 'Service ID',
		infoType: 'Type',
		infoIp: 'IP address',
		infoPort: 'Port',
		runtimeTitle: 'Runtime information',
		createdAt: 'Created at',
		expiresAt: 'Expires at',
		remainingTime: 'Remaining time',
		pteroTitle: 'Pterodactyl server details',
		pteroUuid: 'UUID',
		pteroIdentifier: 'Identifier',
		pteroStatus: 'Status',
		pteroSuspended: 'Suspended',
		yes: 'Yes',
		no: 'No'
	}
} satisfies Record<Language, Record<string, string>>;

type TKey = keyof (typeof translations)['de'];

function t(key: TKey): string {
	const lang = $language as Language;
	const dict = translations[lang] ?? translations.de;
	return dict[key] ?? translations.de[key];
}

let runtimeCountdown = $state(t('statusCalculating'));
let loading = $state<Record<string, boolean>>({});

	// Get service ID
	const serviceId = $derived((data.server as any)?.pterodactylServerId || data.server?.id);

	// Format runtime countdown
	function formatRuntime(expiresAt: string | Date | null | undefined): string {
		if (!expiresAt) {
			return t('unlimited');
		}

		const now = new Date();
		const expires = new Date(expiresAt);
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
			const response = await fetch(`/api/gameserver/${data.server.id}/${action}`, {
				method: action === 'delete' ? 'DELETE' : 'POST',
			});

			if (!response.ok) {
				const error = await response.json();
				alert(error.error || t('statusError'));
				return;
			}

			if (action === 'delete') {
				await goto('/dashboard/gameserver');
				return;
			}

			await invalidateAll();
		} catch (error) {
			console.error('Error:', error);
			alert(t('statusError'));
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

	function getStatusLabel(status: string): string {
		switch (status) {
			case 'ACTIVE':
				return t('statusOnline');
			case 'SUSPENDED':
				return t('statusOffline');
			case 'PENDING':
				return t('statusPending');
			default:
				return status;
		}
	}

	function getEggName(eggId: number | null | undefined): string {
		if (!eggId) return t('unknown');
		switch (eggId) {
			case 15:
				return 'Velocity';
			case 16:
				return 'Paper';
			case 17:
				return 'Folia';
			case 18:
				return 'Purpur';
			case 19:
				return 'SpongeVanilla';
			case 20:
				return 'SpongeForge';
			case 21:
				return 'Forge Enhanced';
			case 22:
				return 'NeoForge';
			case 43:
				return 'Fabric';
			default:
				return `Egg ${eggId}`;
		}
	}

	function getEggIcon(eggId: number | null | undefined): string {
		if (!eggId) return 'tabler:device-gamepad';
		switch (eggId) {
			case 15:
				return 'tabler:rocket';
			case 16:
				return 'tabler:file-code';
			case 17:
				return 'tabler:leaf';
			case 18:
				return 'tabler:sparkles';
			case 19:
			case 20:
				return 'tabler:box';
			case 21:
			case 22:
				return 'tabler:flame';
			case 43:
				return 'tabler:package';
			default:
				return 'tabler:device-gamepad';
		}
	}
</script>

<svelte:head>
	<title>{t('titlePrefix')} {data.server.name} | TitanNode</title>
</svelte:head>

<div class="space-y-6">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<div class="flex items-center gap-3">
			<div class="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
				<Icon icon={getEggIcon(data.server.eggId)} class="h-6 w-6 text-primary" />
			</div>
			<div>
				<h1 class="text-3xl font-bold">{data.server.name}</h1>
				<p class="text-sm text-muted-foreground mt-1">
					{t('headerServiceId')} <span class="font-mono">{serviceId}</span>
				</p>
			</div>
		</div>
		<Badge class="{getStatusColor(data.server.status)} text-white px-4 py-2 text-sm font-medium">
			{getStatusLabel(data.server.status)}
		</Badge>
	</div>

	<!-- Quick Actions -->
	<Card class="border-border/50">
		<CardHeader>
				<CardTitle class="flex items-center gap-2">
					<Icon icon="tabler:bolt" class="h-5 w-5" />
					{t('quickActions')}
				</CardTitle>
		</CardHeader>
		<CardContent>
			<div class="flex flex-wrap gap-2">
				{#if data.server.status === 'ACTIVE'}
					<Button
						variant="destructive"
						size="sm"
						onclick={() => handleAction('stop')}
						disabled={loading['stop']}
					>
						<Icon icon="tabler:player-stop" class="h-4 w-4 mr-2" />
						{loading['stop'] ? t('stopping') : t('stop')}
					</Button>
					<Button
						variant="outline"
						size="sm"
						onclick={() => handleAction('restart')}
						disabled={loading['restart']}
					>
						<Icon icon="tabler:refresh" class="h-4 w-4 mr-2" />
						{loading['restart'] ? t('restarting') : t('restart')}
					</Button>
				{:else if data.server.status === 'SUSPENDED'}
					<Button
						variant="default"
						size="sm"
						onclick={() => handleAction('start')}
						disabled={loading['start']}
					>
						<Icon icon="tabler:player-play" class="h-4 w-4 mr-2" />
						{loading['start'] ? t('starting') : t('start')}
					</Button>
				{/if}

				<Button
					variant="outline"
					size="sm"
					onclick={() => handleAction('sync')}
					disabled={loading['sync']}
				>
					<Icon icon="tabler:refresh" class="h-4 w-4 mr-2" />
					{loading['sync'] ? t('syncing') : t('sync')}
				</Button>

				<Button
					variant="destructive"
					size="sm"
					onclick={() => {
						if (confirm(t('deleteConfirm'))) {
							handleAction('delete');
						}
					}}
					disabled={loading['delete']}
				>
					<Icon icon="tabler:trash" class="h-4 w-4 mr-2" />
					{loading['delete'] ? t('deleting') : t('delete')}
				</Button>
			</div>
		</CardContent>
	</Card>

	<!-- Statistics Grid -->
	<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
		<Card class="border-border/50">
			<CardContent class="p-6">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-sm text-muted-foreground mb-1">{t('statsCpu')}</p>
						<p class="text-2xl font-bold">{data.server.cpu}</p>
						<p class="text-xs text-muted-foreground mt-1">{t('statsCpuUnit')}</p>
					</div>
					<div class="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10">
						<Icon icon="tabler:cpu" class="h-6 w-6 text-blue-500" />
					</div>
				</div>
			</CardContent>
		</Card>

		<Card class="border-border/50">
			<CardContent class="p-6">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-sm text-muted-foreground mb-1">{t('statsRam')}</p>
						<p class="text-2xl font-bold">{data.server.ram}</p>
						<p class="text-xs text-muted-foreground mt-1">{t('statsRamUnit')}</p>
					</div>
					<div class="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/10">
						<Icon icon="tabler:memory" class="h-6 w-6 text-purple-500" />
					</div>
				</div>
			</CardContent>
		</Card>

		<Card class="border-border/50">
			<CardContent class="p-6">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-sm text-muted-foreground mb-1">{t('statsStorage')}</p>
						<p class="text-2xl font-bold">{data.server.storage}</p>
						<p class="text-xs text-muted-foreground mt-1">{t('statsStorageUnit')}</p>
					</div>
					<div class="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/10">
						<Icon icon="tabler:database" class="h-6 w-6 text-green-500" />
					</div>
				</div>
			</CardContent>
		</Card>

		<Card class="border-border/50">
			<CardContent class="p-6">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-sm text-muted-foreground mb-1">{t('statsBandwidth')}</p>
						<p class="text-2xl font-bold">{data.server.bandwidth}</p>
						<p class="text-xs text-muted-foreground mt-1">{t('statsBandwidthUnit')}</p>
					</div>
					<div class="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-500/10">
						<Icon icon="tabler:network" class="h-6 w-6 text-orange-500" />
					</div>
				</div>
			</CardContent>
		</Card>
	</div>

	<!-- Server Details -->
	<div class="grid gap-6 md:grid-cols-2">
		<!-- Server Information -->
		<Card class="border-border/50">
			<CardHeader>
				<CardTitle class="flex items-center gap-2">
					<Icon icon="tabler:info-circle" class="h-5 w-5" />
					{t('infoTitle')}
				</CardTitle>
			</CardHeader>
			<CardContent class="space-y-4">
				<div class="space-y-3">
					<div class="flex justify-between items-center py-2 border-b border-border/50">
						<div class="flex items-center gap-2">
							<Icon icon="tabler:tag" class="h-4 w-4 text-muted-foreground" />
							<span class="text-sm text-muted-foreground">{t('infoName')}</span>
						</div>
						<span class="text-sm font-medium">{data.server.name}</span>
					</div>
					<div class="flex justify-between items-center py-2 border-b border-border/50">
						<div class="flex items-center gap-2">
							<Icon icon="tabler:hash" class="h-4 w-4 text-muted-foreground" />
							<span class="text-sm text-muted-foreground">{t('infoServiceId')}</span>
						</div>
						<span class="text-sm font-mono">{serviceId}</span>
					</div>
					<div class="flex justify-between items-center py-2 border-b border-border/50">
						<div class="flex items-center gap-2">
							<Icon icon={getEggIcon(data.server.eggId)} class="h-4 w-4 text-muted-foreground" />
							<span class="text-sm text-muted-foreground">{t('infoType')}</span>
						</div>
						<Badge variant="outline">{getEggName(data.server.eggId)}</Badge>
					</div>
					{#if data.server.ipAddress}
						<div class="flex justify-between items-center py-2 border-b border-border/50">
							<div class="flex items-center gap-2">
								<Icon icon="tabler:world" class="h-4 w-4 text-muted-foreground" />
								<span class="text-sm text-muted-foreground">{t('infoIp')}</span>
							</div>
							<span class="text-sm font-mono">{data.server.ipAddress}</span>
						</div>
					{/if}
					{#if data.server.port}
						<div class="flex justify-between items-center py-2">
							<div class="flex items-center gap-2">
								<Icon icon="tabler:plug" class="h-4 w-4 text-muted-foreground" />
								<span class="text-sm text-muted-foreground">{t('infoPort')}</span>
							</div>
							<span class="text-sm font-mono">{data.server.port}</span>
						</div>
					{/if}
				</div>
			</CardContent>
		</Card>

		<!-- Runtime Information -->
		<Card class="border-border/50">
			<CardHeader>
				<CardTitle class="flex items-center gap-2">
					<Icon icon="tabler:clock" class="h-5 w-5" />
					{t('runtimeTitle')}
				</CardTitle>
			</CardHeader>
			<CardContent class="space-y-4">
				{#if data.server.expiresAt}
					{@const expiresAt = new Date(data.server.expiresAt)}
					{@const daysLeft = Math.floor((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24))}
					{#if daysLeft < 0}
						<div class="rounded-lg border border-red-500/50 bg-red-500/10 p-3 flex items-center gap-2 text-sm text-red-700 dark:text-red-400">
							<Icon icon="tabler:alert-circle-filled" class="h-5 w-5 shrink-0" />
							<span>{t('expired')}. Bitte verlängere deinen Server im Support oder per Ticket.</span>
						</div>
					{:else if daysLeft < 7}
						<div class="rounded-lg border border-amber-500/50 bg-amber-500/10 p-3 flex items-center gap-2 text-sm text-amber-700 dark:text-amber-400">
							<Icon icon="tabler:alert-triangle-filled" class="h-5 w-5 shrink-0" />
							<span>Laufzeit endet in {daysLeft} Tag{daysLeft === 1 ? '' : 'en'}. Bitte rechtzeitig verlängern.</span>
						</div>
					{/if}
				{/if}
				<div class="space-y-3">
					<div class="flex justify-between items-center py-2 border-b border-border/50">
						<div class="flex items-center gap-2">
							<Icon icon="tabler:calendar-event" class="h-4 w-4 text-muted-foreground" />
							<span class="text-sm text-muted-foreground">{t('createdAt')}</span>
						</div>
						<span class="text-sm font-medium">
								{new Date(data.server.createdAt).toLocaleDateString('de-DE', {
								day: '2-digit',
								month: '2-digit',
								year: 'numeric'
							})}
						</span>
					</div>
					{#if data.server.expiresAt}
						<div class="flex justify-between items-center py-2 border-b border-border/50">
							<div class="flex items-center gap-2">
								<Icon icon="tabler:calendar-off" class="h-4 w-4 text-muted-foreground" />
								<span class="text-sm text-muted-foreground">{t('expiresAt')}</span>
							</div>
							<span class="text-sm font-medium">
								{new Date(data.server.expiresAt).toLocaleDateString('de-DE', {
									day: '2-digit',
									month: '2-digit',
									year: 'numeric'
								})}
							</span>
						</div>
					{/if}
					<div class="flex justify-between items-center py-2">
						<div class="flex items-center gap-2">
							<Icon icon="tabler:hourglass" class="h-4 w-4 text-muted-foreground" />
							<span class="text-sm text-muted-foreground">{t('remainingTime')}</span>
						</div>
						<span class="text-sm font-medium">{runtimeCountdown}</span>
					</div>
				</div>
			</CardContent>
		</Card>
	</div>

	<!-- Pterodactyl Server Details -->
	{#if data.pterodactylServer}
		<Card class="border-border/50">
			<CardHeader>
				<CardTitle class="flex items-center gap-2">
					<Icon icon="tabler:server" class="h-5 w-5" />
					{t('pteroTitle')}
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div class="grid gap-4 md:grid-cols-2">
					<div class="space-y-3">
						<div class="flex justify-between items-center py-2 border-b border-border/50">
							<span class="text-sm text-muted-foreground">{t('pteroUuid')}</span>
							<span class="text-sm font-mono text-xs break-all">{data.pterodactylServer.uuid}</span>
						</div>
						<div class="flex justify-between items-center py-2 border-b border-border/50">
							<span class="text-sm text-muted-foreground">{t('pteroIdentifier')}</span>
							<span class="text-sm font-mono">{data.pterodactylServer.identifier}</span>
						</div>
					</div>
					<div class="space-y-3">
						<div class="flex justify-between items-center py-2 border-b border-border/50">
							<span class="text-sm text-muted-foreground">{t('pteroStatus')}</span>
							<Badge variant="outline">{data.pterodactylServer.status || 'N/A'}</Badge>
						</div>
						<div class="flex justify-between items-center py-2">
							<span class="text-sm text-muted-foreground">{t('pteroSuspended')}</span>
							<Badge variant={data.pterodactylServer.suspended ? 'destructive' : 'default'}>
								{data.pterodactylServer.suspended ? t('yes') : t('no')}
							</Badge>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	{/if}
</div>

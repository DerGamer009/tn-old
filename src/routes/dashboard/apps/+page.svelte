<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent } from '$lib/components/ui/card';
import { Badge } from '$lib/components/ui/badge';
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
import { language, type Language } from '$lib/stores/language';

let { data }: { data: PageData } = $props();
let runtimeCounters = $state<Record<string, string>>({});

const translations = {
	de: {
		pageTitle: 'App Hosting',
		pageSubtitle: 'Verwalte deine gehosteten Anwendungen',
		createButton: 'Neue App deployen',
		emptyText: 'Du hast noch keine Apps gehostet',
		emptyCta: 'Jetzt App deployen',
		tableApp: 'App',
		tableServiceId: 'ServiceID',
		tableType: 'Typ',
		tableRuntime: 'Laufzeit',
		tableStatus: 'Status',
		tableActions: 'Aktionen',
		unlimited: 'Unbegrenzt',
		expired: 'Abgelaufen',
		runtimeFormat: '{days}d {hours}h {minutes}m',
		statusOnline: 'Online',
		statusPending: 'Wird erstellt...',
		statusOffline: 'Offline',
		statusDeleted: 'Gelöscht',
		ipAssigning: 'IP wird zugewiesen...',
		unknown: 'Unbekannt',
		manage: 'Verwalten'
	},
	en: {
		pageTitle: 'App hosting',
		pageSubtitle: 'Manage your hosted applications',
		createButton: 'Deploy new app',
		emptyText: 'You have no hosted apps yet',
		emptyCta: 'Deploy app now',
		tableApp: 'App',
		tableServiceId: 'Service ID',
		tableType: 'Type',
		tableRuntime: 'Runtime',
		tableStatus: 'Status',
		tableActions: 'Actions',
		unlimited: 'Unlimited',
		expired: 'Expired',
		runtimeFormat: '{days}d {hours}h {minutes}m',
		statusOnline: 'Online',
		statusPending: 'Provisioning...',
		statusOffline: 'Offline',
		statusDeleted: 'Deleted',
		ipAssigning: 'IP is being assigned...',
		unknown: 'Unknown',
		manage: 'Manage'
	}
} satisfies Record<Language, Record<string, string>>;

type TKey = keyof (typeof translations)['de'];

function t(key: TKey): string {
	const lang = $language as Language;
	const dict = translations[lang] ?? translations.de;
	return dict[key] ?? translations.de[key];
}

	// Debug: Log Server-Daten (nur im Browser)
	if (typeof window !== 'undefined') {
		$effect(() => {
			console.log('App Hosting Servers:', data.servers);
			console.log('Servers length:', data.servers?.length || 0);
			if (data.servers && data.servers.length > 0) {
				console.log('First server:', data.servers[0]);
			}
		});
	}

function getServiceId(server: any): string {
	return (server as any).pterodactylServerId || server.id;
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

	return t('runtimeFormat')
		.replace('{days}', String(days))
		.replace('{hours}', String(hours))
		.replace('{minutes}', String(minutes));
}

function formatExpiryDate(server: any): string {
	if (!server.expiresAt) {
		return t('unlimited');
	}

	const expires = new Date(server.expiresAt);
	return expires.toLocaleDateString('de-DE', {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric'
	});
}

/** Tage bis Ablauf (negativ = abgelaufen) */
function getDaysUntilExpiry(server: any): number | null {
	if (!server?.expiresAt) return null;
	const now = new Date();
	const expires = new Date(server.expiresAt);
	return Math.floor((expires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function getStatusLabel(status: string): string {
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

function getEggName(eggId: number | null | undefined): string {
	if (!eggId) return t('unknown');
	const names: Record<number, string> = {
		26: 'Code-Server', 27: 'Generic Java', 28: 'Grafana', 29: 'MariaDB', 30: 'MongoDB 7', 31: 'MongoDB 8',
		32: 'Node.js', 33: 'Postgres 17', 34: 'Python', 35: 'Redis 6', 36: 'Redis 7', 37: 'SFTP Storage',
		38: 'Sinusbot', 39: 'Uptime Kuma'
	};
	return names[eggId] ?? `Egg ${eggId}`;
}

	// Update countdown every minute
	onMount(() => {
		if (data.servers && data.servers.length > 0) {
			for (const server of data.servers) {
				runtimeCounters[server.id] = formatRuntime(server);
			}

			const interval = setInterval(() => {
				for (const server of data.servers || []) {
					runtimeCounters = { ...runtimeCounters, [server.id]: formatRuntime(server) };
				}
			}, 60000); // Update every minute

			return () => clearInterval(interval);
		}
	});

	const totalApps = $derived(data.servers?.length ?? 0);
	const activeApps = $derived(data.servers?.filter((s) => s.status === 'ACTIVE').length ?? 0);
	const pendingApps = $derived(data.servers?.filter((s) => s.status === 'PENDING').length ?? 0);
	const suspendedApps = $derived(
		data.servers?.filter((s) => s.status === 'SUSPENDED').length ?? 0
	);
</script>

<svelte:head>
	<title>{t('pageTitle')} - Dashboard | TitanNode</title>
</svelte:head>

<div class="max-w-screen-2xl space-y-8">
	<!-- Header -->
	<Card class="border-border/60 bg-gradient-to-r from-primary/10 via-background to-primary/5">
		<CardContent class="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
			<div>
				<div class="flex items-center gap-3">
					<div class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15">
						<Icon icon="tabler:cloud" class="h-5 w-5 text-primary" />
					</div>
					<h1 class="text-2xl sm:text-3xl font-bold tracking-tight">
						{t('pageTitle')}
					</h1>
				</div>
				<p class="mt-2 text-sm sm:text-base text-muted-foreground">
					{t('pageSubtitle')}
				</p>
			</div>
			<div class="flex flex-col items-stretch gap-2 sm:items-end">
				<Button class="gap-2 w-full sm:w-auto" href="/app-hosting">
					<Icon icon="tabler:plus" class="h-4 w-4" />
					{t('createButton')}
				</Button>
				{#if totalApps > 0}
					<p class="text-xs text-muted-foreground">
						{activeApps}/{totalApps} {t('statusOnline')}
					</p>
				{/if}
			</div>
		</CardContent>
	</Card>

	{#if totalApps > 0}
		<!-- Stats -->
		<div class="grid gap-4 sm:grid-cols-3">
			<Card class="border-border/60 bg-card/90 backdrop-blur">
				<CardContent class="py-4">
					<p class="text-xs font-medium uppercase tracking-wide text-muted-foreground">
						{t('tableApp')}
					</p>
					<p class="mt-1 text-2xl font-semibold">{totalApps}</p>
				</CardContent>
			</Card>
			<Card class="border-border/60 bg-card/90 backdrop-blur">
				<CardContent class="py-4">
					<p class="text-xs font-medium uppercase tracking-wide text-muted-foreground">
						{t('statusOnline')}
					</p>
					<p class="mt-1 text-2xl font-semibold text-emerald-500">{activeApps}</p>
				</CardContent>
			</Card>
			<Card class="border-border/60 bg-card/90 backdrop-blur">
				<CardContent class="py-4">
					<p class="text-xs font-medium uppercase tracking-wide text-muted-foreground">
						{t('statusPending')}
					</p>
					<p class="mt-1 text-2xl font-semibold text-amber-500">{pendingApps}</p>
				</CardContent>
			</Card>
		</div>
	{/if}

	{#if !data.servers || data.servers.length === 0}
		<!-- Empty State -->
		<Card class="border-border/50">
			<CardContent class="flex flex-col items-center justify-center py-16">
				<div class="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-muted">
					<Icon icon="tabler:cloud-off" class="h-14 w-14 text-muted-foreground" />
				</div>
				<p class="mb-6 text-lg text-muted-foreground">{t('emptyText')}</p>
				<Button href="/app-hosting">{t('emptyCta')}</Button>
			</CardContent>
		</Card>
	{:else}
		<!-- Server Table -->
		<Card class="border-border/50">
			<CardContent class="p-0 overflow-x-auto">
				<Table class="min-w-[640px]">
					<TableHeader>
						<TableRow>
							<TableHead>{t('tableApp')}</TableHead>
							<TableHead>{t('tableServiceId')}</TableHead>
							<TableHead>{t('tableType')}</TableHead>
							<TableHead>{t('tableRuntime')}</TableHead>
							<TableHead>{t('tableStatus')}</TableHead>
							<TableHead>{t('tableActions')}</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{#each data.servers as server (server.id)}
							<TableRow>
								<!-- App -->
								<TableCell>
									<div class="flex flex-col gap-1">
										<div class="flex items-center gap-2">
											<span class="font-medium">{server.name}</span>
											<Icon icon="tabler:pencil" class="h-4 w-4 text-muted-foreground" />
										</div>
										{#if server.ipAddress}
											<div class="flex items-center gap-2">
												<Icon icon="tabler:world" class="h-3.5 w-3.5 text-muted-foreground" />
												<span class="text-sm text-muted-foreground">
													{server.ipAddress}:{server.port || 'N/A'}
												</span>
											</div>
										{:else}
											<p class="text-xs text-muted-foreground">{t('ipAssigning')}</p>
										{/if}
									</div>
								</TableCell>

								<!-- ServiceID -->
								<TableCell>
									<span class="font-mono text-sm">{getServiceId(server)}</span>
								</TableCell>

								<!-- Typ -->
								<TableCell>
									<Badge variant="outline">
										{getEggName((server as any).eggId)}
									</Badge>
								</TableCell>

								<!-- Laufzeit -->
								<TableCell>
									<div class="flex flex-col gap-0.5">
										<div class="flex items-center gap-1.5">
											{#if getDaysUntilExpiry(server) !== null && getDaysUntilExpiry(server)! < 0}
												<Icon icon="tabler:alert-circle-filled" class="h-4 w-4 text-red-500 shrink-0" title={t('expired')} />
											{:else if getDaysUntilExpiry(server) !== null && getDaysUntilExpiry(server)! < 7}
												<Icon icon="tabler:alert-triangle-filled" class="h-4 w-4 text-amber-500 shrink-0" title="Laufzeit endet bald" />
											{/if}
											<span class="text-sm {getDaysUntilExpiry(server) !== null && getDaysUntilExpiry(server)! < 0 ? 'text-red-600 dark:text-red-400' : ''}">
												{runtimeCounters[server.id] || formatRuntime(server)}
											</span>
										</div>
										<span class="text-xs text-muted-foreground">
											{formatExpiryDate(server)}
										</span>
									</div>
								</TableCell>

								<!-- Status -->
								<TableCell>
									<Badge
										variant={server.status === 'ACTIVE' ? 'default' : server.status === 'PENDING' ? 'secondary' : 'destructive'}
										class={
											server.status === 'ACTIVE'
												? 'bg-green-500 hover:bg-green-600 text-white'
												: ''
										}
									>
										{getStatusLabel(server.status)}
									</Badge>
								</TableCell>

								<!-- Aktionen -->
								<TableCell>
									<Button
										size="sm"
										variant="default"
										class="bg-green-500 hover:bg-green-600 text-white"
										href="/dashboard/apps/{server.id}"
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
	{/if}
</div>


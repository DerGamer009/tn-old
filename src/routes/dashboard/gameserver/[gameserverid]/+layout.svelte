<script lang="ts">
	import type { LayoutData } from './$types';
import { goto } from '$app/navigation';
import { Button } from '$lib/components/ui/button';
import { Card, CardContent } from '$lib/components/ui/card';
import { Badge } from '$lib/components/ui/badge';
import Icon from '@iconify/svelte';
import { page } from '$app/stores';
import { cn } from '$lib/utils';
import { language, type Language } from '$lib/stores/language';
	
let { data, children }: { data: LayoutData; children: any } = $props();
	
const translations = {
	de: {
		statusCalculating: 'Berechne...',
		unlimited: 'Unbegrenzt',
		expired: 'Abgelaufen',
		runtimeLong: '{days} Tag(e), {hours} Stunde(n)',
		runtimeShort: '{hours} Stunde(n), {minutes} Minute(n)',
		runtimeMinutes: '{minutes} Minute(n)',
		serverId: 'Server-ID:',
		backToGameservers: 'Zurück zu Gameservern',
		statusOnline: 'Online',
		statusOffline: 'Offline',
		statusOther: 'Unbekannt',
		runsOutIn: 'Läuft aus in:',
		sectionGeneral: 'General',
		navDashboard: 'Dashboard',
		navConsole: 'Console',
		navSettings: 'Settings',
		navActivity: 'Activity',
		sectionManagement: 'Management',
		navFiles: 'Files',
		navDatabases: 'Databases',
		navBackups: 'Backups',
		navNetwork: 'Network',
		navPlugins: 'Plugin Installer',
		navServerVersion: 'Server Version',
		sectionConfiguration: 'Configuration',
		navSchedules: 'Schedules',
		navUsers: 'Users',
		navStartup: 'Startup',
		mobileBack: 'Zurück'
	},
	en: {
		statusCalculating: 'Calculating...',
		unlimited: 'Unlimited',
		expired: 'Expired',
		runtimeLong: '{days} day(s), {hours} hour(s)',
		runtimeShort: '{hours} hour(s), {minutes} minute(s)',
		runtimeMinutes: '{minutes} minute(s)',
		serverId: 'Server ID:',
		backToGameservers: 'Back to game servers',
		statusOnline: 'Online',
		statusOffline: 'Offline',
		statusOther: 'Unknown',
		runsOutIn: 'Expires in:',
		sectionGeneral: 'General',
		navDashboard: 'Dashboard',
		navConsole: 'Console',
		navSettings: 'Settings',
		navActivity: 'Activity',
		sectionManagement: 'Management',
		navFiles: 'Files',
		navDatabases: 'Databases',
		navBackups: 'Backups',
		navNetwork: 'Network',
		navPlugins: 'Plugin installer',
		navServerVersion: 'Server version',
		sectionConfiguration: 'Configuration',
		navSchedules: 'Schedules',
		navUsers: 'Users',
		navStartup: 'Startup',
		mobileBack: 'Back'
	}
} satisfies Record<Language, Record<string, string>>;

type TKey = keyof (typeof translations)['de'];

function t(key: TKey): string {
	const lang = $language as Language;
	const dict = translations[lang] ?? translations.de;
	return dict[key] ?? translations.de[key];
}
	
// Helper functions
function getStatusColor(status: string): string {
	switch (status) {
		case 'ACTIVE':
			return 'bg-green-500';
		case 'SUSPENDED':
			return 'bg-red-500';
		default:
			return 'bg-gray-500';
	}
}
	
function getEggIcon(eggId: number | null | undefined): string {
	if (!eggId) return 'tabler:device-gamepad';
	const eggIcons: { [key: number]: string } = {
		15: 'tabler:rocket',
		16: 'tabler:file-code',
		17: 'tabler:leaf',
		18: 'tabler:sparkles',
		19: 'tabler:box',
		20: 'tabler:box',
		21: 'tabler:flame',
		22: 'tabler:flame',
		23: 'tabler:waterfall',
		43: 'tabler:package'
	};
	return eggIcons[eggId] || 'tabler:device-gamepad';
}
	
function getEggName(eggId: number | null | undefined): string {
	if (!eggId) return t('statusOther');
	const eggNames: { [key: number]: string } = {
		15: 'Velocity',
		16: 'Paper',
		17: 'Folia',
		18: 'Purpur',
		19: 'SpongeVanilla',
		20: 'SpongeForge',
		21: 'Forge Enhanced',
		22: 'NeoForge',
		23: 'Waterfall',
		43: 'Fabric'
	};
	return eggNames[eggId] || t('statusOther');
}
	
// Get current gameserver ID & path
const currentGameserverId = $derived($page.params.gameserverid);
const currentPath = $derived($page.url.pathname);
const currentServer = $derived(data.server);

const isNavActive = (href: string) =>
	currentPath === href || currentPath.startsWith(href + '/');
	
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

	if (days > 0) {
		return t('runtimeLong')
			.replace('{days}', String(days))
			.replace('{hours}', String(hours));
	} else if (hours > 0) {
		return t('runtimeShort')
			.replace('{hours}', String(hours))
			.replace('{minutes}', String(minutes));
	} else {
		return t('runtimeMinutes').replace('{minutes}', String(minutes));
	}
}
	
const runtimeCountdown = $derived(
	currentServer ? formatRuntime(currentServer.expiresAt) : t('statusCalculating')
);
</script>

<div class="flex min-h-screen bg-background">
	<!-- Gameserver Sidebar -->
	{#if currentServer}
		<aside class="hidden md:block md:w-72 flex-shrink-0 bg-background/95 border-r border-border/60 backdrop-blur px-4 py-4 overflow-y-auto">
			<div class="space-y-4">
				<!-- Brand / Gameserver Header -->
				<div class="flex items-center justify-between gap-3 pb-3 border-b border-border/60">
					<div class="flex items-center gap-3">
						<div class="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
							<Icon icon={getEggIcon(currentServer.eggId)} class="h-5 w-5 text-primary" />
						</div>
						<div class="flex flex-col">
							<span class="text-sm font-semibold truncate">
								{currentServer.name}
							</span>
							<span class="text-[11px] text-muted-foreground">
								{t('serverId')} {currentGameserverId}
							</span>
						</div>
					</div>
					<Button
						variant="outline"
						size="icon"
						class="h-8 w-8 rounded-full"
						title={t('backToGameservers')}
						onclick={() => goto('/dashboard/gameserver')}
					>
						<Icon icon="tabler:arrow-left" class="h-4 w-4" />
					</Button>
				</div>

				<!-- Back Button -->
				<Button
					variant="ghost"
					size="sm"
					class="w-full justify-start"
					onclick={() => goto('/dashboard/gameserver')}
				>
					<Icon icon="tabler:arrow-left" class="h-4 w-4 mr-2" />
					{t('backToGameservers')}
				</Button>
				
				<!-- Gameserver Info Card -->
				<Card class="border-border/50">
					<CardContent class="p-6 space-y-6">
						<!-- Status Badge -->
						<div class="flex justify-center">
							<Badge
								class="{getStatusColor(currentServer.status)} text-white px-4 py-2 text-sm font-medium"
							>
								{#if currentServer.status === 'ACTIVE'}
									{t('statusOnline')}
								{:else if currentServer.status === 'SUSPENDED'}
									{t('statusOffline')}
								{:else}
									{currentServer.status}
								{/if}
							</Badge>
						</div>

						<!-- Icon -->
						<div class="flex justify-center">
							<Icon icon={getEggIcon(currentServer.eggId)} class="h-16 w-16 text-primary" />
						</div>

						<!-- Server Name -->
						<div class="flex items-center justify-center gap-2">
							<span class="font-mono text-sm text-center">{currentServer.name}</span>
						</div>

						<!-- Server Type -->
						<div class="text-center">
							<Badge variant="outline" class="text-sm">
								{getEggName(currentServer.eggId)}
							</Badge>
						</div>

						<!-- Countdown -->
						<div class="text-center">
							<p class="text-sm text-muted-foreground mb-1">{t('runsOutIn')}</p>
							<p class="text-sm font-medium">{runtimeCountdown}</p>
						</div>
					</CardContent>
				</Card>
				
				<!-- Navigation -->
				<Card class="border-border/50 bg-background/80">
					<CardContent class="p-4 space-y-4">
						<!-- GENERAL -->
						<div class="space-y-2">
							<p class="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3">
								{t('sectionGeneral')}
							</p>
							<div class="space-y-1">
								<a
									href="/dashboard/gameserver/{currentGameserverId}"
									class={cn(
										'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
										isNavActive(`/dashboard/gameserver/${currentGameserverId}`) && !$page.url.searchParams.get('tab')
											? 'bg-primary/10 text-primary'
											: 'text-muted-foreground hover:bg-muted hover:text-foreground'
									)}
								>
									<Icon icon="tabler:layout-grid" class="h-4 w-4" />
									<span>{t('navDashboard')}</span>
								</a>
								<a
									href="/dashboard/gameserver/{currentGameserverId}/console"
									class={cn(
										'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
										isNavActive(`/dashboard/gameserver/${currentGameserverId}/console`)
											? 'bg-primary/10 text-primary'
											: 'text-muted-foreground hover:bg-muted hover:text-foreground'
									)}
								>
									<Icon icon="tabler:terminal" class="h-4 w-4" />
									<span>{t('navConsole')}</span>
								</a>
								<a
									href="/dashboard/gameserver/{currentGameserverId}/settings"
									class={cn(
										'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
										isNavActive(`/dashboard/gameserver/${currentGameserverId}/settings`)
											? 'bg-primary/10 text-primary'
											: 'text-muted-foreground hover:bg-muted hover:text-foreground'
									)}
								>
									<Icon icon="tabler:settings" class="h-4 w-4" />
									<span>{t('navSettings')}</span>
								</a>
								<a
									href="/dashboard/gameserver/{currentGameserverId}/activity"
									class={cn(
										'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
										isNavActive(`/dashboard/gameserver/${currentGameserverId}/activity`)
											? 'bg-primary/10 text-primary'
											: 'text-muted-foreground hover:bg-muted hover:text-foreground'
									)}
								>
									<Icon icon="tabler:eye" class="h-4 w-4" />
									<span>{t('navActivity')}</span>
								</a>
							</div>
						</div>

						<!-- MANAGEMENT -->
						<div class="space-y-2">
							<p class="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3">
								{t('sectionManagement')}
							</p>
							<div class="space-y-1">
								<a
									href="/dashboard/gameserver/{currentGameserverId}/files"
									class={cn(
										'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
										isNavActive(`/dashboard/gameserver/${currentGameserverId}/files`)
											? 'bg-primary/10 text-primary'
											: 'text-muted-foreground hover:bg-muted hover:text-foreground'
									)}
								>
									<Icon icon="tabler:folder" class="h-4 w-4" />
									<span>{t('navFiles')}</span>
								</a>
								<a
									href="/dashboard/gameserver/{currentGameserverId}/databases"
									class={cn(
										'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
										isNavActive(`/dashboard/gameserver/${currentGameserverId}/databases`)
											? 'bg-primary/10 text-primary'
											: 'text-muted-foreground hover:bg-muted hover:text-foreground'
									)}
								>
									<Icon icon="tabler:database" class="h-4 w-4" />
									<span>{t('navDatabases')}</span>
								</a>
								<a
									href="/dashboard/gameserver/{currentGameserverId}/backups"
									class={cn(
										'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
										isNavActive(`/dashboard/gameserver/${currentGameserverId}/backups`)
											? 'bg-primary/10 text-primary'
											: 'text-muted-foreground hover:bg-muted hover:text-foreground'
									)}
								>
									<Icon icon="tabler:archive" class="h-4 w-4" />
									<span>{t('navBackups')}</span>
								</a>
								<a
									href="/dashboard/gameserver/{currentGameserverId}/network"
									class={cn(
										'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
										isNavActive(`/dashboard/gameserver/${currentGameserverId}/network`)
											? 'bg-primary/10 text-primary'
											: 'text-muted-foreground hover:bg-muted hover:text-foreground'
									)}
								>
									<Icon icon="tabler:world" class="h-4 w-4" />
									<span>{t('navNetwork')}</span>
								</a>
								<a
									href="/dashboard/gameserver/{currentGameserverId}/plugins"
									class={cn(
										'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
										isNavActive(`/dashboard/gameserver/${currentGameserverId}/plugins`)
											? 'bg-primary/10 text-primary'
											: 'text-muted-foreground hover:bg-muted hover:text-foreground'
									)}
								>
									<Icon icon="tabler:package" class="h-4 w-4" />
									<span>{t('navPlugins')}</span>
								</a>
								<a
									href="/dashboard/gameserver/{currentGameserverId}/server-version"
									class={cn(
										'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
										isNavActive(`/dashboard/gameserver/${currentGameserverId}/server-version`)
											? 'bg-primary/10 text-primary'
											: 'text-muted-foreground hover:bg-muted hover:text-foreground'
									)}
								>
									<Icon icon="tabler:code" class="h-4 w-4" />
									<span>{t('navServerVersion')}</span>
								</a>
							</div>
						</div>

						<!-- CONFIGURATION -->
						<div class="space-y-2">
							<p class="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3">
								{t('sectionConfiguration')}
							</p>
							<div class="space-y-1">
								<a
									href="/dashboard/gameserver/{currentGameserverId}/schedules"
									class={cn(
										'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
										isNavActive(`/dashboard/gameserver/${currentGameserverId}/schedules`)
											? 'bg-primary/10 text-primary'
											: 'text-muted-foreground hover:bg-muted hover:text-foreground'
									)}
								>
									<Icon icon="tabler:calendar" class="h-4 w-4" />
									<span>{t('navSchedules')}</span>
								</a>
								<a
									href="/dashboard/gameserver/{currentGameserverId}/users"
									class={cn(
										'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
										isNavActive(`/dashboard/gameserver/${currentGameserverId}/users`)
											? 'bg-primary/10 text-primary'
											: 'text-muted-foreground hover:bg-muted hover:text-foreground'
									)}
								>
									<Icon icon="tabler:users" class="h-4 w-4" />
									<span>{t('navUsers')}</span>
								</a>
								<a
									href="/dashboard/gameserver/{currentGameserverId}/startup"
									class={cn(
										'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
										isNavActive(`/dashboard/gameserver/${currentGameserverId}/startup`)
											? 'bg-primary/10 text-primary'
											: 'text-muted-foreground hover:bg-muted hover:text-foreground'
									)}
								>
									<Icon icon="tabler:adjustments-alt" class="h-4 w-4" />
									<span>{t('navStartup')}</span>
								</a>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</aside>
		
		<!-- Mobile Menu Button -->
				<div class="md:hidden fixed top-4 left-4 z-50">
			<Button
				variant="outline"
				size="sm"
				onclick={() => goto('/dashboard/gameserver')}
				>
					<Icon icon="tabler:arrow-left" class="h-4 w-4 mr-2" />
					{t('mobileBack')}
				</Button>
		</div>
	{/if}

	<!-- Main Content -->
	<main class="flex-1 p-4 md:p-6 lg:p-8 {currentServer ? 'md:ml-0' : 'md:ml-72'}">
		{@render children()}
	</main>
</div>

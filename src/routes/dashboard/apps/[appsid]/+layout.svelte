<script lang="ts">
	import type { LayoutData } from './$types';
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import Icon from '@iconify/svelte';
	import { page } from '$app/stores';
	import { cn } from '$lib/utils';
	
	let { data, children }: { data: LayoutData; children: any } = $props();
	
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
		if (!eggId) return 'tabler:server';
		const eggIcons: Record<number, string> = {
			26: 'tabler:code', 27: 'tabler:brand-java', 28: 'tabler:chart-line', 29: 'tabler:database', 30: 'tabler:database', 31: 'tabler:database',
			32: 'tabler:brand-nodejs', 33: 'tabler:database', 34: 'tabler:brand-python', 35: 'tabler:database', 36: 'tabler:database', 37: 'tabler:folder',
			38: 'tabler:music', 39: 'tabler:activity'
		};
		return eggIcons[eggId] || 'tabler:server';
	}
	
	function getEggName(eggId: number | null | undefined): string {
		if (!eggId) return 'Unbekannt';
		const eggNames: Record<number, string> = {
			26: 'Code-Server', 27: 'Generic Java', 28: 'Grafana', 29: 'MariaDB', 30: 'MongoDB 7', 31: 'MongoDB 8',
			32: 'Node.js', 33: 'Postgres 17', 34: 'Python', 35: 'Redis 6', 36: 'Redis 7', 37: 'SFTP Storage',
			38: 'Sinusbot', 39: 'Uptime Kuma'
		};
		return eggNames[eggId] || 'Unbekannt';
	}
	
	// Get current app ID & path
	const currentAppId = $derived($page.params.appsid);
	const currentPath = $derived($page.url.pathname);
	const currentServer = $derived(data.server);

	const isNavActive = (href: string) =>
		currentPath === href || currentPath.startsWith(href + '/');
	
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

		if (days > 0) {
			return `${days} Tag(e), ${hours} Stunde(n)`;
		} else if (hours > 0) {
			return `${hours} Stunde(n), ${minutes} Minute(n)`;
		} else {
			return `${minutes} Minute(n)`;
		}
	}
	
	const runtimeCountdown = $derived(
		currentServer ? formatRuntime(currentServer.expiresAt) : 'Berechne...'
	);
</script>

<div class="flex min-h-screen bg-background">
	<!-- App Sidebar (ersetzt Dashboard Sidebar) -->
	{#if currentServer}
		<aside class="hidden md:block md:w-72 flex-shrink-0 bg-background/95 border-r border-border/60 backdrop-blur px-4 py-4 overflow-y-auto">
			<div class="space-y-4">
				<!-- Brand / App Header -->
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
								App-ID: {currentAppId}
							</span>
						</div>
					</div>
					<Button
						variant="outline"
						size="icon"
						class="h-8 w-8 rounded-full"
						title="Zurück zu Apps"
						onclick={() => goto('/dashboard/apps')}
					>
						<Icon icon="tabler:arrow-left" class="h-4 w-4" />
					</Button>
				</div>

				<!-- Back Button -->
				<Button
					variant="ghost"
					size="sm"
					class="w-full justify-start"
					onclick={() => goto('/dashboard/apps')}
				>
					<Icon icon="tabler:arrow-left" class="h-4 w-4 mr-2" />
					Zurück zu Apps
				</Button>
				
				<!-- App Info Card -->
				<Card class="border-border/50">
					<CardContent class="p-6 space-y-6">
						<!-- Status Badge -->
						<div class="flex justify-center">
							<Badge
								class="{getStatusColor(currentServer.status)} text-white px-4 py-2 text-sm font-medium"
							>
								{#if currentServer.status === 'ACTIVE'}
									Online
								{:else if currentServer.status === 'SUSPENDED'}
									Offline
								{:else}
									{currentServer.status}
								{/if}
							</Badge>
						</div>

						<!-- Icon -->
						<div class="flex justify-center">
							<Icon icon={getEggIcon(currentServer.eggId)} class="h-16 w-16 text-primary" />
						</div>

						<!-- App Name -->
						<div class="flex items-center justify-center gap-2">
							<span class="font-mono text-sm text-center">{currentServer.name}</span>
						</div>

						<!-- App Type -->
						<div class="text-center">
							<Badge variant="outline" class="text-sm">
								{getEggName(currentServer.eggId)}
							</Badge>
						</div>

						<!-- Countdown -->
						<div class="text-center">
							<p class="text-sm text-muted-foreground mb-1">Läuft aus in:</p>
							<p class="text-sm font-medium">{runtimeCountdown}</p>
						</div>
					</CardContent>
				</Card>
				
				<!-- Navigation -->
				<Card class="border-border/50 bg-background/80">
					<CardContent class="p-4 space-y-4">
						<!-- MANAGEMENT -->
						<div class="space-y-2">
							<p class="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3">
								Management
							</p>
							<div class="space-y-1">
								<a
									href="/dashboard/apps/{currentAppId}"
									class={cn(
										'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
										isNavActive(`/dashboard/apps/${currentAppId}`) && !$page.url.searchParams.get('tab')
											? 'bg-primary/10 text-primary'
											: 'text-muted-foreground hover:bg-muted hover:text-foreground'
									)}
								>
									<Icon icon="tabler:info-circle" class="h-4 w-4" />
									<span>Übersicht</span>
								</a>
								<a
									href="/dashboard/apps/{currentAppId}/console"
									class={cn(
										'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
										isNavActive(`/dashboard/apps/${currentAppId}/console`)
											? 'bg-primary/10 text-primary'
											: 'text-muted-foreground hover:bg-muted hover:text-foreground'
									)}
								>
									<Icon icon="tabler:terminal" class="h-4 w-4" />
									<span>Console</span>
								</a>
								<a
									href="/dashboard/apps/{currentAppId}/files"
									class={cn(
										'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
										isNavActive(`/dashboard/apps/${currentAppId}/files`)
											? 'bg-primary/10 text-primary'
											: 'text-muted-foreground hover:bg-muted hover:text-foreground'
									)}
								>
									<Icon icon="tabler:folder" class="h-4 w-4" />
									<span>Dateien</span>
								</a>
							</div>
						</div>

						<!-- ADMINISTRATION -->
						<div class="space-y-2">
							<p class="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3">
								Administration
							</p>
							<div class="space-y-1">
								<a
									href="/dashboard/apps/{currentAppId}/users"
									class={cn(
										'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
										isNavActive(`/dashboard/apps/${currentAppId}/users`)
											? 'bg-primary/10 text-primary'
											: 'text-muted-foreground hover:bg-muted hover:text-foreground'
									)}
								>
									<Icon icon="tabler:users" class="h-4 w-4" />
									<span>Users</span>
								</a>
								<a
									href="/dashboard/apps/{currentAppId}/backups"
									class={cn(
										'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
										isNavActive(`/dashboard/apps/${currentAppId}/backups`)
											? 'bg-primary/10 text-primary'
											: 'text-muted-foreground hover:bg-muted hover:text-foreground'
									)}
								>
									<Icon icon="tabler:database" class="h-4 w-4" />
									<span>Backups</span>
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
				onclick={() => goto('/dashboard/apps')}
			>
				<Icon icon="tabler:arrow-left" class="h-4 w-4 mr-2" />
				Zurück
			</Button>
		</div>
	{/if}

	<!-- Main Content -->
	<main class="flex-1 p-4 md:p-6 lg:p-8 {currentServer ? 'md:ml-0' : 'md:ml-72'}">
		{@render children()}
	</main>
</div>


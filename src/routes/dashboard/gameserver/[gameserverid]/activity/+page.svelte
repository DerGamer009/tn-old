<script lang="ts">
	import type { PageData } from './$types';
	import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import Icon from '@iconify/svelte';

	let { data }: { data: PageData } = $props();

	function getActionLabel(action: string): string {
		const labels: Record<string, string> = {
			start: 'Server gestartet',
			stop: 'Server gestoppt',
			restart: 'Server neu gestartet',
			delete: 'Server gelöscht',
			sync: 'Status synchronisiert',
			rename: 'Server umbenannt',
			settings: 'Einstellungen geändert'
		};
		return labels[action] || action;
	}

	function getActionIcon(action: string): string {
		const icons: Record<string, string> = {
			start: 'tabler:player-play',
			stop: 'tabler:player-stop',
			restart: 'tabler:refresh',
			delete: 'tabler:trash',
			sync: 'tabler:refresh',
			rename: 'tabler:tag',
			settings: 'tabler:settings'
		};
		return icons[action] || 'tabler:activity';
	}

	function getActionColor(action: string): string {
		const colors: Record<string, string> = {
			start: 'bg-green-500/10 text-green-500',
			stop: 'bg-red-500/10 text-red-500',
			restart: 'bg-blue-500/10 text-blue-500',
			delete: 'bg-destructive/10 text-destructive',
			sync: 'bg-purple-500/10 text-purple-500',
			rename: 'bg-orange-500/10 text-orange-500',
			settings: 'bg-gray-500/10 text-gray-500'
		};
		return colors[action] || 'bg-muted text-muted-foreground';
	}

	function formatDate(date: string | Date): string {
		const d = new Date(date);
		return d.toLocaleString('de-DE', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit'
		});
	}

	function getUserName(user: any): string {
		if (!user) return 'Unbekannt';
		return `${user.firstName} ${user.lastName}`.trim() || user.email || 'Unbekannt';
	}
</script>

<svelte:head>
	<title>Activity - {data.server.name} | TitanNode Dashboard</title>
</svelte:head>

<div class="space-y-6">
	<div class="flex items-center gap-3">
		<Icon icon="tabler:eye" class="h-8 w-8 text-primary" />
		<h1 class="text-3xl font-bold">Activity</h1>
	</div>

	<Card class="border-border/50">
		<CardHeader>
			<CardTitle>Server-Aktivitäten</CardTitle>
			<CardDescription>
				Übersicht aller Aktionen, die für diesen Server durchgeführt wurden
			</CardDescription>
		</CardHeader>
		<CardContent>
			{#if data.activities && data.activities.length > 0}
				<div class="space-y-3">
					{#each data.activities as activity}
						<div class="flex items-start gap-4 p-4 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors">
							<div class="flex h-10 w-10 items-center justify-center rounded-lg {getActionColor(activity.action)}">
								<Icon icon={getActionIcon(activity.action)} class="h-5 w-5" />
							</div>
							<div class="flex-1 min-w-0">
								<div class="flex items-center gap-2 mb-1">
									<span class="font-medium">{getActionLabel(activity.action)}</span>
									<Badge variant="outline" class="text-xs">
										{activity.action}
									</Badge>
								</div>
								{#if activity.details}
									<p class="text-sm text-muted-foreground mb-2">{activity.details}</p>
								{/if}
								<div class="flex items-center gap-4 text-xs text-muted-foreground">
									<div class="flex items-center gap-1">
										<Icon icon="tabler:user" class="h-3 w-3" />
										<span>{getUserName(activity.user)}</span>
									</div>
									<div class="flex items-center gap-1">
										<Icon icon="tabler:world" class="h-3 w-3" />
										<span>{activity.ipAddress}</span>
									</div>
									<div class="flex items-center gap-1">
										<Icon icon="tabler:clock" class="h-3 w-3" />
										<span>{formatDate(activity.createdAt)}</span>
									</div>
								</div>
							</div>
						</div>
					{/each}
				</div>
			{:else}
				<div class="text-center py-12">
					<Icon icon="tabler:activity" class="h-12 w-12 text-muted-foreground mx-auto mb-4" />
					<p class="text-muted-foreground">Noch keine Aktivitäten vorhanden</p>
					<p class="text-sm text-muted-foreground mt-2">
						Aktionen wie Start, Stop, Restart werden hier protokolliert
					</p>
				</div>
			{/if}
		</CardContent>
	</Card>
</div>

<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import Icon from '@iconify/svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Techniker Dashboard - TitanNode</title>
</svelte:head>

<div class="space-y-8">
	<!-- Header -->
	<div class="flex flex-col gap-4 rounded-2xl border border-border/60 bg-gradient-to-r from-primary/5 via-background to-primary/5 px-5 py-5 sm:px-6 sm:py-6">
		<div class="flex flex-wrap items-center justify-between gap-4">
			<div>
				<h1 class="text-2xl sm:text-3xl font-bold flex items-center gap-2 sm:gap-3 flex-wrap">
					<Icon icon="tabler:tool" class="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
					<span>Techniker Dashboard</span>
				</h1>
				<p class="mt-1 text-sm sm:text-base text-muted-foreground">
					Übersicht Infrastruktur, Server, Nodes und technisches Team.
				</p>
			</div>
		</div>

		<div class="flex flex-wrap gap-3 text-xs sm:text-sm text-muted-foreground">
			<div class="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/60 px-3 py-1">
				<span class="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
				Systemstatus: <span class="font-medium text-foreground">Stabil</span>
			</div>
			<div class="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/60 px-3 py-1">
				<Icon icon="tabler:alert-circle" class="h-3.5 w-3.5 text-amber-500" />
				Offene Tickets: <span class="font-medium text-foreground">{data.stats.openTickets}</span>
				{#if data.stats.urgentTickets > 0}
					<span class="text-amber-600 dark:text-amber-400">({data.stats.urgentTickets} dringend)</span>
				{/if}
			</div>
		</div>
	</div>

	<!-- Stats Grid -->
	<div class="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
		<Card class="border-border/60 bg-card/90 backdrop-blur">
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium text-muted-foreground">Techniker</CardTitle>
				<Icon icon="tabler:users" class="h-5 w-5 text-primary" />
			</CardHeader>
			<CardContent>
				<div class="text-3xl font-bold">{data.stats.techniciansCount}</div>
				<p class="text-xs text-muted-foreground mt-1">Im technischen Team</p>
			</CardContent>
		</Card>

		<Card class="border-border/60 bg-card/90 backdrop-blur">
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium text-muted-foreground">Aktive Server</CardTitle>
				<Icon icon="tabler:server" class="h-5 w-5 text-emerald-500" />
			</CardHeader>
			<CardContent>
				<div class="text-3xl font-bold">{data.stats.serversActive}</div>
				<p class="text-xs text-muted-foreground mt-1">{data.stats.serversTotal} gesamt</p>
			</CardContent>
		</Card>

		<Card class="border-border/60 bg-card/90 backdrop-blur">
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium text-muted-foreground">Nodes</CardTitle>
				<Icon icon="tabler:server-2" class="h-5 w-5 text-sky-500" />
			</CardHeader>
			<CardContent>
				<div class="text-3xl font-bold">{data.stats.nodesTotal}</div>
				<p class="text-xs text-muted-foreground mt-1">Aktive Nodes</p>
			</CardContent>
		</Card>

		<Card class="border-border/60 bg-card/90 backdrop-blur">
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium text-muted-foreground">Offene Tickets</CardTitle>
				<Icon icon="tabler:ticket" class="h-5 w-5 text-orange-500" />
			</CardHeader>
			<CardContent>
				<div class="text-3xl font-bold">{data.stats.openTickets}</div>
				<p class="text-xs text-muted-foreground mt-1">{data.stats.urgentTickets} dringend</p>
			</CardContent>
		</Card>
	</div>

	<!-- Quick Links -->
	<div class="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
		<Card class="border-border/60 bg-card/90 backdrop-blur">
			<CardHeader>
				<CardTitle class="text-lg flex items-center gap-2">
					<Icon icon="tabler:users-group" class="h-5 w-5 text-primary" />
					Techniker-Team
				</CardTitle>
			</CardHeader>
			<CardContent>
				<p class="text-sm text-muted-foreground mb-4">
					Rollen, Zuständigkeiten und alle Techniker im Überblick
				</p>
				<a href="/technician/team" class="text-sm text-primary hover:underline">
					Team ansehen →
				</a>
			</CardContent>
		</Card>

		<Card class="border-border/60 bg-card/90 backdrop-blur">
			<CardHeader>
				<CardTitle class="text-lg flex items-center gap-2">
					<Icon icon="tabler:server" class="h-5 w-5 text-primary" />
					Server
				</CardTitle>
			</CardHeader>
			<CardContent>
				<p class="text-sm text-muted-foreground mb-4">
					Alle Server (VPS, Gameserver, App Hosting)
				</p>
				<a href="/technician/servers" class="text-sm text-primary hover:underline">
					Server ansehen →
				</a>
			</CardContent>
		</Card>

		<Card class="border-border/60 bg-card/90 backdrop-blur">
			<CardHeader>
				<CardTitle class="text-lg flex items-center gap-2">
					<Icon icon="tabler:server-2" class="h-5 w-5 text-primary" />
					Nodes
				</CardTitle>
			</CardHeader>
			<CardContent>
				<p class="text-sm text-muted-foreground mb-4">
					Infrastruktur-Nodes und Auslastung
				</p>
				<a href="/technician/nodes" class="text-sm text-primary hover:underline">
					Nodes ansehen →
				</a>
			</CardContent>
		</Card>

		<Card class="border-border/60 bg-card/90 backdrop-blur">
			<CardHeader>
				<CardTitle class="text-lg flex items-center gap-2">
					<Icon icon="tabler:ticket" class="h-5 w-5 text-primary" />
					Tickets
				</CardTitle>
			</CardHeader>
			<CardContent>
				<p class="text-sm text-muted-foreground mb-4">
					Support-Tickets mit technischem Bezug
				</p>
				<a href="/technician/tickets" class="text-sm text-primary hover:underline">
					Tickets ansehen →
				</a>
			</CardContent>
		</Card>
	</div>
</div>

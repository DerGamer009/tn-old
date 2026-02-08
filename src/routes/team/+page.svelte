<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import Icon from '@iconify/svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Team Dashboard - TitanNode</title>
</svelte:head>

<div class="space-y-8">
	<!-- Header -->
	<div class="flex flex-col gap-4 rounded-2xl border border-border/60 bg-gradient-to-r from-primary/5 via-background to-primary/5 px-5 py-5 sm:px-6 sm:py-6">
		<div class="flex flex-wrap items-center justify-between gap-4">
			<div>
				<h1 class="text-2xl sm:text-3xl font-bold flex items-center gap-2 sm:gap-3 flex-wrap">
					<Icon icon="tabler:users-group" class="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
					<span>Team Dashboard</span>
				</h1>
				<p class="mt-1 text-sm sm:text-base text-muted-foreground">
					Willkommen im Support-Team Portal. Behalte Tickets, Kunden und Workload im Blick.
				</p>
			</div>
		</div>

		<div class="flex flex-wrap gap-3 text-xs sm:text-sm text-muted-foreground">
			<div class="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/60 px-3 py-1">
				<span class="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
				Team-Status: <span class="font-medium text-foreground">Online</span>
			</div>
			<div class="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/60 px-3 py-1">
				<Icon icon="tabler:ticket" class="h-3.5 w-3.5 text-amber-500" />
				Offene Tickets:
				<span class="font-medium text-foreground">{data.stats.openTickets}</span>
			</div>
			<div class="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/60 px-3 py-1">
				<Icon icon="tabler:clock" class="h-3.5 w-3.5 text-sky-500" />
				In Bearbeitung:
				<span class="font-medium text-foreground">{data.stats.inProgressTickets}</span>
			</div>
		</div>
	</div>

	<!-- Stats Grid -->
	<div class="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
		<Card class="border-border/60 bg-card/90 backdrop-blur">
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium text-muted-foreground">Offene Tickets</CardTitle>
				<Icon icon="tabler:ticket" class="h-5 w-5 text-blue-500" />
			</CardHeader>
			<CardContent>
				<div class="text-3xl font-bold">{data.stats.openTickets}</div>
			</CardContent>
		</Card>

		<Card class="border-border/60 bg-card/90 backdrop-blur">
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium text-muted-foreground">In Bearbeitung</CardTitle>
				<Icon icon="tabler:clock" class="h-5 w-5 text-orange-500" />
			</CardHeader>
			<CardContent>
				<div class="text-3xl font-bold">{data.stats.inProgressTickets}</div>
			</CardContent>
		</Card>

		<Card class="border-border/60 bg-card/90 backdrop-blur">
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium text-muted-foreground">Warte auf Kunde</CardTitle>
				<Icon icon="tabler:message-circle" class="h-5 w-5 text-yellow-500" />
			</CardHeader>
			<CardContent>
				<div class="text-3xl font-bold">{data.stats.waitingTickets}</div>
			</CardContent>
		</Card>

		<Card class="border-border/60 bg-card/90 backdrop-blur">
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium text-muted-foreground">Heute geschlossen</CardTitle>
				<Icon icon="tabler:circle-check" class="h-5 w-5 text-green-500" />
			</CardHeader>
			<CardContent>
				<div class="text-3xl font-bold">{data.stats.closedToday}</div>
			</CardContent>
		</Card>
	</div>

	<!-- Quick Actions -->
	<div class="grid gap-6 md:grid-cols-2">
		<Card class="border-border/60 bg-card/90 backdrop-blur">
			<CardHeader>
				<CardTitle class="text-lg flex items-center gap-2">
					<Icon icon="tabler:ticket" class="h-5 w-5 text-primary" />
					Ticket-Verwaltung
				</CardTitle>
			</CardHeader>
			<CardContent>
				<p class="text-sm text-muted-foreground mb-4">
					Bearbeite und verwalte alle Support-Anfragen
				</p>
				<a href="/team/tickets" class="text-sm text-primary hover:underline">
					Alle Tickets ansehen →
				</a>
			</CardContent>
		</Card>

		<Card class="border-border/60 bg-card/90 backdrop-blur">
			<CardHeader>
				<CardTitle class="text-lg flex items-center gap-2">
					<Icon icon="tabler:users" class="h-5 w-5 text-primary" />
					Kunden-Übersicht
				</CardTitle>
			</CardHeader>
			<CardContent>
				<p class="text-sm text-muted-foreground mb-4">
					Übersicht über alle Kunden und deren Services
				</p>
				<a href="/team/customers" class="text-sm text-primary hover:underline">
					Kunden ansehen →
				</a>
			</CardContent>
		</Card>
	</div>
</div>


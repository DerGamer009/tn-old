<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import Icon from '@iconify/svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Admin Dashboard - TitanNode</title>
</svelte:head>

<div class="space-y-8">
	<!-- Header -->
	<div class="flex flex-col gap-4 rounded-2xl border border-border/60 bg-gradient-to-r from-primary/5 via-background to-primary/5 px-5 py-5 sm:px-6 sm:py-6">
		<div class="flex flex-wrap items-center justify-between gap-4">
			<div>
				<h1 class="text-2xl sm:text-3xl font-bold flex items-center gap-2 sm:gap-3 flex-wrap">
					<Icon icon="tabler:shield-lock" class="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
					<span>Admin Dashboard</span>
				</h1>
				<p class="mt-1 text-sm sm:text-base text-muted-foreground">
					Zentrale Übersicht über Support, Benutzer und Infrastruktur.
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
				Offene dringende Tickets:
				<span class="font-medium text-foreground">{data.stats.urgentTickets}</span>
			</div>
			<div class="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/60 px-3 py-1">
				<Icon icon="tabler:users" class="h-3.5 w-3.5 text-sky-500" />
				Neue Benutzer heute:
				<span class="font-medium text-foreground">{data.stats.newUsersToday}</span>
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
				<p class="text-xs text-muted-foreground mt-1">
					{data.stats.urgentTickets} dringend
				</p>
			</CardContent>
		</Card>

		<Card class="border-border/60 bg-card/90 backdrop-blur">
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium text-muted-foreground">Registrierte User</CardTitle>
				<Icon icon="tabler:users" class="h-5 w-5 text-green-500" />
			</CardHeader>
			<CardContent>
				<div class="text-3xl font-bold">{data.stats.totalUsers}</div>
				<p class="text-xs text-muted-foreground mt-1">
					+{data.stats.newUsersToday} heute
				</p>
			</CardContent>
		</Card>

		<Card class="border-border/60 bg-card/90 backdrop-blur">
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium text-muted-foreground">Offene Rechnungen</CardTitle>
				<Icon icon="tabler:receipt" class="h-5 w-5 text-orange-500" />
			</CardHeader>
			<CardContent>
				<div class="text-3xl font-bold">{data.stats.openInvoices}</div>
				<p class="text-xs text-muted-foreground mt-1">
					€{data.stats.openInvoicesAmount.toFixed(2)}
				</p>
			</CardContent>
		</Card>

		<Card class="border-border/60 bg-card/90 backdrop-blur">
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium text-muted-foreground">Aktive Server</CardTitle>
				<Icon icon="tabler:server" class="h-5 w-5 text-purple-500" />
			</CardHeader>
			<CardContent>
				<div class="text-3xl font-bold">{data.stats.activeServers}</div>
				<p class="text-xs text-muted-foreground mt-1">
					{data.stats.totalServers} gesamt
				</p>
			</CardContent>
		</Card>
	</div>

	<!-- Quick Links / Sektionen -->
	<div class="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
		<Card class="border-border/60 bg-card/90 backdrop-blur">
			<CardHeader>
				<CardTitle class="text-lg flex items-center gap-2">
					<Icon icon="tabler:ticket" class="h-5 w-5 text-primary" />
					Ticket-Management
				</CardTitle>
			</CardHeader>
			<CardContent>
				<p class="text-sm text-muted-foreground mb-4">
					Verwalte und bearbeite alle Support-Tickets
				</p>
				<a href="/admin/tickets" class="text-sm text-primary hover:underline">
					Tickets ansehen →
				</a>
			</CardContent>
		</Card>

		<Card class="border-border/60 bg-card/90 backdrop-blur">
			<CardHeader>
				<CardTitle class="text-lg flex items-center gap-2">
					<Icon icon="tabler:users" class="h-5 w-5 text-primary" />
					Benutzerverwaltung
				</CardTitle>
			</CardHeader>
			<CardContent>
				<p class="text-sm text-muted-foreground mb-4">
					Verwalte Benutzer, Rollen und Berechtigungen
				</p>
				<a href="/admin/users" class="text-sm text-primary hover:underline">
					Benutzer verwalten →
				</a>
			</CardContent>
		</Card>

		<Card class="border-border/60 bg-card/90 backdrop-blur">
			<CardHeader>
				<CardTitle class="text-lg flex items-center gap-2">
					<Icon icon="tabler:receipt" class="h-5 w-5 text-primary" />
					Rechnungsverwaltung
				</CardTitle>
			</CardHeader>
			<CardContent>
				<p class="text-sm text-muted-foreground mb-4">
					Übersicht über alle Rechnungen und Zahlungen
				</p>
				<a href="/admin/invoices" class="text-sm text-primary hover:underline">
					Rechnungen ansehen →
				</a>
			</CardContent>
		</Card>
	</div>

	<!-- Sektion: Monitoring & Aktivität -->
	<div class="grid gap-4 sm:gap-6 md:grid-cols-2">
		<Card class="border-border/60 bg-card/90 backdrop-blur">
			<CardHeader>
				<CardTitle class="text-lg flex items-center gap-2">
					<Icon icon="tabler:activity" class="h-5 w-5 text-emerald-500" />
					Live-Monitoring (Kurzüberblick)
				</CardTitle>
			</CardHeader>
			<CardContent>
				<p class="text-sm text-muted-foreground mb-4">
					Schneller Überblick über kritische Kennzahlen des Systems.
				</p>
				<div class="space-y-3 text-xs sm:text-sm">
					<div class="flex items-center justify-between gap-2">
						<span class="text-muted-foreground">Ticket-Load</span>
						<span class="font-medium">{data.stats.openTickets} offen</span>
					</div>
					<div class="flex items-center justify-between gap-2">
						<span class="text-muted-foreground">Auslastung Server</span>
						<span class="font-medium">
							{data.stats.activeServers}/{data.stats.totalServers} aktiv
						</span>
					</div>
					<div class="flex items-center justify-between gap-2">
						<span class="text-muted-foreground">Offene Rechnungen</span>
						<span class="font-medium">
							€{data.stats.openInvoicesAmount.toFixed(2)}
						</span>
					</div>
				</div>
			</CardContent>
		</Card>

		<Card class="border-border/60 bg-card/90 backdrop-blur">
			<CardHeader>
				<CardTitle class="text-lg flex items-center gap-2">
					<Icon icon="tabler:timeline" class="h-5 w-5 text-violet-500" />
					Letzte Admin-Aktivitäten
				</CardTitle>
			</CardHeader>
			<CardContent>
				<p class="text-sm text-muted-foreground mb-4">
					Platzhalter für ein Log der letzten relevanten Admin-Events
					(z.B. Logins, Rollenänderungen, Node-Deployments).
				</p>
				<div class="space-y-3 text-xs sm:text-sm text-muted-foreground">
					<div class="flex items-center gap-2">
						<span class="h-1.5 w-1.5 rounded-full bg-primary"></span>
						<span>Neues Ticket mit hoher Priorität erstellt</span>
					</div>
					<div class="flex items-center gap-2">
						<span class="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
						<span>Benutzerregistrierungen geprüft</span>
					</div>
					<div class="flex items-center gap-2">
						<span class="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
						<span>2 offene Rechnungen markiert zur Nachverfolgung</span>
					</div>
				</div>
			</CardContent>
		</Card>
	</div>
</div>


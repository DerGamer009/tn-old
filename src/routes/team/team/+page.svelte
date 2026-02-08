<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Input } from '$lib/components/ui/input';
	import { ROLE_NAMES, ROLE_COLORS } from '$lib/constants/roles';
	import Icon from '@iconify/svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let searchQuery = $state('');
	let filterRole = $state('all');

	let filteredMembers = $derived(
		data.teamMembers.filter(member => {
			const matchesSearch =
				member.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
				member.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
				member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
				(member.supportPin && member.supportPin.includes(searchQuery));

			const matchesRole = filterRole === 'all' || member.role === filterRole;

			return matchesSearch && matchesRole;
		})
	);

	function formatDate(date: Date) {
		return new Date(date).toLocaleDateString('de-DE', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric'
		});
	}

	function getLastLogin(member: any) {
		// Platzhalter - würde normalerweise aus loginActivities kommen
		return 'Heute';
	}
</script>

<svelte:head>
	<title>Team-Mitglieder | TitanNode</title>
</svelte:head>

<div class="space-y-8">
	<div>
		<h1 class="text-3xl font-bold flex items-center gap-3">
			<Icon icon="tabler:users-group" class="h-8 w-8 text-primary" />
			Team-Mitglieder
		</h1>
		<p class="mt-2 text-muted-foreground">Übersicht aller Team-Mitglieder und Support-Pins</p>
	</div>

	<!-- Statistiken -->
	<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
		<Card class="border-border/50">
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium text-muted-foreground">Gesamt</CardTitle>
				<Icon icon="tabler:users-group" class="h-5 w-5 text-blue-500" />
			</CardHeader>
			<CardContent>
				<div class="text-3xl font-bold">{data.stats.total}</div>
				<p class="text-xs text-muted-foreground mt-1">{data.stats.active} aktiv</p>
			</CardContent>
		</Card>

		<Card class="border-border/50">
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium text-muted-foreground">Support Team</CardTitle>
				<Icon icon="tabler:headset" class="h-5 w-5 text-green-500" />
			</CardHeader>
			<CardContent>
				<div class="text-3xl font-bold">{data.stats.supportTeam}</div>
				<p class="text-xs text-muted-foreground mt-1">Mitglieder</p>
			</CardContent>
		</Card>

		<Card class="border-border/50">
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium text-muted-foreground">Sales Team</CardTitle>
				<Icon icon="tabler:chart-line" class="h-5 w-5 text-purple-500" />
			</CardHeader>
			<CardContent>
				<div class="text-3xl font-bold">{data.stats.salesTeam}</div>
				<p class="text-xs text-muted-foreground mt-1">Mitglieder</p>
			</CardContent>
		</Card>

		<Card class="border-border/50">
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium text-muted-foreground">Management</CardTitle>
				<Icon icon="tabler:crown" class="h-5 w-5 text-orange-500" />
			</CardHeader>
			<CardContent>
				<div class="text-3xl font-bold">{data.stats.management + data.stats.founder}</div>
				<p class="text-xs text-muted-foreground mt-1">Führungskräfte</p>
			</CardContent>
		</Card>
	</div>

	<!-- Filter & Search -->
	<Card class="border-border/50">
		<CardContent class="pt-6">
			<div class="flex flex-col gap-4 sm:flex-row sm:items-center">
				<div class="flex-1">
					<div class="relative">
						<Icon
							icon="tabler:search"
							class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
						/>
						<Input
							type="search"
							placeholder="Nach Name, Email oder Support-PIN suchen..."
							bind:value={searchQuery}
							class="pl-9"
						/>
					</div>
				</div>

				<div class="flex items-center gap-2">
					<Icon icon="tabler:filter" class="h-4 w-4 text-muted-foreground" />
					<select
						bind:value={filterRole}
						class="flex h-10 w-full sm:w-44 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
					>
						<option value="all">Alle Rollen</option>
						<option value="SALES_TEAM">Sales Team</option>
						<option value="SUPPORT_TEAM">Support Team</option>
						<option value="TECHNICIAN">Techniker</option>
						<option value="MANAGEMENT">Management</option>
						<option value="FOUNDER">Founder</option>
					</select>
				</div>
			</div>
		</CardContent>
	</Card>

	<!-- Team-Mitglieder Liste -->
	<div class="space-y-4">
		{#each filteredMembers as member}
			<Card class="border-border/50 hover:bg-muted/50 transition-colors">
				<CardContent class="p-6">
					<div class="flex items-start gap-4">
						<div class="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
							<Icon icon="tabler:user" class="h-6 w-6 text-primary" />
						</div>

						<div class="flex-1 space-y-3">
							<div>
								<h3 class="font-semibold text-lg">
									{member.firstName}
									{member.lastName}
								</h3>
								<p class="text-sm text-muted-foreground">{member.email}</p>
							</div>

							<div class="flex flex-wrap items-center gap-2">
								<Badge variant="outline" class={ROLE_COLORS[member.role]}>
									{ROLE_NAMES[member.role]}
								</Badge>

								{#if member.emailVerified}
									<Badge variant="outline" class="bg-green-500/10 text-green-700 dark:text-green-400">
										<Icon icon="tabler:mail-check" class="mr-1 h-3 w-3" />
										Email verifiziert
									</Badge>
								{/if}

								{#if member.isActive}
									<Badge variant="outline" class="bg-green-500/10 text-green-700 dark:text-green-400">
										Aktiv
									</Badge>
								{:else}
									<Badge
										variant="outline"
										class="bg-red-500/10 text-red-700 dark:text-red-400"
									>
										Deaktiviert
									</Badge>
								{/if}
							</div>

							<div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
								<div class="flex items-center gap-2 text-muted-foreground">
									<Icon icon="tabler:key" class="h-4 w-4" />
									<span>PIN: <span class="font-mono font-semibold">{member.supportPin || 'N/A'}</span></span>
								</div>
								<div class="flex items-center gap-2 text-muted-foreground">
									<Icon icon="tabler:ticket" class="h-4 w-4" />
									<span>{member._count.tickets} Tickets</span>
								</div>
								<div class="flex items-center gap-2 text-muted-foreground">
									<Icon icon="tabler:calendar" class="h-4 w-4" />
									<span>Seit {formatDate(member.createdAt)}</span>
								</div>
								<div class="flex items-center gap-2 text-muted-foreground">
									<Icon icon="tabler:clock" class="h-4 w-4" />
									<span>Letzter Login: {getLastLogin(member)}</span>
								</div>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		{/each}
	</div>

	{#if filteredMembers.length === 0}
		<Card class="border-border/50">
			<CardContent class="flex flex-col items-center justify-center py-12">
				<Icon icon="tabler:users-off" class="h-16 w-16 text-muted-foreground mb-4" />
				<h3 class="text-lg font-semibold mb-2">Keine Team-Mitglieder gefunden</h3>
				<p class="text-sm text-muted-foreground">
					Passe deine Suchkriterien an oder ändere den Filter
				</p>
			</CardContent>
		</Card>
	{/if}
</div>


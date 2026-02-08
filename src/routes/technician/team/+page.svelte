<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { ROLE_NAMES, ROLE_COLORS } from '$lib/constants/roles';
	import { getTeamRoleById } from '$lib/constants/team-structure';
	import Icon from '@iconify/svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	function getInitials(firstName: string, lastName: string) {
		return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
	}

	function getPositionTitle(positionId: string | null) {
		if (!positionId) return null;
		const role = getTeamRoleById(positionId);
		return role?.title ?? positionId;
	}
</script>

<svelte:head>
	<title>Techniker-Team - Techniker Panel | TitanNode</title>
</svelte:head>

<div class="space-y-8">
	<div>
		<h1 class="text-2xl sm:text-3xl font-bold flex items-center gap-2 sm:gap-3 flex-wrap">
			<Icon icon="tabler:users-group" class="h-8 w-8 text-primary" />
			Techniker-Team
		</h1>
		<p class="mt-2 text-muted-foreground">
			Rollen, Zuständigkeiten und alle Techniker im Überblick.
		</p>
		{#if data.stats}
			<div class="mt-3 flex flex-wrap gap-3 text-xs sm:text-sm text-muted-foreground">
				<div class="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/60 px-3 py-1">
					<Icon icon="tabler:users" class="h-3.5 w-3.5 text-primary" />
					Techniker: <span class="font-medium text-foreground">{data.stats.techniciansTotal}</span>
				</div>
				<div class="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/60 px-3 py-1">
					<Icon icon="tabler:server" class="h-3.5 w-3.5 text-emerald-500" />
					Aktive Server: <span class="font-medium text-foreground">{data.stats.serversActive}</span> / {data.stats.serversTotal}
				</div>
				<div class="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/60 px-3 py-1">
					<Icon icon="tabler:server-2" class="h-3.5 w-3.5 text-sky-500" />
					Nodes: <span class="font-medium text-foreground">{data.stats.nodesTotal}</span>
				</div>
			</div>
		{/if}
	</div>

	<Card class="border-border/60 bg-card/90 backdrop-blur">
		<CardHeader>
			<CardTitle class="text-lg flex items-center gap-2">
				<Icon icon="tabler:list-details" class="h-5 w-5 text-primary" />
				Rollen & Zuständigkeiten
			</CardTitle>
			<p class="text-sm text-muted-foreground">
				Alle Rollen des technischen Bereichs.
			</p>
		</CardHeader>
		<CardContent>
			<div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
				{#each data.technicalRoles as role}
					<div class="rounded-xl border border-border/50 bg-muted/30 p-4 transition-colors hover:bg-muted/50">
						<div class="font-medium">{role.title}</div>
						<p class="mt-1 text-xs text-muted-foreground line-clamp-2">{role.description}</p>
					</div>
				{/each}
			</div>
		</CardContent>
	</Card>

	<Card class="border-border/60 bg-card/90 backdrop-blur">
		<CardHeader>
			<CardTitle class="text-lg flex items-center gap-2">
				<Icon icon="tabler:users" class="h-5 w-5 text-primary" />
				Alle Techniker
			</CardTitle>
			<p class="text-sm text-muted-foreground">
				Team-Mitglieder mit Techniker-Rolle oder technischer Position.
			</p>
		</CardHeader>
		<CardContent>
			{#if data.technicians.length === 0}
				<p class="py-8 text-center text-muted-foreground">Noch keine Techniker im System zugeordnet.</p>
			{:else}
				<div class="space-y-2">
					{#each data.technicians as member}
						<div class="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border/50 p-4">
							<div class="flex items-center gap-3 min-w-0">
								<div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
									{#if member.image}
										<img src={member.image} alt="" class="h-full w-full rounded-full object-cover" />
									{:else}
										{getInitials(member.firstName, member.lastName)}
									{/if}
								</div>
								<div class="min-w-0">
									<div class="flex flex-wrap items-center gap-2">
										<span class="font-medium">{member.firstName} {member.lastName}</span>
										<Badge variant="outline" class="{ROLE_COLORS[member.role]} text-xs">
											{ROLE_NAMES[member.role]}
										</Badge>
										{#if member.position}
											<Badge variant="secondary" class="text-xs">
												{getPositionTitle(member.position)}
											</Badge>
										{/if}
									</div>
									<p class="text-sm text-muted-foreground truncate">{member.email}</p>
								</div>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</CardContent>
	</Card>
</div>

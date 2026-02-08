<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import { Card, CardContent } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '$lib/components/ui/accordion';
	import { getRoleDisplayName } from '$lib/constants/roles';
	import { TEAM_STRUCTURE, getTeamRoleById } from '$lib/constants/team-structure';
	import Icon from '@iconify/svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	type MemberWithPosition = (typeof data.teamMembers)[number] & { position?: string | null };

	/** Reihenfolge für „Die Vision“: Founder, Co-Founder, dann COO/CTO/CFO usw. */
	const VISION_ORDER = ['founder', 'co-founder', 'coo', 'cto', 'cfo'];

	/** Sort-Index: Wer position hat → Index in VISION_ORDER. Sonst FOUNDER → 0 (ganz vorne), MANAGEMENT → ans Ende. */
	function getVisionSortIndex(m: { role: string; position?: string | null }): number {
		const pos = (m.position ?? '').toLowerCase();
		const idx = VISION_ORDER.indexOf(pos);
		if (idx !== -1) return idx;
		if (m.role === 'FOUNDER') return 0;
		return VISION_ORDER.length;
	}

	// Gruppiere Team nach Rollen (Basis-Rolle für Sektionen)
	const teamByRole = $derived.by(() => {
		const vision = data.teamMembers.filter((m) => m.role === 'FOUNDER' || m.role === 'MANAGEMENT');
		const visionSorted = [...vision].sort((a, b) => {
			const idxA = getVisionSortIndex(a);
			const idxB = getVisionSortIndex(b);
			if (idxA !== idxB) return idxA - idxB;
			return 0;
		});
		return {
			vision: visionSorted,
			support: data.teamMembers.filter((m) => m.role === 'SUPPORT_TEAM'),
			sales: data.teamMembers.filter((m) => m.role === 'SALES_TEAM'),
			technicians: data.teamMembers.filter((m) => m.role === 'TECHNICIAN')
		};
	});

	function getInitials(firstName: string, lastName: string) {
		return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
	}

	function getDisplayName(firstName: string, lastName: string) {
		return `${firstName} ${lastName.charAt(0).toUpperCase()}.`;
	}

	function getRoleIcon(role: string) {
		switch (role) {
			case 'FOUNDER':
				return 'tabler:crown';
			case 'MANAGEMENT':
				return 'tabler:briefcase';
			case 'SUPPORT_TEAM':
				return 'tabler:headset';
			case 'SALES_TEAM':
				return 'tabler:chart-line';
			case 'TECHNICIAN':
				return 'tabler:tool';
			default:
				return 'tabler:user';
		}
	}

	/** Anzeige-Titel: Team-Position oder Basis-Rolle */
	function getMemberRoleLabel(member: MemberWithPosition): string {
		return getRoleDisplayName(member.position ?? member.role);
	}

	/** Beschreibung: aus Team-Position oder Fallback (für einheitliche Länge gekürzt) */
	function getMemberRoleDescription(member: MemberWithPosition): string {
		if (member.position) {
			const teamRole = getTeamRoleById(member.position);
			if (teamRole) return teamRole.description;
		}
		switch (member.role) {
			case 'FOUNDER':
				return 'Gründer von TitanNode. Trifft alle strategischen und organisatorischen Entscheidungen.';
			case 'MANAGEMENT':
				return 'Leitung & Strategie';
			case 'SUPPORT_TEAM':
				return 'Kundenbetreuung';
			case 'SALES_TEAM':
				return 'Vertrieb & Beratung';
			case 'TECHNICIAN':
				return 'Technik & Infrastruktur';
			default:
				return '';
		}
	}

</script>

<svelte:head>
	<title>Unser Team | TitanNode</title>
	<meta name="description" content="Lernen Sie das Team hinter TitanNode kennen - Experten für VPS, Gameserver und App Hosting." />
</svelte:head>

<div class="min-h-screen bg-background">
	<!-- Hero -->
	<section class="relative overflow-hidden border-b">
		<div class="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.12),_transparent_50%),_radial-gradient(ellipse_80%_60%_at_50%_-20%,var(--primary)/0.08),linear-gradient(to_bottom,transparent,var(--background))] dark:bg-[linear-gradient(135deg,_#1e293b_0%,_#0f172a_50%,_#1a2332_100%)]"></div>
		<div class="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,var(--background)_70%)] dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,_rgba(56,189,248,0.08),_transparent),_linear-gradient(to_bottom,transparent_0%,_rgba(15,23,42,0.4)_100%)]"></div>
		<div class="container relative mx-auto max-w-5xl px-4 py-24 sm:py-32">
			<div class="mx-auto max-w-3xl text-center">
				<span class="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-2 text-sm font-medium text-primary shadow-sm">
					<Icon icon="tabler:users-group" class="h-4 w-4" />
					Unser Team
				</span>
				<h1 class="mt-8 text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
					Die Menschen hinter
					<span class="block bg-gradient-to-r from-primary via-sky-400 to-primary/80 bg-clip-text text-transparent">TitanNode</span>
				</h1>
				<p class="mt-6 text-lg text-muted-foreground sm:text-xl max-w-2xl mx-auto">
					Die Köpfe hinter TitanNode – Leidenschaftliche Gründer und Führungskräfte, die die Zukunft des Hostings gestalten.
				</p>
			</div>
		</div>
	</section>

	<!-- Stats -->
	<section class="border-b">
		<div class="container mx-auto max-w-5xl px-4 py-12 sm:py-14">
			<div class="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6">
				<div class="group rounded-2xl border border-border/60 bg-card/60 p-6 text-center backdrop-blur-sm transition-all hover:border-primary/30 hover:bg-card/80 hover:shadow-lg hover:shadow-primary/5">
					<Icon icon="tabler:users" class="mx-auto h-8 w-8 text-primary/80" />
					<p class="mt-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{data.teamMembers.length}+</p>
					<p class="mt-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">Team</p>
				</div>
				<div class="group rounded-2xl border border-border/60 bg-card/60 p-6 text-center backdrop-blur-sm transition-all hover:border-primary/30 hover:bg-card/80 hover:shadow-lg hover:shadow-primary/5">
					<Icon icon="tabler:headset" class="mx-auto h-8 w-8 text-primary/80" />
					<p class="mt-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">24/7</p>
					<p class="mt-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">Support</p>
				</div>
				<div class="group rounded-2xl border border-border/60 bg-card/60 p-6 text-center backdrop-blur-sm transition-all hover:border-primary/30 hover:bg-card/80 hover:shadow-lg hover:shadow-primary/5">
					<Icon icon="tabler:calendar-star" class="mx-auto h-8 w-8 text-primary/80" />
					<p class="mt-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">2025</p>
					<p class="mt-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">Gegründet</p>
				</div>
				<div class="group rounded-2xl border border-border/60 bg-card/60 p-6 text-center backdrop-blur-sm transition-all hover:border-primary/30 hover:bg-card/80 hover:shadow-lg hover:shadow-primary/5">
					<Icon icon="tabler:users-group" class="mx-auto h-8 w-8 text-primary/80" />
					<p class="mt-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">1000+</p>
					<p class="mt-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">Kunden</p>
				</div>
			</div>
		</div>
	</section>

	<!-- Team-Struktur -->
	<section class="py-20 sm:py-28">
		<div class="container mx-auto max-w-5xl px-4">
			<div class="mb-12 text-center">
				<h2 class="text-2xl font-bold tracking-tight sm:text-3xl">Team-Struktur</h2>
				<p class="mt-3 text-muted-foreground max-w-xl mx-auto">Rollen und Verantwortlichkeiten bei TitanNode</p>
			</div>
			<Accordion type="single" class="space-y-4">
				{#each TEAM_STRUCTURE as category}
					<AccordionItem value={category.id} class="rounded-2xl border border-border/60 bg-card/60 px-6 shadow-sm backdrop-blur-sm transition-all data-[state=open]:border-primary/20 data-[state=open]:shadow-lg data-[state=open]:shadow-primary/5">
						<AccordionTrigger class="hover:no-underline py-6">
							<span class="flex items-center gap-4 text-left">
								<span class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 ring-2 ring-primary/10">
									<Icon icon={category.icon} class="h-6 w-6 text-primary" />
								</span>
								<span class="font-semibold text-foreground">{category.name}</span>
								<Badge variant="secondary" class="ml-auto text-xs font-medium">{category.roles.length} Rollen</Badge>
							</span>
						</AccordionTrigger>
						<AccordionContent class="pb-6 pt-0">
							<ul class="space-y-3">
								{#each category.roles as role}
									<li class="flex flex-col gap-1.5 rounded-xl border border-border/40 bg-muted/20 px-4 py-3.5 sm:flex-row sm:items-center sm:gap-8 transition-colors hover:bg-muted/30">
										<span class="min-w-[12rem] font-medium text-foreground">{role.title}</span>
										<span class="text-sm text-muted-foreground">{role.description}</span>
									</li>
								{/each}
							</ul>
						</AccordionContent>
					</AccordionItem>
				{/each}
			</Accordion>
		</div>
	</section>

	<!-- Die Vision: Gründer + Management in einer Sektion, einheitliche Karten -->
	{#if teamByRole.vision.length > 0}
		<section class="py-20 sm:py-28">
			<div class="container mx-auto px-4">
				<div class="mb-14 text-center">
					<Badge variant="outline" class="mb-4 bg-gradient-to-r from-amber-500/15 to-orange-500/15 text-amber-700 dark:text-amber-400 border-amber-500/40 px-4 py-2 font-medium">
						<Icon icon="tabler:crown" class="mr-2 h-4 w-4" />
						Gründer & Leitung
					</Badge>
					<h2 class="mb-4 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
						Die Vision
					</h2>
					<p class="text-lg text-muted-foreground max-w-2xl mx-auto">
						Die Köpfe hinter TitanNode – Leidenschaftliche Gründer, die die Zukunft des Hostings gestalten.
					</p>
				</div>
				<div class="mx-auto grid max-w-6xl gap-8 sm:grid-cols-2 lg:grid-cols-3">
					{#each teamByRole.vision as member}
						<Card class="group relative overflow-hidden rounded-2xl border border-border/60 bg-card/60 shadow-sm backdrop-blur-sm transition-all duration-300 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1">
							<div class="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
							<CardContent class="relative p-8 text-center">
								<div class="mx-auto mb-6 flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-primary/90 to-primary text-2xl font-bold text-primary-foreground shadow-lg ring-4 ring-primary/15 group-hover:ring-primary/35 transition-all duration-300">
									{#if member.image}
										<img src={member.image} alt="" class="h-full w-full object-cover" />
									{:else}
										<span class="select-none">{getInitials(member.firstName, member.lastName)}</span>
									{/if}
								</div>
								<h3 class="mb-2 text-xl font-bold text-foreground transition-colors group-hover:text-primary sm:text-2xl">
									{getDisplayName(member.firstName, member.lastName)}
								</h3>
								<Badge variant="outline" class="mb-4 inline-flex items-center gap-1.5 bg-primary/10 text-primary border-primary/40 px-3 py-1 font-medium">
									<Icon icon={getRoleIcon(member.role)} class="h-3.5 w-3.5" />
									{getMemberRoleLabel(member as MemberWithPosition)}
								</Badge>
								<p class="text-sm text-muted-foreground leading-relaxed line-clamp-3 min-h-[3.75rem]">
									{getMemberRoleDescription(member as MemberWithPosition)}
								</p>
							</CardContent>
						</Card>
					{/each}
				</div>
			</div>
		</section>
	{/if}

	<!-- Support & Sales & Technicians -->
	<section class="py-20 sm:py-28">
		<div class="container mx-auto px-4">
			<div class="mb-14 text-center">
				<h2 class="text-3xl font-bold tracking-tight sm:text-4xl">Unser Team</h2>
				<p class="mt-3 text-muted-foreground max-w-xl mx-auto">Die Experten, die TitanNode am Laufen halten</p>
			</div>

			<div class="space-y-16">
				<!-- Support Team -->
				{#if teamByRole.support.length > 0}
					<div>
						<div class="mb-8 flex items-center justify-center gap-2">
							<Badge variant="outline" class="bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/40 px-4 py-2 font-medium">
								<Icon icon="tabler:headset" class="mr-2 h-4 w-4" />
								Support Team
							</Badge>
						</div>
						<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
							{#each teamByRole.support as member}
								<Card class="group rounded-2xl border border-border/60 bg-card/60 shadow-sm backdrop-blur-sm transition-all duration-300 hover:border-blue-500/40 hover:shadow-lg hover:shadow-blue-500/5 hover:-translate-y-0.5">
									<CardContent class="p-6 text-center">
										<div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/15 text-lg font-bold text-blue-600 dark:text-blue-400 ring-2 ring-blue-500/20 group-hover:ring-blue-500/40 transition-all">
											{#if member.image}
												<img src={member.image} alt={`${member.firstName} ${member.lastName}`} class="h-full w-full rounded-full object-cover" />
											{:else}
												{getInitials(member.firstName, member.lastName)}
											{/if}
										</div>
										<h3 class="mb-1 text-sm font-semibold text-foreground">{getDisplayName(member.firstName, member.lastName)}</h3>
										<p class="text-xs font-medium text-foreground">{getMemberRoleLabel(member as MemberWithPosition)}</p>
										<p class="mt-0.5 text-xs text-muted-foreground">{getMemberRoleDescription(member as MemberWithPosition)}</p>
									</CardContent>
								</Card>
							{/each}
						</div>
					</div>
				{/if}

				<!-- Sales Team -->
				{#if teamByRole.sales.length > 0}
					<div>
						<div class="mb-8 flex items-center justify-center gap-2">
							<Badge variant="outline" class="bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-500/40 px-4 py-2 font-medium">
								<Icon icon="tabler:chart-line" class="mr-2 h-4 w-4" />
								Sales Team
							</Badge>
						</div>
						<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
							{#each teamByRole.sales as member}
								<Card class="group rounded-2xl border border-border/60 bg-card/60 shadow-sm backdrop-blur-sm transition-all duration-300 hover:border-purple-500/40 hover:shadow-lg hover:shadow-purple-500/5 hover:-translate-y-0.5">
									<CardContent class="p-6 text-center">
										<div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-500/15 text-lg font-bold text-purple-600 dark:text-purple-400 ring-2 ring-purple-500/20 group-hover:ring-purple-500/40 transition-all">
											{#if member.image}
												<img src={member.image} alt={`${member.firstName} ${member.lastName}`} class="h-full w-full rounded-full object-cover" />
											{:else}
												{getInitials(member.firstName, member.lastName)}
											{/if}
										</div>
										<h3 class="mb-1 text-sm font-semibold text-foreground">{getDisplayName(member.firstName, member.lastName)}</h3>
										<p class="text-xs font-medium text-foreground">{getMemberRoleLabel(member as MemberWithPosition)}</p>
										<p class="mt-0.5 text-xs text-muted-foreground">{getMemberRoleDescription(member as MemberWithPosition)}</p>
									</CardContent>
								</Card>
							{/each}
						</div>
					</div>
				{/if}

				<!-- Technicians -->
				{#if teamByRole.technicians.length > 0}
					<div>
						<div class="mb-8 flex items-center justify-center gap-2">
							<Badge variant="outline" class="bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 border-indigo-500/40 px-4 py-2 font-medium">
								<Icon icon="tabler:tool" class="mr-2 h-4 w-4" />
								Techniker
							</Badge>
						</div>
						<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
							{#each teamByRole.technicians as member}
								<Card class="group rounded-2xl border border-border/60 bg-card/60 shadow-sm backdrop-blur-sm transition-all duration-300 hover:border-indigo-500/40 hover:shadow-lg hover:shadow-indigo-500/5 hover:-translate-y-0.5">
									<CardContent class="p-6 text-center">
										<div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-500/15 text-lg font-bold text-indigo-600 dark:text-indigo-400 ring-2 ring-indigo-500/20 group-hover:ring-indigo-500/40 transition-all">
											{#if member.image}
												<img src={member.image} alt={`${member.firstName} ${member.lastName}`} class="h-full w-full rounded-full object-cover" />
											{:else}
												{getInitials(member.firstName, member.lastName)}
											{/if}
										</div>
										<h3 class="mb-1 text-sm font-semibold text-foreground">{getDisplayName(member.firstName, member.lastName)}</h3>
										<p class="text-xs font-medium text-foreground">{getMemberRoleLabel(member as MemberWithPosition)}</p>
										<p class="mt-0.5 text-xs text-muted-foreground">{getMemberRoleDescription(member as MemberWithPosition)}</p>
									</CardContent>
								</Card>
							{/each}
						</div>
					</div>
				{/if}
			</div>
		</div>
	</section>

	<!-- CTA Section -->
	<section class="relative overflow-hidden border-t">
		<div class="absolute inset-0 bg-gradient-to-br from-primary/8 via-background to-primary/8 dark:from-primary/5 dark:via-background dark:to-primary/5"></div>
		<div class="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_100%,var(--primary)/0.1,transparent)]"></div>
		<div class="container relative mx-auto px-4 py-24 sm:py-28">
			<div class="mx-auto max-w-3xl text-center">
				<Badge variant="outline" class="mb-6 bg-primary/10 text-primary border-primary/40 px-4 py-2 font-medium shadow-sm">
					<Icon icon="tabler:heart-handshake" class="mr-2 h-4 w-4" />
					Karriere
				</Badge>
				<h2 class="mb-4 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">Teil unseres Teams werden?</h2>
				<p class="mb-10 text-lg text-muted-foreground leading-relaxed sm:text-xl">
					Wir suchen leidenschaftliche Menschen, die mit uns die Zukunft des Hostings gestalten möchten.
				</p>
				<div class="flex flex-wrap justify-center gap-4">
					<a href="/careers">
						<Button size="lg" class="gap-2 px-8 py-6 text-lg shadow-md shadow-primary/20 transition-all hover:shadow-lg hover:shadow-primary/25">
							<Icon icon="tabler:briefcase" class="h-5 w-5" />
							Stellen ansehen
						</Button>
					</a>
					<a href="/support">
						<Button size="lg" variant="outline" class="gap-2 px-8 py-6 text-lg border-border/70 bg-background/80 hover:bg-background">
							<Icon icon="tabler:mail" class="h-5 w-5" />
							Kontakt aufnehmen
						</Button>
					</a>
					<a href="/register">
						<Button size="lg" variant="ghost" class="gap-2 px-8 py-6 text-lg">
							<Icon icon="tabler:user-plus" class="h-5 w-5" />
							Account erstellen
						</Button>
					</a>
				</div>
			</div>
		</div>
	</section>
</div>


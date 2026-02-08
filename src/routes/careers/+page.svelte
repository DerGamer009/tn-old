<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import Icon from '@iconify/svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Karriere bei TitanNode | Jobs</title>
	<meta name="description" content="Werde Teil des TitanNode Teams! Spannende Jobs in einem innovativen Hosting-Unternehmen." />
</svelte:head>

<div class="min-h-screen">
	<!-- Hero Section -->
	<section class="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-background py-20">
		<div class="container mx-auto px-4">
			<div class="mx-auto max-w-3xl text-center">
				<Badge variant="outline" class="mb-4 border-primary/50 text-primary">
					<Icon icon="tabler:briefcase" class="mr-1 h-3 w-3" />
					Karriere
				</Badge>
				<h1 class="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
					Arbeite an der
					<span class="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
						Zukunft des Hostings
					</span>
				</h1>
				<p class="text-lg text-muted-foreground md:text-xl">
					Werde Teil eines dynamischen Teams, das täglich daran arbeitet, die beste 
					Hosting-Erfahrung für tausende Kunden weltweit zu schaffen.
				</p>
			</div>
		</div>

		<!-- Decorative Elements -->
		<div class="absolute -top-24 right-0 h-96 w-96 rounded-full bg-primary/5 blur-3xl"></div>
		<div class="absolute -bottom-24 left-0 h-96 w-96 rounded-full bg-primary/5 blur-3xl"></div>
	</section>

	<!-- Why TitanNode -->
	<section class="py-20">
		<div class="container mx-auto px-4">
			<div class="mb-12 text-center">
				<h2 class="mb-4 text-3xl font-bold">Warum TitanNode?</h2>
				<p class="text-muted-foreground">
					Das macht uns zu einem großartigen Arbeitgeber
				</p>
			</div>

			<div class="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
				<Card class="border-border/50">
					<CardHeader>
						<Icon icon="tabler:home" class="h-10 w-10 text-primary mb-2" />
						<CardTitle>Remote-First</CardTitle>
					</CardHeader>
					<CardContent>
						<p class="text-sm text-muted-foreground">
							Arbeite von überall aus. Wir sind ein vollständig remote arbeitendes Team.
						</p>
					</CardContent>
				</Card>

				<Card class="border-border/50">
					<CardHeader>
						<Icon icon="tabler:clock" class="h-10 w-10 text-primary mb-2" />
						<CardTitle>Flexible Arbeitszeiten</CardTitle>
					</CardHeader>
					<CardContent>
						<p class="text-sm text-muted-foreground">
							Gestalte deine Arbeitszeit flexibel nach deinen persönlichen Bedürfnissen.
						</p>
					</CardContent>
				</Card>

				<Card class="border-border/50">
					<CardHeader>
						<Icon icon="tabler:coin" class="h-10 w-10 text-primary mb-2" />
						<CardTitle>Faire Vergütung</CardTitle>
					</CardHeader>
					<CardContent>
						<p class="text-sm text-muted-foreground">
							Wettbewerbsfähige Gehälter und attraktive Zusatzleistungen.
						</p>
					</CardContent>
				</Card>

				<Card class="border-border/50">
					<CardHeader>
						<Icon icon="tabler:rocket" class="h-10 w-10 text-primary mb-2" />
						<CardTitle>Persönliche Entwicklung</CardTitle>
					</CardHeader>
					<CardContent>
						<p class="text-sm text-muted-foreground">
							Weiterbildungsbudget und Zeit für persönliche Projekte.
						</p>
					</CardContent>
				</Card>

				<Card class="border-border/50">
					<CardHeader>
						<Icon icon="tabler:device-laptop" class="h-10 w-10 text-primary mb-2" />
						<CardTitle>Moderne Ausstattung</CardTitle>
					</CardHeader>
					<CardContent>
						<p class="text-sm text-muted-foreground">
							Hardware deiner Wahl und alle Tools, die du für deine Arbeit brauchst.
						</p>
					</CardContent>
				</Card>

				<Card class="border-border/50">
					<CardHeader>
						<Icon icon="tabler:users-group" class="h-10 w-10 text-primary mb-2" />
						<CardTitle>Starkes Team</CardTitle>
					</CardHeader>
					<CardContent>
						<p class="text-sm text-muted-foreground">
							Arbeite mit talentierten und motivierten Menschen zusammen.
						</p>
					</CardContent>
				</Card>
			</div>
		</div>
	</section>

	<!-- Open Positions -->
	<section class="bg-muted/30 py-20">
		<div class="container mx-auto px-4">
			<div class="mb-12 text-center">
				<h2 class="mb-4 text-3xl font-bold">Offene Stellen</h2>
				<p class="text-muted-foreground">
					Finde die perfekte Position für dich
				</p>
			</div>

			<div class="mx-auto max-w-4xl space-y-6">
				{#each data.jobs as job (job.slug)}
					<Card class="border-border/50 hover:border-primary/50 transition-all hover:shadow-lg">
						<CardContent class="p-6">
							<div class="flex items-start justify-between gap-4">
								<div class="flex-1">
									<div class="mb-2 flex items-center gap-2">
										<h3 class="text-xl font-semibold">{job.title}</h3>
										<Badge variant="outline" class="bg-green-500/10 text-green-700 dark:text-green-400">
											{job.employmentType}
										</Badge>
									</div>
									<p class="mb-4 text-sm text-muted-foreground">
										{job.shortDescription}
									</p>
									<div class="flex flex-wrap gap-2">
										<Badge variant="outline">
											<Icon icon="tabler:map-pin" class="mr-1 h-3 w-3" />
											{job.location}
										</Badge>
										{#each job.tags as tag}
											<Badge variant="outline">{tag}</Badge>
										{/each}
									</div>
								</div>
								<a href="/careers/{job.slug}">
									<Button>
										<Icon icon="tabler:arrow-right" class="h-4 w-4" />
									</Button>
								</a>
							</div>
						</CardContent>
					</Card>
				{/each}
			</div>
		</div>
	</section>

	<!-- Application Process -->
	<section class="py-20">
		<div class="container mx-auto px-4">
			<div class="mb-12 text-center">
				<h2 class="mb-4 text-3xl font-bold">Bewerbungsprozess</h2>
				<p class="text-muted-foreground">
					So einfach geht's
				</p>
			</div>

			<div class="mx-auto max-w-4xl">
				<div class="space-y-8">
					<div class="flex gap-4">
						<div class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
							1
						</div>
						<div class="flex-1">
							<h3 class="mb-2 font-semibold text-lg">Bewerbung einreichen</h3>
							<p class="text-sm text-muted-foreground">
								Schicke uns deinen Lebenslauf und ein kurzes Anschreiben per E-Mail an jobs@titannode.com
							</p>
						</div>
					</div>

					<div class="flex gap-4">
						<div class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
							2
						</div>
						<div class="flex-1">
							<h3 class="mb-2 font-semibold text-lg">Erstes Gespräch</h3>
							<p class="text-sm text-muted-foreground">
								Wir lernen uns in einem kurzen Video-Call kennen und klären erste Fragen.
							</p>
						</div>
					</div>

					<div class="flex gap-4">
						<div class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
							3
						</div>
						<div class="flex-1">
							<h3 class="mb-2 font-semibold text-lg">Technisches Interview</h3>
							<p class="text-sm text-muted-foreground">
								Je nach Position führen wir ein technisches Interview oder eine praktische Aufgabe durch.
							</p>
						</div>
					</div>

					<div class="flex gap-4">
						<div class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
							4
						</div>
						<div class="flex-1">
							<h3 class="mb-2 font-semibold text-lg">Willkommen im Team!</h3>
							<p class="text-sm text-muted-foreground">
								Nach erfolgreicher Bewerbung bekommst du dein Angebot und wir freuen uns auf die Zusammenarbeit.
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- CTA -->
	<section class="border-t bg-gradient-to-br from-primary/5 to-background py-20">
		<div class="container mx-auto px-4">
			<div class="mx-auto max-w-3xl text-center">
				<h2 class="mb-4 text-3xl font-bold">Keine passende Stelle dabei?</h2>
				<p class="mb-8 text-lg text-muted-foreground">
					Wir sind immer auf der Suche nach talentierten Menschen. Schick uns eine 
					Initiativbewerbung an jobs@titannode.com
				</p>
				<div class="flex flex-wrap justify-center gap-4">
					<a href="mailto:jobs@titannode.com">
						<Button size="lg" class="gap-2">
							<Icon icon="tabler:mail" class="h-5 w-5" />
							Initiativbewerbung senden
						</Button>
					</a>
					<a href="/our-team">
						<Button size="lg" variant="outline" class="gap-2">
							<Icon icon="tabler:users-group" class="h-5 w-5" />
							Unser Team kennenlernen
						</Button>
					</a>
				</div>
			</div>
		</div>
	</section>
</div>


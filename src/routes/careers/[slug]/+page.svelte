<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import Icon from '@iconify/svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let job = $derived(data.job);
</script>

<svelte:head>
	<title>{job.title} | Karriere TitanNode</title>
	<meta name="description" content={job.shortDescription} />
</svelte:head>

<div class="min-h-screen">
	<!-- Header -->
	<section class="border-b bg-muted/30 py-12">
		<div class="container mx-auto px-4">
			<a href="/careers" class="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
				<Icon icon="tabler:arrow-left" class="h-4 w-4" />
				Zurück zu allen Stellen
			</a>
			<div class="flex flex-wrap items-start justify-between gap-4">
				<div>
					<h1 class="mb-2 text-3xl font-bold tracking-tight sm:text-4xl">{job.title}</h1>
					<p class="mb-4 text-lg text-muted-foreground">{job.shortDescription}</p>
					<div class="flex flex-wrap gap-2">
						<Badge variant="outline" class="bg-green-500/10 text-green-700 dark:text-green-400">
							{job.employmentType}
						</Badge>
						<Badge variant="outline">
							<Icon icon="tabler:map-pin" class="mr-1 h-3 w-3" />
							{job.location}
						</Badge>
						{#each job.tags as tag}
							<Badge variant="outline">{tag}</Badge>
						{/each}
					</div>
				</div>
				<a href="/careers/{job.slug}/bewerben">
					<Button size="lg" class="gap-2">
						<Icon icon="tabler:send" class="h-5 w-5" />
						Jetzt bewerben
					</Button>
				</a>
			</div>
		</div>
	</section>

	<!-- Content -->
	<section class="py-12">
		<div class="container mx-auto px-4">
			<div class="mx-auto max-w-3xl space-y-10">
				<Card class="border-border/50">
					<CardHeader>
						<CardTitle>Über die Stelle</CardTitle>
					</CardHeader>
					<CardContent>
						<div class="prose prose-neutral dark:prose-invert max-w-none text-muted-foreground">
							{@html job.description.split('\n').map((p) => p.trim()).filter(Boolean).map((p) => `<p>${p}</p>`).join('')}
						</div>
					</CardContent>
				</Card>

				<Card class="border-border/50">
					<CardHeader>
						<CardTitle>Anforderungen</CardTitle>
						<CardDescription>Das bringen wir mit</CardDescription>
					</CardHeader>
					<CardContent>
						<ul class="list-inside list-disc space-y-2 text-muted-foreground">
							{#each job.requirements as req}
								<li>{req}</li>
							{/each}
						</ul>
					</CardContent>
				</Card>

				<Card class="border-border/50">
					<CardHeader>
						<CardTitle>Das bieten wir</CardTitle>
						<CardDescription>Deine Vorteile bei uns</CardDescription>
					</CardHeader>
					<CardContent>
						<ul class="list-inside list-disc space-y-2 text-muted-foreground">
							{#each job.benefits as benefit}
								<li>{benefit}</li>
							{/each}
						</ul>
					</CardContent>
				</Card>

				<div class="flex justify-center pt-4">
					<a href="/careers/{job.slug}/bewerben">
						<Button size="lg" class="gap-2">
							<Icon icon="tabler:send" class="h-5 w-5" />
							Bewerbung einreichen
						</Button>
					</a>
				</div>
			</div>
		</div>
	</section>
</div>

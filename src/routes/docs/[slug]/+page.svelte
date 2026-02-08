<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import Icon from '@iconify/svelte';
	import { categories } from '$lib/docs';
	import { tick } from 'svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let article = $derived(data.article);
	let categoryLabel = $derived(categories.find((c) => c.id === article.category)?.name ?? article.category);

	let contentContainer: HTMLDivElement | undefined = $state();

	function copyCodeBlock(pre: HTMLPreElement) {
		const text = pre.querySelector('code')?.textContent ?? pre.textContent ?? '';
		navigator.clipboard.writeText(text.trim()).then(() => {
			const btn = pre.parentElement?.querySelector('[data-copy-btn]');
			if (btn) {
				const orig = btn.textContent;
				btn.textContent = 'Kopiert!';
				btn.classList.add('opacity-100');
				setTimeout(() => {
					btn.textContent = orig;
					btn.classList.remove('opacity-100');
				}, 2000);
			}
		});
	}

	$effect(() => {
		if (!article.content || !contentContainer) return;
		tick().then(() => {
			const pres = contentContainer!.querySelectorAll('pre');
			pres.forEach((pre) => {
				if (pre.closest('[data-code-block]')) return;
				const wrapper = document.createElement('div');
				wrapper.setAttribute('data-code-block', '');
				wrapper.className = 'relative group mt-4';
				pre.parentNode?.insertBefore(wrapper, pre);
				wrapper.appendChild(pre);
				const btn = document.createElement('button');
				btn.setAttribute('data-copy-btn', '');
				btn.type = 'button';
				btn.className =
					'absolute right-2 top-2 rounded border border-border/60 bg-muted/80 px-2 py-1 text-xs opacity-0 transition-opacity hover:opacity-100 focus:opacity-100 focus:outline-none group-hover:opacity-100';
				btn.textContent = 'Kopieren';
				btn.addEventListener('click', () => copyCodeBlock(pre));
				wrapper.appendChild(btn);
			});
		});
	});
</script>

<svelte:head>
	<title>{article.title} | Dokumentation TitanNode</title>
	<meta name="description" content={article.description} />
</svelte:head>

<div class="min-h-screen">
	<!-- Header -->
	<section class="border-b bg-muted/30 py-12">
		<div class="container mx-auto px-4">
			<nav class="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
				<a href="/docs" class="hover:text-foreground">Dokumentation</a>
				<Icon icon="tabler:chevron-right" class="h-4 w-4" />
				<span class="text-foreground">{article.title}</span>
			</nav>
			<a
				href="/docs"
				class="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
			>
				<Icon icon="tabler:arrow-left" class="h-4 w-4" />
				Zurück zur Übersicht
			</a>
			<div class="flex flex-wrap items-start gap-4">
				<div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10">
					<Icon icon={article.icon} class="h-8 w-8 text-primary" />
				</div>
				<div>
					<h1 class="mb-2 text-3xl font-bold tracking-tight sm:text-4xl">{article.title}</h1>
					<p class="mb-4 text-lg text-muted-foreground">{article.description}</p>
					<div class="flex flex-wrap items-center gap-3">
						<Badge variant="secondary">{categoryLabel}</Badge>
						<span class="flex items-center gap-1.5 text-sm text-muted-foreground">
							<Icon icon="tabler:clock" class="h-4 w-4" />
							{article.readTime} Lesezeit
						</span>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- Content -->
	<section class="py-12">
		<div class="container mx-auto px-4">
			<div class="mx-auto max-w-3xl">
				<Card class="border-border/50">
					<CardContent class="prose prose-neutral dark:prose-invert max-w-none pt-6">
						{#if article.content}
							<div bind:this={contentContainer} class="doc-article-content">
								{@html article.content}
							</div>
						{:else}
							<p class="text-muted-foreground">
								Dieser Artikel wird gerade erstellt. In Kürze finden Sie hier eine ausführliche Anleitung zu
								<strong>{article.title}</strong>.
							</p>
							<p class="mt-4 text-muted-foreground">
								Bis dahin hilft unser Support-Team gerne weiter:
								<a href="/support" class="text-primary underline hover:no-underline">Support kontaktieren</a>.
							</p>
						{/if}
					</CardContent>
				</Card>

				<div class="mt-8 flex flex-wrap gap-4">
					<a href="/docs">
						<Button variant="outline" class="gap-2">
							<Icon icon="tabler:arrow-left" class="h-4 w-4" />
							Alle Artikel
						</Button>
					</a>
					<a href="/support">
						<Button class="gap-2">
							<Icon icon="tabler:help-circle" class="h-4 w-4" />
							Support
						</Button>
					</a>
				</div>
			</div>
		</div>
	</section>
</div>

<style>
	.doc-article-content pre {
		user-select: text;
		-webkit-user-select: text;
		-moz-user-select: text;
		-ms-user-select: text;
		cursor: text;
		padding: 1rem 1.25rem;
		padding-top: 2.25rem;
		overflow-x: auto;
		background: var(--muted);
		border-radius: 0.375rem;
		border: 1px solid var(--border);
	}
	.doc-article-content pre code {
		user-select: text;
		background: transparent;
		padding: 0;
		font-size: 0.875rem;
	}
	.doc-article-content :global(code:not(pre code)) {
		user-select: all;
		padding: 0.15em 0.4em;
		background: var(--muted);
		border-radius: 0.25rem;
		font-size: 0.875em;
	}
</style>

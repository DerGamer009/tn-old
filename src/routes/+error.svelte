<script lang="ts">
	import { page } from '$app/stores';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import {
		Home,
		Server,
		Gamepad2,
		Cloud,
		Headphones,
		ArrowLeft,
		AlertCircle
	} from '@lucide/svelte';

	const quickLinks = [
		{ name: 'Startseite', href: '/', icon: Home },
		{ name: 'VPS Hosting', href: '/vps', icon: Server },
		{ name: 'Gameserver', href: '/gameserver', icon: Gamepad2 },
		{ name: 'App Hosting', href: '/app-hosting', icon: Cloud },
		{ name: 'Support', href: '/support', icon: Headphones }
	];
</script>

<svelte:head>
	<title>{$page.status} - {$page.status === 404 ? 'Seite nicht gefunden' : 'Fehler'} | TitanNode</title>
</svelte:head>

<div class="flex min-h-screen flex-col items-center justify-center px-4 py-16">
	<div class="mx-auto max-w-2xl text-center">
		<!-- Error Icon & Code -->
		<div class="mb-8 flex justify-center">
			<div
				class="flex h-32 w-32 items-center justify-center rounded-full bg-primary/10 ring-8 ring-primary/5"
			>
				<AlertCircle class="h-16 w-16 text-primary" />
			</div>
		</div>

		<!-- Error Code -->
		<div
			class="mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-8xl font-bold text-transparent sm:text-9xl"
		>
			{$page.status}
		</div>

		<!-- Error Message -->
		<h1 class="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
			{#if $page.status === 404}
				Seite nicht gefunden
			{:else if $page.status === 500}
				Interner Serverfehler
			{:else}
				Ein Fehler ist aufgetreten
			{/if}
		</h1>

		<p class="mb-8 text-lg text-muted-foreground">
			{#if $page.status === 404}
				Die gesuchte Seite existiert nicht oder wurde verschoben. 
				Vielleicht findest du, was du suchst, über die Links unten.
			{:else if $page.status === 500}
				Ups! Da ist etwas auf unserer Seite schiefgelaufen. 
				Unser Team wurde bereits benachrichtigt.
			{:else}
				{$page.error?.message || 'Ein unerwarteter Fehler ist aufgetreten.'}
			{/if}
		</p>

		<!-- Action Buttons -->
		<div class="mb-16 flex flex-col gap-4 sm:flex-row sm:justify-center">
			<Button size="lg" href="/" class="gap-2">
				<Home class="h-5 w-5" />
				Zur Startseite
			</Button>
			<Button size="lg" variant="outline" onclick={() => window.history.back()} class="gap-2">
				<ArrowLeft class="h-5 w-5" />
				Zurück
			</Button>
		</div>

		<!-- Quick Links -->
		<div class="mx-auto max-w-4xl">
			<h2 class="mb-6 text-xl font-semibold text-foreground">Schnellzugriff</h2>
			<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{#each quickLinks as link}
					<a href={link.href} class="group">
						<Card
							class="border-border/50 transition-all hover:border-primary/50 hover:shadow-lg"
						>
							<CardHeader class="pb-4">
								<div class="flex items-center gap-3">
									<div
										class="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/20"
									>
										<svelte:component this={link.icon} class="h-5 w-5 text-primary" />
									</div>
									<CardTitle class="text-base group-hover:text-primary transition-colors">
										{link.name}
									</CardTitle>
								</div>
							</CardHeader>
						</Card>
					</a>
				{/each}
			</div>
		</div>

		<!-- Help Section -->
		{#if $page.status === 404}
			<div class="mt-12 rounded-lg border bg-muted/50 p-6">
				<p class="text-sm text-muted-foreground">
					<strong>Tipp:</strong> Falls du einen toten Link gefunden hast, 
					<a href="/support" class="text-primary hover:underline">lass es uns wissen</a>, 
					damit wir ihn beheben können.
				</p>
			</div>
		{/if}

		<!-- Server Status for 500 errors -->
		{#if $page.status === 500}
			<div class="mt-12 rounded-lg border bg-muted/50 p-6">
				<p class="text-sm text-muted-foreground">
					Prüfe den <a href="https://status.titannode.org/" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">System-Status (status.titannode.org)</a>. 
					Problem besteht weiterhin? 
					<a href="/support" class="text-primary hover:underline">Kontaktiere unseren Support</a>
					für schnelle Hilfe.
				</p>
			</div>
		{/if}
	</div>
</div>

<style>
	/* Optional: Custom animation for error icon */
	@keyframes pulse-scale {
		0%,
		100% {
			transform: scale(1);
		}
		50% {
			transform: scale(1.05);
		}
	}

	:global(.h-32.w-32) {
		animation: pulse-scale 2s ease-in-out infinite;
	}
</style>


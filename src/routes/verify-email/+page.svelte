<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import Icon from '@iconify/svelte';

	let { data } = $props();
	let verifying = $state(true);
	let success = $state(false);
	let error = $state('');

	onMount(async () => {
		const token = $page.url.searchParams.get('token');

		if (!token) {
			error = 'Kein Verification-Token gefunden';
			verifying = false;
			return;
		}

		try {
			const response = await fetch('/api/verify-email', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ token })
			});

			const result = await response.json();

			if (response.ok && result.success) {
				success = true;
				// Nach 3 Sekunden zum Dashboard weiterleiten
				setTimeout(() => {
					goto('/dashboard');
				}, 3000);
			} else {
				error = result.error || 'Verifizierung fehlgeschlagen';
			}
		} catch (err) {
			error = 'Ein Fehler ist aufgetreten';
			console.error(err);
		} finally {
			verifying = false;
		}
	});
</script>

<svelte:head>
	<title>Email verifizieren - TitanNode</title>
</svelte:head>

<div class="flex min-h-screen items-center justify-center p-4">
	<Card class="w-full max-w-md">
		<CardHeader class="text-center">
			{#if verifying}
				<div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
					<Icon icon="tabler:loader-2" class="h-8 w-8 animate-spin text-primary" />
				</div>
				<CardTitle>Email wird verifiziert...</CardTitle>
				<CardDescription>Bitte warten Sie einen Moment</CardDescription>
			{:else if success}
				<div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
					<Icon icon="tabler:circle-check" class="h-8 w-8 text-green-500" />
				</div>
				<CardTitle class="text-green-500">Email erfolgreich verifiziert!</CardTitle>
				<CardDescription>Sie werden zum Dashboard weitergeleitet...</CardDescription>
			{:else if error}
				<div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
					<Icon icon="tabler:circle-x" class="h-8 w-8 text-red-500" />
				</div>
				<CardTitle class="text-red-500">Verifizierung fehlgeschlagen</CardTitle>
				<CardDescription>{error}</CardDescription>
			{/if}
		</CardHeader>

		{#if !verifying}
			<CardContent class="space-y-4">
				{#if success}
				<div class="rounded-lg bg-green-500/10 p-4 text-center text-sm text-green-700 dark:text-green-400">
					<p class="mb-2">✅ Ihre Email-Adresse wurde bestätigt!</p>
					<p class="text-xs">
						Sie können jetzt alle Funktionen von TitanNode nutzen.
					</p>
				</div>
					<Button class="w-full" href="/dashboard">
						Zum Dashboard
						<Icon icon="tabler:arrow-right" class="ml-2 h-4 w-4" />
					</Button>
				{:else}
					<div class="rounded-lg bg-red-500/10 p-4 text-sm text-red-700 dark:text-red-400">
						<p class="mb-2">❌ {error}</p>
						<p class="text-xs">
							Mögliche Gründe:
						</p>
						<ul class="mt-2 list-inside list-disc text-xs">
							<li>Der Link ist abgelaufen (24 Stunden)</li>
							<li>Der Link wurde bereits verwendet</li>
							<li>Der Link ist ungültig</li>
						</ul>
					</div>
					<div class="flex gap-2">
						<Button variant="outline" class="flex-1" href="/login">
							Zum Login
						</Button>
						<Button class="flex-1" href="/register">
							Neu registrieren
						</Button>
					</div>
				{/if}
			</CardContent>
		{/if}
	</Card>
</div>


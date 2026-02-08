<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import Icon from '@iconify/svelte';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
</script>

<svelte:head>
	<title>Passwort vergessen - TitanNode</title>
</svelte:head>

<div class="grid min-h-screen lg:grid-cols-2">
	<div class="flex items-center justify-center p-4 sm:p-8">
		<div class="w-full max-w-md space-y-8">
			<div class="text-center">
				<h1 class="text-4xl font-bold">TitanNode</h1>
				<p class="mt-2 text-muted-foreground">Passwort zurücksetzen</p>
			</div>

			{#if form?.error}
				<div class="rounded-lg border border-red-500/50 bg-red-500/10 p-4">
					<div class="flex items-center gap-2">
						<Icon icon="tabler:alert-circle" class="h-5 w-5 shrink-0 text-red-500" />
						<p class="text-sm text-red-700 dark:text-red-400">{form.error}</p>
					</div>
				</div>
			{/if}

			{#if form?.success}
				<div class="rounded-lg border border-green-500/50 bg-green-500/10 p-4">
					<div class="flex items-center gap-2">
						<Icon icon="tabler:circle-check" class="h-5 w-5 shrink-0 text-green-500" />
						<p class="text-sm text-green-700 dark:text-green-400">{form.message}</p>
					</div>
				</div>
				<Button variant="outline" class="w-full" href="/login">
					<Icon icon="tabler:arrow-left" class="mr-2 h-4 w-4" />
					Zurück zum Login
				</Button>
			{:else}
				<Card>
					<CardHeader>
						<CardTitle>Passwort vergessen?</CardTitle>
						<CardDescription>
							Gib deine E-Mail-Adresse ein. Wir senden dir einen Link zum Zurücksetzen des Passworts (gültig 1 Stunde).
						</CardDescription>
					</CardHeader>
					<CardContent>
						<form
							method="POST"
							use:enhance
							class="space-y-4"
						>
							<div class="space-y-2">
								<Label for="email">E-Mail</Label>
								<Input
									id="email"
									name="email"
									type="email"
									placeholder="max@example.com"
									value={form?.email ?? ''}
									required
									autocomplete="email"
								/>
							</div>
							<Button type="submit" class="w-full">
								<Icon icon="tabler:mail-forward" class="mr-2 h-4 w-4" />
								Link senden
							</Button>
						</form>
						<p class="mt-6 text-center text-sm text-muted-foreground">
							<a href="/login" class="text-primary hover:underline">Zurück zum Login</a>
						</p>
					</CardContent>
				</Card>
			{/if}
		</div>
	</div>

	<div class="hidden lg:block">
		<div
			class="flex h-full items-center justify-center bg-gradient-to-br from-primary/20 via-primary/10 to-background p-8"
		>
			<div class="max-w-md space-y-6 text-center">
				<Icon icon="tabler:key" class="mx-auto h-32 w-32 text-primary" />
				<h2 class="text-3xl font-bold">Sicher unterwegs</h2>
				<p class="text-lg text-muted-foreground">
					Du hast dein Passwort vergessen? Kein Problem – mit dem Link aus der E-Mail setzt du in wenigen Schritten ein neues.
				</p>
			</div>
		</div>
	</div>
</div>

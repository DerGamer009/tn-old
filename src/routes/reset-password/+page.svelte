<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import Icon from '@iconify/svelte';
	import type { ActionData } from './$types';
	import type { PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	// Token nur aus data (Load), damit Server und Client identisch rendern → kein Hydration-Mismatch
	const tokenFromData = $derived(data?.token ?? '');
	const token = $derived(tokenFromData || (form?.token ?? ''));
</script>

<svelte:head>
	<title>Neues Passwort setzen - TitanNode</title>
</svelte:head>

<div class="grid min-h-screen lg:grid-cols-2">
	<div class="flex items-center justify-center p-4 sm:p-8">
		<div class="w-full max-w-md space-y-8">
			<div class="text-center">
				<h1 class="text-4xl font-bold">TitanNode</h1>
				<p class="mt-2 text-muted-foreground">Neues Passwort setzen</p>
			</div>

			{#if !token && !form?.success}
				<div class="rounded-lg border border-amber-500/50 bg-amber-500/10 p-4">
					<div class="flex items-center gap-2">
						<Icon icon="tabler:alert-triangle" class="h-5 w-5 shrink-0 text-amber-500" />
						<p class="text-sm text-amber-700 dark:text-amber-400">
							Kein gültiger Link. Bitte öffne den Link aus der E-Mail oder
							<a href="/forgot-password" class="underline">fordere einen neuen an</a>.
						</p>
					</div>
				</div>
				<Button class="w-full" href="/forgot-password">
					Link anfordern
				</Button>
			{:else if form?.error}
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
				<Button class="w-full" href="/login">
					<Icon icon="tabler:login" class="mr-2 h-4 w-4" />
					Zum Login
				</Button>
			{:else if token}
				<Card>
					<CardHeader>
						<CardTitle>Neues Passwort</CardTitle>
						<CardDescription>
							Gib dein neues Passwort ein (mindestens 8 Zeichen).
						</CardDescription>
					</CardHeader>
					<CardContent>
						<form method="POST" use:enhance class="space-y-4">
							<input type="hidden" name="token" value={token} />
							<div class="space-y-2">
								<Label for="password">Neues Passwort</Label>
								<Input
									id="password"
									name="password"
									type="password"
									placeholder="••••••••"
									required
									minlength={8}
									autocomplete="new-password"
								/>
							</div>
							<div class="space-y-2">
								<Label for="confirmPassword">Passwort bestätigen</Label>
								<Input
									id="confirmPassword"
									name="confirmPassword"
									type="password"
									placeholder="••••••••"
									required
									minlength={8}
									autocomplete="new-password"
								/>
							</div>
							<Button type="submit" class="w-full">
								<Icon icon="tabler:lock" class="mr-2 h-4 w-4" />
								Passwort ändern
							</Button>
						</form>
						<p class="mt-6 text-center text-sm text-muted-foreground">
							<a href="/login" class="text-primary hover:underline">Zurück zum Login</a>
						</p>
					</CardContent>
				</Card>
			{/if}

			{#if token || form?.success}
				<p class="text-center text-sm text-muted-foreground">
					<a href="/forgot-password" class="text-primary hover:underline">Passwort vergessen?</a>
				</p>
			{/if}
		</div>
	</div>

	<div class="hidden lg:block">
		<div
			class="flex h-full items-center justify-center bg-gradient-to-br from-primary/20 via-primary/10 to-background p-8"
		>
			<div class="max-w-md space-y-6 text-center">
				<Icon icon="tabler:lock-open" class="mx-auto h-32 w-32 text-primary" />
				<h2 class="text-3xl font-bold">Neues Passwort</h2>
				<p class="text-lg text-muted-foreground">
					Wähle ein sicheres Passwort, das du nirgendwo anders verwendest.
				</p>
			</div>
		</div>
	</div>
</div>

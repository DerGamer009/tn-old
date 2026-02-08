<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Separator } from '$lib/components/ui/separator';
	import Icon from '@iconify/svelte';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();

	let resending = $state(false);
	let resendSuccess = $state(false);
	let resendError = $state('');

	async function resendVerificationEmail(email: string) {
		resending = true;
		resendSuccess = false;
		resendError = '';

		try {
			const response = await fetch('/api/resend-verification', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email })
			});

			const result = await response.json();

			if (response.ok && result.success) {
				resendSuccess = true;
				setTimeout(() => {
					resendSuccess = false;
				}, 5000);
			} else {
				resendError = result.error || 'Fehler beim Senden';
			}
		} catch (error) {
			console.error('Error resending email:', error);
			resendError = 'Ein Fehler ist aufgetreten';
		} finally {
			resending = false;
		}
	}
</script>

<svelte:head>
	<title>Login - TitanNode</title>
</svelte:head>

<div class="grid min-h-screen lg:grid-cols-2">
	<!-- Left Side - Login Form -->
	<div class="flex items-center justify-center p-4 sm:p-8">
		<div class="w-full max-w-md space-y-8">
			<!-- Logo & Header -->
			<div class="text-center">
				<h1 class="text-4xl font-bold">TitanNode</h1>
				<p class="mt-2 text-muted-foreground">Willkommen zurück</p>
			</div>

			<!-- Error Message -->
			{#if form?.error}
				<div class="rounded-lg border border-red-500/50 bg-red-500/10 p-4">
					<div class="flex items-center gap-2">
						<Icon icon="tabler:alert-circle" class="h-5 w-5 text-red-500" />
						<p class="text-sm text-red-700 dark:text-red-400">{form.error}</p>
					</div>
					
					<!-- Resend Email Option -->
					{#if (form as any).needsVerification && form.email}
						<div class="mt-3 flex items-center gap-2 border-t border-red-500/20 pt-3">
							<button
								class="text-xs text-red-700 underline hover:text-red-600 disabled:opacity-50 dark:text-red-400 dark:hover:text-red-300"
								onclick={() => resendVerificationEmail(form?.email || '')}
								disabled={resending}
							>
								{resending ? 'Sendet...' : 'Bestätigungs-Email erneut senden'}
							</button>
						</div>
						{#if resendSuccess}
							<p class="mt-2 text-xs text-green-600 dark:text-green-500">✓ Email wurde gesendet!</p>
						{/if}
						{#if resendError}
							<p class="mt-2 text-xs text-red-600 dark:text-red-500">{resendError}</p>
						{/if}
					{/if}
				</div>
			{/if}

			<!-- Login Form -->
			<Card>
				<CardHeader>
					<CardTitle>Anmelden</CardTitle>
					<CardDescription>Melde dich mit deinem Account an</CardDescription>
				</CardHeader>
				<CardContent>
					<form method="POST" use:enhance={({ formData }) => {
						return async ({ update, result }) => {
							// Bei Redirect: manuell navigieren
							if (result.type === 'redirect') {
								await goto(result.location, { invalidateAll: true });
								return;
							}
							// Bei Fehlern: update aufrufen um Form-Fehler anzuzeigen
							await update();
						};
					}} class="space-y-4">
						<!-- Email -->
						<div class="space-y-2">
							<Label for="email">E-Mail</Label>
							<Input
								id="email"
								name="email"
								type="email"
								placeholder="max@example.com"
								value={form?.email || ''}
								required
								autocomplete="email"
							/>
						</div>

						<!-- Password -->
						<div class="space-y-2">
							<div class="flex items-center justify-between">
								<Label for="password">Passwort</Label>
								<a href="/forgot-password" class="text-sm text-primary hover:underline">
									Passwort vergessen?
								</a>
							</div>
							<Input
								id="password"
								name="password"
								type="password"
								placeholder="••••••••"
								required
								autocomplete="current-password"
							/>
						</div>

						<!-- Submit Button -->
						<Button type="submit" class="w-full">
							<Icon icon="tabler:login" class="mr-2 h-4 w-4" />
							Anmelden
						</Button>
					</form>

					<!-- Divider -->
					<div class="relative my-6">
						<Separator />
						<span
							class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground"
						>
							Oder
						</span>
					</div>

					<!-- Social Login -->
					<div class="grid gap-3">
						<a href="/auth/google" class="w-full">
							<Button variant="outline" type="button" class="w-full">
								<Icon icon="tabler:brand-google" class="mr-2 h-4 w-4" />
								Mit Google anmelden
							</Button>
						</a>
						<a href="/auth/github" class="w-full">
							<Button variant="outline" type="button" class="w-full">
								<Icon icon="tabler:brand-github" class="mr-2 h-4 w-4" />
								Mit GitHub anmelden
							</Button>
						</a>
					</div>

					<!-- Register Link -->
					<p class="mt-6 text-center text-sm text-muted-foreground">
						Noch kein Account?
						<a href="/register" class="text-primary hover:underline">Jetzt registrieren</a>
					</p>
				</CardContent>
			</Card>
		</div>
	</div>

	<!-- Right Side - Hero Image/Gradient -->
	<div class="hidden lg:block">
		<div
			class="flex h-full items-center justify-center bg-gradient-to-br from-primary/20 via-primary/10 to-background p-8"
		>
			<div class="max-w-md space-y-6 text-center">
				<Icon icon="tabler:server-2" class="mx-auto h-32 w-32 text-primary" />
				<h2 class="text-3xl font-bold">Leistungsstarkes Hosting</h2>
				<p class="text-lg text-muted-foreground">
					VPS, Gameserver und App Hosting - Alles aus einer Hand. Zuverlässig, schnell und
					skalierbar.
				</p>
				<div class="flex justify-center gap-4 pt-4">
					<div class="text-center">
						<div class="text-2xl font-bold text-primary">99.9%</div>
						<div class="text-sm text-muted-foreground">Uptime</div>
					</div>
					<div class="text-center">
						<div class="text-2xl font-bold text-primary">24/7</div>
						<div class="text-sm text-muted-foreground">Support</div>
					</div>
					<div class="text-center">
						<div class="text-2xl font-bold text-primary">10k+</div>
						<div class="text-sm text-muted-foreground">Kunden</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

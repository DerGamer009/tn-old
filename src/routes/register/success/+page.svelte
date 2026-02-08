<script lang="ts">
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import Icon from '@iconify/svelte';
	import { page } from '$app/stores';

	let resending = $state(false);
	let resendSuccess = $state(false);
	let resendError = $state('');

	async function resendEmail() {
		resending = true;
		resendSuccess = false;
		resendError = '';

		// Email aus URL-Parameter holen (wenn vorhanden)
		const email = $page.url.searchParams.get('email');

		try {
			const response = await fetch('/api/resend-verification', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email })
			});

			const result = await response.json();

			if (response.ok && result.success) {
				resendSuccess = true;
				// Success-Nachricht nach 5 Sekunden ausblenden
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
	<title>Registrierung erfolgreich - TitanNode</title>
</svelte:head>

<div class="flex min-h-screen items-center justify-center p-4">
	<Card class="w-full max-w-lg">
		<CardHeader class="text-center">
			<div class="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10">
				<Icon icon="tabler:circle-check" class="h-12 w-12 text-green-500" />
			</div>
			<CardTitle class="text-2xl">Registrierung erfolgreich!</CardTitle>
			<CardDescription class="text-base">Nur noch ein Schritt zur Aktivierung</CardDescription>
		</CardHeader>

		<CardContent class="space-y-6">
			<!-- Email Verifizierung -->
			<div class="rounded-lg border border-primary/20 bg-primary/5 p-4">
				<div class="mb-3 flex items-center gap-3">
					<div class="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
						<Icon icon="tabler:mail" class="h-5 w-5 text-primary" />
					</div>
					<div>
						<h3 class="font-semibold">Email bestätigen</h3>
						<p class="text-sm text-muted-foreground">Erforderlich</p>
					</div>
				</div>
				<p class="text-sm text-muted-foreground">
					Wir haben dir eine Email mit einem Bestätigungslink geschickt. Bitte prüfe dein Postfach
					und klicke auf den Link, um deine Email-Adresse zu bestätigen.
				</p>
			</div>

			<!-- Info Box -->
			<div class="rounded-lg bg-blue-500/10 p-4 text-sm text-blue-700 dark:text-blue-400">
				<div class="mb-2 flex items-center gap-2">
					<Icon icon="tabler:info-circle" class="h-5 w-5" />
					<span class="font-semibold">Wichtig zu wissen</span>
				</div>
				<ul class="space-y-1 text-xs">
					<li>• Der Bestätigungslink ist 24 Stunden gültig</li>
					<li>• Prüfe auch deinen Spam-Ordner</li>
					<li>• Die Email-Bestätigung ist notwendig, um Services zu buchen</li>
				</ul>
			</div>

			<!-- Actions -->
			<div class="flex gap-2">
				<Button variant="outline" class="flex-1" href="/login">
					<Icon icon="tabler:login" class="mr-2 h-4 w-4" />
					Zum Login
				</Button>
				<Button variant="outline" class="flex-1" href="/">
					<Icon icon="tabler:home" class="mr-2 h-4 w-4" />
					Zur Startseite
				</Button>
			</div>

			<!-- Email nicht erhalten? -->
			<div class="text-center">
				<p class="text-sm text-muted-foreground">
					Email nicht erhalten?
					<button 
						class="text-primary hover:underline disabled:opacity-50"
						onclick={resendEmail}
						disabled={resending}
					>
						{resending ? 'Sendet...' : 'Erneut senden'}
					</button>
				</p>
				{#if resendSuccess}
					<p class="mt-2 text-sm text-green-600 dark:text-green-500">✓ Email wurde erneut gesendet!</p>
				{/if}
				{#if resendError}
					<p class="mt-2 text-sm text-red-600 dark:text-red-500">{resendError}</p>
				{/if}
			</div>
		</CardContent>
	</Card>
</div>


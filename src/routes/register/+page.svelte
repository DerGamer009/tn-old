<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Card, CardContent } from '$lib/components/ui/card';
	import { Separator } from '$lib/components/ui/separator';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Eye, EyeOff, UserPlus, Mail, Lock, Server, AlertCircle } from '@lucide/svelte';
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();

	let password = $state('');
	let confirmPassword = $state('');
	let showPassword = $state(false);
	let showConfirmPassword = $state(false);
	let isLoading = $state(false);

	// Password strength indicator
	let passwordStrength = $derived.by(() => {
		if (!password) return { strength: 0, label: '', color: '' };
		
		let strength = 0;
		if (password.length >= 8) strength++;
		if (password.length >= 12) strength++;
		if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
		if (/[0-9]/.test(password)) strength++;
		if (/[^a-zA-Z0-9]/.test(password)) strength++;
		
		if (strength <= 2) return { strength, label: 'Schwach', color: 'bg-red-500' };
		if (strength <= 3) return { strength, label: 'Mittel', color: 'bg-yellow-500' };
		return { strength, label: 'Stark', color: 'bg-green-500' };
	});
</script>

<svelte:head>
	<title>Registrieren - TitanNode</title>
	<meta name="description" content="Erstelle dein TitanNode-Konto und starte mit Premium Hosting." />
</svelte:head>

<div class="flex min-h-screen flex-col lg:flex-row">
	<!-- Left Side - Image/Info -->
	<div class="relative hidden flex-1 lg:flex">
		<div class="absolute inset-0 bg-gradient-to-br from-primary/90 to-accent/90"></div>
		<div class="relative flex h-full flex-col justify-center px-12 text-white">
			<div class="space-y-6">
				<h2 class="text-4xl font-bold">Starte noch heute</h2>
				<p class="text-lg opacity-90">
					Erstelle dein Konto in wenigen Sekunden und erhalte Zugriff auf unsere Premium
					Hosting-Lösungen.
				</p>
				<div class="space-y-4 pt-8">
					<div class="flex items-center gap-3">
						<div class="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
							✓
						</div>
						<span>Keine Einrichtungsgebühren</span>
					</div>
					<div class="flex items-center gap-3">
						<div class="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
							✓
						</div>
						<span>Monatlich kündbar</span>
					</div>
					<div class="flex items-center gap-3">
						<div class="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
							✓
						</div>
						<span>7 Tage Geld-zurück-Garantie</span>
					</div>
					<div class="flex items-center gap-3">
						<div class="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
							✓
						</div>
						<span>24/7 Premium Support</span>
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- Right Side - Form -->
	<div class="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:px-20 xl:px-24">
		<div class="mx-auto w-full max-w-sm lg:w-96">
			<!-- Logo & Title -->
			<div class="mb-8">
				<a href="/" class="flex items-center gap-2 text-2xl font-bold">
					<Server class="h-8 w-8 text-primary" />
					<span class="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
						TitanNode
					</span>
				</a>
				<h1 class="mt-6 text-3xl font-bold text-foreground">Konto erstellen</h1>
				<p class="mt-2 text-sm text-muted-foreground">
					Bereits registriert?
					<a href="/login" class="font-medium text-primary hover:underline">
						Jetzt anmelden
					</a>
				</p>
			</div>

			<!-- Register Form -->
			<Card>
				<CardContent class="pt-6">
					{#if form?.error}
						<div class="mb-4 flex items-center gap-2 rounded-lg border border-red-500 bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-400">
							<AlertCircle class="h-4 w-4 shrink-0" />
							<span>{form.error}</span>
						</div>
					{/if}
					
					<form method="POST" use:enhance={() => {
						isLoading = true;
						return async ({ update, result }) => {
							// Bei Redirect: manuell navigieren
							if (result.type === 'redirect') {
								isLoading = false;
								await goto(result.location, { invalidateAll: true });
								return;
							}
							// Bei Fehlern: update aufrufen um Form-Fehler anzuzeigen
							await update();
							isLoading = false;
						};
					}} class="space-y-4">
						<!-- Name Fields -->
						<div class="grid grid-cols-2 gap-4">
							<div class="space-y-2">
								<Label for="firstName">Vorname</Label>
								<Input
									id="firstName"
									name="firstName"
									type="text"
									placeholder="Max"
									value={form?.firstName ?? ''}
									required
								/>
							</div>
							<div class="space-y-2">
								<Label for="lastName">Nachname</Label>
								<Input
									id="lastName"
									name="lastName"
									type="text"
									placeholder="Mustermann"
									value={form?.lastName ?? ''}
									required
								/>
							</div>
						</div>

						<!-- Email -->
						<div class="space-y-2">
							<Label for="email">E-Mail</Label>
							<div class="relative">
								<Mail class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
								<Input
									id="email"
									name="email"
									type="email"
									placeholder="deine@email.de"
									class="pl-9"
									value={form?.email ?? ''}
									required
								/>
							</div>
						</div>

						<!-- Password -->
						<div class="space-y-2">
							<Label for="password">Passwort</Label>
							<div class="relative">
								<Lock class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
								<Input
									id="password"
									name="password"
									type={showPassword ? 'text' : 'password'}
									placeholder="Mindestens 8 Zeichen"
									class="pl-9 pr-9"
									bind:value={password}
									required
								/>
								<button
									type="button"
									onclick={() => (showPassword = !showPassword)}
									class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
								>
									{#if showPassword}
										<EyeOff class="h-4 w-4" />
									{:else}
										<Eye class="h-4 w-4" />
									{/if}
								</button>
							</div>
							
							<!-- Password Strength -->
							{#if password}
								<div class="space-y-1">
									<div class="flex gap-1">
										{#each Array(5) as _, i}
											<div class="h-1 flex-1 rounded-full bg-muted {i < passwordStrength.strength ? passwordStrength.color : ''}"></div>
										{/each}
									</div>
									<p class="text-xs text-muted-foreground">
										Passwortstärke: <span class="font-medium">{passwordStrength.label}</span>
									</p>
								</div>
							{/if}
						</div>

						<!-- Confirm Password -->
						<div class="space-y-2">
							<Label for="confirmPassword">Passwort bestätigen</Label>
							<div class="relative">
								<Lock class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
								<Input
									id="confirmPassword"
									name="confirmPassword"
									type={showConfirmPassword ? 'text' : 'password'}
									placeholder="Passwort wiederholen"
									class="pl-9 pr-9"
									bind:value={confirmPassword}
									required
								/>
								<button
									type="button"
									onclick={() => (showConfirmPassword = !showConfirmPassword)}
									class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
								>
									{#if showConfirmPassword}
										<EyeOff class="h-4 w-4" />
									{:else}
										<Eye class="h-4 w-4" />
									{/if}
								</button>
							</div>
							{#if confirmPassword && password !== confirmPassword}
								<p class="text-xs text-red-500">Passwörter stimmen nicht überein</p>
							{/if}
						</div>

						<!-- Terms Checkbox -->
						<div class="flex items-start space-x-2">
							<Checkbox id="terms" name="acceptTerms" required />
							<Label
								for="terms"
								class="text-sm font-normal leading-tight peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
							>
								Ich akzeptiere die
								<a href="/legal/terms" class="text-primary hover:underline">AGB</a>
								und die
								<a href="/legal/privacy" class="text-primary hover:underline">Datenschutzerklärung</a>
							</Label>
						</div>

						<!-- Submit Button -->
						<Button type="submit" class="w-full" disabled={isLoading}>
							{#if isLoading}
								<div class="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
								Registrierung...
							{:else}
								<UserPlus class="mr-2 h-4 w-4" />
								Konto erstellen
							{/if}
						</Button>
					</form>

					<!-- Divider -->
					<div class="relative my-6">
						<Separator />
						<span class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
							Oder registrieren mit
						</span>
					</div>

					<!-- Social Login -->
					<div class="grid grid-cols-2 gap-3">
						<a href="/auth/google">
							<Button variant="outline" type="button" class="w-full">
								<svg class="mr-2 h-4 w-4" viewBox="0 0 24 24">
									<path
										fill="currentColor"
										d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
									/>
								</svg>
								Google
							</Button>
						</a>
						<a href="/auth/github">
							<Button variant="outline" type="button" class="w-full">
								<svg class="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
									<path
										d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
									/>
								</svg>
								GitHub
							</Button>
						</a>
					</div>
				</CardContent>
			</Card>
		</div>
	</div>
</div>


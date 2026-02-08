<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import Icon from '@iconify/svelte';
	import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import * as InputOTP from '$lib/components/ui/input-otp/index.js';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();

	let mode = $state<'totp' | 'backup'>('totp');
	let otpValue = $state('');
	let backupCode = $state('');
</script>

<svelte:head>
	<title>2FA bestätigen - TitanNode</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center p-4">
	<Card class="w-full max-w-md border-border/60">
		<CardHeader>
			<div class="flex items-center gap-2">
				<div class="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
					<Icon icon="tabler:shield-lock" class="h-5 w-5 text-primary" />
				</div>
				<div>
					<CardTitle class="text-lg">Zwei-Faktor-Authentifizierung (2FA)</CardTitle>
					<CardDescription>
						Bestätige deine Anmeldung mit deiner Authenticator-App oder einem Backup-Code.
					</CardDescription>
				</div>
			</div>
		</CardHeader>
		<CardContent class="space-y-4">
			{#if form?.error}
				<div class="rounded-md border border-red-500/50 bg-red-500/10 px-3 py-2 text-xs text-red-700 dark:text-red-400">
					{form.error}
				</div>
			{/if}

			<div class="flex items-center gap-2 text-xs text-muted-foreground">
				<button
					type="button"
					class={mode === 'totp'
						? 'font-medium text-foreground'
						: 'cursor-pointer hover:text-foreground'}
					onclick={() => (mode = 'totp')}
				>
					Code aus Authenticator-App
				</button>
				<span>·</span>
				<button
					type="button"
					class={mode === 'backup'
						? 'font-medium text-foreground'
						: 'cursor-pointer hover:text-foreground'}
					onclick={() => (mode = 'backup')}
				>
					Backup-Code verwenden
				</button>
			</div>

			{#if mode === 'totp'}
				<form
					method="POST"
					use:enhance={({ formData }) => {
						formData.set('mode', 'totp');
						formData.set('code', otpValue);
						return async ({ update, result }) => {
							if (result.type === 'redirect') {
								await goto(result.location, { invalidateAll: true });
								return;
							}
							await update();
						};
					}}
					class="space-y-4"
				>
					<div class="space-y-2">
						<label class="text-xs font-medium text-muted-foreground" for="totp-code">
							Code aus der Authenticator-App
						</label>
						<div class="flex justify-center">
							<InputOTP.Root bind:value={otpValue} maxlength={6} id="totp-code">
								{#snippet children({ cells })}
									<InputOTP.Group>
										{#each cells.slice(0, 3) as cell (cell)}
											<InputOTP.Slot {cell} />
										{/each}
									</InputOTP.Group>
									<InputOTP.Separator />
									<InputOTP.Group>
										{#each cells.slice(3, 6) as cell (cell)}
											<InputOTP.Slot {cell} />
										{/each}
									</InputOTP.Group>
								{/snippet}
							</InputOTP.Root>
						</div>
					</div>
					<Button type="submit" class="w-full">
						<Icon icon="tabler:shield-check" class="mr-2 h-4 w-4" />
						Bestätigen
					</Button>
				</form>
			{:else}
				<form
					method="POST"
					use:enhance={({ formData }) => {
						formData.set('mode', 'backup');
						return async ({ update, result }) => {
							if (result.type === 'redirect') {
								await goto(result.location, { invalidateAll: true });
								return;
							}
							await update();
						};
					}}
					class="space-y-4"
				>
					<div class="space-y-2">
						<label class="text-xs font-medium text-muted-foreground" for="backup-code">
							Backup-Code
						</label>
						<Input
							id="backup-code"
							name="code"
							placeholder="XXXX-XXXX-XXXX"
							bind:value={backupCode}
							autocomplete="one-time-code"
							required
						/>
						<p class="text-xs text-muted-foreground">
							Kein Zugriff mehr auf deine Authenticator-App? Gib hier einen deiner Backup-Codes ein.
						</p>
					</div>
					<Button type="submit" class="w-full" variant="outline">
						<Icon icon="tabler:key" class="mr-2 h-4 w-4" />
						Mit Backup-Code bestätigen
					</Button>
				</form>
			{/if}
		</CardContent>
	</Card>
</div>


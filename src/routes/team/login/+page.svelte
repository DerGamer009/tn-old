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
	<title>Team Login - TitanNode</title>
</svelte:head>

<div class="flex min-h-screen items-center justify-center p-4 bg-muted/40">
	<Card class="w-full max-w-md">
		<CardHeader class="text-center">
			<div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
				<Icon icon="tabler:users-group" class="h-8 w-8 text-primary" />
			</div>
			<CardTitle class="text-2xl">Team Dashboard</CardTitle>
			<CardDescription>Melde dich mit deinem 6-stelligen Support-PIN an</CardDescription>
		</CardHeader>

		<CardContent>
			{#if form?.error}
				<div class="mb-4 rounded-lg border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-700 dark:text-red-400">
					<div class="flex items-center gap-2">
						<Icon icon="tabler:alert-circle" class="h-5 w-5" />
						<p>{form.error}</p>
					</div>
				</div>
			{/if}

			<form method="POST" use:enhance class="space-y-4">
				<div class="space-y-2">
					<Label for="pin">Support-PIN</Label>
					<Input
						id="pin"
						name="pin"
						type="text"
						inputmode="numeric"
						pattern="[0-9]{6}"
						maxlength={6}
						placeholder="123456"
						required
						autofocus
						class="text-center text-2xl tracking-widest"
					/>
					<p class="text-xs text-muted-foreground text-center">
						Gib deinen 6-stelligen PIN ein
					</p>
				</div>

				<Button type="submit" class="w-full">
					<Icon icon="tabler:login" class="mr-2 h-4 w-4" />
					Anmelden
				</Button>
			</form>

			<div class="mt-6 text-center">
				<p class="text-sm text-muted-foreground">
					<a href="/login" class="text-primary hover:underline">
						Mit Email & Passwort anmelden
					</a>
				</p>
			</div>
		</CardContent>
	</Card>
</div>


<script lang="ts">
	import { enhance } from '$app/forms';
	import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import Icon from '@iconify/svelte';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let bannerText = $state('');
	let bannerLinkUrl = $state('');
	let bannerIcon = $state('tabler:discount-2');

	// Alte/fehlerhafte Icon-IDs auf funktionierende umleiten
	const ICON_FALLBACK: Record<string, string> = {
		'tabler:campaign': 'tabler:speakerphone',
		'tabler:certificate': 'tabler:award',
		'tabler:megaphone': 'tabler:bell'
	};

	$effect(() => {
		bannerText = data.banner.text;
		bannerLinkUrl = data.banner.linkUrl ?? '';
		const saved = data.banner.icon ?? 'tabler:discount-2';
		bannerIcon = ICON_FALLBACK[saved] ?? saved;
	});

	// Vordefinierte Icons (alle Tabler-Namen, die in Iconify zuverlässig laden)
	const BANNER_ICONS = [
		{ id: 'tabler:discount-2', label: 'Rabatt' },
		{ id: 'tabler:gift', label: 'Geschenk' },
		{ id: 'tabler:tag', label: 'Tag' },
		{ id: 'tabler:speakerphone', label: 'Kampagne' },
		{ id: 'tabler:sparkles', label: 'Sparkles' },
		{ id: 'tabler:flame', label: 'Flamme' },
		{ id: 'tabler:rocket', label: 'Rakete' },
		{ id: 'tabler:star', label: 'Stern' },
		{ id: 'tabler:award', label: 'Zertifikat' },
		{ id: 'tabler:bell', label: 'Ankündigung' }
	];
</script>

<svelte:head>
	<title>Einstellungen - Admin | TitanNode</title>
</svelte:head>

<div class="space-y-8">
	<div>
		<h1 class="text-3xl font-bold flex items-center gap-3">
			<Icon icon="tabler:settings" class="h-8 w-8 text-primary" />
			System-Einstellungen
		</h1>
		<p class="mt-2 text-muted-foreground">Konfiguriere System-Einstellungen</p>
	</div>

	<!-- Banner konfigurieren -->
	<Card class="border-border/50">
		<CardHeader>
			<CardTitle class="flex items-center gap-2">
				<Icon icon="tabler:discount-2" class="h-5 w-5" />
				Site-Banner
			</CardTitle>
			<CardDescription>
				Banner oben auf jeder Seite (z. B. für Aktionen wie „25% Sale“). Ein oder ausblenden, Text und Link anpassen.
			</CardDescription>
		</CardHeader>
		<CardContent>
			<form
				method="POST"
				action="?/saveBanner"
				use:enhance={() => {
					return async ({ update }) => {
						await update();
					};
				}}
				class="space-y-4"
			>
				<div class="flex items-center gap-2">
					<input type="hidden" name="enabled" value="false" aria-hidden="true" />
					<input
						type="checkbox"
						id="banner-enabled"
						name="enabled"
						value="true"
						checked={data.banner.enabled}
						class="h-4 w-4 rounded border-input"
					/>
					<Label for="banner-enabled" class="!mt-0">Banner anzeigen</Label>
				</div>
				<div class="space-y-2">
					<Label>Icon</Label>
					<input type="hidden" name="icon" value={bannerIcon} />
					<div class="flex flex-wrap gap-2">
						{#each BANNER_ICONS as opt}
							<button
								type="button"
								class="flex h-10 w-10 items-center justify-center rounded-lg border-2 transition-colors {bannerIcon === opt.id
									? 'border-primary bg-primary/10 text-primary'
									: 'border-border bg-muted/30 hover:border-primary/50'}"
								title={opt.label}
								onclick={() => (bannerIcon = opt.id)}
							>
								<Icon icon={opt.id} class="h-5 w-5" />
							</button>
						{/each}
					</div>
					<p class="text-xs text-muted-foreground">Aktuell: {bannerIcon}</p>
				</div>
				<div class="space-y-2">
					<Label for="banner-text">Banner-Text</Label>
					<Input
						id="banner-text"
						name="text"
						type="text"
						bind:value={bannerText}
						placeholder="z. B. 25% Sale auf alle Gameserver-Pakete und Konfiguration"
						required
					/>
				</div>
				<div class="space-y-2">
					<Label for="banner-link">Link-URL (optional)</Label>
					<Input
						id="banner-link"
						name="linkUrl"
						type="text"
						bind:value={bannerLinkUrl}
						placeholder="/gameserver oder /#angebot"
					/>
					<p class="text-xs text-muted-foreground">Leer lassen = Banner ohne Klick-Link (nur Text)</p>
				</div>
				{#if form?.form === 'banner' && form?.error}
					<p class="text-sm text-destructive">{form.error}</p>
				{/if}
				{#if form?.form === 'banner' && form?.success}
					<p class="text-sm text-green-600 dark:text-green-400">Banner gespeichert.</p>
				{/if}
				<Button type="submit" class="gap-2">
					<Icon icon="tabler:device-floppy" class="h-4 w-4" />
					Banner speichern
				</Button>
			</form>
		</CardContent>
	</Card>

	<div class="grid gap-6 md:grid-cols-2">
		<Card class="border-border/50">
			<CardHeader>
				<CardTitle class="flex items-center gap-2">
					<Icon icon="tabler:server-2" class="h-5 w-5" />
					Gameserver-Nodes
				</CardTitle>
				<CardDescription>Verwalte Gameserver-Nodes und Ressourcen</CardDescription>
			</CardHeader>
			<CardContent>
				<a href="/admin/nodes">
					<Button variant="outline" class="w-full">
						<Icon icon="tabler:server-2" class="mr-2 h-4 w-4" />
						Nodes verwalten
					</Button>
				</a>
			</CardContent>
		</Card>

		<Card class="border-border/50">
			<CardHeader>
				<CardTitle class="flex items-center gap-2">
					<Icon icon="tabler:mail" class="h-5 w-5" />
					Email-Einstellungen
				</CardTitle>
				<CardDescription>SMTP und Email-Vorlagen konfigurieren</CardDescription>
			</CardHeader>
			<CardContent>
				<Button variant="outline" class="w-full">
					<Icon icon="tabler:settings" class="mr-2 h-4 w-4" />
					Konfigurieren
				</Button>
			</CardContent>
		</Card>

		<Card class="border-border/50">
			<CardHeader>
				<CardTitle class="flex items-center gap-2">
					<Icon icon="tabler:credit-card" class="h-5 w-5" />
					Checkout-Einstellungen
				</CardTitle>
				<CardDescription>Checkout-Events und Benachrichtigungen konfigurieren</CardDescription>
			</CardHeader>
			<CardContent>
				<a href="/admin/settings/checkout">
					<Button variant="outline" class="w-full">
						<Icon icon="tabler:settings" class="mr-2 h-4 w-4" />
						Konfigurieren
					</Button>
				</a>
			</CardContent>
		</Card>

		<Card class="border-border/50">
			<CardHeader>
				<CardTitle class="flex items-center gap-2">
					<Icon icon="tabler:database" class="h-5 w-5" />
					Datenbank
				</CardTitle>
				<CardDescription>Backup und Wartung</CardDescription>
			</CardHeader>
			<CardContent>
				<Button variant="outline" class="w-full">
					<Icon icon="tabler:database-export" class="mr-2 h-4 w-4" />
					Backup erstellen
				</Button>
			</CardContent>
		</Card>

		<Card class="border-border/50">
			<CardHeader>
				<CardTitle class="flex items-center gap-2">
					<Icon icon="tabler:bell" class="h-5 w-5" />
					Benachrichtigungen
				</CardTitle>
				<CardDescription>System-Benachrichtigungen konfigurieren</CardDescription>
			</CardHeader>
			<CardContent>
				<Button variant="outline" class="w-full">
					<Icon icon="tabler:settings" class="mr-2 h-4 w-4" />
					Konfigurieren
				</Button>
			</CardContent>
		</Card>
	</div>
</div>


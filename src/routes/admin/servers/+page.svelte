<script lang="ts">
	import { enhance } from '$app/forms';
	import { Card, CardContent } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import { Label } from '$lib/components/ui/label';
	import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '$lib/components/ui/dialog';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import Icon from '@iconify/svelte';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	let searchQuery = $state('');
	
	// Dialog States für jeden Server
	let extendDialogOpen = $state<Record<string, boolean>>({});
	let extendMonths = $state<Record<string, string>>({});
	let useCredits = $state<Record<string, boolean>>({});

	// Initialisiere States für alle Server
	$effect(() => {
		for (const server of data.servers) {
			if (!(server.id in extendDialogOpen)) {
				extendDialogOpen = { ...extendDialogOpen, [server.id]: false };
				extendMonths = { ...extendMonths, [server.id]: '1' };
				useCredits = { ...useCredits, [server.id]: true };
			}
		}
	});

	let filteredServers = $derived(
		data.servers.filter(server =>
			server.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			server.user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
			server.user.lastName.toLowerCase().includes(searchQuery.toLowerCase())
		)
	);

	function getStatusColor(status: string) {
		switch (status) {
			case 'ACTIVE': return 'bg-green-500/10 text-green-700 dark:text-green-400';
			case 'PENDING': return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400';
			case 'SUSPENDED': return 'bg-orange-500/10 text-orange-700 dark:text-orange-400';
			case 'CANCELLED': return 'bg-red-500/10 text-red-700 dark:text-red-400';
			case 'EXPIRED': return 'bg-gray-500/10 text-gray-700 dark:text-gray-400';
			default: return '';
		}
	}

	function getTypeText(type: string) {
		switch (type) {
			case 'VPS': return 'VPS';
			case 'GAMESERVER': return 'Gameserver';
			case 'APP_HOSTING': return 'App Hosting';
			default: return type;
		}
	}

	function formatDate(date: Date | null | undefined): string {
		if (!date) return 'Unbegrenzt';
		return new Date(date).toLocaleDateString('de-DE', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	function calculatePrice(priceMonthly: number, months: number): number {
		return (priceMonthly / 100) * months;
	}

	function getUserCredits(user: any): number {
		return ((user as any).credits as number) || 0;
	}
</script>

<svelte:head>
	<title>Server - Admin | TitanNode</title>
</svelte:head>

<div class="space-y-8">
	<div>
		<h1 class="text-3xl font-bold flex items-center gap-3">
			<Icon icon="tabler:server" class="h-8 w-8 text-primary" />
			Server-Verwaltung
		</h1>
		<p class="mt-2 text-muted-foreground">Alle Server und Services</p>
	</div>

	<Card class="border-border/50">
		<CardContent class="pt-6">
			<Input type="search" placeholder="Nach Servername oder Kunde suchen..." bind:value={searchQuery} />
		</CardContent>
	</Card>

	<div class="space-y-4">
		{#each filteredServers as server}
			<Card class="border-border/50 hover:bg-muted/50 transition-colors">
				<CardContent class="p-6">
					<div class="flex items-start justify-between gap-4">
						<div class="flex-1 space-y-2">
							<div class="flex items-center gap-3">
								<Icon icon="tabler:server" class="h-5 w-5 text-primary" />
								<h3 class="font-semibold text-lg">{server.name}</h3>
							</div>
							<p class="text-sm text-muted-foreground">
								Kunde: {server.user.firstName} {server.user.lastName}
							</p>
							<div class="flex flex-wrap items-center gap-2">
								<Badge variant="outline" class={getStatusColor(server.status)}>
									{server.status}
								</Badge>
								<Badge variant="outline">{getTypeText(server.type)}</Badge>
								{#if server.ipAddress}
									<Badge variant="outline" class="font-mono">{server.ipAddress}</Badge>
								{/if}
							</div>
							<div class="text-sm text-muted-foreground">
								{server.cpu} vCores • {server.ram} GB RAM • {(server.storage / 1024).toFixed(2)} GB Storage
							</div>
							{#if server.expiresAt}
								<div class="text-sm text-muted-foreground">
									<Icon icon="tabler:calendar" class="h-4 w-4 inline mr-1" />
									Läuft ab: {formatDate(server.expiresAt)}
								</div>
							{:else}
								<div class="text-sm text-muted-foreground">
									<Icon icon="tabler:calendar" class="h-4 w-4 inline mr-1" />
									Laufzeit: Unbegrenzt
								</div>
							{/if}
						</div>
						<div class="text-right space-y-2">
							<p class="text-xl font-bold">€{(server.priceMonthly / 100).toFixed(2).replace('.', ',')}/mo</p>
							{#if server.type === 'VPS' || server.type === 'GAMESERVER' || server.type === 'APP_HOSTING'}
								<Dialog open={extendDialogOpen[server.id] ?? false} onOpenChange={(open) => {
									extendDialogOpen = { ...extendDialogOpen, [server.id]: open };
								}}>
									<DialogTrigger>
										<Button size="sm" variant="outline" class="gap-2 touch-manipulation">
											<Icon icon="tabler:calendar-plus" class="h-4 w-4" />
											Verlängern
										</Button>
									</DialogTrigger>
									<DialogContent class="sm:max-w-md">
										<form method="POST" action="?/extend" use:enhance={() => {
											return async ({ update }) => {
												await update();
												if (form && typeof form === 'object' && 'success' in form && (form as any).success) {
													extendDialogOpen = { ...extendDialogOpen, [server.id]: false };
												}
											};
										}}>
											<DialogHeader>
												<DialogTitle>Server verlängern</DialogTitle>
												<DialogDescription>
													Verlängere den Server "{server.name}" für den angegebenen Zeitraum.
												</DialogDescription>
											</DialogHeader>

											<input type="hidden" name="serverId" value={server.id} />
											<input type="hidden" name="useCredits" value={useCredits[server.id] ? 'true' : 'false'} />

											<div class="grid gap-4 py-4">
												{#if form && typeof form === 'object' && 'error' in form && (form as any).serverId === server.id}
													<div class="rounded-lg border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-700 dark:text-red-400">
														{(form as any).error}
													</div>
												{/if}

												<div class="grid gap-2">
													<Label for="months-{server.id}">Anzahl Monate</Label>
													<Input
														id="months-{server.id}"
														name="months"
														type="number"
														min="1"
														max="24"
														value={extendMonths[server.id] || '1'}
														oninput={(e) => {
															extendMonths = { ...extendMonths, [server.id]: e.currentTarget.value };
														}}
														required
													/>
												</div>

												{#if true}
													{@const totalPrice = calculatePrice(server.priceMonthly, parseInt(extendMonths[server.id] || '1', 10))}
													{@const userCredits = getUserCredits(server.user)}
													{@const canPayWithCredits = userCredits >= totalPrice}

													<div class="rounded-lg border border-border/50 bg-muted/30 p-3 space-y-2">
														<div class="flex justify-between text-sm">
															<span class="text-muted-foreground">Kosten pro Monat:</span>
															<span class="font-medium">€{(server.priceMonthly / 100).toFixed(2).replace('.', ',')}</span>
														</div>
														<div class="flex justify-between text-sm">
															<span class="text-muted-foreground">Anzahl Monate:</span>
															<span class="font-medium">{extendMonths[server.id] || '1'}</span>
														</div>
														<div class="border-t pt-2 flex justify-between font-semibold">
															<span>Gesamt:</span>
															<span>€{totalPrice.toFixed(2).replace('.', ',')}</span>
														</div>
														<div class="flex justify-between text-sm">
															<span class="text-muted-foreground">User Credits:</span>
															<span class="font-medium">€{userCredits.toFixed(2).replace('.', ',')}</span>
														</div>
													</div>

													<div class="flex items-center space-x-2">
														<Checkbox
															id="useCredits-{server.id}"
															name="useCredits"
															checked={useCredits[server.id] ?? true}
															disabled={!canPayWithCredits}
															onCheckedChange={(checked) => {
																useCredits = { ...useCredits, [server.id]: checked ?? true };
															}}
														/>
														<Label for="useCredits-{server.id}" class="text-sm font-normal cursor-pointer">
															{#if canPayWithCredits}
																Mit Credits bezahlen
															{:else}
																Mit Credits bezahlen (Nicht genügend Credits)
															{/if}
														</Label>
													</div>
													{#if !canPayWithCredits && (useCredits[server.id] ?? true)}
														<p class="text-xs text-muted-foreground">
															Der User hat nicht genügend Credits. Die Verlängerung kann trotzdem durchgeführt werden (ohne Credits-Abzug).
														</p>
													{/if}
												{/if}
											</div>

											<DialogFooter>
												<Button
													type="button"
													variant="outline"
													onclick={() => {
														extendDialogOpen = { ...extendDialogOpen, [server.id]: false };
													}}
												>
													Abbrechen
												</Button>
												<Button type="submit" class="gap-2">
													<Icon icon="tabler:check" class="h-4 w-4" />
													Verlängern
												</Button>
											</DialogFooter>
										</form>
									</DialogContent>
								</Dialog>
							{/if}
						</div>
					</div>
				</CardContent>
			</Card>
		{/each}
	</div>
</div>


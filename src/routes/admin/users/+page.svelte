<script lang="ts">
	import { enhance } from '$app/forms';
	import { Card, CardContent } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';
	import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '$lib/components/ui/dialog';
	import { Textarea } from '$lib/components/ui/textarea';
	import { ROLE_NAMES, ROLE_COLORS, TEAM_STRUCTURE, getRoleDisplayName, getRoleColor } from '$lib/constants/roles';
	import Icon from '@iconify/svelte';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	let searchQuery = $state('');
	
	// Initialisiere Dialog-States für alle User vor dem ersten Render
	let addCreditsDialogOpen = $state<Record<string, boolean>>({});
	let creditAmount = $state<Record<string, string>>({});
	let creditReason = $state<Record<string, string>>({});

	// Initialisiere States für alle User synchron
	function initUserStates() {
		for (const user of data.users) {
			if (!(user.id in addCreditsDialogOpen)) {
				addCreditsDialogOpen[user.id] = false;
				creditAmount[user.id] = '';
				creditReason[user.id] = '';
			}
		}
	}
	
	// Initialisiere sofort
	initUserStates();

let filteredUsers = $derived(
	data.users.filter((user) => {
		const query = searchQuery.toLowerCase();
		const matchesSearch =
			user.firstName.toLowerCase().includes(query) ||
			user.lastName.toLowerCase().includes(query) ||
			user.email.toLowerCase().includes(query) ||
			(user.supportPin && user.supportPin.includes(searchQuery));

		return matchesSearch;
	})
);

	function openAddCreditsDialog(userId: string) {
		addCreditsDialogOpen = { ...addCreditsDialogOpen, [userId]: true };
		creditAmount = { ...creditAmount, [userId]: '' };
		creditReason = { ...creditReason, [userId]: '' };
	}

	function closeAddCreditsDialog(userId: string) {
		addCreditsDialogOpen = { ...addCreditsDialogOpen, [userId]: false };
	}

	// Berechne Statistiken für jeden User
	function getUserStats(user: any) {
		const activeServers = user.servers?.filter((s: any) => s.status === 'ACTIVE').length || 0;
		const unpaidInvoices = user.invoices?.filter((i: any) => i.status === 'UNPAID').length || 0;
		const unpaidAmount = user.invoices?.filter((i: any) => i.status === 'UNPAID').reduce((sum: number, i: any) => sum + i.amount, 0) || 0;
		const openTickets = user.tickets?.filter((t: any) => t.status !== 'CLOSED').length || 0;

		return {
			activeServers,
			unpaidInvoices,
			unpaidAmount,
			openTickets
		};
	}
</script>

<svelte:head>
	<title>Benutzer - Admin | TitanNode</title>
</svelte:head>

<div class="space-y-8">
	<div>
		<h1 class="text-2xl sm:text-3xl font-bold flex items-center gap-2 sm:gap-3 flex-wrap">
			<Icon icon="tabler:users" class="h-8 w-8 text-primary" />
			Benutzerverwaltung
		</h1>
		<p class="mt-2 text-muted-foreground">Verwalte Benutzer und Rollen</p>
	</div>

	<Card class="border-border/50">
		<CardContent class="pt-6">
			<div class="relative">
				<Icon
					icon="tabler:search"
					class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
				/>
				<Input
					type="search"
					placeholder="Nach Name, Email oder Support-PIN suchen..."
					bind:value={searchQuery}
					class="pl-9"
				/>
			</div>
		</CardContent>
	</Card>

	<!-- Offizielle Team-Rollen (Übersicht) -->
	<Card class="border-border/50">
		<CardContent class="p-6">
			<h2 class="text-lg font-semibold flex items-center gap-2 mb-4">
				<Icon icon="tabler:building" class="h-5 w-5 text-primary" />
				Offizielle Team-Rollen
			</h2>
			<p class="text-sm text-muted-foreground mb-4">
				Übersicht aller Rollen der TitanNode Team-Struktur. Die Basis-Rolle (Dropdown pro User) steuert Berechtigungen.
			</p>
			<div class="flex flex-wrap gap-2">
				{#each TEAM_STRUCTURE as category}
					{#each category.roles as role}
						<Badge variant="outline" class={getRoleColor(role.id)} title={role.description}>
							{getRoleDisplayName(role.id)}
						</Badge>
					{/each}
				{/each}
			</div>
		</CardContent>
	</Card>

	<div class="space-y-4">
		{#each filteredUsers as user}
			{@const stats = getUserStats(user)}
			<Card class="border-border/50">
				<CardContent class="p-6">
					<div class="flex flex-col sm:flex-row items-start justify-between gap-4">
						<div class="flex-1 space-y-3 w-full">
							<div class="flex items-start gap-3">
								<div class="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 shrink-0">
									<Icon icon="tabler:user" class="h-6 w-6 text-primary" />
								</div>
								<div class="flex-1 min-w-0">
									<h3 class="font-semibold text-lg">{user.firstName} {user.lastName}</h3>
									<p class="text-sm text-muted-foreground truncate">{user.email}</p>
									{#if user.supportPin}
										<p class="mt-1 text-xs text-muted-foreground flex items-center gap-2">
											<Icon icon="tabler:key" class="h-3.5 w-3.5" />
											<span>
												PIN:
												<span class="font-mono font-semibold tracking-[0.25em]">
													{user.supportPin}
												</span>
											</span>
										</p>
									{/if}
								</div>
							</div>
							<div class="flex flex-wrap items-center gap-2">
								<Badge variant="outline" class={getRoleColor((user as { position?: string | null }).position ?? user.role)}>
									{getRoleDisplayName((user as { position?: string | null }).position ?? user.role)}
								</Badge>
								{#if user.emailVerified}
									<Badge variant="outline" class="bg-green-500/10 text-green-700 dark:text-green-400">
										<Icon icon="tabler:mail-check" class="mr-1 h-3 w-3" />
										Email verifiziert
									</Badge>
								{/if}
								{#if user.isActive}
									<Badge variant="outline" class="bg-green-500/10 text-green-700 dark:text-green-400">Aktiv</Badge>
								{:else}
									<Badge variant="outline" class="bg-red-500/10 text-red-700 dark:text-red-400">Deaktiviert</Badge>
								{/if}
							</div>
							
							<!-- Credits Display -->
							<div class="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border border-border/50">
								<Icon icon="tabler:currency-euro" class="h-5 w-5 text-primary" />
								<div class="flex-1">
									<p class="text-xs text-muted-foreground">Guthaben</p>
									<p class="text-xl font-bold">€{((user.credits as number) || 0).toFixed(2).replace('.', ',')}</p>
								</div>
								<Dialog 
									open={addCreditsDialogOpen[user.id] ?? false}
									onOpenChange={(open) => {
										addCreditsDialogOpen = { ...addCreditsDialogOpen, [user.id]: open ?? false };
									}}
								>
									<DialogTrigger>
										<Button size="sm" variant="outline" class="gap-2 touch-manipulation">
											<Icon icon="tabler:plus" class="h-4 w-4" />
											Guthaben
										</Button>
									</DialogTrigger>
									<DialogContent class="sm:max-w-md">
										<DialogHeader>
											<DialogTitle>Guthaben hinzufügen</DialogTitle>
											<DialogDescription>
												Guthaben für {user.firstName} {user.lastName} hinzufügen
											</DialogDescription>
										</DialogHeader>
										<form method="POST" action="?/addCredits" use:enhance={() => {
											return async ({ update, result }) => {
												await update();
												if (result.type === 'success' && form?.success) {
													closeAddCreditsDialog(user.id);
													creditAmount[user.id] = '';
													creditReason[user.id] = '';
													creditAmount = { ...creditAmount };
													creditReason = { ...creditReason };
												}
											};
										}}>
											<input type="hidden" name="userId" value={user.id} />
											<div class="space-y-4 py-4">
												<div class="space-y-2">
													<Label for="amount-{user.id}">Betrag (€)</Label>
													<Input
														id="amount-{user.id}"
														name="amount"
														type="number"
														step="0.01"
														min="0.01"
														placeholder="0.00"
														required
														bind:value={creditAmount[user.id]}
														class="touch-manipulation"
													/>
												</div>
												<div class="space-y-2">
													<Label for="reason-{user.id}">Grund (optional)</Label>
													<Textarea
														id="reason-{user.id}"
														name="reason"
														placeholder="z.B. Rückerstattung, Gutschrift..."
														bind:value={creditReason[user.id]}
													/>
												</div>
												{#if form?.error && form?.userId === user.id}
													<div class="rounded-lg border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-700 dark:text-red-400">
														{form.error}
													</div>
												{/if}
												{#if form?.success && form?.userId === user.id}
													<div class="rounded-lg border border-green-500/50 bg-green-500/10 p-3 text-sm text-green-700 dark:text-green-400">
														{form.message || 'Guthaben erfolgreich hinzugefügt!'}
													</div>
												{/if}
											</div>
											<DialogFooter>
												<Button type="button" variant="outline" onclick={() => closeAddCreditsDialog(user.id)}>
													Abbrechen
												</Button>
												<Button type="submit" class="touch-manipulation">
													Guthaben hinzufügen
												</Button>
											</DialogFooter>
										</form>
									</DialogContent>
								</Dialog>
							</div>

							<!-- Stats -->
							<div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
								<div class="p-3 rounded-lg bg-muted/30 border border-border/50">
									<p class="text-xs text-muted-foreground mb-1">Services</p>
									<p class="text-lg font-bold">{user._count.servers}</p>
									{#if stats.activeServers > 0}
										<p class="text-xs text-green-600 dark:text-green-400">{stats.activeServers} aktiv</p>
									{/if}
								</div>
								<div class="p-3 rounded-lg bg-muted/30 border border-border/50">
									<p class="text-xs text-muted-foreground mb-1">Tickets</p>
									<p class="text-lg font-bold">{user._count.tickets}</p>
									{#if stats.openTickets > 0}
										<p class="text-xs text-orange-600 dark:text-orange-400">{stats.openTickets} offen</p>
									{/if}
								</div>
								<div class="p-3 rounded-lg bg-muted/30 border border-border/50">
									<p class="text-xs text-muted-foreground mb-1">Rechnungen</p>
									<p class="text-lg font-bold">{user._count.invoices}</p>
									{#if stats.unpaidInvoices > 0}
										<p class="text-xs text-red-600 dark:text-red-400">{stats.unpaidInvoices} offen</p>
										<p class="text-xs text-muted-foreground">€{stats.unpaidAmount.toFixed(2).replace('.', ',')}</p>
									{/if}
								</div>
								<div class="p-3 rounded-lg bg-muted/30 border border-border/50">
									<p class="text-xs text-muted-foreground mb-1">Registriert</p>
									<p class="text-xs font-medium">
										{new Date(user.createdAt).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}
									</p>
								</div>
							</div>
						</div>
						<div class="flex flex-col gap-2 w-full sm:w-auto">
							<form method="POST" action="?/updateRole" use:enhance>
								<input type="hidden" name="userId" value={user.id} />
								<select
									name="role"
									class="w-full sm:w-auto min-w-[12rem] text-sm border rounded p-2 bg-background touch-manipulation"
									onchange={(e) => e.currentTarget.form?.requestSubmit()}
								>
									<optgroup label="Basis-Rolle">
										{#each Object.entries(ROLE_NAMES) as [value, label]}
											<option value="role:{value}" selected={!(user as { position?: string | null }).position && user.role === value}>
												{label}
											</option>
										{/each}
									</optgroup>
									<optgroup label="Team-Position">
										{#each TEAM_STRUCTURE as category}
											{#each category.roles as role}
												<option
													value="position:{role.id}"
													selected={(user as { position?: string | null }).position === role.id}
												>
													{role.title}
												</option>
											{/each}
										{/each}
									</optgroup>
								</select>
							</form>
							<form method="POST" action="?/regeneratePin" use:enhance>
								<input type="hidden" name="userId" value={user.id} />
								<Button type="submit" variant="outline" size="sm" class="w-full touch-manipulation gap-2">
									<Icon icon="tabler:key" class="h-4 w-4" />
									{user.supportPin ? 'PIN neu generieren' : 'PIN erstellen'}
								</Button>
							</form>
							<form method="POST" action="?/toggleActive" use:enhance>
								<input type="hidden" name="userId" value={user.id} />
								<input type="hidden" name="isActive" value={(!user.isActive).toString()} />
								<Button type="submit" variant="outline" size="sm" class="w-full touch-manipulation">
									{user.isActive ? 'Deaktivieren' : 'Aktivieren'}
								</Button>
							</form>
						</div>
					</div>
				</CardContent>
			</Card>
		{/each}
	</div>
</div>


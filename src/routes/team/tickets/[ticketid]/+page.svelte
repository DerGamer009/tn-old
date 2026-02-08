<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Separator } from '$lib/components/ui/separator';
	import Icon from '@iconify/svelte';
	import type { PageData, ActionData } from './$types';
	import { goto } from '$app/navigation';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	let messageText = $state('');
	let submitting = $state(false);

	// Reset textarea nach erfolgreichem Submit
	$effect(() => {
		if (form?.success && !form?.statusChanged) {
			messageText = '';
		}
	});

	function getStatusColor(status: string) {
		switch (status) {
			case 'OPEN':
				return 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/50';
			case 'IN_PROGRESS':
				return 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/50';
			case 'WAITING_FOR_CUSTOMER':
				return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/50';
			case 'CLOSED':
				return 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/50';
			default:
				return 'bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/50';
		}
	}

	function getStatusText(status: string) {
		switch (status) {
			case 'OPEN':
				return 'Offen';
			case 'IN_PROGRESS':
				return 'In Bearbeitung';
			case 'WAITING_FOR_CUSTOMER':
				return 'Warte auf Kunde';
			case 'CLOSED':
				return 'Geschlossen';
			default:
				return status;
		}
	}

	function getPriorityColor(priority: string) {
		switch (priority) {
			case 'LOW':
				return 'bg-gray-500/10 text-gray-700 dark:text-gray-400';
			case 'MEDIUM':
				return 'bg-blue-500/10 text-blue-700 dark:text-blue-400';
			case 'HIGH':
				return 'bg-orange-500/10 text-orange-700 dark:text-orange-400';
			case 'URGENT':
				return 'bg-red-500/10 text-red-700 dark:text-red-400';
			default:
				return 'bg-gray-500/10 text-gray-700 dark:text-gray-400';
		}
	}

	function getPriorityText(priority: string) {
		switch (priority) {
			case 'LOW':
				return 'Niedrig';
			case 'MEDIUM':
				return 'Mittel';
			case 'HIGH':
				return 'Hoch';
			case 'URGENT':
				return 'Dringend';
			default:
				return priority;
		}
	}

	function formatDate(date: Date) {
		return new Date(date).toLocaleString('de-DE', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}
</script>

<svelte:head>
	<title>{data.ticket.subject} - Team Support Ticket | TitanNode</title>
</svelte:head>

<div class="max-w-screen-xl">
	<!-- Header -->
	<div class="mb-8">
		<a href="/team/tickets" class="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
			<Icon icon="tabler:arrow-left" class="h-4 w-4" />
			Zurück zu Tickets
		</a>
		<div class="flex items-start justify-between gap-4">
			<div class="flex-1">
				<h1 class="text-3xl font-bold flex items-center gap-3">
					<Icon icon="tabler:ticket" class="h-8 w-8 text-primary" />
					{data.ticket.subject}
				</h1>
				<div class="mt-3 flex flex-wrap items-center gap-2">
					<Badge variant="outline" class={getStatusColor(data.ticket.status)}>
						{getStatusText(data.ticket.status)}
					</Badge>
					<Badge variant="outline" class={getPriorityColor(data.ticket.priority)}>
						{getPriorityText(data.ticket.priority)}
					</Badge>
					<span class="text-sm text-muted-foreground">
						Erstellt: {formatDate(data.ticket.createdAt)}
					</span>
				</div>
			</div>

			<!-- Status Actions -->
			<div class="flex gap-2">
				{#if data.ticket.status !== 'CLOSED'}
					<form method="POST" action="?/updateStatus" use:enhance>
						<input type="hidden" name="status" value="CLOSED" />
						<Button type="submit" variant="outline" class="gap-2">
							<Icon icon="tabler:check" class="h-4 w-4" />
							Ticket schließen
						</Button>
					</form>
				{:else}
					<form method="POST" action="?/updateStatus" use:enhance>
						<input type="hidden" name="status" value="OPEN" />
						<Button type="submit" variant="outline" class="gap-2">
							<Icon icon="tabler:arrow-back-up" class="h-4 w-4" />
							Ticket wieder öffnen
						</Button>
					</form>
				{/if}
				{#if data.ticket.user.supportPin}
					<Button
						variant="outline"
						class="gap-2"
						onclick={() => goto(`/team/customers?search=${data.ticket.user.supportPin}`)}
					>
						<Icon icon="tabler:user-search" class="h-4 w-4" />
						Kunde ansehen
					</Button>
				{/if}
			</div>
		</div>
	</div>

	<div class="grid gap-6 lg:grid-cols-3">
		<!-- Messages Thread -->
		<div class="lg:col-span-2 space-y-6">
			<!-- Original Ticket -->
			<Card class="border-border/50">
				<CardHeader>
					<div class="flex items-center gap-3">
						<div class="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
							<Icon icon="tabler:user" class="h-5 w-5 text-primary" />
						</div>
						<div>
							<CardTitle class="text-base">
								{data.ticket.user.firstName} {data.ticket.user.lastName}
							</CardTitle>
							<p class="text-sm text-muted-foreground">
								{data.ticket.user.email}
								{#if data.ticket.user.supportPin}
									<span class="ml-2 font-mono text-xs">PIN: {data.ticket.user.supportPin}</span>
								{/if}
							</p>
							<p class="text-xs text-muted-foreground mt-1">{formatDate(data.ticket.createdAt)}</p>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					<p class="whitespace-pre-wrap text-sm">{data.ticket.description}</p>
				</CardContent>
			</Card>

			<!-- Messages -->
			{#each data.ticket.messages as message}
				<Card class="border-border/50 {message.isStaff ? 'bg-primary/5 border-primary/20' : ''}">
					<CardHeader>
						<div class="flex items-center gap-3">
							{#if message.isStaff}
								<div class="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/10">
									<Icon icon="tabler:headset" class="h-5 w-5 text-green-600" />
								</div>
								<div>
									<CardTitle class="text-base">TitanNode Support</CardTitle>
									<p class="text-sm text-muted-foreground">{formatDate(message.createdAt)}</p>
								</div>
							{:else}
								<div class="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
									<Icon icon="tabler:user" class="h-5 w-5 text-primary" />
								</div>
								<div>
									<CardTitle class="text-base">
										{data.ticket.user.firstName} {data.ticket.user.lastName}
									</CardTitle>
									<p class="text-sm text-muted-foreground">{formatDate(message.createdAt)}</p>
								</div>
							{/if}
						</div>
					</CardHeader>
					<CardContent>
						<p class="whitespace-pre-wrap text-sm">{message.message}</p>
					</CardContent>
				</Card>
			{/each}

			<!-- Add Message -->
			{#if data.ticket.status !== 'CLOSED'}
				<Card class="border-border/50">
					<CardHeader>
						<CardTitle>Antwort hinzufügen</CardTitle>
					</CardHeader>
					<CardContent>
						{#if form?.error}
							<div class="mb-4 rounded-lg border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-700 dark:text-red-400">
								{form.error}
							</div>
						{/if}

						<form method="POST" action="?/addMessage" use:enhance={() => {
							submitting = true;
							return async ({ update }) => {
								await update();
								submitting = false;
							};
						}}>
							<div class="space-y-4">
								<Textarea
									name="message"
									bind:value={messageText}
									placeholder="Schreibe deine Antwort..."
									rows={5}
									required
								/>
								<div class="flex justify-end">
									<Button type="submit" disabled={submitting || !messageText.trim()}>
										{#if submitting}
											<Icon icon="tabler:loader-2" class="mr-2 h-4 w-4 animate-spin" />
											Sendet...
										{:else}
											<Icon icon="tabler:send" class="mr-2 h-4 w-4" />
											Nachricht senden
										{/if}
									</Button>
								</div>
							</div>
						</form>
					</CardContent>
				</Card>
			{:else}
				<Card class="border-border/50 bg-muted/50">
					<CardContent class="py-8 text-center">
						<Icon icon="tabler:lock" class="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
						<p class="text-sm text-muted-foreground">
							Dieses Ticket ist geschlossen. Öffne es erneut, um eine Nachricht zu senden.
						</p>
					</CardContent>
				</Card>
			{/if}
		</div>

		<!-- Sidebar -->
		<div class="space-y-6">
			<!-- Ticket Info -->
			<Card class="border-border/50">
				<CardHeader>
					<CardTitle class="text-base">Ticket-Informationen</CardTitle>
				</CardHeader>
				<CardContent class="space-y-4 text-sm">
					<div>
						<p class="text-muted-foreground">Ticket-ID</p>
						<p class="font-mono text-xs">{data.ticket.id}</p>
					</div>
					<Separator />
					<div>
						<p class="text-muted-foreground">Kunde</p>
						<p class="font-medium">
							{data.ticket.user.firstName} {data.ticket.user.lastName}
						</p>
						<p class="text-xs text-muted-foreground mt-1">{data.ticket.user.email}</p>
						{#if data.ticket.user.supportPin}
							<p class="text-xs font-mono text-muted-foreground mt-1">
								Support-PIN: {data.ticket.user.supportPin}
							</p>
						{/if}
					</div>
					<Separator />
					<div>
						<p class="text-muted-foreground">Status</p>
						<p class="font-medium">{getStatusText(data.ticket.status)}</p>
					</div>
					<Separator />
					<div>
						<p class="text-muted-foreground">Priorität</p>
						<p class="font-medium">{getPriorityText(data.ticket.priority)}</p>
					</div>
					<Separator />
					{#if data.ticket.server}
						<div>
							<p class="text-muted-foreground">Betroffener Service</p>
							<p class="font-medium">{data.ticket.server.name}</p>
							<p class="text-xs text-muted-foreground mt-1">
								{data.ticket.server.type === 'VPS' ? 'VPS' : data.ticket.server.type === 'GAMESERVER' ? 'Gameserver' : 'App Hosting'}
								{#if data.ticket.server.ipAddress}
									• {data.ticket.server.ipAddress}
								{/if}
							</p>
						</div>
						<Separator />
					{/if}
					<div>
						<p class="text-muted-foreground">Erstellt</p>
						<p class="font-medium">{formatDate(data.ticket.createdAt)}</p>
					</div>
					<Separator />
					<div>
						<p class="text-muted-foreground">Zuletzt aktualisiert</p>
						<p class="font-medium">{formatDate(data.ticket.updatedAt)}</p>
					</div>
					{#if data.ticket.closedAt}
						<Separator />
						<div>
							<p class="text-muted-foreground">Geschlossen</p>
							<p class="font-medium">{formatDate(data.ticket.closedAt)}</p>
						</div>
					{/if}
				</CardContent>
			</Card>

			<!-- Quick Actions -->
			<Card class="border-border/50">
				<CardHeader>
					<CardTitle class="text-base">Schnellaktionen</CardTitle>
				</CardHeader>
				<CardContent class="space-y-2">
					<a href="/team/tickets" class="block">
						<Button variant="outline" class="w-full justify-start gap-2">
							<Icon icon="tabler:list" class="h-4 w-4" />
							Alle Tickets ansehen
						</Button>
					</a>
					{#if data.ticket.user.supportPin}
						<Button
							variant="outline"
							class="w-full justify-start gap-2"
							onclick={() => goto(`/team/customers?search=${data.ticket.user.supportPin}`)}
						>
							<Icon icon="tabler:user-search" class="h-4 w-4" />
							Kunden-Account ansehen
						</Button>
					{/if}
				</CardContent>
			</Card>
		</div>
	</div>
</div>

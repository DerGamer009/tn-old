<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import Icon from '@iconify/svelte';
	import type { PageData, ActionData } from './$types';
	import { language, type Language } from '$lib/stores/language';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	let dialogOpen = $state(false);
	let submitting = $state(false);

	// Dialog nach erfolgreichem Submit schließen
	$effect(() => {
		if (form?.success) {
			dialogOpen = false;
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

	const translations = {
		de: {
			title: 'Support Tickets',
			subtitle: 'Verwalte deine Support-Anfragen',
			newTicket: 'Neues Ticket erstellen',
			newTicketTitle: 'Neues Support-Ticket',
			newTicketDescription:
				'Beschreibe dein Problem oder deine Frage. Unser Support-Team wird sich schnellstmöglich darum kümmern.',
			serviceLabel: 'Betroffener Service (optional)',
			serviceGeneral: 'Allgemeine Anfrage',
			serviceHelpText: 'Wähle den Service aus, wenn sich dein Ticket darauf bezieht',
			subjectLabel: 'Betreff *',
			subjectPlaceholder: 'z.B. Server startet nicht',
			priorityLabel: 'Priorität *',
			descriptionLabel: 'Beschreibung *',
			descriptionPlaceholder: 'Beschreibe dein Problem so detailliert wie möglich...',
			descriptionMinChars: 'Mindestens 10 Zeichen',
			cancel: 'Abbrechen',
			creating: 'Erstellt...',
			createTicket: 'Ticket erstellen',
			statOpen: 'Offen',
			statInProgress: 'In Bearbeitung',
			statWaiting: 'Warte auf Antwort',
			statClosed: 'Geschlossen',
			noTickets: 'Keine Support-Tickets vorhanden',
			messagesSingular: 'Nachricht',
			messagesPlural: 'Nachrichten',
			createdAt: 'Erstellt am'
		},
		en: {
			title: 'Support tickets',
			subtitle: 'Manage your support requests',
			newTicket: 'Create new ticket',
			newTicketTitle: 'New support ticket',
			newTicketDescription:
				'Describe your problem or question. Our support team will take care of it as soon as possible.',
			serviceLabel: 'Affected service (optional)',
			serviceGeneral: 'General request',
			serviceHelpText: 'Select a service if your ticket refers to it',
			subjectLabel: 'Subject *',
			subjectPlaceholder: 'e.g. Server does not start',
			priorityLabel: 'Priority *',
			descriptionLabel: 'Description *',
			descriptionPlaceholder: 'Describe your problem as detailed as possible...',
			descriptionMinChars: 'At least 10 characters',
			cancel: 'Cancel',
			creating: 'Creating...',
			createTicket: 'Create ticket',
			statOpen: 'Open',
			statInProgress: 'In progress',
			statWaiting: 'Waiting for reply',
			statClosed: 'Closed',
			noTickets: 'No support tickets yet',
			messagesSingular: 'message',
			messagesPlural: 'messages',
			createdAt: 'Created at'
		}
	} satisfies Record<Language, Record<string, string>>;

	type TKey = keyof (typeof translations)['de'];

	function t(key: TKey): string {
		const lang = $language as Language;
		const dict = translations[lang] ?? translations.de;
		return dict[key] ?? translations.de[key];
	}

	function getStatusText(status: string) {
		switch (status) {
			case 'OPEN':
				return t('statOpen');
			case 'IN_PROGRESS':
				return t('statInProgress');
			case 'WAITING_FOR_CUSTOMER':
				return t('statWaiting');
			case 'CLOSED':
				return t('statClosed');
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
				return 'Low';
			case 'MEDIUM':
				return 'Medium';
			case 'HIGH':
				return 'High';
			case 'URGENT':
				return 'Urgent';
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
	<title>Support Tickets - Dashboard | TitanNode</title>
</svelte:head>

<div class="max-w-screen-2xl">
	<!-- Header -->
	<div class="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
		<div>
			<h1 class="text-2xl sm:text-3xl font-bold flex items-center gap-2 flex-wrap">
				<Icon icon="tabler:ticket" class="h-8 w-8 text-primary" />
				{t('title')}
			</h1>
			<p class="mt-2 text-muted-foreground">{t('subtitle')}</p>
		</div>

		<!-- Create Ticket Dialog -->
		<Dialog bind:open={dialogOpen}>
			<DialogTrigger class="inline-flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50">
				<Icon icon="tabler:plus" class="h-4 w-4" />
				{t('newTicket')}
			</DialogTrigger>
			<DialogContent class="sm:max-w-[600px]">
				<form method="POST" action="?/create" use:enhance={() => {
					submitting = true;
					return async ({ update }) => {
						await update();
						submitting = false;
					};
				}}>
					<DialogHeader>
						<DialogTitle>{t('newTicketTitle')}</DialogTitle>
						<DialogDescription>
							{t('newTicketDescription')}
						</DialogDescription>
					</DialogHeader>

					{#if form?.error}
						<div class="rounded-lg border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-700 dark:text-red-400">
							{form.error}
						</div>
					{/if}

					<div class="grid gap-4 py-4">
						<!-- Service-Auswahl -->
						<div class="grid gap-2">
							<Label for="serverId">{t('serviceLabel')}</Label>
							<select
								id="serverId"
								name="serverId"
								class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
							>
								<option value="general">{t('serviceGeneral')}</option>
								{#if data.servers && data.servers.length > 0}
									<optgroup label="Deine Services">
										{#each data.servers as server}
											<option value={server.id}>
												{server.name} ({server.type === 'VPS' ? 'VPS' : server.type === 'GAMESERVER' ? 'Gameserver' : 'App Hosting'})
												{#if server.ipAddress}
													- {server.ipAddress}
												{/if}
											</option>
										{/each}
									</optgroup>
								{/if}
							</select>
							<p class="text-xs text-muted-foreground">
								{t('serviceHelpText')}
							</p>
						</div>

						<!-- Betreff -->
						<div class="grid gap-2">
							<Label for="subject">{t('subjectLabel')}</Label>
							<Input
								id="subject"
								name="subject"
								placeholder={t('subjectPlaceholder')}
								required
								minlength={5}
							/>
						</div>

						<!-- Priorität -->
						<div class="grid gap-2">
							<Label for="priority">{t('priorityLabel')}</Label>
							<select
								id="priority"
								name="priority"
								required
								class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
							>
								<option value="MEDIUM">Medium</option>
								<option value="LOW">Low</option>
								<option value="HIGH">High</option>
								<option value="URGENT">Urgent</option>
							</select>
						</div>

						<!-- Beschreibung -->
						<div class="grid gap-2">
							<Label for="description">{t('descriptionLabel')}</Label>
							<Textarea
								id="description"
								name="description"
								placeholder={t('descriptionPlaceholder')}
								rows={6}
								required
								minlength={10}
							/>
							<p class="text-xs text-muted-foreground">
								{t('descriptionMinChars')}
							</p>
						</div>
					</div>

					<DialogFooter>
						<Button type="button" variant="outline" onclick={() => dialogOpen = false}>
							{t('cancel')}
						</Button>
						<Button type="submit" disabled={submitting}>
							{#if submitting}
								<Icon icon="tabler:loader-2" class="mr-2 h-4 w-4 animate-spin" />
								{t('creating')}
							{:else}
								{t('createTicket')}
							{/if}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	</div>

	<!-- Stats -->
	<div class="mb-6 sm:mb-8 grid gap-4 sm:gap-6 grid-cols-2 sm:grid-cols-4">
		<Card class="border-border/50">
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium text-muted-foreground">
					{t('statOpen')}
				</CardTitle>
				<Icon icon="tabler:circle-dot" class="h-5 w-5 text-blue-500" />
			</CardHeader>
			<CardContent>
				<div class="text-3xl font-bold">{data.stats.open}</div>
			</CardContent>
		</Card>

		<Card class="border-border/50">
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium text-muted-foreground">
					{t('statInProgress')}
				</CardTitle>
				<Icon icon="tabler:clock" class="h-5 w-5 text-orange-500" />
			</CardHeader>
			<CardContent>
				<div class="text-3xl font-bold">{data.stats.inProgress}</div>
			</CardContent>
		</Card>

		<Card class="border-border/50">
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium text-muted-foreground">
					{t('statWaiting')}
				</CardTitle>
				<Icon icon="tabler:message-circle" class="h-5 w-5 text-yellow-500" />
			</CardHeader>
			<CardContent>
				<div class="text-3xl font-bold">{data.stats.waitingForCustomer}</div>
			</CardContent>
		</Card>

		<Card class="border-border/50">
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium text-muted-foreground">
					{t('statClosed')}
				</CardTitle>
				<Icon icon="tabler:circle-check" class="h-5 w-5 text-green-500" />
			</CardHeader>
			<CardContent>
				<div class="text-3xl font-bold">{data.stats.closed}</div>
			</CardContent>
		</Card>
	</div>

	<!-- Tickets List -->
	{#if data.tickets && data.tickets.length > 0}
		<div class="space-y-4">
			{#each data.tickets as ticket}
				<Card class="border-border/50 transition-colors hover:bg-muted/50">
					<CardContent class="p-6">
						<a href="/dashboard/tickets/{ticket.id}" class="block">
							<div class="flex items-start justify-between gap-4">
								<div class="flex-1 space-y-3">
									<!-- Header -->
									<div class="flex items-start gap-3">
										<div class="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
											<Icon icon="tabler:ticket" class="h-5 w-5 text-primary" />
										</div>
										<div class="flex-1">
											<h3 class="font-semibold text-lg">{ticket.subject}</h3>
											<p class="text-sm text-muted-foreground">
												{t('createdAt')} {formatDate(ticket.createdAt)}
											</p>
										</div>
									</div>

									<!-- Description Preview -->
									<p class="text-sm text-muted-foreground line-clamp-2">
										{ticket.description}
									</p>

									<!-- Meta Info -->
									<div class="flex flex-wrap items-center gap-2">
										<Badge variant="outline" class={getStatusColor(ticket.status)}>
											{getStatusText(ticket.status)}
										</Badge>
										<Badge variant="outline" class={getPriorityColor(ticket.priority)}>
											{getPriorityText(ticket.priority)}
										</Badge>
										{#if ticket.server}
											<Badge variant="outline" class="bg-primary/5 text-primary border-primary/20">
												<Icon icon="tabler:server" class="mr-1 h-3 w-3" />
												{ticket.server.name}
											</Badge>
										{/if}
										<div class="flex items-center gap-1 text-xs text-muted-foreground">
											<Icon icon="tabler:message" class="h-3.5 w-3.5" />
											{ticket._count.messages}
											{ticket._count.messages === 1 ? ` ${t('messagesSingular')}` : ` ${t('messagesPlural')}`}
										</div>
									</div>
								</div>

								<!-- Action Button -->
								<Button variant="ghost" size="icon">
									<Icon icon="tabler:chevron-right" class="h-5 w-5" />
								</Button>
							</div>
						</a>
					</CardContent>
				</Card>
			{/each}
		</div>
	{:else}
		<!-- Empty State -->
		<Card class="border-border/50">
			<CardContent class="flex flex-col items-center justify-center py-16">
				<div class="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-muted">
					<Icon icon="tabler:ticket-off" class="h-14 w-14 text-muted-foreground" />
				</div>
				<p class="mb-6 text-lg text-muted-foreground">{t('noTickets')}</p>
				<Button onclick={() => dialogOpen = true}>
					<Icon icon="tabler:plus" class="mr-2 h-4 w-4" />
					Neues Ticket erstellen
				</Button>
			</CardContent>
		</Card>
	{/if}
</div>

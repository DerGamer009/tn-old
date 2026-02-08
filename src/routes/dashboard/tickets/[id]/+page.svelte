<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Textarea } from '$lib/components/ui/textarea';
import { Separator } from '$lib/components/ui/separator';
import Icon from '@iconify/svelte';
import type { PageData, ActionData } from './$types';
import { language, type Language } from '$lib/stores/language';

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

const translations = {
	de: {
		backToTickets: 'Zurück zu Tickets',
		createdAt: 'Erstellt am',
		closeTicket: 'Ticket schließen',
		reopenTicket: 'Ticket wieder öffnen',
		addReply: 'Antwort hinzufügen',
		replyPlaceholder: 'Schreibe deine Nachricht...',
		sending: 'Sendet...',
		sendMessage: 'Nachricht senden',
		closedInfo:
			'Dieses Ticket ist geschlossen. Öffne es erneut, um eine Nachricht zu senden.',
		infoTitle: 'Ticket-Informationen',
		infoTicketId: 'Ticket-ID',
		infoStatus: 'Status',
		infoPriority: 'Priorität',
		infoService: 'Betroffener Service',
		infoCreated: 'Erstellt',
		infoUpdated: 'Zuletzt aktualisiert',
		infoClosed: 'Geschlossen',
		quickActionsTitle: 'Schnellaktionen',
		viewAllTickets: 'Alle Tickets ansehen',
		supportCenter: 'Support-Center',
		statusOpen: 'Offen',
		statusInProgress: 'In Bearbeitung',
		statusWaiting: 'Warte auf Antwort',
		statusClosed: 'Geschlossen',
		priorityLow: 'Niedrig',
		priorityMedium: 'Mittel',
		priorityHigh: 'Hoch',
		priorityUrgent: 'Dringend'
	},
	en: {
		backToTickets: 'Back to tickets',
		createdAt: 'Created at',
		closeTicket: 'Close ticket',
		reopenTicket: 'Re-open ticket',
		addReply: 'Add reply',
		replyPlaceholder: 'Write your message...',
		sending: 'Sending...',
		sendMessage: 'Send message',
		closedInfo:
			'This ticket is closed. Re-open it to send a new message.',
		infoTitle: 'Ticket information',
		infoTicketId: 'Ticket ID',
		infoStatus: 'Status',
		infoPriority: 'Priority',
		infoService: 'Affected service',
		infoCreated: 'Created',
		infoUpdated: 'Last updated',
		infoClosed: 'Closed',
		quickActionsTitle: 'Quick actions',
		viewAllTickets: 'View all tickets',
		supportCenter: 'Support center',
		statusOpen: 'Open',
		statusInProgress: 'In progress',
		statusWaiting: 'Waiting for reply',
		statusClosed: 'Closed',
		priorityLow: 'Low',
		priorityMedium: 'Medium',
		priorityHigh: 'High',
		priorityUrgent: 'Urgent'
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
			return t('statusOpen');
		case 'IN_PROGRESS':
			return t('statusInProgress');
		case 'WAITING_FOR_CUSTOMER':
			return t('statusWaiting');
		case 'CLOSED':
			return t('statusClosed');
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
			return t('priorityLow');
		case 'MEDIUM':
			return t('priorityMedium');
		case 'HIGH':
			return t('priorityHigh');
		case 'URGENT':
			return t('priorityUrgent');
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
	<title>{data.ticket.subject} - Support Ticket | TitanNode</title>
</svelte:head>

<div class="max-w-screen-xl">
	<!-- Header -->
	<div class="mb-8">
		<a href="/dashboard/tickets" class="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
			<Icon icon="tabler:arrow-left" class="h-4 w-4" />
			{t('backToTickets')}
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
						{t('createdAt')} {formatDate(data.ticket.createdAt)}
					</span>
				</div>
			</div>

			<!-- Status Actions -->
			{#if data.ticket.status !== 'CLOSED'}
				<form method="POST" action="?/updateStatus" use:enhance>
					<input type="hidden" name="status" value="CLOSED" />
					<Button type="submit" variant="outline" class="gap-2">
						<Icon icon="tabler:check" class="h-4 w-4" />
						{t('closeTicket')}
					</Button>
				</form>
			{:else}
				<form method="POST" action="?/updateStatus" use:enhance>
					<input type="hidden" name="status" value="OPEN" />
					<Button type="submit" variant="outline" class="gap-2">
						<Icon icon="tabler:arrow-back-up" class="h-4 w-4" />
						{t('reopenTicket')}
					</Button>
				</form>
			{/if}
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
							<CardTitle class="text-base">{data.ticket.user.firstName} {data.ticket.user.lastName}</CardTitle>
							<p class="text-sm text-muted-foreground">{formatDate(data.ticket.createdAt)}</p>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					<p class="whitespace-pre-wrap text-sm">{data.ticket.description}</p>
				</CardContent>
			</Card>

			<!-- Messages -->
			{#each data.ticket.messages as message}
				<Card class="border-border/50 {message.isStaff ? 'bg-primary/5' : ''}">
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
									<CardTitle class="text-base">{data.ticket.user.firstName} {data.ticket.user.lastName}</CardTitle>
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
						<CardTitle>{t('addReply')}</CardTitle>
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
									placeholder={t('replyPlaceholder')}
									rows={5}
									required
								/>
								<div class="flex justify-end">
									<Button type="submit" disabled={submitting || !messageText.trim()}>
										{#if submitting}
											<Icon icon="tabler:loader-2" class="mr-2 h-4 w-4 animate-spin" />
											{t('sending')}
										{:else}
											<Icon icon="tabler:send" class="mr-2 h-4 w-4" />
											{t('sendMessage')}
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
							{t('closedInfo')}
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
					<CardTitle class="text-base">{t('infoTitle')}</CardTitle>
				</CardHeader>
				<CardContent class="space-y-4 text-sm">
					<div>
						<p class="text-muted-foreground">{t('infoTicketId')}</p>
						<p class="font-mono text-xs">{data.ticket.id}</p>
					</div>
					<Separator />
					<div>
						<p class="text-muted-foreground">{t('infoStatus')}</p>
						<p class="font-medium">{getStatusText(data.ticket.status)}</p>
					</div>
					<Separator />
					<div>
						<p class="text-muted-foreground">{t('infoPriority')}</p>
						<p class="font-medium">{getPriorityText(data.ticket.priority)}</p>
					</div>
					<Separator />
					{#if data.ticket.server}
						<div>
							<p class="text-muted-foreground">{t('infoService')}</p>
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
						<p class="text-muted-foreground">{t('infoCreated')}</p>
						<p class="font-medium">{formatDate(data.ticket.createdAt)}</p>
					</div>
					<Separator />
					<div>
						<p class="text-muted-foreground">{t('infoUpdated')}</p>
						<p class="font-medium">{formatDate(data.ticket.updatedAt)}</p>
					</div>
					{#if data.ticket.closedAt}
						<Separator />
						<div>
							<p class="text-muted-foreground">{t('infoClosed')}</p>
							<p class="font-medium">{formatDate(data.ticket.closedAt)}</p>
						</div>
					{/if}
				</CardContent>
			</Card>

			<!-- Quick Actions -->
			<Card class="border-border/50">
				<CardHeader>
					<CardTitle class="text-base">{t('quickActionsTitle')}</CardTitle>
				</CardHeader>
				<CardContent class="space-y-2">
					<a href="/dashboard/tickets" class="block">
						<Button variant="outline" class="w-full justify-start gap-2">
							<Icon icon="tabler:list" class="h-4 w-4" />
							{t('viewAllTickets')}
						</Button>
					</a>
					<a href="/support" class="block">
						<Button variant="outline" class="w-full justify-start gap-2">
							<Icon icon="tabler:help" class="h-4 w-4" />
							{t('supportCenter')}
						</Button>
					</a>
				</CardContent>
			</Card>
		</div>
	</div>
</div>


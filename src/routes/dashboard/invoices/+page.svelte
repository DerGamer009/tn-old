<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import Icon from '@iconify/svelte';
	import type { PageData } from './$types';
	import { goto } from '$app/navigation';
	import { language, type Language } from '$lib/stores/language';

	let { data }: { data: PageData } = $props();

	function formatDate(date: Date | string): string {
		const d = new Date(date);
		return d.toLocaleDateString('de-DE', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric'
		});
	}

	function formatCurrency(amount: number): string {
		return `€${amount.toFixed(2).replace('.', ',')}`;
	}

	const translations = {
		de: {
			title: 'Rechnungen',
			subtitle: 'Übersicht aller Rechnungen und Zahlungen',
			statsOpen: 'Offene Rechnungen',
			statsPaid: 'Bezahlt',
			statsOverdue: 'Überfällig',
			statsTotalSuffix: 'gesamt',
			allInvoices: 'Alle Rechnungen',
			amount: 'Betrag:',
			created: 'Erstellt:',
			due: 'Fällig:',
			servicesCount: 'Service(s)',
			details: 'Details',
			pdf: 'PDF',
			emptyTitle: 'Keine Rechnungen vorhanden',
			emptyText: 'Rechnungen erscheinen hier nach deiner ersten Bestellung',
			statusPaid: 'Bezahlt',
			statusUnpaid: 'Offen',
			statusOverdue: 'Überfällig',
			statusCancelled: 'Storniert'
		},
		en: {
			title: 'Invoices',
			subtitle: 'Overview of all invoices and payments',
			statsOpen: 'Open invoices',
			statsPaid: 'Paid',
			statsOverdue: 'Overdue',
			statsTotalSuffix: 'total',
			allInvoices: 'All invoices',
			amount: 'Amount:',
			created: 'Created:',
			due: 'Due:',
			servicesCount: 'service(s)',
			details: 'Details',
			pdf: 'PDF',
			emptyTitle: 'No invoices yet',
			emptyText: 'Invoices will appear here after your first order',
			statusPaid: 'Paid',
			statusUnpaid: 'Open',
			statusOverdue: 'Overdue',
			statusCancelled: 'Cancelled'
		}
	} satisfies Record<Language, Record<string, string>>;

	type TKey = keyof (typeof translations)['de'];

	function t(key: TKey): string {
		const lang = $language as Language;
		const dict = translations[lang] ?? translations.de;
		return dict[key] ?? translations.de[key];
	}

	function getStatusBadge(status: string) {
		switch (status) {
			case 'PAID':
				return { label: t('statusPaid'), variant: 'default' as const, color: 'text-green-500' };
			case 'UNPAID':
				return { label: t('statusUnpaid'), variant: 'secondary' as const, color: 'text-orange-500' };
			case 'OVERDUE':
				return { label: t('statusOverdue'), variant: 'destructive' as const, color: 'text-red-500' };
			case 'CANCELLED':
				return { label: t('statusCancelled'), variant: 'outline' as const, color: 'text-gray-500' };
			default:
				return { label: status, variant: 'outline' as const, color: 'text-gray-500' };
		}
	}

	function downloadPDF(invoiceId: string) {
		window.open(`/api/invoices/${invoiceId}/pdf`, '_blank');
	}
</script>

<svelte:head>
	<title>{t('title')} - Dashboard | TitanNode</title>
</svelte:head>

<div class="max-w-screen-2xl">
	<!-- Header -->
	<div class="mb-6 sm:mb-8">
		<h1 class="text-2xl sm:text-3xl font-bold flex items-center gap-2 flex-wrap">
			<Icon icon="tabler:receipt" class="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
			<span>{t('title')}</span>
		</h1>
		<p class="mt-2 text-sm sm:text-base text-muted-foreground">{t('subtitle')}</p>
	</div>

	<!-- Stats -->
	<div class="mb-6 sm:mb-8 grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-3">
		<Card class="border-border/50">
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium text-muted-foreground">
					{t('statsOpen')}
				</CardTitle>
				<Icon icon="tabler:clock" class="h-5 w-5 text-orange-500" />
			</CardHeader>
			<CardContent>
				<div class="text-3xl font-bold">{data.stats.unpaid.count}</div>
				<p class="text-xs text-muted-foreground mt-1">
					{formatCurrency(data.stats.unpaid.sum)} {t('statsTotalSuffix')}
				</p>
			</CardContent>
		</Card>

		<Card class="border-border/50">
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium text-muted-foreground">
					{t('statsPaid')}
				</CardTitle>
				<Icon icon="tabler:circle-check" class="h-5 w-5 text-green-500" />
			</CardHeader>
			<CardContent>
				<div class="text-3xl font-bold">{data.stats.paid.count}</div>
				<p class="text-xs text-muted-foreground mt-1">
					{formatCurrency(data.stats.paid.sum)} {t('statsTotalSuffix')}
				</p>
			</CardContent>
		</Card>

		<Card class="border-border/50">
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium text-muted-foreground">
					{t('statsOverdue')}
				</CardTitle>
				<Icon icon="tabler:alert-circle" class="h-5 w-5 text-red-500" />
			</CardHeader>
			<CardContent>
				<div class="text-3xl font-bold">{data.stats.overdue.count}</div>
				<p class="text-xs text-muted-foreground mt-1">
					{formatCurrency(data.stats.overdue.sum)} {t('statsTotalSuffix')}
				</p>
			</CardContent>
		</Card>
	</div>

	<!-- Invoice List -->
	{#if data.invoices.length > 0}
		<Card class="border-border/50">
			<CardHeader>
				<CardTitle>{t('allInvoices')}</CardTitle>
			</CardHeader>
			<CardContent>
				<div class="space-y-3">
					{#each data.invoices as invoice}
						<div class="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors">
							<div class="flex-1">
								<div class="flex items-center gap-3 mb-2">
									<h3 class="font-semibold">Rechnung {invoice.invoiceNumber}</h3>
									<Badge variant={getStatusBadge(invoice.status).variant}>
										{getStatusBadge(invoice.status).label}
									</Badge>
								</div>
								<div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
									<div>
										<span class="font-medium">{t('amount')}</span> {formatCurrency(invoice.amount)}
									</div>
									<div>
										<span class="font-medium">{t('created')}</span> {formatDate(invoice.createdAt)}
									</div>
									<div>
										<span class="font-medium">{t('due')}</span> {formatDate(invoice.dueDate)}
									</div>
								</div>
								{#if invoice.order && invoice.order.servers && invoice.order.servers.length > 0}
									<div class="mt-2 text-xs text-muted-foreground">
										{invoice.order.servers.length} {t('servicesCount')}
									</div>
								{/if}
							</div>
							<div class="flex gap-2">
								<Button
									variant="outline"
									size="sm"
									onclick={() => goto(`/dashboard/invoices/${invoice.id}`)}
								>
									<Icon icon="tabler:eye" class="h-4 w-4 mr-2" />
									{t('details')}
								</Button>
								<Button
									variant="outline"
									size="sm"
									onclick={() => downloadPDF(invoice.id)}
								>
									<Icon icon="tabler:download" class="h-4 w-4 mr-2" />
									{t('pdf')}
								</Button>
							</div>
						</div>
					{/each}
				</div>
			</CardContent>
		</Card>
	{:else}
		<!-- Empty State -->
		<Card class="border-border/50">
			<CardContent class="flex flex-col items-center justify-center py-16">
				<div class="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-muted">
					<Icon icon="tabler:receipt-off" class="h-14 w-14 text-muted-foreground" />
				</div>
				<p class="mb-2 text-lg text-muted-foreground">{t('emptyTitle')}</p>
				<p class="text-sm text-muted-foreground">{t('emptyText')}</p>
			</CardContent>
		</Card>
	{/if}
</div>


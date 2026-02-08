<script lang="ts">
	import type { PageData } from './$types';
	import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import Icon from '@iconify/svelte';
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
			back: 'Zurück',
			titlePrefix: 'Rechnung',
			createdAt: 'Erstellt am',
			downloadPdf: 'PDF herunterladen',
			detailsTitle: 'Rechnungsdetails',
			invoiceNumber: 'Rechnungsnummer',
			amount: 'Betrag',
			dueDate: 'Fälligkeitsdatum',
			createdDate: 'Erstellt am',
			paidAt: 'Bezahlt am',
			positionsTitle: 'Rechnungspositionen',
			positionsSubtitle: 'Services in dieser Rechnung',
			monthly: 'monatlich',
			totalAmount: 'Gesamtbetrag',
			recipientTitle: 'Rechnungsempfänger',
			statusPaid: 'Bezahlt',
			statusUnpaid: 'Offen',
			statusOverdue: 'Überfällig',
			statusCancelled: 'Storniert'
		},
		en: {
			back: 'Back',
			titlePrefix: 'Invoice',
			createdAt: 'Created at',
			downloadPdf: 'Download PDF',
			detailsTitle: 'Invoice details',
			invoiceNumber: 'Invoice number',
			amount: 'Amount',
			dueDate: 'Due date',
			createdDate: 'Created',
			paidAt: 'Paid at',
			positionsTitle: 'Invoice items',
			positionsSubtitle: 'Services in this invoice',
			monthly: 'per month',
			totalAmount: 'Total amount',
			recipientTitle: 'Invoice recipient',
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
				return { label: t('statusPaid'), variant: 'default' as const };
			case 'UNPAID':
				return { label: t('statusUnpaid'), variant: 'secondary' as const };
			case 'OVERDUE':
				return { label: t('statusOverdue'), variant: 'destructive' as const };
			case 'CANCELLED':
				return { label: t('statusCancelled'), variant: 'outline' as const };
			default:
				return { label: status, variant: 'outline' as const };
		}
	}

	function downloadPDF() {
		window.open(`/api/invoices/${data.invoice.id}/pdf`, '_blank');
	}
</script>

<svelte:head>
	<title>{t('titlePrefix')} {data.invoice.invoiceNumber} | TitanNode Dashboard</title>
</svelte:head>

<div class="max-w-4xl space-y-6">
	<div class="flex items-center justify-between">
		<div class="flex items-center gap-3">
			<Button variant="ghost" size="sm" onclick={() => goto('/dashboard/invoices')}>
				<Icon icon="tabler:arrow-left" class="h-4 w-4 mr-2" />
				{t('back')}
			</Button>
			<div>
				<h1 class="text-3xl font-bold">
					{t('titlePrefix')} {data.invoice.invoiceNumber}
				</h1>
				<p class="text-sm text-muted-foreground mt-1">
					{t('createdAt')} {formatDate(data.invoice.createdAt)}
				</p>
			</div>
		</div>
		<Button onclick={() => downloadPDF()}>
			<Icon icon="tabler:download" class="h-4 w-4 mr-2" />
			{t('downloadPdf')}
		</Button>
	</div>

	<Card class="border-border/50">
		<CardHeader>
			<div class="flex items-center justify-between">
				<CardTitle>{t('detailsTitle')}</CardTitle>
				<Badge variant={getStatusBadge(data.invoice.status).variant}>
					{getStatusBadge(data.invoice.status).label}
				</Badge>
			</div>
		</CardHeader>
		<CardContent class="space-y-6">
			<div class="grid grid-cols-2 gap-6">
				<div>
					<p class="text-sm font-medium text-muted-foreground mb-1">
						{t('invoiceNumber')}
					</p>
					<p class="font-mono">{data.invoice.invoiceNumber}</p>
				</div>
				<div>
					<p class="text-sm font-medium text-muted-foreground mb-1">
						{t('amount')}
					</p>
					<p class="text-2xl font-bold">{formatCurrency(data.invoice.amount)}</p>
				</div>
				<div>
					<p class="text-sm font-medium text-muted-foreground mb-1">
						{t('dueDate')}
					</p>
					<p>{formatDate(data.invoice.dueDate)}</p>
				</div>
				<div>
					<p class="text-sm font-medium text-muted-foreground mb-1">
						{t('createdDate')}
					</p>
					<p>{formatDate(data.invoice.createdAt)}</p>
				</div>
				{#if data.invoice.paidAt}
					<div>
						<p class="text-sm font-medium text-muted-foreground mb-1">
							{t('paidAt')}
						</p>
						<p>{formatDate(data.invoice.paidAt)}</p>
					</div>
				{/if}
			</div>
		</CardContent>
	</Card>

	{#if data.invoice.order && data.invoice.order.servers && data.invoice.order.servers.length > 0}
		<Card class="border-border/50">
			<CardHeader>
				<CardTitle>{t('positionsTitle')}</CardTitle>
				<CardDescription>
					{t('positionsSubtitle')}
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div class="space-y-4">
					{#each data.invoice.order.servers as server}
						<div class="flex items-center justify-between p-4 border rounded-lg">
							<div>
								<h3 class="font-semibold">{server.name}</h3>
								<p class="text-sm text-muted-foreground">
									{server.type} - {server.cpu} vCPU, {server.ram} GB RAM, {server.storage} GB Storage
								</p>
							</div>
							<div class="text-right">
								<p class="font-semibold">{formatCurrency(server.priceMonthly)}</p>
								<p class="text-xs text-muted-foreground">{t('monthly')}</p>
							</div>
						</div>
					{/each}
					<div class="flex items-center justify-between pt-4 border-t">
						<p class="text-lg font-semibold">{t('totalAmount')}</p>
						<p class="text-2xl font-bold">{formatCurrency(data.invoice.amount)}</p>
					</div>
				</div>
			</CardContent>
		</Card>
	{/if}

	<Card class="border-border/50">
		<CardHeader>
			<CardTitle>{t('recipientTitle')}</CardTitle>
		</CardHeader>
		<CardContent>
			<div class="space-y-2">
				<p class="font-semibold">{data.invoice.user.firstName} {data.invoice.user.lastName}</p>
				<p class="text-muted-foreground">{data.invoice.user.email}</p>
			</div>
		</CardContent>
	</Card>
</div>

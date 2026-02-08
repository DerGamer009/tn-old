<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import Icon from '@iconify/svelte';
	import LiveChat from '$lib/components/LiveChat.svelte';
	import type { PageData } from './$types';
	import { language, type Language } from '$lib/stores/language';

	let { data }: { data: PageData } = $props();

	const translations = {
		de: {
			emailVerificationTitle: 'Email-Bestätigung erforderlich',
			emailVerificationText:
				'Bitte bestätige deine Email-Adresse, um alle Funktionen nutzen zu können.',
			emailCheckInboxTitle: 'Prüfe dein Postfach',
			emailCheckInboxSubtitle: 'Bestätigungslink wurde gesendet',
			emailResendSending: 'Sendet...',
			emailResend: 'Email erneut senden',
			emailResentSuccess: '✓ Email gesendet!',
			emailResentErrorFallback: 'Ein Fehler ist aufgetreten',
			welcome: 'Willkommen',
			credits: 'Guthaben',
			services: 'Services',
			pendingInvoices: 'Offene Rechnungen',
			pendingInvoicesTotal: 'gesamt',
			ticketsOpened: 'Erstellte Tickets',
			supportPin: 'Support-PIN',
			yourServices: 'Deine Services',
			viewAll: 'Alle anzeigen',
			noServices: 'Du hast derzeit keine Services bei uns',
			orderNow: 'Jetzt bestellen',
			allServices: 'Alle Services anzeigen',
			recentActivity: 'Letzte Aktivitäten',
			noActivity: 'Keine Login-Aktivitäten vorhanden',
			announcements: 'Ankündigungen',
			noAnnouncements: 'Keine Ankündigungen vorhanden',
			socialLinks: 'Social-Media-Links'
		},
		en: {
			emailVerificationTitle: 'Email verification required',
			emailVerificationText:
				'Please verify your email address to use all features.',
			emailCheckInboxTitle: 'Check your inbox',
			emailCheckInboxSubtitle: 'Verification link has been sent',
			emailResendSending: 'Sending...',
			emailResend: 'Resend email',
			emailResentSuccess: '✓ Email sent!',
			emailResentErrorFallback: 'An error occurred',
			welcome: 'Welcome',
			credits: 'Credits',
			services: 'Services',
			pendingInvoices: 'Pending invoices',
			pendingInvoicesTotal: 'total',
			ticketsOpened: 'Tickets opened',
			supportPin: 'Support PIN',
			yourServices: 'Your services',
			viewAll: 'View all',
			noServices: 'You currently have no services with us',
			orderNow: 'Order now',
			allServices: 'Show all services',
			recentActivity: 'Recent activity',
			noActivity: 'No login activity yet',
			announcements: 'Announcements',
			noAnnouncements: 'No announcements available',
			socialLinks: 'Social media links'
		}
	} satisfies Record<Language, Record<string, string>>;

	type TKey = keyof (typeof translations)['de'];

	function t(key: TKey): string {
		const lang = $language as Language;
		const dict = translations[lang] ?? translations.de;
		return dict[key] ?? translations.de[key];
	}

	// Formatiere Datum
	function formatDate(date: Date) {
		return new Date(date).toLocaleString('de-DE', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	// Formatiere Announcement-Datum
	function formatAnnouncementDate(date: Date) {
		return new Date(date).toLocaleString('de-DE', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	// Social Media Links
	const socialLinks = [
		{ platform: 'YouTube', username: '@TitanNode-x1h', icon: 'tabler:brand-youtube', url: 'https://www.youtube.com/@TitanNode-x1h' },
		{ platform: 'Discord', username: 'TitanNode', icon: 'tabler:brand-discord', url: 'https://discord.gg/ZwcAMMjttn' },
		{ platform: 'GitHub', username: 'TitanNode', icon: 'tabler:brand-github', url: 'https://github.com/TitanNode' }
	];

	function getServiceHref(server: { id: string; type: string }) {
		if (server.type === 'VPS') return `/dashboard/vps/${server.id}`;
		if (server.type === 'GAMESERVER') return `/dashboard/gameserver/${server.id}`;
		if (server.type === 'APP_HOSTING') return `/dashboard/apps/${server.id}`;
		return `/dashboard/vps/${server.id}`;
	}

	// Email erneut senden
	let resendingEmail = $state(false);
	let resendSuccess = $state(false);
	let resendError = $state('');

	async function resendVerificationEmail() {
		resendingEmail = true;
		resendSuccess = false;
		resendError = '';

		try {
			const response = await fetch('/api/resend-verification', {
				method: 'POST'
			});

			const result = await response.json();

			if (response.ok && result.success) {
				resendSuccess = true;
				// Success-Nachricht nach 5 Sekunden ausblenden
				setTimeout(() => {
					resendSuccess = false;
				}, 5000);
			} else {
				resendError = result.error || 'Fehler beim Senden';
			}
		} catch (error) {
			console.error('Error resending email:', error);
			resendError = t('emailResentErrorFallback');
		} finally {
			resendingEmail = false;
		}
	}
</script>

<svelte:head>
	<title>Dashboard - TitanNode</title>
</svelte:head>

<div class="max-w-screen-2xl">
		<!-- Email Verification Banner -->
		{#if !data.user.emailVerified}
			<div class="mb-6 rounded-lg border border-yellow-500/50 bg-yellow-500/10 p-4">
				<div class="mb-3 flex items-center gap-2">
					<Icon icon="tabler:alert-circle" class="h-5 w-5 text-yellow-600 dark:text-yellow-500" />
					<h3 class="font-semibold text-yellow-700 dark:text-yellow-400">
						{t('emailVerificationTitle')}
					</h3>
				</div>
				<p class="mb-4 text-sm text-yellow-700/90 dark:text-yellow-400/90">
					{t('emailVerificationText')}
				</p>
				<div class="flex flex-col gap-3 rounded-lg border border-yellow-500/30 bg-yellow-500/5 p-3 sm:flex-row sm:items-center sm:justify-between">
					<div class="flex items-center gap-3">
						<div class="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-500/20">
							<Icon icon="tabler:mail" class="h-5 w-5 text-yellow-600 dark:text-yellow-500" />
						</div>
						<div>
							<p class="text-sm font-medium text-yellow-700 dark:text-yellow-400">
								{t('emailCheckInboxTitle')}
							</p>
							<p class="text-xs text-yellow-600/80 dark:text-yellow-500/80">
								{t('emailCheckInboxSubtitle')}
							</p>
						</div>
					</div>
					
					<!-- Resend Email Button -->
					<div class="flex flex-col gap-2 sm:items-end">
						<Button 
							size="sm" 
							variant="outline" 
							class="h-9"
							onclick={resendVerificationEmail}
							disabled={resendingEmail}
						>
							{#if resendingEmail}
								<Icon icon="tabler:loader-2" class="mr-2 h-4 w-4 animate-spin" />
								{t('emailResendSending')}
							{:else}
								<Icon icon="tabler:mail-forward" class="mr-2 h-4 w-4" />
								{t('emailResend')}
							{/if}
						</Button>
						
						{#if resendSuccess}
							<span class="text-xs text-green-600 dark:text-green-500">
								{t('emailResentSuccess')}
							</span>
						{/if}
						
						{#if resendError}
							<span class="text-xs text-red-600 dark:text-red-500">
								{resendError}
							</span>
						{/if}
					</div>
				</div>
			</div>
		{/if}

		<!-- Welcome Header -->
		<div class="mb-6 sm:mb-8">
			<h1 class="text-2xl sm:text-3xl font-bold flex items-center gap-2 flex-wrap">
				<Icon icon="tabler:hand-stop" class="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
				<span>{t('welcome')} {data.user.firstName} {data.user.lastName}.</span>
			</h1>
		</div>

		<!-- Stats Grid -->
		<div class="mb-8 grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
			<!-- Credits -->
			<Card class="border-border/50">
				<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle class="text-sm font-medium text-muted-foreground">
						{t('credits')}
					</CardTitle>
					<Icon icon="tabler:currency-euro" class="h-5 w-5 text-muted-foreground" />
				</CardHeader>
				<CardContent>
					<div class="text-3xl font-bold">€{data.stats.credits.toFixed(2).replace('.', ',')}</div>
				</CardContent>
			</Card>

			<!-- Services -->
			<Card class="border-border/50">
				<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle class="text-sm font-medium text-muted-foreground">
						{t('services')}
					</CardTitle>
					<Icon icon="tabler:server-2" class="h-5 w-5 text-muted-foreground" />
				</CardHeader>
				<CardContent>
					<div class="text-3xl font-bold">{data.stats.services}</div>
				</CardContent>
			</Card>

			<!-- Pending Invoices -->
			<Card class="border-border/50">
				<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle class="text-sm font-medium text-muted-foreground">
						{t('pendingInvoices')}
					</CardTitle>
					<Icon icon="tabler:receipt" class="h-5 w-5 text-muted-foreground" />
				</CardHeader>
					<CardContent>
						<div class="text-3xl font-bold">{data.stats.pendingInvoices}</div>
						{#if data.stats.pendingInvoices > 0}
							<p class="text-xs text-muted-foreground mt-1">
								€{data.stats.pendingInvoicesAmount.toFixed(2).replace('.', ',')} {t('pendingInvoicesTotal')}
							</p>
						{/if}
					</CardContent>
			</Card>

			<!-- Tickets Opened -->
			<Card class="border-border/50">
				<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle class="text-sm font-medium text-muted-foreground">
						{t('ticketsOpened')}
					</CardTitle>
					<Icon icon="tabler:ticket" class="h-5 w-5 text-muted-foreground" />
				</CardHeader>
				<CardContent>
					<div class="text-3xl font-bold">{data.stats.ticketsOpened}</div>
				</CardContent>
			</Card>

			<!-- Support PIN -->
			<Card class="border-border/50">
				<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle class="text-sm font-medium text-muted-foreground">
						{t('supportPin')}
					</CardTitle>
					<Icon icon="tabler:key" class="h-5 w-5 text-muted-foreground" />
				</CardHeader>
				<CardContent>
					{#if data.user.supportPin}
						<div class="text-2xl font-mono font-semibold tracking-[0.35em]">
							{data.user.supportPin}
						</div>
						<p class="mt-2 text-xs text-muted-foreground">
							Diesen PIN kannst du im Support angeben, damit das Team deinen Account schnell findet.
						</p>
					{:else}
						<p class="text-sm text-muted-foreground">
							Dein Support-PIN wird in Kürze generiert.
						</p>
					{/if}
				</CardContent>
			</Card>
		</div>

		<!-- Your Services Section -->
		<Card class="mb-8 border-border/50">
				<CardHeader class="flex flex-row items-center justify-between">
					<CardTitle>{t('yourServices')}</CardTitle>
				{#if data.stats.services > 0}
					<Button variant="ghost" size="sm" href="/dashboard/vps" class="gap-2">
						{t('viewAll')}
						<Icon icon="tabler:arrow-right" class="h-4 w-4" />
					</Button>
				{/if}
			</CardHeader>
			<CardContent>
				{#if data.stats.services === 0}
					<!-- Empty State -->
					<div class="flex flex-col items-center justify-center py-16">
						<div class="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-muted">
							<Icon icon="tabler:mood-sad" class="h-14 w-14 text-muted-foreground" />
						</div>
						<p class="mb-6 text-lg text-muted-foreground">
							{t('noServices')}
						</p>
						<Button size="lg" class="touch-manipulation" href="/vps">
							{t('orderNow')}
						</Button>
					</div>
				{:else}
					<!-- Services List -->
					<div class="space-y-3">
						{#each data.servers as server}
							<a 
								href={getServiceHref(server)} 
								class="block rounded-lg border border-border/50 p-4 transition-colors hover:bg-muted/50 touch-manipulation"
							>
								<div class="flex items-center justify-between gap-4">
									<div class="flex items-center gap-3 min-w-0 flex-1">
										<div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
											<Icon 
												icon={server.type === 'VPS' ? 'tabler:server-2' : server.type === 'GAMESERVER' ? 'tabler:device-gamepad' : 'tabler:cloud'} 
												class="h-5 w-5 text-primary" 
											/>
										</div>
										<div class="min-w-0 flex-1">
											<div class="flex items-center gap-2">
												<p class="font-medium truncate">{server.name || 'Unbenannter Server'}</p>
												<Badge 
													variant={server.status === 'ACTIVE' ? 'default' : server.status === 'PENDING' ? 'secondary' : 'destructive'}
													class="shrink-0 text-xs"
												>
													{server.status === 'ACTIVE' ? 'Online' : server.status === 'PENDING' ? 'Wird erstellt...' : server.status === 'SUSPENDED' ? 'Offline' : server.status}
												</Badge>
											</div>
											{#if server.ipAddress}
												<p class="text-sm text-muted-foreground truncate">
													<Icon icon="tabler:world" class="inline h-3 w-3 mr-1" />
													{server.ipAddress}
												</p>
											{:else}
												<p class="text-sm text-muted-foreground">IP wird zugewiesen...</p>
											{/if}
										</div>
									</div>
									<Icon icon="tabler:chevron-right" class="h-5 w-5 text-muted-foreground shrink-0" />
								</div>
							</a>
						{/each}
						{#if data.stats.services > data.servers.length}
							<div class="pt-2 text-center">
								<Button variant="ghost" size="sm" href="/dashboard/vps" class="gap-2">
									{t('allServices')}
									<Icon icon="tabler:arrow-right" class="h-4 w-4" />
								</Button>
							</div>
						{/if}
					</div>
				{/if}
			</CardContent>
		</Card>

		<!-- Bottom Grid -->
		<div class="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-3">
			<!-- Recent Activity -->
			<Card class="border-border/50 lg:col-span-1">
				<CardHeader class="flex flex-row items-center justify-between">
					<CardTitle class="text-lg">{t('recentActivity')}</CardTitle>
					<Button variant="ghost" size="sm" class="gap-2">
						View all
						<Icon icon="tabler:arrow-right" class="h-4 w-4" />
					</Button>
				</CardHeader>
				<CardContent>
					{#if data.recentActivity && data.recentActivity.length > 0}
						<div class="space-y-4">
							<div class="hidden sm:grid grid-cols-[auto_1fr_auto] gap-3 border-b pb-2 text-sm font-medium">
								<div>Status</div>
								<div>IP Address</div>
								<div>Time</div>
							</div>
							{#each data.recentActivity as activity}
								<div class="grid grid-cols-[auto_1fr] sm:grid-cols-[auto_1fr_auto] gap-2 sm:gap-3 items-start sm:items-center border-b sm:border-0 pb-3 sm:pb-0 last:border-0">
									<div class="flex items-center gap-2 sm:block">
										<Icon 
											icon={activity.status === 'success' ? 'tabler:circle-check' : 'tabler:circle-x'} 
											class="h-5 w-5 {activity.status === 'success' ? 'text-green-500' : 'text-red-500'} shrink-0" 
										/>
										<span class="text-xs text-muted-foreground sm:hidden">{formatDate(activity.createdAt)}</span>
									</div>
									<p class="text-sm text-muted-foreground break-all">{activity.ipAddress}</p>
									<p class="hidden sm:block text-xs text-muted-foreground whitespace-nowrap">{formatDate(activity.createdAt)}</p>
								</div>
							{/each}
						</div>
					{:else}
						<p class="text-center text-muted-foreground py-8">
							{t('noActivity')}
						</p>
					{/if}
				</CardContent>
			</Card>

			<!-- Announcements -->
			<Card class="border-border/50 lg:col-span-1">
				<CardHeader class="flex flex-row items-center justify-between">
					<CardTitle class="text-lg">{t('announcements')}</CardTitle>
					<a href="/dashboard/announcements">
						<Button variant="ghost" size="sm" class="gap-2">
							View all
							<Icon icon="tabler:arrow-right" class="h-4 w-4" />
						</Button>
					</a>
				</CardHeader>
				<CardContent>
					{#if data.announcements && data.announcements.length > 0}
						<div class="space-y-4">
							{#each data.announcements as announcement}
								<a href="/dashboard/announcements" class="block border-b pb-4 last:border-0 last:pb-0 hover:bg-muted/50 -mx-2 px-2 rounded transition-colors touch-manipulation">
									<div class="mb-1 flex items-center justify-between gap-2">
										<div class="flex items-center gap-2 min-w-0 flex-1">
											<span class="text-lg shrink-0">{announcement.icon || '📢'}</span>
											<span class="font-medium truncate">{announcement.title}</span>
										</div>
										<span class="text-xs text-muted-foreground shrink-0">{formatAnnouncementDate(announcement.createdAt)}</span>
									</div>
								</a>
							{/each}
						</div>
					{:else}
						<p class="text-center text-muted-foreground py-8">
							{t('noAnnouncements')}
						</p>
					{/if}
				</CardContent>
			</Card>

			<!-- Social Media Links -->
			<Card class="border-border/50 lg:col-span-1">
				<CardHeader>
					<CardTitle class="text-lg">{t('socialLinks')}</CardTitle>
				</CardHeader>
				<CardContent>
					<div class="space-y-3">
						{#each socialLinks as social}
							<a
								href={social.url}
								target="_blank"
								rel="noopener noreferrer"
								class="flex items-center justify-between rounded-lg border border-border/50 p-3 transition-colors hover:bg-muted touch-manipulation active:bg-muted"
							>
								<div class="flex items-center gap-3">
									<Icon icon={social.icon} class="h-6 w-6 text-primary" />
									<span class="font-medium">{social.username}</span>
								</div>
								<Icon icon="tabler:external-link" class="h-4 w-4 text-muted-foreground" />
							</a>
						{/each}
					</div>
				</CardContent>
			</Card>
		</div>
</div>

<LiveChat pageContext="dashboard" />

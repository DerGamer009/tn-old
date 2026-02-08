<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import Navbar from '$lib/components/navbar.svelte';
	import Footer from '$lib/components/footer.svelte';
	import LiveChat from '$lib/components/LiveChat.svelte';
	import { page } from '$app/stores';
	import { injectAnalytics } from '@vercel/analytics/sveltekit';
	import { injectSpeedInsights } from '@vercel/speed-insights/sveltekit';
	import Icon from '@iconify/svelte';

	injectAnalytics();
	injectSpeedInsights();

	let { data, children } = $props();

	// Prüfe ob wir im Dashboard, Admin oder Team Bereich sind
	let isSpecialLayout = $derived(
		$page.url.pathname.startsWith('/dashboard') ||
		$page.url.pathname.startsWith('/admin') ||
		$page.url.pathname.startsWith('/team') ||
		$page.url.pathname.startsWith('/technician')
	);

	// Kontext für den Chat (z.B. Dashboard, Status, Public)
	let chatContext = $derived(
		$page.url.pathname.startsWith('/dashboard')
			? 'dashboard'
			: $page.url.pathname.startsWith('/status')
			? 'status'
			: 'public'
	);
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<script>
		// Theme beim Laden sofort anwenden (verhindert Flash)
		try {
			const theme = localStorage.getItem('theme');
			const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
			const shouldBeDark = theme === 'dark' || (!theme && prefersDark);
			
			if (shouldBeDark) {
				document.documentElement.classList.add('dark');
			}
		} catch (e) {}
	</script>
</svelte:head>

<!-- Site-Banner (konfigurierbar unter Admin → Einstellungen) -->
{#if data.banner}
	{@const iconMap = { 'tabler:campaign': 'tabler:speakerphone', 'tabler:certificate': 'tabler:award', 'tabler:megaphone': 'tabler:bell' } as Record<string, string>}
	{@const bannerIcon = (data.banner.icon && iconMap[data.banner.icon]) ?? data.banner.icon ?? 'tabler:discount-2'}
	{#if data.banner.linkUrl}
		<a
			href={data.banner.linkUrl}
			class="flex items-center justify-center gap-2 bg-primary px-4 py-2.5 text-center text-sm font-medium text-primary-foreground no-underline transition-opacity hover:opacity-95"
		>
			<Icon icon={bannerIcon} class="h-5 w-5 shrink-0" />
			<span>{data.banner.text}</span>
			<Icon icon="tabler:chevron-right" class="h-4 w-4 shrink-0" />
		</a>
	{:else}
		<div
			class="flex items-center justify-center gap-2 bg-primary px-4 py-2.5 text-center text-sm font-medium text-primary-foreground"
		>
			<Icon icon={bannerIcon} class="h-5 w-5 shrink-0" />
			<span>{data.banner.text}</span>
		</div>
	{/if}
{/if}

{#if isSpecialLayout}
	<!-- Dashboard/Admin/Team Layout (ohne Navbar/Footer) -->
	{@render children()}
{:else}
	<!-- Standard Layout (mit Navbar/Footer) -->
	<div class="flex min-h-screen flex-col">
		<Navbar />
		<main class="flex-1">
			{@render children()}
		</main>
		<Footer />
	</div>
{/if}

<LiveChat pageContext={chatContext} />

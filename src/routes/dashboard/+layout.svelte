<script lang="ts">
	import DashboardSidebar from '$lib/components/dashboard-sidebar.svelte';
	import type { LayoutData } from './$types';
	import { page } from '$app/stores';

	let { data, children }: { data: LayoutData; children: any } = $props();
	
	// Prüfe ob wir auf einer App-Detail-Seite oder deren Unterrouten sind (dort wird die Dashboard-Sidebar ausgeblendet)
	// Erfasst: /dashboard/apps/[appsid] und alle Unterrouten wie /dashboard/apps/[appsid]/files, /dashboard/apps/[appsid]/users, etc.
	const isAppDetailPage = $derived($page.url.pathname.match(/^\/dashboard\/apps\/[^/]+/));
</script>

<div class="flex min-h-screen bg-background">
	<!-- Sidebar - nur anzeigen wenn nicht auf App-Detail-Seite -->
	{#if !isAppDetailPage}
		<DashboardSidebar user={data.user} isImpersonating={data.isImpersonating} />
	{/if}

	<!-- Main Content -->
	<main class="flex-1 p-4 {isAppDetailPage ? 'md:p-6 lg:p-8' : 'md:ml-72 md:p-6 lg:p-8'}">
		{@render children()}
	</main>
</div>


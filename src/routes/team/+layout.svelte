<script lang="ts">
	import type { LayoutData } from './$types';
	import TeamSidebar from '$lib/components/team-sidebar.svelte';

	let { data, children }: { data: LayoutData; children: any } = $props();
</script>

<div class="flex min-h-screen bg-gradient-to-br from-background via-muted/60 to-background">
	<TeamSidebar user={data.user} canAccessTechnician={data.canAccessTechnician} />

	<!-- Main Content -->
	<main class="flex-1 md:pl-72">
		<div class="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-8 lg:py-10">
			{@render children()}
		</div>
	</main>
</div>

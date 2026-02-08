<script lang="ts">
	import { page } from '$app/stores';
	import Icon from '@iconify/svelte';
	import { Button } from '$lib/components/ui/button';
	import { Sheet, SheetContent, SheetTrigger } from '$lib/components/ui/sheet';
	import { Badge } from '$lib/components/ui/badge';
	import type { UserRole } from '@prisma/client';
	import { ROLE_COLORS, ROLE_NAMES } from '$lib/constants/roles';
	import { cn } from '$lib/utils';

	type TeamUser = {
		firstName: string;
		lastName: string;
		email: string;
		image?: string | null;
		role: UserRole;
		supportPin?: string | null;
	};

	let { user, canAccessTechnician = false } = $props<{ user: TeamUser; canAccessTechnician?: boolean }>();
	let mobileMenuOpen = $state(false);

	const currentPath = $derived($page.url.pathname);

	const baseNavItems = [
		{ href: '/team', icon: 'tabler:dashboard', label: 'Dashboard' },
		{ href: '/team/tickets', icon: 'tabler:ticket', label: 'Tickets' },
		{ href: '/team/customers', icon: 'tabler:users', label: 'Kunden' },
		{ href: '/team/team', icon: 'tabler:users-group', label: 'Team' }
	];
	const technicianNavItem = { href: '/team/technician', icon: 'tabler:tool', label: 'Techniker' };
	const navItems = $derived(
		canAccessTechnician ? [...baseNavItems, technicianNavItem] : baseNavItems
	);

	const isActive = (href: string) => {
		return currentPath === href || currentPath.startsWith(href + '/');
	};

	function getInitials(firstName: string, lastName: string) {
		return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
	}
</script>

<!-- Mobile Sidebar -->
<div class="fixed left-4 top-4 z-50 md:hidden">
	<Sheet bind:open={mobileMenuOpen}>
		<SheetTrigger
			class="inline-flex h-10 w-10 items-center justify-center rounded-md border border-input bg-background/60 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 touch-manipulation"
			type="button"
		>
			<Icon icon="tabler:menu-2" class="h-5 w-5" />
			<span class="sr-only">Team-Menü öffnen</span>
		</SheetTrigger>
		<SheetContent side="left" class="w-[300px] sm:w-72 p-0">
			<div class="flex h-full flex-col">
				<!-- Logo -->
				<div class="flex h-16 items-center gap-2 border-b px-6">
					<Icon icon="tabler:users-group" class="h-7 w-7 text-primary" />
					<div class="flex flex-col">
						<span
							class="text-lg font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
						>
							TitanNode
						</span>
						<span class="text-[11px] text-muted-foreground">Team Panel</span>
					</div>
				</div>

				<!-- User -->
				<div class="border-b p-4">
					<div class="flex items-center gap-3">
						<div
							class="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-primary to-primary/60 text-sm font-semibold text-primary-foreground ring-2 ring-border"
						>
							{#if user.image}
								<img
									src={user.image}
									alt={`${user.firstName} ${user.lastName}`}
									class="h-full w-full object-cover"
								/>
							{:else}
								{getInitials(user.firstName, user.lastName)}
							{/if}
						</div>
						<div class="flex-1 min-w-0">
							<p class="truncate text-sm font-medium">{user.firstName} {user.lastName}</p>
							<Badge variant="outline" class="{ROLE_COLORS[user.role as UserRole]} text-[11px]">
								{ROLE_NAMES[user.role as UserRole]}
							</Badge>
							<p class="truncate text-[11px] text-muted-foreground mt-0.5">{user.email}</p>
						</div>
					</div>
					{#if user.supportPin}
						<div class="mt-3 rounded-lg bg-muted p-2 text-center">
							<p class="text-[11px] text-muted-foreground">Support-PIN</p>
							<p class="font-mono text-lg font-bold tracking-[0.35em]">
								{user.supportPin}
							</p>
						</div>
					{/if}
				</div>

				<!-- Navigation -->
				<nav class="flex-1 space-y-1 overflow-y-auto p-4">
					<p class="px-3 pb-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground/80">
						Navigation
					</p>
					{#each navItems as item}
						<a
							href={item.href}
							class={cn(
								'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
								isActive(item.href)
									? 'bg-primary text-primary-foreground'
									: 'text-muted-foreground hover:bg-muted hover:text-foreground'
							)}
							onclick={() => (mobileMenuOpen = false)}
						>
							<Icon icon={item.icon} class="h-5 w-5" />
							{item.label}
						</a>
					{/each}
				</nav>

				<!-- Footer -->
				<div class="border-t p-4 space-y-2">
					<a href="/dashboard" onclick={() => (mobileMenuOpen = false)}>
						<Button variant="outline" class="w-full justify-start gap-2 text-xs">
							<Icon icon="tabler:layout-dashboard" class="h-4 w-4" />
							User Dashboard
						</Button>
					</a>
					<form method="POST" action="/logout">
						<Button variant="ghost" type="submit" class="w-full justify-start gap-2 text-xs">
							<Icon icon="tabler:logout" class="h-4 w-4" />
							Abmelden
						</Button>
					</form>
				</div>
			</div>
		</SheetContent>
	</Sheet>
</div>

<!-- Desktop Sidebar -->
<aside
	class="hidden md:flex md:fixed md:left-0 md:top-0 md:z-40 md:h-screen md:w-72 md:border-r md:border-border/60 md:bg-background/95 md:backdrop-blur"
>
	<div class="flex h-full flex-col">
		<!-- Logo -->
		<div class="flex h-16 items-center gap-3 border-b border-border/60 px-6">
			<div class="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
				<Icon icon="tabler:users-group" class="h-5 w-5 text-primary" />
			</div>
			<div class="flex flex-col">
				<span
					class="text-base font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
				>
					TitanNode
				</span>
				<span class="text-[11px] text-muted-foreground">Team Panel</span>
			</div>
		</div>

		<!-- User -->
		<div class="border-b border-border/60 p-4">
			<div class="flex items-center gap-3">
				<div
					class="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-primary to-primary/60 text-sm font-semibold text-primary-foreground ring-2 ring-border"
				>
					{#if user.image}
						<img
							src={user.image}
							alt={`${user.firstName} ${user.lastName}`}
							class="h-full w-full object-cover"
						/>
					{:else}
						{getInitials(user.firstName, user.lastName)}
					{/if}
				</div>
				<div class="flex-1 min-w-0">
					<p class="truncate text-sm font-medium">{user.firstName} {user.lastName}</p>
					<Badge variant="outline" class="{ROLE_COLORS[user.role as UserRole]} text-[11px]">
						{ROLE_NAMES[user.role as UserRole]}
					</Badge>
					<p class="truncate text-[11px] text-muted-foreground mt-0.5">{user.email}</p>
				</div>
			</div>
			{#if user.supportPin}
				<div class="mt-3 rounded-lg bg-muted p-2 text-center">
					<p class="text-[11px] text-muted-foreground">Support-PIN</p>
					<p class="font-mono text-lg font-bold tracking-[0.35em]">
						{user.supportPin}
					</p>
				</div>
			{/if}
		</div>

		<!-- Navigation -->
		<nav class="flex-1 space-y-2 overflow-y-auto px-3 py-4">
			<p class="px-3 pb-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground/80">
				Navigation
			</p>
			{#each navItems as item}
				<a
					href={item.href}
					class={cn(
						'group relative flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all',
						isActive(item.href)
							? 'bg-primary/10 text-primary shadow-sm border border-primary/40'
							: 'text-muted-foreground hover:bg-muted/70 hover:text-foreground border border-transparent'
					)}
					aria-current={isActive(item.href) ? 'page' : undefined}
				>
					<div
						class="flex h-7 w-7 items-center justify-center rounded-lg bg-background/70 group-hover:bg-background"
					>
						<Icon icon={item.icon} class="h-4 w-4" />
					</div>
					<span class="truncate">{item.label}</span>
					{#if isActive(item.href)}
						<span class="ml-auto h-6 w-1 rounded-full bg-primary"></span>
					{/if}
				</a>
			{/each}
		</nav>

		<!-- Footer -->
		<div class="border-t border-border/60 p-4 space-y-2">
			<a href="/dashboard">
				<Button variant="outline" class="w-full justify-start gap-2 text-xs">
					<Icon icon="tabler:layout-dashboard" class="h-4 w-4" />
					User Dashboard
				</Button>
			</a>
			<form method="POST" action="/logout">
				<Button variant="ghost" type="submit" class="w-full justify-start gap-2 text-xs">
					<Icon icon="tabler:logout" class="h-4 w-4" />
					Abmelden
				</Button>
			</form>
		</div>
	</div>
</aside>


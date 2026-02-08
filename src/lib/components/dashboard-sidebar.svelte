<script lang="ts">
	import { page } from '$app/stores';
	import { Button } from '$lib/components/ui/button';
	import { Sheet, SheetContent, SheetTrigger } from '$lib/components/ui/sheet';
	import Icon from '@iconify/svelte';
	import { cn } from '$lib/utils';
	import { language, type Language } from '$lib/stores/language';

	let { user, isImpersonating = false } = $props<{ user: any; isImpersonating?: boolean }>();
	let mobileMenuOpen = $state(false);

	function getInitials(firstName: string, lastName: string) {
		return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
	}

	const translations = {
		de: {
			dashboard: 'Dashboard',
			vps: 'VPS',
			gameserver: 'Gameserver',
			apps: 'App Hosting',
			credits: 'Guthaben',
			invoices: 'Rechnungen',
			tickets: 'Tickets',
			bewerbungen: 'Bewerbungen',
			announcements: 'Ankündigungen',
			settings: 'Einstellungen',
			navigation: 'Navigation',
			logout: 'Abmelden',
			backToTeam: 'Zurück zum Team Panel'
		},
		en: {
			dashboard: 'Dashboard',
			vps: 'VPS',
			gameserver: 'Gameserver',
			apps: 'App hosting',
			credits: 'Credits',
			invoices: 'Invoices',
			tickets: 'Tickets',
			bewerbungen: 'Applications',
			announcements: 'Announcements',
			settings: 'Settings',
			navigation: 'Navigation',
			logout: 'Logout',
			backToTeam: 'Back to team panel'
		}
	} satisfies Record<Language, Record<string, string>>;

	type TKey = keyof (typeof translations)['de'];

	function t(key: TKey): string {
		const lang = $language as Language;
		const dict = translations[lang] ?? translations.de;
		return dict[key] ?? translations.de[key];
	}

	const menuItems = [
		{ icon: 'tabler:home', labelKey: 'dashboard' as TKey, href: '/dashboard' },
		{ icon: 'tabler:server-2', labelKey: 'vps' as TKey, href: '/dashboard/vps' },
		{ icon: 'tabler:device-gamepad', labelKey: 'gameserver' as TKey, href: '/dashboard/gameserver' },
		{ icon: 'tabler:cloud', labelKey: 'apps' as TKey, href: '/dashboard/apps' },
		{ icon: 'tabler:currency-euro', labelKey: 'credits' as TKey, href: '/dashboard/credits' },
		{ icon: 'tabler:receipt', labelKey: 'invoices' as TKey, href: '/dashboard/invoices' },
		{ icon: 'tabler:ticket', labelKey: 'tickets' as TKey, href: '/dashboard/tickets' },
		{ icon: 'tabler:briefcase', labelKey: 'bewerbungen' as TKey, href: '/dashboard/bewerbungen' },
		{ icon: 'tabler:speakerphone', labelKey: 'announcements' as TKey, href: '/dashboard/announcements' },
		{ icon: 'tabler:settings', labelKey: 'settings' as TKey, href: '/dashboard/settings' }
	];

	const currentPath = $derived($page.url.pathname);
	
	const isActive = (href: string) => {
		return currentPath === href || currentPath.startsWith(href + '/');
	};

</script>

<!-- Mobile Menu Button (nur für Handy) -->
<div class="fixed left-4 top-4 z-50 md:hidden">
	<Sheet bind:open={mobileMenuOpen}>
		<SheetTrigger
			class="inline-flex h-10 w-10 items-center justify-center rounded-md border border-input bg-transparent text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 touch-manipulation"
			type="button"
		>
			<Icon icon="tabler:menu-2" class="h-5 w-5" />
			<span class="sr-only">Menü öffnen</span>
		</SheetTrigger>
		<SheetContent side="left" class="w-[300px] sm:w-72 p-0">
			<div class="flex h-full flex-col">
				<!-- Logo -->
				<div class="flex h-16 items-center gap-2 border-b px-6">
					<Icon icon="tabler:server-2" class="h-8 w-8 text-primary" />
					<span class="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
						TitanNode
					</span>
				</div>

				<!-- Navigation -->
				<nav class="flex-1 space-y-1 overflow-y-auto p-4">
					{#each menuItems as item}
						<a
							href={item.href}
							class={cn(
								'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
								isActive(item.href)
									? 'bg-primary text-primary-foreground'
									: 'text-muted-foreground hover:bg-muted hover:text-foreground'
							)}
							onclick={() => mobileMenuOpen = false}
						>
							<Icon icon={item.icon} class="h-5 w-5" />
							{t(item.labelKey)}
						</a>
					{/each}
				</nav>

				<!-- User Section -->
				<div class="border-t p-4">
					<div class="mb-3 flex items-center gap-3 rounded-lg bg-muted p-3">
						<div class="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-primary to-primary/60 text-sm font-semibold text-primary-foreground ring-2 ring-border">
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
						<div class="flex-1 overflow-hidden">
							<p class="truncate text-sm font-medium">{user.firstName} {user.lastName}</p>
							<p class="truncate text-xs text-muted-foreground">{user.email}</p>
						</div>
					</div>
					{#if isImpersonating}
						<a href="/team/impersonation/restore" class="mb-2 block">
							<Button variant="outline" class="w-full gap-2 text-xs justify-center">
								<Icon icon="tabler:users-group" class="h-4 w-4" />
								<span>{t('backToTeam')}</span>
							</Button>
						</a>
					{/if}
					<form method="POST" action="/logout" class="w-full">
						<Button type="submit" variant="outline" class="w-full gap-2">
							<Icon icon="tabler:logout" class="h-4 w-4" />
							Logout
						</Button>
					</form>
				</div>
			</div>
		</SheetContent>
	</Sheet>
</div>

<!-- Tablet/Desktop Sidebar (ab md Breakpoint) -->
<aside class="hidden md:flex md:fixed md:left-0 md:top-0 md:z-40 md:h-screen md:w-72 md:border-r md:border-border/60 md:bg-background/95 md:backdrop-blur md:transition-transform">
	<div class="flex h-full flex-col">
		<!-- Logo / Brand -->
		<div class="flex h-16 items-center gap-3 border-b border-border/60 px-6">
			<div class="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
				<Icon icon="tabler:server-2" class="h-5 w-5 text-primary" />
			</div>
			<div class="flex flex-col">
				<span class="text-base font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
					TitanNode
				</span>
				<span class="text-[11px] text-muted-foreground">Dashboard</span>
			</div>
		</div>

		<!-- Navigation -->
		<nav class="flex-1 space-y-2 overflow-y-auto px-3 py-4">
			<p class="px-3 pb-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground/80">
				Navigation
			</p>
			{#each menuItems as item}
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
					<div class="flex h-7 w-7 items-center justify-center rounded-lg bg-background/70 group-hover:bg-background">
						<Icon icon={item.icon} class="h-4 w-4" />
					</div>
					<span class="truncate">{t(item.labelKey)}</span>
					{#if isActive(item.href)}
						<span class="ml-auto h-6 w-1 rounded-full bg-primary"></span>
					{/if}
				</a>
			{/each}
		</nav>

		<!-- User Section -->
		<div class="border-t border-border/60 p-4">
			<div class="mb-3 flex items-center gap-3 rounded-lg bg-muted/60 p-3">
				<div class="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-primary to-primary/60 text-sm font-semibold text-primary-foreground ring-2 ring-border">
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
				<div class="flex-1 overflow-hidden">
					<p class="truncate text-sm font-medium">{user.firstName} {user.lastName}</p>
					<p class="truncate text-xs text-muted-foreground">{user.email}</p>
					{#if user.role}
						<p class="mt-0.5 inline-flex items-center gap-1 rounded-full bg-background/80 px-2 py-[2px] text-[10px] font-medium text-muted-foreground">
							<Icon icon="tabler:shield-star" class="h-3 w-3" />
							<span>{user.role}</span>
						</p>
					{/if}
				</div>
			</div>
			{#if isImpersonating}
				<a href="/team/impersonation/restore" class="mb-2 block">
					<Button variant="outline" class="w-full justify-start gap-2 text-xs">
						<Icon icon="tabler:users-group" class="h-4 w-4" />
						<span>{t('backToTeam')}</span>
					</Button>
				</a>
			{/if}
			<form method="POST" action="/logout" class="w-full">
				<Button type="submit" variant="outline" class="w-full gap-2 justify-center text-xs">
					<Icon icon="tabler:logout" class="h-4 w-4" />
					<span>{t('logout')}</span>
				</Button>
			</form>
		</div>
	</div>
</aside>


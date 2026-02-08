<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Sheet, SheetContent, SheetTrigger } from '$lib/components/ui/sheet';
	import ThemeToggle from '$lib/components/theme-toggle.svelte';
	import { Menu } from '@lucide/svelte';
	import { page } from '$app/stores';

	let isOpen = $state(false);

	const navItems = [
		{ name: 'Home', href: '/' },
		{ name: 'VPS', href: '/vps' },
		{ name: 'Gameserver', href: '/gameserver' },
		{ name: 'App Hosting', href: '/app-hosting' },
		{ name: 'Unser Team', href: '/our-team' },
		{ name: 'Support', href: '/support' }
	];

	// Prüfe ob Benutzer eingeloggt ist
	let isLoggedIn = $derived($page.data.user != null);
	const currentPath = $derived($page.url.pathname);

	const isActive = (href: string) => {
		return currentPath === href || currentPath.startsWith(href + '/');
	};
</script>

<nav class="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
	<div class="container mx-auto flex h-16 max-w-screen-2xl items-center justify-between px-4">
		<!-- Logo -->
		<a href="/" class="flex items-center gap-2.5">
			<div class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/40">
				<img
					src="/logo.png"
					alt="TitanNode Bot"
					class="h-full w-full object-cover"
					loading="lazy"
				/>
			</div>
			<div class="flex flex-col">
				<span class="text-lg font-semibold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
					TitanNode
				</span>
				<span class="text-[11px] text-muted-foreground">Cloud & Gameserver Hosting</span>
			</div>
		</a>

		<!-- Desktop Navigation -->
		<div class="hidden items-center gap-1.5 md:flex">
			{#each navItems as item}
				<a
					href={item.href}
					class="relative rounded-full px-3 py-1.5 text-sm font-medium transition-colors
						{isActive(item.href)
							? 'bg-primary/10 text-primary'
							: 'text-muted-foreground hover:text-foreground hover:bg-muted/60'}"
					aria-current={isActive(item.href) ? 'page' : undefined}
				>
					{item.name}
					{#if isActive(item.href)}
						<span class="pointer-events-none absolute inset-x-3 bottom-1 h-px bg-gradient-to-r from-primary/60 via-primary to-primary/60 opacity-70"></span>
					{/if}
				</a>
			{/each}
		</div>

		<!-- Desktop CTA -->
		<div class="hidden items-center gap-2 md:flex">
			<ThemeToggle />
			{#if isLoggedIn}
				<Button href="/dashboard" class="shadow-sm">
					Dashboard
				</Button>
			{:else}
				<Button variant="ghost" href="/login">
					Login
				</Button>
				<Button href="/register" class="shadow-sm">
					Jetzt starten
				</Button>
			{/if}
		</div>

		<!-- Mobile Menu Button & Theme Toggle -->
		<div class="flex items-center gap-2 md:hidden">
			<ThemeToggle />
			<Sheet bind:open={isOpen}>
				<SheetTrigger class="inline-flex h-9 w-9 items-center justify-center rounded-md border border-input bg-transparent text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
					<Menu class="h-5 w-5"></Menu>
					<span class="sr-only">Menü öffnen</span>
				</SheetTrigger>
				<SheetContent side="right" class="w-[300px] sm:w-[380px]">
					<div class="mt-6 flex flex-col space-y-4">
						{#each navItems as item}
							<a
								href={item.href}
								class="rounded-lg px-2 py-2 text-base font-medium text-foreground hover:bg-muted/70 hover:text-primary transition-colors"
								aria-current={isActive(item.href) ? 'page' : undefined}
								onclick={() => (isOpen = false)}
							>
								{item.name}
							</a>
						{/each}
						<div class="mt-2 flex flex-col space-y-2 border-t pt-4">
							{#if isLoggedIn}
								<Button href="/dashboard" class="w-full">
									Dashboard
								</Button>
							{:else}
								<Button variant="outline" href="/login" class="w-full">
									Login
								</Button>
								<Button href="/register" class="w-full">
									Jetzt starten
								</Button>
							{/if}
						</div>
					</div>
				</SheetContent>
			</Sheet>
		</div>
	</div>
</nav>


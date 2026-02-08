<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Separator } from '$lib/components/ui/separator';
	import { Github, Twitter, Mail, MessageCircle } from '@lucide/svelte';
	import { themeStore } from '$lib/stores/theme.svelte';

	const statusEmbedSrc = $derived(
		themeStore.current === 'dark'
			? 'https://status.titannode.org/embed-status/0e0e0303/dark-md'
			: 'https://status.titannode.org/embed-status/0e0e0303/light-md'
	);

	const footerLinks = {
		produkt: [
			{ name: 'VPS Hosting', href: '/vps' },
			{ name: 'Gameserver', href: '/gameserver' },
			{ name: 'App Hosting', href: '/app-hosting' },
			{ name: 'Domain prüfen', href: '/domain' }
		],
		unternehmen: [
			{ name: 'Über uns', href: '/about' },
			{ name: 'Unser Team', href: '/our-team' },
			{ name: 'Rechenzentrum', href: '/datacenter' },
			{ name: 'Partner', href: '/partners' },
			{ name: 'Karriere', href: '/careers' }
		],
		ressourcen: [
			{ name: 'Dokumentation', href: '/docs' },
			{ name: 'Tutorials', href: '/docs' },
			{ name: 'Support Center', href: '/support' },
			{ name: 'Server Status', href: 'https://status.titannode.org/' }
		],
		legal: [
			{ name: 'Datenschutz', href: '/privacy' },
			{ name: 'AGB', href: '/terms' },
			{ name: 'Impressum', href: '/imprint' },
			{ name: 'Widerrufsrecht', href: '/withdrawal' }
		]
	};

	const socialLinks = [
		{ name: 'GitHub', icon: Github, href: 'https://github.com' },
		{ name: 'Twitter', icon: Twitter, href: 'https://twitter.com' },
		{ name: 'Discord', icon: MessageCircle, href: 'https://discord.com' },
		{ name: 'Email', icon: Mail, href: 'mailto:contact@titannode.com' }
	];
</script>

<footer class="w-full border-t border-border/80 bg-gradient-to-b from-background via-background to-background/95">
	<div class="container mx-auto max-w-screen-2xl px-4 py-12 lg:py-14">
		<!-- Main Footer Content -->
		<div class="grid grid-cols-2 gap-8 md:grid-cols-6">
			<!-- Brand Section -->
			<div class="col-span-2 space-y-4 md:space-y-5">
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
						<span class="text-xs text-muted-foreground/80">Premium Hosting Plattform</span>
					</div>
				</a>
				<p class="text-sm text-muted-foreground max-w-xs leading-relaxed">
					Premium Hosting-Lösungen für VPS, Gameserver und Anwendungen. Zuverlässig, schnell und sicher.
				</p>
				<div class="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
					<span class="inline-flex items-center gap-1 rounded-full bg-muted/70 px-2.5 py-1 font-medium">
						<span class="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
						99,9% Uptime
					</span>
					<span class="inline-flex items-center gap-1 rounded-full bg-muted/70 px-2.5 py-1 font-medium">
						<span class="h-1.5 w-1.5 rounded-full bg-primary"></span>
						Rechenzentrum in Deutschland
					</span>
				</div>
				<!-- Status Page Embed -->
				<div class="pt-2">
					<a
						href="https://status.titannode.org/"
						target="_blank"
						rel="noopener noreferrer"
						class="text-xs font-medium text-muted-foreground hover:text-primary transition-colors"
					>
						System Status
					</a>
					<iframe
						src={statusEmbedSrc}
						width="230"
						height="61"
						frameborder="0"
						scrolling="no"
						style="border: none;"
						title="TitanNode Status"
						class="mt-1.5 block"
					></iframe>
				</div>
				<!-- Social Links -->
				<div class="flex gap-2 pt-1.5">
					{#each socialLinks as social}
						<Button
							variant="ghost"
							size="icon"
							href={social.href}
							class="h-9 w-9 rounded-full border border-border/60 bg-background/60 hover:bg-primary/10 hover:text-primary"
						>
							<social.icon class="h-4 w-4" />
							<span class="sr-only">{social.name}</span>
						</Button>
					{/each}
				</div>
			</div>

			<!-- Footer Links -->
			<div class="space-y-3.5">
				<h3 class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Produkt</h3>
				<ul class="space-y-2.5 text-sm">
					{#each footerLinks.produkt as link}
						<li>
							<a
								href={link.href}
								class="text-muted-foreground hover:text-primary transition-colors"
							>
								{link.name}
							</a>
						</li>
					{/each}
				</ul>
			</div>

			<div class="space-y-3.5">
				<h3 class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Unternehmen</h3>
				<ul class="space-y-2.5 text-sm">
					{#each footerLinks.unternehmen as link}
						<li>
							<a
								href={link.href}
								class="text-muted-foreground hover:text-primary transition-colors"
							>
								{link.name}
							</a>
						</li>
					{/each}
				</ul>
			</div>

			<div class="space-y-3.5">
				<h3 class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Ressourcen</h3>
				<ul class="space-y-2.5 text-sm">
					{#each footerLinks.ressourcen as link}
						<li>
							<a
								href={link.href}
								class="text-muted-foreground hover:text-primary transition-colors"
							>
								{link.name}
							</a>
						</li>
					{/each}
				</ul>
			</div>

			<div class="space-y-3.5">
				<h3 class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Legal</h3>
				<ul class="space-y-2.5 text-sm">
					{#each footerLinks.legal as link}
						<li>
							<a
								href={link.href}
								class="text-muted-foreground hover:text-primary transition-colors"
							>
								{link.name}
							</a>
						</li>
					{/each}
				</ul>
			</div>
		</div>

		<Separator class="my-8 border-border/70" />

		<!-- Bottom Footer -->
		<div class="flex flex-col items-center justify-between gap-4 text-center md:flex-row md:text-left">
			<p class="text-xs md:text-sm text-muted-foreground">
				© 2025 - {new Date().getFullYear()} TitanNode. Alle Rechte vorbehalten.
			</p>
			<div class="flex flex-wrap items-center justify-center gap-3 text-xs md:text-sm text-muted-foreground">
				<span class="inline-flex items-center gap-1">
					<span class="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
					Live Support
				</span>
				<span class="hidden h-4 w-[1px] bg-border/60 md:inline-block"></span>
				<span>Made with ❤️ in Germany</span>
			</div>
		</div>
	</div>
</footer>


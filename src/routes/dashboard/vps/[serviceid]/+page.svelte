<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Tabs, TabsContent, TabsList, TabsTrigger } from '$lib/components/ui/tabs';
	import {
		Dialog,
		DialogContent,
		DialogDescription,
		DialogFooter,
		DialogHeader,
		DialogTitle,
		DialogTrigger
	} from '$lib/components/ui/dialog';
	import {
		Table,
		TableBody,
		TableCell,
		TableHead,
		TableHeader,
		TableRow
	} from '$lib/components/ui/table';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Switch } from '$lib/components/ui/switch';
	import { Progress } from '$lib/components/ui/progress';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import Icon from '@iconify/svelte';
	import type { PageData, ActionData } from './$types';
	import { onMount } from 'svelte';
	import { invalidateAll } from '$app/navigation';
	import { goto } from '$app/navigation';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let activeTab = $state('ip');
	let runtimeCountdown = $state('Berechne...');
	let loading = $state<Record<string, boolean>>({});
	let loginDialogOpen = $state(false);
	let passwordVisible = $state(false);
	let passwordCopied = $state(false);
	let ipCopied = $state(false);
	let userCopied = $state(false);
	let portCopied = $state(false);
	let trafficNotificationEnabled = $state(false);
	let extendDialogOpen = $state(false);
	let extendMonths = $state('1');
	let useCredits = $state(true);

	// Get service ID
		const serviceId = $derived(data.server.datalixVpsId || data.server.id);

	// Format runtime countdown
	function formatRuntime(expiresAt: string | Date | null | undefined): string {
		if (!expiresAt) {
			return 'Unbegrenzt';
		}

		const now = new Date();
		const expires = new Date(expiresAt);
		const diff = expires.getTime() - now.getTime();

		if (diff <= 0) {
			return 'Abgelaufen';
		}

		const days = Math.floor(diff / (1000 * 60 * 60 * 24));
		const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
		const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
		const seconds = Math.floor((diff % (1000 * 60)) / 1000);

		return `${days} Tage ${hours} Stunden ${minutes} Minuten ${seconds} Sekunden`;
	}

	// Update countdown every second
	onMount(() => {
		runtimeCountdown = formatRuntime(data.server.expiresAt);
		const interval = setInterval(() => {
			runtimeCountdown = formatRuntime(data.server.expiresAt);
		}, 1000);

		return () => clearInterval(interval);
	});

	async function handleAction(action: string) {
		loading[action] = true;
		try {
			const response = await fetch(`/api/vps/${data.server.id}/${action}`, {
				method: action === 'delete' ? 'DELETE' : 'POST'
			});

			if (!response.ok) {
				const error = await response.json();
				alert(error.error || 'Fehler beim Ausführen der Aktion');
				return;
			}

			if (action === 'delete') {
				await goto('/dashboard/vps');
				return;
			}

			await invalidateAll();
		} catch (error) {
			console.error('Error:', error);
			alert('Fehler beim Ausführen der Aktion');
		} finally {
			loading[action] = false;
		}
	}

	function getStatusColor(status: string): string {
		switch (status) {
			case 'ACTIVE':
				return 'bg-green-500';
			case 'SUSPENDED':
				return 'bg-red-500';
			case 'PENDING':
				return 'bg-yellow-500';
			default:
				return 'bg-gray-500';
		}
	}

	// Get password from Datalix data
	function getPassword(): string {
		// @ts-ignore - product.password ist in der API-Response vorhanden
		return data.serviceDetails?.product?.password || 'Nicht verfügbar';
	}

	// Get IP address from API (wird separat über /service/{serviceId}/ip geholt)
	// Die IP kommt als Array: ipData.ipv4[0].ip
	function getIpAddress(): string {
		// @ts-ignore - ipData.ipv4 ist ein Array mit IP-Objekten
		const ipv4Array = data.serviceDetails?.ipData?.ipv4;
		if (ipv4Array && Array.isArray(ipv4Array) && ipv4Array.length > 0 && ipv4Array[0]?.ip) {
			return ipv4Array[0].ip;
		}
		
		// Fallback
		const ip = data.datalixVps?.ipv4 || data.server.ipAddress || null;
		if (ip && typeof ip === 'string' && /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(ip)) {
			return ip;
		}
		
		return 'Nicht verfügbar';
	}

	// Get IP details (Gateway, Netmask, rDNS, etc.)
	function getIpDetails() {
		// @ts-ignore
		const ipv4Array = data.serviceDetails?.ipData?.ipv4;
		if (ipv4Array && Array.isArray(ipv4Array) && ipv4Array.length > 0) {
			return ipv4Array[0];
		}
		return null;
	}

	// Get IPv6 details
	function getIpv6Details() {
		// @ts-ignore
		const ipv6Array = data.serviceDetails?.ipData?.ipv6;
		if (ipv6Array && Array.isArray(ipv6Array) && ipv6Array.length > 0) {
			return ipv6Array[0];
		}
		return null;
	}

	// Get Port from API
	function getPort(): string {
		// @ts-ignore - product.port ist in der API-Response vorhanden (als String)
		return data.serviceDetails?.product?.port || '22';
	}

	// Get User from API
	function getUser(): string {
		// @ts-ignore - product.user ist in der API-Response vorhanden
		return data.serviceDetails?.product?.user || 'root';
	}

	// Get Hostname from API
	function getHostname(): string {
		// @ts-ignore - product.hostname ist in der API-Response vorhanden
		return data.serviceDetails?.product?.hostname || data.server.name || 'Nicht verfügbar';
	}

	// Copy to clipboard
	async function copyToClipboard(text: string, type: 'password' | 'ip' | 'user' | 'port') {
		try {
			await navigator.clipboard.writeText(text);
			if (type === 'password') {
				passwordCopied = true;
				setTimeout(() => {
					passwordCopied = false;
				}, 2000);
			} else if (type === 'ip') {
				ipCopied = true;
				setTimeout(() => {
					ipCopied = false;
				}, 2000);
			} else if (type === 'user') {
				userCopied = true;
				setTimeout(() => {
					userCopied = false;
				}, 2000);
			} else if (type === 'port') {
				portCopied = true;
				setTimeout(() => {
					portCopied = false;
				}, 2000);
			}
		} catch (error) {
			console.error('Failed to copy:', error);
			alert('Kopieren fehlgeschlagen');
		}
	}

	async function resetPassword() {
		loading['resetPassword'] = true;
		try {
			// TODO: Implement password reset API call
			alert('Passwort wird zurückgesetzt...');
		} catch (error) {
			console.error('Error resetting password:', error);
			alert('Fehler beim Zurücksetzen des Passworts');
		} finally {
			loading['resetPassword'] = false;
		}
	}

	function calculatePrice(priceMonthly: number, months: number): number {
		return (priceMonthly / 100) * months;
	}

	function getUserCredits(): number {
		return ((data as any).credits as number) || 0;
	}
</script>

<svelte:head>
	<title>VPS Verwalten: {data.server.name} - Dashboard | TitanNode</title>
</svelte:head>

<div class="flex gap-6">
	<!-- Left Sidebar -->
	<aside class="w-64 flex-shrink-0">
		<Card class="border-border/50">
			<CardContent class="p-6 space-y-6">
				<!-- Status Badge -->
				<div class="flex justify-center">
					<Badge
						class="{getStatusColor(data.server.status)} text-white px-4 py-2 text-sm font-medium"
					>
						{#if data.server.status === 'ACTIVE'}
							Online
						{:else if data.server.status === 'SUSPENDED'}
							Offline
						{:else}
							{data.server.status}
						{/if}
					</Badge>
				</div>

				<!-- Icon -->
				<div class="flex justify-center">
					<Icon icon="tabler:database" class="h-16 w-16 text-green-500" />
				</div>

				<!-- Hostname -->
				<div class="flex items-center justify-center gap-2">
					<span class="font-mono text-sm">{data.server.name}</span>
					<Icon icon="tabler:pencil" class="h-4 w-4 text-muted-foreground cursor-pointer" />
				</div>

				<!-- Countdown -->
				<div class="text-center">
					<p class="text-sm text-muted-foreground mb-1">Läuft aus in:</p>
					<p class="text-sm font-medium">{runtimeCountdown}</p>
				</div>

				<!-- Action Buttons -->
				<div class="space-y-2">
					<Button
						class="w-full bg-green-500 hover:bg-green-600 text-white"
						size="sm"
						onclick={() => (loginDialogOpen = true)}
					>
						Logindaten anzeigen
					</Button>

					<Dialog bind:open={extendDialogOpen}>
						<DialogTrigger>
							<Button
								class="w-full bg-green-500 hover:bg-green-600 text-white"
								size="sm"
							>
								Service verlängern
							</Button>
						</DialogTrigger>
						<DialogContent class="sm:max-w-md">
							<form method="POST" action="?/extend" use:enhance={() => {
								return async ({ update }) => {
									await update();
									if (form && typeof form === 'object' && 'success' in form && (form as any).success) {
										extendDialogOpen = false;
										await invalidateAll();
									}
								};
							}}>
								<DialogHeader>
									<DialogTitle>Server verlängern</DialogTitle>
									<DialogDescription>
										Verlängere den Server "{data.server.name}" für den angegebenen Zeitraum.
									</DialogDescription>
								</DialogHeader>

								<input type="hidden" name="serverId" value={data.server.id} />
								<input type="hidden" name="useCredits" value={useCredits ? 'true' : 'false'} />

								<div class="grid gap-4 py-4">
									{#if form && typeof form === 'object' && 'error' in form}
										<div class="rounded-lg border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-700 dark:text-red-400">
											{(form as any).error}
										</div>
									{/if}

									<div class="grid gap-2">
										<Label for="months">Anzahl Monate</Label>
										<Input
											id="months"
											name="months"
											type="number"
											min="1"
											max="24"
											bind:value={extendMonths}
											required
										/>
									</div>

									{#if true}
										{@const totalPrice = calculatePrice(data.server.priceMonthly, parseInt(extendMonths || '1', 10))}
										{@const userCredits = getUserCredits()}
										{@const canPayWithCredits = userCredits >= totalPrice}

										<div class="rounded-lg border border-border/50 bg-muted/30 p-3 space-y-2">
											<div class="flex justify-between text-sm">
												<span class="text-muted-foreground">Kosten pro Monat:</span>
												<span class="font-medium">€{(data.server.priceMonthly / 100).toFixed(2).replace('.', ',')}</span>
											</div>
											<div class="flex justify-between text-sm">
												<span class="text-muted-foreground">Anzahl Monate:</span>
												<span class="font-medium">{extendMonths || '1'}</span>
											</div>
											<div class="border-t pt-2 flex justify-between font-semibold">
												<span>Gesamt:</span>
												<span>€{totalPrice.toFixed(2).replace('.', ',')}</span>
											</div>
											<div class="flex justify-between text-sm">
												<span class="text-muted-foreground">Deine Credits:</span>
												<span class="font-medium">€{userCredits.toFixed(2).replace('.', ',')}</span>
											</div>
										</div>

										<div class="flex items-center space-x-2">
											<Checkbox
												id="useCredits"
												name="useCredits"
												checked={useCredits}
												disabled={!canPayWithCredits}
												onCheckedChange={(checked) => {
													useCredits = checked ?? true;
												}}
											/>
											<Label for="useCredits" class="text-sm font-normal cursor-pointer">
												{#if canPayWithCredits}
													Mit Credits bezahlen
												{:else}
													Mit Credits bezahlen (Nicht genügend Credits)
												{/if}
											</Label>
										</div>
										{#if !canPayWithCredits && useCredits}
											<p class="text-xs text-muted-foreground">
												Du hast nicht genügend Credits. Die Verlängerung kann trotzdem durchgeführt werden (ohne Credits-Abzug).
											</p>
										{/if}
									{/if}
								</div>

								<DialogFooter>
									<Button
										type="button"
										variant="outline"
										onclick={() => {
											extendDialogOpen = false;
										}}
									>
										Abbrechen
									</Button>
									<Button type="submit" class="gap-2">
										<Icon icon="tabler:check" class="h-4 w-4" />
										Verlängern
									</Button>
								</DialogFooter>
							</form>
						</DialogContent>
					</Dialog>

					{#if data.server.status === 'ACTIVE'}
						<Button
							class="w-full bg-red-500 hover:bg-red-600 text-white"
							size="sm"
							onclick={() => handleAction('stop')}
							disabled={loading['stop']}
						>
							Stop
						</Button>
						<Button
							class="w-full bg-red-500 hover:bg-red-600 text-white"
							size="sm"
							onclick={() => handleAction('restart')}
							disabled={loading['restart']}
						>
							Neustarten
						</Button>
						<Button
							class="w-full bg-red-500 hover:bg-red-600 text-white"
							size="sm"
							onclick={() => {
								// TODO: Shutdown
								alert('Herunterfahren...');
							}}
						>
							Herunterfahren
						</Button>
						<Button
							class="w-full bg-red-500 hover:bg-red-600 text-white"
							size="sm"
							onclick={() => {
								// TODO: Rescue mode
								alert('Rescue Mode...');
							}}
						>
							Rescue
						</Button>
					{:else if data.server.status === 'SUSPENDED'}
						<Button
							class="w-full bg-green-500 hover:bg-green-600 text-white"
							size="sm"
							onclick={() => handleAction('start')}
							disabled={loading['start']}
						>
							Starten
						</Button>
					{/if}

					<Button
						class="w-full bg-green-500 hover:bg-green-600 text-white"
						size="sm"
						onclick={() => {
							// TODO: Reinstallation
							alert('Neuinstallation...');
						}}
					>
						Neuinstallation
					</Button>

					<Button
						class="w-full bg-green-500 hover:bg-green-600 text-white"
						size="sm"
						onclick={() => {
							// TODO: noVNC Console
							alert('noVNC Console...');
						}}
					>
						noVNC Console
					</Button>

					<Button
						class="w-full bg-green-500 hover:bg-green-600 text-white"
						size="sm"
						onclick={() => {
							// TODO: Upgrade
							alert('Upgrade...');
						}}
					>
						Upgrade
					</Button>

					<Button
						class="w-full bg-green-500 hover:bg-green-600 text-white"
						size="sm"
						onclick={() => {
							// TODO: Create Backup
							alert('Backup erstellen...');
						}}
					>
						Backup erstellen
					</Button>

					<Button
						class="w-full bg-red-500 hover:bg-red-600 text-white"
						size="sm"
						variant="destructive"
						onclick={() => {
							if (confirm('Möchtest du diesen VPS wirklich löschen?')) {
								handleAction('delete');
							}
						}}
						disabled={loading['delete']}
					>
						Löschen
					</Button>
				</div>
			</CardContent>
		</Card>
	</aside>

	<!-- Main Content -->
	<main class="flex-1">
		<Card class="border-border/50">
			<CardContent class="p-6">
				<Tabs bind:value={activeTab} class="w-full">
					<div class="relative mb-6 border-b border-border/40">
					<div class="overflow-x-auto [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full">
						<TabsList class="inline-flex h-10 w-max items-center justify-start gap-0 rounded-none bg-transparent p-0 min-w-full">
							<TabsTrigger 
								value="ip" 
								class="rounded-none border-b-2 border-transparent bg-transparent px-4 py-2 text-sm font-medium text-muted-foreground transition-all hover:bg-muted/30 hover:text-foreground data-[state=active]:border-green-500 data-[state=active]:bg-muted/20 data-[state=active]:text-white data-[state=active]:shadow-none whitespace-nowrap"
							>
								IP Adressen
							</TabsTrigger>
							<TabsTrigger 
								value="traffic" 
								class="rounded-none border-b-2 border-transparent bg-transparent px-4 py-2 text-sm font-medium text-muted-foreground transition-all hover:bg-muted/30 hover:text-foreground data-[state=active]:border-green-500 data-[state=active]:bg-muted/20 data-[state=active]:text-white data-[state=active]:shadow-none whitespace-nowrap"
							>
								Traffic
							</TabsTrigger>
							<TabsTrigger 
								value="hardware" 
								class="rounded-none border-b-2 border-transparent bg-transparent px-4 py-2 text-sm font-medium text-muted-foreground transition-all hover:bg-muted/30 hover:text-foreground data-[state=active]:border-green-500 data-[state=active]:bg-muted/20 data-[state=active]:text-white data-[state=active]:shadow-none whitespace-nowrap"
							>
								Hardware
							</TabsTrigger>
							<TabsTrigger 
								value="backups" 
								class="rounded-none border-b-2 border-transparent bg-transparent px-4 py-2 text-sm font-medium text-muted-foreground transition-all hover:bg-muted/30 hover:text-foreground data-[state=active]:border-green-500 data-[state=active]:bg-muted/20 data-[state=active]:text-white data-[state=active]:shadow-none whitespace-nowrap"
							>
								Backups
							</TabsTrigger>
							<TabsTrigger 
								value="livedata" 
								class="rounded-none border-b-2 border-transparent bg-transparent px-4 py-2 text-sm font-medium text-muted-foreground transition-all hover:bg-muted/30 hover:text-foreground data-[state=active]:border-green-500 data-[state=active]:bg-muted/20 data-[state=active]:text-white data-[state=active]:shadow-none whitespace-nowrap"
							>
								Livedaten
							</TabsTrigger>
							<TabsTrigger 
								value="tasks" 
								class="rounded-none border-b-2 border-transparent bg-transparent px-4 py-2 text-sm font-medium text-muted-foreground transition-all hover:bg-muted/30 hover:text-foreground data-[state=active]:border-green-500 data-[state=active]:bg-muted/20 data-[state=active]:text-white data-[state=active]:shadow-none whitespace-nowrap"
							>
								Geplante Aufgaben
							</TabsTrigger>
							<TabsTrigger 
								value="ddos" 
								class="rounded-none border-b-2 border-transparent bg-transparent px-4 py-2 text-sm font-medium text-muted-foreground transition-all hover:bg-muted/30 hover:text-foreground data-[state=active]:border-green-500 data-[state=active]:bg-muted/20 data-[state=active]:text-white data-[state=active]:shadow-none whitespace-nowrap"
							>
								DDoS Log
							</TabsTrigger>
							<TabsTrigger 
								value="sshkeys" 
								class="rounded-none border-b-2 border-transparent bg-transparent px-4 py-2 text-sm font-medium text-muted-foreground transition-all hover:bg-muted/30 hover:text-foreground data-[state=active]:border-green-500 data-[state=active]:bg-muted/20 data-[state=active]:text-white data-[state=active]:shadow-none whitespace-nowrap"
							>
								SSH Keys
							</TabsTrigger>
							<TabsTrigger 
								value="log" 
								class="rounded-none border-b-2 border-transparent bg-transparent px-4 py-2 text-sm font-medium text-muted-foreground transition-all hover:bg-muted/30 hover:text-foreground data-[state=active]:border-green-500 data-[state=active]:bg-muted/20 data-[state=active]:text-white data-[state=active]:shadow-none whitespace-nowrap"
							>
								Aktions Log
							</TabsTrigger>
							<TabsTrigger 
								value="addons" 
								class="rounded-none border-b-2 border-transparent bg-transparent px-4 py-2 text-sm font-medium text-muted-foreground transition-all hover:bg-muted/30 hover:text-foreground data-[state=active]:border-green-500 data-[state=active]:bg-muted/20 data-[state=active]:text-white data-[state=active]:shadow-none whitespace-nowrap"
							>
								Addons
							</TabsTrigger>
							<TabsTrigger 
								value="iso" 
								class="rounded-none border-b-2 border-transparent bg-transparent px-4 py-2 text-sm font-medium text-muted-foreground transition-all hover:bg-muted/30 hover:text-foreground data-[state=active]:border-green-500 data-[state=active]:bg-muted/20 data-[state=active]:text-white data-[state=active]:shadow-none whitespace-nowrap"
							>
								ISO
							</TabsTrigger>
							<TabsTrigger 
								value="auto" 
								class="rounded-none border-b-2 border-transparent bg-transparent px-4 py-2 text-sm font-medium text-muted-foreground transition-all hover:bg-muted/30 hover:text-foreground data-[state=active]:border-green-500 data-[state=active]:bg-muted/20 data-[state=active]:text-white data-[state=active]:shadow-none whitespace-nowrap"
							>
								Automatis Verlängerung
							</TabsTrigger>
						</TabsList>
					</div>
				</div>

					<!-- IP Adressen Tab -->
					<TabsContent value="ip" class="space-y-6">
						<!-- Alert Banner -->
						<div class="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 text-sm">
							Die Email Ports sind aktuell gesperrt. Die Ports können Sie direkt hier
							entsperren:
							<Button variant="link" class="h-auto p-0 ml-1 text-blue-500">
								Entsperren
							</Button>
						</div>

						<!-- IPv4 Adressen -->
						<div class="space-y-4">
							<h3 class="text-lg font-semibold">IPv4 Adressen</h3>
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>IP</TableHead>
										<TableHead>Gateway</TableHead>
										<TableHead>Netmask</TableHead>
										<TableHead>rDNS</TableHead>
										<TableHead>DDoS Protection Status</TableHead>
										<TableHead>Aktionen</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{@const ipDetails = getIpDetails()}
									{@const ipAddressStr = getIpAddress()}
									{#if ipDetails && ipAddressStr !== 'Nicht verfügbar'}
										<TableRow>
											<TableCell class="font-mono">{ipDetails.ip}</TableCell>
											<TableCell class="font-mono">{ipDetails.gw}</TableCell>
											<TableCell class="font-mono">{ipDetails.netmask} /{ipDetails.subnet}</TableCell>
											<TableCell>
												<div class="flex items-center gap-2">
													<span class="font-mono text-sm">{ipDetails.rdns || 'Nicht gesetzt'}</span>
													<Icon
														icon="tabler:pencil"
														class="h-4 w-4 text-muted-foreground cursor-pointer"
													/>
												</div>
												{#if ipDetails.note}
													<p class="text-xs text-muted-foreground mt-1">Notiz: {ipDetails.note}</p>
												{/if}
											</TableCell>
											<TableCell>
												<div class="flex items-center gap-2">
													<Badge class="bg-green-500 text-white">
														{ipDetails.protstatus === 'dynamic' ? 'Dynamisch' : ipDetails.protstatus}
													</Badge>
													<Icon
														icon="tabler:pencil"
														class="h-4 w-4 text-muted-foreground cursor-pointer"
													/>
												</div>
											</TableCell>
											<TableCell>
												<Button
													size="sm"
													class="bg-green-500 hover:bg-green-600 text-white"
												>
													rDNS bearbeiten
												</Button>
											</TableCell>
										</TableRow>
									{:else}
										<TableRow>
											<TableCell colspan={6} class="text-center text-muted-foreground">
												Keine IPv4-Adresse zugewiesen
											</TableCell>
										</TableRow>
									{/if}
								</TableBody>
							</Table>
						</div>

						<!-- IPv6 /64 Subnetze -->
						<div class="space-y-4">
							<h3 class="text-lg font-semibold">IPv6 /64 Subnetze</h3>
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Erste IP</TableHead>
										<TableHead>Subnetz</TableHead>
										<TableHead>Gateway</TableHead>
										<TableHead>Netmask</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{@const ipv6Details = getIpv6Details()}
									{#if ipv6Details}
										<TableRow>
											<TableCell class="font-mono">{ipv6Details.firstip}</TableCell>
											<TableCell class="font-mono">{ipv6Details.subnet}</TableCell>
											<TableCell class="font-mono">{ipv6Details.gw}</TableCell>
											<TableCell class="font-mono">{ipv6Details.netmask}</TableCell>
										</TableRow>
									{:else}
										<TableRow>
											<TableCell colspan={4} class="text-center text-muted-foreground">
												Keine IPv6-Adressen zugewiesen
											</TableCell>
										</TableRow>
									{/if}
								</TableBody>
							</Table>
						</div>

						<!-- IPv6 rDNS -->
						<div class="space-y-4">
							<Button class="bg-green-500 hover:bg-green-600 text-white">
								IPv6 rDNS Eintrag anlegen
							</Button>
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>IP</TableHead>
										<TableHead>rDNS</TableHead>
										<TableHead>Aktionen</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									<TableRow>
										<TableCell colspan={3} class="text-center text-muted-foreground">
											Keine IPv6 rDNS Einträge
										</TableCell>
									</TableRow>
								</TableBody>
							</Table>
						</div>
					</TabsContent>

					<!-- Traffic Tab -->
					<TabsContent value="traffic">
						{#if data.serviceDetails}
							{@const product = (data.serviceDetails as any)?.product}
							{@const trafficGB = product?.additionaltraffic ? parseFloat(product.additionaltraffic) : null}
							{@const maxTrafficGB = trafficGB || 40000}
							{@const currentTrafficGB = product?.usedtraffic ? parseFloat(product.usedtraffic) : (product?.traffic ? parseFloat(product.traffic) : 0)}
							{@const trafficPercent = maxTrafficGB > 0 ? (currentTrafficGB / maxTrafficGB) * 100 : 0}
							<div class="space-y-6">
								<!-- Aktueller Monat -->
								<Card class="border-border/50">
									<CardContent class="p-6">
										<h3 class="text-lg font-semibold mb-4">Aktueller Monat</h3>
										<div class="space-y-3">
											<div class="flex items-center justify-between">
												<span class="text-sm text-muted-foreground">
													{currentTrafficGB.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} GB ({trafficPercent.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%) - Maximal {maxTrafficGB.toLocaleString('de-DE')} GB
												</span>
											</div>
											<Progress value={Math.min(trafficPercent, 100)} max={100} class="h-3" />
										</div>
									</CardContent>
								</Card>

								<!-- Traffic Benachrichtigungen -->
								<Card class="border-border/50">
									<CardContent class="p-6">
										<h3 class="text-lg font-semibold mb-4">Traffic Benachrichtigungen</h3>
										<div class="flex items-center justify-between">
											<span class="text-sm text-muted-foreground">Benachrichtigung via E-Mail</span>
											<Switch bind:checked={trafficNotificationEnabled} />
										</div>
									</CardContent>
								</Card>

								<!-- Letzte 30 Tage -->
								<Card class="border-border/50">
									<CardContent class="p-6">
										<h3 class="text-lg font-semibold mb-4">Letzte 30 Tage</h3>
										<div class="h-64 flex items-center justify-center border border-border rounded-lg bg-muted/20">
											<p class="text-sm text-muted-foreground">
												Traffic-Graph wird hier angezeigt (Coming Soon)
											</p>
										</div>
									</CardContent>
								</Card>

								<!-- Monatsansicht -->
								<Card class="border-border/50">
									<CardContent class="p-6">
										<h3 class="text-lg font-semibold mb-4">Monatsansicht</h3>
										<div class="h-64 flex items-center justify-center border border-border rounded-lg bg-muted/20">
											<p class="text-sm text-muted-foreground">
												Traffic-Graph wird hier angezeigt (Coming Soon)
											</p>
										</div>
									</CardContent>
								</Card>
							</div>
						{:else}
							<div class="text-center py-8 text-muted-foreground">
								Traffic-Statistiken werden geladen...
							</div>
						{/if}
					</TabsContent>

					<!-- Hardware Tab -->
					<TabsContent value="hardware">
						{#if data.serviceDetails}
							{@const product = (data.serviceDetails as any)?.product}
							{@const memoryMB = product?.memory || (data.server.ram * 1024)}
							{@const memoryGB = Math.round(memoryMB / 1024)}
							{@const diskMB = product?.disk ? parseFloat(product.disk) : (data.server.storage * 1024)}
							{@const diskGB = Math.round((diskMB / 1024) * 100) / 100}
							{@const diskTB = diskGB >= 1024 ? Math.round((diskGB / 1024) * 100) / 100 : null}
							{@const trafficGB = product?.additionaltraffic}
							{@const trafficTB = trafficGB ? Math.round(parseFloat(trafficGB) / 1000) : null}
							{@const uplinkMbit = product?.uplink || (data.server.bandwidth * 1000)}
							{@const uplinkMB = Math.round(uplinkMbit / 8)}
							{@const maxUplinkMbit = product?.maxuplink || uplinkMbit}
							{@const maxUplinkMB = Math.round(maxUplinkMbit / 8)}
							{@const maxUplinkGbit = Math.round(maxUplinkMbit / 1000)}
							<div class="space-y-6">
								<h2 class="text-xl font-semibold">KVM Info</h2>
								
								<Card class="border-border/50">
									<CardContent class="p-0">
										<div class="divide-y divide-border">
											<!-- Virtuelle Kerne -->
											<div class="flex items-center justify-between px-6 py-4">
												<span class="text-sm font-medium text-muted-foreground">Virtuelle Kerne</span>
												<span class="text-sm font-semibold">
													{product?.cores || data.server.cpu}
												</span>
											</div>

											<!-- CPU-Type -->
											<div class="flex items-center justify-between px-6 py-4">
												<span class="text-sm font-medium text-muted-foreground">CPU-Type</span>
												<span class="text-sm font-semibold font-mono">
													{product?.cputype || 'host'}
												</span>
											</div>

											<!-- Arbeitsspeicher -->
											<div class="flex items-center justify-between px-6 py-4">
												<span class="text-sm font-medium text-muted-foreground">Arbeitsspeicher</span>
												<span class="text-sm font-semibold">{memoryGB} GB</span>
											</div>

											<!-- RAID 1 NVMe Speicher -->
											<div class="flex items-center justify-between px-6 py-4">
												<span class="text-sm font-medium text-muted-foreground">RAID 1 NVMe Speicher</span>
												<span class="text-sm font-semibold">
													{diskTB ? `${diskTB} TB` : `${diskGB} GB`}
												</span>
											</div>

											<!-- Traffic -->
											<div class="flex items-center justify-between px-6 py-4">
												<span class="text-sm font-medium text-muted-foreground">Traffic</span>
												<span class="text-sm font-semibold">
													{trafficTB ? `${trafficTB} TB` : 'Unbegrenzt'}
												</span>
											</div>

											<!-- Uplink -->
											<div class="flex items-center justify-between px-6 py-4">
												<span class="text-sm font-medium text-muted-foreground">Uplink</span>
												<div class="flex items-center gap-2">
													<span class="text-sm font-semibold">
														{uplinkMB} MB/s (Maximal: {maxUplinkMB} MB/s | {maxUplinkMbit} Mbit/s | {maxUplinkGbit} Gbit/s)
													</span>
													<Icon icon="tabler:pencil" class="h-4 w-4 text-muted-foreground cursor-pointer" />
												</div>
											</div>

											<!-- TPM Status -->
											<div class="flex items-center justify-between px-6 py-4">
												<span class="text-sm font-medium text-muted-foreground">TPM Status</span>
												<div class="flex items-center gap-2">
													<Badge class={product?.tpm === 1 ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}>
														{product?.tpm === 1 ? 'Aktiv' : 'Nicht aktiv'}
													</Badge>
													<Icon icon="tabler:pencil" class="h-4 w-4 text-muted-foreground cursor-pointer" />
												</div>
											</div>

											<!-- UEFI Status -->
											<div class="flex items-center justify-between px-6 py-4">
												<span class="text-sm font-medium text-muted-foreground">UEFI Status</span>
												<div class="flex items-center gap-2">
													<Badge class={product?.uefi === 1 ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}>
														{product?.uefi === 1 ? 'Aktiv' : 'Nicht aktiv'}
													</Badge>
													<Icon icon="tabler:pencil" class="h-4 w-4 text-muted-foreground cursor-pointer" />
												</div>
											</div>

											<!-- Hostsystem -->
											<div class="flex items-center justify-between px-6 py-4">
												<span class="text-sm font-medium text-muted-foreground">Hostsystem</span>
												<span class="text-sm font-semibold font-mono">
													{product?.node || 'N/A'}
												</span>
											</div>

											<!-- Serverstandort -->
											<div class="flex items-center justify-between px-6 py-4">
												<span class="text-sm font-medium text-muted-foreground">Serverstandort</span>
												<span class="text-sm font-semibold">
													{product?.location || 'Nicht verfügbar'}
												</span>
											</div>

											<!-- Proxmox ID -->
											<div class="flex items-center justify-between px-6 py-4">
												<span class="text-sm font-medium text-muted-foreground">Proxmox ID</span>
												<span class="text-sm font-semibold font-mono">
													{product?.proxmoxid || 'N/A'}
												</span>
											</div>

											<!-- Cluster -->
											<div class="flex items-center justify-between px-6 py-4">
												<span class="text-sm font-medium text-muted-foreground">Cluster</span>
												<span class="text-sm font-semibold">
													{product?.clusterinfo?.displayname || product?.cluster || 'N/A'}
												</span>
											</div>

											<!-- DDoS Schutz -->
											<div class="flex items-center justify-between px-6 py-4">
												<span class="text-sm font-medium text-muted-foreground">DDoS Schutz</span>
												<span class="text-sm font-semibold font-mono">
													{product?.ddos || 'AS203446 SmartMitigate'}
												</span>
											</div>
										</div>
									</CardContent>
								</Card>
							</div>
						{:else}
							<div class="text-center py-8 text-muted-foreground">
								Hardware-Informationen werden geladen...
							</div>
						{/if}
					</TabsContent>

					<!-- Backups Tab -->
					<TabsContent value="backups">
						<div class="text-center py-8 text-muted-foreground">
							Backup-Verwaltung wird hier angezeigt
						</div>
					</TabsContent>

					<!-- Livedaten Tab -->
					<TabsContent value="livedata">
						<div class="text-center py-8 text-muted-foreground">
							Live-Daten werden hier angezeigt
						</div>
					</TabsContent>

					<!-- Other Tabs -->
					<TabsContent value="tasks">
						<div class="text-center py-8 text-muted-foreground">
							Geplante Aufgaben werden hier angezeigt
						</div>
					</TabsContent>

					<TabsContent value="ddos">
						<div class="text-center py-8 text-muted-foreground">DDoS Log wird hier angezeigt</div>
					</TabsContent>

					<TabsContent value="sshkeys">
						<div class="text-center py-8 text-muted-foreground">SSH Keys werden hier angezeigt</div>
					</TabsContent>

					<TabsContent value="log">
						<div class="text-center py-8 text-muted-foreground">Aktions Log wird hier angezeigt</div>
					</TabsContent>

					<TabsContent value="addons">
						<div class="text-center py-8 text-muted-foreground">Addons werden hier angezeigt</div>
					</TabsContent>

					<TabsContent value="iso">
						<div class="text-center py-8 text-muted-foreground">ISO-Verwaltung wird hier angezeigt</div>
					</TabsContent>

					<TabsContent value="auto">
						<div class="text-center py-8 text-muted-foreground">
							Automatische Verlängerung wird hier angezeigt
						</div>
					</TabsContent>
				</Tabs>
			</CardContent>
		</Card>
	</main>
</div>

<!-- Login Daten Dialog -->
<Dialog bind:open={loginDialogOpen}>
	<DialogContent class="sm:max-w-lg">
		<DialogHeader>
			<DialogTitle>Login Daten</DialogTitle>
			<DialogDescription>
				Verwenden Sie diese Anmeldedaten, um sich mit Ihrem VPS zu verbinden.
			</DialogDescription>
		</DialogHeader>

		{#if loginDialogOpen}
			<div class="space-y-6 py-4">
				<!-- User -->
				<div class="space-y-2">
					<label class="text-sm font-medium" for="login-user">User</label>
					<div class="flex items-center gap-2">
						<Input
							id="login-user"
							type="text"
							value={getUser()}
							readonly
							class="font-mono flex-1"
						/>
						<Button
							size="sm"
							variant="ghost"
							class="h-9 w-9 p-0 bg-green-500 hover:bg-green-600 text-white"
							onclick={() => copyToClipboard(getUser(), 'user')}
							title="Kopieren"
						>
							{#if userCopied}
								<Icon icon="tabler:check" class="h-4 w-4" />
							{:else}
								<Icon icon="tabler:copy" class="h-4 w-4" />
							{/if}
						</Button>
					</div>
				</div>

				<!-- Passwort -->
				<div class="space-y-2">
					<label class="text-sm font-medium" for="login-password">Passwort</label>
					<div class="flex items-center gap-2">
						<Input
							id="login-password"
							type={passwordVisible ? 'text' : 'password'}
							value={getPassword()}
							readonly
							class="font-mono flex-1"
						/>
						<Button
							size="sm"
							variant="ghost"
							class="h-9 w-9 p-0 bg-green-500 hover:bg-green-600 text-white"
							onclick={() => copyToClipboard(getPassword(), 'password')}
							title="Kopieren"
						>
							{#if passwordCopied}
								<Icon icon="tabler:check" class="h-4 w-4" />
							{:else}
								<Icon icon="tabler:copy" class="h-4 w-4" />
							{/if}
						</Button>
						<Button
							size="sm"
							variant="ghost"
							class="h-9 w-9 p-0"
							onclick={() => (passwordVisible = !passwordVisible)}
							title={passwordVisible ? 'Verbergen' : 'Anzeigen'}
						>
							{#if passwordVisible}
								<Icon icon="tabler:eye-off" class="h-4 w-4" />
							{:else}
								<Icon icon="tabler:eye" class="h-4 w-4" />
							{/if}
						</Button>
					</div>
				</div>

				<!-- IP -->
				<div class="space-y-2">
					<label class="text-sm font-medium" for="login-ip">IP-Adresse</label>
					<div class="flex items-center gap-2">
						<Input
							id="login-ip"
							type="text"
							value={getIpAddress()}
							readonly
							class="font-mono flex-1"
						/>
						{#if getIpAddress() !== 'Nicht verfügbar'}
							<Button
								size="sm"
								variant="ghost"
								class="h-9 w-9 p-0 bg-green-500 hover:bg-green-600 text-white"
								onclick={() => copyToClipboard(getIpAddress(), 'ip')}
								title="Kopieren"
							>
								{#if ipCopied}
									<Icon icon="tabler:check" class="h-4 w-4" />
								{:else}
									<Icon icon="tabler:copy" class="h-4 w-4" />
								{/if}
							</Button>
						{/if}
					</div>
				</div>

				<!-- Port -->
				<div class="space-y-2">
					<label class="text-sm font-medium" for="login-port">Port</label>
					<div class="flex items-center gap-2">
						<Input
							id="login-port"
							type="text"
							value={getPort()}
							readonly
							class="font-mono flex-1"
						/>
						<Button
							size="sm"
							variant="ghost"
							class="h-9 w-9 p-0 bg-green-500 hover:bg-green-600 text-white"
							onclick={() => copyToClipboard(getPort(), 'port')}
							title="Kopieren"
						>
							{#if portCopied}
								<Icon icon="tabler:check" class="h-4 w-4" />
							{:else}
								<Icon icon="tabler:copy" class="h-4 w-4" />
							{/if}
						</Button>
					</div>
				</div>
			</div>
		{/if}

		<DialogFooter class="flex-col-reverse sm:flex-row sm:justify-between gap-2 sm:gap-3">
			<Button
				variant="outline"
				class="w-full sm:w-auto"
				onclick={() => (loginDialogOpen = false)}
				type="button"
			>
				Schließen
			</Button>
			<Button
				class="w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white"
				onclick={resetPassword}
				disabled={loading['resetPassword']}
				type="button"
			>
				Passwort zurücksetzen
			</Button>
		</DialogFooter>
	</DialogContent>
</Dialog>


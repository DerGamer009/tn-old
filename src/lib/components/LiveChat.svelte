<script lang="ts">
	import { onMount } from 'svelte';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Textarea } from '$lib/components/ui/textarea';
	import Icon from '@iconify/svelte';

	let { pageContext = 'dashboard' }: { pageContext?: string } = $props();

	type ChatMessage = {
		id: string;
		content: string;
		sender: 'USER' | 'STAFF' | 'SYSTEM';
		createdAt: string;
	};

	let messages = $state<ChatMessage[]>([]);
	let input = $state('');
	let loading = $state(false);
	let sending = $state(false);
	let error = $state<string | null>(null);
	let isOpen = $state(false);

	let sessionToken: string | null = null;
	let pollInterval: ReturnType<typeof setInterval> | null = null;
	let messagesContainer = $state<HTMLDivElement | null>(null);

	function handleWheel(event: WheelEvent) {
		if (!messagesContainer) return;

		// Scroll nur im Chat, Seite selbst nicht bewegen
		messagesContainer.scrollTop += event.deltaY;
		event.preventDefault();
	}

	function initSessionToken() {
		if (typeof window === 'undefined') return;
		const stored = localStorage.getItem('tn_livechat_token');
		if (stored) {
			sessionToken = stored;
			return;
		}
		if (crypto?.randomUUID) {
			sessionToken = crypto.randomUUID();
		} else {
			sessionToken = Math.random().toString(36).slice(2) + Date.now().toString(36);
		}
		localStorage.setItem('tn_livechat_token', sessionToken);
	}

	async function ensureSession() {
		if (!sessionToken) return;
		try {
			await fetch('/api/livechat', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					sessionToken,
					pageContext
				})
			});
		} catch (e) {
			console.error('LiveChat: Session-Init fehlgeschlagen', e);
		}
	}

	async function loadMessages() {
		if (!sessionToken) return;
		loading = true;
		error = null;
		try {
			const res = await fetch(`/api/livechat/messages?sessionToken=${encodeURIComponent(sessionToken)}`);
			if (!res.ok) {
				throw new Error('Fehler beim Laden der Nachrichten');
			}
			const data = await res.json();
			messages = data.messages ?? [];
		} catch (e) {
			console.error(e);
			error = 'Chat konnte nicht geladen werden.';
		} finally {
			loading = false;
		}
	}

	async function sendMessage() {
		if (!sessionToken || !input.trim() || sending) return;
		const content = input.trim();
		input = '';
		sending = true;
		error = null;

		try {
			const res = await fetch('/api/livechat/messages', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					sessionToken,
					content
				})
			});

			if (!res.ok) {
				throw new Error('Fehler beim Senden der Nachricht');
			}

			await loadMessages();
		} catch (e) {
			console.error(e);
			error = 'Nachricht konnte nicht gesendet werden.';
		} finally {
			sending = false;
		}
	}

	function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		void sendMessage();
	}

	function toggleOpen() {
		isOpen = !isOpen;
	}

onMount(() => {
		(async () => {
			initSessionToken();
			await ensureSession();
			await loadMessages();
		})();

		pollInterval = setInterval(loadMessages, 5000);

		return () => {
			if (pollInterval) clearInterval(pollInterval);
		};
	});

	// Scroll immer ans Ende, wenn neue Nachrichten dazukommen
	$effect(() => {
		if (!messagesContainer) return;
		// Zugriff auf messages sorgt dafür, dass der Effekt bei neuen Nachrichten läuft
		const _len = messages.length;
		messagesContainer.scrollTop = messagesContainer.scrollHeight;
	});
</script>

<div class="fixed bottom-4 right-4 z-40 sm:bottom-6 sm:right-6">
	<!-- Floating Button -->
	<button
		class="flex h-14 w-14 items-center justify-center rounded-full bg-background/80 text-primary-foreground shadow-xl hover:bg-background focus:outline-none focus:ring-2 focus:ring-primary/60 border border-primary/70 overflow-hidden"
		onclick={toggleOpen}
		aria-label="Live-Chat öffnen"
	>
		<img
			src="/logo.png"
			alt="TitanNode Bot"
			class="h-full w-full object-cover"
			loading="lazy"
		/>
	</button>

	<!-- Chat Panel -->
	{#if isOpen}
		<Card class="mt-3 w-80 sm:w-96 max-h-[30rem] flex flex-col rounded-3xl border border-border/60 bg-background/95 backdrop-blur-xl shadow-2xl">
			<CardHeader class="flex flex-row items-center justify-between py-3 border-b border-border/70 bg-gradient-to-r from-primary/10 via-background to-background rounded-t-2xl">
				<div class="flex items-center gap-3">
					<div class="h-9 w-9 rounded-full overflow-hidden border border-primary/70 bg-primary/10 flex items-center justify-center shadow-sm">
						<img
							src="/logo.png"
							alt="TitanNode Bot"
							class="h-full w-full object-cover"
							loading="lazy"
						/>
					</div>
					<div>
						<CardTitle class="text-sm font-semibold leading-tight">TitanNode</CardTitle>
						<p class="text-[11px] text-muted-foreground">
							Bereit, deine Fragen zu beantworten.
						</p>
					</div>
				</div>
				<button
					type="button"
					class="rounded-full p-1.5 text-muted-foreground hover:bg-muted/70 transition-colors"
					onclick={toggleOpen}
					aria-label="Chat schließen"
				>
					<Icon icon="tabler:x" class="h-4 w-4" />
				</button>
			</CardHeader>
			<CardContent class="flex flex-1 flex-col gap-0 pb-4 pt-2">
				<div
					class="flex-1 max-h-64 overflow-y-auto px-4 pt-3 pb-2 space-y-3 text-xs"
					bind:this={messagesContainer}
					onwheel={handleWheel}
				>
					{#if loading && messages.length === 0}
						<div class="flex h-full items-center justify-center">
							<p class="text-muted-foreground text-xs">Chat wird geladen...</p>
						</div>
					{:else if error}
						<div class="flex h-full items-center justify-center">
							<p class="text-red-500 text-xs text-center px-4">{error}</p>
						</div>
					{:else if messages.length === 0}
						<!-- Welcome State ähnlich Mimi -->
						<div class="flex h-full flex-col items-center justify-center gap-4 text-center">
							<div class="h-20 w-20 rounded-full overflow-hidden border border-primary/70 bg-primary/10 flex items-center justify-center shadow-md">
								<img
									src="/logo.png"
									alt="TitanNode Bot"
									class="h-full w-full object-cover"
									loading="lazy"
								/>
							</div>
							<div class="space-y-1">
								<p class="text-sm font-semibold text-foreground">Bereit zu antworten</p>
								<p class="text-[11px] text-muted-foreground">
									Frag mich alles zu TitanNode – Status, Produkte oder Hilfe.
								</p>
							</div>
						</div>
					{:else}
						{#each messages as message (message.id)}
							<div
								class="flex {message.sender === 'USER' ? 'justify-end' : 'justify-start'}"
							>
								<div class="flex items-end gap-2 max-w-[85%]">
									{#if message.sender !== 'USER'}
										<div class="h-6 w-6 rounded-full overflow-hidden border border-primary/60 bg-primary/10 flex-shrink-0 hidden sm:block shadow-sm">
											<img
												src="/logo.png"
												alt="TitanNode Bot"
												class="h-full w-full object-cover"
												loading="lazy"
											/>
										</div>
									{/if}
									<div
										class="max-w-full rounded-2xl px-3 py-2 text-[11px] leading-snug shadow-sm
											{message.sender === 'USER'
												? 'bg-primary text-primary-foreground'
												: 'bg-muted text-foreground border border-border/60'}"
									>
										{#if message.sender !== 'USER'}
											<p class="mb-0.5 text-[10px] font-semibold opacity-80">
												TitanNode
											</p>
										{/if}
										<p class="whitespace-pre-line">{message.content}</p>
									</div>
								</div>
							</div>
						{/each}
					{/if}
				</div>

				<!-- Footer & Eingabe, angelehnt an Mimi -->
				<div class="mt-1 border-t border-border/70 pt-2 space-y-2">
					<p class="text-[10px] text-muted-foreground text-center">
						TitanNode kann Fehler machen. Bitte prüfe wichtige Informationen.
					</p>
					<form
						class="flex items-center gap-2 rounded-2xl border border-border/70 bg-background/90 px-3 py-2"
						onsubmit={handleSubmit}
					>
						<input
							class="flex-1 bg-transparent text-xs outline-none placeholder:text-muted-foreground"
							type="text"
							placeholder="Nachricht eingeben..."
							value={input}
							oninput={(e) => (input = (e.currentTarget as HTMLInputElement).value)}
						/>
						<Button
							type="submit"
							size="icon"
							class="h-7 w-7 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
							disabled={sending || !input.trim()}
						>
							{#if sending}
								<Icon icon="tabler:loader-2" class="h-3 w-3 animate-spin" />
							{:else}
								<Icon icon="tabler:send-2" class="h-3 w-3" />
							{/if}
						</Button>
					</form>
				</div>
			</CardContent>
		</Card>
	{/if}
</div>


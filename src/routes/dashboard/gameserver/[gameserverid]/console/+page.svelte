<script lang="ts">
	import type { PageData } from './$types';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent } from '$lib/components/ui/card';
	import Icon from '@iconify/svelte';
	import { onMount } from 'svelte';

	let { data }: { data: PageData } = $props();

	// Console State
	let consoleOutput = $state<string[]>([]);
	let commandInput = $state('');
	let eventSource: EventSource | null = null;
	let isConnected = $state(false);
	let isConnecting = $state(false);
	let connectionAttempted = $state(false);
	let lastConnectionAttempt = $state(0);

	// Get service ID
	const serviceId = $derived((data.server as any)?.pterodactylServerId || data.server?.id);

	// Console Functions
	async function connectSSE() {
		if (!data || !data.server || !(data.server as any).pterodactylServerId) {
			alert('Pterodactyl Server ID fehlt');
			return;
		}

		// Verhindere mehrere gleichzeitige Verbindungsversuche
		if (isConnecting || isConnected || eventSource) {
			return;
		}

		// Rate Limiting: Warte mindestens 5 Sekunden zwischen Versuchen
		const now = Date.now();
		if (lastConnectionAttempt > 0 && now - lastConnectionAttempt < 5000) {
			console.log('Rate limiting: Warte auf nächsten Verbindungsversuch...');
			return;
		}

		lastConnectionAttempt = now;
		isConnecting = true;
		
		try {
			// Verbinde mit SSE-Stream (löst Mixed Content Problem)
			const streamUrl = `/api/gameserver/${data.server.id}/console/stream`;
			console.log('Connecting to SSE stream:', streamUrl);
			
			eventSource = new EventSource(streamUrl);
			
			eventSource.onopen = () => {
				isConnected = true;
				isConnecting = false;
				console.log('SSE connected successfully');
			};

			eventSource.onmessage = (event) => {
				try {
					const message = JSON.parse(event.data);
					
					if (message.type === 'console') {
						// Nur die tatsächliche Console-Ausgabe anzeigen
						// Zeilenweise verarbeiten
						const lines = message.data.split('\n');
						for (let i = 0; i < lines.length; i++) {
							let line = lines[i];
							
							// Ignoriere leere Zeilen am Ende
							if (i === lines.length - 1 && !line.trim()) {
								continue;
							}
							
							// Cursor-Bewegungen und Carriage Returns behandeln
							const processedLine = processConsoleLine(line);
							if (processedLine !== null && processedLine.trim()) {
								// Prüfe ob die letzte Zeile überschrieben werden sollte (Progress-Updates)
								if (consoleOutput.length > 0) {
									const lastLine = consoleOutput[consoleOutput.length - 1];
									if (lastLine && lastLine.length > 0 && processedLine.length < lastLine.length) {
										const isProgress = /[|/\\-]/.test(processedLine) || processedLine.length < 50;
										const lastWasProgress = /[|/\\-]/.test(lastLine) || lastLine.length < 50;
										
										if (isProgress && lastWasProgress) {
											consoleOutput = [...consoleOutput.slice(0, -1), processedLine];
										} else {
											consoleOutput = [...consoleOutput, processedLine];
										}
									} else {
										consoleOutput = [...consoleOutput, processedLine];
									}
								} else {
									consoleOutput = [...consoleOutput, processedLine];
								}
							}
						}
						scrollConsole();
					} else if (message.type === 'error') {
						console.error('SSE error:', message.data);
						consoleOutput = [...consoleOutput, `[Fehler: ${message.data}]`];
						scrollConsole();
					} else if (message.type === 'close') {
						console.log('SSE stream closed:', message.data);
						isConnected = false;
						eventSource?.close();
						eventSource = null;
					}
				} catch (e) {
					console.error('Error parsing SSE message:', e, event.data);
					if (typeof event.data === 'string') {
						const lines = event.data.split('\n');
						for (const line of lines) {
							if (line.trim()) {
								const processedLine = processConsoleLine(line);
								if (processedLine !== null) {
									consoleOutput = [...consoleOutput, processedLine];
								}
							}
						}
						scrollConsole();
					}
				}
			};

			eventSource.onerror = (error) => {
				console.error('SSE Error:', error);
				consoleOutput = [...consoleOutput, '[Fehler: Verbindung zum Stream fehlgeschlagen]'];
				isConnecting = false;
				isConnected = false;
				eventSource?.close();
				eventSource = null;
				setTimeout(() => {
					if (!isConnected && !isConnecting) {
						connectionAttempted = false;
					}
				}, 5000);
				scrollConsole();
			};
		} catch (error) {
			console.error('Error connecting SSE:', error);
			consoleOutput = [...consoleOutput, `[Fehler: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}]`];
			isConnecting = false;
			isConnected = false;
			eventSource?.close();
			eventSource = null;
			setTimeout(() => {
				if (!isConnected && !isConnecting) {
					connectionAttempted = false;
				}
			}, 10000);
			scrollConsole();
		}
	}

	// Verarbeite eine Console-Zeile (behandelt Cursor-Bewegungen und \r)
	function processConsoleLine(line: string): string | null {
		line = line.replace(/\x1b\[[0-9]*[GKJ]/g, '');
		line = line.replace(/\\n/g, '');
		line = line.replace(/\\r/g, '');
		
		const crParts = line.split('\r');
		if (crParts.length > 1) {
			line = crParts[crParts.length - 1];
		}
		
		const cleaned = line.trim();
		if (!cleaned) {
			return null;
		}
		
		if (/^[|/\\-]+$/.test(cleaned)) {
			return null;
		}
		
		line = line.replace(/^[|/\\-]+\s*/g, '');
		line = line.replace(/\s*[|/\\-]+$/g, '');
		line = line.replace(/\s+\|\s+/g, ' ');
		line = line.replace(/^\|\s*/g, '');
		line = line.replace(/\s*\|$/g, '');
		
		return line;
	}

	async function sendCommand() {
		if (!isConnected || !commandInput.trim() || !data || !data.server) return;

		try {
			const response = await fetch(`/api/gameserver/${data.server.id}/console/command`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ command: commandInput })
			});

			if (!response.ok) {
				const error = await response.json();
				console.error('Fehler beim Senden des Befehls:', error);
				consoleOutput = [...consoleOutput, `[Fehler beim Senden: ${error.error || 'Unbekannter Fehler'}]`];
				scrollConsole();
				return;
			}

			consoleOutput = [...consoleOutput, `> ${commandInput}`];
			commandInput = '';
			scrollConsole();
		} catch (error) {
			console.error('Error sending command:', error);
			consoleOutput = [...consoleOutput, `[Fehler beim Senden: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}]`];
			scrollConsole();
		}
	}

	function scrollConsole() {
		setTimeout(() => {
			const outputEl = document.getElementById('console-output');
			if (outputEl) {
				outputEl.scrollTop = outputEl.scrollHeight;
			}
		}, 100);
	}

	// ANSI zu HTML Converter für einzelne Zeilen
	function ansiToHtml(line: string): string {
		if (!line) return '';
		
		let text = line.replace(/\x1b\[[0-9]*[GKJ]/g, '');
		
		const crParts = text.split('\r');
		if (crParts.length > 1) {
			text = crParts[crParts.length - 1];
		}
		
		let lines = text.split('\n');
		const processedLines: string[] = [];
		
		for (let i = 0; i < lines.length; i++) {
			let line = lines[i];
			
			const crParts = line.split('\r');
			if (crParts.length > 1) {
				line = crParts[crParts.length - 1];
			}
			
			if (line.trim() || i === 0 || processedLines.length > 0) {
				processedLines.push(line);
			}
		}
		
		while (processedLines.length > 0 && !processedLines[processedLines.length - 1]?.trim()) {
			processedLines.pop();
		}
		
		const ansiColorRegex = /\x1b\[([0-9;]+)m/g;
		
		const colorMap: { [key: number]: string } = {
			30: '#000000',
			31: '#d32f2f',
			32: '#388e3c',
			33: '#f57c00',
			34: '#1976d2',
			35: '#7b1fa2',
			36: '#00acc1',
			37: '#757575',
			39: '#e0e0e0',
			90: '#616161',
			91: '#e53935',
			92: '#43a047',
			93: '#fb8c00',
			94: '#1e88e5',
			95: '#8e24aa',
			96: '#00acc1',
			97: '#fafafa',
		};

		const bgColorMap: { [key: number]: string } = {
			40: '#000000',
			41: '#d32f2f',
			42: '#388e3c',
			43: '#f57c00',
			44: '#1976d2',
			45: '#7b1fa2',
			46: '#00acc1',
			47: '#ffffff',
			49: 'transparent',
		};

		let result = '';
		let lastIndex = 0;
		let currentColor = '';
		let currentBgColor = '';
		let isBold = false;
		
		let match;
		while ((match = ansiColorRegex.exec(text)) !== null) {
			const beforeText = text.substring(lastIndex, match.index);
			if (beforeText) {
				const styles: string[] = [];
				if (currentColor) styles.push(`color:${currentColor}`);
				if (currentBgColor) styles.push(`background-color:${currentBgColor}`);
				if (isBold) styles.push('font-weight:bold');
				
				if (styles.length > 0) {
					result += `<span style="${styles.join(';')}">${escapeHtml(beforeText)}</span>`;
				} else {
					result += escapeHtml(beforeText);
				}
			}
			
			const codes = match[1].split(';').map(s => parseInt(s, 10));
			
			for (const code of codes) {
				if (code === 0) {
					currentColor = '';
					currentBgColor = '';
					isBold = false;
				} else if (code === 1) {
					isBold = true;
				} else if (code === 22) {
					isBold = false;
				} else if (code >= 30 && code <= 37) {
					currentColor = colorMap[code] || '';
				} else if (code === 39) {
					currentColor = colorMap[39];
				} else if (code >= 90 && code <= 97) {
					currentColor = colorMap[code] || '';
				} else if (code >= 40 && code <= 47) {
					currentBgColor = bgColorMap[code] || '';
				} else if (code === 49) {
					currentBgColor = bgColorMap[49];
				}
			}
			
			lastIndex = match.index + match[0].length;
		}
		
		const remainingText = text.substring(lastIndex);
		if (remainingText) {
			const styles: string[] = [];
			if (currentColor) styles.push(`color:${currentColor}`);
			if (currentBgColor) styles.push(`background-color:${currentBgColor}`);
			if (isBold) styles.push('font-weight:bold');
			
			if (styles.length > 0) {
				result += `<span style="${styles.join(';')}">${escapeHtml(remainingText)}</span>`;
			} else {
				result += escapeHtml(remainingText);
			}
		}
		
		return result || '&nbsp;';
	}

	function escapeHtml(text: string): string {
		return text
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&#39;');
	}

	// Auto-connect console when page loads
	onMount(() => {
		if (data && data.server && (data.server as any).pterodactylServerId && !connectionAttempted) {
			connectionAttempted = true;
			setTimeout(() => {
				connectSSE();
			}, 500);
		}

		return () => {
			if (eventSource) {
				eventSource.close();
				eventSource = null;
			}
		};
	});
</script>

<Card class="border-border/50">
	<CardContent class="p-6">
		<div class="space-y-4">
			<div class="flex items-center justify-between">
				<h3 class="text-lg font-semibold">Server Console</h3>
				<div class="flex gap-2">
					<Button
						size="sm"
						variant="outline"
						onclick={() => {
							consoleOutput = [];
							isConnected = false;
							if (eventSource) {
								eventSource.close();
								eventSource = null;
							}
							connectSSE();
						}}
						disabled={isConnecting || isConnected}
					>
						<Icon icon="tabler:refresh" class="h-4 w-4 mr-2" />
						{isConnecting ? 'Verbinde...' : isConnected ? 'Verbunden' : 'Verbinden'}
					</Button>
					<Button
						size="sm"
						variant="destructive"
						onclick={() => {
							consoleOutput = [];
							if (eventSource) {
								eventSource.close();
								eventSource = null;
							}
							isConnected = false;
							isConnecting = false;
						}}
						disabled={!isConnected}
					>
						<Icon icon="tabler:x" class="h-4 w-4 mr-2" />
						Trennen
					</Button>
				</div>
			</div>

			<!-- Console Output -->
			<div
				class="bg-black font-mono text-sm p-4 rounded-lg h-[500px] overflow-y-auto text-gray-100"
				id="console-output"
			>
				{#if !isConnected && !isConnecting}
					<p class="text-gray-500">Klicke auf "Verbinden" um die Console zu öffnen.</p>
				{:else if isConnecting}
					<p class="text-yellow-400">Verbinde mit Server...</p>
				{:else}
					<div class="font-mono text-sm leading-normal space-y-0">
						{#each consoleOutput as line}
							<div class="whitespace-pre-wrap break-words">{@html ansiToHtml(line)}</div>
						{/each}
					</div>
				{/if}
			</div>

			<!-- Console Input -->
			<form
				class="flex gap-2"
				onsubmit={(e) => {
					e.preventDefault();
					sendCommand();
				}}
			>
				<input
					type="text"
					bind:value={commandInput}
					placeholder="Befehl eingeben..."
					class="flex-1 px-4 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
					disabled={!isConnected}
				/>
				<Button type="submit" disabled={!isConnected || !commandInput.trim()}>
					<Icon icon="tabler:send" class="h-4 w-4 mr-2" />
					Senden
				</Button>
			</form>
		</div>
	</CardContent>
</Card>

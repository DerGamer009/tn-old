<script lang="ts">
	import type { PageData } from './$types';
	import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import Icon from '@iconify/svelte';
	import { invalidateAll } from '$app/navigation';

	let { data }: { data: PageData } = $props();

	let loading = $state(false);
	let saving = $state(false);
	let startupCommand = $state('');
	let environment = $state<Record<string, string>>({});

	$effect(() => {
		if (data.startup?.startup_command != null) startupCommand = data.startup.startup_command;
		if (data.startup?.environment != null) environment = { ...data.startup.environment };
	});

	async function loadStartup() {
		loading = true;
		try {
			const response = await fetch(`/api/gameserver/${data.server.id}/startup`);
			if (response.ok) {
				const result = await response.json();
				startupCommand = result.startup?.startup_command || '';
				environment = result.startup?.environment || {};
			}
		} catch (error) {
			console.error('Fehler beim Laden der Startup-Konfiguration:', error);
		} finally {
			loading = false;
		}
	}

	async function saveStartup() {
		if (saving) return;

		if (!startupCommand.trim()) {
			alert('Bitte gib einen Startup-Command ein');
			return;
		}

		saving = true;
		try {
			const response = await fetch(`/api/gameserver/${data.server.id}/startup`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					startup_command: startupCommand.trim(),
					environment
				})
			});

			if (!response.ok) {
				let errorMessage = 'Fehler beim Speichern der Startup-Konfiguration';
				try {
					const error = await response.json();
					errorMessage = error.error || error.message || errorMessage;
				} catch {
					errorMessage = `Fehler ${response.status}: ${response.statusText}`;
				}
				alert(errorMessage);
				return;
			}

			await invalidateAll();
			await loadStartup();
			alert('Startup-Konfiguration erfolgreich gespeichert');
		} catch (error) {
			console.error('Fehler beim Speichern:', error);
			alert('Fehler beim Speichern der Startup-Konfiguration');
		} finally {
			saving = false;
		}
	}

	function addEnvironmentVariable() {
		const key = prompt('Variable-Name:');
		if (key && key.trim() && !environment[key.trim()]) {
			environment = { ...environment, [key.trim()]: '' };
		} else if (key && key.trim() && environment[key.trim()]) {
			alert('Diese Variable existiert bereits');
		}
	}

	function removeEnvironmentVariable(key: string) {
		const newEnv = { ...environment };
		delete newEnv[key];
		environment = newEnv;
	}
</script>

<svelte:head>
	<title>Startup - {data.server.name} | TitanNode Dashboard</title>
</svelte:head>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<div class="flex items-center gap-3">
			<Icon icon="tabler:adjustments-alt" class="h-8 w-8 text-primary" />
			<h1 class="text-3xl font-bold">Startup</h1>
		</div>
		<div class="flex gap-2">
			<Button variant="outline" onclick={() => loadStartup()} disabled={loading}>
				<Icon icon="tabler:refresh" class="h-4 w-4 mr-2" />
				{loading ? 'Lädt...' : 'Aktualisieren'}
			</Button>
		</div>
	</div>

	<Card class="border-border/50">
		<CardHeader>
			<CardTitle>Startup-Konfiguration</CardTitle>
			<CardDescription>
				Verwalte die Startup-Einstellungen für {data.server.name}
			</CardDescription>
		</CardHeader>
		<CardContent class="space-y-6">
			<div class="space-y-2">
				<Label for="startup-command">Startup-Command</Label>
				<Textarea
					id="startup-command"
					bind:value={startupCommand}
					placeholder={`z.B. java -Xms128M -Xmx${'{'}${'{'}SERVER_MEMORY${'}'}${'}'}M -jar server.jar`}
					rows={4}
					class="font-mono text-sm"
				/>
				<p class="text-xs text-muted-foreground">
					Der Command, der beim Starten des Servers ausgeführt wird. Verwende {'{'}{'{'}}VARIABLE{'}'}{'}'} für Environment-Variablen.
				</p>
			</div>

			<div class="space-y-3">
				<div class="flex items-center justify-between">
					<Label>Environment-Variablen</Label>
					<Button variant="outline" size="sm" onclick={() => addEnvironmentVariable()}>
						<Icon icon="tabler:plus" class="h-4 w-4 mr-2" />
						Variable hinzufügen
					</Button>
				</div>
				{#if Object.keys(environment).length > 0}
					<div class="space-y-2 border rounded-lg p-4">
						{#each Object.entries(environment) as [key, value]}
							<div class="flex items-center gap-2">
								<Input
									value={key}
									readonly
									class="font-mono text-sm flex-1"
									placeholder="Variable-Name"
								/>
								<span class="text-muted-foreground">=</span>
								<Input
									value={value}
									oninput={(e) => {
										environment = { ...environment, [key]: e.currentTarget.value };
									}}
									class="font-mono text-sm flex-1"
									placeholder="Variable-Wert"
								/>
								<Button
									variant="ghost"
									size="sm"
									onclick={() => removeEnvironmentVariable(key)}
								>
									<Icon icon="tabler:trash" class="h-4 w-4" />
								</Button>
							</div>
						{/each}
					</div>
				{:else}
					<div class="text-center py-8 border rounded-lg border-dashed">
						<p class="text-sm text-muted-foreground">Keine Environment-Variablen vorhanden</p>
					</div>
				{/if}
			</div>

			<div class="flex justify-end gap-2 pt-4 border-t">
				<Button variant="outline" onclick={() => loadStartup()}>
					Abbrechen
				</Button>
				<Button onclick={() => saveStartup()} disabled={saving}>
					{saving ? 'Wird gespeichert...' : 'Speichern'}
				</Button>
			</div>
		</CardContent>
	</Card>
</div>

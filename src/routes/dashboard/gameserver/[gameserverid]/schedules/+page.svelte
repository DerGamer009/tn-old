<script lang="ts">
	import type { PageData } from './$types';
	import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '$lib/components/ui/dialog';
	import { Textarea } from '$lib/components/ui/textarea';
	import Icon from '@iconify/svelte';
	import { invalidateAll } from '$app/navigation';

	let { data }: { data: PageData } = $props();

	let schedules = $state<PageData['schedules']>([]);
	let loading = $state(false);

	$effect(() => {
		if (data.schedules != null) schedules = data.schedules;
	});
	let creatingSchedule = $state(false);
	let showCreateDialog = $state(false);
	let showEditDialog = $state(false);
	let showTaskDialog = $state(false);
	let showTaskEditDialog = $state(false);
	let editingScheduleId = $state<number | null>(null);
	let editingTaskScheduleId = $state<number | null>(null);
	let editingTaskId = $state<number | null>(null);
	let currentScheduleTasks = $state<any[]>([]);

	// Schedule Form
	let scheduleName = $state('');
	let scheduleMinute = $state('0');
	let scheduleHour = $state('*');
	let scheduleDayOfMonth = $state('*');
	let scheduleMonth = $state('*');
	let scheduleDayOfWeek = $state('*');
	let scheduleIsActive = $state(true);
	let scheduleOnlyWhenOnline = $state(false);

	// Task Form
	let taskAction = $state<'command' | 'power' | 'backup'>('command');
	let taskPayload = $state('');
	let taskTimeOffset = $state(0);
	let taskContinueOnFailure = $state(false);

	function formatDate(date: string | null | undefined): string {
		if (!date) return 'Nie';
		const d = new Date(date);
		return d.toLocaleString('de-DE', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	function formatCron(schedule: any): string {
		const cron = schedule.attributes?.cron || schedule.cron || {};
		return `${cron.minute || '*'} ${cron.hour || '*'} ${cron.day_of_month || '*'} ${cron.month || '*'} ${cron.day_of_week || '*'}`;
	}

	async function loadSchedules() {
		loading = true;
		try {
			const response = await fetch(`/api/gameserver/${data.server.id}/schedules`);
			if (response.ok) {
				const result = await response.json();
				schedules = result.schedules || [];
			}
		} catch (error) {
			console.error('Fehler beim Laden der Schedules:', error);
		} finally {
			loading = false;
		}
	}

	async function loadScheduleTasks(scheduleId: number) {
		try {
			const response = await fetch(`/api/gameserver/${data.server.id}/schedules/${scheduleId}/tasks`);
			if (response.ok) {
				const result = await response.json();
				currentScheduleTasks = result.tasks || [];
			}
		} catch (error) {
			console.error('Fehler beim Laden der Tasks:', error);
			currentScheduleTasks = [];
		}
	}

	async function createSchedule() {
		if (creatingSchedule) return;

		if (!scheduleName.trim()) {
			alert('Bitte gib einen Schedule-Namen ein');
			return;
		}

		creatingSchedule = true;
		try {
			const response = await fetch(`/api/gameserver/${data.server.id}/schedules`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					name: scheduleName.trim(),
					minute: scheduleMinute.trim(),
					hour: scheduleHour.trim(),
					day_of_month: scheduleDayOfMonth.trim(),
					month: scheduleMonth.trim(),
					day_of_week: scheduleDayOfWeek.trim(),
					is_active: scheduleIsActive,
					only_when_online: scheduleOnlyWhenOnline
				})
			});

			if (!response.ok) {
				let errorMessage = 'Fehler beim Erstellen des Schedules';
				try {
					const error = await response.json();
					errorMessage = error.error || error.message || errorMessage;
				} catch {
					errorMessage = `Fehler ${response.status}: ${response.statusText}`;
				}
				alert(errorMessage);
				return;
			}

			showCreateDialog = false;
			resetScheduleForm();
			await invalidateAll();
			await loadSchedules();
			alert('Schedule erfolgreich erstellt');
		} catch (error) {
			console.error('Fehler beim Erstellen:', error);
			alert('Fehler beim Erstellen des Schedules');
		} finally {
			creatingSchedule = false;
		}
	}

	function resetScheduleForm() {
		scheduleName = '';
		scheduleMinute = '0';
		scheduleHour = '*';
		scheduleDayOfMonth = '*';
		scheduleMonth = '*';
		scheduleDayOfWeek = '*';
		scheduleIsActive = true;
		scheduleOnlyWhenOnline = false;
	}

	function openEditSchedule(schedule: any) {
		const attrs = schedule.attributes || schedule;
		editingScheduleId = attrs.id;
		scheduleName = attrs.name;
		scheduleMinute = attrs.cron?.minute || '0';
		scheduleHour = attrs.cron?.hour || '*';
		scheduleDayOfMonth = attrs.cron?.day_of_month || '*';
		scheduleMonth = attrs.cron?.month || '*';
		scheduleDayOfWeek = attrs.cron?.day_of_week || '*';
		scheduleIsActive = attrs.is_active !== undefined ? attrs.is_active : true;
		scheduleOnlyWhenOnline = attrs.only_when_online || false;
		showEditDialog = true;
	}

	async function updateSchedule() {
		if (!editingScheduleId) return;

		try {
			const response = await fetch(`/api/gameserver/${data.server.id}/schedules/${editingScheduleId}`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					name: scheduleName.trim(),
					minute: scheduleMinute.trim(),
					hour: scheduleHour.trim(),
					day_of_month: scheduleDayOfMonth.trim(),
					month: scheduleMonth.trim(),
					day_of_week: scheduleDayOfWeek.trim(),
					is_active: scheduleIsActive,
					only_when_online: scheduleOnlyWhenOnline
				})
			});

			if (!response.ok) {
				const error = await response.json();
				alert(error.error || 'Fehler beim Aktualisieren des Schedules');
				return;
			}

			showEditDialog = false;
			editingScheduleId = null;
			resetScheduleForm();
			await invalidateAll();
			await loadSchedules();
			alert('Schedule erfolgreich aktualisiert');
		} catch (error) {
			console.error('Fehler beim Aktualisieren:', error);
			alert('Fehler beim Aktualisieren des Schedules');
		}
	}

	async function deleteSchedule(scheduleId: number, scheduleName: string) {
		if (!confirm(`Möchtest du den Schedule "${scheduleName}" wirklich löschen? Alle Tasks werden ebenfalls gelöscht.`)) {
			return;
		}

		try {
			const response = await fetch(`/api/gameserver/${data.server.id}/schedules/${scheduleId}`, {
				method: 'DELETE'
			});

			if (!response.ok) {
				const error = await response.json();
				alert(error.error || 'Fehler beim Löschen des Schedules');
				return;
			}

			await invalidateAll();
			await loadSchedules();
			alert('Schedule erfolgreich gelöscht');
		} catch (error) {
			console.error('Fehler beim Löschen:', error);
			alert('Fehler beim Löschen des Schedules');
		}
	}

	async function executeSchedule(scheduleId: number) {
		try {
			const response = await fetch(`/api/gameserver/${data.server.id}/schedules/${scheduleId}/execute`, {
				method: 'POST'
			});

			if (!response.ok) {
				const error = await response.json();
				alert(error.error || 'Fehler beim Ausführen des Schedules');
				return;
			}

			await invalidateAll();
			await loadSchedules();
			alert('Schedule wird jetzt ausgeführt');
		} catch (error) {
			console.error('Fehler beim Ausführen:', error);
			alert('Fehler beim Ausführen des Schedules');
		}
	}

	async function openTaskDialog(scheduleId: number) {
		editingTaskScheduleId = scheduleId;
		taskAction = 'command';
		taskPayload = '';
		taskTimeOffset = 0;
		taskContinueOnFailure = false;
		showTaskDialog = true;
		await loadScheduleTasks(scheduleId);
	}

	function openTaskEditDialog(scheduleId: number, task: any) {
		const attrs = task.attributes || task;
		editingTaskScheduleId = scheduleId;
		editingTaskId = attrs.id;
		taskAction = attrs.action;
		taskPayload = attrs.payload || '';
		taskTimeOffset = attrs.time_offset || 0;
		taskContinueOnFailure = attrs.continue_on_failure || false;
		showTaskEditDialog = true;
	}

	async function createTask() {
		if (!editingTaskScheduleId) return;

		if (taskAction === 'power' && !['start', 'stop', 'restart', 'kill'].includes(taskPayload.trim())) {
			alert('Ungültige Power-Aktion. Erlaubt: start, stop, restart, kill');
			return;
		}

		try {
			const response = await fetch(`/api/gameserver/${data.server.id}/schedules/${editingTaskScheduleId}/tasks`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					action: taskAction,
					payload: taskPayload.trim(),
					time_offset: taskTimeOffset,
					continue_on_failure: taskContinueOnFailure
				})
			});

			if (!response.ok) {
				const error = await response.json();
				alert(error.error || 'Fehler beim Erstellen des Tasks');
				return;
			}

			const scheduleId = editingTaskScheduleId;
			showTaskDialog = false;
			editingTaskScheduleId = null;
			taskAction = 'command';
			taskPayload = '';
			taskTimeOffset = 0;
			taskContinueOnFailure = false;
			if (scheduleId) {
				await loadScheduleTasks(scheduleId);
			}
			await invalidateAll();
			await loadSchedules();
			alert('Task erfolgreich erstellt');
		} catch (error) {
			console.error('Fehler beim Erstellen:', error);
			alert('Fehler beim Erstellen des Tasks');
		}
	}

	async function updateTask() {
		if (!editingTaskScheduleId || !editingTaskId) return;

		try {
			const response = await fetch(`/api/gameserver/${data.server.id}/schedules/${editingTaskScheduleId}/tasks/${editingTaskId}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					action: taskAction,
					payload: taskPayload.trim(),
					time_offset: taskTimeOffset,
					continue_on_failure: taskContinueOnFailure
				})
			});

			if (!response.ok) {
				const error = await response.json();
				alert(error.error || 'Fehler beim Aktualisieren des Tasks');
				return;
			}

			const scheduleId = editingTaskScheduleId;
			showTaskEditDialog = false;
			editingTaskScheduleId = null;
			editingTaskId = null;
			if (scheduleId) {
				await loadScheduleTasks(scheduleId);
			}
			await invalidateAll();
			await loadSchedules();
			alert('Task erfolgreich aktualisiert');
		} catch (error) {
			console.error('Fehler beim Aktualisieren:', error);
			alert('Fehler beim Aktualisieren des Tasks');
		}
	}

	async function deleteTask(scheduleId: number, taskId: number) {
		if (!confirm('Möchtest du diesen Task wirklich löschen?')) {
			return;
		}

		try {
			const response = await fetch(`/api/gameserver/${data.server.id}/schedules/${scheduleId}/tasks/${taskId}`, {
				method: 'DELETE'
			});

			if (!response.ok) {
				const error = await response.json();
				alert(error.error || 'Fehler beim Löschen des Tasks');
				return;
			}

			await loadScheduleTasks(scheduleId);
			await invalidateAll();
			await loadSchedules();
			alert('Task erfolgreich gelöscht');
		} catch (error) {
			console.error('Fehler beim Löschen:', error);
			alert('Fehler beim Löschen des Tasks');
		}
	}
</script>

<svelte:head>
	<title>Schedules - {data.server.name} | TitanNode Dashboard</title>
</svelte:head>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<div class="flex items-center gap-3">
			<Icon icon="tabler:calendar" class="h-8 w-8 text-primary" />
			<h1 class="text-3xl font-bold">Schedules</h1>
		</div>
		<div class="flex gap-2">
			<Button variant="outline" onclick={() => loadSchedules()} disabled={loading}>
				<Icon icon="tabler:refresh" class="h-4 w-4 mr-2" />
				{loading ? 'Lädt...' : 'Aktualisieren'}
			</Button>
			<Dialog bind:open={showCreateDialog}>
				<DialogTrigger>
					<Button>
						<Icon icon="tabler:plus" class="h-4 w-4 mr-2" />
						Schedule erstellen
					</Button>
				</DialogTrigger>
				<DialogContent class="max-w-2xl max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>Neuen Schedule erstellen</DialogTitle>
						<DialogDescription>
							Erstelle einen neuen automatisierten Schedule für {data.server.name}
						</DialogDescription>
					</DialogHeader>
					<div class="space-y-4">
						<div class="space-y-2">
							<Label for="schedule-name">Schedule-Name</Label>
							<Input
								id="schedule-name"
								bind:value={scheduleName}
								placeholder="z.B. Daily Backup"
							/>
						</div>
						<div class="grid grid-cols-5 gap-2">
							<div class="space-y-2">
								<Label for="schedule-minute">Minute</Label>
								<Input
									id="schedule-minute"
									bind:value={scheduleMinute}
									placeholder="0-59 oder *"
								/>
							</div>
							<div class="space-y-2">
								<Label for="schedule-hour">Stunde</Label>
								<Input
									id="schedule-hour"
									bind:value={scheduleHour}
									placeholder="0-23 oder *"
								/>
							</div>
							<div class="space-y-2">
								<Label for="schedule-day-month">Tag (Monat)</Label>
								<Input
									id="schedule-day-month"
									bind:value={scheduleDayOfMonth}
									placeholder="1-31 oder *"
								/>
							</div>
							<div class="space-y-2">
								<Label for="schedule-month">Monat</Label>
								<Input
									id="schedule-month"
									bind:value={scheduleMonth}
									placeholder="1-12 oder *"
								/>
							</div>
							<div class="space-y-2">
								<Label for="schedule-day-week">Tag (Woche)</Label>
								<Input
									id="schedule-day-week"
									bind:value={scheduleDayOfWeek}
									placeholder="0-6 oder *"
								/>
							</div>
						</div>
						<div class="space-y-2">
							<Label class="flex items-center gap-2">
								<input
									type="checkbox"
									bind:checked={scheduleIsActive}
									class="rounded"
								/>
								<span>Aktiv</span>
							</Label>
							<Label class="flex items-center gap-2">
								<input
									type="checkbox"
									bind:checked={scheduleOnlyWhenOnline}
									class="rounded"
								/>
								<span>Nur wenn Server online</span>
							</Label>
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onclick={() => { showCreateDialog = false; resetScheduleForm(); }}>
							Abbrechen
						</Button>
						<Button onclick={() => createSchedule()} disabled={creatingSchedule}>
							{creatingSchedule ? 'Wird erstellt...' : 'Schedule erstellen'}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	</div>

	<Card class="border-border/50">
		<CardHeader>
			<CardTitle>Schedule-Liste</CardTitle>
			<CardDescription>
				Verwalte deine automatisierten Schedules
			</CardDescription>
		</CardHeader>
		<CardContent>
			{#if schedules.length > 0}
				<div class="space-y-4">
					{#each schedules as schedule}
						{@const attrs = schedule.attributes || schedule}
						{@const tasks = attrs.relationships?.tasks?.data || []}
						<div class="p-4 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors">
							<div class="flex items-start justify-between mb-3">
								<div class="flex-1">
									<div class="flex items-center gap-2 mb-2">
										<h3 class="font-medium text-lg">{attrs.name}</h3>
										{#if attrs.is_active}
											<Badge variant="default">Aktiv</Badge>
										{:else}
											<Badge variant="secondary">Inaktiv</Badge>
										{/if}
										{#if attrs.is_processing}
											<Badge variant="outline">Läuft...</Badge>
										{/if}
									</div>
									<div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground mb-3">
										<div>
											<span class="font-medium">Cron:</span> <span class="font-mono">{formatCron(schedule)}</span>
										</div>
										<div>
											<span class="font-medium">Nächste Ausführung:</span> {formatDate(attrs.next_run_at)}
										</div>
										<div>
											<span class="font-medium">Letzte Ausführung:</span> {formatDate(attrs.last_run_at)}
										</div>
										<div>
											<span class="font-medium">Tasks:</span> {tasks.length}
										</div>
									</div>
									{#if tasks.length > 0}
										<div class="mt-3 space-y-2">
											<p class="text-sm font-medium">Tasks:</p>
											<div class="space-y-1">
												{#each tasks as task}
													{@const taskAttrs = task.attributes || task}
													<div class="flex items-center gap-2 text-sm bg-muted/50 p-2 rounded">
														<Badge variant="outline">{taskAttrs.action}</Badge>
														<span class="text-muted-foreground">{taskAttrs.payload || '(kein Payload)'}</span>
														<span class="text-xs text-muted-foreground ml-auto">+{taskAttrs.time_offset}s</span>
													</div>
												{/each}
											</div>
										</div>
									{/if}
								</div>
								<div class="flex flex-wrap gap-2 mt-3">
									<Button
										variant="outline"
										size="sm"
										onclick={() => openTaskDialog(attrs.id)}
									>
										<Icon icon="tabler:list" class="h-4 w-4 mr-2" />
										Tasks verwalten
									</Button>
									<Button
										variant="outline"
										size="sm"
										onclick={() => executeSchedule(attrs.id)}
										disabled={!attrs.is_active || attrs.is_processing}
									>
										<Icon icon="tabler:play" class="h-4 w-4 mr-2" />
										Jetzt ausführen
									</Button>
									<Button
										variant="outline"
										size="sm"
										onclick={() => openEditSchedule(schedule)}
									>
										<Icon icon="tabler:edit" class="h-4 w-4 mr-2" />
										Bearbeiten
									</Button>
									<Button
										variant="destructive"
										size="sm"
										onclick={() => deleteSchedule(attrs.id, attrs.name)}
									>
										<Icon icon="tabler:trash" class="h-4 w-4 mr-2" />
										Löschen
									</Button>
								</div>
							</div>
						</div>
					{/each}
				</div>
			{:else}
				<div class="text-center py-12">
					<Icon icon="tabler:calendar" class="h-12 w-12 text-muted-foreground mx-auto mb-4" />
					<p class="text-muted-foreground">Noch keine Schedules vorhanden</p>
					<p class="text-sm text-muted-foreground mt-2">
						Erstelle deinen ersten Schedule für {data.server.name}
					</p>
				</div>
			{/if}
		</CardContent>
	</Card>

	<!-- Edit Schedule Dialog -->
	<Dialog bind:open={showEditDialog}>
		<DialogContent class="max-w-2xl max-h-[90vh] overflow-y-auto">
			<DialogHeader>
				<DialogTitle>Schedule bearbeiten</DialogTitle>
				<DialogDescription>
					Bearbeite den Schedule
				</DialogDescription>
			</DialogHeader>
			<div class="space-y-4">
				<div class="space-y-2">
					<Label for="edit-schedule-name">Schedule-Name</Label>
					<Input
						id="edit-schedule-name"
						bind:value={scheduleName}
					/>
				</div>
				<div class="grid grid-cols-5 gap-2">
					<div class="space-y-2">
						<Label for="edit-schedule-minute">Minute</Label>
						<Input
							id="edit-schedule-minute"
							bind:value={scheduleMinute}
						/>
					</div>
					<div class="space-y-2">
						<Label for="edit-schedule-hour">Stunde</Label>
						<Input
							id="edit-schedule-hour"
							bind:value={scheduleHour}
						/>
					</div>
					<div class="space-y-2">
						<Label for="edit-schedule-day-month">Tag (Monat)</Label>
						<Input
							id="edit-schedule-day-month"
							bind:value={scheduleDayOfMonth}
						/>
					</div>
					<div class="space-y-2">
						<Label for="edit-schedule-month">Monat</Label>
						<Input
							id="edit-schedule-month"
							bind:value={scheduleMonth}
						/>
					</div>
					<div class="space-y-2">
						<Label for="edit-schedule-day-week">Tag (Woche)</Label>
						<Input
							id="edit-schedule-day-week"
							bind:value={scheduleDayOfWeek}
						/>
					</div>
				</div>
				<div class="space-y-2">
					<Label class="flex items-center gap-2">
						<input
							type="checkbox"
							bind:checked={scheduleIsActive}
							class="rounded"
						/>
						<span>Aktiv</span>
					</Label>
					<Label class="flex items-center gap-2">
						<input
							type="checkbox"
							bind:checked={scheduleOnlyWhenOnline}
							class="rounded"
						/>
						<span>Nur wenn Server online</span>
					</Label>
				</div>
			</div>
			<DialogFooter>
				<Button variant="outline" onclick={() => { showEditDialog = false; editingScheduleId = null; resetScheduleForm(); }}>
					Abbrechen
				</Button>
				<Button onclick={() => updateSchedule()}>
					Speichern
				</Button>
			</DialogFooter>
		</DialogContent>
	</Dialog>

	<!-- Task Management Dialog -->
	<Dialog bind:open={showTaskDialog}>
		<DialogContent class="max-w-3xl max-h-[90vh] overflow-y-auto">
			<DialogHeader>
				<DialogTitle>Tasks verwalten</DialogTitle>
				<DialogDescription>
					Verwalte die Tasks für diesen Schedule
				</DialogDescription>
			</DialogHeader>
			<div class="space-y-4">
				<div class="space-y-2">
					<Label for="task-action">Aktion</Label>
					<select
						id="task-action"
						bind:value={taskAction}
						class="w-full px-3 py-2 border rounded-md"
					>
						<option value="command">Command</option>
						<option value="power">Power</option>
						<option value="backup">Backup</option>
					</select>
				</div>
				<div class="space-y-2">
					<Label for="task-payload">Payload</Label>
					{#if taskAction === 'command'}
						<Input
							id="task-payload"
							bind:value={taskPayload}
							placeholder="z.B. say Server restarting"
						/>
					{:else if taskAction === 'power'}
						<select
							id="task-payload"
							bind:value={taskPayload}
							class="w-full px-3 py-2 border rounded-md"
						>
							<option value="">Wähle eine Aktion</option>
							<option value="start">Start</option>
							<option value="stop">Stop</option>
							<option value="restart">Restart</option>
							<option value="kill">Kill</option>
						</select>
					{:else}
						<Input
							id="task-payload"
							bind:value={taskPayload}
							placeholder="Backup-Name (optional)"
						/>
					{/if}
				</div>
				<div class="grid grid-cols-2 gap-4">
					<div class="space-y-2">
						<Label for="task-time-offset">Zeit-Offset (Sekunden)</Label>
						<Input
							id="task-time-offset"
							type="number"
							bind:value={taskTimeOffset}
							min="0"
						/>
					</div>
					<div class="space-y-2">
						<Label class="flex items-center gap-2 mt-6">
							<input
								type="checkbox"
								bind:checked={taskContinueOnFailure}
								class="rounded"
							/>
							<span>Bei Fehler fortfahren</span>
						</Label>
					</div>
				</div>
				<div class="mt-4">
					<Button onclick={() => createTask()}>
						<Icon icon="tabler:plus" class="h-4 w-4 mr-2" />
						Task hinzufügen
					</Button>
				</div>
				{#if currentScheduleTasks.length > 0}
					<div class="mt-4 space-y-2">
						<p class="font-medium">Aktuelle Tasks:</p>
						<div class="space-y-2">
							{#each currentScheduleTasks as task}
								{@const taskAttrs = task.attributes || task}
								<div class="flex items-center justify-between p-3 bg-muted/50 rounded">
									<div class="flex items-center gap-2">
										<Badge>{taskAttrs.action}</Badge>
										<span class="text-sm">{taskAttrs.payload || '(kein Payload)'}</span>
										<span class="text-xs text-muted-foreground">+{taskAttrs.time_offset}s</span>
									</div>
									<div class="flex gap-2">
										<Button
											variant="outline"
											size="sm"
											onclick={() => openTaskEditDialog(editingTaskScheduleId || 0, task)}
										>
											<Icon icon="tabler:edit" class="h-4 w-4" />
										</Button>
										<Button
											variant="destructive"
											size="sm"
											onclick={() => deleteTask(editingTaskScheduleId || 0, taskAttrs.id)}
										>
											<Icon icon="tabler:trash" class="h-4 w-4" />
										</Button>
									</div>
								</div>
							{/each}
						</div>
					</div>
				{/if}
			</div>
			<DialogFooter>
				<Button variant="outline" onclick={() => { showTaskDialog = false; editingTaskScheduleId = null; }}>
					Schließen
				</Button>
			</DialogFooter>
		</DialogContent>
	</Dialog>

	<!-- Edit Task Dialog -->
	<Dialog bind:open={showTaskEditDialog}>
		<DialogContent>
			<DialogHeader>
				<DialogTitle>Task bearbeiten</DialogTitle>
				<DialogDescription>
					Bearbeite den Task
				</DialogDescription>
			</DialogHeader>
			<div class="space-y-4">
				<div class="space-y-2">
					<Label for="edit-task-action">Aktion</Label>
					<select
						id="edit-task-action"
						bind:value={taskAction}
						class="w-full px-3 py-2 border rounded-md"
					>
						<option value="command">Command</option>
						<option value="power">Power</option>
						<option value="backup">Backup</option>
					</select>
				</div>
				<div class="space-y-2">
					<Label for="edit-task-payload">Payload</Label>
					{#if taskAction === 'command'}
						<Input
							id="edit-task-payload"
							bind:value={taskPayload}
						/>
					{:else if taskAction === 'power'}
						<select
							id="edit-task-payload"
							bind:value={taskPayload}
							class="w-full px-3 py-2 border rounded-md"
						>
							<option value="start">Start</option>
							<option value="stop">Stop</option>
							<option value="restart">Restart</option>
							<option value="kill">Kill</option>
						</select>
					{:else}
						<Input
							id="edit-task-payload"
							bind:value={taskPayload}
						/>
					{/if}
				</div>
				<div class="grid grid-cols-2 gap-4">
					<div class="space-y-2">
						<Label for="edit-task-time-offset">Zeit-Offset (Sekunden)</Label>
						<Input
							id="edit-task-time-offset"
							type="number"
							bind:value={taskTimeOffset}
							min="0"
						/>
					</div>
					<div class="space-y-2">
						<Label class="flex items-center gap-2 mt-6">
							<input
								type="checkbox"
								bind:checked={taskContinueOnFailure}
								class="rounded"
							/>
							<span>Bei Fehler fortfahren</span>
						</Label>
					</div>
				</div>
			</div>
			<DialogFooter>
				<Button variant="outline" onclick={() => { showTaskEditDialog = false; editingTaskScheduleId = null; editingTaskId = null; }}>
					Abbrechen
				</Button>
				<Button onclick={() => updateTask()}>
					Speichern
				</Button>
			</DialogFooter>
		</DialogContent>
	</Dialog>
</div>

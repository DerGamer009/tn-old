<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Separator } from '$lib/components/ui/separator';
	import Icon from '@iconify/svelte';
	import { language, type Language } from '$lib/stores/language';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	const translations = {
		de: {
			pageTitle: 'Einstellungen',
			pageSubtitle: 'Verwalte dein Konto und Einstellungen',
			avatarTitle: 'Profilbild',
			avatarDescription: 'Lade ein Profilbild hoch oder entferne das aktuelle',
			avatarUpdated: 'Avatar erfolgreich aktualisiert!',
			avatarOnlyImages: 'Nur Bilddateien sind erlaubt',
			avatarTooLarge: 'Datei ist zu groß (max. 5MB)',
			avatarUploadLabelSelected: 'Neue Datei ausgewählt',
			avatarUploadLabel: 'Avatar hochladen',
			avatarHint: 'JPG, PNG oder GIF (max. 5MB)',
			avatarSave: 'Speichern',
			avatarCancel: 'Abbrechen',
			avatarDeleteTitle: 'Möchtest du dein Profilbild wirklich löschen?',
			avatarDelete: 'Löschen',
			avatarDeleteCancel: 'Abbrechen',
			avatarDeleteTooltip: 'Avatar löschen',
			profileTitle: 'Profil-Informationen',
			profileDescription: 'Aktualisiere deine persönlichen Daten',
			firstName: 'Vorname',
			lastName: 'Nachname',
			email: 'E-Mail',
			saveChanges: 'Änderungen speichern',
			languageTitle: 'Sprache / Language',
			languageDescription:
				'Wähle die Sprache für dein Dashboard. Choose the language for your dashboard.',
			languageLabel: 'Sprache / Language',
			languageHint:
				'Ändert die Sprache im gesamten Dashboard, inklusive Navigation und wichtigen Texten.',
			passwordTitle: 'Passwort ändern',
			passwordDescription: 'Aktualisiere dein Passwort',
			currentPassword: 'Aktuelles Passwort',
			newPassword: 'Neues Passwort',
			confirmPassword: 'Passwort bestätigen',
			updatePassword: 'Passwort aktualisieren',
			notificationsTitle: 'Benachrichtigungen',
			notificationsDescription: 'Verwalte deine E-Mail-Benachrichtigungen',
			notificationsServerTitle: 'Server-Status',
			notificationsServerText: 'Benachrichtigungen über Server-Status-Änderungen',
			notificationsInvoicesTitle: 'Rechnungen',
			notificationsInvoicesText: 'E-Mails zu neuen Rechnungen und Zahlungen',
			notificationsTicketsTitle: 'Support-Tickets',
			notificationsTicketsText: 'Updates zu deinen Support-Anfragen',
			enabled: 'Aktiviert',
			twoFaTitle: 'Zwei-Faktor-Authentifizierung (2FA)',
			twoFaDescription: 'Schütze dein Konto mit einem zusätzlichen Sicherheitsfaktor.',
			twoFaStatusEnabled: '2FA ist aktiviert',
			twoFaStatusDisabled: '2FA ist deaktiviert',
			twoFaEnable: '2FA aktivieren',
			twoFaDisable: '2FA deaktivieren',
			twoFaHint:
				'Nutze eine Authenticator-App (z.B. Authy, Google Authenticator), um Anmeldecodes zu generieren.',
			backupCodesTitle: 'Backup-Codes',
			backupCodesDescription:
				'Nutze diese Codes, falls du keinen Zugriff mehr auf deinen zweiten Faktor hast.',
			backupCodesGenerate: 'Backup-Codes erzeugen',
			backupCodesRegenerate: 'Backup-Codes neu erzeugen',
			backupCodesDownload: 'Codes als Datei herunterladen',
			backupCodesInfo:
				'Bewahre diese Codes sicher auf. Jeder Code kann nur einmal verwendet werden.',
			dangerTitle: 'Gefahrenzone',
			dangerDescription: 'Irreversible Aktionen',
			deleteAccount: 'Konto löschen',
			deleteAccountText: 'Lösche dein Konto und alle deine Daten permanent'
		},
		en: {
			pageTitle: 'Settings',
			pageSubtitle: 'Manage your account and preferences',
			avatarTitle: 'Profile picture',
			avatarDescription: 'Upload a profile picture or remove the current one',
			avatarUpdated: 'Avatar updated successfully!',
			avatarOnlyImages: 'Only image files are allowed',
			avatarTooLarge: 'File is too large (max. 5MB)',
			avatarUploadLabelSelected: 'New file selected',
			avatarUploadLabel: 'Upload avatar',
			avatarHint: 'JPG, PNG or GIF (max. 5MB)',
			avatarSave: 'Save',
			avatarCancel: 'Cancel',
			avatarDeleteTitle: 'Do you really want to delete your profile picture?',
			avatarDelete: 'Delete',
			avatarDeleteCancel: 'Cancel',
			avatarDeleteTooltip: 'Delete avatar',
			profileTitle: 'Profile information',
			profileDescription: 'Update your personal data',
			firstName: 'First name',
			lastName: 'Last name',
			email: 'Email',
			saveChanges: 'Save changes',
			languageTitle: 'Language',
			languageDescription: 'Choose the language for your dashboard.',
			languageLabel: 'Language',
			languageHint:
				'Changes the language across the entire dashboard, including navigation and key texts.',
			passwordTitle: 'Change password',
			passwordDescription: 'Update your password',
			currentPassword: 'Current password',
			newPassword: 'New password',
			confirmPassword: 'Confirm password',
			updatePassword: 'Update password',
			notificationsTitle: 'Notifications',
			notificationsDescription: 'Manage your email notifications',
			notificationsServerTitle: 'Server status',
			notificationsServerText: 'Notifications about server status changes',
			notificationsInvoicesTitle: 'Invoices',
			notificationsInvoicesText: 'Emails about new invoices and payments',
			notificationsTicketsTitle: 'Support tickets',
			notificationsTicketsText: 'Updates on your support requests',
			enabled: 'Enabled',
			twoFaTitle: 'Two-factor authentication (2FA)',
			twoFaDescription: 'Protect your account with an additional security factor.',
			twoFaStatusEnabled: '2FA is enabled',
			twoFaStatusDisabled: '2FA is disabled',
			twoFaEnable: 'Enable 2FA',
			twoFaDisable: 'Disable 2FA',
			twoFaHint:
				'Use an authenticator app (e.g. Authy, Google Authenticator) to generate login codes.',
			backupCodesTitle: 'Backup codes',
			backupCodesDescription:
				'Use these codes if you lose access to your second factor.',
			backupCodesGenerate: 'Generate backup codes',
			backupCodesRegenerate: 'Regenerate backup codes',
			backupCodesDownload: 'Download codes as file',
			backupCodesInfo:
				'Store these codes in a safe place. Each code can only be used once.',
			dangerTitle: 'Danger zone',
			dangerDescription: 'Irreversible actions',
			deleteAccount: 'Delete account',
			deleteAccountText: 'Permanently delete your account and all of your data'
		}
	} satisfies Record<Language, Record<string, string>>;

	type TKey = keyof (typeof translations)['de'];

	function t(key: TKey): string {
		const lang = $language as Language;
		const dict = translations[lang] ?? translations.de;
		return dict[key] ?? translations.de[key];
	}

	let avatarFile = $state<File | null>(null);
	let avatarPreview = $state<string | null>(null);
	let isUploading = $state(false);
	let showDeleteConfirm = $state(false);
	let twoFactorEnabled = $state(false);
	let generatedBackupCodes = $state<string[]>([]);
	let showTwoFaDialog = $state(false);
	let twoFaStep = $state<1 | 2 | 3>(1);
	let otpauthUrl = $state<string | null>(null);
	let twoFaError = $state<string | null>(null);

	$effect(() => {
		twoFactorEnabled = !!data.user?.twoFactorEnabled;
	});

	function getInitials(firstName: string, lastName: string) {
		return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
	}

	function handleFileSelect(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		
		if (file) {
			if (!file.type.startsWith('image/')) {
				alert(t('avatarOnlyImages'));
				return;
			}

			if (file.size > 5 * 1024 * 1024) {
				alert(t('avatarTooLarge'));
				return;
			}

			avatarFile = file;
			
			// Preview erstellen
			const reader = new FileReader();
			reader.onload = (e) => {
				avatarPreview = e.target?.result as string;
			};
			reader.readAsDataURL(file);
		}
	}

	function handleDeleteAvatar() {
		showDeleteConfirm = true;
	}
</script>

<svelte:head>
	<title>{t('pageTitle')} - Dashboard | TitanNode</title>
</svelte:head>

<div class="max-w-screen-2xl space-y-6">
	<!-- Header -->
	<Card class="border-border/60 bg-gradient-to-r from-primary/10 via-background to-primary/5">
		<CardContent class="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
			<div>
				<div class="flex items-center gap-3">
					<div class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15">
						<Icon icon="tabler:settings" class="h-5 w-5 text-primary" />
					</div>
					<h1 class="text-2xl sm:text-3xl font-bold tracking-tight">
						{t('pageTitle')}
					</h1>
				</div>
				<p class="mt-2 text-sm sm:text-base text-muted-foreground">
					{t('pageSubtitle')}
				</p>
			</div>
			<div class="flex flex-col items-stretch gap-2 sm:items-end">
				<p class="text-xs text-muted-foreground">
					{data.user?.email}
				</p>
			</div>
		</CardContent>
	</Card>

	<!-- Avatar Upload -->
	<Card class="border-border/50">
		<CardHeader>
			<CardTitle>{t('avatarTitle')}</CardTitle>
			<CardDescription>{t('avatarDescription')}</CardDescription>
		</CardHeader>
		<CardContent class="space-y-4">
			{#if form?.error}
				<div class="rounded-lg border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-700 dark:text-red-400">
					<div class="flex items-center gap-2">
						<Icon icon="tabler:alert-circle" class="h-4 w-4" />
						<span>{form.error}</span>
					</div>
				</div>
			{/if}

			{#if form?.success}
				<div class="rounded-lg border border-green-500/50 bg-green-500/10 p-3 text-sm text-green-700 dark:text-green-400">
					<div class="flex items-center gap-2">
						<Icon icon="tabler:check" class="h-4 w-4" />
						<span>{t('avatarUpdated')}</span>
					</div>
				</div>
			{/if}

			<div class="flex items-center gap-6">
				<!-- Avatar Display -->
				<div class="relative">
					<div class="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-primary to-primary/60 text-2xl font-bold text-primary-foreground ring-4 ring-border">
						{#if avatarPreview || data.user?.image}
							<img
								src={avatarPreview || data.user?.image || ''}
								alt={`${data.user?.firstName || ''} ${data.user?.lastName || ''}`}
								class="h-full w-full object-cover"
							/>
						{:else if data.user?.firstName && data.user?.lastName}
							{getInitials(data.user.firstName, data.user.lastName)}
						{/if}
					</div>
					{#if data.user?.image && !avatarPreview}
						<div class="absolute -bottom-2 -right-2 rounded-full bg-destructive p-1.5">
							<button
								type="button"
								onclick={handleDeleteAvatar}
								class="flex items-center justify-center rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
								title="Avatar löschen"
							>
								<Icon icon="tabler:trash" class="h-4 w-4" />
							</button>
						</div>
					{/if}
				</div>

				<!-- Upload Controls -->
				<div class="flex-1 space-y-2">
					<Label for="avatar" class="cursor-pointer">
						<div class="flex items-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background hover:bg-accent hover:text-accent-foreground">
							<Icon icon="tabler:upload" class="h-4 w-4" />
							{avatarFile ? t('avatarUploadLabelSelected') : t('avatarUploadLabel')}
						</div>
					</Label>
					<input
						id="avatar"
						name="avatar"
						type="file"
						accept="image/*"
						class="hidden"
						onchange={handleFileSelect}
					/>
					<p class="text-xs text-muted-foreground">
						{t('avatarHint')}
					</p>

					{#if avatarFile}
						<form
							method="POST"
							action="?/uploadAvatar"
							enctype="multipart/form-data"
							use:enhance={({ formData }) => {
								if (avatarFile) {
									formData.set('avatar', avatarFile);
								}
								isUploading = true;
								return async ({ update }) => {
									await update();
									isUploading = false;
									if (form?.success) {
										avatarFile = null;
										avatarPreview = null;
									}
								};
							}}
						>
							<div class="flex gap-2">
								<Button type="submit" disabled={isUploading} size="sm">
									{#if isUploading}
										<Icon icon="tabler:loader-2" class="mr-2 h-4 w-4 animate-spin" />
										Upload...
									{:else}
										<Icon icon="tabler:check" class="mr-2 h-4 w-4" />
										{t('avatarSave')}
									{/if}
								</Button>
								<Button
									type="button"
									variant="outline"
									size="sm"
									onclick={() => {
										avatarFile = null;
										avatarPreview = null;
									}}
								>
									{t('avatarCancel')}
								</Button>
							</div>
						</form>
					{/if}
				</div>
			</div>

			<!-- Delete Confirmation Dialog -->
			{#if showDeleteConfirm}
				<div class="rounded-lg border border-red-500/50 bg-red-500/10 p-4">
					<p class="mb-3 text-sm font-medium text-red-700 dark:text-red-400">
						{t('avatarDeleteTitle')}
					</p>
					<form
						method="POST"
						action="?/deleteAvatar"
						use:enhance={() => {
							return async ({ update }) => {
								await update();
								showDeleteConfirm = false;
								if (form?.success) {
									avatarPreview = null;
								}
							};
						}}
						class="flex gap-2"
					>
						<Button type="submit" variant="destructive" size="sm">
							{t('avatarDelete')}
						</Button>
						<Button
							type="button"
							variant="outline"
							size="sm"
							onclick={() => (showDeleteConfirm = false)}
						>
							{t('avatarDeleteCancel')}
						</Button>
					</form>
				</div>
			{/if}
		</CardContent>
	</Card>

	<!-- Profile & Security Grid -->
	<div class="grid gap-6 md:grid-cols-2">
		<!-- Profile Settings -->
		<Card class="border-border/50">
		<CardHeader>
			<CardTitle>{t('profileTitle')}</CardTitle>
			<CardDescription>{t('profileDescription')}</CardDescription>
		</CardHeader>
		<CardContent class="space-y-4">
			<div class="grid gap-4 sm:grid-cols-2">
				<div class="space-y-2">
					<Label for="firstName">{t('firstName')}</Label>
					<Input id="firstName" value={data.user?.firstName || ''} />
				</div>
				<div class="space-y-2">
					<Label for="lastName">{t('lastName')}</Label>
					<Input id="lastName" value={data.user?.lastName || ''} />
				</div>
			</div>
			<div class="space-y-2">
				<Label for="email">{t('email')}</Label>
				<Input id="email" type="email" value={data.user?.email || ''} />
			</div>
			<Button>{t('saveChanges')}</Button>
		</CardContent>
	</Card>

		<!-- 2FA Settings -->
		<Card class="border-border/50">
			<CardHeader>
				<CardTitle class="flex items-center gap-2">
					<Icon icon="tabler:shield-lock" class="h-5 w-5 text-primary" />
					{t('twoFaTitle')}
				</CardTitle>
				<CardDescription>{t('twoFaDescription')}</CardDescription>
			</CardHeader>
			<CardContent class="space-y-4">
				<div class="flex items-center justify-between">
					<div class="space-y-1">
						<p class="text-sm font-medium">
							{twoFactorEnabled ? t('twoFaStatusEnabled') : t('twoFaStatusDisabled')}
						</p>
						<p class="text-xs text-muted-foreground">
							{t('twoFaHint')}
						</p>
					</div>
					{#if twoFactorEnabled}
						<form
							method="POST"
							action="?/disableTwoFactor"
							use:enhance={() => {
								return async ({ update }) => {
									await update();
									twoFactorEnabled = false;
									generatedBackupCodes = [];
								};
							}}
						>
							<Button variant="outline" size="sm">
								<Icon icon="tabler:shield-x" class="h-4 w-4 mr-2" />
								{t('twoFaDisable')}
							</Button>
						</form>
					{:else}
						<form
							method="POST"
							action="?/beginTwoFactorSetup"
							use:enhance={() => {
								return async ({ update, result }) => {
									await update();
									if (result.type === 'success' && 'otpauthUrl' in (result.data as any)) {
										otpauthUrl = (result.data as any).otpauthUrl as string;
										generatedBackupCodes = [];
										twoFaStep = 1;
										twoFaError = null;
										showTwoFaDialog = true;
									}
								};
							}}
						>
							<Button type="submit" size="sm">
								<Icon icon="tabler:shield-check" class="h-4 w-4 mr-2" />
								{t('twoFaEnable')}
							</Button>
						</form>
					{/if}
				</div>

				<!-- Backup Codes Anzeige -->
				{#if twoFactorEnabled}
					<div class="mt-4 space-y-3 rounded-md border border-dashed border-border/60 bg-muted/40 p-3">
						<div class="flex items-center justify-between gap-2">
							<div>
								<p class="text-sm font-medium">{t('backupCodesTitle')}</p>
								<p class="text-xs text-muted-foreground">
									{t('backupCodesDescription')}
								</p>
							</div>
							<form
								method="POST"
								action="?/regenerateBackupCodes"
								use:enhance={() => {
									return async ({ update, result }) => {
										await update();
										if (result.type === 'success' && 'backupCodes' in (result.data as any)) {
											generatedBackupCodes = ((result.data as any)
												.backupCodes || []) as string[];
										}
									};
								}}
							>
								<Button variant="outline" size="sm">
									<Icon icon="tabler:refresh" class="h-4 w-4 mr-2" />
									{t('backupCodesRegenerate')}
								</Button>
							</form>
						</div>

						{#if generatedBackupCodes.length > 0}
							<div class="grid gap-2 rounded-md bg-background/60 p-2 text-xs font-mono">
								{#each generatedBackupCodes as code}
									<div class="flex items-center justify-between rounded px-2 py-1">
										<span>{code}</span>
									</div>
								{/each}
							</div>
							<div class="flex items-center justify-between gap-2">
								<p class="text-xs text-muted-foreground">
									{t('backupCodesInfo')}
								</p>
								<Button
									type="button"
									variant="ghost"
									size="sm"
									onclick={() => {
										const content = generatedBackupCodes.join('\n');
										const blob = new Blob([content], { type: 'text/plain' });
										const url = URL.createObjectURL(blob);
										const a = document.createElement('a');
										a.href = url;
										a.download = 'titan-node-backup-codes.txt';
										a.click();
										URL.revokeObjectURL(url);
									}}
								>
									<Icon icon="tabler:download" class="h-4 w-4 mr-2" />
									{t('backupCodesDownload')}
								</Button>
							</div>
						{/if}
					</div>
				{/if}
			</CardContent>
		</Card>
	</div>

	<!-- 2FA Setup Dialog (Wizard) -->
	{#if showTwoFaDialog}
		<div class="fixed inset-0 z-40 flex items-center justify-center bg-background/80 backdrop-blur-sm">
			<div class="w-full max-w-lg rounded-xl border border-border/60 bg-card shadow-xl">
				<div class="flex items-center justify-between border-b border-border/60 px-5 py-3">
					<div class="flex items-center gap-2">
						<Icon icon="tabler:shield-lock" class="h-5 w-5 text-primary" />
						<p class="text-sm font-medium">{t('twoFaTitle')}</p>
					</div>
					<button
						type="button"
						class="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
						onclick={() => {
							showTwoFaDialog = false;
							twoFaStep = 1;
							twoFaError = null;
							generatedBackupCodes = [];
						}}
					>
						<Icon icon="tabler:x" class="h-4 w-4" />
					</button>
				</div>

				<div class="px-5 py-4 space-y-4">
					{#if twoFaError}
						<div class="rounded-md border border-red-500/50 bg-red-500/10 px-3 py-2 text-xs text-red-700 dark:text-red-400">
							{twoFaError}
						</div>
					{/if}

					{#if twoFaStep === 1}
						<div class="space-y-4">
							<p class="text-sm text-muted-foreground">
								Scanne den QR-Code mit deiner bevorzugten Authenticator-App (z.B. Google Authenticator, Authy).
							</p>
							{#if otpauthUrl}
								<div class="flex justify-center">
									<img
										src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
											otpauthUrl
										)}`}
										alt="2FA QR Code"
										class="rounded-md border border-border/60 bg-background p-2"
									/>
								</div>
							{/if}
							<div class="flex justify-end pt-2">
								<Button type="button" onclick={() => { twoFaStep = 2; twoFaError = null; }}>
									Weiter
								</Button>
							</div>
						</div>
					{:else if twoFaStep === 2}
						<div class="space-y-4">
							<p class="text-sm text-muted-foreground">
								Gib nun den 6-stelligen Code ein, der dir in deiner Authenticator-App angezeigt wird.
							</p>
							<form
								method="POST"
								action="?/confirmTwoFactor"
								use:enhance={({ formData }) => {
									return async ({ update, result }) => {
										await update();
										if (result.type === 'failure') {
											twoFaError = (result.data as any)?.error ?? 'Ungültiger Code.';
											return;
										}
										if (result.type === 'success' && 'backupCodes' in (result.data as any)) {
											generatedBackupCodes = ((result.data as any)
												.backupCodes || []) as string[];
											twoFactorEnabled = true;
											twoFaStep = 3;
											twoFaError = null;
										}
									};
								}}
							>
								<div class="space-y-2">
									<Label for="otp">Code aus der App</Label>
									<Input
										id="otp"
										name="code"
										inputmode="numeric"
										placeholder="123456"
										required
									/>
								</div>
								<div class="mt-4 flex justify-between gap-2">
									<Button type="button" variant="outline" onclick={() => { twoFaStep = 1; twoFaError = null; }}>
										Zurück
									</Button>
									<Button type="submit">
										Weiter
									</Button>
								</div>
							</form>
						</div>
					{:else if twoFaStep === 3}
						<div class="space-y-4">
							<p class="text-sm text-muted-foreground">
								Hier sind deine Backup-Codes. Bewahre sie an einem sicheren Ort auf. Jeder Code kann nur einmal verwendet werden.
							</p>
							{#if generatedBackupCodes.length > 0}
								<div class="grid gap-2 rounded-md bg-background/60 p-2 text-xs font-mono">
									{#each generatedBackupCodes as code}
										<div class="flex items-center justify-between rounded px-2 py-1">
											<span>{code}</span>
										</div>
									{/each}
								</div>
								<div class="flex items-center justify-between gap-2">
									<Button
										type="button"
										variant="outline"
										size="sm"
										onclick={() => {
											const content = generatedBackupCodes.join('\n');
											const blob = new Blob([content], { type: 'text/plain' });
											const url = URL.createObjectURL(blob);
											const a = document.createElement('a');
											a.href = url;
											a.download = 'titan-node-backup-codes.txt';
											a.click();
											URL.revokeObjectURL(url);
										}}
									>
										<Icon icon="tabler:download" class="h-4 w-4 mr-2" />
										{t('backupCodesDownload')}
									</Button>
									<Button
										type="button"
										onclick={() => {
											showTwoFaDialog = false;
											twoFaStep = 1;
											twoFaError = null;
										}}
									>
										Fertig
									</Button>
								</div>
							{/if}
						</div>
					{/if}
				</div>
			</div>
		</div>
	{/if}

	<!-- Language Settings -->
	<Card class="border-border/50">
		<CardHeader>
			<CardTitle>{t('languageTitle')}</CardTitle>
			<CardDescription>
				{t('languageDescription')}
			</CardDescription>
		</CardHeader>
		<CardContent class="space-y-4">
			<div class="space-y-2">
				<Label for="language">{t('languageLabel')}</Label>
				<select
					id="language"
					class="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
					bind:value={$language}
				>
					<option value="de">Deutsch</option>
					<option value="en">English</option>
				</select>
				<p class="text-xs text-muted-foreground">
					{t('languageHint')}
				</p>
			</div>
		</CardContent>
	</Card>

	<!-- Password Settings -->
	<Card class="mb-6 border-border/50">
		<CardHeader>
			<CardTitle>{t('passwordTitle')}</CardTitle>
			<CardDescription>{t('passwordDescription')}</CardDescription>
		</CardHeader>
		<CardContent class="space-y-4">
			<div class="space-y-2">
				<Label for="currentPassword">{t('currentPassword')}</Label>
				<Input id="currentPassword" type="password" />
			</div>
			<div class="space-y-2">
				<Label for="newPassword">{t('newPassword')}</Label>
				<Input id="newPassword" type="password" />
			</div>
			<div class="space-y-2">
				<Label for="confirmPassword">{t('confirmPassword')}</Label>
				<Input id="confirmPassword" type="password" />
			</div>
			<Button>{t('updatePassword')}</Button>
		</CardContent>
	</Card>

	<!-- Notification Settings -->
	<Card class="mb-6 border-border/50">
		<CardHeader>
			<CardTitle>{t('notificationsTitle')}</CardTitle>
			<CardDescription>{t('notificationsDescription')}</CardDescription>
		</CardHeader>
		<CardContent class="space-y-4">
			<div class="flex items-center justify-between">
				<div>
					<p class="font-medium">{t('notificationsServerTitle')}</p>
					<p class="text-sm text-muted-foreground">{t('notificationsServerText')}</p>
				</div>
				<Button variant="outline" size="sm">{t('enabled')}</Button>
			</div>
			<Separator />
			<div class="flex items-center justify-between">
				<div>
					<p class="font-medium">{t('notificationsInvoicesTitle')}</p>
					<p class="text-sm text-muted-foreground">{t('notificationsInvoicesText')}</p>
				</div>
				<Button variant="outline" size="sm">{t('enabled')}</Button>
			</div>
			<Separator />
			<div class="flex items-center justify-between">
				<div>
					<p class="font-medium">{t('notificationsTicketsTitle')}</p>
					<p class="text-sm text-muted-foreground">{t('notificationsTicketsText')}</p>
				</div>
				<Button variant="outline" size="sm">{t('enabled')}</Button>
			</div>
		</CardContent>
	</Card>

	<!-- Danger Zone -->
	<Card class="border-red-500/50">
		<CardHeader>
			<CardTitle class="text-red-600">{t('dangerTitle')}</CardTitle>
			<CardDescription>{t('dangerDescription')}</CardDescription>
		</CardHeader>
		<CardContent>
			<div class="flex items-center justify-between">
				<div>
					<p class="font-medium">{t('deleteAccount')}</p>
					<p class="text-sm text-muted-foreground">{t('deleteAccountText')}</p>
				</div>
				<Button variant="destructive">{t('deleteAccount')}</Button>
			</div>
		</CardContent>
	</Card>
</div>


<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import Icon from '@iconify/svelte';
</script>

<svelte:head>
	<title>Zahlung abgebrochen - TitanNode</title>
</svelte:head>

<div class="max-w-2xl mx-auto space-y-6">
	<Card class="border-yellow-500/50 bg-yellow-500/10">
		<CardContent class="pt-6">
			<div class="flex flex-col items-center text-center space-y-4">
				<div class="flex h-16 w-16 items-center justify-center rounded-full bg-yellow-500/20">
					<Icon icon="tabler:alert-circle" class="h-10 w-10 text-yellow-600 dark:text-yellow-400" />
				</div>
				<div>
					<h1 class="text-2xl font-bold">Zahlung abgebrochen</h1>
					<p class="text-muted-foreground mt-2">
						Die Zahlung wurde abgebrochen. Dein Guthaben wurde nicht aufgeladen.
					</p>
				</div>
			</div>
		</CardContent>
	</Card>

	<div class="flex gap-4">
		<Button href="/dashboard/credits" variant="outline" class="flex-1 touch-manipulation">
			Erneut versuchen
		</Button>
		<Button href="/dashboard" class="flex-1 touch-manipulation">
			Zum Dashboard
		</Button>
	</div>
</div>


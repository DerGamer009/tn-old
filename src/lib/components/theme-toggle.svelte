<script lang="ts">
	import {
		DropdownMenu,
		DropdownMenuContent,
		DropdownMenuItem,
		DropdownMenuTrigger
	} from '$lib/components/ui/dropdown-menu';
	import { Sun, Moon, Monitor } from '@lucide/svelte';
	import { themeStore } from '$lib/stores/theme.svelte';
	import { browser } from '$app/environment';

	function setTheme(theme: 'light' | 'dark' | 'system') {
		if (theme === 'system' && browser) {
			const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
			themeStore.set(prefersDark ? 'dark' : 'light');
		} else if (theme !== 'system') {
			themeStore.set(theme);
		}
	}
</script>

<DropdownMenu>
	<DropdownMenuTrigger
		class="size-9 inline-flex shrink-0 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
	>
		<Sun class="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
		<Moon
			class="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
		/>
		<span class="sr-only">Theme wechseln</span>
	</DropdownMenuTrigger>
	<DropdownMenuContent align="end">
		<DropdownMenuItem onclick={() => setTheme('light')}>
			<Sun class="mr-2 h-4 w-4" />
			<span>Hell</span>
		</DropdownMenuItem>
		<DropdownMenuItem onclick={() => setTheme('dark')}>
			<Moon class="mr-2 h-4 w-4" />
			<span>Dunkel</span>
		</DropdownMenuItem>
		<DropdownMenuItem onclick={() => setTheme('system')}>
			<Monitor class="mr-2 h-4 w-4" />
			<span>System</span>
		</DropdownMenuItem>
	</DropdownMenuContent>
</DropdownMenu>


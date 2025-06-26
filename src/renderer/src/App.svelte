<script>
  import Router from 'svelte-spa-router'
  import routes from './routes'
  import { onMount } from 'svelte'

  let isDark = false
  let appTitle = "My Electron App"
  let platform = window.electron?.platform || 'win32' // Default to win32 if not in Electron

  onMount(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    isDark = mediaQuery.matches
    updateTheme(isDark)

    const handleSystemThemeChange = (e) => {
      isDark = e.matches
      updateTheme(isDark)
    }
    mediaQuery.addEventListener('change', handleSystemThemeChange)

    if (window.electron) {
      window.electron.onThemeUpdated((electronIsDark) => {
        isDark = electronIsDark
        updateTheme(isDark)
      })
    }

    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange)
      if (window.electron) window.electron.removeThemeListener()
    }
  })

  function updateTheme(dark) {
    if (dark) {
      document.documentElement.classList.add('dark')
      document.documentElement.style.colorScheme = 'dark'
    } else {
      document.documentElement.classList.remove('dark')
      document.documentElement.style.colorScheme = 'light'
    }
  }

  function toggleTheme() {
    isDark = !isDark
    updateTheme(isDark)
    if (window.electron?.setTheme) {
      window.electron.setTheme(isDark ? 'dark' : 'light')
    }
  }
</script>

<main class="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200 relative">
  <div class="flex flex-col min-h-screen">
    <!-- Integrated Title Bar -->
    <div class="integrated-title-bar absolute top-0 left-0 right-0 h-8 flex items-center px-4 select-none drag-region z-50 {platform === 'darwin' ? 'pl-20' : ''}">
      <div class="flex items-center space-x-2 no-drag">
        <button
          on:click={toggleTheme}
          class="p-1 rounded-md hover:bg-black/10 dark:hover:bg-white/10 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 backdrop-blur-sm"
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {#if isDark}
            <svg class="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd" />
            </svg>
          {:else}
            <svg class="w-4 h-4 text-slate-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
            </svg>
          {/if}
        </button>
        <div class="w-4 h-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-sm flex-shrink-0"></div>
        <span class="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
          {appTitle}
        </span>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col items-center justify-center p-4 pt-12">
      <Router {routes} />
    </div>
  </div>
</main>

<style>
  :global(html) {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
  }

  .integrated-title-bar {
    -webkit-app-region: drag;
    background: rgba(248, 250, 252, 0.8);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
  }

  :global(.dark) .integrated-title-bar {
    background: rgba(15, 23, 42, 0.8);
  }

  .drag-region {
    -webkit-app-region: drag;
  }

  .no-drag {
    -webkit-app-region: no-drag;
  }

  :global(*::-webkit-scrollbar) {
    width: 8px;
    height: 8px;
  }

  :global(*::-webkit-scrollbar-track) {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 4px;
  }

  :global(.dark *::-webkit-scrollbar-track) {
    background: rgba(255, 255, 255, 0.1);
  }

  :global(*::-webkit-scrollbar-thumb) {
    background: rgba(0, 0, 0, 0.3);
    border-radius: 4px;
  }

  :global(.dark *::-webkit-scrollbar-thumb) {
    background: rgba(255, 255, 255, 0.3);
  }

  :global(*::-webkit-scrollbar-thumb:hover) {
    background: rgba(0, 0, 0, 0.5);
  }

  :global(.dark *::-webkit-scrollbar-thumb:hover) {
    background: rgba(255, 255, 255, 0.5);
  }

  :global(*:focus-visible) {
    outline: 2px solid theme('colors.blue.500');
    outline-offset: 2px;
  }

  :global(.dark *:focus-visible) {
    outline: 2px solid theme('colors.blue.400');
  }
</style>
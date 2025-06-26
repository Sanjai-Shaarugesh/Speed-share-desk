<script lang="ts">
  import { onMount } from 'svelte'
  import { themeStore } from '../stores/theme'
  
  let isDark = $state(false)
  let platform = $state<NodeJS.Platform>('win32')
  
  onMount(() => {
    if (window.electron) {
      platform = window.electron.platform
      
      // Get initial theme
      window.electron.getTheme().then(({ shouldUseDarkColors }) => {
        isDark = shouldUseDarkColors
      })
      
      // Listen for theme changes
      window.electron.onThemeUpdated((darkMode) => {
        isDark = darkMode
      })
    }
    
    return () => {
      if (window.electron) {
        window.electron.removeThemeListener()
      }
    }
  })
  
  function minimize() {
    window.electron?.minimizeWindow()
  }
  
  function maximize() {
    window.electron?.maximizeWindow()
  }
  
  function close() {
    window.electron?.closeWindow()
  }
  
  // Different styles for different platforms
  $: titleBarClass = platform === 'darwin' 
    ? 'pl-20' // macOS - leave space for traffic lights
    : platform === 'win32' 
    ? 'pl-4' // Windows
    : 'pl-4' // Linux
</script>

{#if platform !== 'darwin'}
<!-- Custom title bar for Windows and Linux -->
<div 
  class="flex items-center justify-between h-8 select-none drag-region {isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} border-b"
  style="app-region: drag;"
>
  <div class="flex items-center {titleBarClass}">
    <div class="flex items-center space-x-2">
      <svg class="w-4 h-4 {isDark ? 'text-blue-400' : 'text-blue-600'}" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
      </svg>
      <span class="text-sm font-medium {isDark ? 'text-gray-100' : 'text-gray-900'}">
        Your App Name
      </span>
    </div>
  </div>
  
  <div class="flex items-center no-drag">
    <!-- Minimize button -->
    <button
      onclick={minimize}
      class="flex items-center justify-center w-12 h-8 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      title="Minimize"
    >
      <svg class="w-3 h-3 {isDark ? 'text-gray-300' : 'text-gray-700'}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
      </svg>
    </button>
    
    <!-- Maximize button -->
    <button
      onclick={maximize}
      class="flex items-center justify-center w-12 h-8 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      title="Maximize"
    >
      <svg class="w-3 h-3 {isDark ? 'text-gray-300' : 'text-gray-700'}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V6a2 2 0 012-2h2M4 16v2a2 2 0 002 2h2M16 4h2a2 2 0 012 2v2M16 20h2a2 2 0 002-2v-2" />
      </svg>
    </button>
    
    <!-- Close button -->
    <button
      onclick={close}
      class="flex items-center justify-center w-12 h-8 hover:bg-red-500 hover:text-white transition-colors"
      title="Close"
    >
      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </div>
</div>
{:else}
<!-- macOS - Just app title with traffic light spacing -->
<div 
  class="flex items-center h-8 select-none drag-region {isDark ? 'bg-gray-900' : 'bg-white'}"
  style="app-region: drag;"
>
  <div class="flex items-center {titleBarClass}">
    <div class="flex items-center space-x-2">
      <svg class="w-4 h-4 {isDark ? 'text-blue-400' : 'text-blue-600'}" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
      </svg>
      <span class="text-sm font-medium {isDark ? 'text-gray-100' : 'text-gray-900'}">
        Your App Name
      </span>
    </div>
  </div>
</div>
{/if}

<style>
  .drag-region {
    -webkit-app-region: drag;
  }
  
  .no-drag {
    -webkit-app-region: no-drag;
  }
</style>
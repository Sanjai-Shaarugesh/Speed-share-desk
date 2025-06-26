<script lang="ts">
  // Svelte 5 runes
  let isMaximized = $state(false);
  let currentPath = $state('/');
  let isDarkTheme = $state(false);
  let canGoBack = $state(false);
  let canGoForward = $state(false);

  // Derived state using $derived
  const themeClasses = $derived({
    bg: isDarkTheme ? 'bg-gray-800' : 'bg-gray-100',
    border: isDarkTheme ? 'border-gray-700' : 'border-gray-300',
    text: isDarkTheme ? 'text-gray-200' : 'text-gray-800',
    buttonHover: isDarkTheme ? 'hover:bg-gray-700' : 'hover:bg-gray-200',
    disabled: isDarkTheme ? 'text-gray-500' : 'text-gray-400',
    controlHover: isDarkTheme ? 'hover:bg-gray-600' : 'hover:bg-gray-300'
  });

  // Window controls
  const handleMinimize = () => window.api?.windowMinimize();
  const handleMaximize = () => window.api?.windowMaximize();
  const handleClose = () => window.api?.windowClose();
  
  // Navigation controls
  const handleBack = () => history.back();
  const handleForward = () => history.forward();
  const handleHome = () => window.location.hash = '#/';

  // Initialize and set up listeners
  $effect(() => {
    // Check window state
    const checkWindowState = async () => {
      if (window.api) {
        isMaximized = await window.api.windowIsMaximized();
        window.api.onWindowMaximized((maximized: boolean) => {
          isMaximized = maximized;
        });
      }
    };

    // Detect system theme
    const detectTheme = () => {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      isDarkTheme = mediaQuery.matches;
      mediaQuery.addEventListener('change', (e) => {
        isDarkTheme = e.matches;
      });
      return mediaQuery;
    };

    // Set up navigation state
    const setupNavigation = () => {
      const updateNavState = () => {
        canGoBack = window.history.state?.idx > 0;
        canGoForward = window.history.state?.idx < window.history.length - 1;
      };
      window.addEventListener('popstate', updateNavState);
      updateNavState();
      return () => window.removeEventListener('popstate', updateNavState);
    };

    checkWindowState();
    const mediaQuery = detectTheme();
    const cleanupNavigation = setupNavigation();

    // Update current path when hash changes
    const updatePath = () => {
      currentPath = window.location.hash.substring(1) || '/';
    };
    window.addEventListener('hashchange', updatePath);
    updatePath();

    return () => {
      if (window.api) window.api.removeAllListeners('window-maximized');
      mediaQuery.removeEventListener('change', () => {});
      cleanupNavigation();
      window.removeEventListener('hashchange', updatePath);
    };
  });
</script>

<!-- Rest of your component remains the same -->
<div 
  class="flex items-center h-10 {themeClasses.bg} border-b {themeClasses.border} select-none shadow-sm"
>
  <!-- Left side - Navigation and path -->
  <div class="flex-1 h-full flex items-center px-3 app-drag-region">
    <!-- Navigation Controls -->
    <div class="flex items-center space-x-1 mr-3">
      <button
        class="w-7 h-7 rounded-md flex items-center justify-center {themeClasses.buttonHover} transition-all duration-200 {canGoBack ? themeClasses.text : themeClasses.disabled}"
        class:opacity-50={!canGoBack}
        disabled={!canGoBack}
        on:click={handleBack}
        title="Back"
      >
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      
      <!-- Other buttons and content remains the same -->
      <!-- ... -->
    </div>
  </div>
</div>

<style>
  /* Your styles remain the same */
  .app-drag-region {
    -webkit-app-region: drag;
  }
  
  .no-drag, .app-drag-region button {
    -webkit-app-region: no-drag;
  }
  
  button {
    transition: all 0.2s ease;
  }
  
  button:focus-visible {
    outline: 2px solid #3584e4;
    outline-offset: -2px;
  }
  
  button:active {
    transform: scale(0.95);
  }
</style>
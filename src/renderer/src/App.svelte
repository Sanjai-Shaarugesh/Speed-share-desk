<script>
  import Router from 'svelte-spa-router'
  import routes from './routes'
  import { onMount } from 'svelte'
  import Shortcuts from './components/shortcuts.svelte';
  import icon2 from '../../../resources/icon2.webp?asset';
  import Refresh from './components/Refresh.svelte';
  import Footer from './components/Footer.svelte';
   import { githubLink , supportEmail, websiteLink } from '../../config';

  let isDark = false
  let appTitle = "Speed-share"
  let platform = window.electron?.platform || 'win32' // Default to win32 if not in Electron
  let showDeveloperInfo = false

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

  function toggleDeveloperInfo() {
    showDeveloperInfo = !showDeveloperInfo
  }

  function closeDeveloperInfo() {
    showDeveloperInfo = false
  }
</script>

<main class="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200 relative">
  <div class="flex flex-col min-h-screen">
    <!-- Integrated Title Bar -->
    <div class="integrated-title-bar absolute top-0 left-0 right-0 h-8 flex items-center px-4 select-none drag-region z-50 {platform === 'darwin' ? 'pl-20' : ''}">
      <div class="flex items-center space-x-2 no-drag">
        <button
          onclick={toggleTheme}
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

        <!-- Info Button -->
        <button
          onclick={toggleDeveloperInfo}
          class="p-1 rounded-md hover:bg-black/10 dark:hover:bg-white/10 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 backdrop-blur-sm"
          title="Developer Information"
        >
          <svg class="w-4 h-4 text-blue-500 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
          </svg>
        </button>

        <img
          src={icon2}
          alt="icon"
          class="w-4 h-4 rounded-full flex-shrink-0 object-cover"
        />

        <span class="absolute left-1/2 transform -translate-x-1/2 text-base text-center font-semibold font-mono tracking-wide text-gray-800 dark:text-gray-200 pointer-events-none text-lg md:text-xl font-bold animate-pulse">
          {appTitle}
        </span>
      </div>
    </div>

    <!-- Developer Info Modal -->
    {#if showDeveloperInfo}
      <div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] no-drag" onclick={closeDeveloperInfo}>
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-6 mx-4 max-w-md w-full border border-gray-200 dark:border-gray-700" >
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-bold text-gray-900 dark:text-white flex items-center">
              <svg class="w-5 h-5 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
              </svg>
              Developer Info
            </h2>
            <button
              onclick={closeDeveloperInfo}
              class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="space-y-4">
            <div class="text-center">
              <div class="w-16 h-16 rounded-full mx-auto mb-3 overflow-hidden">
                <img src={icon2} alt="Logo" class="w-full h-full object-cover" />
              </div>

              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Speed-share</h3>
              <p class="text-sm text-gray-600 dark:text-gray-400">Version 1.0.0</p>
            </div>

            <div class="border-t border-gray-200 dark:border-gray-700 pt-4">
              <div class="space-y-3">
                <div>
                  <h4 class="text-sm font-medium text-gray-900 dark:text-white">Developer</h4>
                  <p class="text-sm text-gray-600 dark:text-gray-400">Sanjai-Shaarugesh</p>
                </div>


                <div>
                  <h4 class="text-sm font-medium text-gray-900 dark:text-white">Contact</h4>
                  <p class="text-sm text-gray-600 dark:text-gray-400">shaarugesh6@gmail.com</p>
                </div>

                <div>
                   <h4 class="text-sm font-medium text-gray-900 dark:text-white">Support the development:</h4>


<a href="https://buymeacoffee.com/sanjai" target="_blank">
  <img src="https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png" alt="Buy Me A Coffee">
</a>

                </div>

                <div>
                  <h4 class="text-sm font-medium text-gray-900 dark:text-white">Description</h4>
                  <p class="text-sm text-gray-600 dark:text-gray-400">A fast and secure file sharing application with modern UI and cross-platform support.</p>
                </div>
              </div>
            </div>

            <div class="border-t border-gray-200 dark:border-gray-700 pt-4 flex justify-center space-x-4">
              <a href={githubLink}  target="_blank" class="text-blue-500 hover:text-blue-600 text-sm font-medium transition-colors">
                GitHub
              </a>
              <a href={websiteLink}  target="_blank" class="text-blue-500 hover:text-blue-600 text-sm font-medium transition-colors">
                Website
              </a>
              <a
                href={`mailto:${supportEmail}`}
                class="text-blue-500 hover:text-blue-600 text-sm font-medium transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                Support
              </a>

            </div>
          </div>
        </div>
      </div>
    {/if}

    <!-- Main Content -->
    <div class="flex-1 flex flex-col items-center justify-center p-4 pt-12">
      <Router {routes} />
      <Shortcuts/>
    </div>
     <Footer/>
  </div>

  <Refresh/>
</main>


<style>
  :global(html) {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
    /* Enable smooth scrolling */
    scroll-behavior: smooth;
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

  /* Modern Minimalistic Scrollbar Styles */

  /* Hide scrollbars by default (overlay style) */
  :global(*) {
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* IE and Edge */
  }

  /* Webkit scrollbars - minimalistic design */
  :global(*::-webkit-scrollbar) {
    width: 4px;
    height: 4px;
  }

  /* Track - completely transparent/hidden */
  :global(*::-webkit-scrollbar-track) {
    background: transparent;
    border-radius: 0;
  }

  /* Thumb - ultra-thin, subtle, with 3D effect */
  :global(*::-webkit-scrollbar-thumb) {
    background: linear-gradient(
      135deg,
      rgba(0, 0, 0, 0.08) 0%,
      rgba(0, 0, 0, 0.12) 50%,
      rgba(0, 0, 0, 0.08) 100%
    );
    border-radius: 2px;
    border: none;
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.1),
      0 0 2px rgba(0, 0, 0, 0.1);
    transition: all 0.2s ease;
    opacity: 0;
  }

  /* Dark theme scrollbar thumb */
  :global(.dark *::-webkit-scrollbar-thumb) {
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.08) 0%,
      rgba(255, 255, 255, 0.15) 50%,
      rgba(255, 255, 255, 0.08) 100%
    );
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.05),
      0 0 2px rgba(0, 0, 0, 0.3);
  }

  /* Show scrollbar on hover */
  :global(*:hover::-webkit-scrollbar-thumb) {
    opacity: 1;
  }

  /* Thumb hover state - slightly more visible */
  :global(*::-webkit-scrollbar-thumb:hover) {
    background: linear-gradient(
      135deg,
      rgba(0, 0, 0, 0.15) 0%,
      rgba(0, 0, 0, 0.25) 50%,
      rgba(0, 0, 0, 0.15) 100%
    );
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.15),
      0 0 4px rgba(0, 0, 0, 0.2);
    transform: scaleX(1.5);
    opacity: 1;
  }

  /* Dark theme thumb hover */
  :global(.dark *::-webkit-scrollbar-thumb:hover) {
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.15) 0%,
      rgba(255, 255, 255, 0.25) 50%,
      rgba(255, 255, 255, 0.15) 100%
    );
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.1),
      0 0 4px rgba(0, 0, 0, 0.4);
  }

  /* Corner where scrollbars meet */
  :global(*::-webkit-scrollbar-corner) {
    background: transparent;
  }

  /* Special styling for specific elements that need visible scrollbars */
  :global(.scrollable-content) {
    scrollbar-width: thin;
  }

  :global(.scrollable-content::-webkit-scrollbar) {
    width: 6px;
    height: 6px;
  }

  :global(.scrollable-content::-webkit-scrollbar-thumb) {
    opacity: 0.3;
  }

  :global(.scrollable-content:hover::-webkit-scrollbar-thumb) {
    opacity: 0.6;
  }

  /* Focus styles */
  :global(*:focus-visible) {
    outline: 2px solid theme('colors.blue.500');
    outline-offset: 2px;
  }

  :global(.dark *:focus-visible) {
    outline: 2px solid theme('colors.blue.400');
  }

  /* Custom scrollbar for specific components */
  :global(.custom-scroll) {
    scrollbar-width: thin;
    scrollbar-color: rgba(0, 0, 0, 0.1) transparent;
  }

  :global(.dark .custom-scroll) {
    scrollbar-color: rgba(255, 255, 255, 0.1) transparent;
  }
</style>

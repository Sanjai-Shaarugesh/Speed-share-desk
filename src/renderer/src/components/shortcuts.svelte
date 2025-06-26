<div class="hidden sm:block fixed bottom-4 right-4 z-10 md:bottom-10 md:right-6 py-2">
  <div class="relative group">
    <!-- Button -->
    <button 
      id="toggleShortcutsBtn"
      aria-label="Toggle keyboard shortcuts" 
      class="btn btn-circle btn-ghost shadow-xl backdrop-blur-md bg-white/30 dark:bg-black/30 ring-1 ring-black/10 dark:ring-white/10 hover:ring-2 transition-all duration-300"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-black dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
      </svg>
    </button>

    <!-- Popover -->
    <div
      id="popover-default"
      role="tooltip"
      class="absolute bottom-12 right-0 z-20 w-96 text-sm transition-opacity duration-200 opacity-0 invisible group-hover:visible group-hover:opacity-100
             backdrop-blur-md bg-white/30 dark:bg-black/30 border border-white/20 dark:border-white/10 shadow-2xl ring-1 ring-black/10 dark:ring-white/10
             rounded-xl overflow-hidden"
    >
      <!-- Title -->
      <div class="px-3 py-2 bg-white/40 dark:bg-black/40 border-b border-white/20 dark:border-white/10">
        <h3 class="font-semibold text-base text-gray-800 dark:text-gray-100">Keyboard Shortcuts</h3>
      </div>

      <!-- Content -->
      <div class="px-4 py-3 max-h-96 overflow-y-auto">
        <div class="overflow-x-auto">
          <table class="table table-sm w-full">
            <thead class="sticky top-0 z-10">
              <tr>
                <th class="bg-white/40 dark:bg-black/40 backdrop-blur-sm text-gray-800 dark:text-gray-200">Key</th>
                <th class="bg-white/40 dark:bg-black/40 backdrop-blur-sm text-gray-800 dark:text-gray-200">Description</th>
              </tr>
            </thead>
            <tbody class="text-gray-900 dark:text-gray-100">
              <tr class="hover:bg-white/20 dark:hover:bg-white/10 transition">
                <td><kbd class="kbd kbd-sm">ctrl</kbd> + <kbd class="kbd kbd-sm">c</kbd></td>
                <td>Copy the offer code</td>
              </tr>
              <tr class="hover:bg-white/20 dark:hover:bg-white/10 transition">
                <td><kbd class="kbd kbd-sm">ctrl</kbd> + <kbd class="kbd kbd-sm">p</kbd></td>
                <td>Paste code</td>
              </tr>
              <tr class="hover:bg-white/20 dark:hover:bg-white/10 transition">
                <td><kbd class="kbd kbd-sm">ctrl</kbd> + <kbd class="kbd kbd-sm">o</kbd></td>
                <td>Generate offer code</td>
              </tr>
              <tr class="hover:bg-white/20 dark:hover:bg-white/10 transition">
                <td><kbd class="kbd kbd-sm">ctrl</kbd> + <kbd class="kbd kbd-sm">a</kbd></td>
                <td>Accept offer code</td>
              </tr>
              <tr class="hover:bg-white/20 dark:hover:bg-white/10 transition">
                <td><kbd class="kbd kbd-sm">alt</kbd> + <kbd class="kbd kbd-sm">s</kbd></td>
                <td>Open settings</td>
              </tr>
              <tr class="hover:bg-white/20 dark:hover:bg-white/10 transition">
                <td><kbd class="kbd kbd-sm">alt</kbd> + <kbd class="kbd kbd-sm">s</kbd></td>
                <td>Open QR scanner</td>
              </tr>
              <tr class="hover:bg-white/20 dark:hover:bg-white/10 transition">
                <td><kbd class="kbd kbd-sm">ctrl</kbd> + <kbd class="kbd kbd-sm">Q</kbd></td>
                <td>Show QR code</td>
              </tr>
              <tr class="hover:bg-white/20 dark:hover:bg-white/10 transition">
                <td><kbd class="kbd kbd-sm">ctrl</kbd> + <kbd class="kbd kbd-sm">r</kbd></td>
                <td>Refresh page</td>
              </tr>
              <tr class="hover:bg-white/20 dark:hover:bg-white/10 transition">
                <td><kbd class="kbd kbd-sm">g</kbd> + <kbd class="kbd kbd-sm">o</kbd></td>
                <td>Go to offer page</td>
              </tr>
              <tr class="hover:bg-white/20 dark:hover:bg-white/10 transition">
                <td><kbd class="kbd kbd-sm">g</kbd> + <kbd class="kbd kbd-sm">a</kbd></td>
                <td>Go to answer page</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</div>

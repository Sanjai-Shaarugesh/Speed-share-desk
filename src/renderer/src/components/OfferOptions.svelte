<script lang="ts">
  import { defaultSendOptions, stunServers } from '../../../config';
  import type { SendOptions } from '../../../type';
  import CustomSelect from './CustomSelect.svelte';
  import { EarthLock, ServerCrash, TableCellsSplit } from '@lucide/svelte';

  type Props = {
    onUpdate: (options: SendOptions) => void;
  };
  const { onUpdate }: Props = $props();

  let encryptionEnabled = $state(defaultSendOptions.isEncrypt ? 'true' : 'false');
  let chunkSize: number = $state(defaultSendOptions.chunkSize);
  let iceServer: string = $state(defaultSendOptions.iceServer);

  function getEncryptionEnabled(): boolean {
    return encryptionEnabled === 'true';
  }

  function onChange() {
    onUpdate({
      isEncrypt: getEncryptionEnabled(),
      chunkSize,
      iceServer,
      retryStrategy: defaultSendOptions.retryStrategy,
      wasmBufferSize: defaultSendOptions.wasmBufferSize,
      parallelChunks: defaultSendOptions.parallelChunks,
      useStreaming: defaultSendOptions.useStreaming,
      onProgress: defaultSendOptions.onProgress,
      signal: defaultSendOptions.signal,
      timeout: defaultSendOptions.timeout,
      compressionLevel: defaultSendOptions.compressionLevel,
      priorityQueueing: defaultSendOptions.priorityQueueing,
      adaptiveChunking: defaultSendOptions.adaptiveChunking,
      retryAttempts: defaultSendOptions.retryAttempts
    });
  }

  // Call onChange initially and when values change
  $effect(() => {
    onChange();
  });
</script>

<!-- Frosted Glass Container with 3D Effects -->
<div class="relative p-6 rounded-2xl backdrop-blur-xl bg-white/10 dark:bg-black/10 border border-white/20 dark:border-white/10 shadow-2xl shadow-black/10 dark:shadow-black/30">
  <!-- 3D Highlight Border -->
  <div class="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 via-transparent to-transparent dark:from-white/10 pointer-events-none"></div>
  
  <!-- Inner Shadow for Depth -->
  <div class="absolute inset-1 rounded-xl bg-gradient-to-t from-black/5 to-transparent dark:from-black/20 pointer-events-none"></div>
  
  <!-- Content Grid -->
  <div class="relative z-10 grid grid-cols-1 xl:grid-cols-2 gap-6">
    <!-- Encryption Setting -->
    <div class="group p-4 rounded-xl backdrop-blur-sm bg-white/5 dark:bg-black/5 border border-white/10 dark:border-white/5 hover:bg-white/10 dark:hover:bg-black/10 hover:border-white/20 dark:hover:border-white/10 transition-all duration-300 hover:shadow-lg hover:shadow-white/10 dark:hover:shadow-black/20 hover:-translate-y-0.5 transform">
      <div class="flex flex-row justify-between items-center">
        <div class="flex-1">
          <div class="flex items-center space-x-3 mb-2">
            <div class="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 text-blue-600 dark:text-blue-400">
              <EarthLock size={18} />
            </div>
            <span class="text-sm font-medium text-gray-800 dark:text-gray-200">Encryption</span>
          </div>
          <p class="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
            Enable E2E encryption for a more secure but slower transfer.
          </p>
        </div>
        <select bind:value={encryptionEnabled} class="ml-4 px-3 py-2 rounded-lg backdrop-blur-sm bg-white/20 dark:bg-black/20 border border-white/20 dark:border-white/10 text-sm font-medium text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 hover:bg-white/30 dark:hover:bg-black/30 transition-all duration-200">
          <option value="true" class="bg-white dark:bg-gray-800">On</option>
          <option value="false" class="bg-white dark:bg-gray-800">Off</option>
        </select>
      </div>
    </div>

    <!-- Chunk Size Setting -->
    <div class="group p-4 rounded-xl backdrop-blur-sm bg-white/5 dark:bg-black/5 border border-white/10 dark:border-white/5 hover:bg-white/10 dark:hover:bg-black/10 hover:border-white/20 dark:hover:border-white/10 transition-all duration-300 hover:shadow-lg hover:shadow-white/10 dark:hover:shadow-black/20 hover:-translate-y-0.5 transform">
      <div class="flex flex-row justify-between items-center">
        <div class="flex-1">
          <div class="flex items-center space-x-3 mb-2">
            <div class="p-2 rounded-lg bg-gradient-to-br from-green-500/20 to-teal-500/20 text-green-600 dark:text-green-400">
              <TableCellsSplit size={18} />
            </div>
            <span class="text-sm font-medium text-gray-800 dark:text-gray-200">Chunk Size</span>
          </div>
          <p class="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
            Higher values make transfer faster but might cause buffer issues.
          </p>
        </div>
        <select bind:value={chunkSize} class="ml-4 px-3 py-2 rounded-lg backdrop-blur-sm bg-white/20 dark:bg-black/20 border border-white/20 dark:border-white/10 text-sm font-medium text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 hover:bg-white/30 dark:hover:bg-black/30 transition-all duration-200">
          <option value={8 * 1024} class="bg-white dark:bg-gray-800">8kb</option>
          <option value={16 * 1024} class="bg-white dark:bg-gray-800">16kb</option>
          <option value={32 * 1024} class="bg-white dark:bg-gray-800">32kb</option>
          <option value={64 * 1024} class="bg-white dark:bg-gray-800">64kb</option>
          <option value={128 * 1024} class="bg-white dark:bg-gray-800">128kb</option>
        </select>
      </div>
    </div>

    <!-- ICE Server Setting -->
    <div class="group xl:col-span-2 p-4 rounded-xl backdrop-blur-sm bg-white/5 dark:bg-black/5 border border-white/10 dark:border-white/5 hover:bg-white/10 dark:hover:bg-black/10 hover:border-white/20 dark:hover:border-white/10 transition-all duration-300 hover:shadow-lg hover:shadow-white/10 dark:hover:shadow-black/20 hover:-translate-y-0.5 transform">
      <div class="flex flex-row justify-between items-center">
        <div class="flex-1">
          <div class="flex items-center space-x-3 mb-2">
            <div class="p-2 rounded-lg bg-gradient-to-br from-orange-500/20 to-red-500/20 text-orange-600 dark:text-orange-400">
              <ServerCrash size={18} />
            </div>
            <span class="text-sm font-medium text-gray-800 dark:text-gray-200">ICE Server</span>
          </div>
          <p class="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
            Choose the STUN/TURN server for connection establishment.
          </p>
        </div>
        <div class="ml-4 min-w-0 flex-shrink-0">
          <CustomSelect options={stunServers} customTextEnabled={true} bind:value={iceServer} />
        </div>
      </div>
    </div>
  </div>
</div>
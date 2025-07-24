<script lang="ts">
  import QrScanner from 'qr-scanner';
  import { onMount, onDestroy } from 'svelte';
  import { ScanLine, ScanQrCode } from '@lucide/svelte';

  type Props = {
    onScanSuccess: (data: string) => void;
    buttonText?: string;
    modalTitle?: string;
  };

  const { onScanSuccess, buttonText = 'Scan QR Code', modalTitle = 'Scan QR Code' }: Props = $props();

  let isModalOpen = $state(false);
  let qrScanner: QrScanner | null = $state(null);
  let videoElement = $state<HTMLVideoElement | null>(null);
  let isCameraActive = $state(false);
  let errorMessage = $state('');
  let permissionRequested = $state(false);

  onMount(() => {
    // Listen for auto-open-qr-scanner event from main process
    const removeListener = window.electron.ipcRenderer.on('auto-open-qr-scanner', () => {
      toggleModal(true);
    });

    return () => {
      removeListener();
      if (qrScanner) {
        qrScanner.stop();
        qrScanner.destroy();
      }
    };
  });

  onDestroy(() => {
    stopScanner();
  });

  async function requestCameraPermission(): Promise<boolean> {
    errorMessage = '';
    permissionRequested = true;

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      errorMessage = 'Your browser does not support camera access.';
      return false;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      stream.getTracks().forEach((track) => track.stop());
      return true;
    } catch (err) {
      const error = err as Error;
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        errorMessage = `Camera access denied. ${
          navigator.platform.toLowerCase().includes('linux')
            ? 'Ensure Flatpak camera permissions are enabled in your system settings.'
            : navigator.platform.toLowerCase().includes('mac')
              ? 'Check System Preferences > Security & Privacy > Camera.'
              : 'Check Windows Settings > Privacy > Camera.'
        }`;
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        errorMessage = 'No camera found. Ensure a camera is connected and Flatpak permissions are set.';
      } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
        errorMessage = 'Camera in use or blocked by Flatpak sandbox.';
      } else if (error.name === 'OverconstrainedError') {
        errorMessage = 'No suitable camera found.';
      } else {
        errorMessage = `Camera error: ${error.message || 'Unknown error'}`;
      }
      return false;
    }
  }

  async function startScanner() {
    errorMessage = '';

    if (!videoElement) {
      errorMessage = 'Video element not found.';
      return;
    }

    if (!permissionRequested) {
      const permissionGranted = await requestCameraPermission();
      if (!permissionGranted) return;
    }

    try {
      qrScanner = new QrScanner(
        videoElement,
        (result) => {
          handleScanSuccess(result);
        },
        {
          highlightScanRegion: true,
          highlightCodeOutline: true,
          preferredCamera: 'environment',
        }
      );

      await qrScanner.start();
      isCameraActive = true;
    } catch (err) {
      errorMessage = `Scanner error: ${err instanceof Error ? err.message : String(err)}`;
      isCameraActive = false;
      permissionRequested = false;
    }
  }

  function stopScanner() {
    if (qrScanner) {
      qrScanner.stop();
      qrScanner.destroy();
      qrScanner = null;
      isCameraActive = false;
    }
  }

  function handleScanSuccess(result: QrScanner.ScanResult) {
    stopScanner();
    isModalOpen = false;
    onScanSuccess(result.data);
    window.electron.ipcRenderer.send('qr-scanned', result.data);
  }

  function toggleModal(open: boolean) {
    isModalOpen = open;
    if (open) {
      if (!permissionRequested) {
        requestCameraPermission().then((granted) => {
          if (granted) startScanner();
        });
      } else {
        startScanner();
      }
    } else {
      stopScanner();
    }
  }
</script>

<button
  class="btn btn-soft btn-secondary"
  onclick={() => toggleModal(true)}
  aria-label="Open QR Scanner"
>
  <ScanLine />
  {buttonText}
</button>

{#if isModalOpen}
  <div class="fixed inset-0 backdrop-blur-xs bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-transparent rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-bold text-white-900">{modalTitle}</h3>
        <button
          class="text-gray-500 hover:text-gray-700"
          onclick={() => toggleModal(false)}
          aria-label="Close QR Scanner"
        >
          <ScanQrCode />
        </button>
      </div>

      <div class="relative w-full aspect-square bg-gray-100 rounded-lg overflow-hidden">
        <video bind:this={videoElement} class="w-full h-full object-cover" playsinline>
          <track kind="captions" />
        </video>

        {#if !isCameraActive && !errorMessage}
          <div class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
            <div class="text-white text-lg">Initializing camera...</div>
          </div>
        {/if}

        {#if errorMessage}
          <div class="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-70 p-4">
            <div class="text-white text-center mb-4">{errorMessage}</div>
            <button
              class="btn btn-sm btn-primary"
              onclick={() => {
                permissionRequested = false;
                requestCameraPermission().then((granted) => {
                  if (granted) startScanner();
                });
              }}
            >
              Request Permission Again
            </button>
          </div>
        {/if}
      </div>

      <p class="mt-4 text-sm text-gray-600">
        Position the QR code within the frame to scan. Make sure it's well-lit and clearly visible.
      </p>

      <div class="mt-4 flex justify-end gap-2">
        <button class="btn btn-error" onclick={() => toggleModal(false)}>Cancel</button>
        {#if !isCameraActive && errorMessage}
          <button
            class="btn btn-primary"
            onclick={() => {
              permissionRequested = false;
              requestCameraPermission().then((granted) => {
                if (granted) startScanner();
              });
            }}
          >
            Retry
          </button>
        {/if}
      </div>
    </div>
  </div>
{/if}

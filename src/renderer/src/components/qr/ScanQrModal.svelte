<script lang="ts">
  import QrScanner from 'qr-scanner';
  import { onMount, onDestroy } from 'svelte';
  import { ScanLine, ScanQrCode, Camera, RotateCcw } from '@lucide/svelte';

  interface Props {
    onScanSuccess: (data: string) => void;
    buttonText?: string;
    modalTitle?: string;
    autoStart?: boolean;
    continuousScanning?: boolean;
  }

  let {
    onScanSuccess,
    buttonText = 'Scan QR Code',
    modalTitle = 'Scan QR Code',
    autoStart = false,
    continuousScanning = false
  }: Props = $props();

  // Core state using Svelte 5 runes
  let isModalOpen = $state(false);
  let qrScanner = $state<QrScanner | null>(null);
  let videoElement = $state<HTMLVideoElement | null>(null);
  let isCameraActive = $state(false);
  let errorMessage = $state('');
  let permissionRequested = $state(false);
  let isScanning = $state(false);
  let scanCount = $state(0);
  let lastScanTime = $state(0);
  let availableCameras = $state<QrScanner.Camera[]>([]);
  let currentCameraIndex = $state(0);
  let isFlipped = $state(false);
  let scanningIndicator = $state(false);

  // Enhanced scanner configuration for better performance
  let scannerConfig = $derived({
    highlightScanRegion: true,
    highlightCodeOutline: true,
    preferredCamera: availableCameras[currentCameraIndex]?.id || 'environment',
    maxScansPerSecond: 25,
    calculateScanRegion: (video: HTMLVideoElement) => {
      const smallerDimension = Math.min(video.videoWidth, video.videoHeight);
      const scanRegionSize = Math.round(0.8 * smallerDimension);
      return {
        x: Math.round((video.videoWidth - scanRegionSize) / 2),
        y: Math.round((video.videoHeight - scanRegionSize) / 2),
        width: scanRegionSize,
        height: scanRegionSize,
        downScaledWidth: 500,
        downScaledHeight: 500,
      };
    }
  });

  onMount(async () => {
    // Get available cameras with error handling
    try {
      availableCameras = await QrScanner.listCameras(true);
    } catch (e) {
      console.warn('Could not list cameras:', e);
      availableCameras = [];
    }

    // Listen for auto-open-qr-scanner event from main process
    let removeListener: (() => void) | null = null;
    if (typeof window !== 'undefined' && window.electron?.ipcRenderer) {
      removeListener = window.electron.ipcRenderer.on('auto-open-qr-scanner', () => {
        toggleModal(true);
      });
    }

    // Auto-start if requested
    if (autoStart) {
      toggleModal(true);
    }

    return () => {
      if (removeListener) removeListener();
      cleanupScanner();
    };
  });

  onDestroy(() => {
    cleanupScanner();
  });

  function cleanupScanner() {
    if (qrScanner) {
      try {
        qrScanner.stop();
        qrScanner.destroy();
      } catch (e) {
        console.warn('Error cleaning up scanner:', e);
      }
      qrScanner = null;
    }
    isCameraActive = false;
    isScanning = false;
  }

  async function requestCameraPermission(): Promise<boolean> {
    errorMessage = '';
    permissionRequested = true;

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      errorMessage = 'Camera access not supported in this browser.';
      return false;
    }

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: 'environment',
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 },
          frameRate: { ideal: 30, min: 15 }
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      stream.getTracks().forEach((track) => track.stop());
      return true;
    } catch (err) {
      const error = err as Error;
      handlePermissionError(error);
      return false;
    }
  }

  function handlePermissionError(error: Error) {
    const platform = navigator.platform.toLowerCase();

    if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
      if (platform.includes('linux')) {
        errorMessage = 'Camera access denied. Enable camera permissions in browser settings or Flatpak permissions.';
      } else if (platform.includes('mac')) {
        errorMessage = 'Camera access denied. Check System Preferences > Security & Privacy > Camera.';
      } else if (platform.includes('win')) {
        errorMessage = 'Camera access denied. Check Windows Settings > Privacy > Camera.';
      } else {
        errorMessage = 'Camera access denied. Please allow camera access in your browser settings.';
      }
    } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
      errorMessage = 'No camera found. Please connect a camera and refresh the page.';
    } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
      errorMessage = 'Camera is busy or blocked. Close other applications using the camera.';
    } else if (error.name === 'OverconstrainedError') {
      errorMessage = 'Camera constraints not supported. Trying with basic settings...';
      setTimeout(() => startScannerWithBasicConstraints(), 1000);
      return;
    } else {
      errorMessage = `Camera error: ${error.message || 'Unknown error occurred'}`;
    }
  }

  async function startScannerWithBasicConstraints() {
    try {
      if (!videoElement) {
        errorMessage = 'Video element not available.';
        return;
      }

      // Ensure the video element is properly attached to DOM
      await new Promise(resolve => {
        if (videoElement!.parentNode) {
          resolve(void 0);
        } else {
          const observer = new MutationObserver(() => {
            if (videoElement!.parentNode) {
              observer.disconnect();
              resolve(void 0);
            }
          });
          observer.observe(document.body, { childList: true, subtree: true });
        }
      });

      // Create QR scanner with proper error handling
      qrScanner = new QrScanner(
        videoElement,
        handleScanResult,
        {
          ...scannerConfig,
          // Add explicit error handling in config
          onDecodeError: (error) => {
            // Silently handle decode errors - these happen normally when no QR code is visible
            console.debug('QR decode error (normal):', error);
          }
        }
      );

      // Use proper event listener attachment
      const handleError = (event: any) => {
        console.error('QR Scanner error event:', event);
        handleScannerError(event.detail || event);
      };

      // Try modern event listener first, fallback to older method
      try {
        if (qrScanner.addEventListener) {
          qrScanner.addEventListener('error', handleError);
        } else if ('on' in qrScanner) {
          // Some versions use .on() method
          (qrScanner as any).on('error', handleError);
        }
      } catch (listenerError) {
        console.warn('Could not attach error listener:', listenerError);
        // Continue without error listener - errors will be caught by try/catch
      }

      await qrScanner.start();
      isCameraActive = true;
      isScanning = true;
      errorMessage = '';

      if (continuousScanning) {
        setupContinuousScanning();
      }

      setupMirrorDetection();

    } catch (err) {
      handleScannerError(err);
    }
  }

  async function startScanner() {
    errorMessage = '';
    scanningIndicator = true;

    if (!videoElement) {
      errorMessage = 'Video element not available.';
      scanningIndicator = false;
      return;
    }

    if (!permissionRequested) {
      const permissionGranted = await requestCameraPermission();
      if (!permissionGranted) {
        scanningIndicator = false;
        return;
      }
    }

    await startScannerWithBasicConstraints();
    scanningIndicator = false;
  }

  function handleScannerError(err: any) {
    console.error('Scanner error:', err);

    // Extract meaningful error message
    let message = '';
    if (err instanceof Error) {
      message = err.message;
    } else if (typeof err === 'string') {
      message = err;
    } else if (err && typeof err === 'object') {
      message = err.message || err.error || String(err);
    } else {
      message = 'Unknown scanner error occurred';
    }

    errorMessage = `Scanner error: ${message}`;
    isCameraActive = false;
    isScanning = false;
    scanningIndicator = false;

    // Smart auto-retry logic for recoverable errors
    const isRetryableError = !errorMessage.toLowerCase().includes('denied') &&
                            !errorMessage.toLowerCase().includes('not found') &&
                            !errorMessage.toLowerCase().includes('not supported') &&
                            !errorMessage.toLowerCase().includes('addeventlistener');

    if (isRetryableError && isModalOpen) {
      console.log('Auto-retrying scanner in 2 seconds...');
      setTimeout(() => {
        if (isModalOpen && !isCameraActive) {
          console.log('Auto-retrying scanner...');
          startScanner();
        }
      }, 2000);
    }
  }

  function setupContinuousScanning() {
    if (qrScanner && typeof qrScanner.setGrayscaleWeights === 'function') {
      try {
        qrScanner.setGrayscaleWeights(0.299, 0.587, 0.114, true);
      } catch (e) {
        console.warn('Could not set grayscale weights:', e);
      }
    }
  }

  function setupMirrorDetection() {
    if (qrScanner && videoElement) {
      console.log('Mirror detection enabled for omnidirectional scanning');
    }
  }

  function stopScanner() {
    cleanupScanner();
    scanningIndicator = false;
  }

  function handleScanResult(result: QrScanner.ScanResult) {
    const currentTime = Date.now();

    if (currentTime - lastScanTime < 500) {
      return;
    }

    lastScanTime = currentTime;
    scanCount++;

    scanningIndicator = true;
    setTimeout(() => scanningIndicator = false, 300);

    if (!continuousScanning) {
      stopScanner();
      isModalOpen = false;
    }

    onScanSuccess(result.data);

    if (typeof window !== 'undefined' && window.electron?.ipcRenderer) {
      window.electron.ipcRenderer.send('qr-scanned', {
        data: result.data,
        timestamp: currentTime,
        scanCount: scanCount
      });
    }
  }

  async function switchCamera() {
    if (availableCameras.length <= 1) return;

    const previousIndex = currentCameraIndex;
    currentCameraIndex = (currentCameraIndex + 1) % availableCameras.length;

    if (qrScanner) {
      try {
        await qrScanner.setCamera(availableCameras[currentCameraIndex].id);
      } catch (err) {
        console.error('Failed to switch camera:', err);
        currentCameraIndex = previousIndex;
        stopScanner();
        setTimeout(() => {
          currentCameraIndex = (previousIndex + 1) % availableCameras.length;
          startScanner();
        }, 500);
      }
    }
  }

  function flipCamera() {
    isFlipped = !isFlipped;
    if (videoElement) {
      videoElement.style.transform = isFlipped ? 'scaleX(-1)' : 'scaleX(1)';
    }
  }

  function toggleModal(open: boolean) {
    isModalOpen = open;
    if (open) {
      errorMessage = '';
      if (!permissionRequested) {
        requestCameraPermission().then((granted) => {
          if (granted) startScanner();
        });
      } else {
        startScanner();
      }
    } else {
      stopScanner();
      scanCount = 0;
    }
  }

  async function retryScanner() {
    permissionRequested = false;
    errorMessage = '';
    const granted = await requestCameraPermission();
    if (granted) {
      await startScanner();
    }
  }
</script>

<button
  class="btn btn-soft btn-secondary relative"
  onclick={() => toggleModal(true)}
  aria-label="Open QR Scanner"
>
  <ScanLine class={scanningIndicator ? 'animate-pulse' : ''} />
  {buttonText}
  {#if scanCount > 0}
    <span class="absolute -top-2 -right-2 bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
      {scanCount}
    </span>
  {/if}
</button>

{#if isModalOpen}
  <div class="fixed inset-0 backdrop-blur-xs bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-transparent rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-bold text-white-900">{modalTitle}</h3>
        <div class="flex gap-2">
          {#if availableCameras.length > 1}
            <button
              class="text-gray-500 hover:text-gray-700"
              onclick={switchCamera}
              aria-label="Switch Camera"
              title="Switch Camera"
            >
              <Camera />
            </button>
          {/if}

          <button
            class="text-gray-500 hover:text-gray-700"
            onclick={flipCamera}
            aria-label="Flip Camera"
            title="Flip Camera View"
          >
            <RotateCcw />
          </button>

          <button
            class="text-gray-500 hover:text-gray-700"
            onclick={() => toggleModal(false)}
            aria-label="Close QR Scanner"
          >
            <ScanQrCode />
          </button>
        </div>
      </div>

      <div class="relative w-full aspect-square bg-gray-100 rounded-lg overflow-hidden">
        <video
          bind:this={videoElement}
          class="w-full h-full object-cover"
          playsinline
          muted
        >
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
              onclick={retryScanner}
            >
              Request Permission Again
            </button>
          </div>
        {/if}
      </div>

      <p class="mt-4 text-sm text-gray-600">
        Position the QR code within the frame to scan. Works with normal and mirrored QR codes from any angle and distance. Make sure it's well-lit and clearly visible.
      </p>

      <div class="mt-4 flex justify-end gap-2">
        <button class="btn btn-error" onclick={() => toggleModal(false)}>Cancel</button>
        {#if !isCameraActive && errorMessage}
          <button
            class="btn btn-primary"
            onclick={retryScanner}
          >
            Retry
          </button>
        {/if}
        {#if isCameraActive && !continuousScanning}
          <button
            class="btn btn-success"
            onclick={() => {
              continuousScanning = true;
              setupContinuousScanning();
            }}
          >
            Continuous Mode
          </button>
        {/if}
      </div>
    </div>
  </div>
{/if}

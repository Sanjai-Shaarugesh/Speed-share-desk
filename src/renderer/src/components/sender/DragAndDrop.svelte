<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { addToastMessage } from '../../../../stores/toastStore';
  import { Paperclip, Trash2 } from '@lucide/svelte';

  type FileItem = {
    file: File;
    dataUrl?: string;
    status?: 'pending' | 'sent';
  };

  let fileItems: FileItem[] = $state([]);

  type Props = {
    onFilesPick: (files: FileList) => void;
  };
  const { onFilesPick }: Props = $props();

  let dropArea: HTMLElement;
  let fileInput: HTMLInputElement;
  let isDragging = $state(false);

  // Convert file to data URL to avoid CSP issues with blob URLs
  function fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function setPreviewFiles(files: FileList) {
    const existingKeys = new Set(fileItems.map((p) => p.file.name + p.file.lastModified));

    for (const file of files) {
      if (existingKeys.has(file.name + file.lastModified)) continue;

      const newItem: FileItem = {
        file,
        status: 'pending' as const
      };

      // Create data URL for images to avoid CSP issues
      if (file.type.startsWith('image/')) {
        try {
          newItem.dataUrl = await fileToDataUrl(file);
        } catch (error) {
          console.warn('Failed to create preview for', file.name, error);
        }
      }

      fileItems = [...fileItems, newItem];
    }
  }

  function setupDropAreaListeners() {
    const events = ['dragenter', 'dragover', 'dragleave', 'drop'];
    
    events.forEach((eventName) => {
      dropArea.addEventListener(
        eventName,
        (e: Event) => {
          e.preventDefault();
          e.stopPropagation();
        },
        false
      );
    });

    dropArea.addEventListener('dragenter', () => { isDragging = true; }, false);
    dropArea.addEventListener('dragover', () => { isDragging = true; }, false);
    dropArea.addEventListener('dragleave', () => { isDragging = false; }, false);
    dropArea.addEventListener('drop', (e) => {
      isDragging = false;
      handleDrop(e as DragEvent);
    }, false);
  }

  function handleDrop(e: DragEvent) {
    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      onFilesPick(files);
      setPreviewFiles(files);
    }
  }

  function handleFileInputChange() {
    if (fileInput.files && fileInput.files.length > 0) {
      onFilesPick(fileInput.files);
      setPreviewFiles(fileInput.files);
      fileInput.value = '';
    }
  }

  function handlePasteEvent(event: ClipboardEvent) {
    const clipboardData = event.clipboardData;
    if (!clipboardData) return;

    const files: File[] = [];

    const text = clipboardData.getData('Text');
    if (text) {
      const textBlob = new Blob([text], { type: 'text/plain' });
      const textFile = new File([textBlob], 'clipboard.txt', { type: 'text/plain' });
      files.push(textFile);
    }

    const items = clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      const file = items[i].getAsFile();
      if (file) files.push(file);
    }

    if (files.length > 0) {
      const dataTransfer = new DataTransfer();
      files.forEach((file) => dataTransfer.items.add(file));
      onFilesPick(dataTransfer.files);
      setPreviewFiles(dataTransfer.files);
    }
  }

  async function handlePasteFromClipboardButton() {
    try {
      const clipboardData = navigator.clipboard;
      if (!clipboardData) {
        addToastMessage('Clipboard API not available');
        return;
      }

      const files: File[] = [];

      try {
        const text = await clipboardData.readText();
        if (text && text.trim()) {
          const textBlob = new Blob([text], { type: 'text/plain' });
          const textFile = new File([textBlob], 'clipboard.txt', { type: 'text/plain' });
          files.push(textFile);
        }
      } catch (e) {
        // Silently ignore if reading text fails, continue with images
      }

      try {
        const items = await clipboardData.read();
        for (const item of items) {
          for (const type of item.types) {
            if (!type.startsWith('image/')) continue;
            const blob = await item.getType(type);
            const imageFile = new File([blob], `image.${type.replace('image/', '')}`, { type });
            files.push(imageFile);
          }
        }
      } catch (e) {
        // Modern clipboard API might not be supported, continue with what we have
      }

      if (files.length > 0) {
        const dataTransfer = new DataTransfer();
        files.forEach((file) => dataTransfer.items.add(file));
        onFilesPick(dataTransfer.files);
        setPreviewFiles(dataTransfer.files);
      } else {
        addToastMessage('No supported data on clipboard');
      }
    } catch (e) {
      addToastMessage('Failed to read clipboard');
    }
  }

  function removeFile(index: number) {
    const removed = fileItems[index];
    fileItems = fileItems.filter((_, i) => i !== index);
    addToastMessage(`Removed ${removed.file.name}`);
  }

  // Helper function to format file size
  function formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + ' MB';
    else return (bytes / 1073741824).toFixed(1) + ' GB';
  }

  // Get file extension for icon generation
  function getFileExtension(fileName: string): string {
    return fileName.split('.').pop()?.toLowerCase() ?? '';
  }

  // Generate SVG icon as data URL for different file types with theme-aware colors
  function getFileIconSvg(file: File): string {
    const extension = getFileExtension(file.name);
    const type = file.type;
    
    let iconPath = '';
    let bgColor = '#64748b'; // slate-500
    let textColor = '#ffffff';
    
    if (type.startsWith('image/')) {
      bgColor = '#8b5cf6'; // violet-500
      iconPath = `<path d="M4 4h16v12l-4-4-4 4-4-4-4 4V4z" fill="${textColor}"/>
                 <circle cx="8" cy="8" r="1.5" fill="${textColor}"/>`;
    } else if (type.startsWith('audio/')) {
      bgColor = '#3b82f6'; // blue-500
      iconPath = `<path d="M12 2v10.5a2.5 2.5 0 1 0 1 2V7h3V2h-4z" fill="${textColor}"/>`;
    } else if (type.startsWith('video/')) {
      bgColor = '#ec4899'; // pink-500
      iconPath = `<polygon points="8,6 8,18 18,12" fill="${textColor}"/>
                 <rect x="6" y="4" width="12" height="16" rx="2" fill="none" stroke="${textColor}" stroke-width="1"/>`;
    } else if (type.startsWith('text/')) {
      bgColor = '#64748b'; // slate-500
      iconPath = `<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" fill="${textColor}"/>
                 <path d="M14 2v6h6" fill="none" stroke="${bgColor}" stroke-width="2"/>
                 <path d="M8 13h8M8 17h8M8 9h2" stroke="${bgColor}" stroke-width="1"/>`;
    } else if (type.includes('pdf')) {
      bgColor = '#dc2626'; // red-600
      iconPath = `<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" fill="${textColor}"/>
                 <path d="M14 2v6h6" fill="none" stroke="${bgColor}" stroke-width="2"/>
                 <text x="12" y="16" text-anchor="middle" fill="${bgColor}" font-size="6" font-weight="bold">PDF</text>`;
    } else if (type.includes('word') || type.includes('document')) {
      bgColor = '#2563eb'; // blue-600
      iconPath = `<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" fill="${textColor}"/>
                 <path d="M14 2v6h6" fill="none" stroke="${bgColor}" stroke-width="2"/>
                 <text x="12" y="16" text-anchor="middle" fill="${bgColor}" font-size="5" font-weight="bold">DOC</text>`;
    } else if (type.includes('excel') || type.includes('sheet')) {
      bgColor = '#16a34a'; // green-600
      iconPath = `<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" fill="${textColor}"/>
                 <path d="M14 2v6h6" fill="none" stroke="${bgColor}" stroke-width="2"/>
                 <text x="12" y="16" text-anchor="middle" fill="${bgColor}" font-size="5" font-weight="bold">XLS</text>`;
    } else if (type.includes('zip') || type.includes('compressed')) {
      bgColor = '#d97706'; // amber-600
      iconPath = `<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" fill="${textColor}"/>
                 <path d="M14 2v6h6" fill="none" stroke="${bgColor}" stroke-width="2"/>
                 <text x="12" y="16" text-anchor="middle" fill="${bgColor}" font-size="5" font-weight="bold">ZIP</text>`;
    } else {
      bgColor = '#64748b'; // slate-500
      iconPath = `<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" fill="${textColor}"/>
                 <path d="M14 2v6h6" fill="none" stroke="${bgColor}" stroke-width="2"/>`;
    }
    
    return `data:image/svg+xml;base64,${btoa(`
      <svg width="48" height="48" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="3" fill="${bgColor}"/>
        ${iconPath}
      </svg>
    `)}`;
  }

  onMount(() => {
    setupDropAreaListeners();
    document.addEventListener('paste', handlePasteEvent);
  });

  onDestroy(() => {
    document.removeEventListener('paste', handlePasteEvent);
  });
</script>

<!-- Upload Area -->
<div class="w-full">
  <label
    class="relative flex flex-col border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200
    border-gray-300 dark:border-gray-600 hover:border-primary bg-white dark:bg-gray-800
    {isDragging ? 'border-primary bg-primary/10 dark:bg-primary/10' : ''}"
    bind:this={dropArea}
  >
    <input
      accept="*"
      type="file"
      multiple
      class="absolute inset-0 z-50 w-full h-full p-0 m-0 outline-none opacity-0 cursor-pointer"
      title=""
      bind:this={fileInput}
      onchange={handleFileInputChange}
    />

    <div class="flex flex-col items-center justify-center py-8 px-4 text-center">
      <div class="p-3 mb-4 rounded-full bg-primary/10 text-primary">
        <Paperclip class="w-6 h-6" />
      </div>

      <p class="mb-2 font-medium text-gray-900 dark:text-gray-100">
        Drop files here or click to upload
      </p>
      <p class="text-sm text-gray-600 dark:text-gray-400 hidden md:block">
        You can also paste from clipboard (Ctrl+V)
      </p>
    </div>
  </label>

  <!-- Paste button for mobile -->
  <button 
    class="btn btn-primary w-full mt-4 md:hidden" 
    onclick={handlePasteFromClipboardButton}
  >
    <Paperclip class="w-4 h-4" />
    Paste from clipboard
  </button>

  <!-- File Preview Section -->
  {#if fileItems.length > 0}
    <div class="mt-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Selected Files
        </h3>
        <div class="badge badge-primary badge-lg">
          {fileItems.length}
        </div>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        {#each fileItems as item, index}
          <div class="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-all duration-200">
            <div class="p-4">
              <div class="flex gap-4 items-start">
                <!-- File Preview/Icon -->
                <div class="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
                  {#if item.dataUrl}
                    <img src={item.dataUrl} alt={item.file.name} class="w-full h-full object-cover" />
                  {:else}
                    <div class="w-full h-full flex items-center justify-center">
                      <img
                        src={getFileIconSvg(item.file)}
                        alt={item.file.name}
                        class="w-12 h-12 object-contain"
                      />
                    </div>
                  {/if}
                </div>

                <!-- File Info -->
                <div class="flex-1 min-w-0">
                  <div class="flex items-start justify-between gap-2">
                    <div class="min-w-0 flex-1">
                      <p class="font-medium text-gray-900 dark:text-gray-100 truncate" title={item.file.name}>
                        {item.file.name}
                      </p>
                      <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {formatFileSize(item.file.size)} • {item.file.type || 'Unknown type'}
                      </p>
                    </div>

                    <!-- Status Badge -->
                    <div class="px-2 py-1 text-xs font-medium rounded-full 
                      {item.status === 'pending' 
                        ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' 
                        : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'}">
                      {item.status === 'pending' ? 'Pending' : 'Sent'}
                    </div>
                  </div>

                  <!-- Remove Button -->
                  <div class="flex justify-end mt-3">
                    <button
                      class="p-1 rounded-full text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      onclick={() => removeFile(index)}
                      aria-label="Remove file"
                    >
                      <Trash2 class="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div>
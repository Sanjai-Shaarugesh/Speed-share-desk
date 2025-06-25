<script lang="ts">
  import { FileStatus, type ReceivingFile } from '../../../../type';
  import FileCard from '../FileCard.svelte';
  import { FileDown, Shredder } from '@lucide/svelte';

  type Props = {
    receivingFiles: { [key: string]: ReceivingFile };
    onRemove: (key: string) => void;
    onDownload: (key: string) => void;
    onAccept: (key: string) => void;
    onDeny: (key: string) => void;
  };

  const { receivingFiles, onRemove, onDownload, onAccept, onDeny }: Props = $props();
</script>

<div class="grid gap-8">
  {#each Object.entries(receivingFiles) as [key, receivedFile], index (key)}
    <FileCard fileDetail={receivedFile} isSender={false}>
    <div class="flex-none backdrop-blur-md bg-white/10 dark:bg-black/10 border border-white/20 dark:border-white/10 rounded-xl shadow-2xl backdrop-saturate-150 shadow-black/10 dark:shadow-white/5">
  {#if receivedFile.status === FileStatus.WaitingAccept && !receivedFile.error}
    <button onclick={() => onAccept(key)} 
            class="btn btn-primary backdrop-blur-md bg-gradient-to-br from-primary/90 via-primary/80 to-primary/70 
                   hover:from-primary/95 hover:via-primary/85 hover:to-primary/75 
                   border border-white/30 dark:border-white/20 
                   shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 
                   transform hover:-translate-y-0.5 transition-all duration-200 
                   rounded-lg backdrop-saturate-150">
      Accept
    </button>
    <button onclick={() => onDeny(key)} 
            class="btn btn-ghost backdrop-blur-md bg-gradient-to-br from-white/10 via-white/5 to-transparent 
                   dark:from-black/20 dark:via-black/10 dark:to-transparent 
                   hover:from-white/20 hover:via-white/15 hover:to-white/5 
                   dark:hover:from-black/30 dark:hover:via-black/20 dark:hover:to-black/10 
                   border border-white/30 dark:border-white/15 
                   shadow-lg shadow-black/10 dark:shadow-white/5 
                   hover:shadow-xl hover:shadow-black/20 dark:hover:shadow-white/10 
                   transform hover:-translate-y-0.5 transition-all duration-200 
                   rounded-lg backdrop-saturate-150">
      Deny
    </button>
  {:else}
    {#if receivedFile.status === FileStatus.Success}
      <button onclick={() => onDownload(key)} 
              class="btn btn-active btn-success backdrop-blur-md bg-gradient-to-br from-success/90 via-success/80 to-success/70 
                     hover:from-success/95 hover:via-success/85 hover:to-success/75 
                     border border-white/30 dark:border-white/20 
                     shadow-lg shadow-success/30 hover:shadow-xl hover:shadow-success/40 
                     transform hover:-translate-y-0.5 transition-all duration-200 
                     rounded-lg backdrop-saturate-150">
        Download <FileDown />
      </button>
    {/if}
    <button onclick={() => onRemove(key)} 
            class="btn btn-error backdrop-blur-md bg-gradient-to-br from-error/90 via-error/80 to-error/70 
                   hover:from-error/95 hover:via-error/85 hover:to-error/75 
                   border border-white/30 dark:border-white/20 
                   shadow-lg shadow-error/30 hover:shadow-xl hover:shadow-error/40 
                   transform hover:-translate-y-0.5 transition-all duration-200 
                   rounded-lg backdrop-saturate-150"> 
      Remove <Shredder /> 
    </button>
  {/if}
</div>
    </FileCard>
  {/each}
</div>

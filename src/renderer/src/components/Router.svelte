<script lang="ts">
  import { currentPath } from '../../../stores/navigationStore';
  import { onMount } from 'svelte';
  import { initCapacitorNavigation } from '../capacitor/navigation';
  import OfferPage from '../components/OfferPage.svelte';
  import AnswerPage from '../components/ReceivePage.svelte';

  onMount(() => {
    initCapacitorNavigation();
  });
</script>

{#if $currentPath === '/'}
  <OfferPage />
{:else if $currentPath === '/answer'}
  <AnswerPage />
{:else}
  <div>Page not found</div>
{/if}

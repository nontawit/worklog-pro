<script>
    import { toast } from '$lib/stores/toast';

    let message = '';
    let type = 'success';
    let show = false;

    // Subscribe to the toast store
    toast.subscribe(value => {
        message = value.message;
        type = value.type;
        show = value.show;
    });

    // กำหนดสีและไอคอนตามประเภท
    $: bgColor = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500';
    $: icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';

    // Animation classes: slide in from bottom right
    $: containerClasses = `fixed bottom-4 right-4 z-50 p-4 transition-transform duration-300 ${
        show ? 'translate-x-0' : 'translate-x-[150%]'
    }`;
</script>

<div class={containerClasses} aria-live="assertive" role="alert">
    {#if show}
        <div class="max-w-xs w-full {bgColor} text-white rounded-lg shadow-xl pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden">
            <div class="p-4 flex items-start">
                <div class="flex-shrink-0 text-xl mr-3">
                    {icon}
                </div>
                <div class="ml-3 w-0 flex-1 pt-0.5">
                    <p class="text-sm font-medium">
                        {message}
                    </p>
                </div>
            </div>
        </div>
    {/if}
</div>
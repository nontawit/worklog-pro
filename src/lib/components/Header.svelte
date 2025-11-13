<script>
    export let openForm;
</script>

<header class="bg-white shadow-md sticky top-0 z-40">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center min-h-[4rem]"> 
        
        <div class="flex items-center space-x-3">
            <img 
                src="/NTW_Logo.png" 
                alt="WorkLog Pro Logo" 
                class="w-16 h-16 object-contain rounded-full" 
            />
            
            <h1 class="text-3xl font-extrabold text-orange-600 tracking-tight">
                WorkLog Pro
            </h1>
        </div>
        
        <button 
            on:click={openForm}
            class="px-5 py-2 bg-orange-600 text-white font-semibold rounded-lg shadow-md hover:bg-orange-700 transition duration-150 flex items-center space-x-2"
        >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
            </svg>
            <span>เพิ่มรายการ</span>
        </button>
    </div>
</header>
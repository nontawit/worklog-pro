<script>
    import { createEventDispatcher } from 'svelte';
    import { db } from '$lib/firebase';
    import { collection, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
    import { showToast } from '$lib/stores/toast'; 

    export let toggleForm;
    export let dataToEdit = null; 

    const dispatch = createEventDispatcher();

    // ----------------------------------------------------
    // 📝 State และ Default Values
    // ----------------------------------------------------
    let formTitle = dataToEdit ? 'แก้ไขรายการบันทึกงาน' : 'เพิ่มรายการบันทึกงานใหม่';
    let isSubmitting = false;

    // Helper functions for formatting date and time
    const formatDate = (date) => {
        const d = new Date(date);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear() + 543; // Convert to Thai Buddhist Era (พ.ศ.)
        return `${day}/${month}/${year}`;
    };

    const formatTime = (date) => {
        const d = new Date(date);
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
    };

    // ----------------------------------------------------
    // 🌟 Dropdown Options
    // ----------------------------------------------------
    const SECTION_OPTIONS = [
        'เทคโนโลยีสารสนเทศ', 
        'แผนงาน', 
        'พัสดุ', 
        'บริหาร', 
        'การเงิน', 
        'บัญชี', 
        'ก่อสร้าง', 
        'ช่างกล', 
        'สำรวจและออกแบบ', 
        'ห้องประชุมเล็ก(ชั้น2)', 
        'ห้องประชุมใหญ่(ขั้น3)'
    ];

    const TYPE_OPTIONS = ['แก้ไข', 'ติดตั้ง', 'ประชุม', 'อื่นๆ']; 
    const STATUS_OPTIONS = ['ดำเนินการ', 'เสร็จสิ้น'];

    // Initialize form data
    let formData = {
        item: dataToEdit?.item || '',
        type: dataToEdit?.type || TYPE_OPTIONS[0], 
        section: dataToEdit?.section || SECTION_OPTIONS[0], 
        cause: dataToEdit?.cause || '',
        solution: dataToEdit?.solution || '',
        date: dataToEdit?.date || formatDate(new Date()),
        time: dataToEdit?.time || formatTime(new Date()),
        status: dataToEdit?.status || 'ดำเนินการ',
    };

    // ----------------------------------------------------
    // 📝 Form Submission Handler (ใช้ showToast แทน alert())
    // ----------------------------------------------------
    const handleSubmit = async () => {
        if (!formData.item || !formData.section) {
            showToast('กรุณากรอกข้อมูลรายการและส่วนงานให้ครบถ้วน', 'error');
            return;
        }

        isSubmitting = true;

        try {
            const dataToSave = {
                ...formData,
                updatedAt: serverTimestamp() 
            };

            if (dataToEdit) {
                // UPDATE operation
                const logRef = doc(db, 'worklogs', dataToEdit.id);
                await updateDoc(logRef, dataToSave);
                showToast('แก้ไขรายการเรียบร้อยแล้ว!', 'success');
            } else {
                // CREATE operation
                dataToSave.createdAt = serverTimestamp(); 
                await addDoc(collection(db, 'worklogs'), dataToSave);
                showToast('บันทึกรายการเรียบร้อยแล้ว!', 'success');
            }

            toggleForm(); 
            dispatch('success'); 
        } catch (e) {
            console.error("Error saving document: ", e);
            showToast(`ไม่สามารถบันทึกรายการได้: ${e.message}`, 'error', 5000); 
        } finally {
            isSubmitting = false;
        }
    };
</script>

<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 p-6 transform transition-all scale-100 opacity-100">
        
        <h2 class="text-2xl font-bold text-gray-800 border-b pb-3 mb-4">{formTitle}</h2>
        
        <form on:submit|preventDefault={handleSubmit} class="space-y-4">
            
            <div>
                <label for="item" class="block text-sm font-medium text-gray-700 mb-1">รายการ/ปัญหา <span class="text-red-500">*</span></label>
                <input 
                    type="text" 
                    id="item" 
                    bind:value={formData.item}
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500 transition"
                    placeholder="เช่น: ระบบล็อกอินมีปัญหา, เข้าร่วมประชุมประจำสัปดาห์"
                    required
                />
            </div>

            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label for="type" class="block text-sm font-medium text-gray-700 mb-1">ประเภท</label>
                    <select 
                        id="type" 
                        bind:value={formData.type}
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500 transition bg-white"
                    >
                        {#each TYPE_OPTIONS as type}
                            <option value={type}>{type}</option>
                        {/each}
                    </select>
                </div>
                
                <div>
                    <label for="section" class="block text-sm font-medium text-gray-700 mb-1">ส่วนงาน/ฝ่าย <span class="text-red-500">*</span></label>
                    <select 
                        id="section" 
                        bind:value={formData.section}
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500 transition bg-white"
                        required
                    >
                        {#each SECTION_OPTIONS as section}
                            <option value={section}>{section}</option>
                        {/each}
                    </select>
                </div>
            </div>

            <div>
                <label for="cause" class="block text-sm font-medium text-gray-700 mb-1">สาเหตุ (ถ้ามี)</label>
                <textarea 
                    id="cause" 
                    bind:value={formData.cause}
                    rows="2"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500 transition"
                    placeholder="เช่น: API Key หมดอายุ, การสื่อสารไม่ชัดเจน"
                ></textarea>
            </div>

            <div>
                <label for="solution" class="block text-sm font-medium text-gray-700 mb-1">การดำเนินการ/การแก้ไข</label>
                <textarea 
                    id="solution" 
                    bind:value={formData.solution}
                    rows="3"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500 transition"
                    placeholder="สิ่งที่ทำเพื่อแก้ไขหรือดำเนินการต่อ"
                ></textarea>
            </div>

            <div class="grid grid-cols-3 gap-4">
                <div>
                    <label for="date" class="block text-sm font-medium text-gray-700 mb-1">วันที่ (วว/ดด/ปปปป)</label>
                    <input 
                        type="text" 
                        id="date" 
                        bind:value={formData.date}
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500 transition"
                        placeholder="01/01/2568"
                    />
                </div>
                
                <div>
                    <label for="time" class="block text-sm font-medium text-gray-700 mb-1">เวลา (ชม:นาที)</label>
                    <input 
                        type="text" 
                        id="time" 
                        bind:value={formData.time}
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500 transition"
                        placeholder="14:30"
                    />
                </div>
                
                <div>
                    <label for="status" class="block text-sm font-medium text-gray-700 mb-1">สถานะ</label>
                    <select 
                        id="status" 
                        bind:value={formData.status}
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500 transition bg-white"
                    >
                        {#each STATUS_OPTIONS as status}
                            <option value={status}>{status}</option>
                        {/each}
                    </select>
                </div>
            </div>

            <div class="flex justify-end pt-4 space-x-3 border-t">
                <button 
                    type="button" 
                    on:click={toggleForm}
                    class="px-5 py-2 text-gray-600 font-semibold rounded-lg hover:bg-gray-100 transition duration-150"
                    disabled={isSubmitting}
                >
                    ยกเลิก
                </button>
                <button 
                    type="submit" 
                    class="px-5 py-2 bg-orange-600 text-white font-semibold rounded-lg shadow-md hover:bg-orange-700 transition duration-150 flex items-center space-x-2 disabled:bg-gray-400"
                    disabled={isSubmitting}
                >
                    {#if isSubmitting}
                        <svg class="animate-spin h-5 w-5 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                        </svg>
                        <span>กำลังบันทึก...</span>
                    {:else}
                        <span>บันทึก</span>
                    {/if}
                </button>
            </div>
        </form>
    </div>
</div>
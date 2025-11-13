<script>
    import { onMount } from 'svelte';
    import { db } from '$lib/firebase';
    import { collection, query, orderBy, onSnapshot, deleteDoc, doc, updateDoc, where } from 'firebase/firestore'; 
    import Header from '$lib/components/Header.svelte';
    import AddLogForm from '$lib/components/AddLogForm.svelte';
    import LineChart from '$lib/components/LineChart.svelte'; // 💡 เปลี่ยนจาก BarChart เป็น LineChart
    import Toast from '$lib/components/Toast.svelte'; 
    import { showToast } from '$lib/stores/toast'; 

    // ----------------------------------------------------
    // 🌟 ตัวแปร State
    // ----------------------------------------------------
    let isFormOpen = false; 
    let dataToEdit = null; 
    let workLogs = []; 
    let loadingData = true; 
    
    // State สำหรับการ Filter
    let selectedStatus = 'ทั้งหมด'; 
    const STATUS_OPTIONS = ['ทั้งหมด', 'ดำเนินการ', 'เสร็จสิ้น'];
    
    // ----------------------------------------------------
    // 📝 ฟังก์ชันเปิด/ปิดฟอร์ม
    // ----------------------------------------------------
    const toggleForm = (data = null) => {
        dataToEdit = data; 
        isFormOpen = !isFormOpen;
    };
    
    // ----------------------------------------------------
    // 📝 ฟังก์ชันกำหนดสีตามสถานะ
    // ----------------------------------------------------
    const statusColor = (status) => {
        switch (status) {
            case 'เสร็จสิ้น':
                return 'bg-green-100 text-green-700 border-green-400';
            case 'ดำเนินการ':
                return 'bg-yellow-100 text-yellow-700 border-yellow-400';
            default:
                return 'bg-gray-100 text-gray-700 border-gray-400';
        }
    };
    
    // ----------------------------------------------------
    // 📝 CRUD: อ่านข้อมูลจาก Firestore แบบ Real-time (พร้อม Filter Logic)
    // ----------------------------------------------------
    let unsubscribe; 
    
    // Re-run Query เมื่อ selectedStatus เปลี่ยน
    $: {
        if (unsubscribe) {
            unsubscribe(); 
        }

        loadingData = true;
        workLogs = []; 

        let q;
        if (selectedStatus === 'ทั้งหมด') {
            q = query(collection(db, 'worklogs'), orderBy('createdAt', 'desc'));
        } else {
            q = query(
                collection(db, 'worklogs'), 
                where('status', '==', selectedStatus), 
                orderBy('createdAt', 'desc')
            );
        }
        
        unsubscribe = onSnapshot(q, (querySnapshot) => {
            const logs = [];
            querySnapshot.forEach((doc) => {
                logs.push({ 
                    id: doc.id, 
                    ...doc.data() 
                });
            });
            workLogs = logs;
            loadingData = false;
        }, (error) => {
            console.error("Error fetching documents: ", error);
            loadingData = false;
        });
    }

    onMount(() => {
        return () => {
            if (unsubscribe) {
                unsubscribe();
            }
        };
    });
    
    // ----------------------------------------------------
    // 📝 CRUD: ลบข้อมูล (ใช้ showToast แทน alert)
    // ----------------------------------------------------
    const handleDelete = async (id) => {
        if (confirm('คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้?')) {
            try {
                await deleteDoc(doc(db, 'worklogs', id));
                showToast('ลบรายการเรียบร้อยแล้ว!', 'success');
            } catch (e) {
                console.error("Error deleting document: ", e);
                showToast('ไม่สามารถลบรายการได้', 'error');
            }
        }
    };
    
    // ----------------------------------------------------
    // 📝 CRUD: อัพเดทสถานะ (ใช้ showToast แทน alert)
    // ----------------------------------------------------
    const handleUpdateStatus = async (id) => {
        if (confirm('ยืนยันการอัพเดทสถานะเป็น "เสร็จสิ้น" ใช่หรือไม่?')) {
            try {
                const logRef = doc(db, 'worklogs', id);
                await updateDoc(logRef, {
                    status: 'เสร็จสิ้น',
                    updatedAt: new Date()
                });
                showToast('อัพเดทสถานะเป็น "เสร็จสิ้น" เรียบร้อยแล้ว!', 'success');
            } catch (e) {
                console.error("Error updating status: ", e);
                showToast('ไม่สามารถอัพเดทสถานะได้', 'error');
            }
        }
    };
    
    // ----------------------------------------------------
    // 📝 ฟังก์ชันเปิดฟอร์มแก้ไข
    // ----------------------------------------------------
    const handleEdit = (log) => {
        toggleForm(log); 
    };
    
    // ----------------------------------------------------
    // 📊 ฟังก์ชันเตรียมข้อมูลสำหรับกราฟ (Line Chart)
    // ----------------------------------------------------
    $: dailyData = workLogs.reduce((acc, log) => {
        const date = log.date; 
        acc[date] = (acc[date] || 0) + 1;
        return acc;
    }, {});

    $: sortedDates = Object.keys(dailyData).sort((a, b) => {
        const [dayA, monthA, yearA] = a.split('/').map(Number);
        const [dayB, monthB, yearB] = b.split('/').map(Number);
        const dateA = new Date(yearA + 2500, monthA - 1, dayA); 
        const dateB = new Date(yearB + 2500, monthB - 1, dayB);
        return dateA - dateB;
    });

    $: chartLabels = sortedDates.slice(-7); 
    $: chartData = chartLabels.map(date => dailyData[date]);

    $: lineChartData = { // 💡 เปลี่ยนชื่อตัวแปร
        labels: chartLabels,
        datasets: [
            {
                label: 'จำนวนงาน',
                data: chartData,
                // 💡 ปรับแต่งสีสำหรับ Line Chart
                backgroundColor: 'rgba(249, 115, 22, 0.2)', // พื้นหลังโปร่งแสง
                borderColor: 'rgb(249, 115, 22)', // เส้นสีส้มเข้ม
                borderWidth: 3,
                fill: true, // เติมสีใต้เส้น
                tension: 0.4
            }
        ]
    };

    $: chartOptions = {
        responsive: true,
        maintainAspectRatio: false, 
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: false,
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    precision: 0 
                }
            }
        }
    };

</script>

<div class="space-y-8">
    <Header openForm={() => toggleForm(null)} /> 
    
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div class="lg:col-span-2 space-y-4">
                
                <div class="flex justify-between items-center border-b pb-2">
                    <h2 class="text-xl font-bold text-gray-700">รายการบันทึกการทำงาน ({workLogs.length} รายการ)</h2>
                    
                    <div class="flex items-center space-x-2">
                        <label for="status-filter" class="text-sm font-medium text-gray-600">สถานะ:</label>
                        <select 
                            id="status-filter"
                            bind:value={selectedStatus}
                            class="px-3 py-1 border border-gray-300 rounded-lg text-sm bg-white focus:ring-orange-500 focus:border-orange-500 transition"
                        >
                            {#each STATUS_OPTIONS as status}
                                <option value={status}>{status}</option>
                            {/each}
                        </select>
                    </div>
                </div>
                
                {#if loadingData}
                    <div class="flex items-center justify-center p-8 bg-white rounded-lg shadow-inner">
                        <svg class="animate-spin h-5 w-5 mr-3 text-orange-600" viewBox="0 0 24 24"></svg>
                        <span class="text-gray-600">กำลังโหลดข้อมูลจาก Firestore...</span>
                    </div>
                {:else}
                    {#each workLogs as log}
                        <div class="bg-white rounded-xl shadow-md overflow-hidden transition duration-300 hover:shadow-lg">
                            <div class="flex justify-between items-center p-4 border-b bg-gray-50">
                                <span class="text-lg font-bold {log.type === 'ประชุม' ? 'text-blue-600' : log.type === 'แก้ไข' ? 'text-red-600' : 'text-purple-600'}">
                                    {log.type}
                                </span>
                                <span class="text-sm text-gray-500 font-medium">
                                    {log.section}
                                </span>
                            </div>

                            <div class="p-4 space-y-3">
                                <p class="text-gray-800"><span class="font-semibold w-20 inline-block">รายการ:</span> {log.item}</p>
                                <p class="text-gray-800"><span class="font-semibold w-20 inline-block">สาเหตุ:</span> {log.cause || '-'}</p>
                                <p class="text-gray-800"><span class="font-semibold w-20 inline-block">การแก้ไข:</span> {log.solution || '-'}</p>
                            </div>

                            <div class="flex justify-end p-4 border-t space-x-2">
                                <button on:click={() => handleDelete(log.id)} class="p-2 text-red-500 hover:bg-red-50 rounded-full transition" title="ลบรายการ">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                                    </svg>
                                </button>
                                
                                <button on:click={() => handleEdit(log)} class="p-2 text-blue-500 hover:bg-blue-50 rounded-full transition" title="แก้ไขรายการ">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zm-5.042 5.042L6.172 17.828a1 1 0 00.158.498l1.66 1.66a1 1 0 00.707 0l9.333-9.333-2.828-2.828-8.58 8.58z" />
                                    </svg>
                                </button>
                                
                                {#if log.status === 'ดำเนินการ'}
                                    <button on:click={() => handleUpdateStatus(log.id)} class="p-2 text-orange-500 hover:bg-orange-50 rounded-full transition" title="ทำเครื่องหมายว่าเสร็จสิ้น">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                                        </svg>
                                    </button>
                                {/if}
                            </div>

                            <div class="flex justify-between items-center p-4 border-t">
                                <div class="text-sm text-gray-500 space-x-3">
                                    <span>📅 {log.date}</span>
                                    <span>⏱️ {log.time}</span>
                                </div>
                                <span class="px-3 py-1 text-xs font-semibold rounded-full border {statusColor(log.status)}">
                                    {log.status}
                                </span>
                            </div>
                        </div>
                    {:else}
                        <div class="text-center text-gray-500 p-10 bg-white rounded-xl shadow-md border-2 border-dashed border-gray-200">
                            <svg class="h-10 w-10 text-gray-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p class="mt-2 text-base font-semibold text-gray-900">
                                {#if selectedStatus === 'ทั้งหมด'}
                                    ยังไม่มีรายการบันทึกงาน
                                {:else}
                                    ไม่พบรายการในสถานะ "{selectedStatus}"
                                {/if}
                            </p>
                            <p class="mt-1 text-sm text-gray-500">
                                กรุณาเพิ่มรายการใหม่ หรือลองเปลี่ยน Filter สถานะ
                            </p>
                        </div>
                    {/each}
                {/if}
            </div>
            
            <div class="lg:col-span-1">
                <h2 class="text-xl font-bold text-gray-700 border-b pb-2 mb-4">สถิติการทำงานรายวัน (7 วันล่าสุด)</h2>
                <div class="bg-white rounded-xl shadow-md p-6 h-[400px]"> 
                    {#if chartData.length > 0}
                        <LineChart data={lineChartData} options={chartOptions} /> {:else}
                        <div class="h-full flex items-center justify-center text-gray-500">
                            <p>เพิ่มรายการเพื่อแสดงสถิติ</p>
                        </div>
                    {/if}
                </div>
            </div>
        </div>
    </div>
</div>

{#if isFormOpen}
    <AddLogForm {toggleForm} {dataToEdit} />
{/if}

<Toast />
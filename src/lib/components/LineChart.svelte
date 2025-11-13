<script>
    import { onMount } from 'svelte';
    import { Chart, registerables } from 'chart.js';
    import 'chartjs-adapter-date-fns'; // อะแดปเตอร์สำหรับจัดการเวลา (แม้จะใช้ Label string แต่ควรมีไว้)

    // ลงทะเบียน Chart.js components
    Chart.register(...registerables);

    export let data;
    export let options;

    let canvasElement;
    let chartInstance = null;

    onMount(() => {
        const ctx = canvasElement.getContext('2d');
        
        chartInstance = new Chart(ctx, {
            type: 'line', // 💡 เปลี่ยนจาก 'bar' เป็น 'line'
            data: data,
            options: {
                ...options,
                // ปรับแต่ง Line Chart Options เพิ่มเติม
                scales: {
                    x: {
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        beginAtZero: true,
                        ticks: {
                            precision: 0 // จำนวนเต็ม
                        },
                        // เพิ่มเส้นกริดแนวนอน
                        grid: {
                            color: 'rgba(200, 200, 200, 0.2)'
                        }
                    }
                },
                elements: {
                    line: {
                        tension: 0.4, // ทำให้กราฟเส้นโค้งมน
                        borderWidth: 3 // ความหนาของเส้น
                    },
                    point: {
                        radius: 5, // ขนาดจุด
                        hoverRadius: 7
                    }
                }
            }
        });

        // อัปเดตข้อมูลเมื่อมีการเปลี่ยนแปลง
        $: if (chartInstance && data) {
            chartInstance.data = data;
            chartInstance.options = { ...chartInstance.options, ...options };
            chartInstance.update();
        }

        return () => {
            if (chartInstance) {
                chartInstance.destroy();
            }
        };
    });
</script>

<div class="h-full w-full">
    <canvas bind:this={canvasElement}></canvas>
</div>
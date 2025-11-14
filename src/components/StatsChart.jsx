import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// ลงทะเบียน Components ที่จำเป็นของ Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

/**
 * StatsChart Component
 * แสดงกราฟเส้นเปรียบเทียบจำนวนงานในแต่ละวัน
 * @param {array} worklogs - รายการบันทึกงานทั้งหมดจาก Firestore
 */
const StatsChart = ({ worklogs }) => {
  
  // 1. ประมวลผลข้อมูล: นับจำนวนงานในแต่ละวัน
  const dailyCounts = worklogs.reduce((acc, log) => {
    // ใช้ 'date' เป็น key
    const dateKey = log.date; 
    acc[dateKey] = (acc[dateKey] || 0) + 1;
    return acc;
  }, {});

  // 2. จัดเรียง Keys (วันที่) เพื่อให้กราฟเรียงตามลำดับเวลา
  // เนื่องจากข้อมูลมาในรูปแบบ dd/mm/yy (พ.ศ.), การเรียงด้วย String อาจไม่ถูกต้องทั้งหมด
  // แต่สำหรับข้อมูลจำนวนน้อย เราจะใช้ Keys ตามที่มันถูกสร้างขึ้นมาก่อน
  const labels = Object.keys(dailyCounts).sort();

  // 3. สร้าง Data Sets
  const data = {
    labels,
    datasets: [
      {
        label: 'จำนวนงานที่บันทึก',
        data: labels.map(label => dailyCounts[label]),
        borderColor: 'rgb(79, 70, 229)', // indigo-600
        backgroundColor: 'rgba(79, 70, 229, 0.5)', 
        tension: 0.3, // ทำให้กราฟดูโค้งมน
      },
    ],
  };

  // 4. ตั้งค่า Options ของกราฟ
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'จำนวนงานที่บันทึกรายวัน',
        font: {
            size: 14
        }
      },
    },
    scales: {
        y: {
            beginAtZero: true,
            title: {
                display: true,
                text: 'จำนวนงาน'
            },
            // แสดงผลเป็นจำนวนเต็มเท่านั้น
            ticks: {
                callback: function(value) { if (value % 1 === 0) { return value; } }
            }
        },
        x: {
            title: {
                display: true,
                text: 'วันที่ (DD/MM/YY)'
            }
        }
    }
  };

  if (worklogs.length === 0) {
    return (
        <div className="text-center text-gray-500 py-10">
            ไม่มีข้อมูลการทำงานสำหรับแสดงสถิติ
        </div>
    );
  }

  return (
    <div className="relative h-64">
      <Line options={options} data={data} />
    </div>
  );
};

export default StatsChart;
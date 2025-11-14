import React from 'react';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels'; 

// ลงทะเบียน Components และ Plugin
ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels); 

/**
 * DepartmentPieChart Component
 * แสดงกราฟวงกลมเปรียบเทียบจำนวนรายงานของส่วน/ฝ่าย พร้อมแสดงตัวเลข (ปรับปรุงการแสดงผล)
 * @param {array} worklogs - รายการบันทึกงานทั้งหมด
 */
const DepartmentPieChart = ({ worklogs }) => {
    
  const departmentCounts = worklogs.reduce((acc, log) => {
    const deptKey = log.department || 'ไม่ระบุฝ่าย'; 
    acc[deptKey] = (acc[deptKey] || 0) + 1;
    return acc;
  }, {});

  const labels = Object.keys(departmentCounts);
  const dataCounts = labels.map(label => departmentCounts[label]);

  // ปรับปรุงชุดสีให้หลากหลายและดูน่าสนใจยิ่งขึ้น
  const vibrantColors = [
    '#6366F1', // Indigo 500
    '#EF4444', // Red 500
    '#F59E0B', // Amber 500
    '#10B981', // Emerald 500
    '#8B5CF6', // Violet 500
    '#3B82F6', // Blue 500
    '#EC4899', // Pink 500
    '#A855F7', // Purple 500
    '#EAB308', // Yellow 500
    '#06B6D4', // Cyan 500
    '#F97316', // Orange 500
    '#6B7280', // Gray 500
  ];
  const backgroundColors = vibrantColors.map(color => `${color}B3`); // เพิ่ม Alpha (ความโปร่งใส)
  const borderColors = vibrantColors; // ใช้สีเต็มสำหรับขอบ

  const data = {
    labels: labels,
    datasets: [
      {
        label: 'จำนวนรายงาน',
        data: dataCounts,
        backgroundColor: backgroundColors.slice(0, labels.length),
        borderColor: borderColors.slice(0, labels.length),
        borderWidth: 1,
      },
    ],
  };
  
  const totalLogs = dataCounts.reduce((sum, value) => sum + value, 0);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right', // แสดง Legend ด้านขวา
        labels: {
            font: {
                size: 12 // ปรับขนาด Legend Font
            }
        }
      },
      title: {
        display: true,
        text: 'สถิติจำนวนรายงานแยกตามส่วน/ฝ่าย',
        font: {
            size: 14,
            weight: 'bold' // ทำให้ Title เป็นตัวหนา
        },
        padding: {
            top: 10,
            bottom: 20 // เพิ่มระยะห่างระหว่าง Title กับกราฟ
        }
      },
      datalabels: {
        color: '#fff', // สีตัวอักษรเป็นสีขาว (ชัดเจนกว่าบนสีเข้ม)
        textShadowBlur: 4, 
        textShadowColor: 'rgba(0, 0, 0, 0.6)', 
        font: {
          weight: 'bold',
          size: 12, // ปรับขนาด Font ของ Data Label
        },
        // ปรับ formatter ให้แสดงค่าและเปอร์เซ็นต์บนบรรทัดเดียวกัน
        formatter: (value, context) => {
          const percentage = ((value / totalLogs) * 100).toFixed(1);
          // แสดงเฉพาะเปอร์เซ็นต์หากค่ามีน้อยมาก หรือพื้นที่กราฟเล็ก
          if (value < (totalLogs * 0.05) && context.chart.width < 400) { // ตัวอย่างเกณฑ์
            return `${percentage}%`;
          }
          return `${value} (${percentage}%)`; 
        },
        // ตำแหน่งของ label: 'outside' จะพยายามวางนอกชิ้นส่วนวงกลม
        // หรือ 'start' / 'end' / 'center' สำหรับวางภายใน
        anchor: 'center', // ตำแหน่งจุดอ้างอิงของ label: center, start, end
        align: 'center', // การจัดเรียงข้อความ: center, start, end
        offset: 0, // ชดเชยตำแหน่งจาก anchor
        
        // เพิ่ม logic เพื่อจัดการการซ้อนทับ: hide labels ที่ซ้อนทับ
        display: function(context) {
            // แสดงเฉพาะ label ที่มีขนาดใหญ่พอ หรือมีเปอร์เซ็นต์ที่สำคัญ
            const dataset = context.dataset;
            const value = dataset.data[context.dataIndex];
            const percentage = ((value / totalLogs) * 100);
            return percentage > 3; // แสดง label เมื่อเปอร์เซ็นต์มากกว่า 3%
        }
      },
      tooltip: { 
        callbacks: {
            label: function(context) {
                let label = context.label || '';
                if (label) {
                    label += ': ';
                }
                if (context.parsed !== null) {
                    const currentValue = context.parsed;
                    const percentage = ((currentValue/totalLogs) * 100).toFixed(1) + '%';
                    label += `${currentValue} รายการ (${percentage})`;
                }
                return label;
            }
        },
        // ตำแหน่ง tooltip ให้ดีขึ้นบนมือถือ
        position: 'nearest', 
        mode: 'index',
        intersect: false,
      }
    },
    layout: {
        padding: {
            left: 10,
            right: 10,
            top: 0,
            bottom: 10
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
    <div className="relative h-64 flex justify-center items-center">
      <div className="w-full h-full p-2"> {/* ลด padding เพื่อเพิ่มพื้นที่กราฟ */}
        <Pie options={options} data={data} />
      </div>
    </div>
  );
};

export default DepartmentPieChart;
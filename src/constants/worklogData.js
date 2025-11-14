/**
 * ข้อมูล Utility สำหรับ WorkLog-Pro
 * ใช้กำหนดค่าคงที่ต่างๆ ที่ใช้ในแบบฟอร์มและการแสดงผล
 */

// ส่วน/ฝ่าย
export const DEPARTMENTS = [
    { value: 'it', label: 'เทคโนโลยีสารสนเทศ' },
    { value: 'plan', label: 'แผนงาน' },
    { value: 'supply', label: 'พัสดุ' },
    { value: 'admin', label: 'บริหาร' },
    { value: 'finance', label: 'การเงิน' },
    { value: 'account', label: 'บัญชี' },
    { value: 'construction', label: 'ก่อสร้าง' },
    { value: 'mechanic', label: 'ช่างกล' },
    { value: 'survey_design', label: 'สำรวจและออกแบบ' },
    { value: 'small_meeting', label: 'ห้องประชุมเล็ก(ชั้น2)' },
    { value: 'large_meeting', label: 'ห้องประชุมใหญ่(ขั้น3)' },
];

// ประเภทงาน
export const WORK_TYPES = [
    { value: 'edit', label: 'แก้ไข' },
    { value: 'install', label: 'ติดตั้ง' },
    { value: 'meeting', label: 'ประชุม' },
];

// สถานะงาน (รวมถึงสี Tailwind สำหรับการ์ด)
export const STATUS_OPTIONS = {
    'inprogress': { label: 'ดำเนินการ', color: 'bg-yellow-500', icon: '⏳' }, // ค่าเริ่มต้น
    'completed': { label: 'เสร็จสิ้น', color: 'bg-green-500', icon: '✅' },
};

// สถานะเริ่มต้น
export const DEFAULT_STATUS = 'inprogress';

// วันที่ปัจจุบันในรูปแบบไทย (dd/mm/yy)
export const getThaiDate = (date = new Date()) => {
    const d = date;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    // ปี พ.ศ. (ปี ค.ศ. + 543)
    const yearBE = String(d.getFullYear() + 543).slice(2); 
    return `${day}/${month}/${yearBE}`;
};

// เวลาปัจจุบันในรูปแบบไทย (HH.mm น.)
export const getThaiTime = (date = new Date()) => {
    const d = date;
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${hours}.${minutes} น.`;
};
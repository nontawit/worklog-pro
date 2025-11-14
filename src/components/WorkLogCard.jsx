import React from 'react';
import { FaEdit, FaTrash, FaCheckCircle } from 'react-icons/fa';
import { STATUS_OPTIONS, getThaiDate, getThaiTime, DEPARTMENTS, WORK_TYPES } from '../constants/worklogData';
import { deleteWorkLog, updateWorkLog } from '../firebase/config';

/**
 * WorkLogCard Component
 * แสดงข้อมูลรายการบันทึกงานในรูปแบบของการ์ด พร้อมปุ่มควบคุม
 */
const WorkLogCard = ({ log, onEdit }) => {
  // ดึงข้อมูลสถานะและสี
  const statusInfo = STATUS_OPTIONS[log.status] || STATUS_OPTIONS['inprogress'];
  
  // แปลงค่าสถานะเป็น "ดำเนินการ" หรือ "เสร็จสิ้น"
  const statusLabel = statusInfo.label;

  // ฟังก์ชันสำหรับการลบข้อมูล
  const handleDeleteLog = async () => {
    if (window.confirm(`คุณแน่ใจหรือไม่ที่จะลบรายการ "${log.item}"?`)) {
      try {
        await deleteWorkLog(log.id);
        alert("ลบรายการเรียบร้อยแล้ว");
      } catch (error) {
        alert(error.message || "ไม่สามารถลบรายการได้");
      }
    }
  };
  
  // ฟังก์ชันสำหรับการอัพเดทสถานะเป็น "เสร็จสิ้น"
  const handleUpdateStatus = async () => {
    if (log.status === 'completed') {
        alert("รายการนี้เสร็จสิ้นแล้ว");
        return;
    }
    
    if (window.confirm(`คุณแน่ใจหรือไม่ที่จะอัพเดทสถานะของรายการ "${log.item}" เป็น 'เสร็จสิ้น'?`)) {
        try {
            // อัพเดทเฉพาะ Field 'status'
            await updateWorkLog(log.id, { status: 'completed' });
            alert("อัพเดทสถานะเป็น 'เสร็จสิ้น' เรียบร้อยแล้ว");
        } catch (error) {
            alert(error.message || "ไม่สามารถอัพเดทสถานะได้");
        }
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition duration-300">
      
      {/* 1. ส่วนหัวของการ์ด (แสดงประเภทงาน และแผนก) */}
      <div className={`p-3 flex justify-between items-center ${statusInfo.color} text-white`}>
        <span className="font-bold text-lg">{log.type}</span>
        <span className="text-sm font-medium bg-white bg-opacity-30 px-3 py-1 rounded-full">{log.department}</span>
      </div>

      {/* 2. ส่วนข้อมูล */}
      <div className="p-4 space-y-3">
        
        {/* รายการ */}
        <div>
          <h3 className="text-gray-800 font-semibold mb-1">รายการ:</h3>
          <p className="text-gray-600 pl-4 border-l-4 border-indigo-400">{log.item}</p>
        </div>
        
        {/* สาเหตุ */}
        <div>
          <h3 className="text-gray-800 font-semibold mb-1">สาเหตุ:</h3>
          <p className="text-gray-600 text-sm pl-4 border-l-4 border-gray-300 whitespace-pre-line">{log.reason}</p>
        </div>
        
        {/* การแก้ไข */}
        <div>
          <h3 className="text-gray-800 font-semibold mb-1">การแก้ไข:</h3>
          <p className="text-gray-600 text-sm pl-4 border-l-4 border-gray-300 whitespace-pre-line">{log.solution}</p>
        </div>
        
        {/* ปุ่มดำเนินการ (ลบ, แก้ไข, อัพเดทสถานะ) */}
        <div className="flex justify-end space-x-3 pt-3 border-t mt-4">
          
          {/* ปุ่มลบ */}
          <button
            onClick={handleDeleteLog}
            className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition"
            title="ลบข้อมูล"
          >
            <FaTrash size={18} />
          </button>
          
          {/* ปุ่มแก้ไข (เปิดป็อปอัพแบบฟอร์ม) */}
          <button
            onClick={() => onEdit(log)}
            className="text-indigo-500 hover:text-indigo-700 p-2 rounded-full hover:bg-indigo-50 transition"
            title="แก้ไขข้อมูล"
          >
            <FaEdit size={18} />
          </button>

          {/* ปุ่มอัพเดทสถานะ (จาก ดำเนินการ เป็น เสร็จสิ้น) */}
          <button
            onClick={handleUpdateStatus}
            className={`p-2 rounded-full transition ${log.status === 'completed' 
                ? 'text-green-500 cursor-default' // เสร็จสิ้นแล้ว
                : 'text-gray-500 hover:text-green-700 hover:bg-green-50'
            }`}
            title={log.status === 'completed' ? 'เสร็จสิ้นแล้ว' : 'อัพเดทสถานะเป็น เสร็จสิ้น'}
            disabled={log.status === 'completed'}
          >
            <FaCheckCircle size={18} />
          </button>
        </div>
      </div>

      {/* 3. ส่วนท้าย (แสดง วันที่, เวลา, สถานะ) */}
      <div className="p-4 bg-gray-50 flex justify-between items-center text-sm border-t">
        <div className="text-gray-500">
          🗓️ {log.date} | ⏱️ {log.time}
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${log.status === 'completed' ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'}`}>
          {statusLabel}
        </div>
      </div>
    </div>
  );
};

export default WorkLogCard;
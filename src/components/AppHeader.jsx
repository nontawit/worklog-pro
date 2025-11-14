import React from 'react';
import { FaPlus } from 'react-icons/fa';

/**
 * AppHeader Component
 * แสดงโลโก้, ชื่อโปรแกรม, และปุ่มเพิ่มรายการ
 * @param {function} onOpenModal - ฟังก์ชันสำหรับเปิด Popup Form
 */
const AppHeader = ({ onOpenModal }) => {
  return (
    <header className="bg-white shadow-md p-4 rounded-xl flex justify-between items-center mb-6">
      {/* ส่วนโลโก้และชื่อโปรแกรม */}
      <div className="flex items-center space-x-3">
        <img 
          src="/NTW_Logo.png" // <--- ชี้ไปที่ไฟล์ในโฟลเดอร์ public
          alt="NTW_Logo" 
          className="size-20 object-contain" 
        />
        
        <div>
          <h1 className="text-xl font-bold text-gray-800">WorkLog-Pro</h1>
          <p className="text-sm text-gray-500 hidden sm:block">ระบบบันทึกการทำงานส่วนบุคคล</p>
        </div>
      </div>

      {/* ปุ่มเพิ่มรายการ */}
      <button
        onClick={onOpenModal}
        className="flex items-center bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition duration-200 shadow-lg transform hover:scale-[1.01]"
      >
        <FaPlus className="mr-2" />
        เพิ่มรายการ
      </button>
    </header>
  );
};

export default AppHeader;
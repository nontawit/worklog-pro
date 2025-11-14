import React from 'react';
import { FaPlus, FaChartBar, FaThList } from 'react-icons/fa';

/**
 * AppHeader Component
 * แสดงโลโก้, ชื่อโปรแกรม, และปุ่มนำทางหลัก (Icon-only)
 * @param {function} onOpenModal - ฟังก์ชันสำหรับเปิด Popup Form
 * @param {string} currentView - View ที่กำลังแสดงอยู่ ('today', 'stats', 'all')
 * @param {function} onChangeView - ฟังก์ชันสำหรับเปลี่ยน View
 */
const AppHeader = ({ onOpenModal, currentView, onChangeView }) => {
    
  // Fixed Header Style: fixed top-0 left-0 right-0 z-10
  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow-xl p-4 z-10">
      <div className="container mx-auto max-w-7xl flex justify-between items-center">
        
        {/* ส่วนโลโก้และชื่อโปรแกรม (คลิกที่นี่เพื่อกลับหน้าหลัก) */}
        <div 
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => onChangeView('today')}
        >
          {/* ใช้ <img src="/worklog-logo.png"> ตามที่ตกลงกันไว้ */}
          <img 
            src="/NTW_Logo.png" 
            alt="NTW_Logo.png" 
            className="size-16 object-contain" 
          />
          <div>
            <h1 className="text-xl font-bold text-gray-800">WorkLog-Pro</h1>
            <p className="text-sm text-gray-500 hidden sm:block">ระบบบันทึกการทำงานส่วนบุคคล</p>
          </div>
        </div>

        {/* ปุ่มนำทางและปุ่มเพิ่มรายการ (Icon-only) */}
        <div className="flex space-x-3">
            
          {/* ปุ่มแสดงข้อมูลทั้งหมด (ไอคอนเอกสาร) */}
          <button
            onClick={() => onChangeView('all')}
            title="ข้อมูลบันทึกทั้งหมด"
            className={`p-3 rounded-full transition duration-200 ${
              currentView === 'all' 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <FaThList className="text-lg" />
          </button>
            
          {/* ปุ่มแสดงหน้าสถิติ (ไอคอน database/กราฟ) */}
          <button
            onClick={() => onChangeView('stats')}
            title="หน้าสถิติ"
            className={`p-3 rounded-full transition duration-200 ${
              currentView === 'stats' 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <FaChartBar className="text-lg" />
          </button>
            
          {/* ปุ่มเพิ่มรายการใหม่ (ไอคอน +) */}
          <button
            onClick={onOpenModal} // ไม่จำเป็นต้องเปลี่ยน View เมื่อเปิด Form
            title="เพิ่มข้อมูลใหม่"
            className="flex items-center bg-indigo-600 text-white p-3 rounded-full hover:bg-indigo-700 transition duration-200 shadow-lg transform hover:scale-[1.01]"
          >
            <FaPlus className="text-lg" />
          </button>
        </div>
        
      </div>
    </header>
  );
};

export default AppHeader;
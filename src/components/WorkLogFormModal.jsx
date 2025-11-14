import React, { useState, useEffect } from 'react';
import { FaTimes, FaCalendarAlt, FaClock, FaSave, FaBan } from 'react-icons/fa';
import { DEPARTMENTS, WORK_TYPES, getThaiDate, getThaiTime, DEFAULT_STATUS } from '../constants/worklogData';
// นำเข้าฟังก์ชันบันทึกจาก Firebase
import { addWorkLog, updateWorkLog } from '../firebase/config'; 

/**
 * WorkLogFormModal Component
 * Modal/Popup สำหรับเพิ่ม/แก้ไขรายการบันทึกงาน
 * @param {object} initialData - ข้อมูลเดิมสำหรับแก้ไข (ถ้ามี)
 */
const WorkLogFormModal = ({ isOpen, onClose, initialData }) => {
  // State สำหรับเก็บข้อมูลฟอร์ม
  const [formData, setFormData] = useState({
    date: getThaiDate(),
    time: getThaiTime(),
    department: DEPARTMENTS[0]?.value || '',
    type: WORK_TYPES[0]?.value || '',
    item: '',
    reason: '',
    solution: '',
    status: DEFAULT_STATUS,
  });

  // State สำหรับสถานะการบันทึก (success | error | null)
  const [saveStatus, setSaveStatus] = useState(null); 
  const [isSaving, setIsSaving] = useState(false); // ป้องกันการกดซ้ำ

  // Effect เพื่ออัพเดทค่าเริ่มต้นเมื่อ Modal ถูกเปิด
  useEffect(() => {
    if (isOpen) {
      // หากมี initialData (โหมดแก้ไข) ให้ใช้ข้อมูลนั้น
      if (initialData && initialData.id) {
        // ต้องแปลงค่า department/type กลับเป็น value (ถ้า initialData เก็บเป็น label)
        setFormData({
            id: initialData.id, // เก็บ ID สำหรับการ Update
            date: initialData.date,
            time: initialData.time,
            department: DEPARTMENTS.find(d => d.label === initialData.department)?.value || initialData.department,
            type: WORK_TYPES.find(t => t.label === initialData.type)?.value || initialData.type,
            item: initialData.item,
            reason: initialData.reason,
            solution: initialData.solution,
            status: initialData.status,
        });
      } else {
        // โหมดเพิ่มรายการใหม่
        setFormData({
            date: getThaiDate(),
            time: getThaiTime(),
            department: DEPARTMENTS[0]?.value || '',
            type: WORK_TYPES[0]?.value || '',
            item: '',
            reason: '',
            solution: '',
            status: DEFAULT_STATUS,
        });
      }
      setSaveStatus(null);
      setIsSaving(false);
    }
  }, [isOpen, initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    // 1. แปลงค่า Department และ Work Type กลับไปเป็น Label สำหรับเก็บ
    const dataToSave = {
        ...formData,
        department: DEPARTMENTS.find(d => d.value === formData.department)?.label || formData.department,
        type: WORK_TYPES.find(t => t.value === formData.type)?.label || formData.type,
    };
    
    // ลบ ID ออกจาก Object หากเป็นการเพิ่ม
    if (!dataToSave.id) {
        delete dataToSave.id;
    }

    try {
        let success;
        // 2. ตรวจสอบว่าเป็นโหมดแก้ไขหรือเพิ่มใหม่
        if (formData.id) {
            // โหมดแก้ไข: ส่งเฉพาะ fields ที่แก้ไข และ ID
            const { id, ...fieldsToUpdate } = dataToSave;
            success = await updateWorkLog(id, fieldsToUpdate);
        } else {
            // โหมดเพิ่มใหม่
            success = await addWorkLog(dataToSave);
        }

        if (success) {
            setSaveStatus('success');
        } else {
            setSaveStatus('error');
        }

    } catch (error) {
        setSaveStatus('error');
    } finally {
        setIsSaving(false);
        // หลังจากแสดงสถานะ 2 วินาที ค่อยปิด Modal
        setTimeout(() => {
            setSaveStatus(null);
            onClose(); 
        }, 2000); 
    }
  };
  
  if (!isOpen) return null;

  // ตรวจสอบว่าเป็นโหมดแก้ไขหรือไม่
  const isEditMode = initialData && initialData.id;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4 transition-opacity">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto transform scale-100 transition-transform">
        
        {/* ส่วนหัว Modal */}
        <div className="sticky top-0 bg-indigo-600 text-white p-4 rounded-t-xl flex justify-between items-center">
          <h2 className="text-xl font-bold">{isEditMode ? 'แก้ไขรายการบันทึกงาน' : 'เพิ่มรายการบันทึกงานใหม่'}</h2>
          <button onClick={onClose} className="text-white hover:text-gray-200 transition">
            <FaTimes size={20} />
          </button>
        </div>
        
        {/* ฟอร์มข้อมูล */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* แถว 1: วันที่ / เวลา */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* ช่องวันที่ */}
            <label className="block">
              <span className="text-gray-700 font-medium">วันที่ (DD/MM/YY)</span>
              <div className="relative mt-1">
                <input
                  type="text"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2 pr-10"
                  required
                />
                <FaCalendarAlt className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
              </div>
            </label>
            
            {/* ช่องเวลา */}
            <label className="block">
              <span className="text-gray-700 font-medium">เวลา (HH.mm น.)</span>
              <div className="relative mt-1">
                <input
                  type="text"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2 pr-10"
                  required
                />
                <FaClock className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
              </div>
            </label>
          </div>
          
          {/* แถว 2: ส่วน/ฝ่าย / ประเภทงาน */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* ช่องส่วน/ฝ่าย */}
            <label className="block">
              <span className="text-gray-700 font-medium">ส่วน / ฝ่าย</span>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2"
                required
              >
                {DEPARTMENTS.map(dept => (
                  <option key={dept.value} value={dept.value}>{dept.label}</option>
                ))}
              </select>
            </label>
            
            {/* ช่องประเภทงาน */}
            <label className="block">
              <span className="text-gray-700 font-medium">ประเภทงาน</span>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2"
                required
              >
                {WORK_TYPES.map(work => (
                  <option key={work.value} value={work.value}>{work.label}</option>
                ))}
              </select>
            </label>
          </div>

          {/* รายการ, สาเหตุ, การแก้ไข (เหมือนเดิม) */}
          {/* ... (เนื่องจากเป็นโค้ดเดิม ไม่ต้องใส่ซ้ำ) */}
          <label className="block">
            <span className="text-gray-700 font-medium">รายการ</span>
            <input
              type="text"
              name="item"
              value={formData.item}
              onChange={handleChange}
              placeholder="เช่น แก้ไขปัญหาเครื่องพิมพ์ Brother HL-L2375DW ที่แผนกบัญชี"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2"
              required
            />
          </label>
          
          <label className="block">
            <span className="text-gray-700 font-medium">สาเหตุ</span>
            <textarea
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              rows="2"
              placeholder="เช่น การตั้งค่าเครือข่ายมีการเปลี่ยนแปลง ทำให้ IP Address หลุด"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2"
              required
            ></textarea>
          </label>
          
          <label className="block">
            <span className="text-gray-700 font-medium">การแก้ไข</span>
            <textarea
              name="solution"
              value={formData.solution}
              onChange={handleChange}
              rows="3"
              placeholder="เช่น ทำการรีเซ็ตค่า IP Address ของเครื่องพิมพ์และกำหนดเป็น Static IP ใหม่"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2"
              required
            ></textarea>
          </label>
          
          {/* แถว 6: สถานะ (ไม่สามารถแก้ไขได้) */}
          <div className="block">
            <span className="text-gray-700 font-medium">สถานะ</span>
            <div className="mt-1 text-base p-2 bg-gray-100 rounded-md border border-gray-300 text-gray-600">
              {/* แสดงสถานะปัจจุบัน (ไม่ว่าจะเป็นโหมดเพิ่มหรือแก้ไข) */}
              {DEFAULT_STATUS === 'inprogress' ? 'ดำเนินการ' : 'เสร็จสิ้น'} {isEditMode ? '' : '(ค่าเริ่มต้น)'}
            </div>
          </div>
          
          {/* ส่วนปุ่มบันทึก/ยกเลิก */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex items-center bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition duration-200 shadow-md"
              disabled={isSaving}
            >
              <FaBan className="mr-2" />
              ยกเลิก
            </button>
            <button
              type="submit"
              className="flex items-center bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition duration-200 shadow-lg disabled:bg-green-400"
              disabled={isSaving}
            >
              <FaSave className="mr-2" />
              {isSaving ? 'กำลังบันทึก...' : 'บันทึก'}
            </button>
          </div>
        </form>
        
        {/* ป๊อปอัพแสดงสถานะการบันทึก */}
        {saveStatus && (
          <div className={`fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 transition-opacity duration-300`}>
            <div className={`p-6 rounded-lg shadow-xl text-white ${saveStatus === 'success' ? 'bg-indigo-600' : 'bg-red-600'} transform scale-100 transition-transform duration-300`}>
              {saveStatus === 'success' ? (
                <p className="font-bold text-lg">✅ บันทึกข้อมูลเรียบร้อยแล้ว!</p>
              ) : (
                <p className="font-bold text-lg">❌ ไม่สามารถบันทึกข้อมูลได้</p>
              )}
            </div>
          </div>
        )}
        
      </div>
    </div>
  );
};

export default WorkLogFormModal;
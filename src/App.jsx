import React, { useState, useEffect } from 'react';
import AppHeader from './components/AppHeader';
import WorkLogFormModal from './components/WorkLogFormModal';
import WorkLogCard from './components/WorkLogCard';
import StatsChart from './components/StatsChart';
import DepartmentPieChart from './components/DepartmentPieChart'; // <-- NEW
import { query, worklogsCol, orderBy, onSnapshot } from './firebase/config';

// Helper function: ดึงวันที่ปัจจุบันในรูปแบบ 'DD/MM/YY'
const getTodayDateFormatted = () => {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yy = String(today.getFullYear()).slice(-2);
    return `${dd}/${mm}/${yy}`;
};


const App = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [worklogs, setWorklogs] = useState([]);
  const [editingLog, setEditingLog] = useState(null); 
  // State สำหรับจัดการหน้าจอ: 'today' (หน้าหลัก), 'stats' (สถิติ), 'all' (ข้อมูลทั้งหมด)
  const [currentView, setCurrentView] = useState('today'); 
  
  // วันที่ปัจจุบันสำหรับกรองข้อมูล (DD/MM/YY)
  const todayDate = getTodayDateFormatted();

  // กรองข้อมูลสำหรับหน้า Home (Today's Logs)
  // **Note:** การเรียงลำดับเวลาล่าสุดก่อน ถูกจัดการโดย Firebase Query (orderBy("createdAt", "desc")) แล้ว
  // ดังนั้นเราแค่กรองว่า Field 'date' ต้องเป็นวันนี้
  const todayLogs = worklogs.filter(log => log.date === todayDate);

  // Handlers for Modal
  const handleOpenModal = () => {
    setEditingLog(null); 
    setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  const handleEdit = (log) => {
    setEditingLog(log);
    setIsModalOpen(true);
  };
  
  const handleChangeView = (view) => {
      setCurrentView(view);
  };

  // Hook สำหรับดึงข้อมูลจาก Firestore แบบ Realtime
  useEffect(() => {
    // Query: ดึงข้อมูลทั้งหมด เรียงตาม Timestamp ล่าสุด (createdAt)
    const logsQuery = query(
      worklogsCol, 
      orderBy("date", "desc"),      // Secondary sort: Old documents (string-based)
      orderBy("time", "desc")       // Tertiary sort: Old documents (string-based)
    );

    const unsubscribe = onSnapshot(logsQuery, (snapshot) => {
      const logsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setWorklogs(logsData);
    }, (error) => {
      console.error("Error fetching worklogs: ", error);
    });

    return () => unsubscribe();
  }, []); 
  
  // --- Component View Renderers ---
  
  const renderLogList = (logs, title) => (
    <section className="lg:col-span-3">
      <h2 className="text-2xl font-semibold text-gray-700 mb-4 border-b pb-2">
        {title}
      </h2>
      {logs.length > 0 ? (
        <div className="space-y-4">
          {logs.map(log => (
            <WorkLogCard 
              key={log.id} 
              log={log} 
              onEdit={handleEdit}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white p-8 text-center rounded-lg shadow-inner text-gray-500">
          ไม่มีการบันทึกงานสำหรับ {title.includes('วันนี้') ? 'วันนี้' : 'แสดง'}
        </div>
      )}
    </section>
  );

  const renderStatsView = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* คอลัมน์ 1: กราฟเส้น (จำนวนงานรายวัน) */}
        <div className="lg:col-span-1">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4 border-b pb-2">
              📊 สถิติจำนวนงานรายวัน
            </h2>
            <div className="bg-white p-6 rounded-xl shadow-lg h-80">
                <StatsChart worklogs={worklogs} />
            </div>
        </div>
        
        {/* คอลัมน์ 2: กราฟวงกลม (แยกตามส่วน/ฝ่าย) */}
        <div className="lg:col-span-1">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4 border-b pb-2">
              📋 สถิติแยกตามส่วน/ฝ่าย
            </h2>
            <div className="bg-white p-6 rounded-xl shadow-lg h-80">
                <DepartmentPieChart worklogs={worklogs} />
            </div>
        </div>
    </div>
  );

  // --- Main Render ---

  return (
    // เพิ่ม padding-top ให้ body เพื่อหลีกเลี่ยง Header ที่ถูกล็อกทับเนื้อหา
    <div className="min-h-screen bg-gray-50"> 
      
      {/* 1. ส่วนหัว (Header - Fixed) */}
      <AppHeader 
          onOpenModal={handleOpenModal} 
          currentView={currentView}
          onChangeView={handleChangeView}
      />

      {/* 2. ส่วนเนื้อหาหลัก (เพิ่ม pt-24 เพื่อชดเชย Fixed Header) */}
      <main className="container mx-auto max-w-7xl pt-32 p-4"> 
        
        {/* หน้าหลัก: แสดงเฉพาะงานของวันนี้ เรียงตามเวลาล่าสุดก่อน (โดยใช้ todayLogs) */}
        {currentView === 'today' && (
          <div className="grid grid-cols-1 gap-6">
            {renderLogList(todayLogs, `📝 รายการบันทึกงานของวันนี้ (${todayDate})`)}
          </div>
        )}
        
        {/* หน้าข้อมูลทั้งหมด: แสดงงานทั้งหมด เรียงตามเวลาล่าสุดก่อน (โดยใช้ worklogs ทั้งหมด) */}
        {currentView === 'all' && (
          <div className="grid grid-cols-1 gap-6">
            {renderLogList(worklogs, '📄 ข้อมูลบันทึกรายงานทั้งหมด')}
          </div>
        )}
        
        {/* หน้าสถิติ */}
        {currentView === 'stats' && (
          renderStatsView()
        )}
        
      </main>
      
      {/* Footer */}
      <footer className="text-center text-sm text-gray-500 mt-10 p-4">
        © {new Date().getFullYear()} WorkLog-Pro.
      </footer>
      
      {/* 3. Modal สำหรับเพิ่ม/แก้ไขข้อมูล */}
      <WorkLogFormModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        initialData={editingLog}
      />
    </div>
  );
};

export default App;
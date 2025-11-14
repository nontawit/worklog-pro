import React, { useState, useEffect } from 'react';
import AppHeader from './components/AppHeader';
import WorkLogFormModal from './components/WorkLogFormModal';
import WorkLogCard from './components/WorkLogCard';
import StatsChart from './components/StatsChart'; // <-- นำเข้า Component กราฟ
import { query, worklogsCol, orderBy, onSnapshot } from './firebase/config';

const App = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [worklogs, setWorklogs] = useState([]);
  const [editingLog, setEditingLog] = useState(null); 

  const handleOpenModal = () => {
    setEditingLog(null); 
    setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  const handleEdit = (log) => {
    setEditingLog(log);
    setIsModalOpen(true);
  };
  
  // (ฟังก์ชัน handleDelete และ handleUpdateStatus ถูกย้ายไปอยู่ใน WorkLogCard แล้ว)

  // Hook สำหรับดึงข้อมูลจาก Firestore แบบ Realtime
  useEffect(() => {
    // สร้าง Query: ดึงข้อมูลจาก Collection 'worklogs' เรียงตามวันที่และเวลา (ล่าสุดขึ้นก่อน)
    // Note: การเรียงตาม String 'DD/MM/YY' อาจไม่ถูกต้องตามลำดับเวลาเป๊ะๆ หากข้ามเดือน
    // แต่ใช้เพื่อการแสดงผลเบื้องต้นไปก่อน
   const logsQuery = query(worklogsCol, orderBy("createdAt", "desc"));

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

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <main className="container mx-auto max-w-7xl">
        
        {/* 1. ส่วนหัว (Header) */}
        <AppHeader onOpenModal={handleOpenModal} />

        {/* 2. ส่วนแสดงข้อมูลและการ์ด */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* 2.1 คอลัมน์หลัก: รายการบันทึกงาน */}
          <section className="lg:col-span-2">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4 border-b pb-2">
              📝 รายการบันทึกงาน
            </h2>
            
            {/* แสดงการ์ดบันทึกงาน */}
            {worklogs.length > 0 ? (
              <div className="space-y-4">
                {worklogs.map(log => (
                  <WorkLogCard 
                    key={log.id} 
                    log={log} 
                    onEdit={handleEdit}
                    // handleDelete และ handleUpdateStatus ถูกเรียกใช้ภายใน WorkLogCard โดยตรง
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white p-8 text-center rounded-lg shadow-inner text-gray-500">
                ยังไม่มีการบันทึกงานในระบบ
              </div>
            )}
            
          </section>

          {/* 2.2 คอลัมน์ด้านข้าง: ส่วนแสดงสถิติ (Stats Chart) */}
          <aside className="lg:col-span-1">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4 border-b pb-2">
              📊 สถิติการทำงาน
            </h2>
            {/* นำ StatsChart มาแทน Placeholder */}
            <div className="bg-white p-6 rounded-xl shadow-lg h-80">
                <StatsChart worklogs={worklogs} />
            </div>
          </aside>
        </div>

      </main>
      
      {/* Footer */}
      <footer className="text-center text-sm text-gray-500 mt-10">
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
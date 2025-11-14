// TODO: แทนที่ด้วยค่า Firebase config ของคุณเอง
// คุณสามารถหาค่าเหล่านี้ได้จาก Firebase Console > Project Settings

import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  deleteDoc, 
  doc, 
  updateDoc,
  serverTimestamp // <-- เพิ่มตัวนี้
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD4kqXr2A1ZpWJt9WyrERgQvjoezYAEvxs",
  authDomain: "worklog-pro-44bc1.firebaseapp.com",
  projectId: "worklog-pro-44bc1",
  storageBucket: "worklog-pro-44bc1.firebasestorage.app",
  messagingSenderId: "295703575773",
  appId: "1:295703575773:web:b71f7e50c86c9044caaf34"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

// Reference ไปยัง Collection หลัก
const worklogsCol = collection(db, "worklogs");

/**
 * ฟังก์ชันเพิ่มรายการบันทึกงานใหม่
 * @param {object} logData - ข้อมูลรายการบันทึกงานใหม่
 */
const addWorkLog = async (logData) => {
    try {
        // เพิ่ม timestamp สำหรับการเรียงลำดับที่แม่นยำ
        const dataWithTimestamp = {
            ...logData,
            createdAt: serverTimestamp() // ใช้ Firestore Server Timestamp
        };
        
        // เพิ่มเอกสารใหม่ใน Collection 'worklogs'
        const docRef = await addDoc(worklogsCol, dataWithTimestamp); // <-- ใช้ dataWithTimestamp
        console.log("Document written with ID: ", docRef.id);
        return true;
    } catch (e) {
        console.error("Error adding document: ", e);
        throw new Error("ไม่สามารถบันทึกข้อมูลได้ เนื่องจากมีข้อผิดพลาด");
    }
}

/**
 * ฟังก์ชันลบรายการบันทึกงาน
 * @param {string} id - Document ID ของรายการที่จะลบ
 */
const deleteWorkLog = async (id) => {
    try {
        await deleteDoc(doc(db, "worklogs", id));
        console.log("Document successfully deleted!");
        return true;
    } catch (e) {
        console.error("Error deleting document: ", e);
        throw new Error("ไม่สามารถลบข้อมูลได้");
    }
}

/**
 * ฟังก์ชันอัพเดทรายการบันทึกงาน
 * @param {string} id - Document ID ของรายการที่จะอัพเดท
 * @param {object} updatedFields - Field ที่ต้องการอัพเดท
 */
const updateWorkLog = async (id, updatedFields) => {
    try {
        const docRef = doc(db, "worklogs", id);
        await updateDoc(docRef, updatedFields);
        console.log("Document successfully updated!");
        return true;
    } catch (e) {
        console.error("Error updating document: ", e);
        throw new Error("ไม่สามารถแก้ไขข้อมูลได้");
    }
}


export { db, worklogsCol, addWorkLog, deleteWorkLog, updateWorkLog, query, orderBy, onSnapshot };
// src/lib/firebase.js

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// ----------------------------------------------------
// 🔥 1. โค้ดกระชับและอ่านง่าย: การตั้งค่า Firebase
// ----------------------------------------------------
const firebaseConfig = {
    apiKey: "AIzaSyD4kqXr2A1ZpWJt9WyrERgQvjoezYAEvxs", // แทนที่ด้วยค่าจริง
    authDomain: "worklog-pro-44bc1.firebaseapp.com",
    projectId: "worklog-pro-44bc1",
    storageBucket: "worklog-pro-44bc1.firebasestorage.app",
    messagingSenderId: "295703575773",
    appId: "1:295703575773:web:b71f7e50c86c9044caaf34"
};

// ----------------------------------------------------
// 🌟 2. อธิบายโค้ด:
// initializeApp: เริ่มต้นการเชื่อมต่อ Firebase ด้วยการตั้งค่าที่ระบุ
// getFirestore: ดึง Instance ของ Firestore Database
// ----------------------------------------------------
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ส่งออก (Export) Instance ของ Firestore เพื่อให้ Components อื่น ๆ ใช้งาน
export { db };
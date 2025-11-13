// src/lib/stores/toast.js

import { writable } from 'svelte/store';

// Default state: hidden
const defaultState = {
    message: '',
    type: 'success', // success, error, info
    show: false,
};

export const toast = writable(defaultState);

/**
 * ฟังก์ชันสำหรับแสดง Toast Notification
 * @param {string} message ข้อความที่ต้องการแสดง
 * @param {string} type ประเภทของการแจ้งเตือน ('success', 'error', 'info')
 * @param {number} duration ระยะเวลา (มิลลิวินาที) ก่อนซ่อน
 */
export function showToast(message, type = 'success', duration = 3000) {
    if (!message) return;

    toast.set({
        message,
        type,
        show: true,
    });

    // ซ่อนหลังจากระยะเวลาที่กำหนด
    setTimeout(() => {
        toast.set(defaultState);
    }, duration);
}
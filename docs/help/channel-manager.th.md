---
id: "channel-manager"
title: "Channel Manager (ระบบเชื่อมต่อ OTA)"
icon: "Globe"
order: 2
---

# คู่มือการใช้งาน Channel Manager

เชื่อมต่อห้องพักของคุณกับ OTA อย่าง Agoda, Booking.com และ Expedia ด้วย Two-Way Channel Manager ของเรา

### 🎯 Channel Manager คืออะไร?
* ตัดจำนวนห้องพักอัตโนมัติเมื่อมีการจองผ่าน OTA
* คืนจำนวนห้องพักหากมีการยกเลิกการจอง
* ป้องกัน Overbooking 100%

## วิธีตั้งค่าการเชื่อมต่อ

### ขั้นตอนที่ 1: รับ Channel Manager ID
ล็อกอินเข้าระบบของผู้ให้บริการ (เช่น Channex.io) ไปที่ Room Types และคัดลอก "Room ID" (เช่น `ext-room-123`)

### ขั้นตอนที่ 2: กรอก ID ใน BookingKub
ล็อกอินเข้า Hotel Admin Dashboard ไปที่ **Channels** จากนั้นวาง ID ลงในช่อง **"Channel Manager Room ID"** ของประเภทห้องพักที่ต้องการ แล้วบันทึก

### ⚠️ คำเตือนสำคัญ
* **อย่าตั้งราคาเป็น 0**: ระบบจะปฏิเสธการจองที่มีราคา 0 โดยอัตโนมัติเพื่อปกป้องรายได้ของคุณ
* **อย่าลบ Mapping IDs**: การลบ ID ที่ใช้งานอยู่จะตัดการเชื่อมต่อทันทีและอาจเกิด Overbooking ได้

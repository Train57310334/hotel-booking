---
id: "channel-manager"
title: "Channel Manager"
icon: "Globe"
order: 2
---

# Channel Manager Guide

Connect your rooms to OTAs like Agoda, Booking.com, and Expedia using our integrated Two-Way Channel Manager.

### 🎯 What is the Channel Manager?
* Automatically removes availability when booked via OTA.
* Returns availability if a booking is canceled.
* Prevents Overbooking 100%.

## How to Setup Mapping

### Step 1: Get your Channel Manager ID
Log into your provider (e.g., Channex.io). Navigate to Room Types and copy the "Room ID" (e.g., `ext-room-123`).

### Step 2: Enter ID in BookingKub
Log into your Hotel Admin Dashboard. Go to **Channels**. Paste the ID into the **"Channel Manager Room ID"** field for the corresponding room type and Save.

### ⚠️ Important Warnings
* **Do not set rates to 0**: The system will automatically reject bookings with a 0 rate to protect your revenue.
* **Do not delete Mapping IDs**: Deleting an active ID immediately breaks the connection and risks overbooking.

const form = document.getElementById('booking-form');
const timeTable = document.getElementById('time-table');
const confirmButton = document.getElementById('confirm-booking');
const amountDisplay = document.getElementById('amount');
const statusMessage = document.getElementById('status-message');
let selectedSlots = [];
const bookingData = {}; // บันทึกข้อมูลการจอง

// ข้อมูลคอร์ดที่ถูกจอง
const COURT_BOOKINGS = {};

// ค่าบริการต่อชั่วโมง
const RATE = 120;

// ฟังก์ชันสร้างตารางเวลา
function createTimeTable() {
    const court = document.getElementById('court').value;
    const tableHTML = `
        <thead>
            <tr>
                <th>วัน</th>
                ${[8, 9, 10, 11, 12, 13, 14, 15, 16, 17].map(hour => `
                    <th>${hour}:00 - ${hour + 1}:00</th>
                `).join('')}
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>จันทร์</td>
                ${[8, 9, 10, 11, 12, 13, 14, 15, 16, 17].map(hour => `
                    <td class="time-slot" 
                        data-court="${court}" 
                        data-time="${hour}:00" 
                        data-day="Mon">
                        ${isBooked(court, 'Mon', hour) ? 'จองแล้ว' : 'ว่าง'}
                    </td>
                `).join('')}
            </tr>
            <tr>
                <td>อังคาร</td>
                ${[8, 9, 10, 11, 12, 13, 14, 15, 16, 17].map(hour => `
                    <td class="time-slot" 
                        data-court="${court}" 
                        data-time="${hour}:00" 
                        data-day="Tue">
                        ${isBooked(court, 'Tue', hour) ? 'จองแล้ว' : 'ว่าง'}
                    </td>
                `).join('')}
            </tr>
            <tr>
                <td>พุธ</td>
                ${[8, 9, 10, 11, 12, 13, 14, 15, 16, 17].map(hour => `
                    <td class="time-slot" 
                        data-court="${court}" 
                        data-time="${hour}:00" 
                        data-day="Wed">
                        ${isBooked(court, 'Wed', hour) ? 'จองแล้ว' : 'ว่าง'}
                    </td>
                `).join('')}
            </tr>
            <tr>
                <td>พฤหัสบดี</td>
                ${[8, 9, 10, 11, 12, 13, 14, 15, 16, 17].map(hour => `
                    <td class="time-slot" 
                        data-court="${court}" 
                        data-time="${hour}:00" 
                        data-day="Thu">
                        ${isBooked(court, 'Thu', hour) ? 'จองแล้ว' : 'ว่าง'}
                    </td>
                `).join('')}
            </tr>
            <tr>
                <td>ศุกร์</td>
                ${[8, 9, 10, 11, 12, 13, 14, 15, 16, 17].map(hour => `
                    <td class="time-slot" 
                        data-court="${court}" 
                        data-time="${hour}:00" 
                        data-day="Fri">
                        ${isBooked(court, 'Fri', hour) ? 'จองแล้ว' : 'ว่าง'}
                    </td>
                `).join('')}
            </tr>
            <tr>
                <td>เสาร์</td>
                ${[8, 9, 10, 11, 12, 13, 14, 15, 16, 17].map(hour => `
                    <td class="time-slot" 
                        data-court="${court}" 
                        data-time="${hour}:00" 
                        data-day="Sat">
                        ${isBooked(court, 'Sat', hour) ? 'จองแล้ว' : 'ว่าง'}
                    </td>
                `).join('')}
            </tr>
        </tbody>
    `;
    timeTable.innerHTML = tableHTML;

    // เพิ่ม event listener
    document.querySelectorAll('.time-slot').forEach(slot => {
        slot.addEventListener('click', function () {
            if (!slot.classList.contains('booked')) {
                slot.classList.toggle('selected');
                updateAmount();
            }
        });
    });
}

// ฟังก์ชันตรวจสอบว่ามีการจองหรือยัง
function isBooked(court, day, hour) {
    const key = `${court}-${day}-${hour}:00`;
    return COURT_BOOKINGS[key] !== undefined;
}

// ฟังก์ชันคำนวณจำนวนเงินที่ต้องจ่าย
function updateAmount() {
    const selectedSlots = document.querySelectorAll('.time-slot.selected');
    const hours = selectedSlots.length;
    const totalAmount = hours * RATE;
    amountDisplay.textContent = `${totalAmount} บาท`;
}

// ฟังก์ชันยืนยันการจอง
form.addEventListener('submit', function (event) {
    event.preventDefault();

    const name = document.getElementById('name').value;
    const court = document.getElementById('court').value;
    const selectedSlots = document.querySelectorAll('.time-slot.selected');
    const totalAmount = selectedSlots.length * RATE;
    const slipFile = document.getElementById('slip').files[0];

    if (!slipFile) {
        alert('กรุณาแนบสลิปการโอนเงิน');
        return;
    }

    // บันทึกการจอง
    selectedSlots.forEach(slot => {
        const day = slot.getAttribute('data-day');
        const time = slot.getAttribute('data-time');
        const key = `${court}-${day}-${time}`;

        COURT_BOOKINGS[key] = { name, amount: totalAmount };
        slot.classList.add('booked');
        slot.setAttribute('data-booker', name);
    });

    // แสดงข้อความการจองสำเร็จ
    statusMessage.textContent = 'การจองสำเร็จ!';
    statusMessage.style.color = 'green'; // สีเขียวเพื่อแสดงความสำเร็จ

    // ปิดปุ่มยืนยันการจอง
    confirmButton.disabled = true;

    // รีเฟรชตารางเวลาเพื่ออัปเดตการแสดงผล
    createTimeTable();
});

// เรียกฟังก์ชันสร้างตารางเวลาเมื่อหน้าโหลด
createTimeTable();

// เพิ่ม event listener สำหรับการเลือกคอร์ดใหม่
document.getElementById('court').addEventListener('change', function () {
    createTimeTable(); // เมื่อเลือกคอร์ดใหม่ให้สร้างตารางใหม่
});

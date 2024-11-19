const form = document.getElementById('booking-form');
const timeTable = document.getElementById('time-table');
const confirmButton = document.getElementById('confirm-booking');
const amountDisplay = document.getElementById('amount');
const statusMessage = document.getElementById('status-message');
const slipInput = document.getElementById('slip');
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
                <th>เวลา</th>
                <th>จันทร์</th>
                <th>อังคาร</th>
                <th>พุธ</th>
                <th>พฤหัสบดี</th>
                <th>ศุกร์</th>
                <th>เสาร์</th>
            </tr>
        </thead>
        <tbody>
            ${[8, 9, 10, 11, 12, 13, 14, 15, 16, 17].map(hour => `
                <tr>
                    <td>${hour}:00 - ${hour + 1}:00</td>
                    ${['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => `
                        <td class="time-slot" 
                            data-court="${court}" 
                            data-time="${hour}:00" 
                            data-day="${day}">
                            ${isBooked(court, day, hour) ? 'จองแล้ว' : 'ว่าง'}
                        </td>
                    `).join('')}
                </tr>
            `).join('')}
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

    // ตรวจสอบสลิปการโอน
    if (slipInput.files.length === 0) {
        alert('กรุณาแนบสลิปการโอนเงิน');
        return;
    }

    // เรียกใช้ OCR เพื่อตรวจจับข้อมูลจากสลิป
    const file = slipInput.files[0];
    Tesseract.recognize(
        file,
        'eng',
        { logger: m => console.log(m) }
    ).then(({ data: { text } }) => {
        console.log('OCR text:', text);
        const extractedAmount = extractAmount(text);  // ฟังก์ชันที่ใช้แยกจำนวนเงินจากข้อความ OCR
        const extractedAccountNumber = extractAccountNumber(text);  // ฟังก์ชันที่ใช้แยกเลขบัญชีจากข้อความ OCR
        const extractedAccountName = extractAccountName(text);  // ฟังก์ชันที่ใช้แยกชื่อบัญชีจากข้อความ OCR

        // เปรียบเทียบข้อมูล OCR กับข้อมูลที่กรอกในฟอร์ม
        // เปรียบเทียบข้อมูล OCR กับข้อมูลที่กรอกในฟอร์ม
        console.log('Extracted Amount:', extractedAmount);
        console.log('Extracted Account Number:', extractedAccountNumber);
        console.log('Extracted Account Name:', extractedAccountName);
        
        const expectedAccountNumber = '048-3-75314-4';
        const expectedAccountName = 'คัมภิรดา เทพพิทักษ์';

        if (extractedAmount === totalAmount && extractedAccountNumber === expectedAccountNumber && extractedAccountName === expectedAccountName) {
            // บันทึกการจอง
            selectedSlots.forEach(slot => {
                const day = slot.getAttribute('data-day');
                const time = slot.getAttribute('data-time');
                const key = `${court}-${day}-${time}`;

                COURT_BOOKINGS[key] = { name, amount: totalAmount };
                slot.classList.add('booked');
            });

            // แสดงข้อความการจองสำเร็จ
            statusMessage.textContent = 'การจองสำเร็จ!';
            statusMessage.style.color = 'green'; // สีเขียวเพื่อแสดงความสำเร็จ

            // ปิดปุ่มยืนยันการจอง
            confirmButton.disabled = true;
        } else {
            // ถ้าไม่ตรง ให้แสดงข้อความแจ้งเตือน
            statusMessage.textContent = 'ข้อมูลไม่ตรงกับการโอนเงิน!';
            statusMessage.style.color = 'red'; // สีแดงสำหรับข้อผิดพลาด
        }
    }).catch(error => {
        console.error('Error during OCR process: ', error);
        statusMessage.textContent = 'ไม่สามารถอ่านข้อมูลจากสลิปได้';
        statusMessage.style.color = 'red'; // สีแดงสำหรับข้อผิดพลาด
    });
});

// ฟังก์ชันแยกข้อมูลจาก OCR
function extractAmount(text) {
    const amountMatch = text.match(/\d+(\.\d{1,2})?/);  // หาเลขที่เป็นจำนวนเงิน
    return amountMatch ? parseFloat(amountMatch[0]) : 0;
}

function extractAccountNumber(text) {
    const accountMatch = text.match(/\d{3}-\d{7}-\d{1,2}/);  // หาเลขบัญชีที่มีรูปแบบ 048-3-75314-4
    return accountMatch ? accountMatch[0] : '';
}

function extractAccountName(text) {
    const nameMatch = text.match(/คัมภิรดา เทพพิทักษ์/);  // หาเฉพาะชื่อบัญชีที่คาดหวัง
    return nameMatch ? nameMatch[0] : '';
}

// เรียกฟังก์ชันสร้างตารางเวลาเมื่อหน้าโหลด
createTimeTable();

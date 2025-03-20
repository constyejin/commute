const nameInput = document.getElementById('name');
const arrivalInput = document.getElementById('arrivalTime');
const departureInput = document.getElementById('departureTime');

const arrivalTimeBtn = document.getElementById('fillArrivalTime');
const departureTimeBtn = document.getElementById('fillDepartureTime');

const arrivalReportBtn = document.getElementById('arrivalBtn');
const departureReportBtn = document.getElementById('departureBtn');

const STORAGE_KEY = 'commuteData';

// ✅ 말레이시아 현재 시간 HH:MM
function getMYTimeString() {
  const now = new Date();
  const myTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kuala_Lumpur' }));
  const hour = String(myTime.getHours()).padStart(2, '0');
  const min = String(myTime.getMinutes()).padStart(2, '0');
  return `${hour}:${min}`;
}

// ✅ 말레이시아 날짜 및 시간 포맷
function formatMYDateTime(timeStr) {
  const baseTime = timeStr ? new Date(`1970-01-01T${timeStr}`) : new Date();
  const now = new Date();
  const myNow = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kuala_Lumpur' }));

  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
  const MM = String(myNow.getMonth() + 1).padStart(2, '0');
  const DD = String(myNow.getDate()).padStart(2, '0');
  const DOW = dayNames[myNow.getDay()];
  const HH = String(baseTime.getHours()).padStart(2, '0');
  const mm = String(baseTime.getMinutes()).padStart(2, '0');
  return `${MM}월 ${DD}일(${DOW}) ${HH}시 ${mm}분`;
}

// ✅ 로컬스토리지 저장
function saveToLocalStorage() {
  const data = {
    name: nameInput.value,
    arrival: arrivalInput.value,
    departure: departureInput.value,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// ✅ 로컬스토리지 불러오기
function loadFromLocalStorage() {
  const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
  if (data) {
    nameInput.value = data.name || '';
    if (data.arrival) arrivalInput.value = data.arrival;
    if (data.departure) departureInput.value = data.departure;
  }
}

// ✅ 텔레그램 메시지 전송
function sendTelegramMessage(message) {
  fetch('/.netlify/functions/sendTelegram', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  });
}

// ✅ 출근 현재시간 버튼 클릭 → 값 반영 및 저장
arrivalTimeBtn.addEventListener('click', () => {
  const now = getMYTimeString();
  arrivalInput.value = now;
  saveToLocalStorage();
});

// ✅ 퇴근 현재시간 버튼 클릭 → 값 반영, 저장, 텔레그램 전송
departureTimeBtn.addEventListener('click', () => {
  const now = getMYTimeString();
  departureInput.value = now;
  saveToLocalStorage();

  const name = nameInput.value || '이름 없음';
  const arrival = arrivalInput.value || '';
  const msg = `${name} 퇴근 보고드립니다.\n` +
              `-출근 ${formatMYDateTime(arrival)}\n` +
              `-퇴근 ${formatMYDateTime(now)}`;
  sendTelegramMessage(msg);
});

// ✅ input 수동 변경 시 로컬스토리지 자동 저장
[nameInput, arrivalInput, departureInput].forEach((input) => {
  input.addEventListener('input', saveToLocalStorage);
});

// ✅ 출근 보고 버튼
arrivalReportBtn.addEventListener('click', () => {
  const name = nameInput.value || '이름 없음';
  const arrival = arrivalInput.value || getMYTimeString();
  const prevDeparture = departureInput.value || '';

  const msg = `${name} 출근 보고드립니다.\n` +
              `-퇴근 ${formatMYDateTime(prevDeparture)}\n` +
              `-출근 ${formatMYDateTime(arrival)}`;
  sendTelegramMessage(msg);
});

// ✅ 퇴근 보고 버튼
departureReportBtn.addEventListener('click', () => {
  const name = nameInput.value || '이름 없음';
  const arrival = arrivalInput.value || '';
  const departure = departureInput.value || getMYTimeString();

  const msg = `${name} 퇴근 보고드립니다.\n` +
              `-출근 ${formatMYDateTime(arrival)}\n` +
              `-퇴근 ${formatMYDateTime(departure)}`;
  sendTelegramMessage(msg);
});

// ✅ 페이지 로드 시 로컬스토리지 불러오기
loadFromLocalStorage();

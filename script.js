const nameInput = document.getElementById('name');
const arrivalInput = document.getElementById('arrivalTime');
const departureInput = document.getElementById('departureTime');

const arrivalTimeBtn = document.getElementById('fillArrivalTime');
const departureTimeBtn = document.getElementById('fillDepartureTime');

const arrivalReportBtn = document.getElementById('arrivalBtn');
const departureReportBtn = document.getElementById('departureBtn');

const STORAGE_KEY = 'commuteData';

// 현재 시간 HH:MM
function getCurrentTimeString() {
  const now = new Date();
  return now.toTimeString().slice(0, 5);
}

// 한국식 시간 포맷
function formatKoreanDateTime(timeStr) {
  const time = timeStr ? new Date(`1970-01-01T${timeStr}`) : new Date();
  const now = new Date();
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const MM = String(now.getMonth() + 1).padStart(2, '0');
  const DD = String(now.getDate()).padStart(2, '0');
  const DOW = days[now.getDay()];
  const HH = String(time.getHours()).padStart(2, '0');
  const mm = String(time.getMinutes()).padStart(2, '0');
  return `${MM}월 ${DD}일(${DOW}) ${HH}시 ${mm}분`;
}

// 로컬스토리지 저장
function saveToLocalStorage() {
  const data = {
    name: nameInput.value,
    arrival: arrivalInput.value,
    departure: departureInput.value,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// 로컬스토리지 로드
function loadFromLocalStorage() {
  const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
  if (data) {
    nameInput.value = data.name || '';
    arrivalInput.value = data.arrival || '';
    departureInput.value = data.departure || '';
  }
}

// 텔레그램 전송
function sendTelegramMessage(message) {
  fetch('/.netlify/functions/sendTelegram', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  });
}

// ✅ 현재시간 버튼 클릭 시 input 값 + 저장
arrivalTimeBtn.addEventListener('click', () => {
  const now = getCurrentTimeString();
  arrivalInput.value = now;
  saveToLocalStorage();
});

departureTimeBtn.addEventListener('click', () => {
  const now = getCurrentTimeString();
  departureInput.value = now;
  saveToLocalStorage();
});

// ✅ input 변경 시 자동 저장
[nameInput, arrivalInput, departureInput].forEach((input) => {
  input.addEventListener('input', saveToLocalStorage);
});

// ✅ 출근 보고
arrivalReportBtn.addEventListener('click', () => {
  const name = nameInput.value || '이름 없음';
  const arrival = arrivalInput.value || getCurrentTimeString();
  const prevDeparture = departureInput.value || '';

  const msg = `${name} 출근 보고드립니다.\n` +
              `-퇴근 ${formatKoreanDateTime(prevDeparture)}\n` +
              `-출근 ${formatKoreanDateTime(arrival)}`;

  sendTelegramMessage(msg);
});

// ✅ 퇴근 보고
departureReportBtn.addEventListener('click', () => {
  const name = nameInput.value || '이름 없음';
  const arrival = arrivalInput.value || '';
  const departure = departureInput.value || getCurrentTimeString();

  const msg = `${name} 퇴근 보고드립니다.\n` +
              `-출근 ${formatKoreanDateTime(arrival)}\n` +
              `-퇴근 ${formatKoreanDateTime(departure)}`;

  sendTelegramMessage(msg);
});

// 초기화
loadFromLocalStorage();

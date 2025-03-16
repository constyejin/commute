// 요소 정의
const nameInput = document.getElementById('name');
const arrivalInput = document.getElementById('arrivalTime');
const departureInput = document.getElementById('departureTime');
const arrivalBtn = document.getElementById('arrivalBtn');
const departureBtn = document.getElementById('departureBtn');
const fillArrivalTimeBtn = document.getElementById('fillArrivalTime');
const fillDepartureTimeBtn = document.getElementById('fillDepartureTime');

const STORAGE_KEY = 'commuteData';

// ⏰ 현재 시간 포맷 (HH:MM)
function getCurrentTimeString() {
  const now = new Date();
  return now.toTimeString().slice(0, 5);
}

// 🗂 저장된 값 불러오기
function loadFromLocalStorage() {
  const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
  if (data) {
    nameInput.value = data.name || '';
    arrivalInput.value = data.arrival || '';
    departureInput.value = data.departure || '';
  }
}

// 💾 저장 함수
function saveToLocalStorage() {
  const data = {
    name: nameInput.value,
    arrival: arrivalInput.value,
    departure: departureInput.value,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// 📅 한국식 날짜시간 포맷
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

// 📤 텔레그램 전송
function sendTelegramMessage(message) {
  fetch('/.netlify/functions/sendTelegram', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  });
}

// 🚀 출근 보고
arrivalBtn.addEventListener('click', () => {
  const name = nameInput.value || '이름 없음';
  const arrival = arrivalInput.value || getCurrentTimeString();
  const previous = JSON.parse(localStorage.getItem(STORAGE_KEY));
  const prevDeparture = previous?.departure || '';

  const msg = `${name} 출근 보고드립니다.\n` +
              `-퇴근 ${formatKoreanDateTime(prevDeparture)}\n` +
              `-출근 ${formatKoreanDateTime(arrival)}`;

  arrivalInput.value = arrival; // 보낸 시간 기록
  saveToLocalStorage();
  sendTelegramMessage(msg);
});

// 🏁 퇴근 보고
departureBtn.addEventListener('click', () => {
  const name = nameInput.value || '이름 없음';
  const arrival = arrivalInput.value || getCurrentTimeString();
  const departure = departureInput.value || getCurrentTimeString();

  const msg = `${name} 퇴근 보고드립니다.\n` +
              `-출근 ${formatKoreanDateTime(arrival)}\n` +
              `-퇴근 ${formatKoreanDateTime(departure)}`;

  departureInput.value = departure; // 보낸 시간 기록
  saveToLocalStorage();
  sendTelegramMessage(msg);
});

// 🕑 현재시간 입력 버튼 기능
fillArrivalTimeBtn.addEventListener('click', () => {
  arrivalInput.value = getCurrentTimeString();
  saveToLocalStorage();
});

fillDepartureTimeBtn.addEventListener('click', () => {
  departureInput.value = getCurrentTimeString();
  saveToLocalStorage();
});

// 🔄 초기화
loadFromLocalStorage();

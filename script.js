const nameInput = document.getElementById('name');

const arrivalInput = document.getElementById('arrivalTime');
const departureInput = document.getElementById('departureTime');

const fillArrivalBtn = document.getElementById('fillArrivalTime');
const fillDepartureBtn = document.getElementById('fillDepartureTime');

const arrivalReportBtn = document.getElementById('arrivalBtn');
const departureReportBtn = document.getElementById('departureBtn');

function getTodayKey() {
  const now = new Date();
  return now.toLocaleDateString('sv-SE', { timeZone: 'Asia/Kuala_Lumpur' }); 
}

function getYesterdayKey() {
  const now = new Date();
  now.setDate(now.getDate() - 1);
  return now.toLocaleDateString('sv-SE', { timeZone: 'Asia/Kuala_Lumpur' });
}

function getMYTimeString() {
  const now = new Date();
  return now.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Kuala_Lumpur',
  });
}

function formatMYDateTime(dateStr, timeStr) {
  const date = new Date(dateStr + 'T00:00:00');
  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const day = weekdays[date.getDay()];
  return `${mm}월 ${dd}일(${day}) ${timeStr}`;
}

function sendTelegramMessage(message) {
  fetch('/.netlify/functions/sendTelegram', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  });
}

function saveToLocalStorage(dateKey, type, time) {
  const data = JSON.parse(localStorage.getItem('commuteData') || '{}');
  if (!data[dateKey]) data[dateKey] = {};
  data[dateKey][type] = time;
  data[dateKey]['name'] = nameInput.value.trim();
  localStorage.setItem('commuteData', JSON.stringify(data));
}

function loadFromLocalStorage() {
  const data = JSON.parse(localStorage.getItem('commuteData') || '{}');
  const today = getTodayKey();
  if (data[today]?.arrival) arrivalInput.value = data[today].arrival;
  if (data[today]?.departure) departureInput.value = data[today].departure;
  if (data[today]?.name) nameInput.value = data[today].name;
}

fillArrivalBtn.addEventListener('click', () => {
  const now = getMYTimeString();
  arrivalInput.value = now;
  saveToLocalStorage(getTodayKey(), 'arrival', now);
});

fillDepartureBtn.addEventListener('click', () => {
  const now = getMYTimeString();
  departureInput.value = now;
  saveToLocalStorage(getTodayKey(), 'departure', now);
});

arrivalInput.addEventListener('input', () => {
  saveToLocalStorage(getTodayKey(), 'arrival', arrivalInput.value.trim());
});
departureInput.addEventListener('input', () => {
  saveToLocalStorage(getTodayKey(), 'departure', departureInput.value.trim());
});
nameInput.addEventListener('input', () => {
  const today = getTodayKey();
  const data = JSON.parse(localStorage.getItem('commuteData') || '{}');
  if (!data[today]) data[today] = {};
  data[today].name = nameInput.value.trim();
  localStorage.setItem('commuteData', JSON.stringify(data));
});

// 출근 보고
arrivalReportBtn.addEventListener('click', () => {
  const data = JSON.parse(localStorage.getItem('commuteData') || '{}');
  const today = getTodayKey();
  const yesterday = getYesterdayKey();
  const name = nameInput.value.trim() || '이름 없음';

  const arrival = arrivalInput.value.trim() || getMYTimeString();
  arrivalInput.value = arrival;

  const lastDeparture = data[yesterday]?.departure || '미입력';

  saveToLocalStorage(today, 'arrival', arrival);

  const msg = `${name} 출근 보고드립니다.\n` +
              `-퇴근 ${formatMYDateTime(yesterday, lastDeparture)}\n` +
              `-출근 ${formatMYDateTime(today, arrival)}`;
  sendTelegramMessage(msg);
});

// 퇴근 보고
departureReportBtn.addEventListener('click', () => {
  const data = JSON.parse(localStorage.getItem('commuteData') || '{}');
  const today = getTodayKey();
  const name = nameInput.value.trim() || '이름 없음';

  const departure = departureInput.value.trim() || getMYTimeString();
  departureInput.value = departure;

  const todayArrival = arrivalInput.value.trim() || '미입력';

  saveToLocalStorage(today, 'departure', departure);

  const msg = `${name} 퇴근 보고드립니다.\n` +
              `-퇴근 ${formatMYDateTime(today, departure)}\n` +
              `-출근 ${formatMYDateTime(today, todayArrival)}`;
  sendTelegramMessage(msg);
});

loadFromLocalStorage();

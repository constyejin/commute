const nameInput = document.getElementById('name');

const arrivalInput = document.getElementById('arrivalTime');
const departureInput = document.getElementById('departureTime');

const fillArrivalBtn = document.getElementById('fillArrivalTime');
const fillDepartureBtn = document.getElementById('fillDepartureTime');

const arrivalReportBtn = document.getElementById('arrivalBtn');
const departureReportBtn = document.getElementById('departureBtn');

function getMYTimeString() {
  const now = new Date();
  return now.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Kuala_Lumpur',
  });
}

function formatMYDateTime(date, timeStr) {
  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const day = weekdays[date.getDay()];
  return `${mm}월 ${dd}일(${day}) ${timeStr}`;
}

function showToast(message = '전송 완료') {
  const toast = document.getElementById('globalToast');
  toast.textContent = message;

  requestAnimationFrame(() => {
    toast.style.opacity = 1;
  });
  setTimeout(() => {
    toast.style.opacity = 0;
    toast.addEventListener('transitionend', () => toast.remove());
  }, 2000);
}

function sendTelegramMessage(message) {
  fetch('/.netlify/functions/sendTelegram', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  })
}

function saveToLocalStorage() {
  const data = {
    name: nameInput.value.trim(),
    arrival: arrivalInput.value.trim(),
    departure: departureInput.value.trim(),
  };
  localStorage.setItem('commuteData', JSON.stringify(data));
}

function loadFromLocalStorage() {
  const data = JSON.parse(localStorage.getItem('commuteData') || '{}');
  if (data.name) nameInput.value = data.name;
  if (data.arrival) arrivalInput.value = data.arrival;
  if (data.departure) departureInput.value = data.departure;
}

function getYesterday() {
  const now = new Date();
  now.setDate(now.getDate() - 1);
  return now;
}

function getToday() {
  return new Date();
}

fillArrivalBtn.addEventListener('click', () => {
  const now = getMYTimeString();
  arrivalInput.value = now;
  saveToLocalStorage();
});

fillDepartureBtn.addEventListener('click', () => {
  const now = getMYTimeString();
  departureInput.value = now;
  saveToLocalStorage();
});

[nameInput, arrivalInput, departureInput].forEach(el => {
  el.addEventListener('input', saveToLocalStorage);
});


arrivalReportBtn.addEventListener('click', () => {
  const name = nameInput.value || '이름 없음';
  const arrival = arrivalInput.value.trim() || getMYTimeString();
  const prevData = JSON.parse(localStorage.getItem('commuteData') || '{}');
  const prevDeparture = prevData.departure || '미입력';

  const msg = `${name} 출근 보고드립니다.\n` +
              `-퇴근 ${formatMYDateTime(getYesterday(), prevDeparture)}\n` +
              `-출근 ${formatMYDateTime(getToday(), arrival)}`;

  document.getElementById('report').textContent = msg;

  arrivalInput.value = arrival;
  saveToLocalStorage();
  sendTelegramMessage(msg);
});


departureReportBtn.addEventListener('click', () => {
  const name = nameInput.value || '이름 없음';
  const departure = departureInput.value.trim() || getMYTimeString();
  const arrival = arrivalInput.value.trim() || '미입력';

  const msg = `${name} 퇴근 보고드립니다.\n` +
              `-출근 ${formatMYDateTime(getToday(), arrival)}\n` +
              `-퇴근 ${formatMYDateTime(getToday(), departure)}`;

  document.getElementById('report').textContent = msg;

  departureInput.value = departure;
  saveToLocalStorage();
  sendTelegramMessage(msg);
});


loadFromLocalStorage();

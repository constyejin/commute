// commute tracker script.js

const nameInput = document.getElementById('name');
const arrivalInput = document.getElementById('arrivalTime');
const departureInput = document.getElementById('departureTime');
const arrivalReportBtn = document.getElementById('arrivalBtn');
const departureReportBtn = document.getElementById('departureBtn');
const fillArrivalBtn = document.getElementById('fillArrivalTime');
const fillDepartureBtn = document.getElementById('fillDepartureTime');

const getMYTimeString = () => {
  const now = new Date().toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Kuala_Lumpur',
  });
  return now;
};

const formatMYDateTime = (timeStr, offset = 0) => {
  const now = new Date();
  now.setDate(now.getDate() + offset);
  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const day = weekdays[now.getDay()];
  return `${mm}월 ${dd}일(${day}) ${timeStr}`;
};

const sendTelegramMessage = (message) => {
  fetch('/.netlify/functions/sendTelegram', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  });
};

const saveToLocalStorage = () => {
  const data = {
    name: nameInput.value.trim(),
    arrival: arrivalInput.value.trim(),
    departure: departureInput.value.trim(),
  };
  localStorage.setItem('commuteData', JSON.stringify(data));
};

const loadFromLocalStorage = () => {
  const data = JSON.parse(localStorage.getItem('commuteData') || '{}');
  if (data.name) nameInput.value = data.name;
  if (data.arrival) arrivalInput.value = data.arrival;
  if (data.departure) departureInput.value = data.departure;
};

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

arrivalInput.addEventListener('input', saveToLocalStorage);
departureInput.addEventListener('input', saveToLocalStorage);
nameInput.addEventListener('input', saveToLocalStorage);

arrivalReportBtn.addEventListener('click', () => {
  const name = nameInput.value.trim() || '이름 없음';
  const current = getMYTimeString();
  const arrival = arrivalInput.value.trim() || current;
  const prevDeparture = JSON.parse(localStorage.getItem('commuteData') || '{}').departure || '미입력';
  arrivalInput.value = arrival;
  saveToLocalStorage();

  const msg = `${name} 출근 보고드립니다.\n` +
              `-퇴근 ${formatMYDateTime(prevDeparture, -1)}\n` +
              `-출근 ${formatMYDateTime(arrival)}`;
  sendTelegramMessage(msg);
});

departureReportBtn.addEventListener('click', () => {
  const name = nameInput.value.trim() || '이름 없음';
  const current = getMYTimeString();
  const departure = departureInput.value.trim() || current;
  const arrival = arrivalInput.value.trim() || '미입력';
  departureInput.value = departure;
  saveToLocalStorage();

  const msg = `${name} 퇴근 보고드립니다.\n` +
              `-출근 ${formatMYDateTime(arrival)}\n` +
              `-퇴근 ${formatMYDateTime(departure)}`;
  sendTelegramMessage(msg);
});

loadFromLocalStorage();

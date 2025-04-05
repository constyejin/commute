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

function formatMYDateTime(timeStr) {
  const now = new Date();
  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const day = weekdays[now.getDay()];
  return `${mm}월 ${dd}일(${day}) ${timeStr}`;
}

function sendTelegramMessage(message) {
  fetch('/.netlify/functions/sendTelegram', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  });
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

// 시간 채우기 버튼 (저장만, 전송 없음)
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

// input 값 변경시 로컬 저장
[nameInput, arrivalInput, departureInput].forEach(input => {
  input.addEventListener('input', saveToLocalStorage);
});

// 출근 보고
arrivalReportBtn.addEventListener('click', () => {
  const current = getMYTimeString();
  let arrival = arrivalInput.value.trim();
  if (!arrival) {
    arrival = current;
    arrivalInput.value = arrival;
  }

  const departure = departureInput.value.trim();
  saveToLocalStorage();

  const name = nameInput.value || '이름 없음';
  const msg = `${name} 출근 보고드립니다.\n` +
              `-퇴근 ${formatMYDateTime(departure)}\n` +
              `-출근 ${formatMYDateTime(arrival)}`;
  sendTelegramMessage(msg);
});

// 퇴근 보고
departureReportBtn.addEventListener('click', () => {
  const current = getMYTimeString();
  let departure = departureInput.value.trim();
  if (!departure) {
    departure = current;
    departureInput.value = departure;
  }

  const arrival = arrivalInput.value.trim();
  saveToLocalStorage();

  const name = nameInput.value || '이름 없음';
  const msg = `${name} 퇴근 보고드립니다.\n` +
              `-출근 ${formatMYDateTime(arrival)}\n` +
              `-퇴근 ${formatMYDateTime(departure)}`;
  sendTelegramMessage(msg);
});


loadFromLocalStorage();

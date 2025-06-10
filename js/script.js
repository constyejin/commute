const nameInput = document.getElementById('name');
const arrivalInput = document.getElementById('arrivalTime');
const departureInput = document.getElementById('departureTime');

const fillArrivalBtn = document.getElementById('fillArrivalTime');
const fillDepartureBtn = document.getElementById('fillDepartureTime');

const arrivalReportBtn = document.getElementById('arrivalBtn');
const departureReportBtn = document.getElementById('departureBtn');

const reportBox = document.getElementById('report');

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
  const toastMessage = document.getElementById('globalToastMessage');
  toastMessage.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2000);
}

function sendTelegramMessage(message) {
  fetch('/.netlify/functions/sendTelegram', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  });
}

const saveToLocalStorage = () => {
  const departure = departureInput.value.trim();
  const now = new Date();
  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
  const formattedDeparture = departure
    ? `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}(${weekdays[now.getDay()]}) ${departure}`
    : '';

  const data = {
    name: nameInput.value.trim(),
    arrival: arrivalInput.value.trim(),
    departure,
    fullDeparture: formattedDeparture,
    lastDepartureDate: now.toISOString(),
    lastDepartureDay: weekdays[now.getDay()],
  };
  localStorage.setItem('commuteData', JSON.stringify(data));
};

function loadFromLocalStorage() {
  const data = JSON.parse(localStorage.getItem('commuteData') || '{}');
  if (data.name) nameInput.value = data.name;
  if (data.arrival) arrivalInput.value = data.arrival;
  if (data.departure) departureInput.value = data.departure;
}

function getToday() {
  return new Date();
}

function updateReportPreview(mode = null) {
  const name = nameInput.value || '이름 없음';
  const arrival = arrivalInput.value;
  const departure = departureInput.value;
  const prevData = JSON.parse(localStorage.getItem('commuteData') || '{}');
  const prevDeparture = prevData.departure || '미입력';
  const prevDayStr = prevData.lastDepartureDay || '?';
  const lastDepartureDate = prevData.lastDepartureDate ? new Date(prevData.lastDepartureDate) : getToday();

  let msg = '';

  if (mode === 'arrival') {
    msg = `${name} 출근 보고드립니다.<br>` +
          `-퇴근 ${formatMYDateTime(lastDepartureDate, prevDeparture)}<br>` +
          `-출근 ${formatMYDateTime(getToday(), arrival)}`;
  } else if (mode === 'departure') {
    msg = `${name} 퇴근 보고드립니다.<br>` +
          `-출근 ${formatMYDateTime(getToday(), arrival || '미입력')}<br>` +
          `-퇴근 ${formatMYDateTime(getToday(), departure)}`;
  } else {
    if (arrival && !departure) {
      msg = `${name} 출근 보고드립니다.<br>` +
            `-퇴근 ${formatMYDateTime(lastDepartureDate, prevDeparture)}<br>` +
            `-출근 ${formatMYDateTime(getToday(), arrival)}`;
    } else if (arrival && departure) {
      msg = `${name} 퇴근 보고드립니다.<br>` +
            `-출근 ${formatMYDateTime(getToday(), arrival)}<br>` +
            `-퇴근 ${formatMYDateTime(getToday(), departure)}`;
    } else {
      msg = '입력된 정보가 부족합니다.';
    }
  }

  reportBox.innerHTML = msg;
}

fillArrivalBtn.addEventListener('click', () => {
  const now = getMYTimeString();
  arrivalInput.value = now;
  saveToLocalStorage();
  updateReportPreview('arrival');
});

fillDepartureBtn.addEventListener('click', () => {
  const now = getMYTimeString();
  departureInput.value = now;
  saveToLocalStorage();
  updateReportPreview('departure');
});

arrivalReportBtn.addEventListener('click', () => {
  const name = nameInput.value || '이름 없음';
  const arrival = arrivalInput.value.trim() || getMYTimeString();
  const prevData = JSON.parse(localStorage.getItem('commuteData') || '{}');
  const prevDeparture = prevData.departure || '미입력';
  const lastDepartureDate = prevData.lastDepartureDate ? new Date(prevData.lastDepartureDate) : getToday();

  const msg = `${name} 출근 보고드립니다.\n` +
              `-퇴근 ${formatMYDateTime(lastDepartureDate, prevDeparture)}\n` +
              `-출근 ${formatMYDateTime(getToday(), arrival)}`;

  arrivalInput.value = arrival;
  saveToLocalStorage();
  sendTelegramMessage(msg);
  showToast();
  updateReportPreview('arrival');
});

departureReportBtn.addEventListener('click', () => {
  const name = nameInput.value || '이름 없음';
  const departure = departureInput.value.trim() || getMYTimeString();
  const arrival = arrivalInput.value.trim() || '미입력';

  const msg = `${name} 퇴근 보고드립니다.\n` +
              `-출근 ${formatMYDateTime(getToday(), arrival)}\n` +
              `-퇴근 ${formatMYDateTime(getToday(), departure)}`;

  departureInput.value = departure;
  saveToLocalStorage();
  sendTelegramMessage(msg);
  showToast();
  updateReportPreview('departure');
});

[nameInput, arrivalInput, departureInput].forEach(el => {
  el.addEventListener('input', () => {
    saveToLocalStorage();
    updateReportPreview();
  });
});

loadFromLocalStorage();
updateReportPreview();

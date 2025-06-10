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
  const toastEl = document.getElementById('globalToast');
  const toastMessage = document.getElementById('globalToastMessage');

  if (!toastEl || !toastMessage) return;

  toastMessage.textContent = message;

  const bsToast = bootstrap.Toast.getOrCreateInstance(toastEl);
  bsToast.show();
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
  const arrival = arrivalInput.value.trim();
  const now = new Date();
  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const day = weekdays[now.getDay()];

  const data = {
    name: nameInput.value.trim(),
    arrival,
    departure,
    lastDepartureDate: `${mm}월 ${dd}일`,
    lastDepartureDay: day,
    lastDepartureTime: departure,
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
  const data = JSON.parse(localStorage.getItem('commuteData') || '{}');
  const name = nameInput.value || '이름 없음';
  const arrival = arrivalInput.value.trim();
  const departure = departureInput.value.trim();

  const lastDate = data.lastDepartureDate || '날짜';
  const lastDay = data.lastDepartureDay || '요일';
  const lastTime = data.lastDepartureTime || '시간';

  const today = getToday();
  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const todayDay = weekdays[today.getDay()];

  let msg = '';

  if (mode === 'arrival') {
    msg = `${name} 출근 보고드립니다.<br>` +
          `-퇴근 ${lastDate}(${lastDay}) ${lastTime}<br>` +
          `-출근 ${mm}월 ${dd}일(${todayDay}) ${arrival}`;
  } else if (mode === 'departure') {
    msg = `${name} 퇴근 보고드립니다.<br>` +
          `-출근 ${mm}월 ${dd}일(${todayDay}) ${arrival}<br>` +
          `-퇴근 ${mm}월 ${dd}일(${todayDay}) ${departure}`;
  } else {

    if (arrival && !departure) {
      msg = `${name} 출근 보고드립니다.<br>` +
            `-퇴근 ${lastDate}(${lastDay}) ${lastTime}<br>` +
            `-출근 ${mm}월 ${dd}일(${todayDay}) ${arrival}`;
    } else if (arrival && departure) {
      msg = `${name} 퇴근 보고드립니다.<br>` +
            `-출근 ${mm}월 ${dd}일(${todayDay}) ${arrival}<br>` +
            `-퇴근 ${mm}월 ${dd}일(${todayDay}) ${departure}`;
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
  const data = JSON.parse(localStorage.getItem('commuteData') || '{}');
  const lastDate = data.lastDepartureDate || '날짜';
  const lastDay = data.lastDepartureDay || '요일';
  const lastTime = data.lastDepartureTime || '시간';

  const today = getToday();
  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const todayDay = weekdays[today.getDay()];

  const msg = `${name} 출근 보고드립니다.\n` +
              `-퇴근 ${lastDate}(${lastDay}) ${lastTime}\n` +
              `-출근 ${mm}월 ${dd}일(${todayDay}) ${arrival}`;

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

  const today = getToday();
  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const todayDay = weekdays[today.getDay()];

  const msg = `${name} 퇴근 보고드립니다.\n` +
              `-출근 ${mm}월 ${dd}일(${todayDay}) ${arrival}\n` +
              `-퇴근 ${mm}월 ${dd}일(${todayDay}) ${departure}`;

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

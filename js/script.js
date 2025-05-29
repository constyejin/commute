const nameInput = document.getElementById('name');
const arrivalInput = document.getElementById('arrivalTime');
const departureInput = document.getElementById('departureTime');

const fillArrivalBtn = document.getElementById('fillArrivalTime');
const fillDepartureBtn = document.getElementById('fillDepartureTime');

const arrivalReportBtn = document.getElementById('arrivalBtn');
const departureReportBtn = document.getElementById('departureBtn');

const reportBox = document.getElementById('report');
const toastElement = document.getElementById('globalToast');
const toastMessage = document.getElementById('globalToastMessage');

// Utility functions
function getMYTimeString() {
  const now = new Date();
  return now.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Kuala_Lumpur',
  });
}

function getToday() {
  return new Date();
}

function getYesterday() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d;
}

function formatMYDateTime(date, timeStr) {
  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const day = weekdays[date.getDay()];
  return `${mm}월 ${dd}일(${day}) ${timeStr}`;
}

// Toast display using Bootstrap
function showToast(message = '전송 완료') {
  toastMessage.textContent = message;
  const bsToast = new bootstrap.Toast(toastElement);
  bsToast.show();
}

// Telegram send
function sendTelegramMessage(msg) {
  fetch('/.netlify/functions/sendTelegram', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: msg }),
  })
    .then(res => {
      if (res.ok) showToast('전송 완료');
      else showToast('전송 실패');
    })
    .catch(() => showToast('전송 실패'));
}

// LocalStorage handlers
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

// Preview updater
function updateReportPreview() {
  const name = nameInput.value || '이름 없음';
  const arrival = arrivalInput.value;
  const departure = departureInput.value;

  let msg;
  if (arrival && !departure) {
    const prevData = JSON.parse(localStorage.getItem('commuteData') || '{}');
    const prevDeparture = prevData.departure || '미입력';
    msg = `${name} 출근 보고드립니다.<br>` +
          `-퇴근 ${formatMYDateTime(getYesterday(), prevDeparture)}<br>` +
          `-출근 ${formatMYDateTime(getToday(), arrival)}`;
  } else if (arrival && departure) {
    msg = `${name} 퇴근 보고드립니다.<br>` +
          `-출근 ${formatMYDateTime(getToday(), arrival)}<br>` +
          `-퇴근 ${formatMYDateTime(getToday(), departure)}`;
  } else {
    msg = '입력된 정보가 부족합니다.';
  }
  reportBox.innerHTML = msg;
}

// Event listeners
fillArrivalBtn.addEventListener('click', () => {
  arrivalInput.value = getMYTimeString();
  saveToLocalStorage();
  updateReportPreview();
});

fillDepartureBtn.addEventListener('click', () => {
  departureInput.value = getMYTimeString();
  saveToLocalStorage();
  updateReportPreview();
});

[nameInput, arrivalInput, departureInput].forEach(el => {
  el.addEventListener('input', () => {
    saveToLocalStorage();
    updateReportPreview();
  });
});

arrivalReportBtn.addEventListener('click', () => {
  const name = nameInput.value || '이름 없음';
  const arrival = arrivalInput.value.trim() || getMYTimeString();
  const prevData = JSON.parse(localStorage.getItem('commuteData') || '{}');
  const prevDeparture = prevData.departure || '미입력';

  const msg = `${name} 출근 보고드립니다.\n` +
              `-퇴근 ${formatMYDateTime(getYesterday(), prevDeparture)}\n` +
              `-출근 ${formatMYDateTime(getToday(), arrival)}`;

  arrivalInput.value = arrival;
  saveToLocalStorage();
  reportBox.innerHTML = msg.replace(/\n/g, '<br>');
  sendTelegramMessage(msg);
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
  reportBox.innerHTML = msg.replace(/\n/g, '<br>');
  sendTelegramMessage(msg);
});

// Initialization
loadFromLocalStorage();
updateReportPreview();

const nameInput = document.getElementById('name');
const arrivalInput = document.getElementById('arrivalTime');
const departureInput = document.getElementById('departureTime');

const fillArrivalBtn = document.getElementById('fillArrivalTime');
const fillDepartureBtn = document.getElementById('fillDepartureTime');

const arrivalReportBtn = document.getElementById('arrivalBtn');
const departureReportBtn = document.getElementById('departureBtn');

const reportBox = document.getElementById('report');

// 현재 시간 (말레이시아) 가져오기
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

// 로컬스토리지 저장
function saveToLocalStorage() {
  const now = new Date();
  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const day = weekdays[now.getDay()];

  const data = {
    name: nameInput.value.trim(),
    arrival: arrivalInput.value.trim(),
    departure: departureInput.value.trim(),
    lastDepartureDate: `${mm}월 ${dd}일`,
    lastDepartureDay: day,
    lastDepartureTime: departureInput.value.trim(),
  };

  localStorage.setItem('commuteData', JSON.stringify(data));
}

// 로컬스토리지 불러오기
function loadFromLocalStorage() {
  const data = JSON.parse(localStorage.getItem('commuteData') || '{}');
  if (data.name) nameInput.value = data.name;
  if (data.arrival) arrivalInput.value = data.arrival;
  if (data.departure) departureInput.value = data.departure;
}

// Toast 표시
function showToast(message = '전송 완료') {
  const toastEl = document.getElementById('globalToast');
  const toastMessage = document.getElementById('globalToastMessage');

  if (!toastEl || !toastMessage) return;

  toastMessage.textContent = message;

  const toast = bootstrap.Toast.getOrCreateInstance(toastEl);
  toast.show();
}

// Telegram 메시지 전송
function sendTelegramMessage(message) {
  fetch('/.netlify/functions/sendTelegram', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  });
}

// 보고 미리보기 업데이트
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

// 시간 자동 입력 버튼
fillArrivalBtn.addEventListener('click', () => {
  arrivalInput.value = getMYTimeString();
  saveToLocalStorage();
  updateReportPreview('arrival');
});

fillDepartureBtn.addEventListener('click', () => {
  departureInput.value = getMYTimeString();
  saveToLocalStorage();
  updateReportPreview('departure');
});

// 출근 보고 버튼
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
  showToast('출근 보고 전송 완료');
  updateReportPreview('arrival');
});

// 퇴근 보고 버튼
departureReportBtn.addEventListener('click', () => {
  const name = nameInput.value || '이름 없음';
  const arrival = arrivalInput.value.trim() || '미입력';
  const departure = departureInput.value.trim() || getMYTimeString();

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
  showToast('퇴근 보고 전송 완료');
  updateReportPreview('departure');
});

// 입력 시 자동 저장 및 미리보기
[nameInput, arrivalInput, departureInput].forEach(el => {
  el.addEventListener('input', () => {
    saveToLocalStorage();
    updateReportPreview();
  });
});

// 초기 실행
loadFromLocalStorage();
updateReportPreview();

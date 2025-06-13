// 공통 요소 정의
const nameInput = document.getElementById('name');
const arrivalInput = document.getElementById('arrivalTime');
const departureInput = document.getElementById('departureTime');

const fillArrivalBtn = document.getElementById('fillArrivalTime');
const fillDepartureBtn = document.getElementById('fillDepartureTime');

const arrivalReportBtn = document.getElementById('arrivalBtn');
const departureReportBtn = document.getElementById('departureBtn');

const reportBox = document.getElementById('report');
const weekdays = ['일', '월', '화', '수', '목', '금', '토'];

// 공통 유틸
function getMYTimeString() {
  const now = new Date();
  return now.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Kuala_Lumpur',
  });
}

function getDateInfo(date = new Date()) {
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const day = weekdays[date.getDay()];
  return { mm, dd, day };
}

// 메시지, 복사, 토스트
function showToast(message = '전송 완료') {
  const toastEl = document.getElementById('globalToast');
  const toastMessage = document.getElementById('globalToastMessage');
  if (!toastEl || !toastMessage) return;
  toastMessage.textContent = message;
  const bsToast = bootstrap.Toast.getOrCreateInstance(toastEl);
  bsToast.show();
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => showToast('메시지가 복사되었습니다.'));
}

// 로컬 스토리지
function saveToLocalStorage(mode = null) {
  const data = JSON.parse(localStorage.getItem('commuteData') || '{}');
  const name = nameInput.value.trim();
  const arrival = arrivalInput.value.trim();
  const departure = departureInput.value.trim();

  if (mode === 'departure') {
    const nowInfo = getDateInfo();
    data.lastDepartureDate = `${nowInfo.mm}월 ${nowInfo.dd}일`;
    data.lastDepartureDay = nowInfo.day;
    data.lastDepartureTime = departure;
  }

  data.name = name;
  data.arrival = arrival;
  data.departure = departure;

  localStorage.setItem('commuteData', JSON.stringify(data));
}

function loadFromLocalStorage() {
  const data = JSON.parse(localStorage.getItem('commuteData') || '{}');
  if (data.name) nameInput.value = data.name;
  if (data.arrival) arrivalInput.value = data.arrival;
  if (data.departure) departureInput.value = data.departure;
}

// 메시지 생성
function generateArrivalReport() {
  const name = nameInput.value || '이름 없음';
  const arrival = arrivalInput.value.trim() || getMYTimeString();
  const data = JSON.parse(localStorage.getItem('commuteData') || '{}');
  const { lastDepartureDate = '날짜', lastDepartureDay = '요일', lastDepartureTime = '시간' } = data;

  const today = getDateInfo();
  return `${name} 출근 보고드립니다.\n` +
         `-퇴근 ${lastDepartureDate}(${lastDepartureDay}) ${lastDepartureTime}\n` +
         `-출근 ${today.mm}월 ${today.dd}일(${today.day}) ${arrival}`;
}

function generateDepartureReport() {
  const name = nameInput.value || '이름 없음';
  const arrival = arrivalInput.value.trim() || '미입력';
  const departure = departureInput.value.trim() || getMYTimeString();

  const today = getDateInfo();
  return `${name} 퇴근 보고드립니다.\n` +
         `-출근 ${today.mm}월 ${today.dd}일(${today.day}) ${arrival}\n` +
         `-퇴근 ${today.mm}월 ${today.dd}일(${today.day}) ${departure}`;
}

// 리포트 박스 업데이트
function updateReportPreview(mode = null) {
  const data = JSON.parse(localStorage.getItem('commuteData') || '{}');
  const name = nameInput.value || '이름 없음';
  const arrival = arrivalInput.value.trim();
  const departure = departureInput.value.trim();
  const { lastDepartureDate = '날짜', lastDepartureDay = '요일', lastDepartureTime = '시간' } = data;

  const today = getDateInfo();
  let msg = '';

  if (mode === 'arrival') {
    msg = `${name} 출근 보고드립니다.<br>` +
          `-퇴근 ${lastDepartureDate}(${lastDepartureDay}) ${lastDepartureTime}<br>` +
          `-출근 ${today.mm}월 ${today.dd}일(${today.day}) ${arrival}`;
  } else if (mode === 'departure') {
    msg = `${name} 퇴근 보고드립니다.<br>` +
          `-출근 ${today.mm}월 ${today.dd}일(${today.day}) ${arrival}<br>` +
          `-퇴근 ${today.mm}월 ${today.dd}일(${today.day}) ${departure}`;
  } else {
    if (arrival && !departure) {
      msg = `${name} 출근 보고드립니다.<br>` +
            `-퇴근 ${lastDepartureDate}(${lastDepartureDay}) ${lastDepartureTime}<br>` +
            `-출근 ${today.mm}월 ${today.dd}일(${today.day}) ${arrival}`;
    } else if (arrival && departure) {
      msg = `${name} 퇴근 보고드립니다.<br>` +
            `-출근 ${today.mm}월 ${today.dd}일(${today.day}) ${arrival}<br>` +
            `-퇴근 ${today.mm}월 ${today.dd}일(${today.day}) ${departure}`;
    } else {
      msg = '입력된 정보가 부족합니다.';
    }
  }

  reportBox.innerHTML = msg;
}

// 버튼 이벤트
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

arrivalReportBtn.addEventListener('click', () => {
  if (!arrivalInput.value.trim()) {
    arrivalInput.value = getMYTimeString();
  }
  saveToLocalStorage();
  const msg = generateArrivalReport();
  showToast();
  updateReportPreview('arrival');
  copyToClipboard(msg);
});

departureReportBtn.addEventListener('click', () => {
  if (!departureInput.value.trim()) {
    departureInput.value = getMYTimeString();
  }
  saveToLocalStorage('departure');
  const msg = generateDepartureReport();
  showToast();
  updateReportPreview('departure');
  copyToClipboard(msg);
});

// 입력값 변경 시 저장 및 미리보기
[nameInput, arrivalInput, departureInput].forEach(el => {
  el.addEventListener('input', () => {
    saveToLocalStorage();
    updateReportPreview();
  });
});

// 초기화
loadFromLocalStorage();
updateReportPreview();

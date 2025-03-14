function sendTelegramMessage(message) {
  fetch('/.netlify/functions/sendTelegram', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  })
    .then(res => res.json())
    .then(data => console.log('✅ Telegram sent:', data))
    .catch(error => console.error('❌ Error:', error));
}

function formatDateTime(date) {
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const dayOfWeek = days[date.getDay()];
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  return `${month}월 ${day}일(${dayOfWeek}) ${hour}시 ${minute}분`;
}

function getTimeFromInput(inputId) {
  const timeStr = document.getElementById(inputId).value;
  if (!timeStr) return null;

  const [hourStr, minuteStr] = timeStr.split(':');
  const now = new Date();
  now.setHours(Number(hourStr), Number(minuteStr), 0, 0);
  return now;
}

document.getElementById('arrivalBtn').addEventListener('click', () => {
  const name = document.getElementById('name').value || '이름없음';
  const arrivalTime = getTimeFromInput('arrivalBtn') || new Date();
  const departureTime = getTimeFromInput('departureBtn') || new Date();

  const message = `${name} 출근 보고드립니다.\n-퇴근 ${formatDateTime(departureTime)}\n-출근 ${formatDateTime(arrivalTime)}`;
  sendTelegramMessage(message);
});

document.getElementById('departureBtn').addEventListener('click', () => {
  const name = document.getElementById('name').value || '이름없음';
  const arrivalTime = getTimeFromInput('arrivalBtn') || new Date();
  const departureTime = getTimeFromInput('departureBtn') || new Date();

  const message = `${name} 퇴근 보고드립니다.\n-출근 ${formatDateTime(arrivalTime)}\n-퇴근 ${formatDateTime(departureTime)}`;
  sendTelegramMessage(message);
});

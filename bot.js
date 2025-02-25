const BOT_TOKEN = '8011930241:AAE7P8NlflY20-amZRVMptBTYvpzBXic9zQ';
const CHAT_ID = '-4808065139';

function sendTelegramMessage(message) {
  fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: CHAT_ID,
      text: message,
    }),
  });
}

// 출근 / 퇴근 버튼 클릭 시 호출
document.getElementById('arrivalBtn').addEventListener('click', () => {
  const now = new Date().toLocaleString();
  sendTelegramMessage(`✅ 출근 보고 - ${now}`);
});

document.getElementById('departureBtn').addEventListener('click', () => {
  const now = new Date().toLocaleString();
  sendTelegramMessage(`🏁 퇴근 보고 - ${now}`);
});
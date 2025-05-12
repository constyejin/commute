exports.handler = async function(event) {
  const BOT_TOKEN = '8011930241:AAE7P8NlflY20-amZRVMptBTYvpzBXic9zQ';
  const CHAT_ID = '-1002265678123';

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*', 
      },
      body: 'Method Not Allowed',
    };
  }

  const { message } = JSON.parse(event.body);

  function showToast(message = '전송 완료') {
    const toast = document.createElement('div');
    toast.id = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    requestAnimationFrame(() => {
      toast.style.opacity = 1;
    });
    setTimeout(() => {
      toast.style.opacity = 0;
      toast.addEventListener('transitionend', () => toast.remove());
    }, 2000);
  }

  const telegramRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: CHAT_ID,
      text: message,
    })
    .then(res => res.json())
    .then(data => {
      if (data.ok) {
        // 성공 처리 영역
        showToast('전송 완료!');
      } else {
        // 실패 처리
        alert('전송 실패!');
      }
    })
    .catch(err => {
      console.error(err);
      alert('Error');
    })
  });

  const resData = await telegramRes.json();

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*', 
    },
    body: JSON.stringify(resData),
  };
};



exports.handler = async function(event, context) {
  const BOT_TOKEN = '8011930241:AAE7P8NlflY20-amZRVMptBTYvpzBXic9zQ';
  const CHAT_ID = '-4808065139';

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*', // ← CORS 허용
      },
      body: 'Method Not Allowed',
    };
  }

  const { message } = JSON.parse(event.body);

  const telegramRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: CHAT_ID,
      text: message,
    }),
  });

  const resData = await telegramRes.json();

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*', // ← CORS 허용
    },
    body: JSON.stringify(resData),
  };
};

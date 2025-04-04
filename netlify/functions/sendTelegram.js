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
      'Access-Control-Allow-Origin': '*', 
    },
    body: JSON.stringify(resData),
  };
};

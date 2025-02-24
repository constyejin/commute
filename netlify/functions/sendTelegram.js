// netlify/functions/sendTelegram.js
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

exports.handler = async function(event, context) {
  const BOT_TOKEN = '여기에_봇_토큰';
  const CHAT_ID = '여기에_chat_id';

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
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
    body: JSON.stringify(resData),
  };
};

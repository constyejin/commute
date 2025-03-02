// sendTelegram.js

import fetch from 'node-fetch';

export async function handler(event, context) {
  const BOT_TOKEN = 'your_token';
  const CHAT_ID = 'your_chat_id';

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Method Not Allowed',
    };
  }

  try {
    const { message } = JSON.parse(event.body);

    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: CHAT_ID, text: message }),
    });

    const data = await res.json();

    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: `Function error: ${error.message}`,
    };
  }
}

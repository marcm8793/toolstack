/* eslint-disable require-jsdoc */
import * as functions from "firebase-functions";

export async function sendTelegramMessage(message: string) {
  const botToken = functions.params.defineSecret("TELEGRAM_BOT_TOKEN").value();
  const chatId = functions.params.defineSecret("TELEGRAM_CHAT_ID").value();

  // Add validation for secrets
  if (!botToken || !chatId) {
    console.error("Telegram secrets not configured");
    return;
  }

  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
      }),
    });

    // Add response body to error logging
    const responseBody = await response.text();
    if (!response.ok) {
      console.error(
        `Telegram API Error: ${response.status} - ${response.statusText}`,
        {
          url,
          chatId: chatId?.substring(0, 4) + "...",
          response: responseBody,
        }
      );
      return;
    }

    // Log successful send
    console.log("Telegram message sent successfully");
  } catch (error) {
    console.error("Error sending Telegram message:", error);
  }
}

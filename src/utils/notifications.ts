import type { OrderRecord, PhoneAlertConfig } from '../data/perfumes';

export interface NotificationDispatchResult {
  telegramSent: boolean;
  ntfySent: boolean;
  errors: string[];
}

export function playNotificationChime(): void {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    const playTone = (freq: number, startOffset: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + startOffset);
      gain.gain.setValueAtTime(0.001, now + startOffset);
      gain.gain.exponentialRampToValueAtTime(0.12, now + startOffset + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + startOffset + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + startOffset);
      osc.stop(now + startOffset + duration);
    };

    playTone(587.33, 0, 0.22); // D5
    playTone(880, 0.14, 0.34); // A5
  } catch {
    // Audio playback blocked by browser autoplay policy; ignore gracefully
  }
}

export function formatOrderMessage(order: OrderRecord): string {
  const itemsText = order.items
    .map(
      (item) =>
        `• ${item.name} (${item.size}) x${item.quantity} — ৳${(
          item.unitPrice * item.quantity
        ).toLocaleString('en-US')}`
    )
    .join('\n');

  const areaLabel =
    order.deliveryArea === 'inside-dhaka' ? 'Inside Dhaka' : 'Outside Dhaka';

  return [
    `New Order ${order.orderNumber} — Perfume Hub BD`,
    `Customer: ${order.customerName}`,
    `Phone: ${order.phone}`,
    `Area: ${areaLabel}`,
    `Address: ${order.address}`,
    `Payment: ${order.paymentMethod}`,
    '',
    'Items:',
    itemsText,
    '',
    `Delivery: ${order.deliveryFee === 0 ? 'Free' : `৳${order.deliveryFee}`}`,
    `Total: ৳${order.total.toLocaleString('en-US')}`,
  ].join('\n');
}

export async function dispatchPhoneNotification(
  order: OrderRecord,
  config: PhoneAlertConfig
): Promise<NotificationDispatchResult> {
  const result: NotificationDispatchResult = {
    telegramSent: false,
    ntfySent: false,
    errors: [],
  };

  const messageText = formatOrderMessage(order);
  const token = config.tgBotToken.trim();
  const chatId = config.tgChatId.trim();
  const topic = config.ntfyTopic.trim();

  if (token && chatId) {
    try {
      const tgRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: messageText,
        }),
      });
      if (tgRes.ok) {
        result.telegramSent = true;
      } else {
        result.errors.push(`Telegram HTTP ${tgRes.status}`);
      }
    } catch {
      result.errors.push('Telegram request failed (network or CORS).');
    }
  }

  if (topic) {
    try {
      const safeTopic = encodeURIComponent(topic.replace(/^\/+/, ''));
      const ntfyRes = await fetch(`https://ntfy.sh/${safeTopic}`, {
        method: 'POST',
        headers: {
          Title: `New Order ${order.orderNumber} (BDT ${order.total})`,
          Priority: 'high',
          Tags: 'shopping_bags,sparkles',
        },
        body: messageText,
      });
      if (ntfyRes.ok) {
        result.ntfySent = true;
      } else {
        result.errors.push(`ntfy.sh HTTP ${ntfyRes.status}`);
      }
    } catch {
      result.errors.push('ntfy.sh request failed.');
    }
  }

  return result;
}

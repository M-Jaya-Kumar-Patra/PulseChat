import crypto from 'node:crypto';
import { HttpError } from '../utils/httpError.js';

const MAX_MESSAGE_LENGTH = 1000;

const cleanText = (value) => String(value || '').trim();

export const createMessageService = (messageRepository) => ({
  async listMessages({ limit } = {}) {
    return messageRepository.list({ limit });
  },

  async createMessage(payload) {
    const username = cleanText(payload.username);
    const text = cleanText(payload.text);

    if (!username) {
      throw new HttpError(400, 'Username is required.');
    }

    if (!text) {
      throw new HttpError(400, 'Message cannot be empty.');
    }

    if (text.length > MAX_MESSAGE_LENGTH) {
      throw new HttpError(400, `Message cannot exceed ${MAX_MESSAGE_LENGTH} characters.`);
    }

    const now = new Date().toISOString();
    const message = {
      id: crypto.randomUUID(),
      clientId: payload.clientId || null,
      username,
      text,
      createdAt: now,
      deliveredAt: now,
      status: 'delivered',
      readBy: [username]
    };

    return messageRepository.add(message);
  },

  async markRead({ messageId, username }) {
    const cleanUsername = cleanText(username);

    if (!cleanUsername) {
      throw new HttpError(400, 'Username is required.');
    }

    const message = await messageRepository.markRead({
      messageId,
      username: cleanUsername
    });

    if (!message) {
      throw new HttpError(404, 'Message not found.');
    }

    return message;
  }
});

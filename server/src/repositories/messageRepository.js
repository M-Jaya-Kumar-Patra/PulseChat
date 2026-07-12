import fs from 'node:fs/promises';
import path from 'node:path';

export const createMessageRepository = (filePath) => {
  let writeQueue = Promise.resolve();

  const ensureStore = async () => {
    await fs.mkdir(path.dirname(filePath), { recursive: true });

    try {
      await fs.access(filePath);
    } catch {
      await fs.writeFile(filePath, '[]', 'utf8');
    }
  };

  const readAll = async () => {
    await ensureStore();
    const raw = await fs.readFile(filePath, 'utf8');

    try {
      const messages = JSON.parse(raw);
      return Array.isArray(messages) ? messages : [];
    } catch {
      return [];
    }
  };

  const writeAll = async (messages) => {
    await ensureStore();
    const tmpPath = `${filePath}.tmp`;
    await fs.writeFile(tmpPath, JSON.stringify(messages, null, 2), 'utf8');
    await fs.rename(tmpPath, filePath);
  };

  const queueWrite = (operation) => {
    writeQueue = writeQueue.then(operation, operation);
    return writeQueue;
  };

  return {
    async list({ limit = 100 } = {}) {
      const messages = await readAll();
      const normalizedLimit = Number.isFinite(limit) && limit > 0 ? limit : 100;

      return messages
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
        .slice(-normalizedLimit);
    },

    async add(message) {
      return queueWrite(async () => {
        const messages = await readAll();
        const nextMessages = [...messages, message];
        await writeAll(nextMessages);
        return message;
      });
    },

    async markRead({ messageId, username }) {
      return queueWrite(async () => {
        const messages = await readAll();
        const index = messages.findIndex((message) => message.id === messageId);

        if (index === -1) {
          return null;
        }

        const current = messages[index];
        const readBy = new Set(current.readBy || []);
        readBy.add(username);

        const updated = {
          ...current,
          readBy: Array.from(readBy),
          status: 'read'
        };

        messages[index] = updated;
        await writeAll(messages);

        return updated;
      });
    }
  };
};

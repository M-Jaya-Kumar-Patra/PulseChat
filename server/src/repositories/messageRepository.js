const withoutMongoId = ({ _id, ...message }) => message;

const normalizeLimit = (limit) => {
  const parsedLimit = Number(limit);
  return Number.isFinite(parsedLimit) && parsedLimit > 0 ? parsedLimit : 100;
};

export const createMessageRepository = (messagesCollection) => {
  return {
    async init() {
      await Promise.all([
        messagesCollection.createIndex({ createdAt: 1 }),
        messagesCollection.createIndex({ id: 1 }, { unique: true })
      ]);
    },

    async list({ limit = 100 } = {}) {
      const normalizedLimit = normalizeLimit(limit);
      const messages = await messagesCollection
        .find({}, { projection: { _id: 0 } })
        .sort({ createdAt: -1 })
        .limit(normalizedLimit)
        .toArray();

      return messages.reverse();
    },

    async add(message) {
      await messagesCollection.insertOne(message);
      return message;
    },

    async markRead({ messageId, username }) {
      const result = await messagesCollection.findOneAndUpdate(
        { id: messageId },
        {
          $addToSet: { readBy: username },
          $set: { status: 'read' }
        },
        {
          returnDocument: 'after',
          projection: { _id: 0 },
          includeResultMetadata: false
        }
      );

      const updatedMessage = result?.value === undefined ? result : result.value;

      if (!updatedMessage) {
        return null;
      }

      return withoutMongoId(updatedMessage);
    }
  };
};

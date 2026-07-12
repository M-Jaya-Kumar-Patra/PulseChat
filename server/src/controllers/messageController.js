import { asyncHandler } from '../utils/asyncHandler.js';

export const createMessageController = ({ messageService, io }) => ({
  listMessages: asyncHandler(async (req, res) => {
    const limit = Number(req.query.limit || 100);
    const messages = await messageService.listMessages({ limit });

    res.json({ messages });
  }),

  sendMessage: asyncHandler(async (req, res) => {
    const message = await messageService.createMessage(req.body);
    io.emit('message:new', message);

    res.status(201).json({ message });
  }),

  markMessageRead: asyncHandler(async (req, res) => {
    const { messageId } = req.params;
    const { username } = req.body;
    const message = await messageService.markRead({ messageId, username });

    io.emit('message:read', {
      messageId: message.id,
      readBy: message.readBy
    });

    res.json({ message });
  })
});

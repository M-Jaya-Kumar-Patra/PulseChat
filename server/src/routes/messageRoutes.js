import { Router } from 'express';
import { createMessageController } from '../controllers/messageController.js';

export const createMessageRoutes = ({ messageService, io }) => {
  const router = Router();
  const controller = createMessageController({ messageService, io });

  router.get('/', controller.listMessages);
  router.post('/', controller.sendMessage);
  router.patch('/:messageId/read', controller.markMessageRead);

  return router;
};

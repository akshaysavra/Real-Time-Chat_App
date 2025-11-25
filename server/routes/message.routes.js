import express  from 'express';
import { getAllusers,getMessages,sendMessage } from '../controllers/message.controller.js';
import { isAuthenticated } from '../middleware/auth.middelware.js';

const router = express.Router();

router.get("/users",isAuthenticated,getAllusers);
router.get("/:id",isAuthenticated,getMessages);
router.post("/send/:id",isAuthenticated,sendMessage);

export default router;


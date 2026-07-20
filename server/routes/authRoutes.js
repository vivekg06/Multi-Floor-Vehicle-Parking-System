import { Router } from 'express';
import { login, register, getMe, getUsers, deleteUser } from '../controllers/authController.js';
import { authMiddleware, requireRole } from '../middleware/middleware.js';

const router = Router();
router.post('/login', login);
router.get('/me', authMiddleware, getMe);
router.post('/register', authMiddleware, requireRole(['admin']), register);
router.get('/users', authMiddleware, requireRole(['admin']), getUsers);
router.delete('/users/:id', authMiddleware, requireRole(['admin']), deleteUser);
export default router;

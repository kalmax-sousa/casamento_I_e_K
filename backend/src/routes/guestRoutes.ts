import { Router } from 'express';
import { GuestController } from '../controllers/GuestController.js';

const router = Router();
const guestController = new GuestController();

router.get('/search', guestController.search);
router.patch('/confirm', guestController.confirm); // Nova rota

export default router;
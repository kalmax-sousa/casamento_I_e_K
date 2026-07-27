import { Router } from 'express';
import { AdminGuestController } from '../controllers/AdminGuestController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { GiftController } from '../controllers/GiftController.js';

const router = Router();
const adminGuestController = new AdminGuestController();
const giftController = new GiftController();

// Aplica o bloqueio em TODAS as rotas abaixo
router.use(authMiddleware);

router.post('/families', adminGuestController.createFamily);
router.get('/families', adminGuestController.listFamilies);
router.delete('/families/:id', adminGuestController.deleteFamily);

router.post('/families/:familyId/guests', adminGuestController.addGuest);
router.patch('/guests/:id', adminGuestController.updateGuest);
router.delete('/guests/:id', adminGuestController.deleteGuest);

router.post('/gifts', giftController.createGift);

export default router;